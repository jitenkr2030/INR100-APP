import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Social Learning API for Community Features
interface SocialPostData {
  userId: string;
  content: string;
  type: 'REGULAR' | 'INSIGHT' | 'ANALYSIS' | 'PORTFOLIO_SHARE' | 'ACHIEVEMENT' | 'QUESTION';
  images?: string[];
  isPublic?: boolean;
  tags?: string[];
  metadata?: any;
}

interface CommentData {
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}

interface FollowData {
  followerId: string;
  followingId: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'feed';
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    switch (action) {
      case 'feed':
        return await getSocialFeed(userId, limit, offset);
      case 'post':
        return await getPostDetails(postId);
      case 'user-posts':
        return await getUserPosts(userId, limit, offset);
      case 'user-profile':
        return await getUserProfile(userId);
      case 'followers':
        return await getFollowers(userId, limit, offset);
      case 'following':
        return await getFollowing(userId, limit, offset);
      case 'trending':
        return await getTrendingPosts(limit, offset);
      case 'achievements':
        return await getCommunityAchievements(userId, limit, offset);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'create-post':
        return await createSocialPost(await request.json());
      case 'create-comment':
        return await createComment(await request.json());
      case 'follow':
        return await followUser(await request.json());
      case 'unfollow':
        return await unfollowUser(await request.json());
      case 'like-post':
        return await likePost(await request.json());
      case 'unlike-post':
        return await unlikePost(await request.json());
      case 'share-achievement':
        return await shareAchievement(await request.json());
      case 'ask-question':
        return await askQuestion(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Social feed with personalized content
async function getSocialFeed(userId: string, limit: number, offset: number) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  // Get user's following list
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  
  const followingIds = following.map(f => f.followingId);
  followingIds.push(userId); // Include own posts
  
  // Get posts from followed users and public posts
  const posts = await prisma.socialPost.findMany({
    where: {
      OR: [
        { userId: { in: followingIds } },
        { isPublic: true }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
  
  // Enrich posts with engagement data
  const enrichedPosts = await Promise.all(posts.map(async (post) => {
    // Check if current user liked this post
    const userLike = await prisma.comment.findFirst({
      where: {
        userId,
        postId: post.id,
        content: 'LIKE' // Using content field to store like status
      }
    });
    
    return {
      ...post,
      isLiked: !!userLike,
      commentCount: await prisma.comment.count({
        where: { postId: post.id }
      }),
      timeAgo: getTimeAgo(post.createdAt)
    };
  }));
  
  return NextResponse.json({
    success: true,
    data: {
      posts: enrichedPosts,
      hasMore: enrichedPosts.length === limit
    }
  });
}

// Get specific post details
async function getPostDetails(postId: string) {
  if (!postId) {
    return NextResponse.json(
      { success: false, error: 'postId required' },
      { status: 400 }
    );
  }
  
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  
  if (!post) {
    return NextResponse.json(
      { success: false, error: 'Post not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      post: {
        ...post,
        timeAgo: getTimeAgo(post.createdAt)
      }
    }
  });
}

// Create a new social post
async function createSocialPost(data: SocialPostData) {
  const { userId, content, type, images, isPublic = true, tags, metadata } = data;
  
  if (!userId || !content) {
    return NextResponse.json(
      { success: false, error: 'userId and content are required' },
      { status: 400 }
    );
  }
  
  const post = await prisma.socialPost.create({
    data: {
      userId,
      content,
      type: type as any,
      images: images ? JSON.stringify(images) : null,
      isPublic,
      metadata: metadata ? JSON.stringify(metadata) : null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: {
      post: {
        ...post,
        timeAgo: 'just now'
      }
    }
  });
}

// Create a comment
async function createComment(data: CommentData) {
  const { userId, postId, content, parentCommentId } = data;
  
  if (!userId || !postId || !content) {
    return NextResponse.json(
      { success: false, error: 'userId, postId, and content are required' },
      { status: 400 }
    );
  }
  
  const comment = await prisma.comment.create({
    data: {
      userId,
      postId,
      content,
      parentCommentId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: {
      comment: {
        ...comment,
        timeAgo: 'just now'
      }
    }
  });
}

// Follow/Unfollow users
async function followUser(data: FollowData) {
  const { followerId, followingId } = data;
  
  if (!followerId || !followingId) {
    return NextResponse.json(
      { success: false, error: 'followerId and followingId are required' },
      { status: 400 }
    );
  }
  
  if (followerId === followingId) {
    return NextResponse.json(
      { success: false, error: 'Cannot follow yourself' },
      { status: 400 }
    );
  }
  
  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });
  
  if (existingFollow) {
    return NextResponse.json(
      { success: false, error: 'Already following this user' },
      { status: 400 }
    );
  }
  
  const follow = await prisma.follow.create({
    data: {
      followerId,
      followingId
    }
  });
  
  return NextResponse.json({
    success: true,
    data: { follow }
  });
}

async function unfollowUser(data: FollowData) {
  const { followerId, followingId } = data;
  
  if (!followerId || !followingId) {
    return NextResponse.json(
      { success: false, error: 'followerId and followingId are required' },
      { status: 400 }
    );
  }
  
  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: { message: 'Successfully unfollowed' }
  });
}

// Like/Unlike posts
async function likePost(data: { userId: string; postId: string }) {
  const { userId, postId } = data;
  
  if (!userId || !postId) {
    return NextResponse.json(
      { success: false, error: 'userId and postId are required' },
      { status: 400 }
    );
  }
  
  // Use comment system to track likes
  const existingLike = await prisma.comment.findFirst({
    where: {
      userId,
      postId,
      content: 'LIKE'
    }
  });
  
  if (existingLike) {
    return NextResponse.json(
      { success: false, error: 'Already liked this post' },
      { status: 400 }
    );
  }
  
  await prisma.comment.create({
    data: {
      userId,
      postId,
      content: 'LIKE'
    }
  });
  
  // Update post like count
  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      likes: {
        increment: 1
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: { message: 'Post liked successfully' }
  });
}

async function unlikePost(data: { userId: string; postId: string }) {
  const { userId, postId } = data;
  
  if (!userId || !postId) {
    return NextResponse.json(
      { success: false, error: 'userId and postId are required' },
      { status: 400 }
    );
  }
  
  await prisma.comment.deleteMany({
    where: {
      userId,
      postId,
      content: 'LIKE'
    }
  });
  
  // Update post like count
  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      likes: {
        decrement: 1
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: { message: 'Post unliked successfully' }
  });
}

// Share achievement to social feed
async function shareAchievement(data: { userId: string; achievementId: string }) {
  const { userId, achievementId } = data;
  
  if (!userId || !achievementId) {
    return NextResponse.json(
      { success: false, error: 'userId and achievementId are required' },
      { status: 400 }
    );
  }
  
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId }
  });
  
  if (!achievement) {
    return NextResponse.json(
      { success: false, error: 'Achievement not found' },
      { status: 404 }
    );
  }
  
  // Create social post for achievement
  const post = await prisma.socialPost.create({
    data: {
      userId,
      content: `🎉 Just unlocked: ${achievement.name}! ${achievement.description}`,
      type: 'ACHIEVEMENT',
      isPublic: true,
      metadata: JSON.stringify({
        achievementId,
        achievementName: achievement.name,
        xpReward: achievement.xpReward
      })
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: {
      post: {
        ...post,
        timeAgo: 'just now'
      }
    }
  });
}

