"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "shikshashakti-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedTheme = localStorage.getItem(storageKey) as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (defaultTheme === "system") {
      setTheme(getSystemTheme())
    }
  }, [defaultTheme, storageKey])

  useEffect(() => {
    if (!isMounted) return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = getSystemTheme()
      root.classList.add(systemTheme)
      root.style.colorScheme = systemTheme
    } else {
      root.classList.add(theme)
      root.style.colorScheme = theme
    }

    localStorage.setItem(storageKey, theme)
  }, [theme, isMounted, storageKey])

  function getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
      // Add a custom event for theme change animation
      const event = new CustomEvent("themechange", { detail: { theme } })
      document.dispatchEvent(event)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
