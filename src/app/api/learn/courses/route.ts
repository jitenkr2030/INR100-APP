import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

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
    const userId = searchParams.get("userId") || "demo-user-id";
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    // Get courses with real content mapping
    const courseDefinitions = getCourseDefinitions();
    
    // Filter courses based on parameters
    let filteredCourses = courseDefinitions;
    
    if (category && category !== "all") {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    
    if (level && level !== "all") {
      filteredCourses = filteredCourses.filter(course => course.level === level);
    }

    // Load lessons for each course
    const coursesWithLessons: CourseData[] = [];
    
    for (const courseDef of filteredCourses) {
      try {
        const lessonsList = await loadCourseLessons(courseDef.path);
        
        coursesWithLessons.push({
          ...courseDef,
          lessons: lessonsList.length,
          lessonsList
        });
      } catch (error) {
        console.warn(`Error loading lessons for ${courseDef.id}:`, error);
        // Use fallback lessons
        coursesWithLessons.push({
          ...courseDef,
          lessons: courseDef.lessons,
          lessonsList: generateFallbackLessons(courseDef.topics, courseDef.lessons)
        });
      }
    }

    return NextResponse.json({
      courses: coursesWithLessons,
      user: {
        subscriptionTier: "BASIC",
        totalXp: 2500,
        level: 5,
        completedLessons: 3
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

function getCourseDefinitions() {
  return [
    {
      id: "stock-foundations-001",
      title: "Stock Market Foundations",
      description: "Beginner friendly introduction to stock market basics",
      category: "stock-market",
      module: "stock-foundations",
      level: "beginner" as const,
      duration: "2-3 hours",
      lessons: 10,
      topics: ["How the stock market works", "Primary vs secondary market", "IPO basics", "Market indices", "Trading hours"],
      isEnrolled: true,
      progress: 60,
      xpReward: 150,
      importance: "high" as const,
      icon: "TrendingUp",
      color: "bg-blue-100 text-blue-600",
      path: "/courses/foundation-level/module-01-money-basics"
    },
    {
      id: "mutual-funds-001",
      title: "Mutual Funds Deep Dive",
      description: "Comprehensive guide to mutual fund investing",
      category: "mutual-funds",
      module: "mutual-funds-deep-dive",
      level: "intermediate" as const,
      duration: "3-4 hours",
      lessons: 11,
      topics: ["Types of mutual funds", "Index vs active funds", "How NAV works", "Expense ratio", "Fund management"],
      isEnrolled: false,
      progress: 0,
      xpReward: 200,
      importance: "high" as const,
      icon: "PieChart",
      color: "bg-green-100 text-green-600",
      path: "/courses/intermediate-level/module-04-mutual-funds"
    },
    {
      id: "sip-wealth-001",
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
      path: "/courses/foundation-level/module-03-investing-intro"
    },
    {
      id: "behavioral-finance-001",
      title: "Behavioral Finance Psychology",
      description: "Understanding the psychology of investing",
      category: "psychology",
      module: "behavioral-finance-psychology",
      level: "intermediate" as const,
      duration: "1-2 hours",
      lessons: 5,
      topics: ["Cognitive biases", "Emotional investing", "Decision making", "Market psychology", "Discipline building"],
      isEnrolled: false,
      progress: 0,
      xpReward: 125,
      importance: "medium" as const,
      icon: "Brain",
      color: "bg-orange-100 text-orange-600",
      path: "/courses/foundation-level/module-01-money-basics"
    },
    {
      id: "risk-management-001",
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
      path: "/courses/foundation-level/module-01-money-basics"
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
      path: "/courses/foundation-level/module-02-banking-systems"
    }
  ];
}

async function loadCourseLessons(coursePath: string): Promise<Lesson[]> {
  try {
    const fullPath = process.cwd() + coursePath;
    
    if (!existsSync(fullPath)) {
      throw new Error(`Course path not found: ${fullPath}`);
    }

    const { readdirSync, readFileSync } = await import('fs');
    const { join } = await import('path');
    
    const files = readdirSync(fullPath)
      .filter(file => file.endsWith('.md'))
      .sort();

    const lessons: Lesson[] = [];

    for (const file of files) {
      try {
        const filePath = join(fullPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const lesson = parseMarkdownLesson(content, file);
        
        if (lesson.title && lesson.content) {
          lessons.push(lesson);
        }
      } catch (error) {
        console.warn(`Error parsing lesson file ${file}:`, error);
      }
    }

    // Sort lessons by order if available, otherwise by filename
    return lessons.sort((a, b) => {
      if (a.order && b.order) {
        return a.order - b.order;
      }
      return a.id.localeCompare(b.id);
    });

  } catch (error) {
    console.error('Error loading course lessons:', error);
    throw error;
  }
}

function parseMarkdownLesson(content: string, filename: string): Lesson {
  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let metadata: any = {};
  let lessonContent = content;

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        } else {
          metadata[key] = value.replace(/['"]/g, '');
        }
      }
    }
    
    // Remove frontmatter from content
    lessonContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
  }

  // Extract title from first heading or metadata
  const titleMatch = lessonContent.match(/^#\s+(.+)$/m);
  const title = metadata.title || (titleMatch ? titleMatch[1] : 'Untitled Lesson');
  
  // Generate lesson ID from filename
  const lessonId = filename.replace('.md', '').toLowerCase();

  return {
    id: lessonId,
    title: title,
    content: lessonContent,
    duration: parseInt(metadata.duration) || 15,
    xpReward: parseInt(metadata.xp_reward) || 50,
    order: parseInt(metadata.lesson_number) || 0
  };
}

function generateFallbackLessons(topics: string[], count: number): Lesson[] {
  const lessons: Lesson[] = [];

  for (let i = 1; i <= count; i++) {
    const topic = topics[(i - 1) % topics.length] || 'Financial Education';
    
    lessons.push({
      id: `lesson-${String(i).padStart(3, '0')}`,
      title: `Lesson ${i}: ${topic}`,
      content: `# ${topic} - Lesson ${i}

Welcome to this lesson on ${topic}!

This comprehensive lesson covers:
- Key concepts and definitions
- Practical examples and case studies
- Best practices and recommendations

## Learning Objectives

By the end of this lesson, you will understand:
1. The fundamental principles of ${topic}
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
      duration: 15,
      xpReward: 50,
      order: i
    });
  }

  return lessons;
}