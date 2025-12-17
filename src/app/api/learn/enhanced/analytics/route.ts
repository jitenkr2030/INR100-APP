import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Advanced Learning Analytics API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30d'; // 7d, 30d, 90d, 1y
    const metric = searchParams.get('metric') || 'overview'; // overview, performance, engagement, progress, streaks
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get user analytics based on metric type
    let analyticsData;
    
    switch (metric) {
      case 'overview':
        analyticsData = await getOverviewAnalytics(userId, startDate, endDate);
        break;
      case 'performance':
        analyticsData = await getPerformanceAnalytics(userId, startDate, endDate);
        break;
      case 'engagement':
        analyticsData = await getEngagementAnalytics(userId, startDate, endDate);
        break;
      case 'progress':
        analyticsData = await getProgressAnalytics(userId, startDate, endDate);
        break;
      case 'streaks':
        analyticsData = await getStreakAnalytics(userId, startDate, endDate);
        break;
      default:
        analyticsData = await getOverviewAnalytics(userId, startDate, endDate);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        analytics: analyticsData,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Track analytics events
    await trackAnalyticsEvent(userId, action, data);
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Analytics event tracked successfully',
        event: action,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Analytics calculation functions

async function getOverviewAnalytics(userId: string, startDate: Date, endDate: Date) {
  // Get XP gains over time
  const xpGains = await prisma.xpGain.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Get daily learning stats
  const dailyLearning = await prisma.dailyLearning.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });
  
  // Get learning sessions
  const sessions = await prisma.learningSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Get achievements
  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      earnedAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      achievement: true
    },
    orderBy: { earnedAt: 'asc' }
  });
  
  // Calculate summary statistics
  const totalXp = xpGains.reduce((sum, gain) => sum + gain.amount, 0);
  const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0);
  const completedLessons = sessions.filter(s => s.isCompleted).length;
  const averageSessionTime = sessions.length > 0 ? totalTimeSpent / sessions.length : 0;
  
  // Get user streak info
  const streak = await prisma.learningStreak.findUnique({
    where: { userId }
  });
  
  return {
    summary: {
      totalXp,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      completedLessons,
      averageSessionTime: Math.round(averageSessionTime / 60), // Convert to minutes
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      totalAchievements: achievements.length
    },
    timeSeriesData: {
      xpGains: xpGains.map(gain => ({
        date: gain.createdAt.toISOString().split('T')[0],
        xp: gain.amount,
        source: gain.source
      })),
      dailyActivity: dailyLearning.map(day => ({
        date: day.date.toISOString().split('T')[0],
        lessonsCompleted: day.lessonsCompleted,
        timeSpent: Math.round(day.timeSpent / 60),
        xpEarned: day.xpEarned
      })),
      sessions: sessions.map(session => ({
        date: session.createdAt.toISOString().split('T')[0],
        duration: Math.round((session.timeSpent || 0) / 60),
        completed: session.isCompleted,
        xpEarned: session.xpEarned
      }))
    },
    recentAchievements: achievements.slice(-5).map(ua => ({
      name: ua.achievement.name,
      description: ua.achievement.description,
      earnedAt: ua.earnedAt,
      category: ua.achievement.category
    }))
  };
}

async function getPerformanceAnalytics(userId: string, startDate: Date, endDate: Date) {
  // Get assessment scores
  const sessions = await prisma.learningSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      xpEarned: {
        gt: 100 // Likely assessment sessions
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Get XP distribution by source
  const xpBySource = await prisma.xpGain.groupBy({
    by: ['source'],
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });
  
  // Calculate performance metrics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.isCompleted).length;
  const averageXPSession = sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.xpEarned, 0) / sessions.length : 0;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  
  return {
    performanceMetrics: {
      totalSessions,
      completedSessions,
      completionRate: Math.round(completionRate),
      averageXPSession: Math.round(averageXPSession),
      totalXPEarned: sessions.reduce((sum, s) => sum + s.xpEarned, 0)
    },
    xpDistribution: xpBySource.map(source => ({
      source: source.source,
      totalXp: source._sum.amount || 0,
      count: source._count.id
    })),
    sessionTrends: sessions.map(session => ({
      date: session.createdAt.toISOString().split('T')[0],
      xpEarned: session.xpEarned,
      duration: Math.round((session.timeSpent || 0) / 60),
      completed: session.isCompleted
    }))
  };
}

async function getEngagementAnalytics(userId: string, startDate: Date, endDate: Date) {
  // Get daily learning data for engagement analysis
  const dailyData = await prisma.dailyLearning.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });
  
  // Calculate engagement metrics
  const activeDays = dailyData.filter(day => day.timeSpent > 0).length;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const engagementRate = (activeDays / totalDays) * 100;
  
  const totalTimeSpent = dailyData.reduce((sum, day) => sum + day.timeSpent, 0);
  const averageDailyTime = activeDays > 0 ? totalTimeSpent / activeDays : 0;
  
  const totalXp = dailyData.reduce((sum, day) => sum + day.xpEarned, 0);
  const averageDailyXp = activeDays > 0 ? totalXp / activeDays : 0;
  
  return {
    engagementMetrics: {
      activeDays,
      totalDays,
      engagementRate: Math.round(engagementRate),
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      averageDailyTime: Math.round(averageDailyTime / 60),
      totalXp,
      averageDailyXp: Math.round(averageDailyXp)
    },
    dailyActivity: dailyData.map(day => ({
      date: day.date.toISOString().split('T')[0],
      active: day.timeSpent > 0,
      timeSpent: Math.round(day.timeSpent / 60),
      xpEarned: day.xpEarned,
      lessonsCompleted: day.lessonsCompleted
    })),
    peakActivityHours: await getPeakActivityHours(userId, startDate, endDate)
  };
}

