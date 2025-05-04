import { NextResponse } from "next/server"

// This is a mock API route to simulate connecting to the talent API backend
export async function GET() {
  try {
    // Simulate a successful connection to the backend
    return NextResponse.json({
      status: "success",
      message: "Connected to talent API",
      endpoints: ["/api/summarize-jd", "/api/parse-resume", "/api/match-resume", "/api/shortlist-candidates"],
    })
  } catch (error) {
    console.error("Error connecting to talent API:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to talent API",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { endpoint, data } = body

    // Simulate different API endpoints
    switch (endpoint) {
      case "summarize-jd":
        return NextResponse.json({
          status: "success",
          jd_id: "jd_" + Date.now(),
          summary: {
            skills: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
            experience: "3+ years",
            education: "Bachelor's degree in Computer Science or related field",
            certifications: ["AWS Certified Developer", "MongoDB Certified Developer"],
            projects: ["E-commerce platform", "CRM system"],
          },
        })

      case "parse-resume":
        return NextResponse.json({
          status: "success",
          data: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 123-456-7890",
            skills: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
            experience: [
              {
                title: "Senior Frontend Developer",
                company: "Tech Company",
                duration: "2020-2023",
                description: "Developed and maintained React applications",
              },
            ],
            education: [
              {
                degree: "Bachelor of Science in Computer Science",
                institution: "University of Technology",
                year: "2019",
              },
            ],
          },
        })

      case "match-resume":
        return NextResponse.json({
          status: "success",
          match_result: {
            overall_score: 85,
            skills_score: 90,
            experience_score: 80,
            education_score: 85,
            probability: 75,
            recommendations: [
              "Consider adding more experience with AWS",
              "Highlight your MongoDB certification more prominently",
            ],
          },
        })

      case "shortlist-candidates":
        return NextResponse.json({
          status: "success",
          message: "Candidates evaluated successfully",
          leaderboard: [
            {
              name: "John Doe",
              score: 85,
              match_details: {
                skills: 90,
                experience: 80,
                education: 85,
              },
            },
          ],
        })

      default:
        return NextResponse.json(
          {
            status: "error",
            message: "Invalid endpoint",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to process request",
      },
      { status: 500 },
    )
  }
}
