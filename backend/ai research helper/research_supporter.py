from flask import Flask, request, jsonify
import requests
from google import genai
import time
import logging
import os
import re

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# List of common greetings and conversation starters
GREETINGS = [
    "hi", "hello", "hey", "greetings", "howdy", "hi there", "hello there",
    "good morning", "good afternoon", "good evening", "how are you", 
    "what's up", "how's it going", "how are you doing"
]

# Simple questions that don't require research
SIMPLE_QUERIES = [
    "who are you", "what can you do", "help me", "what is your name",
    "how do you work", "tell me about yourself", "what are your capabilities",
    "thanks", "thank you", "goodbye", "bye", "see you"
]

def is_research_query(query):
    """
    Determines if a query requires scholarly research or is just a simple greeting/question.
    
    Args:
        query (str): The user's query
        
    Returns:
        bool: True if the query requires research, False otherwise
    """
    query_lower = query.lower().strip()
    
    # Check if it's a greeting or simple question
    if any(query_lower == greeting or query_lower.startswith(greeting + " ") for greeting in GREETINGS):
        return False
        
    if any(query_lower == simple or query_lower.startswith(simple + " ") for simple in SIMPLE_QUERIES):
        return False
    
    # Check for question patterns related to research
    research_indicators = [
        "research", "study", "paper", "publication", "journal", "article",
        "findings", "discover", "scholar", "academic", "science", "scientific",
        "technology", "innovation", "development", "breakthrough", "latest",
        "recent", "trending", "explain", "analysis", "compare", "difference",
        "what is", "how does", "why is", "tell me about", "information on"
    ]
    
    if any(indicator in query_lower for indicator in research_indicators):
        return True
    
    # Default to handling as a research query if it's a longer question
    # that doesn't match our simple patterns
    return len(query_lower.split()) > 3

def handle_simple_query(query):
    """
    Generates a response for simple queries without using the scholarly API.
    
    Args:
        query (str): The user's query
        
    Returns:
        str: A response to the simple query
    """
    query_lower = query.lower().strip()
    
    # Handle greetings
    if any(query_lower == greeting or query_lower.startswith(greeting) for greeting in GREETINGS):
        return "Hello! I'm your research assistant. How can I help you with your research today?"
    
    # Handle capability questions
    if "who are you" in query_lower or "what can you do" in query_lower or "how do you work" in query_lower:
        return "I'm a research assistant chatbot that can help you find scholarly information on various topics. Just ask me a research question, and I'll search academic sources to provide you with relevant information and references."
    
    # Handle thanks
    if "thank" in query_lower:
        return "You're welcome! Let me know if you need any other research assistance."
    
    # Handle goodbyes
    if "bye" in query_lower or "goodbye" in query_lower:
        return "Goodbye! Feel free to return whenever you need research assistance."
    
    # Default response for other simple queries
    return "I'm designed to help with research questions. Could you please ask me about a specific research topic you're interested in?"

def extract_the_key_words(query):
    client = genai.Client(api_key=os.getenv("gemini_api_key_research"))
    prompt = f"""
        From this research query: "{query}"
        
        Find the best possible answer for this question but remember to give only top 5 output with only word no discription
        keep the format output [ans1,ans2,ans3..] strictly  
    """
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt]
    )
    
    response_text = response.text.strip()
    
    # Extract the individual answers from the response string
    # Remove brackets and any whitespace
    if response_text.startswith('[') and response_text.endswith(']'):
        response_text = response_text[1:-1]
    
    # Split by comma and strip whitespace from each item
    answers = [item.strip().strip('"\'') for item in response_text.split(',')]
    
    # Ensure we have at most 5 items
    answers = answers[:5]
    
    return answers

