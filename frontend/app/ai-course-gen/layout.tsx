"use client"

import type React from "react"

import { CourseGenProvider } from "@/context/course-gen-context"

export default function CourseGenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CourseGenProvider>{children}</CourseGenProvider>
}
