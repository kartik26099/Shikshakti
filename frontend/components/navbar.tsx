// "use client"

// import { useState, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Menu, X, BookOpen, Brain, Briefcase, GraduationCap, LineChart, Users } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { ThemeToggle } from "@/components/theme-toggle"
// import DropdownMenu from "@/components/dropdown-menu"
// import MobileDropdown from "@/components/mobile-dropdown"

// interface NavbarProps {
//   scrollY: number
// }

// export default function Navbar({ scrollY }: NavbarProps) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [hoveredItem, setHoveredItem] = useState<string | null>(null)
//   const [isVisible, setIsVisible] = useState(true)
//   const [lastScrollY, setLastScrollY] = useState(0)

//   const navItems = [{ name: "Home", href: "/" }]

//   const featuresItems = [
//     {
//       name: "AI Course Bot",
//       href: "/ai-course-gen",
//       icon: <BookOpen className="h-4 w-4" />,
//     },
//     {
//       name: "AI Advisor",
//       href: "/ai-advisor",
//       icon: <LineChart className="h-4 w-4" />,
//     },
//     {
//       name: "AI Faculty",
//       href: "/ai-faculty",
//       icon: <GraduationCap className="h-4 w-4" />,
//     },
//     {
//       name: "AI Research Helper",
//       href: "/ai-research-helper",
//       icon: <Brain className="h-4 w-4" />,
//     },
//     {
//       name: "AI Placement Cell",
//       href: "/ai-placement-cell",
//       icon: <Briefcase className="h-4 w-4" />,
//     },
//     {
//       name: "AI Library",
//       href: "/ai-library",
//       icon: <Users className="h-4 w-4" />,
//     },
//   ]

//   const aboutItems = [
//     { name: "About Us", href: "#" },
//     { name: "Our Team", href: "#" },
//     { name: "Contact", href: "#" },
//   ]

//   useEffect(() => {
//     const handleScroll = () => {
//       // Hide navbar when scrolling down, show when scrolling up
//       if (window.scrollY > lastScrollY && window.scrollY > 100) {
//         setIsVisible(false)
//       } else {
//         setIsVisible(true)
//       }
//       setLastScrollY(window.scrollY)
//     }

//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [lastScrollY])

//   return (
//     <>
//       {/* Skip to content link for accessibility */}
//       <a href="#main-content" className="skip-to-content">
//         Skip to content
//       </a>

//       <motion.header
//         className={cn(
//           "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
//           scrollY > 10
//             ? "dark:bg-slate-900/80 bg-white/80 backdrop-blur-md shadow-lg dark:shadow-purple-500/5 shadow-slate-200/20"
//             : "bg-transparent",
//         )}
//         initial={{ y: -100 }}
//         animate={{ y: isVisible ? 0 : -100 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             {/* Logo */}
//             <motion.div
//               className="flex items-center"
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 400, damping: 10 }}
//             >
//               <a href="/" className="flex items-center">
//                 <motion.span
//                   className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
//                   animate={{
//                     backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//                   }}
//                   transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
//                   style={{ backgroundSize: "200% auto" }}
//                 >
//                   ShikshaShakti
//                 </motion.span>
//               </a>
//             </motion.div>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex items-center space-x-8">
//               {navItems.map((item) => (
//                 <motion.div
//                   key={item.name}
//                   onHoverStart={() => setHoveredItem(item.name)}
//                   onHoverEnd={() => setHoveredItem(null)}
//                   className="relative"
//                 >
//                   <a
//                     href={item.href}
//                     className={cn(
//                       "text-base font-medium transition-colors duration-200 focus-visible",
//                       scrollY > 10
//                         ? "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white"
//                         : "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white",
//                     )}
//                   >
//                     {item.name}
//                   </a>
//                   <AnimatePresence>
//                     {hoveredItem === item.name && (
//                       <motion.div
//                         className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
//                         initial={{ width: 0, left: "50%" }}
//                         animate={{ width: "100%", left: "0%" }}
//                         exit={{ width: 0, left: "50%" }}
//                         transition={{ duration: 0.2 }}
//                       />
//                     )}
//                   </AnimatePresence>
//                 </motion.div>
//               ))}

//               <DropdownMenu label="Features" items={featuresItems} isScrolled={scrollY > 10} />
//               <DropdownMenu label="About" items={aboutItems} isScrolled={scrollY > 10} />

//               <div className="flex items-center space-x-4">
//                 <ThemeToggle />

//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full focus-visible">
//                     Sign In
//                   </Button>
//                 </motion.div>
//               </div>
//             </nav>

