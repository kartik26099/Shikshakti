"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface DynamicBackgroundProps {
  activeSection: string
  mousePosition: { x: number; y: number }
}

export default function DynamicBackground({ activeSection, mousePosition }: DynamicBackgroundProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Set initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Update window size on resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate normalized mouse position (0 to 1)
  const normalizedX = windowSize.width ? mousePosition.x / windowSize.width : 0
  const normalizedY = windowSize.height ? mousePosition.y / windowSize.height : 0

  // Background colors based on active section
  const getBgColors = () => {
    switch (activeSection) {
      case "hero":
        return {
          from: "from-indigo-50",
          via: "via-purple-50",
          to: "to-blue-50",
        }
      case "features":
        return {
          from: "from-blue-50",
          via: "via-indigo-50",
          to: "to-purple-50",
        }
      case "cta":
        return {
          from: "from-purple-50",
          via: "via-blue-50",
          to: "to-indigo-50",
        }
      default:
        return {
          from: "from-indigo-50",
          via: "via-purple-50",
          to: "to-blue-50",
        }
    }
  }

  const { from, via, to } = getBgColors()

  // Calculate gradient position based on mouse
  const gradientX = 50 + (normalizedX - 0.5) * 30 // Move 15% in each direction
  const gradientY = 50 + (normalizedY - 0.5) * 30 // Move 15% in each direction

  return (
    <motion.div
      className={`fixed inset-0 bg-gradient-to-br ${from} ${via} ${to} z-0`}
      animate={{
        backgroundPosition: `${gradientX}% ${gradientY}%`,
        backgroundSize: "200% 200%",
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated orbs that follow mouse */}
      <motion.div
        className="absolute rounded-full bg-purple-300/20 blur-3xl"
        animate={{
          x: mousePosition.x * 0.05,
          y: mousePosition.y * 0.05,
          width: "40vw",
          height: "40vw",
          opacity: 0.4,
        }}
        transition={{ duration: 1 }}
        style={{ left: "10%", top: "20%" }}
      />

      <motion.div
        className="absolute rounded-full bg-blue-300/20 blur-3xl"
        animate={{
          x: mousePosition.x * -0.03,
          y: mousePosition.y * -0.03,
          width: "30vw",
          height: "30vw",
          opacity: 0.3,
        }}
        transition={{ duration: 1.2 }}
        style={{ right: "15%", top: "30%" }}
      />

      <motion.div
        className="absolute rounded-full bg-indigo-300/20 blur-3xl"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
          width: "35vw",
          height: "35vw",
          opacity: 0.3,
        }}
        transition={{ duration: 0.8 }}
        style={{ left: "30%", bottom: "10%" }}
      />
    </motion.div>
  )
}
