import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dynamic Dashboard API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Get user's portfolio data
    const portfolio = await db.portfolio.findFirst({
      where: { userId },
      include: {
        holdings: {
          include: {
            asset: true
          }
        }
      }
    });

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        asset: {
          select: { symbol: true, name: true }
        }
      }
    });

    // Get user achievements and badges
    const userBadges = await db.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: { earnedAt: 'desc' },
      take: 5
    });

    // Calculate portfolio metrics
    let totalValue = 0;
    let totalInvested = 0;
    let assetAllocation = [];
    
    if (portfolio) {
      totalValue = portfolio.holdings.reduce((sum, holding) => {
        return sum + (holding.currentValue || 0);
      }, 0);
      
      totalInvested = portfolio.totalInvested;
      
      // Calculate asset allocation
      const allocationMap = new Map();
      portfolio.holdings.forEach(holding => {
        const category = holding.asset.category || 'Other';
        const value = holding.currentValue || 0;
        allocationMap.set(category, (allocationMap.get(category) || 0) + value);
      });
      
      assetAllocation = Array.from(allocationMap.entries()).map(([name, value], index) => ({
        name,
        value,
        percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
        color: getColorForIndex(index)
      }));
    }

    // Get AI insights (mock for now, can be enhanced with real AI)
    const aiInsights = [
      {
        type: 'opportunity',
        title: 'Market Dip Alert',
        description: 'Quality stocks are trading at attractive valuations. Consider dollar-cost averaging.',
        confidence: 85,
        priority: 'high'
      },
      {
        type: 'risk',
        title: 'Portfolio Diversification',
        description: 'Your portfolio could benefit from additional diversification across sectors.',
        confidence: 78,
        priority: 'medium'
      }
    ];

    // Get user stats
    const userStats = await db.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        wallet: {
          select: { balance: true }
        }
      }
    });

    const dashboardData = {
      portfolio: {
        totalValue,
        totalInvested,
        totalReturns: totalValue - totalInvested,
        returnsPercentage: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
        dailyChange: 0, // Would need real-time price data
        dailyChangePercentage: 0,
        assetAllocation,
        topPerformers: portfolio?.holdings.slice(0, 3).map(holding => ({
          name: holding.asset.name,
          symbol: holding.asset.symbol,
          value: holding.currentValue || 0,
          returns: holding.currentValue && holding.totalInvested ? 
            ((holding.currentValue - holding.totalInvested) / holding.totalInvested) * 100 : 0
        })) || []
      },
      recentActivity: recentTransactions.map(tx => ({
        type: tx.type.toLowerCase(),
        asset: tx.asset?.symbol || 'N/A',
        amount: tx.amount,
        time: formatRelativeTime(tx.createdAt),
        status: tx.status.toLowerCase()
      })),
      aiInsights,
      user: {
        name: 'User', // Would get from auth
        level: userStats?.level || 1,
        xp: userStats?.xp || 0,
        nextLevelXp: (userStats?.level || 1) * 1000,
        walletBalance: userStats?.wallet?.balance || 0,
        notifications: 0 // Would get from notifications table
      },
      quickActions: [
        { title: 'Add Money', icon: 'Plus', description: 'Load your wallet', color: 'bg-green-100 text-green-600' },
        { title: 'Invest', icon: 'TrendingUp', description: 'Start investing', color: 'bg-blue-100 text-blue-600' },
        { title: 'Withdraw', icon: 'ArrowDownRight', description: 'Get your money', color: 'bg-red-100 text-red-600' },
        { title: 'SIP', icon: 'Clock', description: 'Set up SIP', color: 'bg-purple-100 text-purple-600' }
      ],
      achievements: userBadges.map(ub => ({
        name: ub.badge.name,
        description: ub.badge.description,
        earnedAt: ub.earnedAt
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function getColorForIndex(index: number): string {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
  return colors[index % colors.length];
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
}