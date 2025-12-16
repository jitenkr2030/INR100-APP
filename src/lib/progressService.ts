export interface UserProgress {
  userId: string;
  courseId: string;
  lessonId: string;
  completedLessons: string[];
  totalLessons: number;
  completedPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  streakDays: number;
  certificatesEarned: string[];
  quizScores: QuizScore[];
  overallScore: number;
}

export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  attempts: number;
  timeSpent: number;
  completedAt: Date;
}

export interface CourseProgress {
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number;
  averageQuizScore: number;
  progressPercentage: number;
  enrolledDate: Date;
  lastAccessedDate: Date;
  isCompleted: boolean;
  certificateEarned: boolean;
}

export interface LearningStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  totalActiveDays: number;
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achievedAt: Date;
  reward?: string;
}

export interface LearningGoal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: 'minutes' | 'lessons' | 'quizzes';
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
}

export class ProgressService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.PROGRESS_API_URL || 'https://api.example.com/v1';
    this.apiKey = apiKey || process.env.PROGRESS_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async getUserProgress(userId: string, courseId: string): Promise<UserProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/${courseId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user progress: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastAccessed: new Date(data.lastAccessed),
        certificatesEarned: data.certificatesEarned || [],
        quizScores: data.quizScores?.map((quiz: any) => ({
          ...quiz,
          completedAt: new Date(quiz.completedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  async updateLessonProgress(userId: string, courseId: string, lessonId: string, timeSpent: number): Promise<UserProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/${courseId}/lesson`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ lessonId, timeSpent }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update lesson progress: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastAccessed: new Date(data.lastAccessed),
        certificatesEarned: data.certificatesEarned || [],
        quizScores: data.quizScores?.map((quiz: any) => ({
          ...quiz,
          completedAt: new Date(quiz.completedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<UserProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/${courseId}/complete`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ lessonId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark lesson complete: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastAccessed: new Date(data.lastAccessed),
        certificatesEarned: data.certificatesEarned || [],
        quizScores: data.quizScores?.map((quiz: any) => ({
          ...quiz,
          completedAt: new Date(quiz.completedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  }

  async submitQuizScore(userId: string, courseId: string, quizId: string, score: number, maxScore: number, timeSpent: number): Promise<UserProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/${courseId}/quiz`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ quizId, score, maxScore, timeSpent }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit quiz score: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastAccessed: new Date(data.lastAccessed),
        certificatesEarned: data.certificatesEarned || [],
        quizScores: data.quizScores?.map((quiz: any) => ({
          ...quiz,
          completedAt: new Date(quiz.completedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error submitting quiz score:', error);
      throw error;
    }
  }

  async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/courses`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user course progress: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((course: any) => ({
        ...course,
        enrolledDate: new Date(course.enrolledDate),
        lastAccessedDate: new Date(course.lastAccessedDate),
      }));
    } catch (error) {
      console.error('Error fetching user course progress:', error);
      throw error;
    }
  }

  async getLearningStreak(userId: string): Promise<LearningStreak> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/streak`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learning streak: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastActiveDate: new Date(data.lastActiveDate),
        milestones: data.milestones?.map((milestone: any) => ({
          ...milestone,
          achievedAt: new Date(milestone.achievedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching learning streak:', error);
      throw error;
    }
  }

  async updateLearningStreak(userId: string): Promise<LearningStreak> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/streak/update`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to update learning streak: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        lastActiveDate: new Date(data.lastActiveDate),
        milestones: data.milestones?.map((milestone: any) => ({
          ...milestone,
          achievedAt: new Date(milestone.achievedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error updating learning streak:', error);
      throw error;
    }
  }

  async getLearningGoals(userId: string): Promise<LearningGoal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/${userId}/goals`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch learning goals: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        endDate: new Date(goal.endDate),
      }));
    } catch (error) {
      console.error('Error fetching learning goals:', error);
      throw error;
    }
  }

  async createLearningGoal(goal: Omit<LearningGoal, 'id'>): Promise<LearningGoal> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/goals`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error(`Failed to create learning goal: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
    } catch (error) {
      console.error('Error creating learning goal:', error);
      throw error;
    }
  }

  async updateLearningGoal(goalId: string, updates: Partial<LearningGoal>): Promise<LearningGoal> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/goals/${goalId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update learning goal: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
    } catch (error) {
      console.error('Error updating learning goal:', error);
      throw error;
    }
  }
}

// Mock implementation for development
export class MockProgressService extends ProgressService {
  constructor() {
    super('mock-api-key');
  }

  async getUserProgress(userId: string, courseId: string): Promise<UserProgress> {
    return {
      userId,
      courseId,
      lessonId: '',
      completedLessons: ['lesson1', 'lesson2', 'lesson3'],
      totalLessons: 10,
      completedPercentage: 30,
      timeSpent: 150,
      lastAccessed: new Date(),
      streakDays: 7,
      certificatesEarned: [],
      quizScores: [],
      overallScore: 0,
    };
  }

  async getLearningStreak(userId: string): Promise<LearningStreak> {
    return {
      userId,
      currentStreak: 7,
      longestStreak: 15,
      lastActiveDate: new Date(),
      totalActiveDays: 45,
      milestones: [
        { days: 7, achievedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), reward: 'Bronze Badge' },
        { days: 15, achievedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), reward: 'Silver Badge' },
      ],
    };
  }

  async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    return [
      {
        courseId: 'course1',
        courseName: 'Introduction to Stock Market',
        totalLessons: 20,
        completedLessons: 8,
        totalTimeSpent: 240,
        averageQuizScore: 85,
        progressPercentage: 40,
        enrolledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastAccessedDate: new Date(),
        isCompleted: false,
        certificateEarned: false,
      },
    ];
  }
}

export default ProgressService;