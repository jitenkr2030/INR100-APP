export interface SocialPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  type: 'general' | 'achievement' | 'question' | 'progress'
  createdAt: Date
  likes: number
  comments: Comment[]
  likedByUser?: boolean
  achievement?: Achievement
}

export interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: Date
  likes: number
  likedByUser?: boolean
}

export interface Group {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  isPrivate: boolean
  createdBy: string
  createdAt: Date
  userJoined?: boolean
}

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  color: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}