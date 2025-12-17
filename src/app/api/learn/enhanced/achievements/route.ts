import { NextRequest, NextResponse } from 'next/server';

// Achievement interfaces
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'assessment' | 'streak' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: 'lesson_completion' | 'assessment_score' | 'streak_days' | 'xp_earned' | 'modules_completed';
    value: number;
    module?: number;
    threshold?: number;
  };
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: string;
  progress: number;
  maxProgress: number;
  isNew?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirements: string[];
  awardedAt?: string;
}

// Mock achievements database
const mockAchievements: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'BookOpen',
    category: 'learning',
    rarity: 'common',
    points: 50,
    requirements: {
      type: 'lesson_completion',
      value: 1
    }
  },
  {
    id: 'module_master',
    title: 'Module Master',
    description: 'Complete all lessons in a module',
    icon: 'Award',
    category: 'learning',
    rarity: 'rare',
    points: 200,
    requirements: {
      type: 'lesson_completion',
      value: 10,
      threshold: 10
    }
  },
  {
    id: 'knowledge_seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 50 lessons across all modules',
    icon: 'GraduationCap',
    category: 'learning',
    rarity: 'epic',
    points: 500,
    requirements: {
      type: 'lesson_completion',
      value: 50
    }
  },
  
  // Assessment Achievements
  {
    id: 'assessment_starter',
    title: 'Assessment Initiator',
    description: 'Take your first assessment',
    icon: 'CheckCircle',
    category: 'assessment',
    rarity: 'common',
    points: 75,
    requirements: {
      type: 'assessment_score',
      value: 1
    }
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Score 100% on any assessment',
    icon: 'Star',
    category: 'assessment',
    rarity: 'rare',
    points: 300,
    requirements: {
      type: 'assessment_score',
      value: 100,
      threshold: 100
    }
  },
  {
    id: 'assessment_champion',
    title: 'Assessment Champion',
    description: 'Score 85% or above on 10 assessments',
    icon: 'Trophy',
    category: 'assessment',
    rarity: 'epic',
    points: 750,
    requirements: {
      type: 'assessment_score',
      value: 10,
      threshold: 85
    }
  },
  
  // Streak Achievements
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'Calendar',
    category: 'streak',
    rarity: 'rare',
    points: 250,
    requirements: {
      type: 'streak_days',
      value: 7
    }
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'Flame',
    category: 'streak',
    rarity: 'epic',
    points: 1000,
    requirements: {
      type: 'streak_days',
      value: 30
    }
  },
  
  // XP Achievements
  {
    id: 'xp_collector_1000',
    title: 'XP Collector I',
    description: 'Earn 1,000 XP points',
    icon: 'Zap',
    category: 'mastery',
    rarity: 'common',
    points: 100,
    requirements: {
      type: 'xp_earned',
      value: 1000
    }
  },
  {
    id: 'xp_collector_5000',
    title: 'XP Collector II',
    description: 'Earn 5,000 XP points',
    icon: 'Zap',
    category: 'mastery',
    rarity: 'rare',
    points: 300,
    requirements: {
      type: 'xp_earned',
      value: 5000
    }
  },
  {
    id: 'xp_collector_10000',
    title: 'XP Collector III',
    description: 'Earn 10,000 XP points',
    icon: 'Crown',
    category: 'mastery',
    rarity: 'legendary',
    points: 1000,
    requirements: {
      type: 'xp_earned',
      value: 10000
    }
  },
  
  // Module-specific achievements
  {
    id: 'insurance_expert',
    title: 'Insurance Expert',
    description: 'Complete Module 17 with 90% or above',
    icon: 'Shield',
    category: 'special',
    rarity: 'rare',
    points: 400,
    requirements: {
      type: 'modules_completed',
      value: 1,
      module: 17,
      threshold: 90
    }
  },
  {
    id: 'tax_planning_pro',
    title: 'Tax Planning Pro',
    description: 'Complete Module 18 with 90% or above',
    icon: 'Calculator',
    category: 'special',
    rarity: 'rare',
    points: 400,
    requirements: {
      type: 'modules_completed',
      value: 1,
      module: 18,
      threshold: 90
    }
  }
];

// Mock badges
const mockBadges: Badge[] = [
  {
    id: 'banking_basics',
    name: 'Banking Basics',
    description: 'Mastered fundamental banking concepts',
    icon: 'Bank',
    color: 'bg-blue-500',
    category: 'foundations',
    requirements: ['Complete Module 17', 'Score 80% in assessment']
  },
  {
    id: 'insurance_pro',
    name: 'Insurance Professional',
    description: 'Expert in insurance planning and risk management',
    icon: 'Shield',
    color: 'bg-purple-500',
    category: 'protection',
    requirements: ['Complete Module 17 with 90%', 'Complete 5 case studies']
  },
  {
    id: 'tax_efficient',
    name: 'Tax Efficient Investor',
    description: 'Master of tax planning and optimization',
    icon: 'Calculator',
    color: 'bg-green-500',
    category: 'tax_optimization',
    requirements: ['Complete Module 18 with 90%', 'Create 3 tax plans']
  },
  {
    id: 'learning_streak_30',
    name: '30-Day Streak',
    description: 'Maintained consistent learning for 30 days',
    icon: 'Flame',
    color: 'bg-orange-500',
    category: 'consistency',
    requirements: ['30-day learning streak', 'Complete lessons daily']
  }
];

