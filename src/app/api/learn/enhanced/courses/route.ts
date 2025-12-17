import { NextRequest, NextResponse } from 'next/server';

// Enhanced course
interface EnhancedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  module: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  topics: string[];
  isEnrolled: boolean;
  progress: number;
  xpReward: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  color: string;
  filePath: string;
  // Enhanced features
  moduleNumber?: number;
  hasAssessments: boolean;
  hasExercises: boolean;
  hasCaseStudies: boolean;
  hasCalculators: boolean;
  interactiveLessons: number;
  totalInteractiveFeatures: number;
  lastAccessed?: string;
  nextMilestone?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: number[];
  unlocksAt?: number;
}

// Mock user progress data
const mockUserProgress = {
  'demo-user-id': {
    enrolledCourses: ['banking-insurance', 'module-17', 'module-Lessons18'],
    completed: ['lesson-1', 'lesson-2'],
    progress: {
      'banking-insurance': 65,
      'module-17': 30,
      'module-18': 10
    },
    xp: 2500,
    level: 5,
    streak: 7
  }
};

// Enhanced courses database
const enhancedCourses: EnhancedCourse[] = [
  {
    id: 'banking-insurance',
    title: 'Banking & Insurance Fundamentals',
    description: 'Master the basics of banking products, life insurance, and risk management',
    category: 'foundations',
    module: 'Banking & Insurance',
    level: 'beginner',
    duration: '6 hours',
    lessons: 10,
    topics: [
      'Banking Products Overview',
      'Life Insurance Fundamentals',
      'Health Insurance Planning',
      'Risk Assessment & Mitigation',
      'Insurance Claims Process'
    ],
    isEnrolled: true,
    progress: 65,
    xpReward: 600,
    importance: 'high',
    icon: 'Shield',
    color: 'bg-blue-100 text-blue-600',
    filePath: '/courses/banking-insurance/',
    moduleNumber: 17,
    hasAssessments: true,
    hasExercises: true,
    hasCaseStudies: true,
    hasCalculators: true,
    interactiveLessons: 6,
    totalInteractiveFeatures: 4,
    lastAccessed: '2 days ago',
    nextMilestone: 'Complete Module 17 Assessment',
    difficulty: 'intermediate',
    prerequisites: [1, 2, 3]
  },
  {
    id: 'module-17',
    title: 'Insurance & Risk Management',
    description: 'Comprehensive coverage of insurance planning and risk mitigation strategies',
    category: 'protection',
    module: 'Insurance Planning',
    level: 'intermediate',
    duration: '8 hours',
    lessons: 12,
    topics: [
      'Life Insurance Coverage Calculation',
      'Health Insurance Strategy',
      'Risk Profiling & Assessment',
      'Insurance Riders & Add-ons',
      'Claims Management'
    ],
    isEnrolled: true,
    progress: 30,
    xpReward: 800,
    importance: 'critical',
    icon: 'Shield',
    color: 'bg-purple-100 text-purple-600',
    filePath: '/courses/module-17-insurance/',
    moduleNumber: 17,
    hasAssessments: true,
    hasExercises: true,
    hasCaseStudies: true,
    hasCalculators: true,
    interactiveLessons: 8,
    totalInteractiveFeatures: 4,
    lastAccessed: '1 day ago',
    nextMilestone: '3 lessons remaining',
    difficulty: 'intermediate',
    prerequisites: [1, 2, 3]
  },
  {
    id: 'module-18',
    title: 'Tax Planning & Investment',
    description: 'Optimize taxes while building wealth through strategic investments',
    category: 'tax_optimization',
    module: 'Tax Planning',
    level: 'intermediate',
    duration: '7 hours',
    lessons: 10,
    topics: [
      'Section 80C Investment Options',
      'ELSS Fund Strategy',
      'Tax-Efficient Investing',
      'Capital Gains Planning',
      'Advanced Tax Strategies'
    ],
    isEnrolled: true,
    progress: 10,
    xpReward: 700,
    importance: 'high',
    icon: 'Calculator',
    color: 'bg-orange-100 text-orange-600',
    filePath: '/courses/module-18-tax-planning/',
    moduleNumber: 18,
    hasAssessments: true,
    hasExercises: true,
    hasCaseStudies: true,
    hasCalculators: true,
    interactiveLessons: 7,
    totalInteractiveFeatures: 4,
    lastAccessed: '3 days ago',
    nextMilestone: '9 lessons remaining',
    difficulty: 'intermediate',
    prerequisites: [17]
  },
  {
    id: 'module-19',
    title: 'Goal-Based Investment Planning',
    description: 'Create systematic investment plans for achieving life goals',
    category: 'strategic_planning',
    module: 'Goal Planning',
    level: 'intermediate',
    duration: '9 hours',
    lessons: 14,
    topics: [
      'Financial Goal Setting',
      'SIP Planning & Execution',
      'Goal Prioritization',
      'Multiple Goal Management',
      'Milestone Tracking'
    ],
    isEnrolled: false,
    progress: 0,
    xpReward: 900,
    importance: 'high',
    icon: 'Target',
    color: 'bg-teal-100 text-teal-600',
    filePath: '/courses/module-19-goal-planning/',
    moduleNumber: 19,
    hasAssessments: true,
    hasExercises: true,
    hasCaseStudies: true,
    hasCalculators: true,
    interactiveLessons: 10,
    totalInteractiveFeatures: 4,
    lastAccessed: 'Never',
    nextMilestone: 'Start course to begin',
    difficulty: 'intermediate',
    prerequisites: [17, 18]
  },
  {
    id: 'module-20',
    title: 'Retirement Planning Mastery',
    description: 'Advanced retirement corpus planning and optimization strategies',
    category: 'long_term_planning',
    module: 'Retirement Planning',
    level: 'advanced',
    duration: '10 hours',
    lessons: 15,
    topics: [
      'Retirement Corpus Calculation',
      'Asset Allocation for Retirement',
      'Withdrawal Strategies',
      'Inflation Adjustment',
      'Healthcare Planning'
    ],
    isEnrolled: false,
    progress: 0,
    xpReward: 1000,
    importance: 'high',
    icon: 'Clock',
    color: 'bg-indigo-100 text-indigo-600',
    filePath: '/courses/module-20-retirement/',
    moduleNumber: 20,
    hasAssessments: true,
    hasExercises: true,
    hasCaseStudies: true,
    hasCalculators: true,
    interactiveLessons: 12,
    totalInteractiveFeatures: 4,
    lastAccessed: 'Never',
    nextMilestone: 'Complete Module 19 first',
    difficulty: 'advanced',
    prerequisites: [17, 18, 19]
  },
  {
    id: 'module-01',
    title: 'Money Basics & Fundamentals',
    description: 'Learn the fundamentals of money, budgeting, and basic financial concepts',
    category: 'foundations',
    module: 'Financial Basics',
    level: 'beginner',
    duration: '4 hours',
    lessons: 10,
    topics: [
      'What is Money and How it Works',
      'Income vs Expenses',
      'Saving vs Investing',
      'Inflation Explained',
      'Time Value of Money'
    ],
    isEnrolled: true,
    progress: 100,
    xpReward: 400,
    importance: 'critical',
    icon: 'BookOpen',
    color: 'bg-green-100 text-green-600',
    filePath: '/courses/module-01-money-basics/',
    moduleNumber: 1,
    hasAssessments: false,
    hasExercises: true,
    hasCaseStudies: false,
    hasCalculators: false,
    interactiveLessons: 3,
    totalInteractiveFeatures: 1,
    lastAccessed: '1 week ago',
    nextMilestone: 'Course completed!',
    difficulty: 'beginner'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user-id';
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const enrolledOnly = searchParams.get('enrolled') === 'true';
    
    // Get user progress
    const userProgress = mockUserProgress[userId] || {
      enrolledCourses: [],
      completedLessons: [],
      progress: {},
      xp: 0,
      level: 1,
      streak: 0
    };
    
    // Filter courses based on parameters
    let filteredCourses = [...enhancedCourses];
    
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    
    if (level) {
      filteredCourses = filteredCourses.filter(course => course.difficulty === level);
    }
    
    if (enrolledOnly) {
      filteredCourses = filteredCourses.filter(course => course.isEnrolled);
    }
    
    // Update course enrollment status based on user progress
    filteredCourses = filteredCourses.map(course => ({
      ...course,
      isEnrolled: userProgress.enrolledCourses.includes(course.id),
      progress: userProgress.progress[course.id] || course.progress
    }));
    
    // Calculate learning statistics
    const learningStats = {
      totalXp: userProgress.xp,
      currentLevel: userProgress.level,
      nextLevelXp: (userProgress.level * 500),
      completedCourses: filteredCourses.filter(c => c.progress === 100).length,
      totalCourses: filteredCourses.length,
      streak: userProgress.streak,
      studyTime: 240, // Mock data
      achievements: 18,
      certificates: 3
    };
    
    // Group courses by category for better organization
    const coursesByCategory = filteredCourses.reduce((acc, course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    }, {} as Record<string, EnhancedCourse[]>);
    
    return NextResponse.json({
      success: true,
      data: {
        courses: filteredCourses,
        coursesByCategory,
        learningStats,
        userProgress: {
          enrolledCourses: userProgress.enrolledCourses,
          completedLessons: userProgress.completedLessons,
          progress: userProgress.progress
        },
        enhancedFeatures: {
          availableModules: [17, 18, 19, 20, 21, 22, 23],
          totalInteractiveFeatures: 4,
          calculatorsAvailable: true,
          assessmentsAvailable: true,
          caseStudiesAvailable: true,
          exercisesAvailable: true
        }
      }
    });
  } catch (error) {
    console.error('Enhanced courses API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, action } = await request.json();
    
    if (!userId || !courseId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Handle course enrollment
    if (action === 'enroll') {
      // Update mock user progress
      if (!mockUserProgress[userId]) {
        mockUserProgress[userId] = {
          enrolledCourses: [],
          completedLessons: [],
          progress: {},
          xp: 0,
          level: 1,
          streak: 0
        };
      }
      
      if (!mockUserProgress[userId].enrolledCourses.includes(courseId)) {
        mockUserProgress[userId].enrolledCourses.push(courseId);
        mockUserProgress[userId].progress[courseId] = 0;
      }
      
      return NextResponse.json({
        success: true,
        data: {
          enrolled: true,
          message: 'Successfully enrolled in course'
        }
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Enhanced courses enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}