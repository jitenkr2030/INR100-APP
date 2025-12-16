import { NextRequest, NextResponse } from 'next/server';
import ProgressService from '@/lib/progressService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const progressService = ProgressService.getInstance();
    const progressSummary = await progressService.getUserProgressSummary(userId);

    // Transform the achievements data for the frontend
    const achievements = progressSummary.achievements.map((achievement: any) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      progress: achievement.progress,
      earnedAt: achievement.earnedAt,
      icon: getAchievementIcon(achievement.name),
      category: getAchievementCategory(achievement.name),
      xpReward: getAchievementXPReward(achievement.name)
    }));

    // Add mock achievements for demonstration
    const allAchievements = [
      ...achievements,
      ...getMockAchievements()
    ];

    // Remove duplicates based on ID
    const uniqueAchievements = allAchievements.filter((achievement, index, self) => 
      index === self.findIndex(a => a.id === achievement.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        achievements: uniqueAchievements,
        summary: {
          total: uniqueAchievements.length,
          earned: uniqueAchievements.filter(a => a.progress >= 100).length,
          totalXP: uniqueAchievements
            .filter(a => a.progress >= 100)
            .reduce((sum, a) => sum + a.xpReward, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getAchievementIcon(name: string): string {
  const iconMap: Record<string, string> = {
    'First Steps': 'Star',
    'Safety First': 'Shield',
    'Week Warrior': 'Flame',
    'Knowledge Seeker': 'Brain',
    'Quiz Master': 'Target',
    'Course Champion': 'Crown'
  };
  return iconMap[name] || 'Trophy';
}

function getAchievementCategory(name: string): string {
  const categoryMap: Record<string, string> = {
    'First Steps': 'learning',
    'Safety First': 'course',
    'Week Warrior': 'streak',
    'Knowledge Seeker': 'learning',
    'Quiz Master': 'quiz',
    'Course Champion': 'course'
  };
  return categoryMap[name] || 'learning';
}

function getAchievementXPReward(name: string): number {
  const xpMap: Record<string, number> = {
    'First Steps': 25,
    'Safety First': 100,
    'Week Warrior': 150,
    'Knowledge Seeker': 200,
    'Quiz Master': 75,
    'Course Champion': 500
  };
  return xpMap[name] || 50;
}

function getMockAchievements() {
  return [
    {
      id: 'daily-learner',
      name: 'Daily Learner',
      description: 'Learn for 7 consecutive days',
      progress: 71, // 5/7 days
      icon: 'Calendar',
      category: 'streak',
      xpReward: 100
    },
    {
      id: 'speed-reader',
      name: 'Speed Reader',
      description: 'Complete 3 lessons in one day',
      progress: 33, // 1/3 days
      icon: 'Zap',
      category: 'learning',
      xpReward: 75
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Score 100% on your first quiz',
      progress: 0,
      icon: 'Target',
      category: 'quiz',
      xpReward: 50
    },
    {
      id: 'marathon-learner',
      name: 'Marathon Learner',
      description: 'Spend 10 hours learning',
      progress: 45, // 4.5/10 hours
      icon: 'TrendingUp',
      category: 'learning',
      xpReward: 300
    },
    {
      id: 'social-learner',
      name: 'Social Learner',
      description: 'Share your progress with friends',
      progress: 0,
      icon: 'Gift',
      category: 'learning',
      xpReward: 25
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Complete a lesson after 10 PM',
      progress: 0,
      icon: 'Flame',
      category: 'learning',
      xpReward: 30
    }
  ];
}