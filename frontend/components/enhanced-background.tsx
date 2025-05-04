"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

interface EnhancedBackgroundProps {
  mousePosition: { x: number; y: number }
}

export default function EnhancedBackground({ mousePosition }: EnhancedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [scrollProgress, setScrollProgress] = useState(0)
  const { scrollYProgress } = useScroll()

  // Track scroll progress for color transitions
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => setScrollProgress(v))
    return () => unsubscribe()
  }, [scrollYProgress])

  // Background colors based on scroll position and theme
  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  // Define color stops for different scroll positions
  const colorStops = {
    dark: [
      { pos: 0, colors: ["#1e1b4b", "#4c1d95", "#1e1b4b"] }, // Hero - indigo/purple
      { pos: 0.33, colors: ["#1e293b", "#312e81", "#1e1b4b"] }, // Features - slate/indigo
      { pos: 0.66, colors: ["#0f172a", "#4c1d95", "#1e293b"] }, // CTA - slate/purple
      { pos: 1, colors: ["#0f172a", "#312e81", "#0f172a"] }, // Footer - slate/indigo
    ],
    light: [
      { pos: 0, colors: ["#ffffff", "#f3f4f6", "#ede9fe"] }, // Hero - white/gray/purple
      { pos: 0.33, colors: ["#f8fafc", "#ede9fe", "#f1f5f9"] }, // Features - white/purple/slate
      { pos: 0.66, colors: ["#f1f5f9", "#e0e7ff", "#f8fafc"] }, // CTA - slate/indigo/white
      { pos: 1, colors: ["#f8fafc", "#f3f4f6", "#f8fafc"] }, // Footer - white/gray
    ],
  }

  // Interpolate between color stops based on scroll position
  const getCurrentColors = () => {
    const stops = isDark ? colorStops.dark : colorStops.light

    // Find the two stops we're between
    let lowerStop = stops[0]
    let upperStop = stops[stops.length - 1]

    for (let i = 0; i < stops.length - 1; i++) {
      if (scrollProgress >= stops[i].pos && scrollProgress <= stops[i + 1].pos) {
        lowerStop = stops[i]
        upperStop = stops[i + 1]
        break
      }
    }

    // Calculate how far we are between the two stops (0-1)
    const range = upperStop.pos - lowerStop.pos
    const normalizedProgress = range === 0 ? 0 : (scrollProgress - lowerStop.pos) / range

    // Interpolate colors
    return lowerStop.colors.map((color, i) => {
      return interpolateColor(color, upperStop.colors[i], normalizedProgress)
    })
  }

  // Helper to interpolate between two hex colors
  const interpolateColor = (color1: string, color2: string, factor: number) => {
    const result = color1
      .replace(/^#/, "")
      .match(/.{2}/g)
      ?.map((hex, i) => {
        const rgb1 = Number.parseInt(hex, 16)
        const rgb2 = Number.parseInt(color2.replace(/^#/, "").match(/.{2}/g)![i], 16)
        const interpolated = Math.round(rgb1 + (rgb2 - rgb1) * factor)
        return interpolated.toString(16).padStart(2, "0")
      })
      .join("")

    return `#${result}`
  }

  // Get current background colors based on scroll position
  const [from, via, to] = getCurrentColors()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with higher pixel density for retina displays
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Enhanced Particle class with physics-based movement
    class Particle {
      x: number
      y: number
      size: number
      baseSize: number
      vx: number
      vy: number
      targetVx: number
      targetVy: number
      color: string
      opacity: number
      life: number
      maxLife: number

      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.baseSize = Math.random() * 2 + 1
        this.size = this.baseSize
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.targetVx = this.vx
        this.targetVy = this.vy
        this.color = this.getColor()
        this.opacity = Math.random() * 0.5 + 0.2
        this.maxLife = 100 + Math.random() * 100
        this.life = this.maxLife
      }

      getColor() {
        // Use the current interpolated colors based on scroll
        const colors = isDark
          ? ["rgba(168, 85, 247, 0.7)", "rgba(79, 70, 229, 0.7)", "rgba(236, 72, 153, 0.7)"]
          : ["rgba(168, 85, 247, 0.4)", "rgba(79, 70, 229, 0.4)", "rgba(236, 72, 153, 0.4)"]

        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        // Smooth velocity changes with easing
        this.vx += (this.targetVx - this.vx) * 0.05
        this.vy += (this.targetVy - this.vy) * 0.05

        this.x += this.vx
        this.y += this.vy

        // Gentle mouse interaction with smooth easing
        const dx = mousePosition.x - this.x
        const dy = mousePosition.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          const angle = Math.atan2(dy, dx)
          const force = ((maxDistance - distance) / maxDistance) * 0.02
          this.targetVx -= Math.cos(angle) * force
          this.targetVy -= Math.sin(angle) * force
        }

        // Add slight randomness for more natural movement
        if (Math.random() < 0.01) {
          this.targetVx += (Math.random() - 0.5) * 0.01
          this.targetVy += (Math.random() - 0.5) * 0.01
        }

        // Boundary check with smooth bounce
        if (this.x < 0 || this.x > window.innerWidth) {
          this.targetVx = -this.vx * 0.5
        }

        if (this.y < 0 || this.y > window.innerHeight) {
          this.targetVy = -this.vy * 0.5
        }

        // Gradually slow down
        this.targetVx *= 0.99
        this.targetVy *= 0.99

        // Particle lifecycle
        this.life -= 0.2
        if (this.life <= 0) {
          this.reset()
        }

        // Size and opacity based on life
        this.size = this.baseSize * (this.life / this.maxLife) * 1.5
        this.opacity = 0.2 + (this.life / this.maxLife) * 0.5
      }

      reset() {
        // Respawn the particle at a random edge
        const side = Math.floor(Math.random() * 4)

        if (side === 0) {
          // top
          this.x = Math.random() * window.innerWidth
          this.y = -10
          this.targetVy = Math.abs(this.targetVy)
        } else if (side === 1) {
          // right
          this.x = window.innerWidth + 10
          this.y = Math.random() * window.innerHeight
          this.targetVx = -Math.abs(this.targetVx)
        } else if (side === 2) {
          // bottom
          this.x = Math.random() * window.innerWidth
          this.y = window.innerHeight + 10
          this.targetVy = -Math.abs(this.targetVy)
        } else {
          // left
          this.x = -10
          this.y = Math.random() * window.innerHeight
          this.targetVx = Math.abs(this.targetVx)
        }

        this.vx = this.targetVx
        this.vy = this.targetVy
        this.life = this.maxLife
        this.color = this.getColor()
      }

      draw() {
        if (!ctx) return
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    // Create particles - adjust count based on screen size for performance
    const getParticleCount = () => {
      const area = window.innerWidth * window.innerHeight
      const baseCount = 40
      const maxCount = 100
      return Math.min(Math.max(Math.floor(area / 15000), baseCount), maxCount)
    }

    const particles: Particle[] = []
    const particleCount = getParticleCount()

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Optimized animation loop with request animation frame
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections with opacity based on distance
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 150

          if (distance < maxDistance) {
            // Opacity based on distance
            const opacity = ((maxDistance - distance) / maxDistance) * 0.5
            ctx.globalAlpha = opacity
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mousePosition, isDark, scrollProgress])

  return (
    <div className="fixed inset-0 z-0 transition-colors duration-1000">
      {/* Gradient background that changes with scroll */}
      <motion.div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${from} 0%, ${via} 50%, ${to} 100%)`,
        }}
      />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5 dark:opacity-5 z-0"></div>

      {/* Animated canvas with particles */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* Subtle glow effects that follow scroll */}
      <motion.div
        className="absolute opacity-30 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${from}99, transparent 70%)`,
          width: "60vw",
          height: "60vw",
          top: "10%",
          left: "10%",
          transform: `translateY(${scrollProgress * 20}vh)`,
        }}
      />

      <motion.div
        className="absolute opacity-20 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${via}99, transparent 70%)`,
          width: "40vw",
          height: "40vw",
          bottom: "20%",
          right: "10%",
          transform: `translateY(${-scrollProgress * 30}vh)`,
        }}
      />
    </div>
  )
}
