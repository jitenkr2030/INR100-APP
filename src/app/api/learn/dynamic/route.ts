import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dynamic Learn API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const category = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'popular';

    // Get user's learning progress
    const userProgress = await db.learnProgress.findMany({
      where: { userId },
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
    });

    // Get courses/modules based on filters
    let modulesQuery = db.learnModule.findMany({
      include: {
        category: true,
        lessons: {
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    });

    // Apply category filter
    if (category !== 'all') {
      modulesQuery = modulesQuery.where({
        category: {
          name: category
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      modulesQuery = modulesQuery.where({
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { category: { name: { contains: searchQuery, mode: 'insensitive' } } }
        ]
      });
    }

    const modules = await modulesQuery;

    // Calculate progress for each module
    const enrichedModules = modules.map(module => {
      const moduleLessons = module.lessons;
      const completedLessons = moduleLessons.filter(lesson => 
        lesson.progress.length > 0 && lesson.progress[0].isCompleted
      );
      
      const totalLessons = moduleLessons.length;
      const completedCount = completedLessons.length;
      const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      // Calculate time spent
      const totalTimeSpent = moduleLessons.reduce((sum, lesson) => {
        const progress = lesson.progress[0];
        return sum + (progress?.timeSpent || 0);
      }, 0);

      // Get average score
      const scoresWithData = moduleLessons
        .map(lesson => lesson.progress[0]?.score)
        .filter(score => score !== null && score !== undefined);
      
      const averageScore = scoresWithData.length > 0 
        ? Math.round(scoresWithData.reduce((sum, score) => sum + score, 0) / scoresWithData.length)
        : 0;

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        category: module.category?.name || 'General',
        difficulty: module.difficulty || 'BEGINNER',
        totalLessons,
        completedLessons: completedCount,
        progressPercent,
        totalTimeSpent, // in minutes
        averageScore,
        estimatedDuration: module.estimatedDuration || totalLessons * 15, // 15 min per lesson
        isCompleted: completedCount === totalLessons && totalLessons > 0,
        lastAccessed: moduleLessons
          .filter(l => l.progress.length > 0)
          .sort((a, b) => new Date(b.progress[0].updatedAt).getTime() - new Date(a.progress[0].updatedAt).getTime())[0]?.progress[0]?.updatedAt,
        lessons: moduleLessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration || 15,
          isCompleted: lesson.progress.length > 0 && lesson.progress[0].isCompleted,
          score: lesson.progress[0]?.score || null,
          timeSpent: lesson.progress[0]?.timeSpent || 0,
          lastAccessed: lesson.progress[0]?.updatedAt
        }))
      };
    });

    // Sort modules
    let sortedModules = enrichedModules;
    switch (sortBy) {
      case 'progress_desc':
        sortedModules = enrichedModules.sort((a, b) => b.progressPercent - a.progressPercent);
        break;
      case 'recent':
        sortedModules = enrichedModules.sort((a, b) => {
          const aDate = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
          const bDate = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'duration':
        sortedModules = enrichedModules.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
        break;
      default: // popular
        sortedModules = enrichedModules.sort((a, b) => {
          if (a.isCompleted && !b.isCompleted) return -1;
          if (!a.isCompleted && b.isCompleted) return 1;
          return b.progressPercent - a.progressPercent;
        });
    }

    // Get categories
    const categories = await db.learnCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        color: true
      }
    });

    // Calculate user learning stats
    const totalLessons = userProgress.length;
    const completedLessons = userProgress.filter(p => p.isCompleted).length;
    const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const currentStreak = await calculateCurrentStreak(userId);
    const longestStreak = await calculateLongestStreak(userId);

    // Get user's achievements
    const userAchievements = await db.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { earnedAt: 'desc' }
    });

    const learningData = {
      modules: sortedModules,
      categories: categories.map(cat => ({
        ...cat,
        moduleCount: modules.filter(m => m.category?.name === cat.name).length
      })),
      
      userStats: {
        totalLessons,
        completedLessons,
        totalTimeSpent, // in minutes
        currentStreak,
        longestStreak,
        overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        averageScore: userProgress.length > 0 
          ? Math.round(userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length)
          : 0,
        level: calculateUserLevel(completedLessons),
        xp: calculateUserXP(completedLessons, totalTimeSpent)
      },

      achievements: userAchievements.map(ua => ({
        id: ua.id,
        badgeId: ua.badgeId,
        name: ua.badge.name,
        description: ua.badge.description,
        icon: ua.badge.icon,
        rarity: ua.badge.rarity,
        earnedAt: ua.earnedAt
      })),

      recentActivity: userProgress
        .filter(p => p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5)
        .map(p => ({
          lessonId: p.lessonId,
          lessonTitle: p.lesson?.title || 'Unknown Lesson',
          moduleTitle: p.lesson?.module?.title || 'Unknown Module',
          completedAt: p.completedAt,
          score: p.score,
          timeSpent: p.timeSpent
        })),

      recommendations: await getPersonalizedRecommendations(userId, userProgress),

      filters: {
        category,
        searchQuery,
        sortBy
      },

      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: learningData
    });

  } catch (error) {
    console.error('Dynamic Learn API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'update_progress':
        // Update learning progress
        const { lessonId, isCompleted, score, timeSpent } = data;
        
        const progress = await db.learnProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId
            }
          },
          update: {
            isCompleted,
            score,
            timeSpent,
            completedAt: isCompleted ? new Date() : null,
            updatedAt: new Date()
          },
          create: {
            userId,
            lessonId,
            isCompleted,
            score,
            timeSpent,
            completedAt: isCompleted ? new Date() : null
          }
        });

        return NextResponse.json({
          success: true,
          data: progress,
          message: 'Progress updated successfully!'
        });

      case 'start_lesson':
        // Mark lesson as started
        const { lessonId: startLessonId } = data;
        
        await db.learnProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId: startLessonId
            }
          },
          update: {
            startedAt: new Date(),
            updatedAt: new Date()
          },
          create: {
            userId,
            lessonId: startLessonId,
            isCompleted: false,
            startedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Lesson started!'
        });

      case 'complete_quiz':
        // Complete a quiz
        const { lessonId: quizLessonId, score: quizScore, answers } = data;
        
        // Save quiz attempt
        const quizAttempt = await db.quizAttempt.create({
          data: {
            userId,
            quizId: `lesson_${quizLessonId}`,
            score: quizScore,
            answers: answers,
            attemptedAt: new Date()
          }
        });

        // Update progress
        await db.learnProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId: quizLessonId
            }
          },
          update: {
            score: quizScore,
            completedAt: new Date(),
            isCompleted: true,
            updatedAt: new Date()
          },
          create: {
            userId,
            lessonId: quizLessonId,
            score: quizScore,
            isCompleted: true,
            completedAt: new Date()
          }
        });

        // Check for achievement unlock
        await checkAndUnlockAchievements(userId, quizScore);

        return NextResponse.json({
          success: true,
          data: quizAttempt,
          message: 'Quiz completed successfully!'
        });

      case 'bookmark_lesson':
        // Bookmark a lesson
        const { lessonId: bookmarkLessonId } = data;
        
        await db.userBookmark.create({
          data: {
            userId,
            lessonId: bookmarkLessonId
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Lesson bookmarked!'
        });

      case 'remove_bookmark':
        // Remove bookmark
        const { lessonId: removeBookmarkLessonId } = data;
        
        await db.userBookmark.deleteMany({
          where: {
            userId,
            lessonId: removeBookmarkLessonId
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Bookmark removed!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Dynamic Learn POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform learning action' },
      { status: 500 }
    );
  }
}

// Helper functions
async function calculateCurrentStreak(userId: string): Promise<number> {
  const progress = await db.learnProgress.findMany({
    where: {
      userId,
      isCompleted: true
    },
    orderBy: { completedAt: 'desc' },
    take: 30
  });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const p of progress) {
    const activityDate = new Date(p.completedAt!);
    activityDate.setHours(0, 0, 0, 0);
    
    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (activityDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  return streak;
}

async function calculateLongestStreak(userId: string): Promise<number> {
  const progress = await db.learnProgress.findMany({
    where: { userId, isCompleted: true },
    orderBy: { completedAt: 'asc' }
  });

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const p of progress) {
    const currentDate = new Date(p.completedAt!);
    currentDate.setHours(0, 0, 0, 0);

    if (!lastDate || isConsecutiveDay(lastDate, currentDate)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
    lastDate = currentDate;
  }

  return maxStreak;
}

function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function calculateUserLevel(completedLessons: number): number {
  return Math.floor(completedLessons / 10) + 1; // Level up every 10 lessons
}

function calculateUserXP(completedLessons: number, timeSpent: number): number {
  return completedLessons * 100 + timeSpent * 10; // 100 XP per lesson + 10 XP per minute
}

async function getPersonalizedRecommendations(userId: string, userProgress: any[]) {
  // Get user's weak areas based on low scores
  const weakAreas = userProgress
    .filter(p => p.score && p.score < 70)
    .map(p => p.lesson?.module?.category?.name)
    .filter(Boolean);

  // Get recommended modules based on weak areas
  const recommendations = await db.learnModule.findMany({
    where: {
      category: {
        name: { in: weakAreas }
      }
    },
    take: 5,
    include: {
      category: true
    }
  });

  return recommendations.map(module => ({
    id: module.id,
    title: module.title,
    category: module.category?.name || 'General',
    reason: `Strengthen your ${module.category?.name || 'skills'}`
  }));
}

async function checkAndUnlockAchievements(userId: string, score: number) {
  // Check for quiz-related achievements
  if (score === 100) {
    // Perfect score achievement
    const perfectScoreBadge = await db.badge.findFirst({
      where: { name: 'Perfect Score' }
    });
    
    if (perfectScoreBadge) {
      await db.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: perfectScoreBadge.id
          }
        },
        update: {},
        create: {
          userId,
          badgeId: perfectScoreBadge.id,
          earnedAt: new Date()
        }
      });
    }
  }

  // Check for high score achievement
  if (score >= 90) {
    const highScoreBadge = await db.badge.findFirst({
      where: { name: 'High Achiever' }
    });
    
    if (highScoreBadge) {
      await db.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: highScoreBadge.id
          }
        },
        update: {},
        create: {
          userId,
          badgeId: highScoreBadge.id,
          earnedAt: new Date()
        }
      });
    }
  }
}