"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Types
export interface Course {
  id: string
  title: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  topics: string[]
  skills: string[]
  image?: string
  isGenerated?: boolean
  goal?: string
  modules?: CourseModule[]
}

export interface CourseModule {
  title: string
  description: string
  subsections: string[]
  recommended_videos: {
    title: string
    channel: string
    duration: string
    link: string
  }[]
}

export interface CourseFormData {
  title: string
  level: string
  goal: string
  currentState: string
}

interface CourseGenContextType {
  courses: Course[]
  filters: {
    level: string
    duration: string
    topic: string
  }
  setFilters: (filters: { level: string; duration: string; topic: string }) => void
  addGeneratedCourse: (course: Course) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  formData: CourseFormData
  setFormData: (data: CourseFormData) => void
  completedModules: Record<string, Set<number>>
  toggleModuleCompletion: (courseId: string, moduleIndex: number) => void
  getModuleCompletionPercentage: (courseId: string) => number
}

const CourseGenContext = createContext<CourseGenContextType | undefined>(undefined)

// Helper to safely parse JSON from localStorage
const safelyParseJSON = (json: string | null) => {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error("Failed to parse JSON from localStorage:", e)
    return null
  }
}

// Helper to convert stored module completion data back to Sets
const convertCompletedModulesFromStorage = (data: Record<string, number[]> | null): Record<string, Set<number>> => {
  if (!data) return {}

  const result: Record<string, Set<number>> = {}
  Object.entries(data).forEach(([courseId, modules]) => {
    result[courseId] = new Set(modules)
  })
  return result
}

