import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the query parameter from the URL
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Get the backend URL from environment variables
    const backendUrl = process.env.LIBRARY_SEARCH_URL || "http://localhost:4001/search"

    // Forward the request to the Flask backend
    const response = await fetch(`${backendUrl}?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Use cache: 'no-store' to always fetch fresh data
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend error (${response.status}): ${errorText}`)
      return NextResponse.json({ error: `Backend error: ${response.statusText}` }, { status: response.status })
    }

    // Get the response from the backend
    const data = await response.json()

    // Return the search results to the client
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in library-search API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