//             {/* Mobile menu button and theme toggle */}
//             <div className="md:hidden flex items-center space-x-4">
//               <ThemeToggle />

//               <motion.button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="inline-flex items-center justify-center p-2 rounded-md dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white focus:outline-none focus-visible"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 aria-expanded={isMenuOpen}
//                 aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//               >
//                 {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//               </motion.button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         <AnimatePresence>
//           {isMenuOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//               className="md:hidden dark:bg-slate-900/95 bg-white/95 backdrop-blur-md"
//             >
//               <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//                 {navItems.map((item, index) => (
//                   <motion.a
//                     key={item.name}
//                     href={item.href}
//                     className="block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white dark:hover:bg-purple-500/10 hover:bg-purple-50 focus-visible"
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                   >
//                     {item.name}
//                   </motion.a>
//                 ))}

//                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
//                   <MobileDropdown label="Features" items={featuresItems} />
//                 </motion.div>

//                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
//                   <MobileDropdown label="About" items={aboutItems} />
//                 </motion.div>

//                 <motion.div
//                   className="px-3 py-2"
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.3 }}
//                 >
//                   <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full focus-visible">
//                     Sign In
//                   </Button>
//                 </motion.div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.header>
//     </>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, BookOpen, Brain, Briefcase, GraduationCap, LineChart, Users, LogOut, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import DropdownMenu from "@/components/dropdown-menu"
import MobileDropdown from "@/components/mobile-dropdown"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu as UIDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  scrollY: number
}

export default function Navbar({ scrollY }: NavbarProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const navItems = [{ name: "Home", href: "/" }]

  const featuresItems = [
    {
      name: "AI CourseGen",
      href: "/ai-course-gen",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      name: "AI Advisor",
      href: "/ai-advisor",
      icon: <LineChart className="h-4 w-4" />,
    },
    {
      name: "AI Faculty",
      href: "/ai-faculty",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      name: "AI Research Helper",
      href: "/ai-research-helper",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      name: "AI Placement Cell",
      href: "/ai-placement-cell",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      name: "AI Library",
      href: "/ai-library",
      icon: <Users className="h-4 w-4" />,
    },
  ]

 

  useEffect(() => {
    const handleScroll = () => {
      // Hide navbar when scrolling down, show when scrolling up
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const handleSignOut = () => {
    signOut()
    router.push("/auth/sign-in")
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrollY > 10
            ? "dark:bg-slate-900/80 bg-white/80 backdrop-blur-md shadow-lg dark:shadow-purple-500/5 shadow-slate-200/20"
            : "bg-transparent",
        )}
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <a href="/" className="flex items-center">
                <motion.span
                  className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  style={{ backgroundSize: "200% auto" }}
                >
                  ShikshaShakti
                </motion.span>
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  onHoverStart={() => setHoveredItem(item.name)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className="relative"
                >
                  <a
                    href={item.href}
                    className={cn(
                      "text-base font-medium transition-colors duration-200 focus-visible",
                      scrollY > 10
                        ? "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white"
                        : "dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white",
                    )}
                  >
                    {item.name}
                  </a>
                  <AnimatePresence>
                    {hoveredItem === item.name && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
                        initial={{ width: 0, left: "50%" }}
                        animate={{ width: "100%", left: "0%" }}
                        exit={{ width: 0, left: "50%" }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <DropdownMenu label="Features" items={featuresItems} isScrolled={scrollY > 10} />
              
              <div className="flex items-center space-x-4">
                <ThemeToggle />

                {user ? (
                  <UIDropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full p-0 overflow-hidden focus-visible"
                      >
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/profile")}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </UIDropdownMenu>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full focus-visible"
                      onClick={() => router.push("/auth/sign-in")}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                )}
              </div>
            </nav>

            {/* Mobile menu button and theme toggle */}
            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle />

              {user && (
                <UIDropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden focus-visible">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </UIDropdownMenu>
              )}

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white focus:outline-none focus-visible"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden dark:bg-slate-900/95 bg-white/95 backdrop-blur-md"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium dark:text-gray-200 text-gray-700 hover:text-purple-600 dark:hover:text-white dark:hover:bg-purple-500/10 hover:bg-purple-50 focus-visible"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item.name}
                  </motion.a>
                ))}

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <MobileDropdown label="Features" items={featuresItems} />
                </motion.div>

                

                {!user && (
                  <motion.div
                    className="px-3 py-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full focus-visible"
                      onClick={() => router.push("/auth/sign-in")}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
