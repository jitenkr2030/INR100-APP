import { NextRequest, NextResponse } from 'next/server';
import ProgressService from '@/lib/progressService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const progressService = ProgressService.getInstance();
    const progressData = await progressService.getUserProgressSummary(userId);

    return NextResponse.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Get learning progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { 
      lessonId, 
      categoryId, 
      moduleId, 
      completed, 
      timeSpent, 
      progressPercentage,
      userId = 'demo-user'
    } = await request.json();

    if (!lessonId || !categoryId || !moduleId) {
      return NextResponse.json(
        { error: 'Lesson ID, category ID, and module ID are required' },
        { status: 400 }
      );
    }

    const progressService = ProgressService.getInstance();
    const result = await progressService.updateLessonProgress({
      userId,
      lessonId,
      categoryId,
      moduleId,
      timeSpent: timeSpent || 0,
      completed: completed || false,
      progressPercentage: progressPercentage || 0
    });

    return NextResponse.json({
      success: true,
      data: {
        progress: result.data.progress,
        completed: result.data.completed,
        xpAwarded: result.data.xpAwarded,
        sessionId: result.data.session.id,
        message: completed ? 'Lesson completed successfully!' : 'Progress updated successfully'
      }
    });
  } catch (error) {
    console.error('Update learning progress error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, categoryId, moduleId } = await request.json();

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      );
    }

    const progressService = ProgressService.getInstance();
    const result = await progressService.generateCertificate(
      userId, 
      courseId, 
      categoryId, 
      moduleId
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          certificate: result.data,
          message: 'Certificate generated successfully!'
        }
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Generate certificate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}