// Ask a question in the community
async function askQuestion(data: { userId: string; question: string; category?: string }) {
  const { userId, question, category } = data;
  
  if (!userId || !question) {
    return NextResponse.json(
      { success: false, error: 'userId and question are required' },
      { status: 400 }
    );
  }
  
  const post = await prisma.socialPost.create({
    data: {
      userId,
      content: `❓ Question: ${question}`,
      type: 'QUESTION',
      isPublic: true,
      metadata: JSON.stringify({
        category: category || 'general',
        isQuestion: true
      })
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    }
  });
  
  return NextResponse.json({
    success: true,
    data: {
      post: {
        ...post,
        timeAgo: 'just now'
      }
    }
  });
}

// Get user posts
async function getUserPosts(userId: string, limit: number, offset: number) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const posts = await prisma.socialPost.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        take: 2
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
  
  return NextResponse.json({
    success: true,
    data: {
      posts: posts.map(post => ({
        ...post,
        timeAgo: getTimeAgo(post.createdAt)
      })),
      hasMore: posts.length === limit
    }
  });
}

// Get user profile with social stats
async function getUserProfile(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      followers: true,
      following: true,
      socialPosts: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      userAchievements: {
        include: {
          achievement: true
        },
        orderBy: { earnedAt: 'desc' },
        take: 10
      }
    }
  });
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }
  
  const postCount = await prisma.socialPost.count({
    where: { userId }
  });
  
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        streak: user.streak
      },
      socialStats: {
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: postCount,
        achievementsCount: user.userAchievements.length
      },
      recentPosts: user.socialPosts.map(post => ({
        ...post,
        timeAgo: getTimeAgo(post.createdAt)
      })),
      recentAchievements: user.userAchievements.map(ua => ({
        name: ua.achievement.name,
        description: ua.achievement.description,
        earnedAt: ua.earnedAt
      }))
    }
  });
}

// Get followers/following lists
async function getFollowers(userId: string, limit: number, offset: number) {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    },
    take: limit,
    skip: offset
  });
  
  return NextResponse.json({
    success: true,
    data: {
      followers: followers.map(f => f.follower)
    }
  });
}

async function getFollowing(userId: string, limit: number, offset: number) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    },
    take: limit,
    skip: offset
  });
  
  return NextResponse.json({
    success: true,
    data: {
      following: following.map(f => f.following)
    }
  });
}

// Get trending posts
async function getTrendingPosts(limit: number, offset: number) {
  const posts = await prisma.socialPost.findMany({
    where: {
      isPublic: true,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      }
    },
    orderBy: [
      { likes: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit,
    skip: offset
  });
  
  return NextResponse.json({
    success: true,
    data: {
      posts: posts.map(post => ({
        ...post,
        timeAgo: getTimeAgo(post.createdAt)
      }))
    }
  });
}

// Get community achievements
async function getCommunityAchievements(userId: string, limit: number, offset: number) {
  const achievements = await prisma.userAchievement.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      achievement: true
    },
    orderBy: { earnedAt: 'desc' },
    take: limit,
    skip: offset
  });
  
  return NextResponse.json({
    success: true,
    data: {
      achievements: achievements.map(ua => ({
        user: ua.user,
        achievement: {
          name: ua.achievement.name,
          description: ua.achievement.description,
          category: ua.achievement.category
        },
        earnedAt: ua.earnedAt,
        timeAgo: getTimeAgo(ua.earnedAt)
      }))
    }
  });
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}