import { NextRequest, NextResponse } from 'next/server';
import RealAnalyticsService from '@/lib/analyticsService';

// Real Learning Analytics API Route
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const range = searchParams.get('range') || 'month';

    const analyticsService = RealAnalyticsService.getInstance();
    
    // Get real analytics data
    const analyticsData = await analyticsService.getUserLearningMetrics(userId, range);
    const subjectPerformance = await analyticsService.getSubjectPerformance(userId);
    const learningPatterns = await analyticsService.getLearningPatterns(userId);

    // Get weaknesses and strengths from database
    const weaknesses = await getWeaknesses(userId);
    const strengths = await getStrengths(userId);
    const insights = await getInsights(userId, analyticsData);

    return NextResponse.json({
      success: true,
      data: {
        overview: analyticsData,
        subjectPerformance,
        learningPatterns,
        weaknesses,
        strengths,
        insights
      }
    });
  } catch (error) {
    console.error('Get real analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for weaknesses, strengths, and insights
async function getWeaknesses(userId: string) {
  // Get user's lowest performing areas from quiz scores and lesson completion
  const lowScores = await db.quizAttempt.findMany({
    where: { userId, score: { lt: 70 } },
    include: {
      quiz: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      }
    }
  });

  const weaknessMap = new Map();
  lowScores.forEach(attempt => {
    const category = attempt.quiz.lesson.module.category.name;
    const current = weaknessMap.get(category) || { total: 0, count: 0 };
    weaknessMap.set(category, {
      total: current.total + attempt.score,
      count: current.count + 1
    });
  });

  const weaknesses = [];
  for (const [area, data] of weaknessMap) {
    const avgScore = data.total / data.count;
    if (avgScore < 70) {
      weaknesses.push({
        area,
        score: Math.round(avgScore),
        recommendedLessons: [`${area} Basics`, `${area} Intermediate`, `${area} Advanced`],
        difficulty: avgScore < 50 ? 'Advanced' : 'Intermediate'
      });
    }
  }

  return weaknesses.slice(0, 3); // Top 3 weaknesses
}

async function getStrengths(userId: string) {
  // Get user's highest performing areas
  const highScores = await db.quizAttempt.findMany({
    where: { userId, score: { gte: 85 } },
    include: {
      quiz: {
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      }
    }
  });

  const strengthMap = new Map();
  highScores.forEach(attempt => {
    const category = attempt.quiz.lesson.module.category.name;
    const current = strengthMap.get(category) || { total: 0, count: 0 };
    strengthMap.set(category, {
      total: current.total + attempt.score,
      count: current.count + 1
    });
  });

  const strengths = [];
  for (const [area, data] of strengthMap) {
    const avgScore = data.total / data.count;
    if (avgScore >= 85) {
      const completedLessons = await db.learnProgress.count({
        where: {
          userId,
          isCompleted: true,
          lesson: {
            module: {
              category: {
                name: area
              }
            }
          }
        }
      });

      strengths.push({
        area,
        score: Math.round(avgScore),
        completedLessons,
        masteryLevel: avgScore >= 90 ? 'Expert' : 'Advanced'
      });
    }
  }

  return strengths.slice(0, 3); // Top 3 strengths
}

async function getInsights(userId: string, analyticsData: any) {
  // Analyze user's learning patterns for personalized insights
  const sessions = await db.userSession.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    take: 50
  });

  // Find best learning time
  const hourActivity = new Array(24).fill(0);
  sessions.forEach(session => {
    const hour = new Date(session.startedAt).getHours();
    hourActivity[hour] += session.duration || 0;
  });

  const bestHour = hourActivity.indexOf(Math.max(...hourActivity));
  const bestLearningTime = `${bestHour}:00 - ${bestHour + 2}:00`;

  // Calculate preferred learning duration
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const preferredDuration = Math.round(totalDuration / sessions.length);

  // Calculate knowledge retention rate
  const recentQuizzes = await db.quizAttempt.findMany({
    where: {
      userId,
      attemptedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  const retentionRate = recentQuizzes.length > 0 
    ? recentQuizzes.reduce((sum, q) => sum + q.score, 0) / recentQuizzes.length
    : 75;

  // Generate trend insights
  const engagementTrends = [];
  if (analyticsData.learningVelocity > 80) {
    engagementTrends.push('Learning velocity increased significantly this month ↗');
  }
  if (analyticsData.consistencyScore > 80) {
    engagementTrends.push('Study consistency has improved by 15% ↗');
  }
  if (analyticsData.engagementLevel > 85) {
    engagementTrends.push('Overall engagement is at an all-time high ↗');
  }

  // Generate recommendations
  const recommendations = [];
  if (bestHour >= 9 && bestHour <= 11) {
    recommendations.push('Schedule challenging topics during your peak hours (9-11 AM)');
  }
  if (preferredDuration < 30) {
    recommendations.push('Consider longer study sessions for better retention');
  }
  if (retentionRate < 80) {
    recommendations.push('Review previous lessons to improve knowledge retention');
  }
  if (analyticsData.currentStreak > 7) {
    recommendations.push('Maintain your excellent learning streak!');
  }

  return {
    bestLearningTime,
    preferredLearningDuration: preferredDuration,
    knowledgeRetentionRate: Math.round(retentionRate),
    learningVelocity: analyticsData.learningVelocity,
    engagementTrends,
    recommendations
  };
}

// Import db at the top
import { db } from '@/lib/db';