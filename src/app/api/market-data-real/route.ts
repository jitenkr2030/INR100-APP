import { NextRequest, NextResponse } from "next/server";
import RealMarketDataService from "@/lib/marketDataService";

// Real Market Data API Route
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const symbols = searchParams.get("symbols")?.split(",") || [];

    const marketData = RealMarketDataService.getInstance();

    switch (type) {
      case "stocks":
        if (symbols.length === 0) {
          return NextResponse.json(
            { error: "Stock symbols are required" },
            { status: 400 }
          );
        }
        const stocksData = await marketData.getStockData(symbols);
        return NextResponse.json({ success: true, data: stocksData });

      case "indices":
        const indexData = await marketData.getIndices();
        return NextResponse.json({ success: true, data: indexData });

      case "gainers":
        const gainersData = await marketData.getTopGainers();
        return NextResponse.json({ success: true, data: gainersData });

      case "losers":
        const losersData = await marketData.getTopLosers();
        return NextResponse.json({ success: true, data: losersData });

      default:
        // Return all market data
        const [allStocksData, allIndicesData, allGainersData] = await Promise.all([
          marketData.getStockData(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC']),
          marketData.getIndices(),
          marketData.getTopGainers()
        ]);

        return NextResponse.json({
          success: true,
          data: {
            stocks: allStocksData,
            indices: allIndicesData,
            gainers: allGainersData,
            updatedAt: new Date().toISOString()
          }
        });
    }

  } catch (error) {
    console.error("Real market data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch real market data" },
      { status: 500 }
    );
  }
}