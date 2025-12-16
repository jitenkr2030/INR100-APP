import { NextRequest, NextResponse } from 'next/server';
import CourseContentService from '@/lib/courseContentService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    // Demo courses data
    const demoCourses = [
      {
        id: "course-1",
        title: "Stock Market Foundations",
        description: "Learn the basics of stock market investing and how to get started",
        category: "stocks",
        difficulty: "beginner",
        estimatedDuration: 120,
        modules: [
          {
            id: "module-1",
            title: "Introduction to Stock Market",
            description: "Understanding what stock market is and how it works",
            order: 1,
            lessons: [
              {
                id: "lesson-1",
                title: "What is Stock Market?",
                content: "A stock market is a place where buyers and sellers come together to trade shares of publicly listed companies...",
                type: "text",
                duration: 15,
                order: 1
              },
              {
                id: "lesson-2", 
                title: "Primary vs Secondary Market",
                content: "Understanding the difference between primary and secondary markets...",
                type: "text",
                duration: 20,
                order: 2
              }
            ]
          }
        ]
      },
      {
        id: "course-2",
        title: "Mutual Fund Basics",
        description: "Everything you need to know about mutual fund investments",
        category: "mutual-funds",
        difficulty: "beginner",
        estimatedDuration: 90,
        modules: [
          {
            id: "module-2",
            title: "Types of Mutual Funds",
            description: "Learn about different types of mutual funds available in India",
            order: 1,
            lessons: [
              {
                id: "lesson-3",
                title: "Equity vs Debt Funds",
                content: "Understanding the key differences between equity and debt mutual funds...",
                type: "text",
                duration: 25,
                order: 1
              }
            ]
          }
        ]
      },
      {
        id: "course-3",
        title: "Gold Investment Guide",
        description: "Learn how to invest in digital gold and gold ETFs",
        category: "commodities",
        difficulty: "intermediate",
        estimatedDuration: 60,
        modules: [
          {
            id: "module-3",
            title: "Digital Gold Investment",
            description: "Understanding digital gold investment options",
            order: 1,
            lessons: [
              {
                id: "lesson-4",
                title: "Benefits of Digital Gold",
                content: "Why digital gold is becoming popular among investors...",
                type: "text",
                duration: 20,
                order: 1
              }
            ]
          }
        ]
      }
    ];

    let courses = demoCourses;
    if (searchQuery) {
      courses = demoCourses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (category && category !== 'all') {
      courses = demoCourses.filter(course => course.category === category);
    }

    // Demo user progress
    const userProgress = [
      {
        userId: "demo-user",
        courseId: "course-1",
        lessonId: "lesson-1",
        completed: true,
        progress: 100,
        lastAccessed: new Date(),
        timeSpent: 900
      },
      {
        userId: "demo-user", 
        courseId: "course-1",
        lessonId: "lesson-2",
        completed: false,
        progress: 60,
        lastAccessed: new Date(),
        timeSpent: 600
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        courses,
        userProgress,
        totalCourses: courses.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get learning content error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}