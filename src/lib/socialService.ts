export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  coursesCompleted: number;
  totalStudyTime: number;
  badges: Badge[];
  socialLinks?: SocialLink[];
  isPrivate: boolean;
  joinDate: Date;
  lastActiveDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'youtube' | 'website' | 'other';
  url: string;
  displayName?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'link' | 'achievement' | 'milestone';
  media?: MediaFile[];
  tags: string[];
  mentions: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt?: Date;
  visibility: 'public' | 'followers' | 'private';
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  size: number;
  duration?: number; // for videos in seconds
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  likesCount: number;
  isLiked: boolean;
  parentCommentId?: string; // for replies
  replies?: Comment[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  commentId?: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower: User;
  following: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'achievement' | 'milestone' | 'course_completion';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  ownerId: string;
  owner: User;
  members: StudyGroupMember[];
  memberCount: number;
  maxMembers: number;
  category: string;
  tags: string[];
  isPrivate: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface StudyGroupMember {
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  contributionScore: number;
  isActive: boolean;
}

export interface GroupPost {
  id: string;
  groupId: string;
  authorId: string;
  author: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'announcement' | 'discussion';
  media?: MediaFile[];
  attachments?: FileAttachment[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  downloadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'file' | 'system';
  media?: MediaFile[];
  attachment?: FileAttachment;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  lastActivityAt: Date;
  isGroup: boolean;
  title?: string; // for group conversations
  unreadCount: number;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'streak' | 'course_completion' | 'quiz_perfect_score' | 'social_milestone' | 'time_milestone';
  title: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: number;
  target?: number;
}

export class SocialService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.SOCIAL_API_URL || 'https://api.example.com/v1';
    this.apiKey = apiKey || process.env.SOCIAL_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  // User and Profile Methods
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        joinDate: new Date(data.joinDate),
        lastActiveDate: new Date(data.lastActiveDate),
        badges: data.badges?.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        joinDate: new Date(data.joinDate),
        lastActiveDate: new Date(data.lastActiveDate),
        badges: data.badges?.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Post Methods
  async createPost(content: string, type: Post['type'], media?: MediaFile[]): Promise<Post> {
    try {
      const response = await fetch(`${this.baseUrl}/posts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content, type, media }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getUserFeed(userId: string, page = 1, limit = 20): Promise<Post[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/feed?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user feed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((post: any) => ({
        ...post,
        author: {
          ...post.author,
          joinDate: new Date(post.author.joinDate),
          lastActiveDate: new Date(post.author.lastActiveDate),
          badges: post.author.badges?.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt),
          })) || [],
        },
        createdAt: new Date(post.createdAt),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching user feed:', error);
      throw error;
    }
  }

  async likePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to like post: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/like`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to unlike post: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // Comment Methods
  async addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    try {
      const response = await fetch(`${this.baseUrl}/posts/${postId}/comments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content, parentCommentId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        author: {
          ...data.author,
          joinDate: new Date(data.author.joinDate),
          lastActiveDate: new Date(data.author.lastActiveDate),
          badges: data.author.badges?.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt),
          })) || [],
        },
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        replies: data.replies?.map((reply: any) => ({
          ...reply,
          author: {
            ...reply.author,
            joinDate: new Date(reply.author.joinDate),
            lastActiveDate: new Date(reply.author.lastActiveDate),
            badges: reply.author.badges?.map((badge: any) => ({
              ...badge,
              earnedAt: new Date(badge.earnedAt),
            })) || [],
          },
          createdAt: new Date(reply.createdAt),
          updatedAt: reply.updatedAt ? new Date(reply.updatedAt) : undefined,
        })) || [],
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Follow Methods
  async followUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/follow`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to follow user: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/follow`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to unfollow user: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getFollowers(userId: string, page = 1, limit = 20): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/followers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch followers: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((user: any) => ({
        ...user,
        joinDate: new Date(user.joinDate),
        lastActiveDate: new Date(user.lastActiveDate),
        badges: user.badges?.map((badge: any) => ({
          ...badge,
          earnedAt: new Date(badge.earnedAt),
        })) || [],
      }));
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  // Notification Methods
  async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Study Group Methods
  async createStudyGroup(name: string, description: string, category: string, isPrivate = false): Promise<StudyGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/study-groups`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name, description, category, isPrivate }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create study group: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        owner: {
          ...data.owner,
          joinDate: new Date(data.owner.joinDate),
          lastActiveDate: new Date(data.owner.lastActiveDate),
          badges: data.owner.badges?.map((badge: any) => ({
            ...badge,
            earnedAt: new Date(badge.earnedAt),
          })) || [],
        },
        members: data.members?.map((member: any) => ({
          ...member,
          user: {
            ...member.user,
            joinDate: new Date(member.user.joinDate),
            lastActiveDate: new Date(member.user.lastActiveDate),
            badges: member.user.badges?.map((badge: any) => ({
              ...badge,
              earnedAt: new Date(badge.earnedAt),
            })) || [],
          },
          joinedAt: new Date(member.joinedAt),
        })) || [],
        createdAt: new Date(data.createdAt),
        lastActivityAt: new Date(data.lastActivityAt),
      };
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  async joinStudyGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to join study group: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }
}

// Mock implementation for development
export class MockSocialService extends SocialService {
  constructor() {
    super('mock-api-key');
  }

  async getUserProfile(userId: string): Promise<User> {
    return {
      id: userId,
      username: 'johndoe',
      displayName: 'John Doe',
      avatar: '/images/avatars/john-doe.jpg',
      bio: 'Passionate learner exploring the world of finance',
      followersCount: 245,
      followingCount: 180,
      coursesCompleted: 12,
      totalStudyTime: 2400,
      badges: [
        {
          id: 'badge1',
          name: 'Early Bird',
          description: 'Completed 7-day study streak',
          icon: 'sun',
          color: 'yellow',
          earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          rarity: 'common',
        },
      ],
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/johndoe', displayName: '@johndoe' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe', displayName: 'John Doe' },
      ],
      isPrivate: false,
      joinDate: new Date('2023-01-15'),
      lastActiveDate: new Date(),
    };
  }

  async getUserFeed(userId: string, page = 1, limit = 20): Promise<Post[]> {
    const user = await this.getUserProfile(userId);
    
    return [
      {
        id: 'post1',
        authorId: userId,
        author: user,
        content: 'Just completed my first stock market course! 📈 Ready to start investing.',
        type: 'achievement',
        tags: ['stock-market', 'course-completion', 'milestone'],
        mentions: [],
        likesCount: 15,
        commentsCount: 3,
        sharesCount: 2,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        visibility: 'public',
      },
    ];
  }

  async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    return [
      {
        id: 'notif1',
        userId: 'user1',
        type: 'like',
        title: 'New Like',
        message: 'Sarah Johnson liked your post about course completion',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium',
        actionUrl: '/posts/post1',
      },
      {
        id: 'notif2',
        userId: 'user1',
        type: 'achievement',
        title: 'New Badge Earned',
        message: 'Congratulations! You earned the "Stock Market Pro" badge',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'high',
        actionUrl: '/profile/badges',
      },
    ];
  }
}

export default SocialService;