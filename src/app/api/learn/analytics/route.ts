import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const range = searchParams.get('range') || 'month';

    // In a real app, this would query the database and calculate analytics
    // For now, return mock analytics data
    const analyticsData = generateMockAnalytics(userId, range);

    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockAnalytics(userId: string, range: string) {
  // Generate realistic mock data based on range
  const multiplier = range === 'week' ? 0.25 : range === 'quarter' ? 3 : 1;
  
  const baseTimeSpent = 480; // 8 hours base
  const baseLessons = 20;
  const baseCourses = 3;

  return {
    overview: {
      totalTimeSpent: Math.floor(baseTimeSpent * multiplier + Math.random() * 120),
      lessonsCompleted: Math.floor(baseLessons * multiplier + Math.random() * 10),
      coursesCompleted: Math.floor(baseCourses * multiplier + Math.random() * 2),
      currentStreak: Math.floor(Math.random() * 14) + 1,
      longestStreak: Math.floor(Math.random() * 30) + 7,
      averageSessionTime: Math.floor(30 + Math.random() * 45), // 30-75 minutes
      weeklyProgress: Math.floor(60 + Math.random() * 35), // 60-95%
      monthlyProgress: Math.floor(45 + Math.random() * 50), // 45-95%
      learningVelocity: Math.floor(70 + Math.random() * 25), // 70-95%
      consistencyScore: Math.floor(65 + Math.random() * 30), // 65-95%
      knowledgeRetention: Math.floor(75 + Math.random() * 20), // 75-95%
      engagementLevel: Math.floor(80 + Math.random() * 15) // 80-95%
    },
    subjectPerformance: [
      {
        subject: 'Investment Strategies',
        completion: Math.floor(85 + Math.random() * 15),
        averageScore: Math.floor(78 + Math.random() * 20),
        timeSpent: Math.floor(120 + Math.random() * 60),
        lessonsCount: Math.floor(8 + Math.random() * 4),
        lastActivity: '2 hours ago'
      },
      {
        subject: 'Risk Management',
        completion: Math.floor(70 + Math.random() * 25),
        averageScore: Math.floor(72 + Math.random() * 25),
        timeSpent: Math.floor(90 + Math.random() * 45),
        lessonsCount: Math.floor(6 + Math.random() * 3),
        lastActivity: '1 day ago'
      },
      {
        subject: 'Behavioral Finance',
        completion: Math.floor(55 + Math.random() * 35),
        averageScore: Math.floor(65 + Math.random() * 30),
        timeSpent: Math.floor(75 + Math.random() * 50),
        lessonsCount: Math.floor(5 + Math.random() * 4),
        lastActivity: '3 days ago'
      },
      {
        subject: 'Technical Analysis',
        completion: Math.floor(40 + Math.random() * 40),
        averageScore: Math.floor(60 + Math.random() * 35),
        timeSpent: Math.floor(60 + Math.random() * 40),
        lessonsCount: Math.floor(4 + Math.random() * 3),
        lastActivity: '5 days ago'
      }
    ],
    learningPatterns: generateLearningPatterns(),
    weaknesses: [
      {
        area: 'Options Trading',
        score: Math.floor(45 + Math.random() * 20),
        recommendedLessons: ['Options Basics', 'Greeks Calculation', 'Risk Management'],
        difficulty: 'Advanced'
      },
      {
        area: 'Derivatives',
        score: Math.floor(50 + Math.random() * 25),
        recommendedLessons: ['Futures Contracts', 'Swaps', 'Risk Hedging'],
        difficulty: 'Intermediate'
      }
    ],
    strengths: [
      {
        area: 'Fundamental Analysis',
        score: Math.floor(85 + Math.random() * 15),
        completedLessons: Math.floor(12 + Math.random() * 8),
        masteryLevel: 'Expert'
      },
      {
        area: 'Risk Assessment',
        score: Math.floor(80 + Math.random() * 15),
        completedLessons: Math.floor(10 + Math.random() * 6),
        masteryLevel: 'Advanced'
      }
    ],
    insights: {
      bestLearningTime: '9:00 AM - 11:00 AM',
      preferredLearningDuration: Math.floor(35 + Math.random() * 25), // 35-60 minutes
      knowledgeRetentionRate: Math.floor(75 + Math.random() * 20),
      learningVelocity: Math.floor(70 + Math.random() * 25),
      engagementTrends: [
        'Morning sessions show 15% higher retention ↗',
        'Interactive content increases engagement by 25% ↗',
        'Weekend learning frequency decreased 10% ↘',
        'Quiz performance improved 20% this month ↗',
        'Session completion rate up 12% ↗'
      ],
      recommendations: [
        'Schedule most challenging topics during your peak hours (9-11 AM)',
        'Increase interactive content consumption for better retention',
        'Consider weekend study sessions to maintain learning momentum',
        'Focus on derivatives and options trading to strengthen weak areas',
        'Continue building on your fundamental analysis expertise'
      ]
    }
  };
}

function generateLearningPatterns() {
  const patterns = [];
  for (let hour = 6; hour <= 22; hour++) {
    // Simulate realistic learning activity patterns
    let activity = Math.floor(Math.random() * 30) + 5; // Base activity 5-35%
    let efficiency = Math.floor(Math.random() * 30) + 60; // Base efficiency 60-90%
    
    // Peak hours (9-11 AM, 2-4 PM)
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      activity += Math.floor(Math.random() * 20) + 10; // 10-30% boost
      efficiency += Math.floor(Math.random() * 15) + 5; // 5-20% boost
    }
    
    // Evening hours (7-9 PM)
    if (hour >= 19 && hour <= 21) {
      activity += Math.floor(Math.random() * 15) + 5;
      efficiency += Math.floor(Math.random() * 10) + 3;
    }
    
    // Late night (10 PM+)
    if (hour >= 22) {
      activity = Math.floor(activity * 0.6); // Reduce activity
      efficiency = Math.floor(efficiency * 0.8); // Reduce efficiency
    }
    
    // Cap at 100%
    activity = Math.min(activity, 95);
    efficiency = Math.min(efficiency, 95);
    
    patterns.push({
      hour,
      activity,
      efficiency
    });
  }
  
  return patterns;
}