import { NextRequest, NextResponse } from "next/server";
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

interface CourseWithLessons {
  id: string;
  title: string;
  description: string;
  category: string;
  module: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  topics: string[];
  progress: number;
  xpReward: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  lessonsList: Lesson[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    const { courseId, lessonId } = params;
    
    // Course definitions matching the actual directory structure
    const courseDefinitions = [
      {
        id: "stock-market-foundations",
        title: "Stock Market Foundations",
        description: "Learn the basics of stock markets, investing principles, and market fundamentals",
        category: "investing",
        module: "Module 01",
        level: "beginner" as const,
        duration: "2 hours",
        lessons: 8,
        topics: ["Market basics", "Stock types", "Risk assessment", "Investment principles"],
        xpReward: 100,
        importance: "high" as const,
        icon: "TrendingUp",
        filePath: "/workspace/INR100-APP/courses/Module-01-Stock-Market-Foundations"
      },
      {
        id: "personal-finance-basics",
        title: "Personal Finance Basics",
        description: "Master budgeting, saving, and financial planning fundamentals",
        category: "personal-finance",
        module: "Module 02",
        level: "beginner" as const,
        duration: "1.5 hours",
        lessons: 6,
        topics: ["Budgeting", "Emergency funds", "Debt management", "Financial goals"],
        xpReward: 80,
        importance: "high" as const,
        icon: "Wallet",
        filePath: "/workspace/INR100-APP/courses/Module-02-Personal-Finance-Basics"
      },
      {
        id: "sip-wealth-building",
        title: "SIP & Wealth Building",
        description: "Systematic Investment Plans and long-term wealth creation strategies",
        category: "investing",
        module: "Module 03",
        level: "beginner" as const,
        duration: "2.5 hours",
        lessons: 10,
        topics: ["SIP basics", "Compound interest", "Goal-based investing", "Portfolio diversification"],
        xpReward: 120,
        importance: "high" as const,
        icon: "PiggyBank",
        filePath: "/workspace/INR100-APP/courses/Module-03-SIP-Wealth-Building"
      },
      {
        id: "money-basics",
        title: "Money Basics",
        description: "Fundamental concepts of money, currency, and basic financial literacy",
        category: "foundations",
        module: "Module 01",
        level: "beginner" as const,
        duration: "2 hours",
        lessons: 10,
        topics: ["Money definition", "Currency systems", "Inflation", "Interest rates"],
        xpReward: 90,
        importance: "critical" as const,
        icon: "Coins",
        filePath: "/workspace/INR100-APP/courses/money-basics"
      },
      {
        id: "mutual-funds-deep-dive",
        title: "Mutual Funds Deep Dive",
        description: "Comprehensive guide to mutual funds, types, and investment strategies",
        category: "investing",
        module: "Module 04",
        level: "intermediate" as const,
        duration: "3 hours",
        lessons: 11,
        topics: ["Fund types", "NAV", "Expense ratios", "SIP strategies"],
        xpReward: 150,
        importance: "high" as const,
        icon: "PieChart",
        filePath: "/workspace/INR100-APP/courses/mutual-funds-deep-dive"
      }
    ];

    // Find the course
    const courseDef = courseDefinitions.find(c => c.id === courseId);
    if (!courseDef) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Load lessons for this course - optimized for Vercel deployment
    const loadLessons = async (coursePath: string): Promise<Lesson[]> => {
      // Always use mock lessons in production to avoid build size issues
      // In development, you can add file loading here if needed
      return generateMockLessons(courseId, courseDef);
    };

    // Generate mock lessons to avoid build size issues
    const generateMockLessons = (courseId: string, courseDef: any): Lesson[] => {
      const lessonCount = courseDef.lessons;
      const lessons: Lesson[] = [];
      
      for (let i = 0; i < lessonCount; i++) {
        lessons.push({
          id: `lesson-${String(i + 1).padStart(3, '0')}`,
          title: `${courseDef.title} - Lesson ${i + 1}`,
          content: `# ${courseDef.title} - Lesson ${i + 1}

Welcome to this lesson on ${courseDef.topics[i % courseDef.topics.length] || 'Financial Education'}!

This is a comprehensive lesson covering:
- ${courseDef.topics[0] || 'Key concepts'}
- ${courseDef.topics[1] || 'Practical examples'}
- ${courseDef.topics[2] || 'Best practices'}

## Key Learning Points

1. **Understanding the Basics**: Learn fundamental concepts
2. **Practical Application**: Real-world examples and case studies
3. **Best Practices**: Industry-standard approaches and strategies

## What You'll Learn

- Core financial concepts and terminology
- Step-by-step implementation guides
- Common pitfalls to avoid
- Expert tips and recommendations

Start your learning journey now and build a strong foundation in financial education!

---

*This lesson is part of the ${courseDef.title} course in our comprehensive financial education platform.*`,
          duration: 15 + Math.random() * 10, // 15-25 minutes
          xpReward: 10 + Math.floor(Math.random() * 10), // 10-20 XP
          order: i + 1
        });
      }
      
      return lessons;
    };

    // Load all lessons for the course
    const lessonsList = await loadLessons(courseDef.filePath);
    
    // Find the specific lesson
    const currentLesson = lessonsList.find(lesson => lesson.id === lessonId);
    
    if (!currentLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Create course data with lessons
    const courseData: CourseWithLessons = {
      ...courseDef,
      lessonsList,
      progress: 0, // This would come from user progress in real implementation
      completedLessons: [] // This would come from user progress in real implementation
    };

    return NextResponse.json({
      success: true,
      course: courseData,
      currentLesson,
      nextLesson: lessonsList.find(l => l.order === currentLesson.order + 1) || null,
      previousLesson: lessonsList.find(l => l.order === currentLesson.order - 1) || null,
      userId: "demo-user-id"
    });

  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson data" },
      { status: 500 }
    );
  }
}