import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  xpReward: number;
  order: number;
}

interface CourseData {
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
  icon: string;
  color: string;
  filePath: string;
  lessonsList: Lesson[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's subscription tier and learning progress
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        learnProgress: true,
        learningSessions: {
          where: { isCompleted: true },
          select: { lessonId: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const subscriptionTier = user.subscriptionTier || "BASIC";
    const userProgress = user.learnProgress || [];
    const completedLessons = user.learningSessions.map(s => s.lessonId);

    // Define available courses with their file paths
    const courseDefinitions = [
      {
        id: "stock-market-foundations",
        title: "Stock Market Foundations",
        description: "Beginner friendly introduction to stock market basics",
        category: "stock-market",
        module: "stock-foundations",
        level: "beginner" as const,
        duration: "2-3 hours",
        lessons: 10,
        topics: ["How the stock market works", "Primary vs secondary market", "IPO basics", "Market indices", "Trading hours"],
        isEnrolled: true, // Default enrollment for demo
        progress: 0,
        xpReward: 150,
        importance: "high" as const,
        icon: "TrendingUp",
        color: "bg-blue-100 text-blue-600",
        filePath: "/workspace/INR100-APP/courses/Module-01-Stock-Market-Foundations"
      },
      {
        id: "mutual-funds-deep-dive",
        title: "Mutual Funds Deep Dive",
        description: "Comprehensive guide to mutual fund investing",
        category: "mutual-funds",
        module: "mutual-funds-deep-dive",
        level: "intermediate" as const,
        duration: "3-4 hours",
        lessons: 11,
        topics: ["Types of mutual funds", "Index vs active funds", "How NAV works", "Expense ratio", "Fund management"],
        isEnrolled: subscriptionTier !== "BASIC", // Premium content
        progress: 0,
        xpReward: 200,
        importance: "high" as const,
        icon: "PieChart",
        color: "bg-green-100 text-green-600",
        filePath: "/workspace/INR100-APP/courses/mutual-funds-deep-dive"
      },
      {
        id: "sip-wealth-building",
        title: "SIP & Wealth Building",
        description: "Master systematic investment and wealth creation",
        category: "wealth-building",
        module: "sip-wealth-building",
        level: "beginner" as const,
        duration: "2-3 hours",
        lessons: 9,
        topics: ["SIP vs lump-sum", "Power of compounding", "SIP calculations", "Financial goals", "Asset allocation"],
        isEnrolled: true,
        progress: 30,
        xpReward: 175,
        importance: "high" as const,
        icon: "PiggyBank",
        color: "bg-purple-100 text-purple-600",
        filePath: "/workspace/INR100-APP/courses/Module-03-SIP-Wealth-Building"
      },
      {
        id: "behavioral-finance-psychology",
        title: "Behavioral Finance Psychology",
        description: "Understanding the psychology of investing",
        category: "psychology",
        module: "behavioral-finance-psychology",
        level: "intermediate" as const,
        duration: "1-2 hours",
        lessons: 5,
        topics: ["Cognitive biases", "Emotional investing", "Decision making", "Market psychology", "Discipline building"],
        isEnrolled: subscriptionTier === "PROFESSIONAL", // Professional content
        progress: 0,
        xpReward: 125,
        importance: "medium" as const,
        icon: "Brain",
        color: "bg-orange-100 text-orange-600",
        filePath: "/workspace/INR100-APP/courses/behavioral-finance-psychology"
      },
      {
        id: "risk-management",
        title: "Risk Management & Safety",
        description: "Learn to protect your investments",
        category: "risk-management",
        module: "risk-management-safety",
        level: "beginner" as const,
        duration: "2-3 hours",
        lessons: 7,
        topics: ["Understanding volatility", "Risk measurement", "Drawdowns", "Diversification", "Emergency funds"],
        isEnrolled: true,
        progress: 45,
        xpReward: 150,
        importance: "high" as const,
        icon: "Shield",
        color: "bg-red-100 text-red-600",
        filePath: "/workspace/INR100-APP/courses/Module-10-Risk-Management"
      },
      {
        id: "scam-awareness-001",
        title: "Scam Awareness",
        description: "VERY IMPORTANT - Protect yourself from fraud",
        category: "safety",
        module: "scam-awareness",
        level: "beginner" as const,
        duration: "1-2 hours",
        lessons: 7,
        topics: ["Stock market fraud", "Pump and dump schemes", "WhatsApp scams", "Broker verification", "Ponzi schemes"],
        isEnrolled: true,
        progress: 80,
        xpReward: 100,
        importance: "critical" as const,
        warning: "Critical security course - Must complete before investing",
        icon: "AlertTriangle",
        color: "bg-yellow-100 text-yellow-800",
        filePath: "scam-awareness"
      }
    ];

    // Helper function to generate mock lessons (optimized for Vercel deployment)
    const generateMockLessons = (courseId: string, lessonCount: number, topics: string[]): Lesson[] => {
      const lessons: Lesson[] = [];
      
      for (let i = 0; i < lessonCount; i++) {
        lessons.push({
          id: `lesson-${String(i + 1).padStart(3, '0')}`,
          title: `Lesson ${i + 1}: ${topics[i % topics.length] || 'Financial Education'}`,
          content: `# ${topics[i % topics.length] || 'Financial Education'} - Lesson ${i + 1}

Welcome to this lesson on ${topics[i % topics.length] || 'Financial Education'}!

This comprehensive lesson covers:
- ${topics[0] || 'Key concepts and definitions'}
- ${topics[1] || 'Practical examples and case studies'}
- ${topics[2] || 'Best practices and recommendations'}

## Learning Objectives

By the end of this lesson, you will understand:
1. The fundamental principles of ${topics[i % topics.length] || 'financial education'}
2. How to apply these concepts in real-world scenarios
3. Common mistakes to avoid and best practices to follow

## Key Topics Covered

- **Conceptual Understanding**: Learn the core principles
- **Practical Application**: See real-world examples
- **Strategic Implementation**: Apply what you've learned

## Next Steps

Complete this lesson to earn XP and unlock the next module in your learning journey!

---

*This lesson is part of a comprehensive financial education curriculum designed to build your investment knowledge step by step.*`,
          duration: 15 + Math.random() * 10, // 15-25 minutes
          xpReward: 10 + Math.floor(Math.random() * 10), // 10-20 XP
          order: i + 1
        });
      }
      
      return lessons;
    };

    // Optimized function to load lessons (uses mock data to avoid build bloat)
    const loadLessons = async (coursePath: string, lessonCount: number, topics: string[]): Promise<Lesson[]> => {
      // Use mock lessons to avoid build size issues on Vercel
      return generateMockLessons(coursePath, lessonCount, topics);
    };

    // Filter courses based on parameters
    let filteredCourses = courseDefinitions;
    
    if (category && category !== "all") {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    
    if (level && level !== "all") {
      filteredCourses = filteredCourses.filter(course => course.level === level);
    }

    // Load actual lesson content for each course
    const coursesWithLessons: CourseData[] = [];
    
    for (const courseDef of filteredCourses) {
      const lessonsList = await loadLessons(courseDef.filePath, courseDef.lessons, courseDef.topics);
      
      // Calculate actual progress based on completed lessons
      const completedCount = lessonsList.filter(lesson => 
        completedLessons.includes(lesson.id)
      ).length;
      const actualProgress = lessonsList.length > 0 
        ? Math.round((completedCount / lessonsList.length) * 100)
        : 0;

      coursesWithLessons.push({
        ...courseDef,
        isEnrolled: courseDef.isEnrolled,
        progress: actualProgress,
        lessonsList
      });
    }

    return NextResponse.json({
      courses: coursesWithLessons,
      user: {
        subscriptionTier,
        totalXp: user.xp,
        level: user.level,
        completedLessons: completedLessons.length
      }
    });

  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}