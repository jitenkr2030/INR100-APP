export interface UserAnalytics {
  userId: string;
  totalTimeSpent: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  preferredLearningTime: string;
  learningFrequency: number;
  engagementScore: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  activeUsers: number;
  completionRate: number;
  averageTimeToComplete: number;
  averageQuizScore: number;
  dropoutRate: number;
  rating: number;
  totalReviews: number;
  mostPopularLessons: LessonAnalytics[];
  averageRating: number;
}

export interface LessonAnalytics {
  lessonId: string;
  lessonName: string;
  totalViews: number;
  averageTimeSpent: number;
  completionRate: number;
  dropoutRate: number;
  averageScore: number;
  difficultyLevel: number;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  averageSessionTime: number;
  bounceRate: number;
  topPerformingCourses: CourseAnalytics[];
  userRetention: RetentionData;
  revenueMetrics: RevenueMetrics;
}

export interface RetentionData {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  day180: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  lifetimeValue: number;
}

export interface LearningPathAnalytics {
  pathId: string;
  pathName: string;
  totalUsers: number;
  completionRate: number;
  averageCompletionTime: number;
  dropoutRate: number;
  averageScore: number;
}

export interface QuizAnalytics {
  quizId: string;
  quizName: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  difficultyLevel: number;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswers: number;
  totalAnswers: number;
  accuracyRate: number;
  averageTimeSpent: number;
  difficultyLevel: number;
}

export interface DashboardMetrics {
  overview: PlatformAnalytics;
  userEngagement: UserAnalytics;
  topCourses: CourseAnalytics[];
  recentActivity: ActivityData[];
  alerts: AlertData[];
}

export interface ActivityData {
  userId: string;
  userName: string;
  activity: string;
  courseName?: string;
  timestamp: Date;
  type: 'lesson_complete' | 'quiz_complete' | 'course_enroll' | 'certificate_earn';
}

export interface AlertData {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
}

export class AnalyticsService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.ANALYTICS_API_URL || 'https://api.example.com/v1';
    this.apiKey = apiKey || process.env.ANALYTICS_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content/json',
      '-Type': 'applicationAuthorization': `Bearer ${this.apiKey}`,
    };
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/user/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastActiveDate: new Date(data.lastActiveDate),
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/course/${courseId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        mostPopularLessons: data.mostPopularLessons?.map((lesson: any) => ({
          ...lesson,
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/platform`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch platform analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        topPerformingCourses: data.topPerformingCourses?.map((course: any) => ({
          ...course,
          mostPopularLessons: course.mostPopularLessons?.map((lesson: any) => ({
            ...lesson,
          })) || [],
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      throw error;
    }
  }

  async getLearningPathAnalytics(pathId: string): Promise<LearningPathAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/learning-path/${pathId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learning path analytics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching learning path analytics:', error);
      throw error;
    }
  }

  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/quiz/${quizId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        questionAnalytics: data.questionAnalytics?.map((question: any) => ({
          ...question,
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching quiz analytics:', error);
      throw error;
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/dashboard`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        overview: {
          ...data.overview,
          topPerformingCourses: data.overview.topPerformingCourses?.map((course: any) => ({
            ...course,
            mostPopularLessons: course.mostPopularLessons?.map((lesson: any) => ({
              ...lesson,
            })) || [],
          })) || [],
        },
        recentActivity: data.recentActivity?.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp),
        })) || [],
        alerts: data.alerts?.map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async trackEvent(userId: string, event: string, properties?: Record<string, any>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/track`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId,
          event,
          properties,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  async getCustomReport(filters: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/custom-report`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch custom report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching custom report:', error);
      throw error;
    }
  }

  async exportAnalyticsData(format: 'csv' | 'json' | 'pdf', filters?: Record<string, any>): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/export?format=${format}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(filters || {}),
      });

      if (!response.ok) {
        throw new Error(`Failed to export analytics data: ${response.statusText}`);
      }

      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
}

// Mock implementation for development
export class MockAnalyticsService extends AnalyticsService {
  constructor() {
    super('mock-api-key');
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    return {
      userId,
      totalTimeSpent: 1200,
      coursesEnrolled: 5,
      coursesCompleted: 2,
      lessonsCompleted: 45,
      quizzesTaken: 20,
      averageQuizScore: 85,
      certificatesEarned: 2,
      currentStreak: 7,
      longestStreak: 15,
      lastActiveDate: new Date(),
      preferredLearningTime: 'evening',
      learningFrequency: 4.5,
      engagementScore: 78,
    };
  }

  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    return {
      courseId,
      courseName: 'Introduction to Stock Market',
      totalEnrollments: 1250,
      activeUsers: 890,
      completionRate: 67,
      averageTimeToComplete: 180,
      averageQuizScore: 82,
      dropoutRate: 33,
      rating: 4.3,
      totalReviews: 245,
      mostPopularLessons: [
        {
          lessonId: 'lesson1',
          lessonName: 'Stock Market Basics',
          totalViews: 1200,
          averageTimeSpent: 25,
          completionRate: 85,
          dropoutRate: 15,
          averageScore: 78,
          difficultyLevel: 3,
        },
      ],
      averageRating: 4.3,
    };
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    return {
      totalUsers: 15420,
      activeUsers: 8750,
      newUsersToday: 45,
      newUsersThisWeek: 320,
      newUsersThisMonth: 1250,
      totalCourses: 25,
      totalLessons: 450,
      totalQuizzes: 180,
      averageSessionTime: 45,
      bounceRate: 23,
      topPerformingCourses: [
        await this.getCourseAnalytics('course1'),
      ],
      userRetention: {
        day1: 85,
        day7: 65,
        day30: 45,
        day90: 32,
        day180: 25,
      },
      revenueMetrics: {
        totalRevenue: 1250000,
        monthlyRecurringRevenue: 85000,
        averageRevenuePerUser: 89,
        conversionRate: 12,
        churnRate: 8,
        lifetimeValue: 445,
      },
    };
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const overview = await this.getPlatformAnalytics();
    
    return {
      overview,
      userEngagement: await this.getUserAnalytics('user1'),
      topCourses: [await this.getCourseAnalytics('course1')],
      recentActivity: [
        {
          userId: 'user1',
          userName: 'John Doe',
          activity: 'Completed lesson',
          courseName: 'Stock Market Basics',
          timestamp: new Date(),
          type: 'lesson_complete',
        },
      ],
      alerts: [
        {
          id: 'alert1',
          type: 'info',
          title: 'System Update',
          description: 'Platform maintenance scheduled for tonight',
          timestamp: new Date(),
          isRead: false,
        },
      ],
    };
  }
}

export default AnalyticsService;