"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, MapPin, Newspaper } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import ResearchMapGenerator from "./research-map-generator"
import ResearchSupporter from "./research-supporter"
import ResearchNews from "./research-news"

export default function AIResearchHelperPage() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState("research-supporter")

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
              AI Research Helper
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Accelerate your research journey with AI-powered tools and insights
            </p>
          </motion.div>

          <Tabs defaultValue="research-supporter" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="research-supporter" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Research Supporter</span>
                <span className="sm:hidden">Supporter</span>
              </TabsTrigger>
              <TabsTrigger value="research-map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Research Map Generator</span>
                <span className="sm:hidden">Map</span>
              </TabsTrigger>
              <TabsTrigger value="research-news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">Research News</span>
                <span className="sm:hidden">News</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="research-supporter" className="mt-0">
              <ResearchSupporter />
            </TabsContent>

            <TabsContent value="research-map" className="mt-0">
              <ResearchMapGenerator />
            </TabsContent>

            <TabsContent value="research-news" className="mt-0">
              <ResearchNews />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
