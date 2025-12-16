import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; module: string } }
) {
  try {
    const { category, module } = params;
    
    // Get lesson metadata from the course service
    const CourseContentService = await import('@/lib/courseContentService');
    const courseService = CourseContentService.default.getInstance();
    
    // Get module with actual lesson data
    const moduleData = courseService.getModuleWithLessons(category, module);

    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Use the lessons from the enhanced service
    let lessons = moduleData.lessonsDetail || [];

    // Add completion status (mock data)
    const lessonStatuses = {
      'lesson-1': 'completed',
      'lesson-2': 'current',
      'lesson-3': 'locked',
      'lesson-4': 'locked',
      'lesson-5': 'locked'
    };

    const lessonsWithStatus = lessons.map((lesson: any) => ({
      ...lesson,
      status: lessonStatuses[lesson.id] || 'locked',
      completed: lessonStatuses[lesson.id] === 'completed'
    }));

    return NextResponse.json({
      success: true,
      data: {
        module: {
          id: module,
          title: moduleData.title || module,
          description: moduleData.description || '',
          totalLessons: lessons.length,
          totalDuration: lessons.reduce((sum: number, lesson: any) => sum + lesson.estimatedDuration, 0),
          totalXp: lessons.reduce((sum: number, lesson: any) => sum + lesson.xpReward, 0)
        },
        lessons: lessonsWithStatus
      }
    });
  } catch (error) {
    console.error('Error loading lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}