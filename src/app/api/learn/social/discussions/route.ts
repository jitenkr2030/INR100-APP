import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const course = searchParams.get('course');
    const lesson = searchParams.get('lesson');

    // In a real app, this would query the database
    // For now, return mock discussion data
    const discussions = getMockDiscussions(course, lesson);

    return NextResponse.json({
      success: true,
      data: { discussions }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, content, course, lesson } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      );
    }

    // In a real app, this would save to database
    const newDiscussion = {
      id: `discussion_${Date.now()}`,
      userId,
      userName: getUserName(userId),
      userAvatar: `/api/placeholder/40/40`,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: 0,
      isLiked: false,
      course,
      lesson
    };

    return NextResponse.json({
      success: true,
      data: newDiscussion,
      message: 'Discussion posted successfully!'
    });
  } catch (error) {
    console.error('Post discussion error:', error);
    return NextResponse.json(
      { error: 'Failed to post discussion' },
      { status: 500 }
    );
  }
}

function getMockDiscussions(course?: string, lesson?: string) {
  const allDiscussions = [
    {
      id: 'disc_1',
      userId: 'user_1',
      userName: 'Sarah Chen',
      userAvatar: '/api/placeholder/40/40',
      content: 'Just completed the risk assessment module. The real-world examples really helped me understand portfolio diversification better!',
      timestamp: '2025-12-16T14:30:00Z',
      likes: 12,
      replies: 5,
      isLiked: false,
      course: 'Investment Strategies',
      lesson: 'Risk Assessment'
    },
    {
      id: 'disc_2',
      userId: 'user_2',
      userName: 'Michael Rodriguez',
      userAvatar: '/api/placeholder/40/40',
      content: 'Has anyone else found the behavioral finance section challenging? I\'d love to form a study group to discuss the psychological biases.',
      timestamp: '2025-12-16T13:15:00Z',
      likes: 8,
      replies: 12,
      isLiked: true,
      course: 'Advanced Concepts',
      lesson: 'Behavioral Finance'
    },
    {
      id: 'disc_3',
      userId: 'user_3',
      userName: 'Priya Sharma',
      userAvatar: '/api/placeholder/40/40',
      content: 'Quick tip: The scam awareness module has great interactive scenarios. They really test your decision-making skills under pressure.',
      timestamp: '2025-12-16T11:45:00Z',
      likes: 15,
      replies: 3,
      isLiked: false,
      course: 'Risk Management',
      lesson: 'Scam Awareness'
    },
    {
      id: 'disc_4',
      userId: 'user_4',
      userName: 'David Kim',
      userAvatar: '/api/placeholder/40/40',
      content: 'Completed my first full course! The certificate generation was seamless. Planning to start the mutual funds module next week.',
      timestamp: '2025-12-16T10:20:00Z',
      likes: 22,
      replies: 8,
      isLiked: false,
      course: 'Stock Market Foundations',
      lesson: 'Final Assessment'
    },
    {
      id: 'disc_5',
      userId: 'user_5',
      userName: 'Emma Johnson',
      userAvatar: '/api/placeholder/40/40',
      content: 'Question about the technical analysis section: Can someone explain how support and resistance levels work in practice?',
      timestamp: '2025-12-16T09:10:00Z',
      likes: 6,
      replies: 15,
      isLiked: false,
      course: 'Investment Strategies',
      lesson: 'Technical Analysis'
    }
  ];

  // Filter discussions based on course/lesson if specified
  let filtered = allDiscussions;
  if (course) {
    filtered = filtered.filter(d => d.course === course);
  }
  if (lesson) {
    filtered = filtered.filter(d => d.lesson === lesson);
  }

  return filtered;
}

function getUserName(userId: string): string {
  const names: Record<string, string> = {
    'demo-user': 'You',
    'user_1': 'Sarah Chen',
    'user_2': 'Michael Rodriguez',
    'user_3': 'Priya Sharma',
    'user_4': 'David Kim',
    'user_5': 'Emma Johnson'
  };
  return names[userId] || 'Anonymous User';
}