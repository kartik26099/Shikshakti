"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileDropdownProps {
  label: string
  items: {
    name: string
    href: string
    icon?: React.ReactNode
  }[]
}

export default function MobileDropdown({ label, items }: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white dark:hover:bg-purple-500/10 hover:bg-purple-50"
        aria-expanded={isOpen}
      >
        <span>{label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pl-4 border-l dark:border-gray-700 border-gray-200 ml-3 mt-1">
              {items.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 text-gray-600 hover:text-purple-600 dark:hover:text-white",
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.icon && <span className="mr-2 text-purple-500">{item.icon}</span>}
                  {item.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
