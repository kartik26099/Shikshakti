// src/lib/api-client.ts - API Client for backend communication

export interface ChatMessage {
    role: string;
    content: string;
  }
  
  export interface FileAttachment {
    name: string;
    type: string;
    size: string;
  }
  
  export interface DocumentMetadata {
    doc_id: string;
    document_type: string;
    file_name: string;
    segment_count: number;
    [key: string]: any;
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  /**
   * Get a response from the AI Advisor
   */
  export async function getAdvisorResponse(message: string, history: ChatMessage[], sessionId?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
          session_id: sessionId
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error calling advisor API:', error);
      throw error;
    }
  }
  
  /**
   * Upload a file to the backend
   */
  export async function uploadFile(file: File, sessionId?: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (sessionId) {
        formData.append('session_id', sessionId);
      }
  
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Get specific document segments
   */
  export async function getDocumentSegments(docId: string, segmentIndices: number[] = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/document/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc_id: docId,
          segment_indices: segmentIndices,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error getting document segments:', error);
      throw error;
    }
  }
  
  /**
   * Get document metadata
   */
  export async function getDocumentMetadata(docId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/document/metadata?doc_id=${docId}`);
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      return await response.json() as DocumentMetadata;
    } catch (error) {
      console.error('Error getting document metadata:', error);
      throw error;
    }
  }