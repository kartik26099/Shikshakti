from flask import Flask, request, jsonify
import requests
from google import genai
import time
import logging
import re
import os
from flask_cors import CORS  # Added for cross-origin requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def extract_keywords_from_response(response_text):
    """
    Extract keywords from the Gemini response text that are in the format 
    keyword=[stage1_word,stage2_word...] and store them in an array.
    """
    keyword_pattern = r'key\s*words?\s*=\s*\[(.*?)\]'
    match = re.search(keyword_pattern, response_text, re.IGNORECASE)
    
    if match:
        keywords_str = match.group(1)
        keywords = [k.strip().strip("'\"") for k in keywords_str.split(',')]
        return keywords
    
    return []

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
                        "title": result.get("title", ""),
                        "title_link": result.get("title_link", ""),
                        "resources": result.get("resources", []),
                    }
                    all_results.append(extracted_info)
            else:
                logging.error(f"Request failed for query '{query}' with status code: {response.status_code}")
            
            # Add a small delay to avoid hitting rate limits
            time.sleep(1)
                
        except Exception as e:
            logging.error(f"Error processing query '{query}': {str(e)}")
    
    return all_results

def convert_scholar_data_to_reference_string(scholar_data, keywords_array):
    """
    Converts the extracted scholar data into a single formatted reference string
    for use with the Gemini API.
    """
    reference_text = "SCHOLARLY REFERENCE MATERIAL:\n\n"
    
    for i, item in enumerate(scholar_data):
        keyword = keywords_array[i] if i < len(keywords_array) else f"Stage {i+1}"
        
        reference_text += f"REFERENCE {i+1}: {keyword}\n"
        
        if 'title' in item and item['title']:
            reference_text += f"Title: {item['title']}\n"
            
        if 'title_link' in item and item['title_link']:
            reference_text += f"Source Link: {item['title_link']}\n"
        
        if 'resources' in item and item['resources']:
            reference_text += "Available Resources:\n"
            for resource in item['resources']:
                resource_type = resource.get('type', 'Link')
                resource_title = resource.get('title', 'Resource')
                resource_link = resource.get('link', '')
                reference_text += f"  - {resource_type} from {resource_title}: {resource_link}\n"
        
        reference_text += f"\nSummary: This scholarly work is related to '{keyword}' and provides valuable information for this stage of research.\n"
        
        reference_text += "\n" + "-"*50 + "\n\n"
    
    return reference_text

