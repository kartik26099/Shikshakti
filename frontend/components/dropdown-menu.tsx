"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  label: string
  items: {
    name: string
    href: string
    icon?: React.ReactNode
  }[]
  isScrolled?: boolean
}

export default function DropdownMenu({ label, items, isScrolled = false }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button className="flex items-center space-x-1 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
        <span
          className={cn(
            "text-base font-medium transition-colors duration-200",
            isScrolled
              ? "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white"
              : "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white",
          )}
        >
          {label}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
            style={{
              transformOrigin: "top center",
            }}
          >
            <div className="p-1 backdrop-blur-xl shadow-lg rounded-xl border dark:border-gray-800 border-gray-200">
              <div
                className="absolute inset-0 rounded-xl opacity-80"
                style={{
                  background: "inherit",
                  backdropFilter: "blur(10px)",
                  zIndex: -1,
                }}
              />
              <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl opacity-80" />

              <div className="relative z-10">
                {items.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block w-full text-left"
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <motion.div
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg relative",
                        hoveredItem === item.name
                          ? "dark:bg-purple-500/20 bg-purple-100"
                          : "dark:hover:bg-gray-800/50 hover:bg-gray-100",
                      )}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.icon && <span className="mr-3 text-purple-500">{item.icon}</span>}
                      <span className="dark:text-gray-200 text-gray-700">{item.name}</span>

                      <AnimatePresence>
                        {hoveredItem === item.name && (
                          <motion.div
                            className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
