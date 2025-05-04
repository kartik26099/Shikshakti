"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import { useCourseGen } from "@/context/course-gen-context"

export default function CourseGenPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()
  const { courses, filters, setFilters, addGeneratedCourse, isGenerating, setIsGenerating, formData, setFormData } =
    useCourseGen()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [backendError, setBackendError] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleGenerateCourse = async () => {
    if (!formData.title || !formData.goal) {
      toast?.({
        title: "Missing information",
        description: "Please provide a course title and learning goal.",
        variant: "destructive",
      }) || alert("Please provide a course title and learning goal");
      return;
    }
    setIsGenerating(true);
    setBackendError(null);

    try {
      const payload = {
        title: formData.title,
        level: formData.level.toLowerCase(),
        goal: formData.goal,
        currentState: formData.currentState || "Complete beginner",
      };

      const response = await fetch("http://127.0.0.1:5002/generatecourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate course";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let courseData;
      try {
        courseData = await response.json();
      } catch (e) {
        throw new Error("Invalid response from server. Please try again.");
      }

      if (!courseData.title || !courseData.modules || !Array.isArray(courseData.modules)) {
        throw new Error("Received invalid course data from server");
      }

      const newCourse = {
        ...courseData,
        id: `generated-${Date.now()}`,
        description: `A personalized course designed to help you ${formData.goal.toLowerCase()}`,
        duration: "8 weeks",
        topics: courseData.modules?.map((m) => m.title) || [],
        skills: ["Subject Mastery", "Practical Application", "Problem Solving"],
        image: "/abstract-ai-learning.png",
        isGenerated: true,
      };

      addGeneratedCourse(newCourse);
      setIsGenerating(false);

      setFormData({
        title: "",
        level: "Beginner",
        goal: "",
        currentState: "",
      });

      router.push(`/ai-course-gen/course/${newCourse.id}`);
    } catch (error) {
      setIsGenerating(false);
      setBackendError(error.message);
      toast?.({
        title: "Course Generation Failed",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive",
      }) || alert(error.message || "Failed to generate course. Please try again.");
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !course.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false
    if (filters.level !== "all" && course.level !== filters.level) return false
    if (filters.duration !== "all") {
      const durationWeeks = Number.parseInt(course.duration.split(" ")[0])
      if (filters.duration === "short" && durationWeeks > 4) return false
      else if (filters.duration === "medium" && (durationWeeks <= 4 || durationWeeks > 8)) return false
      else if (filters.duration === "long" && durationWeeks <= 8) return false
    }
    if (filters.topic !== "all" && !course.topics.includes(filters.topic)) return false
    return true
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />
      <ScrollProgress />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-slate-900 mb-2 transition-colors duration-700">
                AI CourseGen
              </h1>
              <p className="text-lg dark:text-gray-300 text-slate-700 transition-colors duration-700">
                Discover and generate personalized learning paths
              </p>
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Course
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Generate Custom Course</h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">Course Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Machine Learning Fundamentals"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Experience Level</Label>
                      <RadioGroup
                        defaultValue={formData.level}
                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Beginner" id="beginner" />
                          <Label htmlFor="beginner">Beginner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Intermediate" id="intermediate" />
                          <Label htmlFor="intermediate">Intermediate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Advanced" id="advanced" />
                          <Label htmlFor="advanced">Advanced</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Learning Goal</Label>
                      <Textarea
                        id="goal"
                        placeholder="What do you want to achieve with this course?"
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentState">Current Knowledge</Label>
                      <Textarea
                        id="currentState"
                        placeholder="What do you already know about this subject?"
                        value={formData.currentState}
                        onChange={(e) => setFormData({ ...formData, currentState: e.target.value })}
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      onClick={handleGenerateCourse}
                      disabled={isGenerating || !formData.goal}
                    >
                      {isGenerating ? "Generating..." : "Generate Course"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Filters</h2>
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <div className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
                  <div>
                    <Label className="mb-2 block">Experience Level</Label>
                    <div className="space-y-2">
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.level === "all" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, level: "all" })}
                      >
                        All Levels
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.level === "Beginner" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, level: "Beginner" })}
                      >
                        Beginner
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.level === "Intermediate" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, level: "Intermediate" })}
                      >
                        Intermediate
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.level === "Advanced" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, level: "Advanced" })}
                      >
                        Advanced
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Duration</Label>
                    <div className="space-y-2">
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.duration === "all" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, duration: "all" })}
                      >
                        Any Duration
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.duration === "short" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, duration: "short" })}
                      >
                        Short (≤ 4 weeks)
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.duration === "medium" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, duration: "medium" })}
                      >
                        Medium (5-8 weeks)
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.duration === "long" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, duration: "long" })}
                      >
                        Long ({">"}8 weeks)
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Topic</Label>
                    <div className="space-y-2">
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.topic === "all" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, topic: "all" })}
                      >
                        All Topics
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.topic === "React" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, topic: "React" })}
                      >
                        React
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.topic === "Node.js" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, topic: "Node.js" })}
                      >
                        Node.js
                      </div>
                      <div
                        className={`px-3 py-2 rounded-md cursor-pointer ${filters.topic === "JavaScript" ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                        onClick={() => setFilters({ ...filters, topic: "JavaScript" })}
                      >
                        JavaScript
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isGenerating && (
                <Card className="mb-6 border-purple-300 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="animate-pulse flex-shrink-0 h-16 w-16 rounded-full bg-purple-200 dark:bg-purple-900"></div>
                      <div className="flex-1 space-y-4">
                        <div className="animate-pulse h-4 bg-purple-200 dark:bg-purple-900 rounded w-3/4"></div>
                        <div className="animate-pulse h-4 bg-purple-100 dark:bg-purple-800 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">Generating your personalized course...</div>
                  </CardContent>
                </Card>
              )}

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className={`overflow-hidden hover:shadow-lg transition-shadow ${
                        course.isGenerated ? "border-purple-300 dark:border-purple-800" : ""
                      }`}
                    >
                      <div className="h-40 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
                        {course.image && (
                          <img
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-50"
                          />
                        )}
                        {course.isGenerated && (
                          <Badge className="absolute top-2 right-2 bg-purple-700">Generated</Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{course.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            {course.level}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                            {course.duration}
                          </Badge>
                        </div>

                        <Button className="w-full" onClick={() => router.push(`/ai-course-gen/course/${course.id}`)}>
                          View Course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