export function CourseGenProvider({ children }: { children: ReactNode }) {
  // Dummy courses data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "frontend-1",
      title: "Frontend Development: From Zero to Earning",
      description: "Learn to build responsive and interactive web applications with HTML, CSS, and JavaScript.",
      level: "Beginner",
      duration: "8 weeks",
      topics: ["HTML", "CSS", "JavaScript", "Responsive Design", "DOM Manipulation"],
      skills: ["Web Development", "Frontend Design", "Interactive Websites", "Freelancing"],
      image: "/abstract-ai-learning.png",
      goal: "To earn money through frontend development skills.",
      modules: [
        {
          title: "Module 1: Introduction to Web Development and the Frontend Landscape",
          description:
            "This module lays the groundwork for your frontend journey. We'll demystify the internet, explain how websites work, and introduce you to the core technologies that power the frontend. You'll understand the different roles in web development, focusing on why frontend is a great entry point to earning money. The emphasis is on practical understanding, not overwhelming jargon. We'll discuss the importance of user experience (UX) and user interface (UI) and how good frontend development directly translates into increased user engagement, sales, and ultimately, revenue for businesses.",
          subsections: [
            "1.1 The Internet and the World Wide Web: A Simple Explanation",
            "1.2 Understanding Frontend, Backend, and Full-Stack Development",
            "1.3 Why Frontend is a Great Starting Point for Earning Money",
          ],
          recommended_videos: [
            {
              title: "Understanding Module 1: Introduction to Web Development and the Frontend Landscape",
              channel: "CS Dojo",
              duration: "25:24",
              link: "https://www.youtube.com/watch?v=OK_JCtrrv-c",
            },
          ],
        },
        {
          title: "Module 2: HTML - Structuring Your Web Pages",
          description:
            "HTML is the foundation of every website. In this module, you'll learn how to use HTML tags to structure content, create headings, paragraphs, lists, and links. We'll cover essential elements like images, forms, and tables. Practical exercises will reinforce your understanding, and you'll build your first simple webpage. The focus will be on writing semantic HTML, which is crucial for SEO (Search Engine Optimization) and accessibility – both critical for attracting and retaining website visitors, thereby increasing its monetization potential. We'll also delve into HTML5 semantic elements like `<header>`, `<footer>`, `<nav>`, and `<article>`, showing how they enhance SEO and improve website structure, making it easier for search engines to understand and rank your content. This module is heavily focused on hands-on practice with example code and project snippets. We'll discuss best practices and common pitfalls to avoid.",
          subsections: [
            "2.1 HTML Basics: Tags, Elements, and Attributes",
            "2.2 Structuring Content: Headings, Paragraphs, Lists, and Links",
            "2.3 Images, Forms, and Tables: Adding Interactivity to Your Pages",
          ],
          recommended_videos: [
            {
              title: "Complete Module 2: HTML - Structuring Your Web Pages Guide",
              channel: "freeCodeCamp.org",
              duration: "24:42",
              link: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
            },
          ],
        },
        {
          title: "Module 3: CSS - Styling Your Web Pages",
          description:
            "CSS (Cascading Style Sheets) allows you to control the visual appearance of your webpages. This module covers CSS syntax, selectors, properties, and values. You'll learn how to style text, set colors, control layout, and create visually appealing designs. We'll explore different CSS units (pixels, ems, rems), understand the box model, and work with positioning. We'll discuss how a visually appealing and well-designed website keeps users engaged and encourages them to return, which can directly increase revenue through ads, sales, or subscriptions. We'll dive into responsive design principles and show how you can use CSS media queries to create websites that look great on all devices, from desktops to smartphones, which is crucial for SEO and user experience, and in turn, increasing your money making potential. We'll cover CSS frameworks like Bootstrap briefly to give a glimpse of how they are commonly used to speed up development.",
          subsections: [
            "3.1 CSS Syntax, Selectors, Properties, and Values",
            "3.2 Styling Text, Colors, and Layout",
            "3.3 The Box Model and Positioning",
            "3.4 Responsive Design with Media Queries",
          ],
          recommended_videos: [
            {
              title: "Module 3: CSS - Styling Your Web Pages Masterclass",
              channel: "Academind",
              duration: "11:25",
              link: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
            },
          ],
        },
        {
          title: "Module 4: JavaScript - Adding Interactivity to Your Web Pages",
          description:
            "JavaScript brings your webpages to life. This module introduces you to the fundamentals of JavaScript, including variables, data types, operators, and control flow. You'll learn how to manipulate the DOM (Document Object Model) to dynamically update content, respond to user interactions, and create interactive elements. We'll cover basic event handling (e.g., button clicks, form submissions) and show you how to add simple animations and effects. We'll discuss the impact of JavaScript on user engagement, showing how interactive websites keep users on page longer and increase the likelihood of conversions (e.g., purchases, sign-ups). JavaScript is key to building features that allow for more effective A/B testing, user tracking, and personalized experiences, all of which can be leveraged to optimize a website for revenue generation. You will learn about DOM manipulation with practical examples and simple projects",
          subsections: [
            "4.1 JavaScript Basics: Variables, Data Types, and Operators",
            "4.2 Control Flow: Conditionals and Loops",
            "4.3 DOM Manipulation: Modifying HTML with JavaScript",
            "4.4 Event Handling: Responding to User Interactions",
          ],
          recommended_videos: [
            {
              title: "Learn Module 4: JavaScript - Adding Interactivity to Your Web Pages in 30 Minutes",
              channel: "freeCodeCamp.org",
              duration: "20:31",
              link: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
            },
          ],
        },
        {
          title: "Module 5: Your First Freelance Project and Beyond",
          description:
            "This module is all about putting your newly acquired skills to work. We'll guide you through the process of finding your first freelance frontend project, from identifying potential clients to writing proposals and managing projects. We'll discuss strategies for pricing your services, building your portfolio, and marketing yourself as a freelance frontend developer. We'll focus on creating a simple, yet effective portfolio website to showcase your skills to potential employers or clients. This module emphasizes ethical considerations, client communication, and project management. We will help you to understand the realities of frontend development including debugging and the different challenges you will face. We'll discuss opportunities for continued learning, exploring advanced JavaScript frameworks (like React, Angular, or Vue.js), and specializing in specific areas (e.g., UI/UX design, web accessibility). Learning to specialize will further increase earning potential. This module emphasizes the continuous learning nature of frontend development and provides resources for staying up-to-date with the latest technologies and trends.",
          subsections: [
            "5.1 Finding Your First Freelance Project",
            "5.2 Creating Your Portfolio and Marketing Yourself",
            "5.3 Pricing Your Services and Managing Projects",
            "5.4 Next Steps: Continued Learning and Specialization",
          ],
          recommended_videos: [
            {
              title: "Learn Module 5: Your First Freelance Project and Beyond in 30 Minutes",
              channel: "freeCodeCamp.org",
              duration: "21:54",
              link: "https://www.youtube.com/watch?v=eIrMbAQSU34",
            },
          ],
        },
      ],
    },
    {
      id: "frontend-2",
      title: "Advanced UI/UX Development",
      description: "Master advanced frontend techniques including animations, accessibility, and design systems.",
      level: "Intermediate",
      duration: "10 weeks",
      topics: ["Advanced React", "Animation Libraries", "Design Systems", "Accessibility", "Testing"],
      skills: ["Complex UI Patterns", "Animation", "Accessibility", "Component Testing"],
      image: "/abstract-deep-learning.png",
    },
    {
      id: "backend-1",
      title: "Backend Development with Node.js",
      description: "Build scalable and secure backend services using Node.js, Express, and MongoDB.",
      level: "Beginner",
      duration: "8 weeks",
      topics: ["Node.js", "Express", "MongoDB", "RESTful APIs", "Authentication", "Deployment"],
      skills: ["API Design", "Database Modeling", "Authentication", "Error Handling"],
      image: "/abstract-ml-learning.png",
    },
  ])

  const [filters, setFilters] = useState({
    level: "all",
    duration: "all",
    topic: "all",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    level: "Beginner",
    goal: "",
    currentState: "",
  })

  // Module completion tracking
  const [completedModules, setCompletedModules] = useState<Record<string, Set<number>>>({})

  // Load completed modules from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("completedModules")
      const parsedData = safelyParseJSON(storedData) as Record<string, number[]> | null
      setCompletedModules(convertCompletedModulesFromStorage(parsedData))
    }
  }, [])

  // Save completed modules to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(completedModules).length > 0) {
      // Convert Sets to arrays for storage
      const dataForStorage: Record<string, number[]> = {}
      Object.entries(completedModules).forEach(([courseId, modules]) => {
        dataForStorage[courseId] = Array.from(modules)
      })
      localStorage.setItem("completedModules", JSON.stringify(dataForStorage))
    }
  }, [completedModules])

  const toggleModuleCompletion = (courseId: string, moduleIndex: number) => {
    setCompletedModules((prev) => {
      const newCompletedModules = { ...prev }

      if (!newCompletedModules[courseId]) {
        newCompletedModules[courseId] = new Set()
      }

      const courseModules = new Set(newCompletedModules[courseId])

      if (courseModules.has(moduleIndex)) {
        courseModules.delete(moduleIndex)
      } else {
        courseModules.add(moduleIndex)
      }

      newCompletedModules[courseId] = courseModules
      return newCompletedModules
    })
  }

  const getModuleCompletionPercentage = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course || !course.modules || course.modules.length === 0) return 0

    const totalModules = course.modules.length
    const completed = completedModules[courseId]?.size || 0

    return Math.round((completed / totalModules) * 100)
  }

  const addGeneratedCourse = (course: Course) => {
    setCourses((prev) => [{ ...course, isGenerated: true }, ...prev])
  }

  return (
    <CourseGenContext.Provider
      value={{
        courses,
        filters,
        setFilters,
        addGeneratedCourse,
        isGenerating,
        setIsGenerating,
        formData,
        setFormData,
        completedModules,
        toggleModuleCompletion,
        getModuleCompletionPercentage,
      }}
    >
      {children}
    </CourseGenContext.Provider>
  )
}

export function useCourseGen() {
  const context = useContext(CourseGenContext)
  if (context === undefined) {
    throw new Error("useCourseGen must be used within a CourseGenProvider")
  }
  return context
}
