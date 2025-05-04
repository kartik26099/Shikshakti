"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Send, Upload, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import {
  getAdvisorResponse,
  uploadFile,
  getDocumentSegments,
  getDocumentMetadata,
  type ChatMessage as ApiChatMessage,
  type DocumentMetadata
} from "@/app/ai-advisor/api-client"

interface Message {
  id: string
  content: string
  sender: "user" | "advisor"
  timestamp: Date
  fileAttachment?: {
    name: string
    type: string
    size: string
  }
}

export default function AIAdvisorPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI Advisor. How can I help you with your learning journey today?",
      sender: "advisor",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [currentDocId, setCurrentDocId] = useState<string | undefined>()
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | undefined>()
  const [chatHistory, setChatHistory] = useState<ApiChatMessage[]>([
    { role: "advisor", content: "Hello! I'm your AI Advisor. How can I help you with your learning journey today?" }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const speechRecognitionRef = useRef<any>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize AudioContext
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.error("Web Audio API not supported:", error)
      }

      // Initialize Speech Recognition
      if ("webkitSpeechRecognition" in window) {
        // @ts-ignore - webkitSpeechRecognition is not in the types
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        speechRecognitionRef.current = new SpeechRecognition()
        speechRecognitionRef.current.continuous = true
        speechRecognitionRef.current.interimResults = true

        speechRecognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("")

          setInputMessage(transcript)
        }

        speechRecognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsRecording(false)
        }
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Stop speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Fetch document metadata when docId changes
  useEffect(() => {
    if (currentDocId) {
      fetchDocumentMetadata(currentDocId)
    }
  }, [currentDocId])

  const fetchDocumentMetadata = async (docId: string) => {
    try {
      const metadata = await getDocumentMetadata(docId)
      setDocumentMetadata(metadata)
    } catch (error) {
      console.error("Error fetching document metadata:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleRecording = async () => {
    if (isRecording) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }

      // Stop microphone stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }

      // If we have input after stopping recording, send the message
      if (inputMessage.trim()) {
        handleSendMessage()
      }

      setIsRecording(false)
    } else {
      try {
        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream

        // Start speech recognition
        if (speechRecognitionRef.current) {
          setInputMessage("")
          speechRecognitionRef.current.start()
          setIsRecording(true)
        }
      } catch (error) {
        console.error("Error accessing microphone:", error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
        timestamp: new Date(),
      }

      // Add message to state and update chat history
      setMessages((prev) => [...prev, newMessage])
      
      // Update chat history for API request
      const updatedHistory = [...chatHistory, { role: "user", content: inputMessage }]
      setChatHistory(updatedHistory)
      
      setInputMessage("")
      setIsGeneratingResponse(true)

      // Call API for response
      try {
        const result = await getAdvisorResponse(inputMessage, updatedHistory, sessionId)
        
        // Store or update session ID if provided
        if (result.session_id && !sessionId) {
          setSessionId(result.session_id)
        }
        
        // Check if there's a new document reference
        if (result.doc_id && result.doc_id !== currentDocId) {
          setCurrentDocId(result.doc_id)
        }
        
        const responseMessage: Message = {
          id: Date.now().toString(),
          content: result.response,
          sender: "advisor",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, responseMessage])
        
        // Update history with advisor response
        setChatHistory([...updatedHistory, { role: "advisor", content: result.response }])
        
        // Speak the response
        speakText(result.response)
      } catch (error) {
        console.error("Error getting advisor response:", error)
        
        // Show error message
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: "I'm having trouble connecting to my systems. Could you please try again?",
          sender: "advisor",
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsGeneratingResponse(false)
      }
    }
  }

  const speakText = (text: string) => {
    if (window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      // Get available voices and set a good one if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Google") || voice.name.includes("Female") || voice.name.includes("Samantha"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // Set up events to track speaking progress
      utterance.onstart = () => {
        setIsPlaying(true)
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error", event)
        setIsPlaying(false)
      }

      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setIsUploading(true)

      // Process each file
      for (const file of Array.from(files)) {
        // Create a message with the file attachment
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          content: `I've uploaded a file: ${file.name}`,
          sender: "user",
          timestamp: new Date(),
          fileAttachment: {
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size),
          },
        }

        setMessages((prev) => [...prev, newMessage])
        setChatHistory([...chatHistory, { role: "user", content: `I've uploaded a file: ${file.name}` }])
        
        setIsGeneratingResponse(true)

        try {
          // Upload file using the API
          const result = await uploadFile(file, sessionId)
          
          // Update session ID if provided
          if (result.session_id) {
            setSessionId(result.session_id)
          }
          
          // Store document ID if provided
          if (result.doc_id) {
            setCurrentDocId(result.doc_id)
          }
          
          const responseMessage: Message = {
            id: Date.now().toString() + Math.random(),
            content: result.response,
            sender: "advisor",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, responseMessage])
          setChatHistory([...chatHistory, { role: "advisor", content: result.response }])
          
          // Add system message about document if appropriate
          if (result.doc_id) {
            setChatHistory((prev) => [...prev, { 
              role: "system", 
              content: `DOCUMENT_REFERENCE: {"doc_id":"${result.doc_id}","document_type":"${result.document_type || 'general'}","file_name":"${file.name}"}`
            }])
          }
          
          // Speak the response
          speakText(result.response)
        } catch (error) {
          console.error("Error processing file:", error)
          
          const errorMessage: Message = {
            id: Date.now().toString() + Math.random(),
            content: `I had trouble analyzing your file "${file.name}". Please try again or upload a different file format.`,
            sender: "advisor",
            timestamp: new Date(),
          }
          
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsGeneratingResponse(false)
        }
      }

      setIsUploading(false)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Function to fetch specific document segments
  const fetchDocumentSegments = async (docId: string, segmentIndices: number[] = []) => {
    try {
      setIsGeneratingResponse(true)
      const result = await getDocumentSegments(docId, segmentIndices)
      
      // Add advisor message with the fetched content
      if (result.content) {
        const segments = segmentIndices.length > 0 
          ? `segments ${segmentIndices.map(i => i+1).join(', ')}`
          : 'content'
          
        const message: Message = {
          id: Date.now().toString(),
          content: `Here's the requested ${segments} from the document:\n\n${result.content}`,
          sender: "advisor",
          timestamp: new Date(),
        }
        
        setMessages((prev) => [...prev, message])
        setChatHistory((prev) => [...prev, { role: "advisor", content: message.content }])
      }
    } catch (error) {
      console.error("Error fetching document segments:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I had trouble retrieving that part of the document. Please try again.",
        sender: "advisor",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGeneratingResponse(false)
    }
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
              AI Advisor
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Your personal guide to creating customized learning paths
            </p>
          </motion.div>

          <div className="relative">
            {/* Main conversation area */}
            <div className="flex flex-col items-center">
              {/* Document info - show when a document is active */}
              {documentMetadata && (
                <div className="w-full max-w-4xl mb-4">
                  <div className="px-4 py-2 bg-white/10 dark:bg-slate-800/40 backdrop-blur-sm rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-purple-500" />
                      <div>
                        <p className="font-medium">{documentMetadata.file_name}</p>
                        <p className="text-xs opacity-70">
                          {documentMetadata.document_type} • {documentMetadata.segment_count} segments
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        className="text-xs" 
                        onClick={() => fetchDocumentSegments(currentDocId!)}
                        disabled={isGeneratingResponse}
                      >
                        View All
                      </Button>
                      {documentMetadata.segment_count > 0 && (
                        <Button 
                          variant="ghost" 
                          className="text-xs" 
                          onClick={() => fetchDocumentSegments(currentDocId!, [0])}
                          disabled={isGeneratingResponse}
                        >
                          First Page
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages container */}
              <div
                ref={messagesContainerRef}
                className="w-full max-w-4xl h-[500px] overflow-y-auto rounded-xl bg-black/10 backdrop-blur-sm p-6"
              >
                <div className="space-y-6">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.sender === "user"
                            ? "bg-purple-500/20 backdrop-blur-sm border border-purple-500/30"
                            : "bg-transparent border-0 text-white/90 dark:text-white/90"
                        } rounded-xl p-4 ${message.sender === "user" ? "text-slate-800 dark:text-white/90" : ""}`}
                      >
                        {message.fileAttachment && (
                          <div className="mb-3 p-3 bg-white/20 dark:bg-slate-800/40 rounded-lg flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-purple-500" />
                            <div>
                              <p className="font-medium">{message.fileAttachment.name}</p>
                              <p className="text-xs opacity-70">
                                {message.fileAttachment.size} • {message.fileAttachment.type}
                              </p>
                            </div>
                          </div>
                        )}
                        <p className="whitespace-pre-line">{message.content}</p>
                        <div className="mt-2 text-xs opacity-50 text-right">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Status indicator */}
              {(isPlaying || isGeneratingResponse || isUploading) && (
                <div className="mt-4 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-sm"
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
                    {isUploading 
                      ? "Uploading file..." 
                      : isPlaying 
                        ? "Speaking..." 
                        : "Generating response..."}
                  </motion.div>
                </div>
              )}

              {/* Input area */}
              <div className="mt-4 w-full max-w-4xl flex items-center space-x-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt,.pdf,.docx,.doc"
                  multiple 
                />

                <Button
                  onClick={triggerFileUpload}
                  variant="outline"
                  size="icon"
                  className="bg-white/20 dark:bg-slate-800/40 border-0 hover:bg-white/30 dark:hover:bg-slate-700/50"
                  disabled={isUploading || isGeneratingResponse}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isGeneratingResponse && handleSendMessage()}
                    placeholder="Ask about learning paths or upload materials..."
                    className="bg-white/20 dark:bg-slate-800/40 border-0 focus-visible:ring-purple-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-white"
                    disabled={isGeneratingResponse || isUploading}
                  />
                  {inputMessage && (
                    <button
                      onClick={() => setInputMessage("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      disabled={isGeneratingResponse}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Button
                  onClick={toggleRecording}
                  variant="outline"
                  size="icon"
                  className={`${
                    isRecording
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-600"
                      : "bg-white/20 dark:bg-slate-800/40 hover:bg-white/30 dark:hover:bg-slate-700/50"
                  } border-0`}
                  disabled={isGeneratingResponse || isUploading}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  disabled={!inputMessage.trim() || isGeneratingResponse || isUploading}
                >
                  {isGeneratingResponse ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}