// Mock user achievements data
const mockUserAchievements = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user-id';
    const category = searchParams.get('category');
    const includeProgress = searchParams.get('includeProgress') === 'true';
    
    // Get user's current progress (mock data)
    const userProgress = {
      lessonsCompleted: 45,
      assessmentsCompleted: 12,
      averageScore: 87.5,
      currentStreak: 7,
      totalXp: 3250,
      modulesCompleted: [1, 17],
      lastActivity: new Date().toISOString()
    };
    
    // Get user's achievements
    const userAchievements = mockUserAchievements.get(userId) || [];
    
    // Calculate achievement progress and status
    const achievementsWithProgress = mockAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      const progress = calculateAchievementProgress(achievement, userProgress);
      const isUnlocked = userAchievement !== undefined;
      
      return {
        ...achievement,
        unlockedAt: userAchievement?.unlockedAt,
        progress: includeProgress ? progress.current : 0,
        maxProgress: includeProgress ? progress.max : 0,
        isUnlocked,
        percentage: includeProgress ? Math.round((progress.current / progress.max) * 100) : 0
      };
    });
    
    // Filter by category if specified
    const filteredAchievements = category 
      ? achievementsWithProgress.filter(a => a.category === category)
      : achievementsWithProgress;
    
    // Calculate user statistics
    const userStats = {
      totalAchievements: achievementsWithProgress.length,
      unlockedAchievements: achievementsWithProgress.filter(a => a.isUnlocked).length,
      totalPoints: achievementsWithProgress
        .filter(a => a.isUnlocked)
        .reduce((sum, a) => sum + a.points, 0),
      recentAchievements: achievementsWithProgress
        .filter(a => a.isUnlocked)
        .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
        .slice(0, 5),
      nextAchievements: achievementsWithProgress
        .filter(a => !a.isUnlocked && a.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3)
    };
    
    // Get user's badges
    const userBadges = mockBadges.filter(badge => {
      // Mock badge award logic
      const badgeId = badge.id;
      if (badgeId === 'banking_basics' && userProgress.modulesCompleted.includes(17) && userProgress.averageScore >= 80) {
        return true;
      }
      if (badgeId === 'insurance_pro' && userProgress.modulesCompleted.includes(17) && userProgress.averageScore >= 90) {
        return true;
      }
      if (badgeId === 'tax_efficient' && userProgress.modulesCompleted.includes(18) && userProgress.averageScore >= 90) {
        return true;
      }
      if (badgeId === 'learning_streak_30' && userProgress.currentStreak >= 30) {
        return true;
      }
      return false;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        achievements: filteredAchievements,
        userStats,
        badges: userBadges,
        userProgress,
        categories: [...new Set(mockAchievements.map(a => a.category))],
        nextMilestones: generateNextMilestones(userProgress, achievementsWithProgress)
      }
    });
  } catch (error) {
    console.error('Achievements retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, achievementId } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (action === 'unlock' && achievementId) {
      // Check if achievement exists
      const achievement = mockAchievements.find(a => a.id === achievementId);
      if (!achievement) {
        return NextResponse.json(
          { success: false, error: 'Achievement not found' },
          { status: 404 }
        );
      }
      
      // Get or create user achievements
      const userAchievements = mockUserAchievements.get(userId) || [];
      
      // Check if already unlocked
      const existingAchievement = userAchievements.find(ua => ua.achievementId === achievementId);
      if (existingAchievement) {
        return NextResponse.json(
          { success: false, error: 'Achievement already unlocked' },
          { status: 400 }
        );
      }
      
      // Unlock achievement
      const newUserAchievement: UserAchievement = {
        achievementId,
        userId,
        unlockedAt: new Date().toISOString(),
        progress: 1,
        maxProgress: 1,
        isNew: true
      };
      
      userAchievements.push(newUserAchievement);
      mockUserAchievements.set(userId, userAchievements);
      
      return NextResponse.json({
        success: true,
        data: {
          achievement: {
            ...achievement,
            unlockedAt: newUserAchievement.unlockedAt,
            isUnlocked: true
          },
          message: `Congratulations! You've unlocked: ${achievement.title}`
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Achievement action error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate achievement progress
function calculateAchievementProgress(achievement: Achievement, userProgress: any): { current: number; max: number } {
  const { type, value, threshold, module } = achievement.requirements;
  
  switch (type) {
    case 'lesson_completion':
      return {
        current: userProgress.lessonsCompleted,
        max: threshold || value
      };
    case 'assessment_score':
      if (threshold) {
        // Count assessments with score >= threshold
        const qualifyingAssessments = Math.floor(userProgress.averageScore / 10); // Mock calculation
        return {
          current: qualifyingAssessments,
          max: value
        };
      }
      return {
        current: userProgress.assessmentsCompleted,
        max: value
      };
    case 'streak_days':
      return {
        current: userProgress.currentStreak,
        max: value
      };
    case 'xp_earned':
      return {
        current: userProgress.totalXp,
        max: value
      };
    case 'modules_completed':
      const moduleCompleted = module ? userProgress.modulesCompleted.includes(module) : false;
      return {
        current: moduleCompleted ? 1 : 0,
        max: value
      };
    default:
      return { current: 0, max: 1 };
  }
}

// Helper function to generate next milestones
function generateNextMilestones(userProgress: any, achievements: any[]): string[] {
  const milestones = [];
  
  if (userProgress.totalXp < 1000) {
    milestones.push(`${1000 - userProgress.totalXp} XP to XP Collector I`);
  }
  if (userProgress.lessonsCompleted < 50) {
    milestones.push(`${50 - userProgress.lessonsCompleted} lessons to Knowledge Seeker`);
  }
  if (userProgress.currentStreak < 30) {
    milestones.push(`${30 - userProgress.currentStreak} days to Month Master`);
  }
  if (!userProgress.modulesCompleted.includes(18)) {
    milestones.push('Complete Module 18 for Tax Planning Pro badge');
  }
  
  return milestones;
}