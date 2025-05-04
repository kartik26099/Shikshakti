"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Loader2, RefreshCw, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewsItem {
  title: string
  link: string
  summary: string
  published: string
  category: string
  date_collected: string
}

export default function ResearchNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newsCategory, setNewsCategory] = useState("all")
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchNewsData()
  }, [])

  const fetchNewsData = async () => {
    try {
      setIsLoadingNews(true)
      setError(null)
      
      console.log("Fetching news data from API route")
      
      // Fetch news data from our Next.js API route
      const response = await fetch("/api/research-news", {
        cache: "no-store", // Don't cache the response
        next: { revalidate: 60 } // Revalidate the data at most once per minute
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || response.statusText
        throw new Error(`Failed to fetch news: ${errorMessage}`)
      }
      
      const data: NewsItem[] = await response.json()
      console.log("Received news data:", data.length, "items")
      
      // Handle empty data
      if (data.length === 0) {
        console.warn("Received empty news data array")
      }
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((item) => item.category)))

      setNewsItems(data)
      setCategories(uniqueCategories)
      setLastUpdated(new Date().toLocaleString())
      setIsLoadingNews(false)
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoadingNews(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchNewsData()
    setIsRefreshing(false)
  }

  const filteredNews =
    newsCategory === "all"
      ? newsItems
      : newsItems.filter((item) => item.category.toLowerCase() === newsCategory.toLowerCase())

  return (
    <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/40 to-amber-600/40 dark:from-amber-500/30 dark:to-amber-700/30 rounded-xl" />
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

      <CardHeader className="text-white relative z-10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">Research News</CardTitle>
            <CardDescription className="text-amber-100 dark:text-amber-200">
              Latest scientific research and discoveries
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingNews}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {lastUpdated && (
          <div className="flex items-center text-xs text-amber-100/80 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            Last updated: {lastUpdated}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge
            className={cn(
              "cursor-pointer hover:bg-white/30 transition-colors",
              newsCategory === "all" ? "bg-white/80 text-amber-700" : "bg-white/20 text-white",
            )}
            onClick={() => setNewsCategory("all")}
          >
            All
          </Badge>

          {categories.map((category) => (
            <Badge
              key={category}
              className={cn(
                "cursor-pointer hover:bg-white/30 transition-colors",
                newsCategory === category.toLowerCase() ? "bg-white/80 text-amber-700" : "bg-white/20 text-white",
              )}
              onClick={() => setNewsCategory(category.toLowerCase())}
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {isLoadingNews ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
            <p className="text-white mt-4">Loading latest research news...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-md">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <p className="mt-2">
                <Button variant="outline" size="sm" onClick={fetchNewsData}>
                  Try Again
                </Button>
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {filteredNews.length > 0 ? (
                filteredNews.map((item, index) => (
                  <motion.div
                    key={`${item.title}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="backdrop-blur-md rounded-lg overflow-hidden shadow-md relative"
                  >
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 rounded-lg" />
                    <div className="p-5 relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h3>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 ml-2 flex-shrink-0">
                          {item.category}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{item.published}</span>
                      </div>

                      <div className="text-gray-600 dark:text-gray-300 mb-4">
                        {/* Properly render HTML content from RSS feed */}
                        <div dangerouslySetInnerHTML={{ __html: item.summary }} />
                      </div>

                      <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <span>Read Full Article</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white text-lg">No news found in this category</p>
                  <p className="text-white/70 mt-2">Try selecting a different category</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}