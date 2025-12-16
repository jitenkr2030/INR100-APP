export interface AnalyticsData {
  userId: string
  totalSessions: number
  totalTimeSpent: number
  averageSessionDuration: number
  completionRate: number
  engagementScore: number
  lastActivity: Date
}

export interface LearningMetrics {
  userId: string
  coursesStarted: number
  coursesCompleted: number
  lessonsCompleted: number
  totalXp: number
  currentStreak: number
  longestStreak: number
  averageTimePerLesson: number
  favoriteCategories: string[]
  learningSpeed: 'beginner' | 'intermediate' | 'advanced'
}

export interface SocialMetrics {
  userId: string
  discussionsParticipated: number
  helpfulVotes: number
  sharedContent: number
  communityScore: number
  badgesEarned: string[]
  followersCount: number
  followingCount: number
}