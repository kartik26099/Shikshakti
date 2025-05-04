"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  color: string
  index: number
}

export default function FeatureCard({ title, description, icon, color, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{
        y: -10,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="h-full border-none dark:bg-white/5 bg-white/80 backdrop-blur-sm dark:hover:bg-white/10 hover:bg-white/90 transition-all duration-300 overflow-hidden group">
        <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 bg-gradient-to-br from-white to-gray-50 z-0 transition-colors duration-700" />

        <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", color)} />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", color)} />
        </div>

        <CardHeader className="relative z-10">
          <motion.div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white",
              "bg-gradient-to-br",
              color,
            )}
            whileHover={{
              scale: 1.1,
              rotate: 5,
              transition: { type: "spring", stiffness: 300 },
            }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-xl font-bold dark:text-white text-slate-900 transition-colors duration-700">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          <CardDescription className="dark:text-gray-300 text-slate-700 text-base transition-colors duration-700">
            {description}
          </CardDescription>
        </CardContent>

        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `linear-gradient(to right, var(--${color.split("-")[1]}), var(--${color.split("-")[2]}))`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </Card>
    </motion.div>
  )
}
