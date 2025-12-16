import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Demo data for development
    const demoPortfolios = [
      {
        id: "demo-portfolio-1",
        name: "My Investment Portfolio",
        description: "Diversified portfolio across stocks, mutual funds, and gold",
        isPublic: false,
        totalValue: 25000,
        totalInvested: 22000,
        totalReturns: 3000,
        totalReturnsPercent: 13.64,
        riskLevel: 3,
        holdingsCount: 3,
        createdAt: new Date(),
        topHoldings: [
          {
            asset: {
              id: "1",
              symbol: "RELIANCE",
              name: "Reliance Industries Ltd.",
              type: "STOCK",
              currentPrice: 2500.50,
              logo: null
            },
            quantity: 5,
            totalValue: 12502.50,
            returns: 502.50,
            returnsPercent: 4.19
          },
          {
            asset: {
              id: "2",
              symbol: "AXISBLUECHIP",
              name: "Axis Bluechip Fund",
              type: "MUTUAL_FUND",
              currentPrice: 45.25,
              logo: null
            },
            quantity: 100,
            totalValue: 4525,
            returns: 275,
            returnsPercent: 6.47
          },
          {
            asset: {
              id: "3",
              symbol: "GOLD",
              name: "Digital Gold",
              type: "GOLD",
              currentPrice: 5250,
              logo: null
            },
            quantity: 2,
            totalValue: 10500,
            returns: 300,
            returnsPercent: 2.94
          }
        ]
      }
    ];

    // Calculate overall portfolio summary
    const totalValue = demoPortfolios.reduce((sum, p) => sum + p.totalValue, 0);
    const totalInvested = demoPortfolios.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalReturns = totalValue - totalInvested;
    const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const overallSummary = {
      totalValue,
      totalInvested,
      totalReturns,
      totalReturnsPercent,
      portfoliosCount: demoPortfolios.length,
      bestPerformingPortfolio: demoPortfolios.length > 0 
        ? demoPortfolios.reduce((best, current) => 
            current.totalReturnsPercent > best.totalReturnsPercent ? current : best
          )
        : null,
      worstPerformingPortfolio: demoPortfolios.length > 0 
        ? demoPortfolios.reduce((worst, current) => 
            current.totalReturnsPercent < worst.totalReturnsPercent ? current : worst
          )
        : null,
    };

    return NextResponse.json({
      portfolios: demoPortfolios,
      summary: overallSummary,
    });

  } catch (error) {
    console.error("Get portfolios error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, isPublic = false, riskLevel = 3 } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID and name are required" },
        { status: 400 }
      );
    }

    // Check if portfolio name already exists for this user
    const existingPortfolio = await db.portfolio.findFirst({
      where: {
        userId,
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingPortfolio) {
      return NextResponse.json(
        { error: "Portfolio with this name already exists" },
        { status: 400 }
      );
    }

    // Create new portfolio
    const portfolio = await db.portfolio.create({
      data: {
        userId,
        name,
        description: description || "",
        isPublic,
        riskLevel,
        totalValue: 0,
        totalInvested: 0,
        totalReturns: 0,
      },
    });

    return NextResponse.json({
      message: "Portfolio created successfully",
      portfolio,
    });

  } catch (error) {
    console.error("Create portfolio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}