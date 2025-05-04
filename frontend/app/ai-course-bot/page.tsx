"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  Loader2,
  ArrowRight,
  Clock,
  BookOpen,
  GraduationCap,
  Brain,
  Code,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Filter,
  X,
} from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EnhancedBackground from "@/components/enhanced-background"
import { useMouse } from "@/hooks/use-mouse"
import ScrollProgress from "@/components/scroll-progress"
import { cn } from "@/lib/utils"

// Types for learning path data
interface LearningPath {
  id: string
  title: string
  description: string
  targetAudience: string[]
  prerequisites: string[]
  estimatedTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  stages: LearningStage[]
  careerOutcomes: string[]
  tags: string[]
}

interface LearningStage {
  id: string
  title: string
  description: string
  topics: LearningTopic[]
  duration: string
}

interface LearningTopic {
  id: string
  title: string
  description: string
  resources: LearningResource[]
  skills: string[]
  isOptional?: boolean
}

interface LearningResource {
  type: "Article" | "Video" | "Course" | "Book" | "Tutorial" | "Project" | "Tool"
  title: string
  description?: string
  link?: string
  estimatedTime?: string
}

// Types for messages
interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  learningPaths?: LearningPath[]
  isLoading?: boolean
  isError?: boolean
}

// Types for filters
interface Filters {
  difficulty: string
  duration: string
  goal: string
}

