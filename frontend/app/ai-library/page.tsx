"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, FileText, Youtube, ExternalLink, Loader2, BookOpen, Clock, Eye } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"

interface ScholarResult {
  title: string
  title_link: string
  displayed_link: string
  author_publication_info: string
  snippet: string
  resources?: {
    type: string
    title: string
    link: string
  }[]
}

interface YoutubeResult {
  title: string
  link: string
  thumbnail: string
  channel: string
  views: string
  published_date: string
  length: string
  description: string
}

interface SearchResults {
  scholar: ScholarResult[]
  youtube: YoutubeResult[]
}

export default function AILibraryPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchResults, setSearchResults] = useState<SearchResults>({
    scholar: [],
    youtube: [],
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      // Call the backend API
      const response = await fetch(`/api/library-search?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`)
      }

      const data: SearchResults = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSearching(false)
    }
  }

  // Calculate total results count
  const totalResults = searchResults.scholar.length + searchResults.youtube.length

  // Filter results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case "papers":
        return { scholar: searchResults.scholar, youtube: [] }
      case "videos":
        return { scholar: [], youtube: searchResults.youtube }
      default:
        return searchResults
    }
  }

  const filteredResults = getFilteredResults()

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
              AI Library
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Discover research papers and educational videos on artificial intelligence
            </p>
          </motion.div>

          <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-purple-600/40 dark:from-purple-600/30 dark:to-purple-800/30 rounded-xl" />
            <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

            <CardContent className="p-6 relative z-10">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for AI research papers and videos..."
                  className="bg-white/80 border-none focus-visible:ring-purple-500 text-gray-800 placeholder:text-gray-500 flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-white text-purple-700 hover:bg-purple-50 disabled:bg-white/50 disabled:text-purple-700/50"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {hasSearched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 rounded-xl" />

                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl">Search Results</CardTitle>
                  <CardDescription>
                    {isSearching
                      ? "Searching..."
                      : error
                        ? `Error: ${error}`
                        : totalResults > 0
                          ? `Found ${totalResults} results for "${searchQuery}"`
                          : `No results found for "${searchQuery}"`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                      <p className="text-gray-600 dark:text-gray-300 text-lg mt-4">Searching for resources...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-md">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                        <p className="mt-2">
                          <Button variant="outline" size="sm" onClick={handleSearch}>
                            Try Again
                          </Button>
                        </p>
                      </div>
                    </div>
                  ) : totalResults > 0 ? (
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-6">
                        <TabsTrigger value="all" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          <span>All ({totalResults})</span>
                        </TabsTrigger>
                        <TabsTrigger value="papers" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Papers ({searchResults.scholar.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="videos" className="flex items-center gap-2">
                          <Youtube className="h-4 w-4" />
                          <span>Videos ({searchResults.youtube.length})</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="mt-0">
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-6">
                            {filteredResults.scholar.length > 0 && (
                              <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-800">
                                  Research Papers
                                </h3>
                                <div className="space-y-6">
                                  {filteredResults.scholar.map((result, index) => (
                                    <ScholarCard key={`scholar-${index}`} result={result} />
                                  ))}
                                </div>
                              </div>
                            )}

                            {filteredResults.youtube.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold mb-4 dark:text-white text-gray-800">
                                  Educational Videos
                                </h3>
                                <div className="space-y-6">
                                  {filteredResults.youtube.map((result, index) => (
                                    <YoutubeCard key={`youtube-${index}`} result={result} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="papers" className="mt-0">
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-6">
                            {filteredResults.scholar.map((result, index) => (
                              <ScholarCard key={`scholar-tab-${index}`} result={result} />
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="videos" className="mt-0">
                        <ScrollArea className="h-[600px] pr-4">
                          <div className="space-y-6">
                            {filteredResults.youtube.map((result, index) => (
                              <YoutubeCard key={`youtube-tab-${index}`} result={result} />
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-purple-500/50 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300 text-lg">No results found for "{searchQuery}"</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Try using different keywords or check your spelling
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface ScholarCardProps {
  result: ScholarResult
}

function ScholarCard({ result }: ScholarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold dark:text-white">
                {/* Remove HTML tags from title if present */}
                <span dangerouslySetInnerHTML={{ __html: result.title.replace(/<\/?[^>]+(>|$)/g, "") }} />
              </h3>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">Paper</Badge>
          </div>

          {result.author_publication_info && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span dangerouslySetInnerHTML={{ __html: result.author_publication_info }} />
            </p>
          )}

          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
            <span dangerouslySetInnerHTML={{ __html: result.snippet || "" }} />
          </p>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">{result.displayed_link}</span>

            <div className="flex gap-2">
              {result.resources && result.resources.length > 0 && (
                <div className="flex gap-2">
                  {result.resources.map((resource, idx) => (
                    <Button key={idx} variant="outline" size="sm" className="flex items-center gap-1" asChild>
                      <a href={resource.link} target="_blank" rel="noopener noreferrer">
                        <span>{resource.type}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              )}

              <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                <a href={result.title_link} target="_blank" rel="noopener noreferrer">
                  <span>View Paper</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface YoutubeCardProps {
  result: YoutubeResult
}

function YoutubeCard({ result }: YoutubeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {result.thumbnail && (
          <div className="md:w-[180px] w-full flex-shrink-0">
            <div className="relative">
              <img
                src={result.thumbnail || "/placeholder.svg?height=120&width=180&query=video"}
                alt={`Thumbnail for ${result.title}`}
                className="w-full md:w-[180px] h-auto rounded-md object-cover"
              />
              {result.length && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                  {result.length}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold dark:text-white">
                <span dangerouslySetInnerHTML={{ __html: result.title.replace(/<\/?[^>]+(>|$)/g, "") }} />
              </h3>
            </div>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Video</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-sm text-gray-600 dark:text-gray-300">
            <span>{result.channel}</span>

            {result.views && (
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span>{result.views}</span>
              </div>
            )}

            {result.published_date && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{result.published_date}</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {result.description || "No description available."}
          </p>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
              <a href={result.link} target="_blank" rel="noopener noreferrer">
                <span>Watch Video</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}