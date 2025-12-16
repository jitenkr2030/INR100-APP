export interface ProgressData {
  userId: string
  categoryId: string
  moduleId: string
  totalLessons: number
  completedLessons: number
  currentLesson: number
  totalDuration: number
  completedDuration: number
  xpEarned: number
  xpTotal: number
  streakDays: number
  lastAccessed: Date
  completionPercentage: number
}

export interface AchievementData {
  id: string
  userId: string
  type: string
  title: string
  description: string
  icon: string
  color: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface CertificateData {
  id: string
  userId: string
  courseId: string
  courseName: string
  issuedDate: Date
  certificateUrl: string
  verificationCode: string
}