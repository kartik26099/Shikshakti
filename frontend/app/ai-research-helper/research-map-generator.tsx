"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ExternalLink, ListTodo, ArrowDown, Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

interface ResearchStage {
  id: string
  title: string
  description: string
  tasks: ResearchTask[]
}

interface ResearchTask {
  id: string
  title: string
  guidance: string
  background?: string
  methodology?: string
  expanded: boolean
}

interface ResearchReference {
  id: string
  title: string
  url: string
  resources?: {
    type: string
    title: string
    link: string
  }[]
}

interface RoadmapResponse {
  roadmap: string
  keywords: string[]
  references: string
  error?: string
}

export default function ResearchMapGenerator() {
  const [researchTopic, setResearchTopic] = useState("")
  const [researchGoal, setResearchGoal] = useState("")
  const [knowledgeLevel, setKnowledgeLevel] = useState("beginner")
  const [isGeneratingMap, setIsGeneratingMap] = useState(false)
  const [roadmapGenerated, setRoadmapGenerated] = useState(false)
  const [researchStages, setResearchStages] = useState<ResearchStage[]>([])
  const [references, setReferences] = useState<ResearchReference[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [rawMarkdown, setRawMarkdown] = useState<string>("")

 // Update the handleGenerateRoadmap function in your ResearchMapGenerator component

const handleGenerateRoadmap = async () => {
  if (!researchTopic.trim() || !researchGoal.trim()) {
    setErrorMessage("Please provide both a research topic and goal")
    return
  }

  setIsGeneratingMap(true)
  setRoadmapGenerated(false)
  setErrorMessage(null)

  try {
    // Create form data for the API request
    const formData = new FormData()
    formData.append("research_topic", researchTopic)
    formData.append("user_goal", researchGoal)
    formData.append("user_current_state", knowledgeLevel)

    // Make the API request to our Next.js API route
    const response = await fetch("/api/research-roadmap", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Store the raw markdown for display
    setRawMarkdown(data.roadmap)

    // Process the roadmap markdown to extract stages and tasks
    const processedData = processRoadmapMarkdown(data.roadmap)
    setResearchStages(processedData.stages)

    // Process references from the response
    const processedReferences = processReferences(data.references, data.keywords)
    setReferences(processedReferences)

    setRoadmapGenerated(true)
  } catch (error) {
    console.error("Error generating roadmap:", error)
    setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
  } finally {
    setIsGeneratingMap(false)
  }
}

  const processRoadmapMarkdown = (markdown: string): { stages: ResearchStage[] } => {
    const stages: ResearchStage[] = []

    // Extract stages using regex
    const stageRegex = /\*\*Stage (\d+): (.*?)\*\*([\s\S]*?)(?=\*\*Stage \d+:|$)/g
    let stageMatch

    while ((stageMatch = stageRegex.exec(markdown)) !== null) {
      const stageNumber = stageMatch[1]
      const stageTitle = stageMatch[2].trim()
      const stageContent = stageMatch[3].trim()

      // Extract description
      const descriptionMatch = stageContent.match(/\*Description:\*([\s\S]*?)(?=\*\*Task|$)/)
      const description = descriptionMatch ? descriptionMatch[1].trim() : ""

      // Extract tasks
      const tasks: ResearchTask[] = []
      const taskRegex = /\*\*Task (\d+\.\d+): (.*?)\*\*([\s\S]*?)(?=\*\*Task \d+\.\d+:|$)/g
      let taskMatch

      while ((taskMatch = taskRegex.exec(stageContent)) !== null) {
        const taskId = taskMatch[1]
        const taskTitle = taskMatch[2].trim()
        const taskContent = taskMatch[3].trim()

        // Extract guidance, background, and methodology
        const guidanceMatch = taskContent.match(/\*Guidance:\*([\s\S]*?)(?=\*Background:|\*Methodology:|$)/)
        const backgroundMatch = taskContent.match(/\*Background:\*([\s\S]*?)(?=\*Guidance:|\*Methodology:|$)/)
        const methodologyMatch = taskContent.match(/\*Methodology:\*([\s\S]*?)(?=\*Guidance:|\*Background:|$)/)

        const guidance = guidanceMatch ? guidanceMatch[1].trim() : ""
        const background = backgroundMatch ? backgroundMatch[1].trim() : ""
        const methodology = methodologyMatch ? methodologyMatch[1].trim() : ""

        tasks.push({
          id: `task-${taskId.replace(".", "-")}`,
          title: taskTitle,
          guidance,
          background,
          methodology,
          expanded: false,
        })
      }

      stages.push({
        id: `stage-${stageNumber}`,
        title: `Stage ${stageNumber}: ${stageTitle}`,
        description,
        tasks,
      })
    }

    return { stages }
  }

  const processReferences = (referencesText: string, keywords: string[]): ResearchReference[] => {
    const references: ResearchReference[] = []

    // Extract references using regex
    const referenceRegex =
      /REFERENCE (\d+): (.*?)\nTitle: (.*?)\nSource Link: (.*?)(?:\nAvailable Resources:([\s\S]*?))?(?:\nSummary:|$)/g
    let referenceMatch
    let index = 0

    while ((referenceMatch = referenceRegex.exec(referencesText)) !== null) {
      const refNumber = referenceMatch[1]
      const keyword = referenceMatch[2].trim()
      const title = referenceMatch[3].trim()
      const url = referenceMatch[4].trim()
      const resourcesText = referenceMatch[5] || ""

      // Extract resources
      const resources: { type: string; title: string; link: string }[] = []
      const resourceRegex = /- (.*?) from (.*?): (.*?)$/gm
      let resourceMatch

      while ((resourceMatch = resourceRegex.exec(resourcesText)) !== null) {
        resources.push({
          type: resourceMatch[1].trim(),
          title: resourceMatch[2].trim(),
          link: resourceMatch[3].trim(),
        })
      }

      references.push({
        id: `ref-${refNumber}`,
        title: `${title} (${keyword})`,
        url,
        resources,
      })

      index++
    }

    // If no references were extracted but we have keywords, create placeholder references
    if (references.length === 0 && keywords.length > 0) {
      keywords.forEach((keyword, index) => {
        references.push({
          id: `ref-${index + 1}`,
          title: `Research on ${keyword}`,
          url: "#",
        })
      })
    }

    return references
  }

  const toggleTaskDetails = (stageId: string, taskId: string) => {
    setResearchStages((stages) =>
      stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              tasks: stage.tasks.map((task) => (task.id === taskId ? { ...task, expanded: !task.expanded } : task)),
            }
          : stage,
      ),
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-blue-600/40 dark:from-blue-600/30 dark:to-blue-800/30 rounded-xl" />
        <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

        <CardHeader className="text-white relative z-10">
          <CardTitle className="text-2xl">AI Research Roadmap Generator</CardTitle>
          <CardDescription className="text-blue-100 dark:text-blue-200">
            Generate a comprehensive research roadmap for your AI project
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">Research Topic</label>
              <Input
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                placeholder="e.g., AI in Food industry"
                className="bg-white/80 border-none focus-visible:ring-blue-500 text-gray-800 placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Your Goal</label>
              <Textarea
                value={researchGoal}
                onChange={(e) => setResearchGoal(e.target.value)}
                placeholder="e.g., goal to solve the issue of bad food"
                className="bg-white/80 border-none focus-visible:ring-blue-500 text-gray-800 placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Your Current Knowledge Level</label>
              <Select value={knowledgeLevel} onValueChange={setKnowledgeLevel}>
                <SelectTrigger className="bg-white/80 border-none focus:ring-blue-500 text-gray-800">
                  <SelectValue placeholder="Select your knowledge level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleGenerateRoadmap}
                disabled={!researchTopic.trim() || !researchGoal.trim() || isGeneratingMap}
                className="bg-white text-blue-700 hover:bg-blue-50 disabled:bg-white/50 disabled:text-blue-700/50"
                size="lg"
              >
                {isGeneratingMap ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>Generate Roadmap</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {roadmapGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 rounded-xl" />

            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl">Your Research Roadmap</CardTitle>
              <CardDescription>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <div>
                    <span className="font-medium dark:text-blue-300 text-blue-600">Research Topic:</span>{" "}
                    <span className="dark:text-gray-300">{researchTopic}</span>
                  </div>
                  <div className="hidden sm:block dark:text-gray-500 text-gray-400">•</div>
                  <div>
                    <span className="font-medium dark:text-blue-300 text-blue-600">Goal:</span>{" "}
                    <span className="dark:text-gray-300">{researchGoal}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 relative z-10">
              {researchStages.length > 0 ? (
                researchStages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <ArrowDown className="h-6 w-6 text-blue-500" />
                      </div>
                    )}

                    <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-b border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold dark:text-white">{stage.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{stage.description}</p>
                      </div>

                      <div className="p-4">
                        <div className="space-y-4">
                          {stage.tasks.map((task) => (
                            <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-md">
                              <div
                                className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => toggleTaskDetails(stage.id, task.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <ListTodo className="h-5 w-5 text-blue-500" />
                                  <span className="font-medium">{task.title}</span>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-5 w-5 text-gray-500 transition-transform",
                                    task.expanded && "transform rotate-180",
                                  )}
                                />
                              </div>

                              {task.expanded && (
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                  {task.guidance && (
                                    <div className="mb-4">
                                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Guidance:</h4>
                                      <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>{task.guidance}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}

                                  {task.background && (
                                    <div className="mb-4">
                                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Background:</h4>
                                      <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>{task.background}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}

                                  {task.methodology && (
                                    <div>
                                      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                        Methodology:
                                      </h4>
                                      <div className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
                                        <ReactMarkdown>{task.methodology}</ReactMarkdown>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-blue-500/50 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 text-lg">No roadmap data available</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    There was an issue processing the roadmap. Please try again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 rounded-xl" />

            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl">Research References</CardTitle>
              <CardDescription>Relevant sources to support your research journey</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                {references.length > 0 ? (
                  references.map((reference) => (
                    <div
                      key={reference.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium dark:text-gray-200">{reference.title}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          asChild
                          disabled={reference.url === "#"}
                        >
                          <a
                            href={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={reference.url === "#" ? "pointer-events-none" : ""}
                          >
                            <span>View Source</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>

                      {reference.resources && reference.resources.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Resources:
                          </h4>
                          <ul className="space-y-2">
                            {reference.resources.map((resource, idx) => (
                              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{resource.type}</span> from {resource.title}:{" "}
                                <a
                                  href={resource.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Resource
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-blue-500/50 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg">No references available</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      References will be displayed here when available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
