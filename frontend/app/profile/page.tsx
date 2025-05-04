"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Pencil, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useMouse } from "@/hooks/use-mouse"
import EnhancedBackground from "@/components/enhanced-background"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, isLoading } = useAuth()
  const { mousePosition } = useMouse()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    role: "",
  })

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/sign-in")
    } else if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        role: user.role || "",
      })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    updateProfile({
      name: formData.name,
      bio: formData.bio,
      role: formData.role,
    })

    setIsSaving(false)
    setIsEditing(false)
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs">Change</span>
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    {isEditing ? "Edit Profile" : "My Profile"}
                  </h1>

                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="border-purple-500/30 hover:bg-purple-500/10"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          bio: user.bio || "",
                          role: user.role || "",
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="email" name="email" value={formData.email} disabled className="pl-10 opacity-70" />
                      </div>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder="e.g. Student, Developer, Data Scientist"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-400">Name:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-400">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>

                    {user.role && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Role:</span>
                        <span className="font-medium">{user.role}</span>
                      </div>
                    )}

                    {user.joinedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <span className="text-gray-400">Joined:</span>
                        <span className="font-medium">
                          {new Date(user.joinedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    {user.bio && (
                      <div className="mt-4">
                        <h3 className="text-gray-400 mb-2">Bio</h3>
                        <p className="text-gray-200">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Learning Progress
            </h2>

            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
              <Button
                onClick={() => router.push("/ai-course-gen")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Explore Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
