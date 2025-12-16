import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await request.json();
    const groupId = params.id;

    if (!userId || !groupId) {
      return NextResponse.json(
        { error: 'User ID and group ID are required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Successfully joined the study group!',
      data: {
        groupId,
        userId,
        joinedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    return NextResponse.json(
      { error: 'Failed to join study group' },
      { status: 500 }
    );
  }
}