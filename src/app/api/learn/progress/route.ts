import { NextRequest, NextResponse } from "next/server";

// Simple in-memory progress tracking for demo
// In production, replace with database storage
const userProgress: Record<string, any> = {
  'demo-user-id': {
    completedLessons: [],
    totalXp: 2500,
    level: 5,
    streak: 5,
    lastActivity: new Date().toISOString(),
    courseProgress: {}
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, lessonId, action, timeSpent } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    // Initialize user progress if not exists
    if (!userProgress[userId]) {
      userProgress[userId] = {
        completedLessons: [],
        totalXp: 0,
        level: 1,
        streak: 0,
        lastActivity: new Date().toISOString(),
        courseProgress: {}
      };
    }

    const user = userProgress[userId];
    let response: any = { success: true };

    switch (action) {
      case 'enroll':
        // Handle course enrollment
        response.message = `Successfully enrolled in course!`;
        response.xpEarned = 25;
        user.totalXp += 25;
        break;

      case 'start_lesson':
        // Track lesson start
        response.message = `Started lesson: ${lessonId}`;
        break;

      case 'complete_lesson':
        // Check if lesson is already completed
        const lessonKey = `${courseId}-${lessonId}`;
        if (!user.completedLessons.includes(lessonKey)) {
          // Add to completed lessons
          user.completedLessons.push(lessonKey);
          
          // Calculate XP earned (base + time bonus)
          const baseXp = 50;
          const timeBonus = Math.floor((timeSpent || 0) / 60); // 1 XP per minute
          const xpEarned = baseXp + timeBonus;
          
          user.totalXp += xpEarned;
          
          // Update level based on XP
          const newLevel = Math.floor(user.totalXp / 500) + 1;
          if (newLevel > user.level) {
            user.level = newLevel;
            response.levelUp = true;
            response.newLevel = newLevel;
          }
          
          // Update last activity
          user.lastActivity = new Date().toISOString();
          
          response.message = `Lesson completed!`;
          response.xpEarned = xpEarned;
          response.totalXp = user.totalXp;
          response.level = user.level;
          
          // Check if course is completed
          const courseProgress = calculateCourseProgress(userId, courseId);
          if (courseProgress === 100) {
            response.courseCompleted = true;
            response.certificateGenerated = true;
            user.totalXp += 100; // Bonus for course completion
          }
        } else {
          response.message = `Lesson already completed`;
          response.xpEarned = 0;
        }
        break;

      case 'get_progress':
        // Return current progress
        response.progress = {
          completedLessons: user.completedLessons,
          totalXp: user.totalXp,
          level: user.level,
          streak: user.streak,
          lastActivity: user.lastActivity,
          courseProgress: user.courseProgress
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Progress tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Return user progress
    const progress = userProgress[userId] || {
      completedLessons: [],
      totalXp: 0,
      level: 1,
      streak: 0,
      lastActivity: null,
      courseProgress: {}
    };

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateCourseProgress(userId: string, courseId: string): number {
  const user = userProgress[userId];
  if (!user) return 0;

  // Get total lessons for the course (this would come from course data)
  const courseLessonCounts: Record<string, number> = {
    'stock-foundations-001': 10,
    'mutual-funds-001': 11,
    'sip-wealth-001': 9,
    'risk-management-001': 7,
    'scam-awareness-001': 7
  };

  const totalLessons = courseLessonCounts[courseId] || 10;
  const completedInCourse = user.completedLessons.filter(
    lessonId => lessonId.startsWith(courseId)
  ).length;

  return Math.round((completedInCourse / totalLessons) * 100);
}