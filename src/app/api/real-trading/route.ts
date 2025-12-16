import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import RealMarketDataService from '@/lib/marketDataService';

// Dynamic Real Trading API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Get user's broker connection
    const brokerConnection = await db.brokerConnection.findFirst({
      where: { userId },
      include: {
        broker: true
      }
    });

    // Get user's trading account info
    const tradingAccount = await db.tradingAccount.findFirst({
      where: { userId },
      include: {
        broker: true
      }
    });

    // Get current portfolio holdings for trading
    const holdings = await db.holding.findMany({
      where: { userId },
      include: {
        asset: true
      }
    });

    // Get real-time market data for holdings
    const marketDataService = RealMarketDataService.getInstance();
    const stockSymbols = holdings.filter(h => h.asset.type === 'STOCK').map(h => h.asset.symbol);
    
    let marketData = [];
    if (stockSymbols.length > 0) {
      try {
        marketData = await marketDataService.getStockData(stockSymbols);
      } catch (error) {
        console.error('Error fetching market data for trading:', error);
      }
    }

    // Get recent orders
    const recentOrders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        asset: true
      }
    });

    // Get account balance
    const wallet = await db.wallet.findUnique({
      where: { userId }
    });

    // Calculate trading metrics
    const availableCash = wallet?.balance || 0;
    const totalHoldingsValue = holdings.reduce((sum, h) => {
      const marketInfo = marketData.find(m => m.symbol === h.asset.symbol);
      const currentPrice = marketInfo?.price || h.avgBuyPrice;
      return sum + (currentPrice * h.quantity);
    }, 0);
    const totalBalance = availableCash + totalHoldingsValue;

    const tradingData = {
      accountInfo: tradingAccount ? {
        brokerName: tradingAccount.broker.name,
        accountNumber: tradingAccount.accountNumber,
        tradingAccess: tradingAccount.isActive,
        marginAvailable: tradingAccount.marginAvailable || 0,
        lastUpdated: tradingAccount.updatedAt
      } : null,
      
      balance: {
        availableCash,
        totalBalance,
        marginUsed: 0, // Would get from broker API
        unrealizedPnL: totalHoldingsValue - holdings.reduce((sum, h) => sum + h.totalInvested, 0)
      },

      holdings: holdings.map(holding => {
        const marketInfo = marketData.find(m => m.symbol === holding.asset.symbol);
        const currentPrice = marketInfo?.price || holding.avgBuyPrice;
        const ltp = currentPrice;
        const currentValue = currentPrice * holding.quantity;
        const totalReturn = currentValue - holding.totalInvested;
        const returnPercent = holding.totalInvested > 0 ? (totalReturn / holding.totalInvested) * 100 : 0;

        return {
          symbol: holding.asset.symbol,
          companyName: holding.asset.name,
          quantity: holding.quantity,
          avgPrice: holding.avgBuyPrice,
          currentPrice,
          ltp,
          currentValue,
          totalReturn,
          returnPercent,
          dayChange: marketInfo?.change || 0,
          dayChangePercent: marketInfo?.changePercent || 0,
          volume: marketInfo?.volume || 0,
          dayHigh: marketInfo?.dayHigh || 0,
          dayLow: marketInfo?.dayLow || 0
        };
      }),

      recentOrders: recentOrders.map(order => ({
        id: order.id,
        symbol: order.asset.symbol,
        type: order.type.toLowerCase(),
        quantity: order.quantity,
        price: order.price,
        status: order.status.toLowerCase(),
        date: order.createdAt,
        filledQuantity: order.filledQuantity || 0,
        averagePrice: order.averagePrice || order.price
      })),

      watchlist: await getUserWatchlist(userId),
      
      marketOverview: await getMarketOverview(),
      
      tradingSettings: {
        defaultOrderType: 'MARKET',
        defaultValidity: 'DAY',
        squareOffTime: '15:30',
        autoSquareOff: true,
        marginRequired: 20 // 20% margin requirement
      },

      brokerConnection: brokerConnection ? {
        isConnected: true,
        brokerName: brokerConnection.broker.name,
        lastSync: brokerConnection.lastSync,
        connectionStatus: brokerConnection.status
      } : {
        isConnected: false,
        brokerName: null,
        lastSync: null,
        connectionStatus: 'NOT_CONNECTED'
      }
    };

    return NextResponse.json({
      success: true,
      data: tradingData
    });

  } catch (error) {
    console.error('Real Trading API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'place_order':
        // Place a new trading order
        const { symbol, type, quantity, price, orderType, validity } = data;
        
        // Get asset
        const asset = await db.asset.findFirst({
          where: { symbol }
        });

        if (!asset) {
          return NextResponse.json(
            { error: 'Asset not found' },
            { status: 404 }
          );
        }

        // Create order
        const order = await db.order.create({
          data: {
            userId,
            assetId: asset.id,
            type: type.toUpperCase(),
            quantity,
            price,
            orderType: orderType || 'MARKET',
            status: 'PENDING',
            validity: validity || 'DAY'
          },
          include: {
            asset: true
          }
        });

        return NextResponse.json({
          success: true,
          data: order,
          message: 'Order placed successfully!'
        });

      case 'cancel_order':
        // Cancel an existing order
        const { orderId } = data;
        
        const updatedOrder = await db.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
          include: {
            asset: true
          }
        });

        return NextResponse.json({
          success: true,
          data: updatedOrder,
          message: 'Order cancelled successfully!'
        });

      case 'modify_order':
        // Modify an existing order
        const { orderId: modifyOrderId, newQuantity, newPrice } = data;
        
        const modifiedOrder = await db.order.update({
          where: { id: modifyOrderId },
          data: {
            quantity: newQuantity,
            price: newPrice
          },
          include: {
            asset: true
          }
        });

        return NextResponse.json({
          success: true,
          data: modifiedOrder,
          message: 'Order modified successfully!'
        });

      case 'square_off_position':
        // Square off a position
        const { symbol: squareSymbol, quantity: squareQuantity } = data;
        
        // Get current market price
        const marketDataService = RealMarketDataService.getInstance();
        const marketData = await marketDataService.getStockData([squareSymbol]);
        const currentPrice = marketData[0]?.price || 0;

        // Create sell order
        const assetData = await db.asset.findFirst({
          where: { symbol: squareSymbol }
        });

        if (assetData) {
          const squareOffOrder = await db.order.create({
            data: {
              userId,
              assetId: assetData.id,
              type: 'SELL',
              quantity: squareQuantity,
              price: currentPrice,
              orderType: 'MARKET',
              status: 'PENDING'
            }
          });

          return NextResponse.json({
            success: true,
            data: squareOffOrder,
            message: 'Position squared off successfully!'
          });
        }

        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        );

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Real Trading POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform trading action' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserWatchlist(userId: string) {
  const watchlist = await db.userWatchlist.findMany({
    where: { userId },
    include: {
      asset: true
    }
  });

  const marketDataService = RealMarketDataService.getInstance();
  const symbols = watchlist.map(w => w.asset.symbol);
  
  let marketData = [];
  if (symbols.length > 0) {
    try {
      marketData = await marketDataService.getStockData(symbols);
    } catch (error) {
      console.error('Error fetching watchlist market data:', error);
    }
  }

  return watchlist.map(item => {
    const marketInfo = marketData.find(m => m.symbol === item.asset.symbol);
    return {
      symbol: item.asset.symbol,
      name: item.asset.name,
      price: marketInfo?.price || item.asset.currentPrice || 0,
      change: marketInfo?.change || 0,
      changePercent: marketInfo?.changePercent || 0,
      volume: marketInfo?.volume || 0
    };
  });
}

async function getMarketOverview() {
  const marketDataService = RealMarketDataService.getInstance();
  
  try {
    const [indices, gainers, losers] = await Promise.all([
      marketDataService.getIndices(),
      marketDataService.getTopGainers(),
      marketDataService.getTopLosers()
    ]);

    return {
      indices,
      topGainers: gainers.slice(0, 5),
      topLosers: losers.slice(0, 5),
      marketStatus: 'OPEN', // Would get from real market status API
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching market overview:', error);
    return {
      indices: [],
      topGainers: [],
      topLosers: [],
      marketStatus: 'UNKNOWN',
      lastUpdated: new Date().toISOString()
    };
  }
}