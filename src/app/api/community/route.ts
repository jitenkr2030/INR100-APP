import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // ALL, REGULAR, QUESTION, ACHIEVEMENT, NEWS
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Demo community posts
    const demoPosts = [
      {
        id: "post-1",
        userId: "user-1",
        content: "Just made my first investment in RELIANCE! Excited to start my investment journey with INR100.com 🚀 #investing #stocks",
        type: "ACHIEVEMENT",
        likes: 15,
        shares: 3,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: {
          id: "user-1",
          name: "Rahul Sharma",
          email: "rahul@example.com",
          subscriptionTier: "FREE"
        },
        likesCount: 15,
        commentsCount: 5,
        isLiked: false,
        comments: [
          {
            id: "comment-1",
            userId: "user-2",
            postId: "post-1",
            content: "Congratulations! Great choice for a first investment.",
            likes: 3,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            user: {
              id: "user-2",
              name: "Priya Patel",
              subscriptionTier: "PREMIUM"
            }
          }
        ]
      },
      {
        id: "post-2",
        userId: "user-3",
        content: "What do you guys think about investing in mutual funds vs direct stocks? Looking for advice for a beginner like me. #mutualfunds #stocks",
        type: "QUESTION",
        likes: 8,
        shares: 1,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        user: {
          id: "user-3",
          name: "Amit Kumar",
          email: "amit@example.com",
          subscriptionTier: "FREE"
        },
        likesCount: 8,
        commentsCount: 12,
        isLiked: false,
        comments: [
          {
            id: "comment-2",
            userId: "user-4",
            postId: "post-2",
            content: "I'd suggest starting with mutual funds for diversification.",
            likes: 5,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            user: {
              id: "user-4",
              name: "Sneha Reddy",
              subscriptionTier: "PREMIUM"
            }
          }
        ]
      },
      {
        id: "post-3",
        userId: "user-5",
        content: "My portfolio is up 12% this month! The AI recommendations from INR100.com are really helping me make better decisions. 📈 #portfolio #ai",
        type: "REGULAR",
        likes: 25,
        shares: 8,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        user: {
          id: "user-5",
          name: "Vikram Singh",
          email: "vikram@example.com",
          subscriptionTier: "PREMIUM"
        },
        likesCount: 25,
        commentsCount: 8,
        isLiked: false,
        comments: []
      }
    ];

    let posts = demoPosts;
    if (type && type !== "ALL") {
      posts = demoPosts.filter(post => post.type === type);
    }

    const totalCount = posts.length;

    // Community statistics
    const communityStats = {
      totalPosts: 150,
      postsByType: {
        REGULAR: 80,
        QUESTION: 45,
        ACHIEVEMENT: 20,
        NEWS: 5
      }
    };

    const trendingTopics = [
      { topic: "investing", count: 45 },
      { topic: "stocks", count: 38 },
      { topic: "mutualfunds", count: 32 },
      { topic: "portfolio", count: 28 },
      { topic: "ai", count: 25 }
    ];

    return NextResponse.json({
      posts: posts.slice(offset, offset + limit),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      communityStats: {
        totalPosts: totalCount,
        postsByType: communityStats.postsByType,
        trendingTopics,
      },
    });

  } catch (error) {
    console.error("Get community feed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, content, images = [], type = "REGULAR", topic } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "User ID and content are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create the post
    const post = await db.socialPost.create({
      data: {
        userId,
        content,
        images,
        type,
        topic,
        status: "PUBLISHED",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Create activity record for user's feed
    await db.activity.create({
      data: {
        userId,
        type: "POST_CREATED",
        description: `Created a new ${type.toLowerCase()} post`,
        metadata: {
          postId: post.id,
          postType: type,
        },
      },
    });

    return NextResponse.json({
      message: "Post created successfully",
      post: {
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        _count: undefined,
      },
    });

  } catch (error) {
    console.error("Create community post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}