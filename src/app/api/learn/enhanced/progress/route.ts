import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Enhanced Progress API with Real Database Integration
interface EnhancedProgressData {
  userId: string;
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  action: 'start_lesson' | 'complete_lesson' | 'start_assessment' | 'complete_assessment' | 'complete_exercise' | 'complete_case_study' | 'use_interactive_feature';
  timeSpent?: number;
  interactiveFeatures?: {
    calculatorUsed?: boolean;
    caseStudyCompleted?: boolean;
    assessmentTaken?: boolean;
    exerciseCompleted?: boolean;
  };
  score?: number;
  percentage?: number;
  data?: any;
}

// Enhanced XP calculation function with database integration
async function calculateEnhancedXP(action: string, features: any[] = [], score?: number): Promise<number> {
  let baseXP = 0;
  
  switch (action) {
    case 'complete_lesson':
      baseXP = 100;
      break;
    case 'complete_assessment':
      baseXP = 150;
      break;
    case 'complete_exercise':
      baseXP = 75;
      break;
    case 'complete_case_study':
      baseXP = 125;
      break;
    case 'use_interactive_feature':
      baseXP = 25;
      break;
    default:
      baseXP = 50;
  }
  
  // Bonus XP for using interactive features
  const featureBonus = features.length * 25;
  
  // Performance bonus for assessments
  let performanceBonus = 0;
  if (score !== undefined && score >= 90) {
    performanceBonus = 50; // Excellent performance
  } else if (score >= 75) {
    performanceBonus = 25; // Good performance
  }
  
  return baseXP + featureBonus + performanceBonus;
}

