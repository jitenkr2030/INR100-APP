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

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  xpReward: number;
  order: number;
}

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
  lessonsList?: Lesson[];
  completedLessons?: string[];
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
  const [userData, setUserData] = useState<any>(null);

  // Fetch real course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Demo user ID - in real app, get from authentication
        const userId = "demo-user-id";
        
        const response = await fetch(`/api/learn/courses?userId=${userId}&category=${selectedCategory}&level=${selectedLevel}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log("Courses API response:", data);
          setCourses(data.courses || []);
          setUserData(data.user);
          
          // Log first course for debugging
          if (data.courses && data.courses.length > 0) {
            console.log("First course loaded:", data.courses[0]);
            console.log("Course lessonsList:", data.courses[0].lessonsList);
          }
        } else {
          console.error("Failed to fetch courses:", data.error);
          generateFallbackCourses();
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        generateFallbackCourses();
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [selectedCategory, selectedLevel]);

  // Generate mock data as fallback if no real data available
  const generateFallbackCourses = () => {
    const courseData: Course[] = [
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
        warning: "Critical security course - Must complete before investing",
        icon: AlertTriangle,
        color: "bg-yellow-100 text-yellow-800",
        filePath: "/courses/scam-awareness/"
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

    const categoryTitles: { [key: string]: string } = {
      "stock-market": "Stock Market",
      "mutual-funds": "Mutual Funds", 
      "wealth-building": "Wealth Building",
      "psychology": "Behavioral Finance",
      "risk-management": "Risk Management",
      "safety": "Safety & Security"
    };

    const categoryData: Category[] = Array.from(categoryMap.entries()).map(([categoryId, categoryCourses]) => ({
      id: categoryId,
      title: categoryTitles[categoryId] || categoryId,
      description: `${categoryCourses.length} course${categoryCourses.length > 1 ? 's' : ''} available`,
      modules: [{
        id: categoryId,
        title: categoryTitles[categoryId] || categoryId,
        description: `${categoryCourses.length} course${categoryCourses.length > 1 ? 's' : ''} available`,
        courses: categoryCourses,
        icon: TrendingUp,
        color: "bg-blue-100 text-blue-600"
      }],
      icon: TrendingUp,
      color: "bg-blue-100 text-blue-600"
    }));

    setCourses(courseData);
    setCategories(categoryData);
    setUserData({
      subscriptionTier: "BASIC",
      totalXp: 2500,
      level: 5,
      completedLessons: 3
    });
  };

  // Generate categories from courses
  useEffect(() => {
    if (courses.length > 0) {
      const generateCategories = () => {
        const categoryMap = new Map<string, Course[]>();
        courses.forEach(course => {
          if (!categoryMap.has(course.category)) {
            categoryMap.set(course.category, []);
          }
          categoryMap.get(course.category)?.push(course);
        });

        const categoryTitles: { [key: string]: string } = {
          "stock-market": "Stock Market",
          "mutual-funds": "Mutual Funds", 
          "wealth-building": "Wealth Building",
          "psychology": "Behavioral Finance",
          "risk-management": "Risk Management",
          "safety": "Safety & Security"
        };

        const categoryData: Category[] = Array.from(categoryMap.entries()).map(([categoryId, categoryCourses]) => ({
          id: categoryId,
          title: categoryTitles[categoryId] || categoryId,
          description: `${categoryCourses.length} course${categoryCourses.length > 1 ? 's' : ''} available`,
          modules: [{
            id: categoryId,
            title: categoryTitles[categoryId] || categoryId,
            description: `${categoryCourses.length} course${categoryCourses.length > 1 ? 's' : ''} available`,
            courses: categoryCourses,
            icon: TrendingUp,
            color: "bg-blue-100 text-blue-600"
          }],
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-600"
        }));

        setCategories(categoryData);
      };

      generateCategories();
    }
  }, [courses]);



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
    completedCategories: courses.filter(c => c.progress === 100).length,
    totalTopics: courses.reduce((sum, course) => sum + course.lessons, 0),
    completedTopics: Math.round(courses.reduce((sum, course) => sum + (course.progress * course.lessons / 100), 0)),
    totalXp: userData?.totalXp || 2500,
    currentStreak: 5,
    learningHours: 18
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      const userId = "demo-user-id";
      
      const response = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          action: 'enroll'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update local course state
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course.id === courseId 
              ? { ...course, isEnrolled: true, progress: 0 }
              : course
          )
        );
        
        // Update user data if needed
        if (userData) {
          setUserData(prev => ({
            ...prev,
            totalXp: prev.totalXp + (data.xpEarned || 25)
          }));
        }
        
        alert(`Successfully enrolled in course! You earned ${data.xpEarned || 25} XP!`);
      } else {
        alert(data.error || "Failed to enroll in course");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in course. Please try again.");
    }
  };

  const handleStartLearning = (course: Course) => {
    console.log("handleStartLearning called for course:", course.id, course.title);
    
    if (!course.isEnrolled) {
      console.log("Course not enrolled, calling handleEnrollCourse");
      handleEnrollCourse(course.id);
      return;
    }
    
    // Navigate to lesson viewer
    const lessonId = course.lessonsList?.[0]?.id || 'lesson-01';
    console.log("Navigating to:", `/learn/lesson/${course.id}/${lessonId}`);
    window.location.href = `/learn/lesson/${course.id}/${lessonId}`;
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleContinueLearning = (course: Course) => {
    console.log("handleContinueLearning called for course:", course.id, course.title);
    
    // Navigate to continue from last lesson
    const nextLessonId = course.lessonsList?.find(lesson => 
      !course.completedLessons?.includes(lesson.id)
    )?.id;
    
    console.log("Next lesson ID found:", nextLessonId);
    
    if (nextLessonId) {
      const url = `/learn/lesson/${course.id}/${nextLessonId}?continue=true`;
      console.log("Continuing to:", url);
      window.location.href = url;
    } else {
      console.log("All lessons completed");
      alert(`You've completed all lessons in "${course.title}"! 🎉`);
    }
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

                {/* Lessons List */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Course Lessons</h3>
                  {selectedCourse.lessonsList && selectedCourse.lessonsList.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedCourse.lessonsList.map((lesson, index) => {
                        const isCompleted = selectedCourse.completedLessons?.includes(lesson.id);
                        return (
                          <div key={lesson.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
                              </div>
                              <span className="text-sm font-medium">{lesson.title}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {lesson.duration}min • {lesson.xpReward} XP
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedCourse.topics.map((topic, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  )}
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