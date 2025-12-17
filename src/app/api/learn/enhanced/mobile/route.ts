import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mobile-Optimized Learning API
// Designed for mobile app consumption with offline sync and push notifications

interface MobileUserProgress {
  userId: string;
  lastSyncAt: string;
  pendingActions: MobileAction[];
  cachedData: {
    courses: any[];
    achievements: any[];
    certificates: any[];
    streak: any;
  };
}

interface MobileAction {
  id: string;
  type: 'lesson_complete' | 'assessment_submit' | 'exercise_complete' | 'streak_update';
  data: any;
  timestamp: string;
  retryCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const userId = searchParams.get('userId');
    const lastSync = searchParams.get('lastSync');
    
    switch (action) {
      case 'dashboard':
        return await getMobileDashboard(userId, lastSync);
      case 'sync-data':
        return await getSyncData(userId, lastSync);
      case 'quick-actions':
        return await getQuickActions(userId);
      case 'notifications':
        return await getNotifications(userId);
      case 'offline-content':
        return await getOfflineContent(userId);
      case 'mobile-stats':
        return await getMobileStats(userId);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mobile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'sync-actions':
        return await syncActions(await request.json());
      case 'update-streak':
        return await updateMobileStreak(await request.json());
      case 'cache-content':
        return await cacheContent(await request.json());
      case 'push-notification':
        return await handlePushNotification(await request.json());
      case 'offline-progress':
        return await saveOfflineProgress(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mobile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mobile dashboard with optimized data structure
async function getMobileDashboard(userId: string, lastSync?: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  // Get user's current progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learningStreak: true,
      userAchievements: {
        include: {
          achievement: true
        },
        orderBy: { earnedAt: 'desc' },
        take: 5
      },
      certificates: {
        orderBy: { issuedAt: 'desc' },
        take: 3
      }
    }
  });
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Get recent learning activity
  const recentActivity = await prisma.learningSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      lessonId: true,
      categoryId: true,
      isCompleted: true,
      xpEarned: true,
      timeSpent: true,
      createdAt: true
    }
  });
  
  // Get daily learning for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayLearning = await prisma.dailyLearning.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    }
  });
  
  // Get pending achievements
  const pendingAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      isNotified: false
    },
    include: {
      achievement: true
    },
    take: 3
  });
  
  // Mark achievements as notified
  if (pendingAchievements.length > 0) {
    await prisma.userAchievement.updateMany({
      where: {
        userId,
        isNotified: false
      },
      data: {
        isNotified: true
      }
    });
  }
  
  // Calculate next milestone
  const nextLevel = user.level + 1;
  const xpForNextLevel = nextLevel * 500;
  const xpNeeded = Math.max(0, xpForNextLevel - user.xp);
  
  const dashboard = {
    user: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      streak: user.learningStreak?.currentStreak || 0
    },
    todayProgress: {
      completed: todayLearning?.lessonsCompleted || 0,
      timeSpent: Math.round((todayLearning?.timeSpent || 0) / 60),
      xpEarned: todayLearning?.xpEarned || 0
    },
    quickStats: {
      totalXp: user.xp,
      currentStreak: user.learningStreak?.currentStreak || 0,
      longestStreak: user.learningStreak?.longestStreak || 0,
      certificatesEarned: user.certificates.length,
      achievementsUnlocked: user.userAchievements.length
    },
    nextMilestone: {
      level: nextLevel,
      xpNeeded,
      progress: ((user.xp % 500) / 500) * 100
    },
    recentActivity: recentActivity.slice(0, 5).map(activity => ({
      id: activity.id,
      type: activity.isCompleted ? 'completed' : 'started',
      lessonId: activity.lessonId,
      category: activity.categoryId,
      xp: activity.xpEarned,
      timeSpent: Math.round((activity.timeSpent || 0) / 60),
      timestamp: activity.createdAt
    })),
    newAchievements: pendingAchievements.map(ua => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category
    })),
    recommendedActions: generateRecommendedActions(user, recentActivity)
  };
  
  return NextResponse.json({
    success: true,
    data: {
      dashboard,
      syncInfo: {
        lastSync: new Date().toISOString(),
        version: '1.0',
        requiresUpdate: false
      }
    }
  });
}