// Get or create learning session
async function getOrCreateLearningSession(userId: string, lessonId: string, moduleId: string, categoryId: string) {
  const existingSession = await prisma.learningSession.findFirst({
    where: {
      userId,
      lessonId,
      isCompleted: false
    }
  });
  
  if (existingSession) {
    return existingSession;
  }
  
  return await prisma.learningSession.create({
    data: {
      userId,
      lessonId,
      moduleId,
      categoryId,
      sessionStart: new Date(),
      isCompleted: false,
      xpEarned: 0
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const progressData: EnhancedProgressData = await request.json();
    const { userId, courseId, lessonId, action, timeSpent, interactiveFeatures, score, percentage } = progressData;
    
    // Validate required fields
    if (!userId || !courseId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, courseId, action' },
        { status: 400 }
      );
    }
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate enhanced XP
    const features = [];
    if (interactiveFeatures?.calculatorUsed) features.push('calculator');
    if (interactiveFeatures?.caseStudyCompleted) features.push('case_study');
    if (interactiveFeatures?.assessmentTaken) features.push('assessment');
    if (interactiveFeatures?.exerciseCompleted) features.push('exercise');
    
    const xpEarned = await calculateEnhancedXP(action, features, score);
    
    // Create or update learning session
    let session = null;
    if (lessonId) {
      session = await getOrCreateLearningSession(userId, lessonId, progressData.moduleId || 'unknown', courseId);
    }
    
    // Create XP gain record
    await prisma.xpGain.create({
      data: {
        userId,
        source: action.includes('assessment') ? 'quiz' : action.includes('lesson') ? 'lesson' : 'course',
        sourceId: lessonId || courseId,
        amount: xpEarned,
        reason: `${action.replace('_', ' ')} - ${courseId}`
      }
    });
    
    // Update user XP and level
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpEarned
        },
        level: {
          set: Math.floor((user.xp + xpEarned) / 500) + 1 // Level up every 500 XP
        }
      }
    });
    
    // Update learning session if exists
    if (session) {
      const sessionUpdateData: any = {
        timeSpent: {
          increment: timeSpent || 0
        }
      };
      
      if (action === 'complete_lesson' || action === 'complete_assessment') {
        sessionUpdateData.isCompleted = true;
        sessionUpdateData.sessionEnd = new Date();
        sessionUpdateData.xpEarned = {
          increment: xpEarned
        };
      }
      
      await prisma.learningSession.update({
        where: { id: session.id },
        data: sessionUpdateData
      });
    }
    
    // Update daily learning stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await prisma.dailyLearning.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        timeSpent: {
          increment: timeSpent || 0
        },
        xpEarned: {
          increment: xpEarned
        },
        lessonsCompleted: action === 'complete_lesson' ? {
          increment: 1
        } : undefined,
        quizzesCompleted: action === 'complete_assessment' ? {
          increment: 1
        } : undefined
      },
      create: {
        userId,
        date: today,
        timeSpent: timeSpent || 0,
        xpEarned: xpEarned,
        lessonsCompleted: action === 'complete_lesson' ? 1 : 0,
        quizzesCompleted: action === 'complete_assessment' ? 1 : 0,
        coursesCompleted: 0
      }
    });
    
    // Update learning streak
    await updateLearningStreak(userId);
    
    // Check for achievements
    const newAchievements = await checkAndAwardAchievements(userId, action, score, percentage);
    
    // Generate certificate for module completion
    const certificateGenerated = action === 'complete_assessment' && percentage >= 70;
    let certificate = null;
    
    if (certificateGenerated) {
      certificate = await generateCertificate(userId, courseId, progressData.moduleId, percentage);
    }
    
    // Response data
    const responseData = {
      success: true,
      data: {
        xpEarned,
        certificateGenerated,
        levelUp: updatedUser.level > user.level,
        newLevel: updatedUser.level,
        achievements: newAchievements,
        nextMilestone: getNextMilestone(updatedUser.xp),
        progress: await calculateUserProgress(userId, courseId)
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Enhanced progress tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Get user's learning sessions
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        ...(courseId && { categoryId: courseId }),
        ...(moduleId && { moduleId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    // Calculate summary statistics
    const summary = await prisma.xpGain.aggregate({
      where: { userId },
      _sum: { amount: true }
    });
    
    const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.timeSpent || 0), 0);
    const assessmentsCompleted = sessions.filter(s => s.sessionEnd && s.xpEarned > 0).length;
    const exercisesCompleted = sessions.filter(s => s.sessionEnd).length;
    const lessonsCompleted = sessions.filter(s => s.isCompleted).length;
    
    const lastActivity = sessions.length > 0 ? sessions[0].createdAt : null;
    
    return NextResponse.json({
      success: true,
      data: {
        progress: sessions,
        summary: {
          totalXpEarned: summary._sum.amount || 0,
          totalTimeSpent,
          assessmentsCompleted,
          exercisesCompleted,
          lessonsCompleted,
          lastActivity
        },
        userId,
        courseId,
        moduleId: moduleId ? parseInt(moduleId) : null
      }
    });
  } catch (error) {
    console.error('Enhanced progress retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions

async function updateLearningStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingStreak = await prisma.learningStreak.findUnique({
    where: { userId }
  });
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!existingStreak) {
    // Create new streak
    await prisma.learningStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today
      }
    });
  } else {
    const lastActive = existingStreak.lastActiveDate ? new Date(existingStreak.lastActiveDate) : null;
    
    if (lastActive && lastActive.getTime() === today.getTime()) {
      // Already active today, no change
      return;
    } else if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      // Consecutive day, increment streak
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreak: existingStreak.currentStreak + 1,
          longestStreak: Math.max(existingStreak.longestStreak, existingStreak.currentStreak + 1),
          lastActiveDate: today
        }
      });
    } else {
      // Streak broken, reset to 1
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: existingStreak.longestStreak,
          lastActiveDate: today,
          streakBrokenAt: lastActive || undefined
        }
      });
    }
  }
}

