import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  xpReward: number;
  order: number;
  difficulty?: string;
  learningObjectives?: string[];
  tags?: string[];
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
    
    // Map course IDs to actual course content
    const courseMapping = getCourseMapping();
    const courseInfo = courseMapping[courseId];
    
    if (!courseInfo) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Load actual lesson content from files
    const lessonsList = await loadCourseLessons(courseInfo.path);
    const currentLesson = lessonsList.find(lesson => 
      lesson.id === lessonId || lesson.id.includes(lessonId)
    );
    
    if (!currentLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Create course data
    const courseData: CourseWithLessons = {
      id: courseId,
      title: courseInfo.title,
      description: courseInfo.description,
      category: courseInfo.category,
      module: courseInfo.module,
      level: courseInfo.level,
      duration: courseInfo.duration,
      lessons: lessonsList.length,
      topics: courseInfo.topics,
      progress: 60, // This would come from user progress
      xpReward: courseInfo.xpReward,
      importance: courseInfo.importance,
      icon: courseInfo.icon,
      lessonsList
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

function getCourseMapping() {
  return {
    'stock-foundations-001': {
      title: 'Stock Market Foundations',
      description: 'Beginner friendly introduction to stock market basics',
      category: 'stock-market',
      module: 'stock-foundations',
      level: 'beginner' as const,
      duration: '2-3 hours',
      topics: ['How the stock market works', 'Primary vs secondary market', 'IPO basics', 'Market indices', 'Trading hours'],
      xpReward: 150,
      importance: 'high' as const,
      icon: 'TrendingUp',
      path: '/courses/foundation-level/module-01-money-basics'
    },
    'mutual-funds-001': {
      title: 'Mutual Funds Deep Dive',
      description: 'Comprehensive guide to mutual fund investing',
      category: 'mutual-funds',
      module: 'mutual-funds-deep-dive',
      level: 'intermediate' as const,
      duration: '3-4 hours',
      topics: ['Types of mutual funds', 'Index vs active funds', 'How NAV works', 'Expense ratio', 'Fund management'],
      xpReward: 200,
      importance: 'high' as const,
      icon: 'PieChart',
      path: '/courses/intermediate-level/module-04-mutual-funds'
    },
    'sip-wealth-001': {
      title: 'SIP & Wealth Building',
      description: 'Master systematic investment and wealth creation',
      category: 'wealth-building',
      module: 'sip-wealth-building',
      level: 'beginner' as const,
      duration: '2-3 hours',
      topics: ['SIP vs lump-sum', 'Power of compounding', 'SIP calculations', 'Financial goals', 'Asset allocation'],
      xpReward: 175,
      importance: 'high' as const,
      icon: 'PiggyBank',
      path: '/courses/foundation-level/module-03-investing-intro'
    },
    'risk-management-001': {
      title: 'Risk Management & Safety',
      description: 'Learn to protect your investments',
      category: 'risk-management',
      module: 'risk-management-safety',
      level: 'beginner' as const,
      duration: '2-3 hours',
      topics: ['Understanding volatility', 'Risk measurement', 'Drawdowns', 'Diversification', 'Emergency funds'],
      xpReward: 150,
      importance: 'high' as const,
      icon: 'Shield',
      path: '/courses/foundation-level/module-01-money-basics'
    },
    'scam-awareness-001': {
      title: 'Scam Awareness',
      description: 'Protect yourself from financial fraud',
      category: 'safety',
      module: 'scam-awareness',
      level: 'beginner' as const,
      duration: '1-2 hours',
      topics: ['Stock market fraud', 'Pump and dump schemes', 'WhatsApp scams', 'Broker verification', 'Ponzi schemes'],
      xpReward: 100,
      importance: 'critical' as const,
      icon: 'AlertTriangle',
      path: '/courses/foundation-level/module-02-banking-systems'
    }
  };
}

async function loadCourseLessons(coursePath: string): Promise<Lesson[]> {
  try {
    const fullPath = process.cwd() + coursePath;
    
    if (!existsSync(fullPath)) {
      console.warn(`Course path not found: ${fullPath}`);
      return generateFallbackLessons(coursePath);
    }

    const files = readdirSync(fullPath)
      .filter(file => file.endsWith('.md'))
      .sort(); // Sort to ensure consistent order

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
    return generateFallbackLessons(coursePath);
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
    order: parseInt(metadata.lesson_number) || 0,
    difficulty: metadata.difficulty || 'Beginner',
    learningObjectives: metadata.learning_objectives || [],
    tags: metadata.tags || []
  };
}

function generateFallbackLessons(coursePath: string): Lesson[] {
  // Generate fallback lessons based on course path
  const lessons: Lesson[] = [];
  const lessonCount = 5; // Default number of lessons

  for (let i = 1; i <= lessonCount; i++) {
    lessons.push({
      id: `lesson-${String(i).padStart(3, '0')}`,
      title: `Lesson ${i}: Financial Education Fundamentals`,
      content: `# Lesson ${i}: Financial Education Fundamentals

## Welcome to Your Learning Journey

This is a comprehensive lesson designed to help you understand key financial concepts.

### What You'll Learn

- Fundamental financial principles
- Practical applications
- Real-world examples
- Best practices

### Key Concepts

1. **Financial Literacy**: Understanding money management basics
2. **Investment Fundamentals**: How to grow your wealth
3. **Risk Management**: Protecting your financial future
4. **Planning**: Setting and achieving financial goals

### Practical Examples

Throughout this lesson, you'll find real-world examples and case studies that illustrate these concepts in action.

### Next Steps

After completing this lesson, you'll be ready to move on to more advanced topics in your financial education journey.

---
*This lesson is part of our comprehensive financial education platform designed for INR100 users.*`,
      duration: 15,
      xpReward: 50,
      order: i,
      difficulty: 'Beginner',
      learningObjectives: ['Understand basic concepts', 'Learn fundamental principles', 'Apply practical examples'],
      tags: ['financial education', 'basics', 'beginner']
    });
  }

  return lessons;
}