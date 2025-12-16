import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import RealMarketDataService from '@/lib/marketDataService';

// Dynamic Portfolio API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    // Get user's portfolio with holdings
    const portfolio = await db.portfolio.findFirst({
      where: { userId },
      include: {
        holdings: {
          include: {
            asset: {
              include: {
                category: true
              }
            }
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!portfolio) {
      // Create a default portfolio if none exists
      const newPortfolio = await db.portfolio.create({
        data: {
          userId,
          name: 'My Investment Portfolio',
          totalInvested: 0,
          totalValue: 0
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          portfolio: {
            ...newPortfolio,
            holdings: [],
            transactions: []
          }
        }
      });
    }

    // Get real-time market data for all holdings
    const marketDataService = RealMarketDataService.getInstance();
    const stockSymbols = portfolio.holdings
      .filter(h => h.asset.type === 'STOCK')
      .map(h => h.asset.symbol);
    
    let marketData = [];
    if (stockSymbols.length > 0) {
      try {
        marketData = await marketDataService.getStockData(stockSymbols);
      } catch (error) {
        console.error('Error fetching market data for portfolio:', error);
      }
    }

    // Update holdings with current market data
    const updatedHoldings = portfolio.holdings.map(holding => {
      const marketInfo = marketData.find(m => m.symbol === holding.asset.symbol);
      const currentPrice = marketInfo?.price || holding.asset.currentPrice || holding.avgBuyPrice;
      const currentValue = currentPrice * holding.quantity;
      const totalReturn = currentValue - holding.totalInvested;
      const returnPercent = holding.totalInvested > 0 ? (totalReturn / holding.totalInvested) * 100 : 0;
      const dayChange = marketInfo?.change || 0;
      const dayChangePercent = marketInfo?.changePercent || 0;

      return {
        ...holding,
        currentPrice,
        totalValue: currentValue,
        totalReturn,
        returnPercent,
        dayChange,
        dayChangePercent,
        asset: {
          ...holding.asset,
          currentPrice,
          dayChange,
          dayChangePercent
        }
      };
    });

    // Calculate portfolio metrics
    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalReturns = totalValue - totalInvested;
    const returnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Calculate asset allocation
    const allocationMap = new Map();
    updatedHoldings.forEach(holding => {
      const category = holding.asset.category?.name || 'Other';
      const value = holding.totalValue;
      allocationMap.set(category, (allocationMap.get(category) || 0) + value);
    });

    const assetAllocation = Array.from(allocationMap.entries()).map(([name, value], index) => ({
      name,
      value,
      percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      color: getColorForIndex(index)
    }));

    // Calculate sector allocation if available
    const sectorMap = new Map();
    updatedHoldings.forEach(holding => {
      const sector = holding.asset.sector || 'Other';
      const value = holding.totalValue;
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
    });

    const sectorAllocation = Array.from(sectorMap.entries()).map(([name, value], index) => ({
      name,
      value,
      percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
      color: getColorForIndex(index)
    }));

    // Get portfolio performance data (mock for now, would need historical data)
    const performanceData = generatePerformanceData(totalValue, returnsPercent);

    const dynamicPortfolio = {
      id: portfolio.id,
      name: portfolio.name,
      totalValue,
      totalInvested,
      totalReturns,
      returnsPercent,
      dailyChange: 0, // Would need real-time calculation
      dailyChangePercentage: 0,
      assetAllocation,
      sectorAllocation,
      holdings: updatedHoldings,
      performance: performanceData,
      recentTransactions: portfolio.transactions.map(tx => ({
        id: tx.id,
        type: tx.type.toLowerCase(),
        asset: tx.assetId,
        amount: tx.amount,
        price: tx.price,
        quantity: tx.quantity,
        total: tx.amount,
        date: tx.createdAt,
        status: tx.status.toLowerCase()
      })),
      metrics: {
        diversificationScore: calculateDiversificationScore(updatedHoldings),
        riskScore: calculateRiskScore(updatedHoldings),
        sharpeRatio: calculateSharpeRatio(returnsPercent),
        maxDrawdown: 0, // Would need historical data
        beta: 0, // Would need historical data
        alpha: 0 // Would need historical data
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: dynamicPortfolio
    });

  } catch (error) {
    console.error('Dynamic Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, holdingId, data } = body;

    switch (action) {
      case 'update_holding':
        // Update holding in portfolio
        const updatedHolding = await db.holding.update({
          where: { id: holdingId },
          data: data,
          include: {
            asset: true
          }
        });
        
        return NextResponse.json({
          success: true,
          data: updatedHolding,
          message: 'Holding updated successfully!'
        });

      case 'add_transaction':
        // Add new transaction and update holding
        const { type, assetId, quantity, price } = data;
        const totalAmount = quantity * price;

        // Create transaction
        const transaction = await db.transaction.create({
          data: {
            userId,
            assetId,
            type: type.toUpperCase(),
            quantity,
            price,
            amount: totalAmount,
            status: 'COMPLETED'
          }
        });

        // Update or create holding
        let holding = await db.holding.findFirst({
          where: {
            userId,
            assetId
          }
        });

        if (holding) {
          // Update existing holding
          const newQuantity = type === 'BUY' 
            ? holding.quantity + quantity 
            : holding.quantity - quantity;
          
          const newTotalInvested = type === 'BUY'
            ? holding.totalInvested + totalAmount
            : holding.totalInvested - (price * quantity);

          const newAvgPrice = newQuantity > 0 ? newTotalInvested / newQuantity : 0;

          holding = await db.holding.update({
            where: { id: holding.id },
            data: {
              quantity: newQuantity,
              avgBuyPrice: newAvgPrice,
              totalInvested: newTotalInvested
            }
          });
        } else {
          // Create new holding
          holding = await db.holding.create({
            data: {
              userId,
              assetId,
              quantity,
              avgBuyPrice: price,
              totalInvested: totalAmount
            }
          });
        }

        // Update portfolio total
        await db.portfolio.update({
          where: { userId },
          data: {
            totalInvested: {
              increment: type === 'BUY' ? totalAmount : -totalAmount
            }
          }
        });

        return NextResponse.json({
          success: true,
          data: { transaction, holding },
          message: 'Transaction completed successfully!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Dynamic Portfolio POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

// Helper functions
function getColorForIndex(index: number): string {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
  return colors[index % colors.length];
}

function generatePerformanceData(totalValue: number, returnsPercent: number) {
  // Generate mock performance data - in production, this would come from historical data
  const days = 30;
  const data = [];
  let currentValue = totalValue / (1 + returnsPercent / 100); // Starting value

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate realistic price movements
    const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily movement
    currentValue *= (1 + dailyReturn);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue)
    });
  }

  return data;
}

function calculateDiversificationScore(holdings: any[]): number {
  if (holdings.length === 0) return 0;
  
  // Simple diversification score based on number of holdings and weight distribution
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const weights = holdings.map(h => h.totalValue / totalValue);
  const maxWeight = Math.max(...weights);
  
  // Lower max weight = higher diversification
  return Math.max(0, 100 - (maxWeight * 100));
}

function calculateRiskScore(holdings: any[]): number {
  if (holdings.length === 0) return 50;
  
  // Simple risk score based on holding concentration
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const weights = holdings.map(h => h.totalValue / totalValue);
  
  // Calculate Herfindahl index (concentration measure)
  const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);
  
  // Convert to risk score (0-100, where 100 is highest risk)
  return Math.min(100, herfindahl * 200);
}

function calculateSharpeRatio(returnsPercent: number): number {
  // Simplified Sharpe ratio calculation
  // In production, this would use actual risk-free rate and volatility
  const riskFreeRate = 6; // 6% risk-free rate
  const excessReturn = returnsPercent - riskFreeRate;
  const volatility = Math.abs(returnsPercent) * 0.15; // Simplified volatility
  
  return volatility > 0 ? excessReturn / volatility : 0;
}