def extract_scholar_data(query_array, api_key=os.getenv("Scholarly_api"), language="en", results_per_query=1):
    """
    Function to extract specific information from Google Scholar API for multiple queries.
    """
    url = "https://api.scrapingdog.com/google_scholar"
    all_results = []
    
    for query in query_array:
        # Parameters for the API request
        params = {
            "api_key": api_key,
            "query": query,
            "language": language,
            "page": 0,
            "results": results_per_query
        }
        
        try:
            # Make the API request
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                # Process each scholar result
                for result in data.get("scholar_results", []):
                    extracted_info = {
                        "query": query,
                        "title": result.get("title", ""),
                        "title_link": result.get("title_link", ""),
                        "displayed_link": result.get("displayed_link", ""),
                        "resources": result.get("resources", []),
                        "author_publication_info": result.get("displayed_link", "")  # Author info is typically in displayed_link
                    }
                    all_results.append(extracted_info)
            else:
                logging.error(f"Request failed for query '{query}' with status code: {response.status_code}")
            
            # Add a small delay to avoid hitting rate limits
            time.sleep(1)
                
        except Exception as e:
            logging.error(f"Error processing query '{query}': {str(e)}")
    
    return all_results

def convert_scholar_data_to_reference_string(scholar_data):
    """
    Converts the extracted scholar data into a single formatted string 
    for Gemini model reference.
    """
    reference_text = "SCHOLARLY REFERENCE MATERIAL:\n\n"
    
    for i, item in enumerate(scholar_data):
        reference_text += f"REFERENCE {i+1}: {item['query']}\n"
        reference_text += f"Title: {item['title']}\n"
        reference_text += f"Authors/Publication: {item['author_publication_info']}\n"
        reference_text += f"Source Link: {item['title_link']}\n"
        
        # Add resources information if available
        if item['resources']:
            reference_text += "Available Resources:\n"
            for resource in item['resources']:
                resource_type = resource.get('type', 'Link')
                resource_title = resource.get('title', 'Resource')
                resource_link = resource.get('link', '')
                reference_text += f"  - {resource_type} from {resource_title}: {resource_link}\n"
        
        reference_text += "\nSummary: This scholarly work discusses topics related to " + \
                          f"'{item['query']}' and was published by {item['author_publication_info']}.\n"
        
        reference_text += "\n" + "-"*50 + "\n\n"
    
    return reference_text

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_query = data.get('query', '')
        
        if not user_query:
            return jsonify({"error": "No query provided"}), 400
        
        
        # Check if this is a research query or simple conversation
        if not is_research_query(user_query):
            # Handle simple conversation without using APIs
            response_text = handle_simple_query(user_query)
            return jsonify({
                "response": response_text,
                "references": [],
                "is_simple_response": True
            })
        
        # If we get here, it's a research query that needs API processing
        logging.info(f"Processing research query: {user_query}")
        
        # Extract keywords from the query
        logging.info("Extracting keywords...")
        key_words = extract_the_key_words(user_query)
        logging.info(f"Extracted keywords: {key_words}")
        
        # Get scholar data for each keyword
        logging.info("Fetching scholar data...")
        answer_to_gemini = extract_scholar_data(key_words)
        
        # If no results, return a helpful message
        if not answer_to_gemini:
            return jsonify({
                "response": "I couldn't find specific scholarly information about that topic. Could you try rephrasing your question or asking about a different research topic?",
                "references": [],
                "is_simple_response": True
            })
        
        # Convert scholar data to formatted string
        gemini_context = convert_scholar_data_to_reference_string(answer_to_gemini)
        logging.info("Scholar data processed and formatted")
        
        # Prepare and send prompt to Gemini
        client = genai.Client(api_key="AIzaSyBLM_adRCVNJmqh-ZSoqpyya2D4J8ve07U")
        chat = client.chats.create(model="gemini-2.0-flash")
        
        prompt = f"""Based on the following:

{gemini_context}
answer the {user_query}

please analyse the context properly give the links from the context the writer name and author and all also explain each topic 
"""
        
        logging.info("Sending query to Gemini...")
        response = chat.send_message(prompt)
        
        return jsonify({
            "response": response.text,
            "references": answer_to_gemini,
            "is_simple_response": False
        })
        
    except Exception as e:
        logging.error(f"Error in processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)