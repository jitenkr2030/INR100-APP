import { NextRequest, NextResponse } from 'next/server';
import RealSocialService from '@/lib/socialService';

// Real Social Features API Route
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type'); // 'discussions', 'groups', 'shares', 'feed'
    const course = searchParams.get('course');
    const lesson = searchParams.get('lesson');
    const category = searchParams.get('category');

    const socialService = RealSocialService.getInstance();

    let data;

    switch (type) {
      case 'discussions':
        data = await socialService.getDiscussions(userId, course, lesson);
        break;
      
      case 'groups':
        data = await socialService.getStudyGroups(userId, category);
        break;
      
      case 'shares':
        data = await socialService.getProgressShares(userId);
        break;
      
      case 'feed':
        data = await socialService.getCommunityFeed(userId);
        break;
      
      default:
        // Return all social data
        const [discussions, groups, shares, feed] = await Promise.all([
          socialService.getDiscussions(userId, course, lesson),
          socialService.getStudyGroups(userId, category),
          socialService.getProgressShares(userId),
          socialService.getCommunityFeed(userId)
        ]);
        
        data = {
          discussions,
          groups,
          shares,
          feed
        };
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get real social data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    const socialService = RealSocialService.getInstance();

    switch (action) {
      case 'create_discussion':
        const { content, course, lesson } = body;
        const discussion = await socialService.createDiscussion(userId, content, course, lesson);
        return NextResponse.json({
          success: true,
          data: discussion,
          message: 'Discussion posted successfully!'
        });

      case 'toggle_discussion_like':
        const { discussionId } = body;
        const liked = await socialService.toggleDiscussionLike(userId, discussionId);
        return NextResponse.json({
          success: true,
          data: { liked },
          message: liked ? 'Discussion liked!' : 'Discussion unliked!'
        });

      case 'toggle_group_membership':
        const { groupId } = body;
        const joined = await socialService.toggleGroupMembership(userId, groupId);
        return NextResponse.json({
          success: true,
          data: { joined },
          message: joined ? 'Joined group!' : 'Left group!'
        });

      case 'share_achievement':
        const { type, title, description, achievement } = body;
        const share = await socialService.createProgressShare(userId, type, title, description, achievement);
        return NextResponse.json({
          success: true,
          data: share,
          message: 'Achievement shared successfully!'
        });

      case 'auto_share_achievement':
        const { achievement: achievementData } = body;
        await socialService.shareAchievement(userId, achievementData);
        return NextResponse.json({
          success: true,
          message: 'Achievement auto-shared!'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform social action' },
      { status: 500 }
    );
  }
}