// Sync data for offline functionality
async function getSyncData(userId: string, lastSync?: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const syncDate = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
  
  // Get updated data since last sync
  const [user, achievements, certificates, recentSessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        learningStreak: true,
        userAchievements: {
          include: { achievement: true },
          where: { earnedAt: { gt: syncDate } }
        }
      }
    }),
    prisma.userAchievement.findMany({
      where: {
        userId,
        earnedAt: { gt: syncDate }
      },
      include: { achievement: true }
    }),
    prisma.certificate.findMany({
      where: {
        userId,
        issuedAt: { gt: syncDate }
      }
    }),
    prisma.learningSession.findMany({
      where: {
        userId,
        createdAt: { gt: syncDate }
      }
    })
  ]);
  
  return NextResponse.json({
    success: true,
    data: {
      user: user ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.learningStreak?.currentStreak || 0
      } : null,
      newAchievements: achievements.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        earnedAt: ua.earnedAt
      })),
      newCertificates: certificates,
      recentActivity: recentSessions,
      syncTimestamp: new Date().toISOString()
    }
  });
}

// Quick actions for mobile
async function getQuickActions(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learningStreak: true,
      dailyLearning: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }
    }
  });
  
  const todayLearning = user?.dailyLearning[0];
  const hasStudiedToday = todayLearning && todayLearning.timeSpent > 0;
  
  const quickActions = [
    {
      id: 'continue_learning',
      title: hasStudiedToday ? 'Continue Learning' : 'Start Today\'s Lesson',
      description: hasStudiedToday ? 'Keep your streak alive' : 'Begin your learning journey',
      icon: 'BookOpen',
      action: hasStudiedToday ? 'resume' : 'start',
      priority: 'high'
    },
    {
      id: 'quick_assessment',
      title: 'Quick Assessment',
      description: 'Test your knowledge',
      icon: 'CheckCircle',
      action: 'assessment',
      priority: 'medium'
    },
    {
      id: 'view_achievements',
      title: 'View Achievements',
      description: 'Check your progress',
      icon: 'Award',
      action: 'achievements',
      priority: 'low'
    }
  ];
  
  // Add streak maintenance action if user hasn't studied today
  if (!hasStudiedToday && user?.learningStreak?.currentStreak > 0) {
    quickActions.unshift({
      id: 'maintain_streak',
      title: 'Maintain Streak',
      description: `Study today to keep your ${user.learningStreak.currentStreak}-day streak`,
      icon: 'Flame',
      action: 'streak',
      priority: 'critical'
    });
  }
  
  return NextResponse.json({
    success: true,
    data: { quickActions }
  });
}

// Push notifications
async function getNotifications(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learningStreak: true,
      userAchievements: {
        where: { isNotified: false },
        include: { achievement: true },
        take: 3
      }
    }
  });
  
  const notifications = [];
  
  // Streak reminder notification
  if (user?.learningStreak?.currentStreak > 0) {
    const lastActive = user.learningStreak.lastActiveDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastActive && new Date(lastActive).getTime() < today.getTime()) {
      notifications.push({
        id: 'streak_reminder',
        type: 'reminder',
        title: 'Don\'t lose your streak!',
        message: `You haven't studied today. Keep your ${user.learningStreak.currentStreak}-day streak alive.`,
        action: 'start_learning',
        priority: 'high',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Achievement notifications
  for (const achievement of user?.userAchievements || []) {
    notifications.push({
      id: `achievement_${achievement.id}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${achievement.achievement.name} - ${achievement.achievement.description}`,
      action: 'view_achievement',
      priority: 'medium',
      timestamp: achievement.earnedAt,
      data: {
        achievementId: achievement.achievement.id,
        achievementName: achievement.achievement.name
      }
    });
  }
  
  // Level up notification
  if (user && user.xp > 0 && user.xp % 500 < 50) { // Close to level up
    const nextLevel = user.level + 1;
    notifications.push({
      id: 'level_up',
      type: 'celebration',
      title: 'Level Up Soon!',
      message: `You're ${500 - (user.xp % 500)} XP away from Level ${nextLevel}`,
      action: 'view_progress',
      priority: 'medium',
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    success: true,
    data: { notifications }
  });
}

// Offline content for download
async function getOfflineContent(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  // Get user's enrolled courses
  const enrolledCourses = await prisma.learningSession.findMany({
    where: { userId },
    select: {
      categoryId: true,
      lessonId: true
    },
    distinct: ['categoryId']
  });
  
  // Mock offline content structure
  const offlineContent = enrolledCourses.map(course => ({
    courseId: course.categoryId,
    title: getCourseTitle(course.categoryId),
    description: 'Downloaded for offline access',
    lessons: [
      {
        id: course.lessonId,
        title: 'Lesson 1',
        content: 'Offline lesson content...',
        duration: 15,
        downloaded: true
      }
    ],
    lastUpdated: new Date().toISOString(),
    size: '2.5 MB'
  }));
  
  return NextResponse.json({
    success: true,
    data: { offlineContent }
  });
}

// Mobile-specific statistics
async function getMobileStats(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  // Get user's learning stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [dailyLearning, xpGains, sessions] = await Promise.all([
    prisma.dailyLearning.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      }
    }),
    prisma.xpGain.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.learningSession.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    })
  ]);
  
  const stats = {
    overview: {
      totalXp: xpGains.reduce((sum, gain) => sum + gain.amount, 0),
      activeDays: dailyLearning.filter(day => day.timeSpent > 0).length,
      totalTime: Math.round(sessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0) / 60),
      completedLessons: sessions.filter(s => s.isCompleted).length
    },
    dailyAverage: {
      xp: Math.round(xpGains.reduce((sum, gain) => sum + gain.amount, 0) / 30),
      time: Math.round(dailyLearning.reduce((sum, day) => sum + day.timeSpent, 0) / 30 / 60),
      lessons: Math.round(dailyLearning.reduce((sum, day) => sum + day.lessonsCompleted, 0) / 30)
    },
    streakInfo: {
      current: 0, // Would be fetched from learningStreak
      longest: 0,
      thisWeek: dailyLearning.filter(day => {
        const dayOfWeek = new Date(day.date).getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5 && day.timeSpent > 0;
      }).length
    },
    progress: {
      level: 0, // Would be fetched from user
      xpProgress: 0, // Would be calculated
      nextLevel: 0
    }
  };
  
  return NextResponse.json({
    success: true,
    data: { stats }
  });
}

