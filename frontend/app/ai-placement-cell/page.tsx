"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Briefcase,
  Building,
  Calendar,
  ChevronDown,
  Filter,
  FileText,
  MapPin,
  Sparkles,
  Star,
  Upload,
  X,
  Trash2,
  Eye,
  FileUp,
  CheckCircle,
  Loader2,
  Send,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  type: string
  matchScore: number
  selectionProbability: number
  postedDate: string
  logo: string
  skills: string[]
  status?: "applied" | "rejected" | "accepted" | "in-progress"
  isReachedOut?: boolean
}

interface Resume {
  name: string
  size: number
  type: string
  lastModified: number
  url: string
}

export default function AIPlacementCellPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [matchFilter, setMatchFilter] = useState([0, 100])
  const [probabilityFilter, setProbabilityFilter] = useState([0, 100])
  const [showReachedOutOnly, setShowReachedOutOnly] = useState(false)
  const [resume, setResume] = useState<Resume | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    availability: "Immediate",
    expectedSalary: "",
  })

  // Sample data - initial opportunities before resume upload
  const initialOpportunities: Opportunity[] = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "TechCorp",
      location: "Bangalore, India",
      type: "Full-time",
      matchScore: 65,
      selectionProbability: 48,
      postedDate: "2023-04-20",
      logo: "/abstract-tc.png",
      skills: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      id: "2",
      title: "Machine Learning Engineer",
      company: "AI Solutions",
      location: "Remote",
      type: "Full-time",
      matchScore: 58,
      selectionProbability: 42,
      postedDate: "2023-04-18",
      logo: "/abstract-ai-network.png",
      skills: ["Python", "TensorFlow", "PyTorch"],
      isReachedOut: true,
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "DataWorks",
      location: "Hyderabad, India",
      type: "Full-time",
      matchScore: 52,
      selectionProbability: 45,
      postedDate: "2023-04-15",
      logo: "/abstract-dw.png",
      skills: ["Python", "SQL", "Data Visualization"],
    },
    {
      id: "4",
      title: "Backend Developer",
      company: "ServerStack",
      location: "Delhi, India",
      type: "Full-time",
      matchScore: 60,
      selectionProbability: 50,
      postedDate: "2023-04-12",
      logo: "/stylized-letter-ss.png",
      skills: ["Node.js", "Express", "MongoDB"],
      isReachedOut: true,
    },
    {
      id: "5",
      title: "UX/UI Designer",
      company: "DesignHub",
      location: "Mumbai, India",
      type: "Contract",
      matchScore: 48,
      selectionProbability: 40,
      postedDate: "2023-04-10",
      logo: "/intertwined-letters.png",
      skills: ["Figma", "Adobe XD", "User Research"],
    },
    {
      id: "6",
      title: "DevOps Engineer",
      company: "CloudTech",
      location: "Pune, India",
      type: "Full-time",
      matchScore: 55,
      selectionProbability: 47,
      postedDate: "2023-04-08",
      logo: "/computed-tomography-scan.png",
      skills: ["Docker", "Kubernetes", "AWS"],
    },
    {
      id: "7",
      title: "Mobile App Developer",
      company: "AppWorks",
      location: "Chennai, India",
      type: "Full-time",
      matchScore: 62,
      selectionProbability: 44,
      postedDate: "2023-04-05",
      logo: "/abstract-geometric-aw.png",
      skills: ["React Native", "Flutter", "Swift"],
    },
  ]

  // Enhanced opportunities after resume upload
  const enhancedOpportunities: Opportunity[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Bangalore, India",
      type: "Full-time",
      matchScore: 92,
      selectionProbability: 78,
      postedDate: "2023-04-20",
      logo: "/abstract-tc.png",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    },
    {
      id: "2",
      title: "AI/ML Engineer",
      company: "AI Solutions",
      location: "Remote",
      type: "Full-time",
      matchScore: 88,
      selectionProbability: 65,
      postedDate: "2023-04-18",
      logo: "/abstract-ai-network.png",
      skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning"],
      isReachedOut: true,
    },
    {
      id: "3",
      title: "Lead Data Scientist",
      company: "DataWorks",
      location: "Hyderabad, India",
      type: "Full-time",
      matchScore: 85,
      selectionProbability: 72,
      postedDate: "2023-04-15",
      logo: "/abstract-dw.png",
      skills: ["Python", "SQL", "Data Visualization", "Machine Learning"],
    },
    {
      id: "4",
      title: "Full Stack Developer",
      company: "ServerStack",
      location: "Delhi, India",
      type: "Full-time",
      matchScore: 79,
      selectionProbability: 68,
      postedDate: "2023-04-12",
      logo: "/stylized-letter-ss.png",
      skills: ["Node.js", "Express", "MongoDB", "React"],
      isReachedOut: true,
    },
    {
      id: "5",
      title: "Senior UX/UI Designer",
      company: "DesignHub",
      location: "Mumbai, India",
      type: "Contract",
      matchScore: 76,
      selectionProbability: 60,
      postedDate: "2023-04-10",
      logo: "/intertwined-letters.png",
      skills: ["Figma", "Adobe XD", "User Research", "Design Systems"],
    },
    {
      id: "6",
      title: "DevOps Architect",
      company: "CloudTech",
      location: "Pune, India",
      type: "Full-time",
      matchScore: 72,
      selectionProbability: 55,
      postedDate: "2023-04-08",
      logo: "/computed-tomography-scan.png",
      skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
      isReachedOut: true,
    },
    {
      id: "7",
      title: "Lead Mobile Developer",
      company: "AppWorks",
      location: "Chennai, India",
      type: "Full-time",
      matchScore: 68,
      selectionProbability: 50,
      postedDate: "2023-04-05",
      logo: "/abstract-geometric-aw.png",
      skills: ["React Native", "Flutter", "Swift", "Mobile Architecture"],
    },
  ]

  // State to track opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>(initialOpportunities)

  // Stats for the dashboard
  const [stats, setStats] = useState({
    rejections: 0,
    acceptances: 0,
    inProgress: 0,
    applications: 0,
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Update stats based on opportunities
  useEffect(() => {
    setStats({
      rejections: opportunities.filter((o) => o.status === "rejected").length,
      acceptances: opportunities.filter((o) => o.status === "accepted").length,
      inProgress: opportunities.filter((o) => o.status === "in-progress").length,
      applications: opportunities.filter((o) => o.status).length,
    })
  }, [opportunities])

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            setIsUploading(false)
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isUploading])

  // Filter opportunities based on current filters
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchScoreInRange = opportunity.matchScore >= matchFilter[0] && opportunity.matchScore <= matchFilter[1]
    const probabilityInRange =
      opportunity.selectionProbability >= probabilityFilter[0] &&
      opportunity.selectionProbability <= probabilityFilter[1]
    const reachedOutFilter = showReachedOutOnly ? opportunity.isReachedOut : true

    return matchScoreInRange && probabilityInRange && reachedOutFilter
  })

  // Get opportunities where company reached out
  const reachedOutOpportunities = opportunities.filter((opportunity) => opportunity.isReachedOut)

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Only accept PDF files
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file upload and processing
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file)
      setResume({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        url: fileUrl,
      })

      // Update opportunities with enhanced matches based on resume
      setOpportunities(enhancedOpportunities)

      setIsUploading(false)
      setUploadProgress(100)

      // Show success message
      alert("Resume uploaded successfully! Job matches have been updated based on your profile.")
    }, 2000)
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Delete resume
  const handleDeleteResume = () => {
    if (resume?.url) {
      URL.revokeObjectURL(resume.url)
    }
    setResume(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    // Reset opportunities to initial state
    setOpportunities(initialOpportunities)
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Handle opening application dialog
  const handleOpenApplicationDialog = (jobId: string) => {
    if (!resume) {
      alert("Please upload your resume before applying")
      setActiveTab("resume")
      return
    }

    setCurrentJobId(jobId)
    setApplicationDialogOpen(true)
  }

  // Handle application form input changes
  const handleApplicationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setApplicationForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle application form submission
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentJobId) return

    setIsSubmittingApplication(true)

    // Simulate form submission
    setTimeout(() => {
      // Update job status to in-progress
      setOpportunities(opportunities.map((job) => (job.id === currentJobId ? { ...job, status: "in-progress" } : job)))

      setIsSubmittingApplication(false)
      setApplicationDialogOpen(false)

      // Reset form
      setApplicationForm({
        name: "",
        email: "",
        phone: "",
        coverLetter: "",
        availability: "Immediate",
        expectedSalary: "",
      })

      // Show success message
      alert("Application submitted successfully!")

      // Switch to dashboard to see updated stats
      setActiveTab("dashboard")
    }, 1500)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />
      <ScrollProgress />

      <main className="relative z-10 pt-24 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold dark:text-white text-slate-900 mb-4 transition-colors duration-700">
              AI Placement Cell
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Find your perfect career match with AI-powered job recommendations
            </p>
          </motion.div>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Opportunities</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Past Activities */}
                <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-purple-600/40 dark:from-purple-600/30 dark:to-purple-800/30 rounded-xl" />
                  <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold">Past Activities</CardTitle>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    {opportunities.filter((o) => o.status).length > 0 ? (
                      <div className="space-y-4">
                        {opportunities
                          .filter((o) => o.status)
                          .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
                          .slice(0, showAllActivities ? undefined : 3) // Show only 3 recent activities initially
                          .map((opportunity) => (
                            <div
                              key={opportunity.id}
                              className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                      src={opportunity.logo || "/placeholder.svg"}
                                      alt={`${opportunity.company} logo`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium dark:text-white">{opportunity.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{opportunity.company}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={cn(
                                      opportunity.status === "accepted" &&
                                        "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
                                      opportunity.status === "rejected" &&
                                        "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
                                      opportunity.status === "in-progress" &&
                                        "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
                                    )}
                                  >
                                    {opportunity.status === "accepted" && "Accepted"}
                                    {opportunity.status === "rejected" && "Rejected"}
                                    {opportunity.status === "in-progress" && "In Progress"}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(opportunity.postedDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                        {/* View More / View Less button */}
                        {opportunities.filter((o) => o.status).length > 3 && (
                          <div className="text-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAllActivities(!showAllActivities)}
                              className="border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                            >
                              {showAllActivities ? (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1 rotate-180" />
                                  View Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View More
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-purple-500/50 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 text-lg">No past activities yet</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Your application history will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-blue-600/40 dark:from-blue-600/30 dark:to-blue-800/30 rounded-xl" />
                  <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold">Application Stats</CardTitle>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.applications}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Applications</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">In Progress</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.acceptances}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Acceptances</p>
                      </div>
                      <div className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejections}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Rejections</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium mb-3 dark:text-white">Match Quality</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                        <span className="text-sm font-medium dark:text-white">
                          {Math.round(
                            opportunities.reduce((acc, curr) => acc + curr.matchScore, 0) / opportunities.length,
                          )}
                          %
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Average match score across all opportunities
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Opportunities Matched Online */}
                <Card className="lg:col-span-3 overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 to-amber-600/40 dark:from-amber-500/30 dark:to-amber-700/30 rounded-xl" />
                  <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">Opportunities Matched Online</CardTitle>
                      {resume && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Personalized Matches</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredOpportunities.slice(0, 3).map((opportunity) => (
                        <div
                          key={opportunity.id}
                          className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={opportunity.logo || "/placeholder.svg"}
                                alt={`${opportunity.company} logo`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium dark:text-white">{opportunity.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{opportunity.company}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{opportunity.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {opportunity.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-white/50 dark:bg-slate-700/50">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-300">Match Score</span>
                                <span className="font-medium dark:text-white">{opportunity.matchScore}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                  style={{ width: `${opportunity.matchScore}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-300">Selection Probability</span>
                                <span className="font-medium dark:text-white">{opportunity.selectionProbability}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-pink-500 rounded-full"
                                  style={{ width: `${opportunity.selectionProbability}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <Button
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => handleOpenApplicationDialog(opportunity.id)}
                              disabled={opportunity.status === "applied" || opportunity.status === "in-progress"}
                            >
                              {opportunity.status === "applied" || opportunity.status === "in-progress"
                                ? "Applied"
                                : "Apply Now"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredOpportunities.length > 3 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => setActiveTab("opportunities")}
                        >
                          View All Opportunities
                        </Button>
                      </div>
                    )}

                    {filteredOpportunities.length === 0 && (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 mx-auto text-amber-500/50 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 text-lg">No matching opportunities found</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Try adjusting your filters or updating your profile
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Companies Reached Out */}
                <Card className="lg:col-span-3 overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 to-emerald-600/40 dark:from-emerald-600/30 dark:to-emerald-800/30 rounded-xl" />
                  <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                  <CardHeader className="relative z-10">
                    <CardTitle className="text-2xl font-bold">Companies Reached Out</CardTitle>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    {reachedOutOpportunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reachedOutOpportunities.map((opportunity) => (
                          <div
                            key={opportunity.id}
                            className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={opportunity.logo || "/placeholder.svg"}
                                  alt={`${opportunity.company} logo`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium dark:text-white">{opportunity.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{opportunity.company}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{opportunity.location}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {opportunity.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="bg-white/50 dark:bg-slate-700/50">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-300">Match Score</span>
                                  <span className="font-medium dark:text-white">{opportunity.matchScore}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    style={{ width: `${opportunity.matchScore}%` }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-300">Selection Probability</span>
                                  <span className="font-medium dark:text-white">
                                    {opportunity.selectionProbability}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                    style={{ width: `${opportunity.selectionProbability}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                                Company Reached Out
                              </Badge>
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => handleOpenApplicationDialog(opportunity.id)}
                                disabled={opportunity.status === "applied" || opportunity.status === "in-progress"}
                              >
                                {opportunity.status === "applied" || opportunity.status === "in-progress"
                                  ? "Applied"
                                  : "Respond"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Building className="h-12 w-12 mx-auto text-emerald-500/50 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 text-lg">No companies have reached out yet</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Keep your profile updated to attract company interest
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-0">
              <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-purple-600/40 dark:from-purple-600/30 dark:to-purple-800/30 rounded-xl" />
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                <CardHeader className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-2xl font-bold">All Opportunities</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                      >
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isFilterOpen && "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  {isFilterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium dark:text-white">Filter Options</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-gray-700 dark:text-gray-300">Match Score Range</Label>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {matchFilter[0]}% - {matchFilter[1]}%
                            </span>
                          </div>
                          <Slider
                            defaultValue={[0, 100]}
                            value={matchFilter}
                            onValueChange={setMatchFilter}
                            min={0}
                            max={100}
                            step={5}
                            className="py-4"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-gray-700 dark:text-gray-300">Selection Probability Range</Label>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {probabilityFilter[0]}% - {probabilityFilter[1]}%
                            </span>
                          </div>
                          <Slider
                            defaultValue={[0, 100]}
                            value={probabilityFilter}
                            onValueChange={setProbabilityFilter}
                            min={0}
                            max={100}
                            step={5}
                            className="py-4"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="reached-out"
                            checked={showReachedOutOnly}
                            onCheckedChange={setShowReachedOutOnly}
                          />
                          <Label htmlFor="reached-out" className="text-gray-700 dark:text-gray-300">
                            Show only opportunities where companies reached out
                          </Label>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMatchFilter([0, 100])
                              setProbabilityFilter([0, 100])
                              setShowReachedOutOnly(false)
                            }}
                          >
                            Reset
                          </Button>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    {filteredOpportunities.length > 0 ? (
                      filteredOpportunities.map((opportunity) => (
                        <div
                          key={opportunity.id}
                          className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 flex-grow">
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                  src={opportunity.logo || "/placeholder.svg"}
                                  alt={`${opportunity.company} logo`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-medium dark:text-white text-lg">{opportunity.title}</h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {opportunity.company}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-500">•</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {opportunity.location}
                                  </span>
                                  <span className="text-gray-400 dark:text-gray-500">•</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{opportunity.type}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 md:w-2/5">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-300">Match</span>
                                  <span className="font-medium dark:text-white">{opportunity.matchScore}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                    style={{ width: `${opportunity.matchScore}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-300">Probability</span>
                                  <span className="font-medium dark:text-white">
                                    {opportunity.selectionProbability}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-pink-500 rounded-full"
                                    style={{ width: `${opportunity.selectionProbability}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {opportunity.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-white/50 dark:bg-slate-700/50">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Posted {new Date(opportunity.postedDate).toLocaleDateString()}
                              </span>

                              {opportunity.isReachedOut && (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                                  Company Reached Out
                                </Badge>
                              )}
                            </div>

                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => handleOpenApplicationDialog(opportunity.id)}
                              disabled={opportunity.status === "applied" || opportunity.status === "in-progress"}
                            >
                              {opportunity.status === "applied" || opportunity.status === "in-progress"
                                ? "Applied"
                                : "Apply Now"}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 mx-auto text-purple-500/50 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 text-lg">No matching opportunities found</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          Try adjusting your filters or updating your profile
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resume Tab */}
            <TabsContent value="resume" className="mt-0">
              <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 to-cyan-600/40 dark:from-cyan-600/30 dark:to-cyan-800/30 rounded-xl" />
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold">Resume Management</CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="p-6 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    {!resume && !isUploading ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto text-cyan-500/50 mb-6" />
                        <h3 className="text-xl font-medium dark:text-white mb-3">Upload Your Resume</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                          Upload your resume to improve job matching and allow companies to find you more easily. We
                          accept PDF files up to 5MB.
                        </p>
                        <div className="flex flex-col items-center gap-4">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <Button
                            onClick={triggerFileInput}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Upload Resume</span>
                          </Button>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Supported format: PDF (Max 5MB)</p>
                        </div>
                      </div>
                    ) : isUploading ? (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-medium dark:text-white mb-6">Uploading Resume...</h3>
                        <div className="max-w-md mx-auto mb-4">
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{uploadProgress}% Complete</p>
                      </div>
                    ) : (
                      <div className="py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 flex-shrink-0 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                              <FileText className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-medium dark:text-white">{resume.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {formatFileSize(resume.size)} • Uploaded {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>Preview</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Resume Preview</DialogTitle>
                                  <DialogDescription>
                                    {resume.name} • {formatFileSize(resume.size)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 h-full mt-4">
                                  <iframe
                                    src={resume.url}
                                    className="w-full h-[calc(80vh-120px)]"
                                    title="Resume Preview"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-950/30"
                              onClick={handleDeleteResume}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </Button>
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                              onClick={triggerFileInput}
                            >
                              <FileUp className="h-4 w-4" />
                              <span>Replace</span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/30">
                            <h4 className="font-medium text-cyan-800 dark:text-cyan-300 mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              AI Resume Analysis
                            </h4>
                            <p className="text-cyan-700 dark:text-cyan-400 text-sm">
                              Our AI has analyzed your resume and found it to be a good match for 15 opportunities in
                              your area. Your resume highlights strong skills in web development and data analysis.
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium dark:text-white mb-3">Resume Optimization Tips</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                              <li className="flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-amber-600 dark:text-amber-400 text-xs">!</span>
                                </div>
                                <span>Consider adding more specific achievements with measurable results</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-amber-600 dark:text-amber-400 text-xs">!</span>
                                </div>
                                <span>Your resume could benefit from more industry-specific keywords</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                                </div>
                                <span>Good job highlighting your technical skills and certifications</span>
                              </li>
                            </ul>
                          </div>

                          <div className="flex justify-end">
                            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                              Get AI Resume Improvement
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
            <DialogDescription>
              {currentJobId && opportunities.find((job) => job.id === currentJobId)?.title} at{" "}
              {currentJobId && opportunities.find((job) => job.id === currentJobId)?.company}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={applicationForm.name}
                  onChange={handleApplicationFormChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={applicationForm.email}
                  onChange={handleApplicationFormChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={applicationForm.phone}
                  onChange={handleApplicationFormChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  name="availability"
                  value={applicationForm.availability}
                  onChange={handleApplicationFormChange}
                  placeholder="e.g. Immediate, 2 weeks notice"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedSalary">Expected Salary</Label>
              <Input
                id="expectedSalary"
                name="expectedSalary"
                value={applicationForm.expectedSalary}
                onChange={handleApplicationFormChange}
                placeholder="e.g. $80,000 - $100,000 per year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={applicationForm.coverLetter}
                onChange={handleApplicationFormChange}
                placeholder="Write a brief cover letter explaining why you're a good fit for this position"
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Resume Attached</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Your resume ({resume?.name}) will be automatically attached to this application.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApplicationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmittingApplication}>
                {isSubmittingApplication ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
