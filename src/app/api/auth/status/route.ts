import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authHeader = request.headers.get('authorization')
    
    // For demo purposes, return a mock user
    // In a real app, you would validate the token and fetch user data
    const mockUser = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+91 98765 43210',
      avatar: '',
      isVerified: true,
      isPremium: false,
      kycStatus: 'pending' as const,
      brokerConnected: false,
    }

    return NextResponse.json({
      success: true,
      user: mockUser,
    })
  } catch (error) {
    console.error('Auth status check failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check auth status' },
      { status: 500 }
    )
  }
}