import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock realtime market data
    const realtimeData = {
      indices: {
        NIFTY: {
          value: 21500.75,
          change: 125.30,
          changePercent: 0.58
        },
        SENSEX: {
          value: 71200.45,
          change: 245.80,
          changePercent: 0.35
        }
      },
      topGainers: [
        {
          symbol: 'RELIANCE',
          price: 2450.75,
          change: 45.30,
          changePercent: 1.88
        },
        {
          symbol: 'TCS',
          price: 3650.50,
          change: 32.10,
          changePercent: 0.89
        }
      ],
      topLosers: [
        {
          symbol: 'HDFCBANK',
          price: 1580.25,
          change: -28.45,
          changePercent: -1.77
        },
        {
          symbol: 'INFY',
          price: 1456.90,
          change: -22.30,
          changePercent: -1.51
        }
      ],
      mostActive: [
        {
          symbol: 'RELIANCE',
          volume: 12500000,
          turnover: 3062500000
        },
        {
          symbol: 'TCS',
          volume: 8900000,
          turnover: 3254500000
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: realtimeData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Realtime market data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}