// Sync offline actions
async function syncActions(data: { userId: string; actions: MobileAction[] }) {
  const { userId, actions } = data;
  
  if (!userId || !actions || !Array.isArray(actions)) {
    return NextResponse.json(
      { success: false, error: 'Invalid data' },
      { status: 400 }
    );
  }
  
  const results = [];
  
  for (const action of actions) {
    try {
      let result;
      
      switch (action.type) {
        case 'lesson_complete':
          result = await processLessonComplete(userId, action.data);
          break;
        case 'assessment_submit':
          result = await processAssessmentSubmit(userId, action.data);
          break;
        case 'exercise_complete':
          result = await processExerciseComplete(userId, action.data);
          break;
        default:
          result = { success: false, error: 'Unknown action type' };
      }
      
      results.push({
        actionId: action.id,
        success: result.success,
        result
      });
    } catch (error) {
      results.push({
        actionId: action.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return NextResponse.json({
    success: true,
    data: { syncResults: results }
  });
}

// Helper functions

function generateRecommendedActions(user: any, recentActivity: any[]) {
  const actions = [];
  
  // If user hasn't studied today, recommend starting
  if (recentActivity.length === 0 || 
      new Date(recentActivity[0].createdAt).getDate() !== new Date().getDate()) {
    actions.push({
      type: 'study_today',
      title: 'Start Today\'s Learning',
      description: 'Begin your daily learning session',
      priority: 'high'
    });
  }
  
  // If user has low streak, recommend maintaining it
  if (user.learningStreak?.currentStreak < 7) {
    actions.push({
      type: 'maintain_streak',
      title: 'Build Your Streak',
      description: 'Study consistently to build a strong learning habit',
      priority: 'medium'
    });
  }
  
  return actions;
}

function getCourseTitle(courseId: string): string {
  const titles = {
    'banking-insurance': 'Banking & Insurance Fundamentals',
    'module-17': 'Insurance & Risk Management',
    'module-18': 'Tax Planning & Investment',
    'module-19': 'Goal-Based Investment Planning'
  };
  return titles[courseId] || 'Course';
}

async function processLessonComplete(userId: string, data: any) {
  // Implementation would process lesson completion
  return { success: true, xpEarned: 100 };
}

async function processAssessmentSubmit(userId: string, data: any) {
  // Implementation would process assessment submission
  return { success: true, score: data.score || 0 };
}

async function processExerciseComplete(userId: string, data: any) {
  // Implementation would process exercise completion
  return { success: true, xpEarned: 75 };
}

async function updateMobileStreak(data: { userId: string }) {
  // Implementation would update learning streak
  return { success: true, streak: 1 };
}

async function cacheContent(data: { userId: string; contentIds: string[] }) {
  // Implementation would cache content for offline use
  return { success: true, cachedCount: data.contentIds.length };
}

async function handlePushNotification(data: { userId: string; notificationId: string; action: string }) {
  // Implementation would handle push notification interactions
  return { success: true, processed: true };
}

async function saveOfflineProgress(data: { userId: string; progress: any }) {
  // Implementation would save offline progress
  return { success: true, saved: true };
}