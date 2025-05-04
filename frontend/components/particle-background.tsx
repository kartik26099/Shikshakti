"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

interface ParticleBackgroundProps {
  mousePosition: { x: number; y: number }
  activeSection: string
}

export default function ParticleBackground({ mousePosition, activeSection }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Determine if dark mode
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.color = this.getColor()
      }

      getColor() {
        const colors = {
          hero: {
            dark: ["rgba(168, 85, 247, 0.7)", "rgba(79, 70, 229, 0.7)", "rgba(236, 72, 153, 0.7)"],
            light: ["rgba(168, 85, 247, 0.4)", "rgba(79, 70, 229, 0.4)", "rgba(236, 72, 153, 0.4)"],
          },
          features: {
            dark: ["rgba(79, 70, 229, 0.7)", "rgba(16, 185, 129, 0.7)", "rgba(168, 85, 247, 0.7)"],
            light: ["rgba(79, 70, 229, 0.4)", "rgba(16, 185, 129, 0.4)", "rgba(168, 85, 247, 0.4)"],
          },
          cta: {
            dark: ["rgba(236, 72, 153, 0.7)", "rgba(168, 85, 247, 0.7)", "rgba(79, 70, 229, 0.7)"],
            light: ["rgba(236, 72, 153, 0.4)", "rgba(168, 85, 247, 0.4)", "rgba(79, 70, 229, 0.4)"],
          },
        }

        const mode = isDark ? "dark" : "light"
        const sectionColors = colors[activeSection as keyof typeof colors]?.[mode] || colors.hero[mode]
        return sectionColors[Math.floor(Math.random() * sectionColors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Mouse interaction
        const dx = mousePosition.x - this.x
        const dy = mousePosition.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const angle = Math.atan2(dy, dx)
          const force = (100 - distance) / 500
          this.speedX -= Math.cos(angle) * force
          this.speedY -= Math.sin(angle) * force
        }

        // Boundary check
        if (this.x < 0 || this.x > canvas.width) {
          this.speedX = -this.speedX
        }

        if (this.y < 0 || this.y > canvas.height) {
          this.speedY = -this.speedY
        }

        // Slow down
        this.speedX *= 0.99
        this.speedY *= 0.99
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 100)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [mousePosition, activeSection, theme])

  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 from-white via-purple-50 to-indigo-50 transition-colors duration-700" />

      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background:
            activeSection === "hero"
              ? "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 70%)"
              : activeSection === "features"
                ? "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.3) 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
        }}
        transition={{ duration: 1 }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 z-10" />
    </div>
  )
}
