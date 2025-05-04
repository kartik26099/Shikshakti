import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }
    
    // Get the backend URL from environment variables
    const backendUrl =  "http://localhost:4000/api/chat"
    
    // Forward the request to the Flask backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}): ${errorText}`)
      return NextResponse.json({ error: `Backend error: ${response.statusText}` }, { status: response.status })
    }
    
    // Get the response from the backend
    const data = await response.json()
    
    // Return the response to the client
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in research-chat API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}