import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Demo wallet data
    const demoWallet = {
      id: "demo-wallet-1",
      balance: 10000,
      currency: "INR",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(),
      statistics: {
        totalDeposits: 15000,
        totalWithdrawals: 5000,
        transactionCount: 15
      }
    };

    // Demo transactions
    const demoTransactions = [
      {
        id: "tx-1",
        userId: userId,
        walletId: "demo-wallet-1",
        type: "DEPOSIT",
        amount: 5000,
        currency: "INR",
        status: "COMPLETED",
        description: "Initial deposit",
        metadata: null,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        user: { name: "Demo User", email: "demo@inr100.com" }
      },
      {
        id: "tx-2",
        userId: userId,
        walletId: "demo-wallet-1",
        type: "INVESTMENT",
        amount: 2000,
        currency: "INR",
        status: "COMPLETED",
        description: "Investment in RELIANCE",
        metadata: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        user: { name: "Demo User", email: "demo@inr100.com" }
      },
      {
        id: "tx-3",
        userId: userId,
        walletId: "demo-wallet-1",
        type: "INVESTMENT",
        amount: 1500,
        currency: "INR",
        status: "COMPLETED",
        description: "Investment in Axis Bluechip Fund",
        metadata: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        user: { name: "Demo User", email: "demo@inr100.com" }
      },
      {
        id: "tx-4",
        userId: userId,
        walletId: "demo-wallet-1",
        type: "DEPOSIT",
        amount: 3000,
        currency: "INR",
        status: "COMPLETED",
        description: "Additional deposit",
        metadata: null,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        user: { name: "Demo User", email: "demo@inr100.com" }
      },
      {
        id: "tx-5",
        userId: userId,
        walletId: "demo-wallet-1",
        type: "INVESTMENT",
        amount: 1000,
        currency: "INR",
        status: "COMPLETED",
        description: "Investment in Digital Gold",
        metadata: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        user: { name: "Demo User", email: "demo@inr100.com" }
      }
    ];

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const paginatedTransactions = demoTransactions.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      wallet: demoWallet,
      transactions: {
        data: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: demoTransactions.length,
          pages: Math.ceil(demoTransactions.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, amount, description, metadata } = body;

    if (!userId || !type || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create wallet
    const wallet = await prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        balance: 0,
        currency: 'INR'
      }
    });

    // For withdrawals, check if user has sufficient balance
    if (type === 'WITHDRAWAL' && wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type,
        amount,
        currency: 'INR',
        status: 'PENDING',
        description: description || `${type.toLowerCase()} transaction`,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    // Update wallet balance for deposits
    if (type === 'DEPOSIT') {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Wallet operation error:', error);
    return NextResponse.json(
      { error: 'Failed to process wallet operation' },
      { status: 500 }
    );
  }
}