async function getProgressAnalytics(userId: string, startDate: Date, endDate: Date) {
  // Get course/module progress
  const courseProgress = await prisma.learningSession.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      id: true
    },
    _sum: {
      xpEarned: true,
      timeSpent: true
    }
  });
  
  // Get user level progression
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  const currentLevel = user?.level || 1;
  const currentXp = user?.xp || 0;
  const xpForNextLevel = currentLevel * 500;
  const progressToNextLevel = (currentXp / xpForNextLevel) * 100;
  
  // Get achievement progress
  const allAchievements = await prisma.achievement.findMany({
    where: { isActive: true }
  });
  
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId }
  });
  
  const achievementProgress = (userAchievements.length / allAchievements.length) * 100;
  
  return {
    levelProgress: {
      currentLevel,
      currentXp,
      xpForNextLevel,
      progressToNextLevel: Math.round(progressToNextLevel),
      xpNeededForNextLevel: Math.max(0, xpForNextLevel - currentXp)
    },
    courseProgress: courseProgress.map(course => ({
      courseId: course.categoryId,
      sessionsCompleted: course._count.id,
      totalXp: course._sum.xpEarned || 0,
      totalTimeSpent: Math.round((course._sum.timeSpent || 0) / 60)
    })),
    achievementProgress: {
      unlocked: userAchievements.length,
      total: allAchievements.length,
      percentage: Math.round(achievementProgress)
    },
    weeklyGoals: await getWeeklyGoals(userId, startDate, endDate)
  };
}

async function getStreakAnalytics(userId: string, startDate: Date, endDate: Date) {
  const streak = await prisma.learningStreak.findUnique({
    where: { userId }
  });
  
  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: [],
      streakInsights: {
        message: 'Start your learning journey to build your first streak!',
        recommendation: 'Complete at least one learning activity daily'
      }
    };
  }
  
  // Get streak history from daily learning data
  const dailyLearning = await prisma.dailyLearning.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });
  
  // Calculate streak segments
  const streakHistory = calculateStreakHistory(dailyLearning);
  
  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate,
    streakHistory,
    streakInsights: generateStreakInsights(streak, dailyLearning)
  };
}

// Helper functions

async function trackAnalyticsEvent(userId: string, action: string, data: any) {
  // This would typically be stored in an analytics events table
  // For now, we'll just log it
  console.log(`Analytics event: ${userId} - ${action}`, data);
}

async function getPeakActivityHours(userId: string, startDate: Date, endDate: Date) {
  // Mock implementation - in real app, would analyze session start times
  return [
    { hour: 9, activity: 15 },
    { hour: 12, activity: 20 },
    { hour: 15, activity: 25 },
    { hour: 18, activity: 30 },
    { hour: 21, activity: 35 }
  ];
}

async function getWeeklyGoals(userId: string, startDate: Date, endDate: Date) {
  // Mock weekly goals based on user activity
  return {
    weeklyXpGoal: 1000,
    weeklyTimeGoal: 300, // minutes
    weeklyLessonsGoal: 10,
    currentProgress: {
      xp: 750,
      time: 180,
      lessons: 7
    },
    completion: {
      xp: 75,
      time: 60,
      lessons: 70
    }
  };
}

function calculateStreakHistory(dailyLearning: any[]) {
  const history = [];
  let currentStreak = 0;
  
  for (const day of dailyLearning) {
    if (day.timeSpent > 0) {
      currentStreak++;
      history.push({
        date: day.date.toISOString().split('T')[0],
        active: true,
        streak: currentStreak
      });
    } else {
      currentStreak = 0;
      history.push({
        date: day.date.toISOString().split('T')[0],
        active: false,
        streak: 0
      });
    }
  }
  
  return history;
}

function generateStreakInsights(streak: any, dailyLearning: any[]) {
  const insights = {
    message: '',
    recommendation: '',
    motivation: ''
  };
  
  if (streak.currentStreak === 0) {
    insights.message = 'Start your learning journey!';
    insights.recommendation = 'Complete one lesson today to begin your streak';
    insights.motivation = 'Every expert was once a beginner';
  } else if (streak.currentStreak < 7) {
    insights.message = `Great start! You're on a ${streak.currentStreak}-day streak`;
    insights.recommendation = 'Keep the momentum going!';
    insights.motivation = 'Consistency is the key to success';
  } else if (streak.currentStreak < 30) {
    insights.message = `Excellent! ${streak.currentStreak} days of consistent learning`;
    insights.recommendation = 'You\'re building a powerful habit';
    insights.motivation = 'You\'re becoming a learning champion';
  } else {
    insights.message = `Amazing! ${streak.currentStreak} days of dedication`;
    insights.recommendation = 'You\'re an inspiration to others';
    insights.motivation = 'You\'ve mastered the art of consistent learning';
  }
  
  return insights;
}