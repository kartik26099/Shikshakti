"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ThemeAnimationProviderProps {
  children: React.ReactNode
}

export function ThemeAnimationProvider({ children }: ThemeAnimationProviderProps) {
  const [isChangingTheme, setIsChangingTheme] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(true)
  const [newTheme, setNewTheme] = useState<"light" | "dark" | null>(null)

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setIsChangingTheme(true)
      setAnimationComplete(false)
      setNewTheme(
        customEvent.detail?.theme === "dark" ||
          (customEvent.detail?.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : "light",
      )

      // Reset after animation completes
      setTimeout(() => {
        setIsChangingTheme(false)
      }, 1500)

      // Allow new animations after transition
      setTimeout(() => {
        setAnimationComplete(true)
      }, 1800)
    }

    document.addEventListener("themechange", handleThemeChange)
    return () => document.removeEventListener("themechange", handleThemeChange)
  }, [])

  return (
    <>
      {children}

      <AnimatePresence>
        {isChangingTheme && (
          <motion.div
            className="fixed inset-0 z-[9999] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Blur overlay */}
            <motion.div
              className="absolute inset-0 backdrop-blur-md"
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{
                backdropFilter: ["blur(0px)", "blur(8px)", "blur(8px)", "blur(0px)"],
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.2, 0.8, 1],
              }}
            />

            {/* Theme transition effect */}
            <motion.div
              className={`absolute inset-0 ${
                newTheme === "dark"
                  ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
                  : "bg-gradient-to-br from-white via-purple-50 to-indigo-50"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.7, 0] }}
              transition={{
                duration: 1.5,
                times: [0, 0.2, 0.8, 1],
              }}
            />

            {/* Center circle animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className={`w-20 h-20 rounded-full ${
                  newTheme === "dark"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                    : "bg-gradient-to-r from-purple-300 to-indigo-300"
                }`}
                initial={{ scale: 0, borderRadius: "100%" }}
                animate={{
                  scale: [0, 1, 30, 0],
                  borderRadius: ["100%", "100%", "0%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  times: [0, 0.2, 0.8, 1],
                }}
              />
            </div>

            {/* Theme icon animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.5, 1.5, 0],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  times: [0, 0.2, 0.8, 1],
                }}
              >
                {newTheme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                )}
              </motion.div>
            </div>

            {/* Particles effect */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.5,
                times: [0, 0.2, 0.8, 1],
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${newTheme === "dark" ? "bg-purple-400" : "bg-indigo-400"}`}
                  initial={{
                    x: "50vw",
                    y: "50vh",
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: [0, 1, 0],
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
