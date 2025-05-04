"use client"

import  React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Send, ArrowLeft, ArrowRight, FileText, Check, Trash2, BookOpen, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
}

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
}

interface UploadedDocument {
  id: string
  name: string
  size: string
  type: string
  uploadedAt: Date
}

const BACKEND_URL = "http://localhost:8000"

export default function AIFacultyPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("faculty")
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizGenerated, setQuizGenerated] = useState(false)
  const [quizActive, setQuizActive] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI Faculty assistant. Upload a document to get started!",
      sender: "bot",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizData, setQuizData] = useState<any[]>([])
  const [quizScore, setQuizScore] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch uploaded documents from backend on mount
    fetchDocuments()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/documents`)
      if (!res.ok) throw new Error("Failed to fetch documents")
      const docs = await res.json()
      setUploadedDocuments(
        docs.map((doc: any) => ({
          id: doc.id.toString(),
          name: doc.title,
          size: "Unknown",
          type: "",
          uploadedAt: new Date(),
        }))
      )
    } catch (err) {
      handleBotResponse("Could not fetch uploaded documents from server.")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsUploading(true)
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()
          formData.append("file", file)
          formData.append("title", file.name)
          const res = await fetch(`${BACKEND_URL}/upload-document`, {
            method: "POST",
            body: formData,
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.detail || "Upload failed")
          }
        }
        await fetchDocuments()
        handleBotResponse(
          `I've processed your ${files.length > 1 ? "documents" : "document"}. You can now generate a quiz or ask me questions about the content!`
        )
      } catch (err: any) {
        handleBotResponse("Failed to upload document(s): " + (err?.message || "Unknown error"))
      }
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteDocument = async (id: string) => {
    // Optional: implement a backend endpoint to delete documents and call it here.
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (uploadedDocuments.length === 1) {
      setQuizGenerated(false)
      setQuizSubmitted(false)
      handleBotResponse("You've removed all documents. Please upload at least one document to continue.")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      if (uploadedDocuments.length === 0) {
        handleBotResponse("Please upload at least one document first before we can chat about it.")
        setInputMessage("")
        return
      }
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
      }
      setMessages((prev) => [...prev, newMessage])
      setInputMessage("")
      try {
        // Adjusted to match the expected backend format
        const res = await fetch(`${BACKEND_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: inputMessage,
            conversation_history: messages.map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || "Chat error")
        }
        const data = await res.json()
        handleBotResponse(data.response)
      } catch (err: any) {
        handleBotResponse("Chat error: " + (err?.message || "Unknown error"))
      }
    }
  }

  const handleBotResponse = (content: string) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "bot",
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const handleGenerateQuiz = async () => {
    if (uploadedDocuments.length === 0) {
      handleBotResponse("Please upload at least one document first before generating a quiz.")
      return
    }
    setIsGeneratingQuiz(true)
    setCurrentQuestion(0)
    setSelectedOption(null)
    setUserAnswers([])
    setQuizSubmitted(false)
    try {
      const res = await fetch(`${BACKEND_URL}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_id: uploadedDocuments[0].id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || "Quiz generation failed")
      }
      const data = await res.json()
      setQuizData(data.quiz)
      setQuestions(
        data.quiz.map((q: any, idx: number) => ({
          id: idx + 1,
          text: q.question,
          options: q.options,
          correctAnswer: q.correct_index,
        }))
      )
      setQuizGenerated(true)
      setQuizActive(true)
      handleBotResponse("I've generated a quiz based on your documents. Good luck!")
    } catch (err: any) {
      handleBotResponse("Failed to generate quiz: " + (err?.message || "Unknown error"))
    }
    setIsGeneratingQuiz(false)
  }

  const handleNextQuestion = async () => {
    if (selectedOption !== null) {
      const newAnswers = [...userAnswers]
      newAnswers[currentQuestion] = selectedOption
      setUserAnswers(newAnswers)
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        setQuizSubmitted(true)
        setQuizActive(false)
        // Evaluate quiz via backend
        try {
          const answers: Record<number, number> = {}
          newAnswers.forEach((ans, idx) => {
            if (ans !== null) answers[idx] = ans
          })
          const res = await fetch(`${BACKEND_URL}/evaluate-quiz`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quiz: quizData,
              answers,
            }),
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.detail || "Quiz evaluation failed")
          }
          const data = await res.json()
          setQuizScore(data.score)
          handleBotResponse(
            `You've completed the quiz! Your score: ${data.score}/${data.total}. Would you like me to explain any of the questions?`
          )
        } catch (err: any) {
          handleBotResponse("Failed to evaluate quiz: " + (err?.message || "Unknown error"))
        }
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedOption(userAnswers[currentQuestion - 1])
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setUserAnswers([])
    setQuizSubmitted(false)
    setQuizActive(true)
  }

  const exitQuiz = () => {
    setQuizGenerated(false)
    setQuizSubmitted(false)
    setQuizActive(false)
    setQuestions([])
    setQuizData([])
    setQuizScore(0)
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
              AI Faculty
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Upload documents, take quizzes, and get assistance from our AI Faculty assistant
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quiz Section (Purple) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-purple-400/90 to-purple-600/90 dark:from-purple-700/90 dark:to-purple-900/90 backdrop-blur-sm relative">
                <div className="absolute inset-0 rounded-xl border-4 border-white/20 pointer-events-none"></div>
                <div className="absolute inset-0 rounded-xl border border-white/40 pointer-events-none"></div>

                <CardContent className="p-8">
                  {!quizGenerated ? (
                    <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
                      <div className="text-center">
                        <BookOpen className="h-16 w-16 text-white/80 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Ready for a Quiz?</h2>
                        <p className="text-purple-100 mb-6 max-w-md">
                          Upload at least one document and click the button below to generate a quiz based on your
                          content.
                        </p>
                      </div>
                      <Button
                        onClick={handleGenerateQuiz}
                        disabled={uploadedDocuments.length === 0 || isGeneratingQuiz}
                        className="bg-white text-purple-700 hover:bg-purple-50 disabled:bg-white/50 disabled:text-purple-700/50"
                        size="lg"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-purple-700 border-t-transparent"></div>
                            Generating Quiz...
                          </>
                        ) : (
                          <>Generate Quiz</>
                        )}
                      </Button>
                      {uploadedDocuments.length === 0 && (
                        <p className="text-purple-100 text-sm">Please upload at least one document first.</p>
                      )}
                    </div>
                  ) : quizSubmitted ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                          <Check className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Quiz Completed!</h2>
                        <p className="text-purple-100 mb-6">
                          You scored {quizScore}/{questions.length}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <div key={question.id} className="bg-white/10 rounded-lg p-4 text-white">
                            <p className="font-medium mb-2">
                              Question {index + 1}: {question.text}
                            </p>
                            <p className="text-sm">
                              Your answer: {question.options[userAnswers[index] || 0]}
                              {userAnswers[index] === question.correctAnswer ? (
                                <span className="ml-2 text-green-300">✓ Correct</span>
                              ) : (
                                <span className="ml-2 text-red-300">✗ Incorrect</span>
                              )}
                            </p>
                            {userAnswers[index] !== question.correctAnswer && (
                              <p className="text-sm text-green-300 mt-1">
                                Correct answer: {question.options[question.correctAnswer]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-6 space-x-4">
                        <Button onClick={resetQuiz} className="bg-white text-purple-700 hover:bg-purple-50">
                          Retake Quiz
                        </Button>
                        <Button onClick={exitQuiz} className="bg-white/20 text-white hover:bg-white/30">
                          New Quiz
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg p-6 shadow-inner">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                          Question {currentQuestion + 1} of {questions.length}
                        </h2>
                        <p className="text-gray-700 text-lg">{questions[currentQuestion]?.text}</p>
                      </div>
                      <RadioGroup
                        value={selectedOption?.toString()}
                        onValueChange={(value) => setSelectedOption(Number.parseInt(value))}
                        className="space-y-4"
                      >
                        {questions[currentQuestion]?.options.map((option, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center rounded-lg p-4 cursor-pointer transition-all",
                              selectedOption === index
                                ? "bg-purple-600 text-white shadow-lg transform scale-[1.02]"
                                : "bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700",
                            )}
                            onClick={() => setSelectedOption(index)}
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              className={selectedOption === index ? "text-white" : "text-purple-600"}
                            />

                            <Label
                              htmlFor={`option-${index}`}
                              className={cn(
                                "ml-3 font-medium cursor-pointer flex-grow",
                                selectedOption === index ? "text-white" : "text-gray-700",
                              )}
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <div className="flex justify-between pt-4">
                        <Button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestion === 0}
                          className="bg-white/80 text-purple-700 hover:bg-white"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextQuestion}
                          disabled={selectedOption === null}
                          className="bg-white/80 text-purple-700 hover:bg-white"
                        >
                          {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
                          {currentQuestion === questions.length - 1 ? (
                            <Check className="ml-2 h-4 w-4" />
                          ) : (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Document Upload Section (Blue) */}
              <div className="relative">
                {quizActive && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center">
                    <Lock className="h-12 w-12 text-white mb-2" />
                    <p className="text-white font-medium text-center px-6">
                      Document upload is locked while quiz is in progress
                    </p>
                  </div>
                )}
                <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-400/90 to-blue-600/90 dark:from-blue-600/90 dark:to-blue-800/90 backdrop-blur-sm relative">
                  <div className="absolute inset-0 rounded-xl border-4 border-white/20 pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-xl border border-white/40 pointer-events-none"></div>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        disabled={quizActive}
                      />
                      <div
                        onClick={quizActive ? undefined : triggerFileInput}
                        className={cn(
                          "space-y-4 border-2 border-dashed border-white/40 rounded-xl p-6 transition-all",
                          !quizActive && "cursor-pointer hover:bg-blue-500/50",
                        )}
                      >
                        {isUploading ? (
                          <div className="space-y-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-white mx-auto"></div>
                            <p className="text-white font-medium">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Upload Documents</h3>
                            <p className="text-blue-100 text-sm">
                              Drag and drop or click to upload PDF, DOCX, or TXT files
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Document List */}
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-white font-medium mb-2">Uploaded Documents ({uploadedDocuments.length})</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {uploadedDocuments.map((doc, index) => (
                            <div 
                              key={`${doc.id || doc.name}-${index}`}
                              className="flex items-center justify-between bg-white/10 rounded-lg p-3 text-white"
                            >
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                                <div className="truncate">
                                  <p className="font-medium truncate max-w-[150px]">{doc.name}</p>
                                  <p className="text-xs text-blue-100">{doc.size}</p>
                                </div>
                              </div>
                              {!quizActive && (
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                                  aria-label="Delete document"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Bot Section (Yellow/Amber) */}
              <div className="relative">
                {quizActive && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl z-10 flex flex-col items-center justify-center">
                    <Lock className="h-12 w-12 text-white mb-2" />
                    <p className="text-white font-medium text-center px-6">Chat is locked while quiz is in progress</p>
                  </div>
                )}
                <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-amber-400/90 to-amber-600/90 dark:from-amber-500/90 dark:to-amber-700/90 backdrop-blur-sm relative">
                  <div className="absolute inset-0 rounded-xl border-4 border-white/20 pointer-events-none"></div>
                  <div className="absolute inset-0 rounded-xl border border-white/40 pointer-events-none"></div>
                  <CardContent className="p-0">
                    <div className="flex flex-col h-[400px]">
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="message-container">
                            <div
                              className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2",
                                message.sender === "user" ? "bg-white text-gray-800" : "bg-white/80 text-gray-800",
                              )}
                            >
                              <p>{message.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-4 border-t border-amber-500/30">
                        <div className="flex space-x-2">
                          <Input
                            ref={chatInputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && !quizActive && handleSendMessage()}
                            placeholder="Ask about your document or quiz..."
                            className="bg-white/80 border-none focus-visible:ring-amber-500 text-gray-800 placeholder:text-gray-500"
                            disabled={uploadedDocuments.length === 0 || quizActive}
                          />
                          <Button
                            onClick={handleSendMessage}
                            className="bg-white text-amber-600 hover:bg-amber-100"
                            disabled={uploadedDocuments.length === 0 || quizActive}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                        {uploadedDocuments.length === 0 && !quizActive && (
                          <p className="text-amber-800 text-xs mt-2">
                            Please upload at least one document to start chatting.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}