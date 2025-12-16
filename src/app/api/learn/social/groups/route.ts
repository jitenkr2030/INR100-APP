import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const course = searchParams.get('course');

    // In a real app, this would query the database
    // For now, return mock study group data
    const groups = getMockStudyGroups(userId, course);

    return NextResponse.json({
      success: true,
      data: { groups }
    });
  } catch (error) {
    console.error('Get study groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMockStudyGroups(userId: string, course?: string) {
  const allGroups = [
    {
      id: 'group_1',
      name: 'Investment Strategy Masters',
      description: 'Deep dive into advanced investment strategies, portfolio management, and market analysis techniques. Weekly discussion sessions and mock portfolio reviews.',
      members: 24,
      isJoined: userId === 'demo-user',
      category: 'Investment Strategies',
      lastActivity: '2025-12-16T14:00:00Z'
    },
    {
      id: 'group_2',
      name: 'Risk Management Advocates',
      description: 'Learn from experienced professionals about identifying, assessing, and mitigating investment risks. Share real-world case studies and solutions.',
      members: 18,
      isJoined: userId === 'user_2',
      category: 'Risk Management',
      lastActivity: '2025-12-16T13:30:00Z'
    },
    {
      id: 'group_3',
      name: 'Beginner Investors Circle',
      description: 'Friendly group for those just starting their investment journey. Share learning experiences, ask questions, and support each other\'s progress.',
      members: 31,
      isJoined: false,
      category: 'Investing Basics',
      lastActivity: '2025-12-16T12:15:00Z'
    },
    {
      id: 'group_4',
      name: 'Behavioral Finance Enthusiasts',
      description: 'Explore the psychological aspects of investing and financial decision-making. Discuss cognitive biases, emotional intelligence in trading.',
      members: 15,
      isJoined: userId === 'user_3',
      category: 'Advanced Concepts',
      lastActivity: '2025-12-16T11:45:00Z'
    },
    {
      id: 'group_5',
      name: 'Technical Analysis Group',
      description: 'Master chart patterns, indicators, and technical analysis tools. Practice reading market trends and developing trading strategies.',
      members: 22,
      isJoined: false,
      category: 'Investment Strategies',
      lastActivity: '2025-12-16T10:30:00Z'
    },
    {
      id: 'group_6',
      name: 'Mutual Fund Specialists',
      description: 'Comprehensive discussions on mutual fund selection, SIP planning, fund manager evaluation, and performance analysis.',
      members: 19,
      isJoined: userId === 'user_1',
      category: 'Investment Strategies',
      lastActivity: '2025-12-16T09:20:00Z'
    }
  ];

  // Filter groups based on course if specified
  if (course) {
    return allGroups.filter(g => g.category === course);
  }

  return allGroups;
}