import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const course = searchParams.get('course');

    // In a real app, this would query the database
    // For now, return mock progress share data
    const shares = getMockProgressShares(userId, course);

    return NextResponse.json({
      success: true,
      data: { shares }
    });
  } catch (error) {
    console.error('Get progress shares error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, achievement, course, progress } = await request.json();

    if (!userId || !achievement || !course) {
      return NextResponse.json(
        { error: 'User ID, achievement, and course are required' },
        { status: 400 }
      );
    }

    // In a real app, this would save to database
    const newShare = {
      id: `share_${Date.now()}`,
      userId,
      userName: getUserName(userId),
      userAvatar: `/api/placeholder/40/40`,
      achievement,
      course,
      progress: progress || 100,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };

    return NextResponse.json({
      success: true,
      data: newShare,
      message: 'Progress shared successfully!'
    });
  } catch (error) {
    console.error('Share progress error:', error);
    return NextResponse.json(
      { error: 'Failed to share progress' },
      { status: 500 }
    );
  }
}

function getMockProgressShares(userId: string, course?: string) {
  const allShares = [
    {
      id: 'share_1',
      userId: 'user_1',
      userName: 'Sarah Chen',
      userAvatar: '/api/placeholder/40/40',
      achievement: 'Course Completion',
      course: 'Risk Assessment Fundamentals',
      progress: 100,
      timestamp: '2025-12-16T15:30:00Z',
      likes: 18,
      comments: 7
    },
    {
      id: 'share_2',
      userId: 'user_2',
      userName: 'Michael Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      achievement: 'Perfect Score',
      course: 'Behavioral Finance Quiz',
      progress: 100,
      timestamp: '2025-12-16T14:15:00Z',
      likes: 25,
      comments: 12
    },
    {
      id: 'share_3',
      userId: 'user_3',
      userName: 'Priya Sharma',
      userAvatar: '/api/placeholder/40/40',
      achievement: 'Milestone Reached',
      course: 'Advanced Portfolio Management',
      progress: 75,
      timestamp: '2025-12-16T13:45:00Z',
      likes: 14,
      comments: 5
    },
    {
      id: 'share_4',
      userId: 'user_4',
      userName: 'David Kim',
      userAvatar: '/api/placeholder/40/40',
      achievement: '7-Day Streak',
      course: 'Technical Analysis Mastery',
      progress: 100,
      timestamp: '2025-12-16T12:20:00Z',
      likes: 31,
      comments: 9
    },
    {
      id: 'share_5',
      userId: 'user_5',
      userName: 'Emma Johnson',
      userAvatar: '/api/placeholder/40/40',
      achievement: 'First Certificate',
      course: 'Investment Basics',
      progress: 100,
      timestamp: '2025-12-16T11:10:00Z',
      likes: 42,
      comments: 15
    },
    {
      id: 'share_6',
      userId: 'user_6',
      userName: 'Alex Thompson',
      userAvatar: '/api/placeholder/40/40',
      achievement: 'Knowledge Seeker',
      course: 'Market Psychology',
      progress: 100,
      timestamp: '2025-12-16T10:05:00Z',
      likes: 19,
      comments: 6
    }
  ];

  // Filter shares based on course if specified
  if (course) {
    return allShares.filter(s => s.course === course);
  }

  return allShares;
}

function getUserName(userId: string): string {
  const names: Record<string, string> = {
    'demo-user': 'You',
    'user_1': 'Sarah Chen',
    'user_2': 'Michael Rodriguez',
    'user_3': 'Priya Sharma',
    'user_4': 'David Kim',
    'user_5': 'Emma Johnson',
    'user_6': 'Alex Thompson'
  };
  return names[userId] || 'Anonymous User';
}