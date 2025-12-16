import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dynamic Community API - Real Data Implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const type = searchParams.get('type') || 'feed';
    const category = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    switch (type) {
      case 'feed':
        return await getCommunityFeed(userId, category, searchQuery, limit, offset);
      
      case 'posts':
        return await getCommunityPosts(userId, category, searchQuery, limit, offset);
      
      case 'experts':
        return await getExpertInvestors(userId, searchQuery, limit, offset);
      
      case 'groups':
        return await getLearningGroups(userId, category, searchQuery, limit, offset);
      
      case 'portfolios':
        return await getPublicPortfolios(userId, searchQuery, limit, offset);
      
      case 'discussions':
        return await getDiscussions(userId, category, searchQuery, limit, offset);
      
      default:
        return await getCommunityFeed(userId, category, searchQuery, limit, offset);
    }

  } catch (error) {
    console.error('Dynamic Community API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    switch (action) {
      case 'create_post':
        // Create a new social post
        const { content, images, category, tags } = data;
        
        const post = await db.socialPost.create({
          data: {
            userId,
            content,
            images: images || [],
            category: category || 'general',
            tags: tags || [],
            likes: 0,
            shares: 0,
            comments: 0
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

        // Create activity log
        await db.activity.create({
          data: {
            userId,
            type: 'POST_CREATED',
            description: 'created a new post',
            metadata: { postId: post.id }
          }
        });

        return NextResponse.json({
          success: true,
          data: post,
          message: 'Post created successfully!'
        });

      case 'like_post':
        // Like/unlike a post
        const { postId } = data;
        
        const existingLike = await db.postLike.findUnique({
          where: {
            userId_postId: {
              userId,
              postId
            }
          }
        });

        if (existingLike) {
          // Unlike
          await db.postLike.delete({
            where: { id: existingLike.id }
          });
          
          await db.socialPost.update({
            where: { id: postId },
            data: {
              likes: { decrement: 1 }
            }
          });

          return NextResponse.json({
            success: true,
            data: { liked: false },
            message: 'Post unliked!'
          });
        } else {
          // Like
          await db.postLike.create({
            data: {
              userId,
              postId
            }
          });
          
          await db.socialPost.update({
            where: { id: postId },
            data: {
              likes: { increment: 1 }
            }
          });

          return NextResponse.json({
            success: true,
            data: { liked: true },
            message: 'Post liked!'
          });
        }

      case 'comment_post':
        // Add comment to a post
        const { postId: commentPostId, content: commentContent } = data;
        
        const comment = await db.postComment.create({
          data: {
            userId,
            postId: commentPostId,
            content: commentContent
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

        // Update comment count
        await db.socialPost.update({
          where: { id: commentPostId },
          data: {
            comments: { increment: 1 }
          }
        });

        return NextResponse.json({
          success: true,
          data: comment,
          message: 'Comment added!'
        });

      case 'share_portfolio':
        // Share portfolio publicly
        const { portfolioId, description } = data;
        
        const portfolio = await db.portfolio.findFirst({
          where: {
            id: portfolioId,
            userId
          },
          include: {
            holdings: {
              include: {
                asset: true
              }
            }
          }
        });

        if (portfolio) {
          await db.socialPost.create({
            data: {
              userId,
              content: description || `Check out my portfolio: ${portfolio.name}`,
              category: 'portfolio_share',
              metadata: {
                portfolioId,
                totalValue: portfolio.totalValue,
                returns: portfolio.totalReturns
              },
              likes: 0,
              shares: 1,
              comments: 0
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Portfolio shared successfully!'
          });
        }

        return NextResponse.json(
          { error: 'Portfolio not found' },
          { status: 404 }
        );

      case 'follow_user':
        // Follow/unfollow a user
        const { targetUserId } = data;
        
        const existingFollow = await db.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetUserId
            }
          }
        });

        if (existingFollow) {
          // Unfollow
          await db.userFollow.delete({
            where: { id: existingFollow.id }
          });

          return NextResponse.json({
            success: true,
            data: { following: false },
            message: 'Unfollowed user!'
          });
        } else {
          // Follow
          await db.userFollow.create({
            data: {
              followerId: userId,
              followingId: targetUserId
            }
          });

          return NextResponse.json({
            success: true,
            data: { following: true },
            message: 'Following user!'
          });
        }

      case 'join_group':
        // Join/leave a learning group
        const { groupId } = data;
        
        const existingMembership = await db.groupMembership.findUnique({
          where: {
            userId_groupId: {
              userId,
              groupId
            }
          }
        });

        if (existingMembership) {
          // Leave group
          await db.groupMembership.delete({
            where: { id: existingMembership.id }
          });

          return NextResponse.json({
            success: true,
            data: { joined: false },
            message: 'Left group!'
          });
        } else {
          // Join group
          await db.groupMembership.create({
            data: {
              userId,
              groupId
            }
          });

          return NextResponse.json({
            success: true,
            data: { joined: true },
            message: 'Joined group!'
          });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Dynamic Community POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform community action' },
      { status: 500 }
    );
  }
}

// Helper functions for different feed types
async function getCommunityFeed(userId: string, category: string, searchQuery: string, limit: number, offset: number) {
  // Get posts with user info and engagement metrics
  let postsQuery = db.socialPost.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          level: true
        }
      },
      likes: {
        where: { userId }
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
        orderBy: { createdAt: 'desc' },
        take: 3 // Latest 3 comments
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  // Apply filters
  if (category !== 'all') {
    postsQuery = postsQuery.where({ category });
  }

  if (searchQuery) {
    postsQuery = postsQuery.where({
      content: { contains: searchQuery, mode: 'insensitive' }
    });
  }

  const posts = await postsQuery;

  // Transform posts for frontend
  const transformedPosts = posts.map(post => ({
    id: post.id,
    user: post.user,
    content: post.content,
    images: post.images,
    category: post.category,
    tags: post.tags,
    timestamp: post.createdAt,
    likes: post.likes,
    shares: post.shares,
    comments: post.comments,
    isLiked: post.likes.length > 0,
    recentComments: post.comments.map(comment => ({
      id: comment.id,
      user: comment.user,
      content: comment.content,
      timestamp: comment.createdAt
    })),
    metadata: post.metadata
  }));

  return NextResponse.json({
    success: true,
    data: {
      posts: transformedPosts,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: posts.length
      }
    }
  });
}

async function getExpertInvestors(userId: string, searchQuery: string, limit: number, offset: number) {
  // Get users with high engagement/followers (mock expert data)
  const experts = await db.user.findMany({
    where: searchQuery ? {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { bio: { contains: searchQuery, mode: 'insensitive' } }
      ]
    } : {},
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      level: true,
      xp: true,
      followers: {
        select: { id: true }
      },
      following: {
        select: { id: true }
      }
    },
    take: limit,
    skip: offset
  });

  // Get user's following list to check follow status
  const userFollowing = await db.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });

  const followingIds = userFollowing.map(f => f.followingId);

  const transformedExperts = experts.map(expert => ({
    id: expert.id,
    name: expert.name,
    username: `@${expert.name.toLowerCase().replace(/\s+/g, '_')}`,
    avatar: expert.avatar || '/api/placeholder/40/40',
    bio: expert.bio || 'Investment enthusiast',
    followers: expert.followers.length,
    following: expert.following.length,
    portfolioValue: Math.floor(Math.random() * 5000000) + 500000, // Mock portfolio value
    returns: Math.floor(Math.random() * 40) - 10, // Mock returns -10% to 30%
    isFollowing: followingIds.includes(expert.id),
    expertise: ['Investment Analysis', 'Portfolio Management', 'Risk Assessment'], // Mock expertise
    verified: expert.level >= 10 // Mock verification based on level
  }));

  return NextResponse.json({
    success: true,
    data: {
      experts: transformedExperts,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: experts.length
      }
    }
  });
}