def generate_research_roadmap(research_topic, user_goal, user_current_state):
    """
    Generate a research roadmap using Gemini API.
    """
    try:
        client = genai.Client(api_key=os.getenv("gemini_api_key_road_map"))
        chat = client.chats.create(model="gemini-2.0-flash")
        
        initial_prompt = f"""You are an expert research guide tasked with designing a comprehensive research roadmap for the topic '{research_topic}'. 
USER INFORMATION: 
Goal: {user_goal}
Current knowledge/state: {user_current_state}

INSTRUCTIONS: Create a well-structured research roadmap with 6-8 stages. Each stage should have 3-5 specific tasks or knowledge areas. 
The response must include the research topic, the user's goal, the user's current knowledge/state, and a structured research roadmap with clearly defined stages and tasks. 
Each stage should include a stage title and a concise description of what it covers, and 3-5 specific tasks, each with a task title that is clear and specific (suitable for searching academic resources) and detailed guidance written in markdown format, with a minimum of 300 words per task. 
Include background information, methodologies, practical advice, and references to relevant tools or academic papers. 

GUIDELINES: Format each stage with "**Stage X: Title**" and ensure it has a "*Description:*" section. Format each task as "**Task X.Y: Title**" with "*Task Title:*", "*Guidance:*", "*Background:*", and "*Methodology:*" sections.
Ensure logical progression from foundational knowledge to research execution and publishing, incorporate references to tools, datasets, academic methods, and papers, keep task depth consistent across the roadmap."""
        
        # First response - generate roadmap
        initial_response = chat.send_message(initial_prompt)
        roadmap_content = initial_response.text
        
        # Request keywords for each stage
        keyword_prompt = "Extract the main key factor from each stage which will be searching on scholarly api to get the link of pdf and referral articles. Make it in form keyword=[stage1_word,stage2_word..] strictly follow this format. Each keyword should be specific and focused on the main research concept of each stage."
        keyword_response = chat.send_message(keyword_prompt)
        
        # Extract keywords
        keywords_array = extract_keywords_from_response(keyword_response.text)
        
        if not keywords_array:
            # Fallback: generate default keywords based on stage titles
            stage_titles = re.findall(r'\*\*Stage \d+: (.*?)\*\*', roadmap_content)
            if stage_titles:
                keywords_array = [title.split()[0].lower() for title in stage_titles]
            else:
                keywords_array = ["ai_research", "methodology", "implementation", "evaluation", "future_work"]
        
        # Get scholarly references
        scholar_data = extract_scholar_data(keywords_array)
        references = convert_scholar_data_to_reference_string(scholar_data, keywords_array)
        
        # Generate final response with references
        final_prompt = f"""Generate the final output of the research roadmap for topic '{research_topic}' using the following references and initial roadmap. 
Make sure to properly format the roadmap with the following structure:
1. Start with "**Research Topic:**" followed by the topic
2. Then "**User Goal:**" followed by the goal
3. Then "**User Current Knowledge/State:**" followed by the current state
4. Then for each stage:
   - Format as "**Stage X: Title**"
   - Include a "*Description:*" section
   - For each task:
     - Format as "**Task X.Y: Title**"
     - Include "*Task Title:*", "*Guidance:*", "*Background:*", and "*Methodology:*" sections

Here are the references to incorporate:

{references}

Here's the initial roadmap to enhance:

{roadmap_content}"""
        
        final_response = chat.send_message(final_prompt)
        
        return {
            "status": "success",
            "data": {
                "roadmap": final_response.text,
                "keywords": keywords_array,
                "references": references,
                "topic": research_topic,
                "goal": user_goal,
                "current_state": user_current_state
            }
        }
    
    except Exception as e:
        logging.error(f"Error generating research roadmap: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to generate research roadmap: {str(e)}"
        }

# API endpoints
@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "API is running"
    })

@app.route('/api/generate-roadmap', methods=['POST'])
def generate_roadmap_endpoint():
    """Generate research roadmap endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data provided"
            }), 400
        
        research_topic = data.get('research_topic')
        user_goal = data.get('user_goal')
        user_current_state = data.get('user_current_state')
        
        if not research_topic or not user_goal or not user_current_state:
            return jsonify({
                "status": "error",
                "message": "Missing required parameters: research_topic, user_goal, and user_current_state are required"
            }), 400
        
        result = generate_research_roadmap(research_topic, user_goal, user_current_state)
        
        # If result is already an error response with status code
        if isinstance(result, tuple) and len(result) == 2:
            return jsonify(result[0]), result[1]
        
        return jsonify(result)
    
    except Exception as e:
        logging.error(f"Error in generate endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/extract-keywords', methods=['POST'])
def extract_keywords_endpoint():
    """Extract keywords from text endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data provided"
            }), 400
        
        text = data.get('text')
        
        if not text:
            return jsonify({
                "status": "error",
                "message": "Missing required parameter: text"
            }), 400
        
        keywords = extract_keywords_from_response(text)
        
        return jsonify({
            "status": "success",
            "data": {
                "keywords": keywords
            }
        })
    
    except Exception as e:
        logging.error(f"Error in extract-keywords endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/scholar-data', methods=['POST'])
def scholar_data_endpoint():
    """Get scholar data for keywords endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No JSON data provided"
            }), 400
        
        keywords = data.get('keywords')
        
        if not keywords or not isinstance(keywords, list):
            return jsonify({
                "status": "error",
                "message": "Missing or invalid required parameter: keywords (must be a list)"
            }), 400
        
        # Optional parameters
        api_key = data.get('api_key', "680890bba81651a362b311dd")
        language = data.get('language', "en")
        results_per_query = data.get('results_per_query', 1)
        
        scholar_data = extract_scholar_data(keywords, api_key, language, results_per_query)
        references = convert_scholar_data_to_reference_string(scholar_data, keywords)
        
        return jsonify({
            "status": "success",
            "data": {
                "scholar_data": scholar_data,
                "references": references
            }
        })
    
    except Exception as e:
        logging.error(f"Error in scholar-data endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))