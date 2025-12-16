"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Trophy, 
  Target, 
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Award,
  Users,
  Search,
  Lock,
  Unlock,
  Calendar,
  BarChart3,
  Brain,
  Briefcase,
  TrendingUp as TrendUp,
  Shield,
  AlertTriangle,
  PieChart,
  Heart,
  DollarSign,
  GraduationCap,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Scale,
  ShieldCheck,
  AlertCircle,
  Calculator,
  Home,
  PiggyBank,
  CreditCard,
  Umbrella,
  Target as TargetIcon,
  CheckSquare,
  XCircle,
  TrendingDown,
  Zap,
  Timer,
  Filter,
  ChevronRight,
  Folder,
  FolderOpen,
  Book,
  Video,
  File,
  Image,
  Link
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  module: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  topics: string[];
  isEnrolled: boolean;
  progress: number;
  xpReward: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  warning?: string;
  icon: any;
  color: string;
  filePath: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  icon: any;
  color: string;
}

interface Category {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  icon: any;
  color: string;
}

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("categories");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Mock course data based on the actual course structure
  useEffect(() => {
    const generateCourses = () => {
      const courseData: Course[] = [
        // Stock Market Foundations
        {
          id: "stock-foundations-001",
          title: "Stock Market Foundations",
          description: "Beginner friendly introduction to stock market basics",
          category: "stock-market",
          module: "stock-foundations",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 10,
          topics: ["How the stock market works", "Primary vs secondary market", "IPO basics", "Market indices", "Trading hours"],
          isEnrolled: true,
          progress: 60,
          xpReward: 150,
          importance: "high",
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-600",
          filePath: "/courses/stock-market-foundations/"
        },
        // Mutual Funds
        {
          id: "mutual-funds-001",
          title: "Mutual Funds Deep Dive",
          description: "Comprehensive guide to mutual fund investing",
          category: "mutual-funds",
          module: "mutual-funds-deep-dive",
          level: "intermediate",
          duration: "3-4 hours",
          lessons: 11,
          topics: ["Types of mutual funds", "Index vs active funds", "How NAV works", "Expense ratio", "Fund management"],
          isEnrolled: false,
          progress: 0,
          xpReward: 200,
          importance: "high",
          icon: PieChart,
          color: "bg-green-100 text-green-600",
          filePath: "/courses/mutual-funds-deep-dive/"
        },
        // SIP & Wealth Building
        {
          id: "sip-wealth-001",
          title: "SIP & Wealth Building",
          description: "Master systematic investment and wealth creation",
          category: "wealth-building",
          module: "sip-wealth-building",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 9,
          topics: ["SIP vs lump-sum", "Power of compounding", "SIP calculations", "Financial goals", "Asset allocation"],
          isEnrolled: true,
          progress: 30,
          xpReward: 175,
          importance: "high",
          icon: PiggyBank,
          color: "bg-purple-100 text-purple-600",
          filePath: "/courses/sip-wealth-building/"
        },
        // Behavioral Finance
        {
          id: "behavioral-finance-001",
          title: "Behavioral Finance Psychology",
          description: "Understanding the psychology of investing",
          category: "psychology",
          module: "behavioral-finance-psychology",
          level: "intermediate",
          duration: "1-2 hours",
          lessons: 5,
          topics: ["Cognitive biases", "Emotional investing", "Decision making", "Market psychology", "Discipline building"],
          isEnrolled: false,
          progress: 0,
          xpReward: 125,
          importance: "medium",
          icon: Brain,
          color: "bg-orange-100 text-orange-600",
          filePath: "/courses/behavioral-finance-psychology/"
        },
        // Risk Management
        {
          id: "risk-management-001",
          title: "Risk Management & Safety",
          description: "Learn to protect your investments",
          category: "risk-management",
          module: "risk-management-safety",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 7,
          topics: ["Understanding volatility", "Risk measurement", "Drawdowns", "Diversification", "Emergency funds"],
          isEnrolled: true,
          progress: 45,
          xpReward: 150,
          importance: "high",
          icon: Shield,
          color: "bg-red-100 text-red-600",
          filePath: "/courses/risk-management-safety/"
        },
        // Scam Awareness
        {
          id: "scam-awareness-001",
          title: "Scam Awareness",
          description: "VERY IMPORTANT - Protect yourself from fraud",
          category: "safety",
          module: "scam-awareness",
          level: "beginner",
          duration: "1-2 hours",
          lessons: 7,
          topics: ["Stock market fraud", "Pump and dump schemes", "WhatsApp scams", "Broker verification", "Ponzi schemes"],
          isEnrolled: true,
          progress: 80,
          xpReward: 100,
          importance: "critical",
          icon: AlertTriangle,
          color: "bg-yellow-100 text-yellow-800",
          filePath: "/courses/scam-awareness/"
        },
        // Options Trading
        {
          id: "options-basics-001",
          title: "Options Trading (Educational)",
          description: "SEBI Safe - For education purposes only",
          category: "derivatives",
          module: "financial-derivatives",
          level: "advanced",
          duration: "2-3 hours",
          lessons: 6,
          topics: ["Options basics", "Call and put options", "Premiums", "Time decay", "Risk management"],
          isEnrolled: false,
          progress: 0,
          xpReward: 200,
          importance: "medium",
          warning: "For educational purposes only - Not trading advice",
          icon: Calculator,
          color: "bg-indigo-100 text-indigo-600",
          filePath: "/courses/financial-derivatives/"
        },
        // Personal Finance
        {
          id: "personal-finance-001",
          title: "Personal Finance Basics",
          description: "Essential money management skills",
          category: "personal-finance",
          module: "money-basics",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 8,
          topics: ["Budgeting", "Credit score", "Good vs bad debt", "Saving vs investing", "Tax planning"],
          isEnrolled: true,
          progress: 20,
          xpReward: 175,
          importance: "high",
          icon: Home,
          color: "bg-teal-100 text-teal-600",
          filePath: "/courses/money-basics/"
        },
        // Financial Planning
        {
          id: "financial-planning-001",
          title: "Financial Planning Guide",
          description: "Create your personal financial roadmap",
          category: "planning",
          module: "module-01-money-basics",
          level: "beginner",
          duration: "1-2 hours",
          lessons: 6,
          topics: ["Money planning", "Financial goals", "Investment amounts", "Lifestyle inflation", "Money habits"],
          isEnrolled: false,
          progress: 0,
          xpReward: 125,
          importance: "high",
          icon: GraduationCap,
          color: "bg-pink-100 text-pink-600",
          filePath: "/courses/module-01-money-basics/"
        },
        // Banking & Insurance
        {
          id: "banking-insurance-001",
          title: "Banking & Insurance Fundamentals",
          description: "Understanding banking systems and insurance products",
          category: "banking",
          module: "banking-insurance",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 8,
          topics: ["Banking fundamentals", "Digital banking", "Loans", "Insurance basics", "Risk management"],
          isEnrolled: false,
          progress: 0,
          xpReward: 150,
          importance: "medium",
          icon: CreditCard,
          color: "bg-cyan-100 text-cyan-600",
          filePath: "/courses/banking-insurance/"
        },
        // Retirement Planning
        {
          id: "retirement-planning-001",
          title: "Retirement Planning Basics",
          description: "Plan for your financial future and retirement",
          category: "retirement",
          module: "retirement-planning",
          level: "intermediate",
          duration: "2-3 hours",
          lessons: 10,
          topics: ["Retirement fundamentals", "Corpus calculation", "Investment options", "NPS", "Withdrawal strategies"],
          isEnrolled: false,
          progress: 0,
          xpReward: 200,
          importance: "high",
          icon: Umbrella,
          color: "bg-purple-100 text-purple-600",
          filePath: "/courses/retirement-planning/"
        },
        // Real Estate Investment
        {
          id: "real-estate-001",
          title: "Real Estate Investment",
          description: "Learn about property investment and REITs",
          category: "real-estate",
          module: "real-estate-investment",
          level: "advanced",
          duration: "3-4 hours",
          lessons: 10,
          topics: ["Property investment", "Market analysis", "Financing", "Legal aspects", "REITs"],
          isEnrolled: false,
          progress: 0,
          xpReward: 250,
          importance: "medium",
          icon: Home,
          color: "bg-green-100 text-green-600",
          filePath: "/courses/real-estate-investment/"
        },
        // Tax Planning
        {
          id: "tax-planning-001",
          title: "Tax Planning Essentials",
          description: "Master tax-saving strategies and compliance",
          category: "tax-planning",
          module: "tax-planning-essentials",
          level: "intermediate",
          duration: "2-3 hours",
          lessons: 8,
          topics: ["Tax basics", "Income tax slabs", "Deductions", "Capital gains", "Tax filing"],
          isEnrolled: false,
          progress: 0,
          xpReward: 175,
          importance: "high",
          icon: Calculator,
          color: "bg-blue-100 text-blue-600",
          filePath: "/courses/tax-planning-essentials/"
        },
        // Emergency Fund & Debt Management
        {
          id: "emergency-fund-001",
          title: "Emergency Fund & Debt Management",
          description: "Build financial safety nets and manage debt effectively",
          category: "emergency-fund",
          module: "emergency-fund-debt",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 7,
          topics: ["Emergency fund basics", "Calculating needs", "Debt types", "Debt elimination", "Financial security"],
          isEnrolled: true,
          progress: 35,
          xpReward: 125,
          importance: "high",
          icon: Shield,
          color: "bg-red-100 text-red-600",
          filePath: "/courses/emergency-fund-debt/"
        },
        // Indian Financial System
        {
          id: "indian-financial-001",
          title: "Indian Financial System",
          description: "Understanding India's financial infrastructure and regulations",
          category: "financial-system",
          module: "indian-financial-system",
          level: "beginner",
          duration: "2-3 hours",
          lessons: 10,
          topics: ["Financial system overview", "RBI functions", "Banking structure", "Capital markets", "Regulatory framework"],
          isEnrolled: false,
          progress: 0,
          xpReward: 150,
          importance: "medium",
          icon: Briefcase,
          color: "bg-indigo-100 text-indigo-600",
          filePath: "/courses/indian-financial-system/"
        },
        // Advanced Investment Strategies
        {
          id: "advanced-strategies-001",
          title: "Advanced Investment Strategies",
          description: "Sophisticated investment techniques for experienced investors",
          category: "advanced-strategies",
          module: "advanced-investment-strategies",
          level: "advanced",
          duration: "4-5 hours",
          lessons: 10,
          topics: ["Portfolio theory", "Asset allocation", "Alternative investments", "International investing", "Risk management"],
          isEnrolled: false,
          progress: 0,
          xpReward: 300,
          importance: "medium",
          icon: TrendingUp,
          color: "bg-purple-100 text-purple-600",
          filePath: "/courses/advanced-investment-strategies/"
        },
        // Stock Market Analysis
        {
          id: "stock-analysis-001",
          title: "Stock Market Analysis",
          description: "Learn fundamental and technical analysis techniques",
          category: "market-analysis",
          module: "stock-market-analysis",
          level: "intermediate",
          duration: "3-4 hours",
          lessons: 12,
          topics: ["Fundamental analysis", "Financial statements", "Ratio analysis", "Technical analysis", "Market patterns"],
          isEnrolled: false,
          progress: 0,
          xpReward: 225,
          importance: "high",
          icon: BarChart3,
          color: "bg-blue-100 text-blue-600",
          filePath: "/courses/stock-market-analysis/"
        }
      ];

      // Generate categories from courses
      const categoryMap = new Map<string, Course[]>();
      courseData.forEach(course => {
        if (!categoryMap.has(course.category)) {
          categoryMap.set(course.category, []);
        }
        categoryMap.get(course.category)?.push(course);
      });

      const categoryData: Category[] = [
        {
          id: "stock-market",
          title: "Stock Market",
          description: "Learn stock market basics and advanced trading strategies",
          modules: [{
            id: "stock-foundations",
            title: "Stock Market Foundations",
            description: "Master the fundamentals of stock market investing",
            courses: categoryMap.get("stock-market") || [],
            icon: TrendingUp,
            color: "bg-blue-100 text-blue-600"
          }],
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: "mutual-funds",
          title: "Mutual Funds",
          description: "Comprehensive mutual fund education and strategies",
          modules: [{
            id: "mutual-funds-deep-dive",
            title: "Mutual Funds Deep Dive",
            description: "Everything you need to know about mutual funds",
            courses: categoryMap.get("mutual-funds") || [],
            icon: PieChart,
            color: "bg-green-100 text-green-600"
          }],
          icon: PieChart,
          color: "bg-green-100 text-green-600"
        },
        {
          id: "wealth-building",
          title: "Wealth Building",
          description: "Build long-term wealth through systematic investing",
          modules: [{
            id: "sip-wealth-building",
            title: "SIP & Wealth Building",
            description: "Master systematic investment planning",
            courses: categoryMap.get("wealth-building") || [],
            icon: PiggyBank,
            color: "bg-purple-100 text-purple-600"
          }],
          icon: PiggyBank,
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: "psychology",
          title: "Behavioral Finance",
          description: "Understand the psychology behind investment decisions",
          modules: [{
            id: "behavioral-finance-psychology",
            title: "Behavioral Finance Psychology",
            description: "Master your investment psychology",
            courses: categoryMap.get("psychology") || [],
            icon: Brain,
            color: "bg-orange-100 text-orange-600"
          }],
          icon: Brain,
          color: "bg-orange-100 text-orange-600"
        },
        {
          id: "risk-management",
          title: "Risk Management",
          description: "Learn to protect and manage investment risks",
          modules: [{
            id: "risk-management-safety",
            title: "Risk Management & Safety",
            description: "Comprehensive risk management strategies",
            courses: categoryMap.get("risk-management") || [],
            icon: Shield,
            color: "bg-red-100 text-red-600"
          }],
          icon: Shield,
          color: "bg-red-100 text-red-600"
        },
        {
          id: "safety",
          title: "Safety & Security",
          description: "Protect yourself from scams and fraud",
          modules: [{
            id: "scam-awareness",
            title: "Scam Awareness",
            description: "Critical knowledge to protect your investments",
            courses: categoryMap.get("safety") || [],
            icon: AlertTriangle,
            color: "bg-yellow-100 text-yellow-800"
          }],
          icon: AlertTriangle,
          color: "bg-yellow-100 text-yellow-800"
        },
        {
          id: "derivatives",
          title: "Derivatives",
          description: "Advanced derivatives education (for learning purposes)",
          modules: [{
            id: "financial-derivatives",
            title: "Financial Derivatives",
            description: "Understanding options and derivatives",
            courses: categoryMap.get("derivatives") || [],
            icon: Calculator,
            color: "bg-indigo-100 text-indigo-600"
          }],
          icon: Calculator,
          color: "bg-indigo-100 text-indigo-600"
        },
        {
          id: "personal-finance",
          title: "Personal Finance",
          description: "Essential money management and personal finance skills",
          modules: [{
            id: "money-basics",
            title: "Money Basics",
            description: "Fundamental personal finance concepts",
            courses: categoryMap.get("personal-finance") || [],
            icon: Home,
            color: "bg-teal-100 text-teal-600"
          }],
          icon: Home,
          color: "bg-teal-100 text-teal-600"
        },
        {
          id: "planning",
          title: "Financial Planning",
          description: "Create comprehensive financial plans for your future",
          modules: [{
            id: "module-01-money-basics",
            title: "Financial Planning Basics",
            description: "Essential financial planning concepts",
            courses: categoryMap.get("planning") || [],
            icon: GraduationCap,
            color: "bg-pink-100 text-pink-600"
          }],
          icon: GraduationCap,
          color: "bg-pink-100 text-pink-600"
        },
        {
          id: "banking",
          title: "Banking & Insurance",
          description: "Understanding banking systems and insurance products",
          modules: [{
            id: "banking-insurance",
            title: "Banking & Insurance",
            description: "Comprehensive banking and insurance education",
            courses: categoryMap.get("banking") || [],
            icon: CreditCard,
            color: "bg-cyan-100 text-cyan-600"
          }],
          icon: CreditCard,
          color: "bg-cyan-100 text-cyan-600"
        },
        {
          id: "retirement",
          title: "Retirement Planning",
          description: "Plan for a secure financial future and retirement",
          modules: [{
            id: "retirement-planning",
            title: "Retirement Planning",
            description: "Comprehensive retirement planning strategies",
            courses: categoryMap.get("retirement") || [],
            icon: Umbrella,
            color: "bg-purple-100 text-purple-600"
          }],
          icon: Umbrella,
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: "real-estate",
          title: "Real Estate",
          description: "Learn about real estate investment and property management",
          modules: [{
            id: "real-estate-investment",
            title: "Real Estate Investment",
            description: "Real estate investment strategies and analysis",
            courses: categoryMap.get("real-estate") || [],
            icon: Home,
            color: "bg-green-100 text-green-600"
          }],
          icon: Home,
          color: "bg-green-100 text-green-600"
        },
        {
          id: "tax-planning",
          title: "Tax Planning",
          description: "Master tax-saving strategies and compliance",
          modules: [{
            id: "tax-planning-essentials",
            title: "Tax Planning Essentials",
            description: "Essential tax planning knowledge and strategies",
            courses: categoryMap.get("tax-planning") || [],
            icon: Calculator,
            color: "bg-blue-100 text-blue-600"
          }],
          icon: Calculator,
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: "emergency-fund",
          title: "Emergency Fund & Debt",
          description: "Build financial safety nets and manage debt",
          modules: [{
            id: "emergency-fund-debt",
            title: "Emergency Fund & Debt Management",
            description: "Essential emergency fund and debt management strategies",
            courses: categoryMap.get("emergency-fund") || [],
            icon: Shield,
            color: "bg-red-100 text-red-600"
          }],
          icon: Shield,
          color: "bg-red-100 text-red-600"
        },
        {
          id: "financial-system",
          title: "Financial System",
          description: "Understanding India's financial infrastructure",
          modules: [{
            id: "indian-financial-system",
            title: "Indian Financial System",
            description: "Comprehensive understanding of Indian financial system",
            courses: categoryMap.get("financial-system") || [],
            icon: Briefcase,
            color: "bg-indigo-100 text-indigo-600"
          }],
          icon: Briefcase,
          color: "bg-indigo-100 text-indigo-600"
        },
        {
          id: "advanced-strategies",
          title: "Advanced Strategies",
          description: "Sophisticated investment techniques for experienced investors",
          modules: [{
            id: "advanced-investment-strategies",
            title: "Advanced Investment Strategies",
            description: "Advanced investment strategies and techniques",
            courses: categoryMap.get("advanced-strategies") || [],
            icon: TrendingUp,
            color: "bg-purple-100 text-purple-600"
          }],
          icon: TrendingUp,
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: "market-analysis",
          title: "Market Analysis",
          description: "Learn fundamental and technical analysis techniques",
          modules: [{
            id: "stock-market-analysis",
            title: "Stock Market Analysis",
            description: "Comprehensive stock market analysis techniques",
            courses: categoryMap.get("market-analysis") || [],
            icon: BarChart3,
            color: "bg-blue-100 text-blue-600"
          }],
          icon: BarChart3,
          color: "bg-blue-100 text-blue-600"
        }
      ];

      setCourses(courseData);
      setCategories(categoryData);
      setLoading(false);
    };

    generateCourses();
  }, []);

  const learningPaths = [
    {
      id: "beginner-path",
      title: "Complete Beginner Path",
      description: "Start from zero and build strong foundations",
      categories: ["stock-market", "wealth-building", "risk-management", "safety"],
      duration: "2-3 weeks",
      level: "beginner" as const,
      totalXp: 575,
      icon: Star,
      color: "bg-green-100 text-green-600"
    },
    {
      id: "safety-first",
      title: "Safety First Path",
      description: "Learn to protect yourself and invest safely",
      categories: ["safety", "risk-management", "personal-finance"],
      duration: "1-2 weeks",
      level: "beginner" as const,
      totalXp: 400,
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "wealth-builder",
      title: "Wealth Builder Path",
      description: "Focus on long-term wealth creation",
      categories: ["wealth-building", "mutual-funds", "planning"],
      duration: "2-3 weeks",
      level: "intermediate" as const,
      totalXp: 500,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "advanced-investor",
      title: "Advanced Investor Path",
      description: "Master sophisticated investment strategies",
      categories: ["market-analysis", "advanced-strategies", "derivatives"],
      duration: "4-6 weeks",
      level: "advanced" as const,
      totalXp: 725,
      icon: Award,
      color: "bg-red-100 text-red-600"
    }
  ];

  const achievements = [
    {
      id: "safety-first",
      title: "Safety First",
      description: "Complete Scam Awareness course",
      icon: ShieldCheck,
      isUnlocked: true,
      unlockedAt: "2024-01-15"
    },
    {
      id: "foundation-builder",
      title: "Foundation Builder",
      description: "Complete Stock Market Foundations",
      icon: Briefcase,
      isUnlocked: false,
      progress: 60
    },
    {
      id: "wealth-creator",
      title: "Wealth Creator",
      description: "Complete SIP & Wealth Building course",
      icon: PiggyBank,
      isUnlocked: false,
      progress: 30
    },
    {
      id: "knowledge-seeker",
      title: "Knowledge Seeker",
      description: "Complete 5 courses",
      icon: Brain,
      isUnlocked: false,
      progress: 2
    },
    {
      id: "risk-manager",
      title: "Risk Manager",
      description: "Complete Risk Management course",
      icon: Shield,
      isUnlocked: false,
      progress: 45
    },
    {
      id: "financial-planner",
      title: "Financial Planner",
      description: "Complete Personal Finance course",
      icon: GraduationCap,
      isUnlocked: false,
      progress: 20
    }
  ];

  const stats = {
    totalCategories: categories.length,
    completedCategories: 1,
    totalTopics: courses.reduce((sum, course) => sum + course.lessons, 0),
    completedTopics: 35,
    totalXp: courses.reduce((sum, course) => sum + course.xpReward, 0),
    currentStreak: 5,
    learningHours: 18
  };

  const handleEnrollCourse = (courseId: string) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: true, progress: 0 }
          : course
      )
    );
    // Show success notification (you could add a toast notification here)
    console.log(`Enrolled in course: ${courseId}`);
  };

  const handleStartLearning = (course: Course) => {
    // Redirect to course content or learning interface
    console.log(`Starting learning for: ${course.title}`);
    // You could use router.push(`/learn/course/${course.id}`) here
    alert(`Starting "${course.title}" course!`);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleContinueLearning = (course: Course) => {
    // Continue from where user left off
    console.log(`Continuing learning for: ${course.title}`);
    // You could use router.push(`/learn/course/${course.id}?continue=true`) here
    alert(`Continuing "${course.title}" course from ${course.progress}% progress!`);
  };

  const getFilteredCourses = () => {
    return courses.filter(course => {
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesLevel && matchesSearch;
    });
  };

  const getFilteredCategories = () => {
    if (selectedCategory === "all") return categories;
    return categories.filter(category => category.id === selectedCategory);
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-3 rounded-lg ${course.color}`}>
              <course.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                {course.importance === "critical" && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    CRITICAL
                  </Badge>
                )}
                {course.importance === "high" && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    IMPORTANT
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">{course.description}</CardDescription>
            </div>
          </div>
          <Badge className={
            course.level === "beginner" ? "bg-green-100 text-green-800" :
            course.level === "intermediate" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }>
            {course.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Warning for certain courses */}
          {course.warning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">{course.warning}</p>
              </div>
            </div>
          )}

          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{course.topics.length} topics</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {course.isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          {/* Topics Preview */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Topics:</h4>
            <div className="grid grid-cols-1 gap-1">
              {course.topics.slice(0, 3).map((topic: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>{topic}</span>
                </div>
              ))}
              {course.topics.length > 3 && (
                <div className="text-xs text-blue-600 font-medium">
                  +{course.topics.length - 3} more topics
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="flex space-x-2">
            {course.isEnrolled ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => course.progress > 0 ? handleContinueLearning(course) : handleStartLearning(course)}
              >
                {course.progress > 0 ? "Continue Learning" : "Start Course"}
              </Button>
            ) : (
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => handleEnrollCourse(course.id)}
              >
                Enroll Now
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleViewCourse(course)}
              title="View Course Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* XP Reward */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">XP Reward:</span>
            <Badge className="bg-purple-100 text-purple-800">
              +{course.xpReward} XP
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className={`p-4 rounded-lg ${category.color}`}>
            <category.icon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{category.title}</CardTitle>
            <CardDescription className="mt-1">{category.description}</CardDescription>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Folder className="h-4 w-4" />
              <span>{category.modules.length} modules</span>
            </div>
            <div className="flex items-center space-x-1">
              <Book className="h-4 w-4" />
              <span>{category.modules.reduce((sum, module) => sum + module.courses.length, 0)} courses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout user={{
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        avatar: "/placeholder-avatar.jpg",
        level: 5,
        xp: 2500,
        nextLevelXp: 3000,
        walletBalance: 15000,
        notifications: 3
      }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={{
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      avatar: "/placeholder-avatar.jpg",
      level: 5,
      xp: 2500,
      nextLevelXp: 3000,
      walletBalance: 15000,
      notifications: 3
    }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span>INR100 Learning Academy</span>
              <Badge className="bg-green-100 text-green-800">
                <Trophy className="h-3 w-3 mr-1" />
                Earn XP
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Master investing with our comprehensive courses designed for INR100 users
            </p>
          </div>
          {selectedCategory !== "all" && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory("all")}
              className="mt-4 md:mt-0"
            >
              Back to All Categories
            </Button>
          )}
        </div>

        {/* Learning Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedCategories}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completedTopics}/{stats.totalTopics}</div>
              <div className="text-sm text-gray-600">Topics</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalXp}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.learningHours}h</div>
              <div className="text-sm text-gray-600">Learning Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Course Categories</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses, topics, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Category View or Course List */}
            {selectedCategory === "all" && !searchQuery && selectedLevel === "all" ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Categories</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory !== "all" 
                      ? categories.find(c => c.id === selectedCategory)?.title + " Courses"
                      : "All Courses"
                    }
                  </h2>
                  <div className="text-sm text-gray-600">
                    {getFilteredCourses().length} course{getFilteredCourses().length !== 1 ? 's' : ''} found
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredCourses().map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}

            {/* Critical Course Highlight */}
            <Card className="border-2 border-yellow-300 bg-yellow-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="font-bold text-yellow-800">🚨 Must Complete: Scam Awareness</h3>
                    <p className="text-yellow-700 text-sm">
                      This course is critical for your financial safety. Complete it before investing real money.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${path.color}`}>
                        <path.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{path.duration}</span>
                        </div>
                        <Badge className={
                          path.level === "beginner" ? "bg-green-100 text-green-800" :
                          path.level === "intermediate" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {path.level}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Included Categories:</h4>
                        <div className="space-y-1">
                          {path.categories.map((catId: string) => {
                            const category = categories.find(c => c.id === catId);
                            return category ? (
                              <div key={catId} className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span>{category.title}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total XP:</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          +{path.totalXp} XP
                        </Badge>
                      </div>

                      <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        Start Learning Path
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`border-0 shadow-lg ${achievement.isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gray-50'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      achievement.isUnlocked ? 'bg-yellow-200' : 'bg-gray-200'
                    }`}>
                      <achievement.icon className={`h-8 w-8 ${
                        achievement.isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    
                    {achievement.isUnlocked ? (
                      <div className="space-y-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Unlocked on {achievement.unlockedAt}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge className="bg-gray-100 text-gray-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                        {achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progress</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Course Details Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-4 rounded-lg ${selectedCourse.color}`}>
                      <selectedCourse.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={
                          selectedCourse.level === "beginner" ? "bg-green-100 text-green-800" :
                          selectedCourse.level === "intermediate" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {selectedCourse.level}
                        </Badge>
                        {selectedCourse.importance === "critical" && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            CRITICAL
                          </Badge>
                        )}
                        {selectedCourse.importance === "high" && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Star className="h-3 w-3 mr-1" />
                            IMPORTANT
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowCourseModal(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Course Warning */}
                {selectedCourse.warning && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">{selectedCourse.warning}</p>
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Course Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Duration: {selectedCourse.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Lessons: {selectedCourse.lessons}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span>Topics: {selectedCourse.topics.length}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-gray-500" />
                        <span>XP Reward: +{selectedCourse.xpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Learning Progress</h3>
                    {selectedCourse.isEnrolled ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{selectedCourse.progress}%</span>
                        </div>
                        <Progress value={selectedCourse.progress} className="h-2" />
                        <p className="text-sm text-gray-600">
                          {selectedCourse.progress === 0 ? "Not started" : 
                           selectedCourse.progress === 100 ? "Completed" : 
                           "In progress"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Not enrolled yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Topics */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Course Topics</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {selectedCourse.topics.map((topic, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {selectedCourse.isEnrolled ? (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => {
                        selectedCourse.progress > 0 ? handleContinueLearning(selectedCourse) : handleStartLearning(selectedCourse);
                        setShowCourseModal(false);
                      }}
                    >
                      {selectedCourse.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => {
                        handleEnrollCourse(selectedCourse.id);
                        setShowCourseModal(false);
                      }}
                    >
                      Enroll Now
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowCourseModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}