export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  price: number;
  currency: string;
  instructor: Instructor;
  thumbnail: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  enrollmentCount: number;
  isPublished: boolean;
  prerequisites: string[];
  learningObjectives: string[];
  modules: CourseModule[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  expertise: string[];
  experience: number; // years
  rating: number;
  totalStudents: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  quizzes: Quiz[];
  isCompleted?: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'interactive' | 'assignment';
  duration: number; // in minutes
  content: LessonContent;
  order: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  prerequisites?: string[];
  resources: Resource[];
}

export interface LessonContent {
  videoUrl?: string;
  textContent?: string;
  htmlContent?: string;
  interactiveElements?: InteractiveElement[];
  assignmentDetails?: Assignment;
}

export interface InteractiveElement {
  id: string;
  type: 'quiz' | 'simulation' | 'calculator' | 'chart';
  config: Record<string, any>;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: Date;
  maxScore: number;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  userId: string;
  content: string;
  attachments: string[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'spreadsheet';
  url: string;
  size?: number;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number;
  order: number;
  isCompleted?: boolean;
  score?: number;
  attempts?: QuizAttempt[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  completedAt: Date;
  feedback?: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface CourseSearchFilters {
  category?: string;
  difficulty?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  duration?: { min: number; max: number };
  instructor?: string;
  tags?: string[];
  sortBy?: 'rating' | 'price' | 'duration' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  courses: Course[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: CourseSearchFilters;
}

export class CourseContentService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.COURSE_API_URL || 'https://api.example.com/v1';
    this.apiKey = apiKey || process.env.COURSE_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async getCourse(courseId: string): Promise<Course> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastAccessedAt: data.lastAccessedAt ? new Date(data.lastAccessedAt) : undefined,
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  async searchCourses(filters: CourseSearchFilters, page = 1, limit = 20): Promise<SearchResult> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => {
            if (typeof value === 'object') {
              return [key, JSON.stringify(value)];
            }
            return [key, value?.toString() || ''];
          })
        ),
      });

      const response = await fetch(`${this.baseUrl}/courses/search?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to search courses: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        courses: data.courses.map((course: any) => ({
          ...course,
          createdAt: new Date(course.createdAt),
          updatedAt: new Date(course.updatedAt),
          lastAccessedAt: course.lastAccessedAt ? new Date(course.lastAccessedAt) : undefined,
        })),
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  async getLesson(courseId: string, lessonId: string): Promise<Lesson> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}/lessons/${lessonId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lesson: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        assignmentDetails: data.assignmentDetails ? {
          ...data.assignmentDetails,
          dueDate: data.assignmentDetails.dueDate ? new Date(data.assignmentDetails.dueDate) : undefined,
          submissions: data.assignmentDetails.submissions?.map((submission: any) => ({
            ...submission,
            submittedAt: new Date(submission.submittedAt),
          })) || [],
        } : undefined,
      };
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }

  async getQuiz(courseId: string, quizId: string): Promise<Quiz> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/${courseId}/quizzes/${quizId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        attempts: data.attempts?.map((attempt: any) => ({
          ...attempt,
          completedAt: new Date(attempt.completedAt),
        })) || [],
      };
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  async submitQuizAttempt(quizId: string, answers: QuizAnswer[]): Promise<QuizAttempt> {
    try {
      const response = await fetch(`${this.baseUrl}/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit quiz attempt: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        completedAt: new Date(data.completedAt),
      };
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  async submitAssignment(assignmentId: string, content: string, attachments: string[]): Promise<AssignmentSubmission> {
    try {
      const response = await fetch(`${this.baseUrl}/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content, attachments }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit assignment: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        ...data,
        submittedAt: new Date(data.submittedAt),
      };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    try {
      const response = await fetch(`${this.baseUrl}/instructors/${instructorId}/courses`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch instructor courses: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((course: any) => ({
        ...course,
        createdAt: new Date(course.createdAt),
        updatedAt: new Date(course.updatedAt),
        lastAccessedAt: course.lastAccessedAt ? new Date(course.lastAccessedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      throw error;
    }
  }

  async getFeaturedCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/featured`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch featured courses: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((course: any) => ({
        ...course,
        createdAt: new Date(course.createdAt),
        updatedAt: new Date(course.updatedAt),
        lastAccessedAt: course.lastAccessedAt ? new Date(course.lastAccessedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      throw error;
    }
  }

  async getCourseCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/courses/categories`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch course categories: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course categories:', error);
      throw error;
    }
  }
}

// Mock implementation for development
export class MockCourseContentService extends CourseContentService {
  constructor() {
    super('mock-api-key');
  }

  async getCourse(courseId: string): Promise<Course> {
    return {
      id: courseId,
      title: 'Introduction to Stock Market',
      description: 'Learn the basics of stock market investing and trading',
      category: 'Finance',
      difficulty: 'beginner',
      duration: 300,
      price: 2999,
      currency: 'INR',
      instructor: {
        id: 'instructor1',
        name: 'John Doe',
        bio: 'Experienced financial analyst with 10+ years in the industry',
        avatar: '/images/instructors/john-doe.jpg',
        expertise: ['Stock Market', 'Technical Analysis', 'Portfolio Management'],
        experience: 10,
        rating: 4.8,
        totalStudents: 5000,
      },
      thumbnail: '/images/courses/stock-market-basics.jpg',
      tags: ['stock-market', 'investing', 'trading', 'finance'],
      rating: 4.5,
      totalRatings: 245,
      enrollmentCount: 1250,
      isPublished: true,
      prerequisites: ['Basic mathematics knowledge'],
      learningObjectives: [
        'Understand stock market fundamentals',
        'Learn basic technical analysis',
        'Develop investment strategies',
        'Manage portfolio risk',
      ],
      modules: [
        {
          id: 'module1',
          title: 'Market Basics',
          description: 'Introduction to stock markets',
          order: 1,
          lessons: [
            {
              id: 'lesson1',
              title: 'What is Stock Market?',
              description: 'Understanding the basics',
              type: 'video',
              duration: 30,
              content: {
                videoUrl: '/videos/what-is-stock-market.mp4',
              },
              order: 1,
              resources: [
                {
                  id: 'resource1',
                  title: 'Stock Market Glossary',
                  type: 'pdf',
                  url: '/resources/glossary.pdf',
                  description: 'Important terms and definitions',
                },
              ],
            },
          ],
          quizzes: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async searchCourses(filters: CourseSearchFilters, page = 1, limit = 20): Promise<SearchResult> {
    const courses = [await this.getCourse('course1')];
    
    return {
      courses,
      totalCount: 1,
      currentPage: page,
      totalPages: 1,
      filters,
    };
  }

  async getFeaturedCourses(): Promise<Course[]> {
    return [await this.getCourse('course1')];
  }

  async getCourseCategories(): Promise<string[]> {
    return ['Finance', 'Technology', 'Marketing', 'Business', 'Health', 'Personal Development'];
  }
}

export default CourseContentService;