import { NextRequest, NextResponse } from 'next/server';
import ProgressService from '@/lib/progressService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // In a real app, this would fetch from database
    // For now, return mock streak data
    const streakData = getMockStreakData(userId);

    return NextResponse.json({
      success: true,
      data: streakData
    });
  } catch (error) {
    console.error('Get streak data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, lessonCompleted } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the streak in the database
    // For now, just return success with updated data
    const updatedStreak = await updateStreakData(userId, action, lessonCompleted);

    return NextResponse.json({
      success: true,
      data: updatedStreak,
      message: action === 'lesson_completed' 
        ? 'Streak updated! Great job keeping your learning habit!' 
        : 'Streak data updated'
    });
  } catch (error) {
    console.error('Update streak error:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}

function getMockStreakData(userId: string) {
  // Generate different streak data based on user ID for demo purposes
  const userHash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const baseStreak = Math.abs(userHash) % 30; // 0-29 days
  const longestStreak = baseStreak + Math.floor(Math.random() * 10);
  
  return {
    currentStreak: baseStreak,
    longestStreak: Math.max(longestStreak, baseStreak),
    lastActiveDate: getLastActiveDate(baseStreak),
    streakBrokenAt: baseStreak === 0 ? getLastActiveDate(1) : null,
    totalActiveDays: baseStreak * 2 + Math.floor(Math.random() * 20), // Total learning days
    thisWeekStreak: Math.min(baseStreak, 7), // This week's streak
    todayCompleted: baseStreak > 0 && Math.random() > 0.3, // 70% chance today is completed
    weeklyGoal: 5, // 5 days per week goal
    weeklyProgress: Math.min(baseStreak, 5),
    streakMultiplier: Math.min(1 + (baseStreak * 0.1), 2.0), // XP multiplier
    nextMilestone: getNextMilestone(baseStreak),
    daysUntilMilestone: getDaysUntilMilestone(baseStreak),
    streakRewards: {
      xpBonus: baseStreak * 2, // Bonus XP for maintaining streak
      badges: getStreakBadges(baseStreak),
      nextReward: getNextStreakReward(baseStreak)
    }
  };
}

function getLastActiveDate(streakDays: number): string {
  const date = new Date();
  if (streakDays > 0) {
    date.setDate(date.getDate() - 1); // Last active was yesterday
  } else {
    date.setDate(date.getDate() - 7); // Last active was a week ago
  }
  return date.toISOString().split('T')[0];
}

function getNextMilestone(currentStreak: number): number {
  const milestones = [3, 7, 14, 30, 60, 100];
  return milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
}

function getDaysUntilMilestone(currentStreak: number): number {
  const next = getNextMilestone(currentStreak);
  return next - currentStreak;
}

function getStreakBadges(streakDays: number): string[] {
  const badges = [];
  
  if (streakDays >= 3) badges.push('3-Day Warrior');
  if (streakDays >= 7) badges.push('Week Champion');
  if (streakDays >= 14) badges.push('Fortnight Master');
  if (streakDays >= 30) badges.push('Monthly Legend');
  if (streakDays >= 60) badges.push('Bimonthly Champion');
  if (streakDays >= 100) badges.push('Century Streak');
  
  return badges;
}

function getNextStreakReward(streakDays: number): { type: string; value: string } {
  const nextMilestone = getNextMilestone(streakDays);
  const daysToGo = getDaysUntilMilestone(streakDays);
  
  if (nextMilestone === 7) {
    return { type: 'badge', value: 'Week Champion Badge' };
  } else if (nextMilestone === 30) {
    return { type: 'badge', value: 'Monthly Legend Badge' };
  } else if (nextMilestone === 100) {
    return { type: 'certificate', value: 'Century Streak Certificate' };
  } else {
    return { type: 'xp', value: `${daysToGo * 10} Bonus XP` };
  }
}

async function updateStreakData(userId: string, action: string, lessonCompleted: boolean) {
  // In a real app, this would update the database
  // For now, simulate the update and return updated data
  
  if (action === 'lesson_completed' && lessonCompleted) {
    // Simulate streak increment
    const currentData = getMockStreakData(userId);
    return {
      ...currentData,
      currentStreak: currentData.currentStreak + 1,
      longestStreak: Math.max(currentData.longestStreak, currentData.currentStreak + 1),
      todayCompleted: true,
      weeklyProgress: Math.min(currentData.weeklyProgress + 1, currentData.weeklyGoal),
      streakRewards: {
        ...currentData.streakRewards,
        xpBonus: (currentData.currentStreak + 1) * 2
      }
    };
  }
  
  // Return current data if no valid action
  return getMockStreakData(userId);
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, streakData } = await request.json();

    if (!userId || !streakData) {
      return NextResponse.json(
        { error: 'User ID and streak data are required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the database with provided streak data
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Streak data updated successfully'
    });
  } catch (error) {
    console.error('Update streak data error:', error);
    return NextResponse.json(
      { error: 'Failed to update streak data' },
      { status: 500 }
    );
  }
}