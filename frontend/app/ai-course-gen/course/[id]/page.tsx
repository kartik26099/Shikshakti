"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Download, CheckCircle, Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import { useCourseGen, type Course } from "@/context/course-gen-context"

export default function CoursePage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()
  const params = useParams()
  const { courses, completedModules, toggleModuleCompletion, getModuleCompletionPercentage } = useCourseGen()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (params.id && courses) {
      // First try to find the course in the context
      const foundCourse = courses.find((c) => c.id === params.id)

      if (foundCourse) {
        setCourse(foundCourse)
        setCompletionPercentage(getModuleCompletionPercentage(params.id as string))
        setLoading(false)
      } else {
        // If not found in context, create a fallback course for generated courses
        // This handles the case when navigating directly to a URL or after a refresh
        if (params.id.toString().startsWith("generated-")) {
          const generatedCourse: Course = {
            id: params.id.toString(),
            title: "Generated Course",
            description: "This is a custom generated course based on your requirements.",
            level: "Beginner",
            duration: "8 weeks",
            topics: ["Custom Learning", "Personalized Content", "Adaptive Learning"],
            skills: ["Subject Mastery", "Practical Application", "Problem Solving"],
            image: "/abstract-ai-learning.png",
            isGenerated: true,
          }
          setCourse(generatedCourse)
          setLoading(false)
        } else {
          // If not a generated course and not found, redirect back
          router.push("/ai-course-gen")
        }
      }
    }
  }, [params.id, courses, router, getModuleCompletionPercentage])

  // Update completion percentage when modules are completed
  useEffect(() => {
    if (course?.id) {
      setCompletionPercentage(getModuleCompletionPercentage(course.id))
    }
  }, [completedModules, course?.id, getModuleCompletionPercentage])

  const handleModuleCompletion = (moduleIndex: number) => {
    if (course?.id) {
      toggleModuleCompletion(course.id, moduleIndex)
    }
  }

  const isModuleCompleted = (moduleIndex: number) => {
    if (!course?.id) return false
    return completedModules[course.id]?.has(moduleIndex) || false
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/ai-course-gen")}>Return to Courses</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />
      <ScrollProgress />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/10"
              onClick={() => router.push("/ai-course-gen")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-lg text-gray-200">{course.description}</p>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge className="bg-purple-700 text-white">{course.level}</Badge>
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-1" />
                    Self-paced
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" />
                  Download Syllabus
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Start Learning</Button>
              </div>
            </div>

            {/* Course Progress */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2 text-white">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-purple-800" indicatorClassName="bg-purple-400" />
            </div>
          </div>

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList className="mb-6 bg-transparent border-b border-gray-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 text-gray-300 rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="curriculum"
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-purple-400 text-gray-300 rounded-none"
              >
                Curriculum
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-navy-900 border-gray-700 text-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Course Overview</h2>

                  {course.goal && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">Goal</h3>
                      <p className="text-gray-300">{course.goal}</p>
                    </div>
                  )}

                  <p className="mb-4 text-gray-300">
                    This comprehensive course is designed to give you a solid foundation in {course.title.toLowerCase()}
                    . You'll learn through a combination of theory and practical exercises, building real-world projects
                    that demonstrate your skills.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">What You'll Learn</h3>
                      <ul className="space-y-2">
                        {course.skills.map((skill, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Prerequisites</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">Basic understanding of programming concepts</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">Familiarity with web development fundamentals</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">Access to a computer with internet connection</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-navy-900 border-gray-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-6 w-6 text-purple-400 mr-2">📚</div>
                      <h3 className="text-lg font-medium">Course Structure</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex justify-between">
                        <span>Modules</span>
                        <span className="font-medium">{course.modules?.length || 5}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Lessons</span>
                        <span className="font-medium">
                          {course.modules
                            ? course.modules.reduce((acc, module) => acc + module.subsections.length, 0)
                            : 15}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Projects</span>
                        <span className="font-medium">4</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Quizzes</span>
                        <span className="font-medium">12</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-navy-900 border-gray-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-6 w-6 text-purple-400 mr-2">⏱️</div>
                      <h3 className="text-lg font-medium">Time Commitment</h3>
                    </div>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex justify-between">
                        <span>Total Hours</span>
                        <span className="font-medium">60</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Per Week</span>
                        <span className="font-medium">7-10 hours</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Completion Time</span>
                        <span className="font-medium">{course.duration}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-navy-900 border-gray-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-6 w-6 text-purple-400 mr-2">🏆</div>
                      <h3 className="text-lg font-medium">Certification</h3>
                    </div>
                    <p className="mb-4 text-gray-300">Complete all requirements to earn your certificate.</p>
                    <Progress
                      value={completionPercentage}
                      className="h-2 mb-2 bg-purple-800"
                      indicatorClassName="bg-purple-400"
                    />
                    <p className="text-sm text-gray-400">{completionPercentage}% Complete</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              <div className="bg-navy-900 border border-gray-700 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-6">Course Curriculum</h2>

                {course.modules && course.modules.length > 0 ? (
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-800/50 p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                isModuleCompleted(moduleIndex)
                                  ? "bg-purple-900 text-purple-300"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {isModuleCompleted(moduleIndex) ? <Check className="h-5 w-5" /> : moduleIndex + 1}
                            </div>
                            <h3 className="text-lg font-medium">{module.title}</h3>
                          </div>
                          <Button
                            variant={isModuleCompleted(moduleIndex) ? "outline" : "default"}
                            onClick={() => handleModuleCompletion(moduleIndex)}
                            className={
                              isModuleCompleted(moduleIndex)
                                ? "bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 border-purple-700"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }
                          >
                            {isModuleCompleted(moduleIndex) ? "Mark as Incomplete" : "Mark as Complete"}
                          </Button>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={`module-${moduleIndex}`} className="border-0">
                            <AccordionTrigger className="px-4 py-2 hover:bg-gray-800/30 text-gray-300">
                              Module Details
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-gray-300">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p>{module.description}</p>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">Subsections</h4>
                                  <ul className="space-y-2">
  {module.subsections.map((subsection, index) => (
    <li key={index} className="flex items-center">
      <div className="w-6 h-6 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center mr-2 text-xs">
        {index + 1}
      </div>
      <div>
        <span className="font-semibold">{subsection.title}</span>
        <div className="text-gray-400">{subsection.content}</div>
      </div>
    </li>
  ))}
</ul>

                                </div>

                                {module.recommended_videos && module.recommended_videos.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Recommended Videos</h4>
                                    <div className="space-y-3">
                                      {module.recommended_videos.map((video, index) => (
                                        <a
                                          key={index}
                                          href={video.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start p-3 border border-gray-700 rounded-lg hover:bg-gray-800/30 transition-colors"
                                        >
                                          <div className="w-10 h-10 rounded-full bg-red-900/30 text-red-300 flex items-center justify-center mr-3 flex-shrink-0">
                                            <Play className="h-5 w-5" />
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-medium mb-1 flex items-center">{video.title}</h5>
                                            <div className="flex items-center text-sm text-gray-400">
                                              <span className="mr-3">{video.channel}</span>
                                              <Clock className="h-3 w-3 mr-1" />
                                              <span>{video.duration}</span>
                                            </div>
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((module) => (
                      <div key={module} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center mr-3">
                              {module}
                            </div>
                            <h3 className="text-lg font-medium">
                              Module {module}: {getModuleTitle(module, course.title)}
                            </h3>
                          </div>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Mark as Complete</Button>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={`module-${module}`} className="border-0">
                            <AccordionTrigger className="px-0 py-2 hover:bg-transparent text-gray-300">
                              Module Details
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-300">
                              <div className="space-y-3">
                                {[1, 2, 3, 4].map((lesson) => (
                                  <div
                                    key={lesson}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                                  >
                                    <div className="flex items-center">
                                      <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center mr-3 text-xs">
                                        {lesson}
                                      </div>
                                      <span>
                                        Lesson {lesson}: {getLessonTitle(module, lesson, course.title)}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span>{Math.floor(Math.random() * 30) + 15} min</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Helper functions to generate dummy content
function getModuleTitle(moduleNumber: number, courseTitle: string): string {
  const modules = ["Introduction to", "Fundamentals of", "Advanced Concepts in", "Practical Applications of"]

  return `${modules[moduleNumber - 1]} ${courseTitle.split(" ").slice(-1)[0]}`
}

function getLessonTitle(moduleNumber: number, lessonNumber: number, courseTitle: string): string {
  const topic = courseTitle.split(" ").slice(-1)[0]

  const lessonTitles = {
    1: [
      `Understanding ${topic} Basics`,
      `Setting Up Your Environment`,
      `Core Concepts Overview`,
      `Your First ${topic} Project`,
    ],
    2: [
      `Working with ${topic} Components`,
      `Data Structures in ${topic}`,
      `Building Blocks of ${topic}`,
      `${topic} Best Practices`,
    ],
    3: [
      `Advanced ${topic} Patterns`,
      `Optimizing ${topic} Performance`,
      `${topic} Architecture`,
      `Testing ${topic} Applications`,
    ],
    4: [
      `Real-world ${topic} Case Studies`,
      `Deploying ${topic} Projects`,
      `Scaling ${topic} Applications`,
      `Future of ${topic}`,
    ],
  }

  return lessonTitles[moduleNumber as keyof typeof lessonTitles][lessonNumber - 1]
}
