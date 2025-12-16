import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import RealMarketDataService from '@/lib/marketDataService';

// Dynamic Invest API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const category = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'popular';

    // Get assets from database
    let assetsQuery = db.asset.findMany({
      include: {
        category: true
      }
    });

    // Apply category filter
    if (category !== 'all') {
      assetsQuery = assetsQuery.where({
        category: {
          name: category
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      assetsQuery = assetsQuery.where({
        OR: [
          { symbol: { contains: searchQuery, mode: 'insensitive' } },
          { name: { contains: searchQuery, mode: 'insensitive' } }
        ]
      });
    }

    const assets = await assetsQuery;

    // Get real market data for these assets
    const marketDataService = RealMarketDataService.getInstance();
    const stockSymbols = assets.filter(a => a.type === 'STOCK').map(a => a.symbol);
    
    let marketData = [];
    if (stockSymbols.length > 0) {
      try {
        marketData = await marketDataService.getStockData(stockSymbols);
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Continue with database data if market data fails
      }
    }

    // Combine database assets with market data
    const enrichedAssets = assets.map(asset => {
      const marketInfo = marketData.find(m => m.symbol === asset.symbol);
      
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        price: marketInfo?.price || asset.currentPrice || 0,
        change: marketInfo?.change || 0,
        changePercent: marketInfo?.changePercent || 0,
        category: asset.category?.name || 'Other',
        minInvestment: asset.minInvestment || 100,
        isPopular: asset.isPopular || false,
        description: asset.description || `${asset.name} investment opportunity`,
        volume: marketInfo?.volume || 0,
        marketCap: marketInfo?.marketCap || 0,
        pe: marketInfo?.pe || 0,
        dayHigh: marketInfo?.dayHigh || 0,
        dayLow: marketInfo?.dayLow || 0,
        updatedAt: marketInfo?.updatedAt || asset.updatedAt
      };
    });

    // Sort assets
    let sortedAssets = enrichedAssets;
    switch (sortBy) {
      case 'price_asc':
        sortedAssets = enrichedAssets.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedAssets = enrichedAssets.sort((a, b) => b.price - a.price);
        break;
      case 'change_desc':
        sortedAssets = enrichedAssets.sort((a, b) => b.changePercent - a.changePercent);
        break;
      case 'market_cap':
        sortedAssets = enrichedAssets.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        break;
      default: // popular
        sortedAssets = enrichedAssets.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return 0;
        });
    }

    // Get investment categories
    const categories = await db.assetCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });

    // Get user's watchlist (if exists)
    const watchlist = await db.userWatchlist.findMany({
      where: { userId },
      include: {
        asset: {
          include: {
            category: true
          }
        }
      }
    });

    // Get user's investment preferences
    const userPreferences = await db.userPreference.findUnique({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      data: {
        assets: sortedAssets,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          count: assets.filter(a => a.category?.name === cat.name).length
        })),
        watchlist: watchlist.map(item => ({
          id: item.id,
          assetId: item.assetId,
          symbol: item.asset.symbol,
          name: item.asset.name,
          addedAt: item.createdAt
        })),
        userPreferences: userPreferences || {
          riskProfile: 'MODERATE',
          investmentGoals: [],
          preferredCategories: []
        },
        filters: {
          category,
          searchQuery,
          sortBy
        },
        totalAssets: sortedAssets.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Invest API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, assetId } = body;

    switch (action) {
      case 'add_to_watchlist':
        // Add asset to user's watchlist
        const watchlistItem = await db.userWatchlist.create({
          data: {
            userId,
            assetId
          }
        });
        
        return NextResponse.json({
          success: true,
          data: watchlistItem,
          message: 'Added to watchlist!'
        });

      case 'remove_from_watchlist':
        // Remove asset from user's watchlist
        await db.userWatchlist.deleteMany({
          where: {
            userId,
            assetId
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Removed from watchlist!'
        });

      case 'get_recommendations':
        // Get personalized investment recommendations
        const userPreferences = await db.userPreference.findUnique({
          where: { userId }
        });

        let recommendationQuery = db.asset.findMany({
          include: {
            category: true
          },
          take: 10
        });

        // Filter based on user preferences if available
        if (userPreferences?.riskProfile) {
          // Add risk-based filtering logic here
        }

        const recommendations = await recommendationQuery;

        return NextResponse.json({
          success: true,
          data: recommendations,
          message: 'Investment recommendations retrieved!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Invest POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}