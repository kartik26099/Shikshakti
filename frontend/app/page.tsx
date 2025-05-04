"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, BookOpen, Brain, Briefcase, GraduationCap, LineChart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import FeatureCard from "@/components/feature-card"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("hero")
  const { mousePosition } = useMouse()

  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  // Parallax effects
  const heroParallax = useTransform(scrollYProgress, [0, 1], [0, -300])
  const featureParallax = useTransform(scrollYProgress, [0.2, 0.8], [0, -150])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Determine active section based on scroll position
      const heroRect = heroRef.current?.getBoundingClientRect()
      const featuresRect = featuresRef.current?.getBoundingClientRect()
      const ctaRect = ctaRef.current?.getBoundingClientRect()

      if (heroRect && heroRect.bottom > 0) {
        setActiveSection("hero")
      } else if (featuresRect && featuresRect.bottom > 0) {
        setActiveSection("features")
      } else if (ctaRect && ctaRect.bottom > 0) {
        setActiveSection("cta")
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      title: "AI Course Bot",
      description: "Recommends personalized courses to users based on their goals and learning preferences.",
      icon: <BookOpen className="h-10 w-10" />,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "AI Advisor",
      description:
        "Career guidance system for users stuck in their professional journey, offering personalized advice.",
      icon: <LineChart className="h-10 w-10" />,
      color: "from-purple-500 to-indigo-400",
    },
    {
      title: "AI Faculty",
      description: "Reviews user projects, conducts quizzes, and provides detailed feedback to enhance learning.",
      icon: <GraduationCap className="h-10 w-10" />,
      color: "from-pink-500 to-rose-400",
    },
    {
      title: "AI Research Helper",
      description: "Suggests research topics, provides roadmaps, and supports researchers throughout their journey.",
      icon: <Brain className="h-10 w-10" />,
      color: "from-amber-500 to-yellow-400",
    },
    {
      title: "AI Placement Cell",
      description: "Assists users in finding jobs and internships based on their skills and career aspirations.",
      icon: <Briefcase className="h-10 w-10" />,
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "AI Library",
      description: "A rich repository of books, articles, and links organized by topic for easy access and learning.",
      icon: <Users className="h-10 w-10" />,
      color: "from-violet-500 to-purple-400",
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />
      <ScrollProgress />

      <main id="main-content" className="relative z-10">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center pt-20 pb-20 px-4 md:px-6 lg:px-8 overflow-hidden"
        >
          <motion.div style={{ y: heroParallax }} className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="space-y-8 z-10">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  <motion.div
                    className="absolute -left-10 -top-10 w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-70 dark:opacity-70"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0.4, 0.7],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  />
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold dark:text-white text-slate-900 leading-tight transition-colors duration-700">
                    Empowering Skill Development through AI
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="text-xl md:text-2xl dark:text-gray-300 text-slate-700 max-w-lg transition-colors duration-700"
                >
                  Transform your learning journey with our AI-powered platform that adapts to your unique needs and
                  helps you achieve your educational goals.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="flex flex-wrap gap-6"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 focus-visible"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-purple-500/50 dark:text-white text-slate-900 rounded-full px-8 py-6 text-lg hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 focus-visible"
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="relative z-10"
              >
                <div className="relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-70 blur-xl"
                    animate={{
                      background: [
                        "linear-gradient(to right, rgba(168, 85, 247, 0.7), rgba(236, 72, 153, 0.7))",
                        "linear-gradient(to right, rgba(79, 70, 229, 0.7), rgba(168, 85, 247, 0.7))",
                        "linear-gradient(to right, rgba(168, 85, 247, 0.7), rgba(236, 72, 153, 0.7))",
                      ],
                    }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                  />

                  <motion.div
                    className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <img src="/hero-image.png" alt="AI-powered education" className="w-full rounded-2xl" />

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-white text-lg font-medium">Experience the future of learning</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  className="absolute -right-12 -bottom-12 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 blur-xl opacity-70"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.4, 0.7],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center dark:text-white text-slate-900 transition-colors duration-700"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <p className="text-sm mb-2">Scroll to explore</p>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 5V19M12 19L5 12M12 19L19 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
          <motion.div style={{ y: featureParallax }} className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16 relative"
            >
              <motion.div
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 blur-3xl opacity-20 dark:opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.15, 0.2],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              <h2 className="text-4xl md:text-5xl font-bold dark:text-white text-slate-900 mb-6 relative z-10 transition-colors duration-700">
                Our Intelligent Features
              </h2>
              <p className="text-xl dark:text-gray-300 text-slate-700 max-w-2xl mx-auto relative z-10 transition-colors duration-700">
                Discover how our AI-powered tools can revolutionize your learning experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="relative py-20 px-4 md:px-6 lg:px-8 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 rounded-3xl"
                whileHover={{
                  background: [
                    "linear-gradient(to right, rgba(147, 51, 234, 0.9), rgba(79, 70, 229, 0.9))",
                    "linear-gradient(to right, rgba(79, 70, 229, 0.9), rgba(147, 51, 234, 0.9))",
                  ],
                  transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
                }}
              />

              <motion.div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
                }}
                animate={{
                  background: [
                    "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 70% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                    "radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
                  ],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              <div className="relative rounded-3xl p-10 md:p-16 text-white text-center z-10">
                <motion.h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Ready to Transform Your Learning Journey?
                </motion.h2>

                <motion.p
                  className="text-xl mb-10 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Join thousands of learners who have already enhanced their skills with ShikshaShakti.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-gray-100 rounded-full px-10 py-6 text-lg font-medium shadow-xl shadow-purple-800/20 transition-all duration-300 focus-visible"
                  >
                    Explore Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                <motion.div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500 blur-3xl opacity-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.15, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />

                <motion.div
                  className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500 blur-3xl opacity-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.15, 0.2],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: 1,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
