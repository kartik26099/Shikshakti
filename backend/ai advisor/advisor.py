from groq_client import groq_client
from config import MODEL_NAME
from schemas import ChatMessage
from typing import List, Optional, Dict
from document_cache import document_cache
from document_handler import get_document_segments_for_context
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def career_advisor_response(
    message: str, 
    history: Optional[List[ChatMessage]] = None,
    doc_id: Optional[str] = None
) -> str:
    """
    Generate a career advisor response based on user message, conversation history,
    and document context if available.
    
    Args:
        message: The current user message
        history: Optional list of previous chat messages
        doc_id: Optional document ID to retrieve context from cache
        
    Returns:
        String containing the AI response
    """
    try:
        # Get document context if available
        document_context = ""
        document_metadata = None
        
        if doc_id:
            document_metadata = document_cache.get_document_metadata(doc_id)
            if document_metadata:
                # Get document summary or relevant segments for context
                document_context = get_document_segments_for_context(doc_id)
                logger.info(f"Retrieved document context for doc_id: {doc_id}, length: {len(document_context)}")
        
        # System message with enhanced instructions based on document presence
        system_content = "You are a helpful, friendly, and expert career advisor. Ask questions, give personalized advice, and guide the user to reflect on their interests and strengths."
        
        # Add document awareness to system message if document exists
        if document_metadata:
            doc_type = document_metadata.get("document_type", "document")
            file_name = document_metadata.get("file_name", "uploaded document")
            system_content += f" The user has uploaded a {doc_type} file named '{file_name}' which you can reference in your responses."
        
        system_message = {
            "role": "system", 
            "content": system_content
        }
        
        conversation = [system_message]
        
        # Add conversation history if it exists
        if history:
            # Convert ChatMessage objects to dict format expected by API
            for msg in history:
                # Skip system messages that contain document references
                if msg.role == "system" and msg.content.startswith("DOCUMENT_REFERENCE:"):
                    continue
                    
                # Ensure role is one of the valid values: 'system', 'user', or 'assistant'
                role = msg.role
                if role not in ['system', 'user', 'assistant']:
                    # Default to 'user' if from user, otherwise 'assistant'
                    role = 'user' if 'user' in role.lower() else 'assistant'
                
                conversation.append({"role": role, "content": msg.content})
        
        # Enhance user message with document context if available
        enhanced_message = message
        if document_context:
            enhanced_message = f"{message}\n\nContext from the uploaded {document_metadata.get('document_type', 'document')}:\n{document_context}"
        
        # Add the enhanced user message
        conversation.append({"role": "user", "content": enhanced_message})
        
        logger.info(f"Sending request to Groq with {len(conversation)} messages")
        
        # Add repetition penalties to the model parameters
        completion =groq_client.chat.completions.create(
            messages=conversation,
            model=MODEL_NAME,
            temperature=0.7,
            frequency_penalty=0.7,
            presence_penalty=0.6,
            max_tokens=500
        )
        
        response = completion.choices[0].message.content.strip()
        logger.info(f"Received response from Groq: {response[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error in career_advisor_response: {str(e)}")
        
        # Check if it's an API error related to message format
        error_msg = str(e)
        if "discriminator property 'role'" in error_msg:
            # If we have role validation issues, try again with just the current message
            try:
                logger.info("Retrying with simplified message structure")
                
                # Just use system message and current user message
                system_content = "You are a helpful, friendly, and expert career advisor."
                if document_metadata:
                    doc_type = document_metadata.get("document_type", "document")
                    system_content += f" The user has uploaded a {doc_type} which you can reference in your responses."
                
                simple_conversation = [
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": enhanced_message if document_context else message}
                ]
                
                completion = await groq_client.chat.completions.create(
                    messages=simple_conversation,
                    model=MODEL_NAME,
                    temperature=0.7,
                    frequency_penalty=0.7,
                    presence_penalty=0.6,
                    max_tokens=500
                )
                
                return completion.choices[0].message.content.strip()
                
            except Exception as retry_error:
                logger.error(f"Retry also failed: {str(retry_error)}")
                
        return "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists."