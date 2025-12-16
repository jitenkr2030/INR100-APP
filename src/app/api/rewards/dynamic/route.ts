import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dynamic Rewards API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        return await getRewardsOverview(userId);
      
      case 'badges':
        return await getUserBadges(userId);
      
      case 'missions':
        return await getUserMissions(userId);
      
      case 'leaderboard':
        return await getLeaderboard(userId);
      
      case 'achievements':
        return await getAchievements(userId);
      
      default:
        return await getRewardsOverview(userId);
    }

  } catch (error) {
    console.error('Dynamic Rewards API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'claim_mission':
        // Claim mission rewards
        const { missionId } = data;
        
        const mission = await db.userMission.findFirst({
          where: {
            userId,
            missionId,
            status: 'COMPLETED',
            claimedAt: null
          },
          include: {
            mission: true
          }
        });

        if (!mission) {
          return NextResponse.json(
            { error: 'Mission not found or already claimed' },
            { status: 404 }
          );
        }

        // Update mission as claimed
        await db.userMission.update({
          where: { id: mission.id },
          data: {
            claimedAt: new Date()
          }
        });

        // Add XP reward
        await db.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: mission.mission.xpReward || 0
            }
          }
        });

        // Add points if applicable
        if (mission.mission.pointsReward) {
          await db.user.update({
            where: { id: userId },
            data: {
              points: {
                increment: mission.mission.pointsReward
              }
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Mission reward claimed successfully!'
        });

      case 'share_achievement':
        // Share achievement on social media
        const { badgeId } = data;
        
        const userBadge = await db.userBadge.findFirst({
          where: {
            userId,
            badgeId
          },
          include: {
            badge: true
          }
        });

        if (userBadge) {
          // Create social media post
          await db.socialPost.create({
            data: {
              userId,
              content: `Just earned the ${userBadge.badge.name} badge! ${userBadge.badge.description}`,
              category: 'achievement_share',
              metadata: {
                badgeId,
                badgeName: userBadge.badge.name,
                earnedAt: userBadge.earnedAt
              }
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Achievement shared successfully!'
          });
        }

        return NextResponse.json(
          { error: 'Achievement not found' },
          { status: 404 }
        );

      case 'refer_friend':
        // Process friend referral
        const { friendEmail } = data;
        
        // Create referral record
        const referral = await db.referral.create({
          data: {
            referrerId: userId,
            referredEmail: friendEmail,
            status: 'PENDING'
          }
        });

        // Award referral bonus XP
        await db.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: 100 // Referral bonus
            }
          }
        });

        return NextResponse.json({
          success: true,
          data: referral,
          message: 'Referral sent successfully!'
        });

      case 'complete_daily_challenge':
        // Complete daily challenge
        const today = new Date().toISOString().split('T')[0];
        
        const dailyChallenge = await db.userChallenge.upsert({
          where: {
            userId_date: {
              userId,
              date: today
            }
          },
          update: {
            completed: true,
            completedAt: new Date()
          },
          create: {
            userId,
            date: today,
            challengeType: 'DAILY_LOGIN',
            completed: true,
            completedAt: new Date()
          }
        });

        // Award daily login XP
        await db.user.update({
          where: { id: userId },
          data: {
            xp: {
              increment: 50 // Daily login bonus
            }
          }
        });

        return NextResponse.json({
          success: true,
          data: dailyChallenge,
          message: 'Daily challenge completed!'
        });

      case 'join_challenge':
        // Join a challenge
        const { challengeId } = data;
        
        const challenge = await db.challenge.findUnique({
          where: { id: challengeId }
        });

        if (!challenge) {
          return NextResponse.json(
            { error: 'Challenge not found' },
            { status: 404 }
          );
        }

        // Check if already joined
        const existingParticipation = await db.challengeParticipation.findFirst({
          where: {
            userId,
            challengeId
          }
        });

        if (existingParticipation) {
          return NextResponse.json(
            { error: 'Already joined this challenge' },
            { status: 400 }
          );
        }

        // Join challenge
        await db.challengeParticipation.create({
          data: {
            userId,
            challengeId,
            joinedAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Joined challenge successfully!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Dynamic Rewards POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform rewards action' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getRewardsOverview(userId: string) {
  // Get user stats
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      xp: true,
      points: true,
      streak: true
    }
  });

  // Get user badges
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  });

  // Get user missions
  const userMissions = await db.userMission.findMany({
    where: { userId },
    include: {
      mission: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate stats
  const totalBadges = userBadges.length;
  const completedMissions = userMissions.filter(m => m.status === 'COMPLETED').length;
  const nextLevelXp = (user?.level || 1) * 1000;
  const currentLevelXp = ((user?.level || 1) - 1) * 1000;
  const xpToNextLevel = nextLevelXp - (user?.xp || 0);

  // Get recent achievements
  const recentAchievements = userBadges.slice(0, 5).map(ub => ({
    id: ub.id,
    badgeId: ub.badgeId,
    name: ub.badge.name,
    description: ub.badge.description,
    icon: ub.badge.icon,
    rarity: ub.badge.rarity,
    earnedAt: ub.earnedAt
  }));

  // Get active missions
  const activeMissions = userMissions.filter(m => m.status === 'ACTIVE');

  // Get streak data
  const streakData = await getStreakData(userId);

  // Get available challenges
  const availableChallenges = await db.challenge.findMany({
    where: {
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    },
    include: {
      participation: {
        where: { userId }
      }
    },
    take: 5
  });

  const rewardsOverview = {
    userStats: {
      level: user?.level || 1,
      xp: user?.xp || 0,
      nextLevelXp,
      xpProgress: user?.xp && nextLevelXp > currentLevelXp 
        ? Math.round(((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
        : 0,
      points: user?.points || 0,
      currentStreak: user?.streak || 0,
      rank: await calculateUserRank(userId),
      totalBadges,
      completedMissions,
      referrals: await getReferralCount(userId)
    },

    recentAchievements,
    activeMissions: activeMissions.map(um => ({
      id: um.id,
      missionId: um.missionId,
      title: um.mission.title,
      description: um.mission.description,
      progress: um.progress,
      target: um.mission.target,
      status: um.status,
      xpReward: um.mission.xpReward,
      pointsReward: um.mission.pointsReward,
      deadline: um.mission.deadline,
      isCompleted: um.status === 'COMPLETED',
      isClaimed: !!um.claimedAt
    })),

    availableChallenges: availableChallenges.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      challengeType: challenge.type,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      participants: challenge.participation.length,
      isJoined: challenge.participation.length > 0,
      reward: challenge.reward
    })),

    streakData,
    
    leaderboard: await getTopUsers(10),

    nextMilestones: [
      {
        type: 'level',
        target: (user?.level || 1) + 1,
        current: user?.xp || 0,
        required: nextLevelXp,
        progress: xpToNextLevel,
        reward: 'Special Badge + 500 XP'
      },
      {
        type: 'badges',
        target: totalBadges + 5,
        current: totalBadges,
        required: 5,
        progress: 0,
        reward: 'Master Collector Badge'
      },
      {
        type: 'streak',
        target: (user?.streak || 0) + 30,
        current: user?.streak || 0,
        required: 30,
        progress: 0,
        reward: 'Consistency Champion Badge'
      }
    ],

    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    data: rewardsOverview
  });
}

async function getUserBadges(userId: string) {
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  });

  // Get all available badges
  const allBadges = await db.badge.findMany();

  // Mark badges as unlocked/locked
  const unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
  const badges = allBadges.map(badge => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
    rarity: badge.rarity,
    xpReward: badge.xpReward,
    isUnlocked: unlockedBadgeIds.includes(badge.id),
    unlockedAt: userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt
  }));

  // Group by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = badge.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    data: {
      badges,
      badgesByCategory,
      categories: Object.keys(badgesByCategory),
      unlockedCount: badges.filter(b => b.isUnlocked).length,
      totalCount: badges.length
    }
  });
}

async function getUserMissions(userId: string) {
  const userMissions = await db.userMission.findMany({
    where: { userId },
    include: {
      mission: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const missions = userMissions.map(um => ({
    id: um.id,
    missionId: um.missionId,
    title: um.mission.title,
    description: um.mission.description,
    category: um.mission.category,
    difficulty: um.mission.difficulty,
    progress: um.progress,
    target: um.mission.target,
    status: um.status,
    xpReward: um.mission.xpReward,
    pointsReward: um.mission.pointsReward,
    deadline: um.mission.deadline,
    createdAt: um.createdAt,
    isCompleted: um.status === 'COMPLETED',
    isClaimed: !!um.claimedAt,
    completionRate: um.mission.target > 0 ? Math.round((um.progress / um.mission.target) * 100) : 0
  }));

  // Group by status
  const missionsByStatus = missions.reduce((acc, mission) => {
    const status = mission.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(mission);
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    data: {
      missions,
      missionsByStatus,
      stats: {
        total: missions.length,
        active: missionsByStatus.ACTIVE?.length || 0,
        completed: missionsByStatus.COMPLETED?.length || 0,
        claimed: missions.filter(m => m.isClaimed).length
      }
    }
  });
}

async function getLeaderboard(userId: string) {
  const topUsers = await db.user.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      level: true,
      xp: true,
      points: true,
      streak: true
    },
    orderBy: [
      { xp: 'desc' },
      { level: 'desc' }
    ],
    take: 100
  });

  // Add rank to each user
  const leaderboard = topUsers.map((user, index) => ({
    rank: index + 1,
    ...user,
    isCurrentUser: user.id === userId
  }));

  // Find current user position
  const currentUserPosition = leaderboard.findIndex(u => u.isCurrentUser) + 1;

  return NextResponse.json({
    success: true,
    data: {
      leaderboard,
      currentUserPosition,
      totalUsers: topUsers.length,
      categories: [
        { name: 'Overall XP', key: 'xp' },
        { name: 'Level', key: 'level' },
        { name: 'Points', key: 'points' },
        { name: 'Streak', key: 'streak' }
      ]
    }
  });
}

