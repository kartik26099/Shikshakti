"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 300)
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <motion.button
      className="relative flex h-12 w-12 items-center justify-center rounded-full overflow-hidden"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {/* Background gradient */}
      <motion.div
        className={`absolute inset-0 ${
          isDark ? "bg-gradient-to-br from-slate-700 to-slate-900" : "bg-gradient-to-br from-indigo-100 to-purple-100"
        }`}
        animate={{
          opacity: isPressed ? 0.8 : 1,
          scale: isPressed ? 0.95 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Hover effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`absolute inset-0 rounded-full ${
                isDark
                  ? "bg-gradient-to-r from-purple-500/30 to-indigo-500/30"
                  : "bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
              } blur-md`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className={`absolute inset-0 rounded-full ${isDark ? "bg-purple-500/30" : "bg-indigo-500/30"}`}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          className="relative z-10"
          initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="h-6 w-6 text-yellow-300 drop-shadow-glow" />
          ) : (
            <Sun className="h-6 w-6 text-yellow-500 drop-shadow-glow" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Label - visible on hover for larger screens */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-full ml-2 hidden md:block"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} whitespace-nowrap`}>
              {isDark ? "Light mode" : "Dark mode"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