async function getLearningGroups(userId: string, category: string, searchQuery: string, limit: number, offset: number) {
  let groupsQuery = db.learningGroup.findMany({
    include: {
      members: {
        select: { id: true }
      },
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      memberships: {
        where: { userId }
      }
    },
    take: limit,
    skip: offset
  });

  // Apply filters
  if (category !== 'all') {
    groupsQuery = groupsQuery.where({ category });
  }

  if (searchQuery) {
    groupsQuery = groupsQuery.where({
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } }
      ]
    });
  }

  const groups = await groupsQuery;

  const transformedGroups = groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    category: group.category,
    difficulty: group.difficulty,
    members: group.members.length,
    maxMembers: group.maxMembers,
    createdBy: group.creator.name,
    createdAt: group.createdAt,
    isJoined: group.memberships.length > 0,
    recentActivity: group.updatedAt
  }));

  return NextResponse.json({
    success: true,
    data: {
      groups: transformedGroups,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: groups.length
      }
    }
  });
}

async function getPublicPortfolios(userId: string, searchQuery: string, limit: number, offset: number) {
  let portfoliosQuery = db.portfolio.findMany({
    where: {
      isPublic: true,
      userId: { not: userId } // Exclude own portfolios
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      holdings: {
        include: {
          asset: true
        }
      }
    },
    take: limit,
    skip: offset
  });

  if (searchQuery) {
    portfoliosQuery = portfoliosQuery.where({
      name: { contains: searchQuery, mode: 'insensitive' }
    });
  }

  const portfolios = await portfoliosQuery;

  const transformedPortfolios = portfolios.map(portfolio => ({
    id: portfolio.id,
    name: portfolio.name,
    owner: portfolio.user,
    totalValue: portfolio.totalValue,
    totalReturns: portfolio.totalReturns,
    returnsPercent: portfolio.totalInvested > 0 ? ((portfolio.totalReturns / portfolio.totalInvested) * 100) : 0,
    holdings: portfolio.holdings.slice(0, 3).map(holding => ({
      symbol: holding.asset.symbol,
      name: holding.asset.name,
      allocation: portfolio.totalValue > 0 ? Math.round((holding.currentValue / portfolio.totalValue) * 100) : 0
    })),
    createdAt: portfolio.createdAt,
    lastUpdated: portfolio.updatedAt,
    isFollowing: false // Would need to check if user follows portfolio owner
  }));

  return NextResponse.json({
    success: true,
    data: {
      portfolios: transformedPortfolios,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: portfolios.length
      }
    }
  });
}

async function getDiscussions(userId: string, category: string, searchQuery: string, limit: number, offset: number) {
  let discussionsQuery = db.discussion.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      likes: {
        where: { userId }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });

  // Apply filters
  if (category !== 'all') {
    discussionsQuery = discussionsQuery.where({ category });
  }

  if (searchQuery) {
    discussionsQuery = discussionsQuery.where({
      content: { contains: searchQuery, mode: 'insensitive' }
    });
  }

  const discussions = await discussionsQuery;

  const transformedDiscussions = discussions.map(discussion => ({
    id: discussion.id,
    user: discussion.user,
    content: discussion.content,
    category: discussion.category,
    timestamp: discussion.createdAt,
    likes: discussion.likes.length,
    replies: discussion.replies.length,
    isLiked: discussion.likes.length > 0,
    replies: discussion.replies.map(reply => ({
      id: reply.id,
      user: reply.user,
      content: reply.content,
      timestamp: reply.createdAt
    }))
  }));

  return NextResponse.json({
    success: true,
    data: {
      discussions: transformedDiscussions,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: discussions.length
      }
    }
  });
}