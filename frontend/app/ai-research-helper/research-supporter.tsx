"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ExternalLink, BookOpen, FileText, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  references?: ScholarReference[]
  isLoading?: boolean
}

interface ScholarReference {
  query: string
  title: string
  title_link: string
  displayed_link: string
  author_publication_info: string
  resources: {
    type: string
    title: string
    link: string
  }[]
}

export default function ResearchSupporter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your research assistant. Ask me about any research topic, and I'll find scholarly references to help answer your questions.",
      sender: "bot",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        sender: "user",
      }

      // Add user message to chat
      setMessages((prev) => [...prev, userMessage])

      // Add loading message
      const loadingMessageId = (Date.now() + 1).toString()
      setMessages((prev) => [
        ...prev,
        {
          id: loadingMessageId,
          content: "Searching for scholarly information...",
          sender: "bot",
          isLoading: true,
        },
      ])

      setInputMessage("")
      setIsLoading(true)

      try {
        // Call the API route
        const response = await fetch("/api/research-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: userMessage.content }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response from the server")
        }

        const data = await response.json()

        // Remove loading message
        setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId))

        // Add bot response with references if available
        const botMessage: Message = {
          id: Date.now().toString(),
          content: data.response,
          sender: "bot",
          references: data.is_simple_response ? [] : data.references,
        }

        setMessages((prev) => [...prev, botMessage])
      } catch (error) {
        console.error("Error fetching response:", error)

        // Remove loading message
        setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId))

        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: "Sorry, I encountered an error while processing your request. Please try again.",
            sender: "bot",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/40 to-indigo-600/40 dark:from-indigo-600/30 dark:to-indigo-800/30 rounded-xl" />
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

      <CardContent className="p-0 relative z-10">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "flex items-start max-w-[85%]",
                    message.sender === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold",
                      message.sender === "user" ? "ml-2 bg-gray-300 text-gray-700" : "mr-2 bg-indigo-700",
                      "mt-1",
                    )}
                  >
                    {message.sender === "user" ? "U" : "B"}
                  </div>

                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        message.sender === "user"
                          ? "bg-white text-gray-800"
                          : message.isLoading
                            ? "bg-indigo-50 text-gray-600"
                            : "bg-indigo-100 text-gray-800",
                      )}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <p>{message.content}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{message.content}</p>
                      )}
                    </div>

                    {message.references && message.references.length > 0 && (
                      <div className="mt-2">
                        <Tabs defaultValue="references" className="w-full">
                          <TabsList className="bg-white/50 dark:bg-slate-800/50">
                            <TabsTrigger value="references">References ({message.references.length})</TabsTrigger>
                            <TabsTrigger value="keywords">Keywords</TabsTrigger>
                          </TabsList>

                          <TabsContent value="references" className="mt-2">
                            <ScrollArea className="h-[200px] rounded-md border p-2 bg-white/70 dark:bg-slate-800/70">
                              <div className="space-y-4 pr-3">
                                {message.references.map((ref, index) => (
                                  <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                      <Badge variant="outline" className="mb-2">
                                        {ref.query}
                                      </Badge>
                                      <a
                                        href={ref.title_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                    <h4 className="font-medium text-sm">{ref.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{ref.author_publication_info}</p>

                                    {ref.resources && ref.resources.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {ref.resources.map((resource, idx) => (
                                          <a
                                            key={idx}
                                            href={resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                          >
                                            {resource.type === "PDF" ? (
                                              <FileText className="h-3 w-3 mr-1" />
                                            ) : resource.type === "Download" ? (
                                              <Download className="h-3 w-3 mr-1" />
                                            ) : (
                                              <BookOpen className="h-3 w-3 mr-1" />
                                            )}
                                            {resource.title}
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="keywords" className="mt-2">
                            <div className="bg-white/70 dark:bg-slate-800/70 p-3 rounded-md border">
                              <div className="flex flex-wrap gap-2">
                                {message.references.map((ref, index) => (
                                  <Badge key={index} variant="secondary">
                                    {ref.query}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-indigo-500/30 bg-white/10">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about research topics, methodologies, or references..."
                className="bg-white/80 border-none focus-visible:ring-indigo-500 text-gray-800 placeholder:text-gray-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-white text-indigo-600 hover:bg-indigo-100"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}