async function checkAndAwardAchievements(userId: string, action: string, score?: number, percentage?: number): Promise<string[]> {
  const newAchievements: string[] = [];
  
  // Check for streak achievements
  const streak = await prisma.learningStreak.findUnique({ where: { userId } });
  if (streak) {
    if (streak.currentStreak === 7) {
      await awardAchievement(userId, 'week_warrior');
      newAchievements.push('Week Warrior');
    }
    if (streak.currentStreak === 30) {
      await awardAchievement(userId, 'month_master');
      newAchievements.push('Month Master');
    }
  }
  
  // Check for performance achievements
  if (score && score >= 100) {
    await awardAchievement(userId, 'perfect_score');
    newAchievements.push('Perfect Score');
  }
  
  // Check for interactive feature usage
  await awardAchievement(userId, 'first_lesson');
  
  return newAchievements;
}

async function awardAchievement(userId: string, achievementId: string) {
  // First check if achievement exists
  const achievement = await prisma.achievement.findUnique({
    where: { name: achievementId }
  });
  
  if (!achievement) {
    // Create the achievement if it doesn't exist
    await prisma.achievement.create({
      data: {
        name: achievementId,
        description: getAchievementDescription(achievementId),
        category: getAchievementCategory(achievementId),
        xpReward: getAchievementXPReward(achievementId),
        criteria: '{}',
        isActive: true
      }
    });
  }
  
  // Check if user already has this achievement
  const existingUserAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievementId
      }
    }
  });
  
  if (!existingUserAchievement) {
    // Award the achievement
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        progress: 100,
        isNotified: true
      }
    });
    
    // Award XP for the achievement
    const achievement = await prisma.achievement.findUnique({
      where: { name: achievementId }
    });
    
    if (achievement && achievement.xpReward > 0) {
      await prisma.xpGain.create({
        data: {
          userId,
          source: 'achievement',
          sourceId: achievementId,
          amount: achievement.xpReward,
          reason: `Achievement: ${achievement.name}`
        }
      });
      
      // Update user's total XP
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: achievement.xpReward
          }
        }
      });
    }
  }
}

function getAchievementDescription(achievementId: string): string {
  const descriptions = {
    'first_lesson': 'Complete your first lesson',
    'week_warrior': 'Maintain a 7-day learning streak',
    'month_master': 'Maintain a 30-day learning streak',
    'perfect_score': 'Score 100% on any assessment'
  };
  return descriptions[achievementId] || 'Achievement unlocked';
}

function getAchievementCategory(achievementId: string): string {
  if (achievementId.includes('lesson')) return 'learning';
  if (achievementId.includes('streak')) return 'streak';
  if (achievementId.includes('score')) return 'assessment';
  return 'general';
}

function getAchievementXPReward(achievementId: string): number {
  const rewards = {
    'first_lesson': 50,
    'week_warrior': 250,
    'month_master': 1000,
    'perfect_score': 300
  };
  return rewards[achievementId] || 100;
}

async function generateCertificate(userId: string, courseId: string, moduleId?: string, score?: number) {
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return await prisma.certificate.create({
    data: {
      userId,
      courseId,
      categoryId: courseId,
      moduleId: moduleId || 'unknown',
      certificateNumber,
      completionPercentage: 100,
      finalScore: score || 100,
      totalTimeSpent: 0,
      metadata: JSON.stringify({
        generatedAt: new Date().toISOString(),
        score,
        courseId
      })
    }
  });
}

function getNextMilestone(currentXp: number): string {
  const milestones = [
    { xp: 500, title: 'Learning Enthusiast' },
    { xp: 1000, title: 'Knowledge Seeker' },
    { xp: 2000, title: 'Finance Expert' },
    { xp: 5000, title: 'Investment Guru' }
  ];
  
  const nextMilestone = milestones.find(m => m.xp > currentXp);
  return nextMilestone ? `${nextMilestone.xp - currentXp} XP to ${nextMilestone.title}` : 'Max level reached!';
}

async function calculateUserProgress(userId: string, courseId: string): Promise<number> {
  // Mock progress calculation - in real app, this would check against course structure
  const sessions = await prisma.learningSession.count({
    where: {
      userId,
      categoryId: courseId,
      isCompleted: true
    }
  });
  
  // Assume 20 total items for mock calculation
  const totalItems = 20;
  return Math.min(100, (sessions / totalItems) * 100);
}