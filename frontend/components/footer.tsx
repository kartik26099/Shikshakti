"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export default function Footer() {
  const socialIcons = [
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Linkedin size={20} />, href: "#" },
  ]

  const footerLinks = {
    "Quick Links": ["Home", "Features", "About Us", "Contact"],
    Features: ["AI Course Bot", "AI Advisor", "AI Faculty", "AI Research Helper"],
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <footer className="dark:bg-slate-900 bg-gray-100 dark:text-white text-slate-900 py-16 relative z-10 dark:border-t dark:border-purple-500/20 border-t border-purple-500/10 transition-colors duration-700">
      <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-transparent dark:to-slate-950 bg-gradient-to-b from-transparent to-gray-200 z-0 transition-colors duration-700" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <motion.div variants={itemVariants}>
            <motion.h3
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              style={{ backgroundSize: "200% auto" }}
            >
              ShikshaShakti
            </motion.h3>
            <p className="dark:text-gray-400 text-gray-600 mb-4 transition-colors duration-700">
              Empowering skill development through AI-powered learning solutions.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="dark:text-gray-400 text-gray-600 hover:text-purple-600 dark:hover:text-white transition-colors"
                  whileHover={{
                    scale: 1.2,
                    transition: { type: "spring", stiffness: 400 },
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {Object.entries(footerLinks).map(([title, links], sectionIndex) => (
            <motion.div key={title} variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link, linkIndex) => (
                  <motion.li key={linkIndex} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <a
                      href="#"
                      className="dark:text-gray-400 text-gray-600 hover:text-purple-600 dark:hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <motion.address
              className="not-italic dark:text-gray-400 text-gray-600 space-y-2 transition-colors duration-700"
              whileHover={{ scale: 1.02 }}
            >
              <p>Email: info@shikshashakti.com</p>
              <p>Phone: +91 123 456 7890</p>
              <p>Address: Tech Park, Bangalore, India</p>
            </motion.address>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="dark:border-t dark:border-gray-800 border-t border-gray-300 mt-12 pt-8 text-center dark:text-gray-400 text-gray-600 transition-colors duration-700"
        >
          <p>&copy; {new Date().getFullYear()} ShikshaShakti. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