async function getAchievements(userId: string) {
  // Get recent achievements
  const recentAchievements = await db.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' },
    take: 10
  });

  // Get achievement statistics
  const totalBadges = await db.userBadge.count({
    where: { userId }
  });

  const badgesByRarity = await db.userBadge.groupBy({
    by: ['badgeId'],
    where: { userId },
    _count: true,
    include: {
      badge: {
        select: { rarity: true }
      }
    }
  });

  const rarityStats = badgesByRarity.reduce((acc, item) => {
    const rarity = item.badge.rarity || 'Common';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    success: true,
    data: {
      recentAchievements: recentAchievements.map(ua => ({
        id: ua.id,
        badgeId: ua.badgeId,
        name: ua.badge.name,
        description: ua.badge.description,
        icon: ua.badge.icon,
        category: ua.badge.category,
        rarity: ua.badge.rarity,
        earnedAt: ua.earnedAt
      })),
      statistics: {
        totalBadges,
        rarityBreakdown: rarityStats,
        categories: await getBadgeCategories(userId)
      }
    }
  });
}

// Additional helper functions
async function getStreakData(userId: string) {
  const recentActivity = await db.learnProgress.findMany({
    where: {
      userId,
      isCompleted: true,
      completedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: { completedAt: 'asc' }
  });

  // Calculate daily activity
  const dailyActivity = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dayActivity = recentActivity.filter(activity => {
      const activityDate = new Date(activity.completedAt!);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === date.getTime();
    });

    dailyActivity.push({
      date: date.toISOString().split('T')[0],
      active: dayActivity.length > 0,
      activities: dayActivity.length
    });
  }

  return dailyActivity;
}

async function calculateUserRank(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { xp: true }
  });

  if (!user) return 0;

  const higherRankedUsers = await db.user.count({
    where: {
      xp: { gt: user.xp }
    }
  });

  return higherRankedUsers + 1;
}

async function getReferralCount(userId: string): Promise<number> {
  return await db.referral.count({
    where: {
      referrerId: userId,
      status: 'COMPLETED'
    }
  });
}

async function getTopUsers(limit: number) {
  const topUsers = await db.user.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
      level: true,
      xp: true
    },
    orderBy: [
      { xp: 'desc' },
      { level: 'desc' }
    ],
    take: limit
  });

  return topUsers.map((user, index) => ({
    rank: index + 1,
    ...user
  }));
}

async function getBadgeCategories(userId: string): Promise<string[]> {
  const categories = await db.userBadge.findMany({
    where: { userId },
    include: {
      badge: {
        select: { category: true }
      }
    },
    distinct: ['badge.category']
  });

  return categories
    .map(ub => ub.badge.category)
    .filter(Boolean) as string[];
}