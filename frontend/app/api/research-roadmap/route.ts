import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData()
    const researchTopic = formData.get("research_topic") as string
    const userGoal = formData.get("user_goal") as string
    const userCurrentState = formData.get("user_current_state") as string
    
    // Validate required fields
    if (!researchTopic || !userGoal || !userCurrentState) {
      return NextResponse.json(
        { error: "Missing required parameters: research_topic, user_goal, or user_current_state" },
        { status: 400 }
      )
    }
    
    // Create JSON data to forward to the backend
    const requestData = {
      research_topic: researchTopic,
      user_goal: userGoal,
      user_current_state: userCurrentState
    }
    
    // Forward the request to the backend API
    const backendUrl = process.env.RESEARCH_BACKEND_URL || "http://localhost:5000/api/generate-roadmap"
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(`Backend API error (${response.status}): ${errorData.message || JSON.stringify(errorData)}`)
    }
    
    // Get the response from the backend
    const data = await response.json()
    
    // Return the response to the client
    return NextResponse.json(data.data || data)
  } catch (error) {
    console.error("Error in research roadmap API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
}