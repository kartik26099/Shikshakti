// import type React from "react"
// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { ThemeAnimationProvider } from "@/components/theme-animation-provider"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "ShikshaShakti - Empowering Skill Development through AI",
//   description: "AI-powered platform for personalized learning and skill development",
//     generator: 'v0.dev'
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <ThemeProvider defaultTheme="dark">
//           <ThemeAnimationProvider>{children}</ThemeAnimationProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeAnimationProvider } from "@/components/theme-animation-provider"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShikshaShakti - Empowering Skill Development through AI",
  description: "AI-powered platform for personalized learning and skill development",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark">
          <ThemeAnimationProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeAnimationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