export default function AICourseBot() {
  const { mousePosition } = useMouse()
  const [scrollY, setScrollY] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "👋 Hello! I'm your AI Course Bot. I can help you find the right learning path for your AI journey. What are you interested in learning?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    difficulty: "all",
    duration: "all",
    goal: "all",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample learning paths data
  const learningPathsData: LearningPath[] = [
    {
      id: "path-1",
      title: "Machine Learning Fundamentals",
      description:
        "A comprehensive learning path to build a strong foundation in machine learning concepts, algorithms, and practical applications.",
      targetAudience: [
        "Beginners in AI/ML",
        "Software developers looking to transition to ML",
        "Data analysts wanting to expand their skills",
      ],
      prerequisites: [
        "Basic Python programming",
        "Fundamental mathematics (algebra, calculus basics)",
        "Basic statistics",
      ],
      estimatedTime: "3-6 months (10-15 hours/week)",
      difficulty: "Beginner",
      stages: [
        {
          id: "stage-1",
          title: "Mathematics and Statistics Foundations",
          description: "Build the essential mathematical foundation required for machine learning",
          duration: "2-3 weeks",
          topics: [
            {
              id: "topic-1-1",
              title: "Linear Algebra Essentials",
              description: "Learn the fundamental concepts of linear algebra that are crucial for machine learning",
              skills: ["Vectors", "Matrices", "Eigenvalues and eigenvectors", "Matrix operations"],
              resources: [
                {
                  type: "Video",
                  title: "Linear Algebra for Machine Learning",
                  link: "https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky0",
                  estimatedTime: "6 hours",
                },
                {
                  type: "Article",
                  title: "Essence of Linear Algebra",
                  link: "https://www.3blue1brown.com/topics/linear-algebra",
                  estimatedTime: "3 hours",
                },
              ],
            },
            {
              id: "topic-1-2",
              title: "Probability and Statistics",
              description: "Understand the statistical concepts that form the basis of many ML algorithms",
              skills: [
                "Probability distributions",
                "Statistical inference",
                "Hypothesis testing",
                "Bayesian statistics",
              ],
              resources: [
                {
                  type: "Course",
                  title: "Introduction to Statistics for Data Science",
                  link: "https://www.coursera.org/learn/stanford-statistics",
                  estimatedTime: "15 hours",
                },
                {
                  type: "Book",
                  title: "Think Stats: Probability and Statistics for Programmers",
                  link: "https://greenteapress.com/wp/think-stats-2e/",
                  estimatedTime: "20 hours",
                },
              ],
            },
            {
              id: "topic-1-3",
              title: "Calculus for Machine Learning",
              description: "Learn the calculus concepts essential for understanding optimization in ML",
              skills: ["Derivatives", "Gradients", "Chain rule", "Optimization basics"],
              resources: [
                {
                  type: "Video",
                  title: "Calculus for Machine Learning",
                  link: "https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky0",
                  estimatedTime: "5 hours",
                },
              ],
              isOptional: true,
            },
          ],
        },
        {
          id: "stage-2",
          title: "Python for Data Science",
          description: "Master Python libraries essential for data manipulation and analysis",
          duration: "3-4 weeks",
          topics: [
            {
              id: "topic-2-1",
              title: "NumPy and Pandas",
              description: "Learn to manipulate and analyze data efficiently with Python's core data science libraries",
              skills: ["Array operations", "Data frames", "Data cleaning", "Data transformation"],
              resources: [
                {
                  type: "Tutorial",
                  title: "Python for Data Science Handbook",
                  link: "https://jakevdp.github.io/PythonDataScienceHandbook/",
                  estimatedTime: "15 hours",
                },
                {
                  type: "Project",
                  title: "Data Cleaning and Analysis Project",
                  description: "Practice cleaning and analyzing a real-world dataset",
                  estimatedTime: "8 hours",
                },
              ],
            },
            {
              id: "topic-2-2",
              title: "Data Visualization",
              description: "Learn to create insightful visualizations to understand data patterns",
              skills: ["Matplotlib", "Seaborn", "Visualization principles", "Interactive plots"],
              resources: [
                {
                  type: "Course",
                  title: "Data Visualization with Python",
                  link: "https://www.coursera.org/learn/python-for-data-visualization",
                  estimatedTime: "12 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-3",
          title: "Machine Learning Algorithms",
          description: "Learn the core machine learning algorithms and when to apply them",
          duration: "6-8 weeks",
          topics: [
            {
              id: "topic-3-1",
              title: "Supervised Learning",
              description: "Master the fundamentals of supervised learning algorithms",
              skills: [
                "Linear regression",
                "Logistic regression",
                "Decision trees",
                "Random forests",
                "Support vector machines",
              ],
              resources: [
                {
                  type: "Course",
                  title: "Machine Learning by Andrew Ng",
                  link: "https://www.coursera.org/learn/machine-learning",
                  estimatedTime: "40 hours",
                },
                {
                  type: "Project",
                  title: "Classification Project",
                  description: "Build a model to predict outcomes on a real dataset",
                  estimatedTime: "10 hours",
                },
              ],
            },
            {
              id: "topic-3-2",
              title: "Unsupervised Learning",
              description: "Explore techniques for finding patterns in unlabeled data",
              skills: ["Clustering", "Dimensionality reduction", "PCA", "K-means"],
              resources: [
                {
                  type: "Tutorial",
                  title: "Unsupervised Learning Tutorial",
                  link: "https://scikit-learn.org/stable/unsupervised_learning.html",
                  estimatedTime: "15 hours",
                },
              ],
            },
            {
              id: "topic-3-3",
              title: "Model Evaluation",
              description: "Learn how to evaluate and improve machine learning models",
              skills: ["Cross-validation", "Metrics", "Hyperparameter tuning", "Bias-variance tradeoff"],
              resources: [
                {
                  type: "Article",
                  title: "Model Evaluation, Model Selection, and Algorithm Selection in Machine Learning",
                  link: "https://sebastianraschka.com/blog/2016/model-evaluation-selection-part1.html",
                  estimatedTime: "5 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-4",
          title: "Practical ML Projects",
          description: "Apply your knowledge to real-world projects",
          duration: "4-6 weeks",
          topics: [
            {
              id: "topic-4-1",
              title: "End-to-End ML Project",
              description: "Build a complete machine learning solution from data collection to deployment",
              skills: ["Project planning", "Data pipeline creation", "Model deployment", "Documentation"],
              resources: [
                {
                  type: "Project",
                  title: "End-to-End Machine Learning Project",
                  description: "Build and deploy a complete ML solution",
                  estimatedTime: "30 hours",
                },
                {
                  type: "Tool",
                  title: "GitHub for Version Control",
                  link: "https://github.com",
                  estimatedTime: "2 hours",
                },
              ],
            },
            {
              id: "topic-4-2",
              title: "ML System Design",
              description: "Learn how to design robust machine learning systems",
              skills: ["System architecture", "Scalability", "Monitoring", "Maintenance"],
              resources: [
                {
                  type: "Book",
                  title: "Designing Machine Learning Systems",
                  link: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/",
                  estimatedTime: "20 hours",
                },
              ],
            },
          ],
        },
      ],
      careerOutcomes: [
        "Junior Machine Learning Engineer",
        "Data Scientist",
        "ML Research Assistant",
        "Data Analyst with ML skills",
      ],
      tags: ["machine learning", "data science", "python", "algorithms", "statistics"],
    },
    {
      id: "path-2",
      title: "Deep Learning Specialization",
      description:
        "An in-depth learning path focused on neural networks and deep learning techniques for advanced AI applications.",
      targetAudience: [
        "ML practitioners wanting to specialize in deep learning",
        "Software engineers with ML experience",
        "Researchers in AI-adjacent fields",
      ],
      prerequisites: [
        "Strong Python programming skills",
        "Machine learning fundamentals",
        "Linear algebra and calculus",
      ],
      estimatedTime: "4-8 months (10-15 hours/week)",
      difficulty: "Intermediate",
      stages: [
        {
          id: "stage-1",
          title: "Neural Networks Fundamentals",
          description: "Build a strong foundation in neural network concepts and architectures",
          duration: "4-5 weeks",
          topics: [
            {
              id: "topic-1-1",
              title: "Neural Network Basics",
              description: "Understand the fundamental building blocks of neural networks",
              skills: [
                "Neurons and activation functions",
                "Forward and backward propagation",
                "Gradient descent",
                "Neural network architecture",
              ],
              resources: [
                {
                  type: "Course",
                  title: "Neural Networks and Deep Learning",
                  link: "https://www.coursera.org/learn/neural-networks-deep-learning",
                  estimatedTime: "20 hours",
                },
                {
                  type: "Video",
                  title: "Neural Networks Explained",
                  link: "https://www.youtube.com/watch?v=aircAruvnKk",
                  estimatedTime: "1 hour",
                },
              ],
            },
            {
              id: "topic-1-2",
              title: "Deep Learning Frameworks",
              description: "Learn to use popular deep learning frameworks",
              skills: ["TensorFlow", "PyTorch", "Keras", "Model building"],
              resources: [
                {
                  type: "Tutorial",
                  title: "PyTorch Tutorials",
                  link: "https://pytorch.org/tutorials/",
                  estimatedTime: "15 hours",
                },
                {
                  type: "Project",
                  title: "Build Your First Neural Network",
                  description: "Implement a neural network from scratch",
                  estimatedTime: "10 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-2",
          title: "Convolutional Neural Networks",
          description: "Master CNNs for computer vision applications",
          duration: "5-6 weeks",
          topics: [
            {
              id: "topic-2-1",
              title: "CNN Architecture",
              description: "Learn the architecture and components of convolutional neural networks",
              skills: ["Convolutional layers", "Pooling", "CNN architectures", "Feature extraction"],
              resources: [
                {
                  type: "Course",
                  title: "Convolutional Neural Networks",
                  link: "https://www.coursera.org/learn/convolutional-neural-networks",
                  estimatedTime: "25 hours",
                },
              ],
            },
            {
              id: "topic-2-2",
              title: "Computer Vision Applications",
              description: "Apply CNNs to solve computer vision problems",
              skills: ["Image classification", "Object detection", "Image segmentation", "Transfer learning"],
              resources: [
                {
                  type: "Project",
                  title: "Image Classification Project",
                  description: "Build an image classifier using CNNs",
                  estimatedTime: "15 hours",
                },
                {
                  type: "Tutorial",
                  title: "Transfer Learning for Computer Vision",
                  link: "https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html",
                  estimatedTime: "8 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-3",
          title: "Sequence Models",
          description: "Learn to work with sequential data using RNNs and transformers",
          duration: "5-6 weeks",
          topics: [
            {
              id: "topic-3-1",
              title: "Recurrent Neural Networks",
              description: "Understand RNNs and their variants for sequence modeling",
              skills: ["RNN architecture", "LSTM", "GRU", "Bidirectional RNNs"],
              resources: [
                {
                  type: "Course",
                  title: "Sequence Models",
                  link: "https://www.coursera.org/learn/nlp-sequence-models",
                  estimatedTime: "20 hours",
                },
                {
                  type: "Article",
                  title: "Understanding LSTM Networks",
                  link: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/",
                  estimatedTime: "2 hours",
                },
              ],
            },
            {
              id: "topic-3-2",
              title: "Transformers and Attention",
              description: "Master the transformer architecture that powers modern NLP",
              skills: ["Attention mechanism", "Transformer architecture", "BERT", "GPT"],
              resources: [
                {
                  type: "Article",
                  title: "The Illustrated Transformer",
                  link: "https://jalammar.github.io/illustrated-transformer/",
                  estimatedTime: "3 hours",
                },
                {
                  type: "Project",
                  title: "Text Classification with Transformers",
                  description: "Build a text classifier using transformer models",
                  estimatedTime: "12 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-4",
          title: "Advanced Deep Learning Topics",
          description: "Explore cutting-edge deep learning techniques",
          duration: "6-8 weeks",
          topics: [
            {
              id: "topic-4-1",
              title: "Generative Models",
              description: "Learn about models that can generate new content",
              skills: ["GANs", "VAEs", "Diffusion models", "Image generation"],
              resources: [
                {
                  type: "Course",
                  title: "Generative Adversarial Networks",
                  link: "https://www.coursera.org/specializations/generative-adversarial-networks-gans",
                  estimatedTime: "30 hours",
                },
              ],
            },
            {
              id: "topic-4-2",
              title: "Reinforcement Learning",
              description: "Understand how agents learn through interaction with environments",
              skills: ["Q-learning", "Policy gradients", "Deep Q-Networks", "Actor-critic methods"],
              resources: [
                {
                  type: "Book",
                  title: "Reinforcement Learning: An Introduction",
                  link: "http://incompleteideas.net/book/the-book-2nd.html",
                  estimatedTime: "40 hours",
                },
                {
                  type: "Project",
                  title: "Train an RL Agent",
                  description: "Build and train a reinforcement learning agent",
                  estimatedTime: "20 hours",
                },
              ],
              isOptional: true,
            },
          ],
        },
      ],
      careerOutcomes: ["Deep Learning Engineer", "Computer Vision Engineer", "NLP Engineer", "AI Research Scientist"],
      tags: ["deep learning", "neural networks", "computer vision", "NLP", "transformers"],
    },
    {
      id: "path-3",
      title: "AI for Business and Product Management",
      description:
        "A non-technical learning path focused on understanding AI capabilities, limitations, and applications in business contexts.",
      targetAudience: [
        "Business professionals",
        "Product managers",
        "Entrepreneurs",
        "Decision-makers in organizations",
      ],
      prerequisites: ["No technical prerequisites", "Basic business understanding"],
      estimatedTime: "2-3 months (5-8 hours/week)",
      difficulty: "Beginner",
      stages: [
        {
          id: "stage-1",
          title: "AI Fundamentals for Business",
          description: "Understand the core concepts of AI without the technical complexity",
          duration: "2-3 weeks",
          topics: [
            {
              id: "topic-1-1",
              title: "Introduction to AI Concepts",
              description: "Learn the basic concepts and terminology of AI",
              skills: ["AI terminology", "Types of AI", "Machine learning basics", "AI capabilities and limitations"],
              resources: [
                {
                  type: "Course",
                  title: "AI For Everyone",
                  link: "https://www.coursera.org/learn/ai-for-everyone",
                  estimatedTime: "10 hours",
                },
                {
                  type: "Article",
                  title: "A Non-Technical Guide to Machine Learning",
                  link: "https://hbr.org/2018/11/a-simple-tool-to-start-making-decisions-with-the-help-of-ai",
                  estimatedTime: "1 hour",
                },
              ],
            },
            {
              id: "topic-1-2",
              title: "AI Technologies Overview",
              description: "Understand different AI technologies and their applications",
              skills: [
                "Machine learning",
                "Deep learning",
                "Natural language processing",
                "Computer vision",
                "Robotics",
              ],
              resources: [
                {
                  type: "Video",
                  title: "AI Technologies Explained",
                  link: "https://www.youtube.com/watch?v=mJeNghZXtMo",
                  estimatedTime: "2 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-2",
          title: "AI Strategy for Business",
          description: "Learn how to develop and implement AI strategies in organizations",
          duration: "3-4 weeks",
          topics: [
            {
              id: "topic-2-1",
              title: "AI Use Cases and Applications",
              description: "Explore real-world applications of AI across industries",
              skills: [
                "Industry-specific AI applications",
                "AI use case identification",
                "Value proposition analysis",
                "ROI assessment",
              ],
              resources: [
                {
                  type: "Course",
                  title: "AI Business Applications",
                  link: "https://www.coursera.org/learn/ai-business-applications",
                  estimatedTime: "15 hours",
                },
                {
                  type: "Article",
                  title: "The Business Case for AI",
                  link: "https://hbr.org/2021/04/how-to-design-an-ai-marketing-strategy",
                  estimatedTime: "1 hour",
                },
              ],
            },
            {
              id: "topic-2-2",
              title: "AI Transformation Roadmap",
              description: "Learn how to develop an AI strategy for your organization",
              skills: ["AI readiness assessment", "AI strategy development", "Change management", "AI governance"],
              resources: [
                {
                  type: "Book",
                  title: "The AI Advantage",
                  link: "https://mitpress.mit.edu/books/ai-advantage",
                  estimatedTime: "10 hours",
                },
                {
                  type: "Project",
                  title: "AI Strategy Development",
                  description: "Create an AI strategy for a business case",
                  estimatedTime: "8 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-3",
          title: "AI Product Management",
          description: "Learn how to manage AI products effectively",
          duration: "3-4 weeks",
          topics: [
            {
              id: "topic-3-1",
              title: "AI Product Development",
              description: "Understand the unique aspects of developing AI products",
              skills: ["AI product lifecycle", "Data requirements", "Model selection", "User experience design for AI"],
              resources: [
                {
                  type: "Course",
                  title: "AI Product Management",
                  link: "https://www.coursera.org/specializations/ai-product-management-duke",
                  estimatedTime: "20 hours",
                },
              ],
            },
            {
              id: "topic-3-2",
              title: "Working with AI Teams",
              description: "Learn how to effectively collaborate with technical AI teams",
              skills: [
                "Technical communication",
                "Project management for AI",
                "Data collection and annotation",
                "Model evaluation",
              ],
              resources: [
                {
                  type: "Article",
                  title: "Managing AI Teams",
                  link: "https://hbr.org/2020/10/managing-ai-teams",
                  estimatedTime: "1 hour",
                },
                {
                  type: "Project",
                  title: "AI Product Specification",
                  description: "Create a product specification for an AI product",
                  estimatedTime: "6 hours",
                },
              ],
            },
          ],
        },
        {
          id: "stage-4",
          title: "AI Ethics and Governance",
          description: "Understand the ethical implications and governance of AI",
          duration: "2-3 weeks",
          topics: [
            {
              id: "topic-4-1",
              title: "AI Ethics",
              description: "Learn about ethical considerations in AI development and deployment",
              skills: ["Fairness", "Transparency", "Privacy", "Accountability"],
              resources: [
                {
                  type: "Course",
                  title: "AI Ethics",
                  link: "https://www.coursera.org/learn/ai-ethics",
                  estimatedTime: "10 hours",
                },
              ],
            },
            {
              id: "topic-4-2",
              title: "AI Governance and Regulation",
              description: "Understand the regulatory landscape for AI",
              skills: ["AI policy", "Compliance", "Risk management", "Responsible AI"],
              resources: [
                {
                  type: "Article",
                  title: "AI Governance Framework",
                  link: "https://www.weforum.org/reports/ai-governance-a-holistic-approach-to-implement-ethics-into-ai",
                  estimatedTime: "3 hours",
                },
                {
                  type: "Project",
                  title: "AI Ethics Assessment",
                  description: "Conduct an ethical assessment of an AI application",
                  estimatedTime: "5 hours",
                },
              ],
            },
          ],
        },
      ],
      careerOutcomes: [
        "AI Product Manager",
        "AI Strategy Consultant",
        "Business Intelligence Analyst",
        "Innovation Director",
      ],
      tags: ["business", "product management", "strategy", "non-technical", "AI ethics"],
    },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        content: "Thinking...",
        sender: "bot",
        timestamp: new Date(),
        isLoading: true,
      },
    ])

    setIsLoading(true)

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Process the user's message and generate a response
      const botResponse = processUserMessage(inputMessage)

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId))

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: botResponse.content,
          sender: "bot",
          timestamp: new Date(),
          learningPaths: botResponse.learningPaths,
        },
      ])
    } catch (error) {
      console.error("Error processing message:", error)

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessageId))

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const processUserMessage = (message: string): { content: string; learningPaths?: LearningPath[] } => {
    const lowerCaseMessage = message.toLowerCase()

    // Check if the message is asking for learning path recommendations
    if (
      lowerCaseMessage.includes("recommend") ||
      lowerCaseMessage.includes("suggest") ||
      lowerCaseMessage.includes("what path") ||
      lowerCaseMessage.includes("which path") ||
      lowerCaseMessage.includes("learning path") ||
      lowerCaseMessage.includes("how to learn") ||
      lowerCaseMessage.includes("how should i learn")
    ) {
      // Filter learning paths based on user's interests mentioned in the message
      let filteredPaths = [...learningPathsData]

      // Filter by difficulty if mentioned
      if (
        lowerCaseMessage.includes("beginner") ||
        lowerCaseMessage.includes("basic") ||
        lowerCaseMessage.includes("start")
      ) {
        filteredPaths = filteredPaths.filter((path) => path.difficulty === "Beginner")
      } else if (lowerCaseMessage.includes("intermediate")) {
        filteredPaths = filteredPaths.filter((path) => path.difficulty === "Intermediate")
      } else if (lowerCaseMessage.includes("advanced") || lowerCaseMessage.includes("expert")) {
        filteredPaths = filteredPaths.filter((path) => path.difficulty === "Advanced")
      }

      // Filter by topic if mentioned
      const topics = [
        { keywords: ["deep learning", "neural network"], tag: "deep learning" },
        { keywords: ["machine learning", "ml"], tag: "machine learning" },
        { keywords: ["business", "product", "management"], tag: "business" },
        { keywords: ["ethics", "governance", "responsible"], tag: "ethics" },
      ]

      for (const topic of topics) {
        if (topic.keywords.some((keyword) => lowerCaseMessage.includes(keyword))) {
          filteredPaths = filteredPaths.filter((path) => path.tags.some((tag) => tag.toLowerCase().includes(topic.tag)))
        }
      }

      // If no specific filters matched or no paths found, return all paths
      if (filteredPaths.length === 0) {
        return {
          content:
            "I couldn't find learning paths matching your specific criteria. Here are some popular AI learning paths you might be interested in:",
          learningPaths: learningPathsData.slice(0, 2),
        }
      }

      return {
        content: `Based on your interests, here are some AI learning paths I'd recommend:`,
        learningPaths: filteredPaths.slice(0, 2), // Limit to 2 paths
      }
    }

    // Check if the message is asking about a specific learning path
    for (const path of learningPathsData) {
      if (lowerCaseMessage.includes(path.title.toLowerCase())) {
        return {
          content: `Here's information about the ${path.title} learning path:`,
          learningPaths: [path],
        }
      }
    }

    // Check if the message is asking about specific topics
    if (lowerCaseMessage.includes("deep learning") || lowerCaseMessage.includes("neural network")) {
      const deepLearningPaths = learningPathsData.filter((path) =>
        path.tags.some((tag) => tag.includes("deep learning") || tag.includes("neural network")),
      )
      return {
        content: "Here are some learning paths focused on deep learning and neural networks:",
        learningPaths: deepLearningPaths,
      }
    }

    if (lowerCaseMessage.includes("business") || lowerCaseMessage.includes("product management")) {
      const businessPaths = learningPathsData.filter((path) =>
        path.tags.some((tag) => tag.includes("business") || tag.includes("product")),
      )
      return {
        content: "Here are some learning paths focused on AI for business and product management:",
        learningPaths: businessPaths,
      }
    }

    // Default response if no specific intent is detected
    return {
      content:
        "I can help you find the right learning path for your AI journey based on your interests, skill level, or specific goals. What are you interested in learning?",
    }
  }

  const applyFilters = (paths: LearningPath[]): LearningPath[] => {
    return paths.filter((path) => {
      // Filter by difficulty
      if (filters.difficulty !== "all" && path.difficulty.toLowerCase() !== filters.difficulty.toLowerCase()) {
        return false
      }

      // Filter by duration (simplified)
      if (filters.duration !== "all") {
        if (filters.duration === "short" && !path.estimatedTime.includes("2-3")) {
          return false
        }
        if (filters.duration === "medium" && !path.estimatedTime.includes("3-6")) {
          return false
        }
        if (filters.duration === "long" && !path.estimatedTime.includes("6")) {
          return false
        }
      }

      // Filter by goal
      if (filters.goal !== "all") {
        if (
          filters.goal === "career" &&
          !path.careerOutcomes.some((outcome) => outcome.toLowerCase().includes("engineer"))
        ) {
          return false
        }
        if (filters.goal === "knowledge" && !path.tags.some((tag) => tag.toLowerCase().includes("learning"))) {
          return false
        }
        if (filters.goal === "business" && !path.tags.some((tag) => tag.toLowerCase().includes("business"))) {
          return false
        }
      }

      return true
    })
  }

  const resetFilters = () => {
    setFilters({
      difficulty: "all",
      duration: "all",
      goal: "all",
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EnhancedBackground mousePosition={mousePosition} />
      <Navbar scrollY={scrollY} />
      <ScrollProgress />

      <main className="relative z-10 pt-24 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold dark:text-white text-slate-900 mb-4 transition-colors duration-700">
              AI Course Bot
            </h1>
            <p className="text-xl dark:text-gray-300 text-slate-700 max-w-3xl mx-auto transition-colors duration-700">
              Get personalized AI learning paths and guidance for your journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative h-[600px] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/40 to-blue-600/40 dark:from-blue-600/30 dark:to-blue-800/30 rounded-xl" />
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                <CardContent className="p-0 relative z-10 flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "flex items-start max-w-[85%]",
                            message.sender === "user" ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <div
                            className={cn(
                              "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold",
                              message.sender === "user" ? "ml-2 bg-gray-300 text-gray-700" : "mr-2 bg-blue-700",
                              "mt-1",
                            )}
                          >
                            {message.sender === "user" ? "U" : "B"}
                          </div>

                          <div className="flex flex-col">
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3",
                                message.sender === "user"
                                  ? "bg-white text-gray-800"
                                  : message.isLoading
                                    ? "bg-blue-50 text-gray-600"
                                    : message.isError
                                      ? "bg-red-50 text-red-800"
                                      : "bg-blue-100 text-gray-800",
                              )}
                            >
                              {message.isLoading ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  <p>{message.content}</p>
                                </div>
                              ) : (
                                <p className="whitespace-pre-line">{message.content}</p>
                              )}
                            </div>

                            {message.learningPaths && message.learningPaths.length > 0 && (
                              <div className="mt-4 space-y-4">
                                {showFilters && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4 mb-4"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <h3 className="font-medium text-gray-800 dark:text-white">
                                        Filter Learning Paths
                                      </h3>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setShowFilters(false)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Difficulty
                                        </label>
                                        <select
                                          className="w-full rounded-md border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                          value={filters.difficulty}
                                          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                        >
                                          <option value="all">All Levels</option>
                                          <option value="beginner">Beginner</option>
                                          <option value="intermediate">Intermediate</option>
                                          <option value="advanced">Advanced</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Duration
                                        </label>
                                        <select
                                          className="w-full rounded-md border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                          value={filters.duration}
                                          onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                                        >
                                          <option value="all">Any Duration</option>
                                          <option value="short">Short (2-3 months)</option>
                                          <option value="medium">Medium (3-6 months)</option>
                                          <option value="long">Long (6+ months)</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Learning Goal
                                        </label>
                                        <select
                                          className="w-full rounded-md border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                                          value={filters.goal}
                                          onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                                        >
                                          <option value="all">Any Goal</option>
                                          <option value="career">Career Transition</option>
                                          <option value="knowledge">Knowledge Building</option>
                                          <option value="business">Business Application</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                      <Button variant="outline" size="sm" className="mr-2" onClick={resetFilters}>
                                        Reset
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}

                                <div className="flex justify-between items-center">
                                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {message.learningPaths.length} Learning Path
                                    {message.learningPaths.length !== 1 ? "s" : ""} Found
                                  </h3>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                    onClick={() => setShowFilters(!showFilters)}
                                  >
                                    <Filter className="h-3 w-3" />
                                    <span>Filter</span>
                                    {showFilters ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>

                                {applyFilters(message.learningPaths).length > 0 ? (
                                  <div className="space-y-6">
                                    {applyFilters(message.learningPaths).map((path) => (
                                      <LearningPathCard key={path.id} path={path} />
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 dark:text-gray-300">
                                      No learning paths match the current filters
                                    </p>
                                    <Button variant="link" size="sm" className="mt-2" onClick={resetFilters}>
                                      Reset Filters
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-blue-500/30 bg-white/10">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask about AI learning paths or get recommendations..."
                        className="bg-white/80 border-none focus-visible:ring-blue-500 text-gray-800 placeholder:text-gray-500"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-white text-blue-600 hover:bg-blue-100"
                        disabled={isLoading || !inputMessage.trim()}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Section */}
            <div>
              <Card className="overflow-hidden border-none shadow-xl backdrop-blur-md relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-purple-600/40 dark:from-purple-600/30 dark:to-purple-800/30 rounded-xl" />
                <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/50 rounded-xl" />

                <CardContent className="p-6 relative z-10">
                  <h2 className="text-xl font-bold mb-4 dark:text-white text-gray-800">How I Can Help You</h2>

                  <div className="space-y-4">
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4">
                      <div className="flex items-start">
                        <Brain className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium dark:text-white text-gray-800">Learning Path Recommendations</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Get personalized learning paths based on your interests, skill level, and goals.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4">
                      <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium dark:text-white text-gray-800">Structured Learning Guidance</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Get step-by-step guidance on what to learn and in what order to achieve your AI goals.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-4">
                      <div className="flex items-start">
                        <Code className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium dark:text-white text-gray-800">Resource Recommendations</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Discover the best articles, videos, courses, and projects to build your AI skills.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-3 dark:text-white text-gray-800">Example Questions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 bg-white/50 dark:bg-slate-800/50"
                        onClick={() => {
                          setInputMessage("How should I start learning machine learning?")
                          handleSendMessage()
                        }}
                      >
                        How should I start learning machine learning?
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 bg-white/50 dark:bg-slate-800/50"
                        onClick={() => {
                          setInputMessage("Recommend a learning path for deep learning")
                          handleSendMessage()
                        }}
                      >
                        Recommend a learning path for deep learning
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 bg-white/50 dark:bg-slate-800/50"
                        onClick={() => {
                          setInputMessage("What should I learn to use AI in business?")
                          handleSendMessage()
                        }}
                      >
                        What should I learn to use AI in business?
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface LearningPathCardProps {
  path: LearningPath
}

function LearningPathCard({ path }: LearningPathCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium dark:text-white text-gray-800">{path.title}</h3>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">{path.difficulty}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{path.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>{path.estimatedTime}</span>
        </div>

        {expanded && (
          <div className="mt-4 space-y-6">
            <div>
              <h4 className="text-sm font-medium dark:text-white text-gray-800 mb-2">Target Audience</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                {path.targetAudience.map((audience, index) => (
                  <li key={index}>{audience}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium dark:text-white text-gray-800 mb-2">Prerequisites</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                {path.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium dark:text-white text-gray-800 mb-2">Learning Journey</h4>
              <div className="space-y-4">
                {path.stages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-4 left-4 h-4 w-0.5 bg-blue-500/50 dark:bg-blue-400/50"></div>
                    )}
                    <div className="flex">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <h5 className="font-medium dark:text-white text-gray-800">{stage.title}</h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.duration}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{stage.description}</p>

                        <div className="mt-2 space-y-2">
                          {stage.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="text-sm bg-white/50 dark:bg-slate-700/50 p-2 rounded-md flex items-start"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium dark:text-white text-gray-800">{topic.title}</span>
                                {topic.isOptional && (
                                  <Badge className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    Optional
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium dark:text-white text-gray-800 mb-2">Career Outcomes</h4>
              <div className="flex flex-wrap gap-2">
                {path.careerOutcomes.map((outcome, index) => (
                  <Badge key={index} variant="outline" className="bg-white/50 dark:bg-slate-700/50">
                    {outcome}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="flex items-center gap-1">
                <span>Start This Path</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
