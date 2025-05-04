import { NextResponse } from "next/server"

// Types for learning path data
interface LearningPath {
  id: string
  title: string
  description: string
  targetAudience: string[]
  prerequisites: string[]
  estimatedTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  stages: LearningStage[]
  careerOutcomes: string[]
  tags: string[]
}

interface LearningStage {
  id: string
  title: string
  description: string
  topics: LearningTopic[]
  duration: string
}

interface LearningTopic {
  id: string
  title: string
  description: string
  resources: LearningResource[]
  skills: string[]
  isOptional?: boolean
}

interface LearningResource {
  type: "Article" | "Video" | "Course" | "Book" | "Tutorial" | "Project" | "Tool"
  title: string
  description?: string
  link?: string
  estimatedTime?: string
}

// Sample learning paths data
const learningPathsData: LearningPath[] = [
  {
    id: "path-1",
    title: "Machine Learning Fundamentals",
    description:
      "A comprehensive learning path to build a strong foundation in machine learning concepts, algorithms, and practical applications.",
    targetAudience: [
      "Beginners in AI/ML",
      "Software developers looking to transition to ML",
      "Data analysts wanting to expand their skills",
    ],
    prerequisites: [
      "Basic Python programming",
      "Fundamental mathematics (algebra, calculus basics)",
      "Basic statistics",
    ],
    estimatedTime: "3-6 months (10-15 hours/week)",
    difficulty: "Beginner",
    stages: [
      {
        id: "stage-1",
        title: "Mathematics and Statistics Foundations",
        description: "Build the essential mathematical foundation required for machine learning",
        duration: "2-3 weeks",
        topics: [
          {
            id: "topic-1-1",
            title: "Linear Algebra Essentials",
            description: "Learn the fundamental concepts of linear algebra that are crucial for machine learning",
            skills: ["Vectors", "Matrices", "Eigenvalues and eigenvectors", "Matrix operations"],
            resources: [
              {
                type: "Video",
                title: "Linear Algebra for Machine Learning",
                link: "https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky0",
                estimatedTime: "6 hours",
              },
              {
                type: "Article",
                title: "Essence of Linear Algebra",
                link: "https://www.3blue1brown.com/topics/linear-algebra",
                estimatedTime: "3 hours",
              },
            ],
          },
          // Additional topics would be included here
        ],
      },
      // Additional stages would be included here
    ],
    careerOutcomes: [
      "Junior Machine Learning Engineer",
      "Data Scientist",
      "ML Research Assistant",
      "Data Analyst with ML skills",
    ],
    tags: ["machine learning", "data science", "python", "algorithms", "statistics"],
  },
  // Additional learning paths would be included here
]

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    // Process the query and generate a response
    const response = processQuery(query)

    // Return the response
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in course-bot API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processQuery(query: string): {
  content: string
  learningPaths?: LearningPath[]
} {
  const lowerCaseQuery = query.toLowerCase()

  // Check if the query is asking for learning path recommendations
  if (
    lowerCaseQuery.includes("recommend") ||
    lowerCaseQuery.includes("suggest") ||
    lowerCaseQuery.includes("what path") ||
    lowerCaseQuery.includes("which path") ||
    lowerCaseQuery.includes("learning path") ||
    lowerCaseQuery.includes("how to learn") ||
    lowerCaseQuery.includes("how should i learn")
  ) {
    // Filter learning paths based on user's interests mentioned in the query
    let filteredPaths = [...learningPathsData]

    // Filter by difficulty if mentioned
    if (lowerCaseQuery.includes("beginner") || lowerCaseQuery.includes("basic") || lowerCaseQuery.includes("start")) {
      filteredPaths = filteredPaths.filter((path) => path.difficulty === "Beginner")
    } else if (lowerCaseQuery.includes("intermediate")) {
      filteredPaths = filteredPaths.filter((path) => path.difficulty === "Intermediate")
    } else if (lowerCaseQuery.includes("advanced") || lowerCaseQuery.includes("expert")) {
      filteredPaths = filteredPaths.filter((path) => path.difficulty === "Advanced")
    }

    // Filter by topic if mentioned
    const topics = [
      { keywords: ["deep learning", "neural network"], tag: "deep learning" },
      { keywords: ["machine learning", "ml"], tag: "machine learning" },
      { keywords: ["business", "product", "management"], tag: "business" },
      { keywords: ["ethics", "governance", "responsible"], tag: "ethics" },
    ]

    for (const topic of topics) {
      if (topic.keywords\
