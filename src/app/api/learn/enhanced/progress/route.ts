import { NextRequest, NextResponse } from 'next/server';

interface EnhancedProgressData {
  userId: string;
  courseId: string;
  lessonId?: string;
  moduleId?: number;
  action: 'start_lesson' | 'complete_lesson' | 'start_assessment' | 'complete_assessment' | 'complete_exercise' | 'complete_case_study' | 'use_interactive_feature';
  timeSpent?: number;
  interactiveFeatures?: {
    calculatorUsed?: boolean;
    caseStudyCompleted?: boolean;
    assessmentTaken?: boolean;
    exerciseCompleted?: boolean;
  };
  score?: number;
  percentage?: number;
  data?: any;
}

// Enhanced XP calculation function
function calculateEnhancedXP(action: string, features: any[] = [], score?: number): number {
  let baseXP = 0;
  
  switch (action) {
    case 'complete_lesson':
      baseXP = 100;
      break;
    case 'complete_assessment':
      baseXP = 150;
      break;
    case 'complete_exercise':
      baseXP = 75;
      break;
    case 'complete_case_study':
      baseXP = 125;
      break;
    case 'use_interactive_feature':
      baseXP = 25;
      break;
    default:
      baseXP = 50;
  }
  
  // Bonus XP for using interactive features
  const featureBonus = features.length * 25;
  
  // Performance bonus for assessments
  let performanceBonus = 0;
  if (score !== undefined && score >= 90) {
    performanceBonus = 50; // Excellent performance
  } else if (score >= 75) {
    performanceBonus = 25; // Good performance
  }
  
  return baseXP + featureBonus + performanceBonus;
}

// Mock database - in production, this would be actual database operations
const mockProgressData = new Map();

export async function POST(request: NextRequest) {
  try {
    const progressData: EnhancedProgressData = await request.json();
    const { userId, courseId, lessonId, action, timeSpent, interactiveFeatures, score, percentage } = progressData;
    
    // Validate required fields
    if (!userId || !courseId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, courseId, action' },
        { status: 400 }
      );
    }
    
    // Calculate enhanced XP
    const features = [];
    if (interactiveFeatures?.calculatorUsed) features.push('calculator');
    if (interactiveFeatures?.caseStudyCompleted) features.push('case_study');
    if (interactiveFeatures?.assessmentTaken) features.push('assessment');
    if (interactiveFeatures?.exerciseCompleted) features.push('exercise');
    
    const xpEarned = calculateEnhancedXP(action, features, score);
    
    // Create progress record
    const progressRecord = {
      id: `${userId}_${courseId}_${lessonId || 'module'}_${Date.now()}`,
      userId,
      courseId,
      lessonId,
      moduleId: progressData.moduleId,
      action,
      timeSpent: timeSpent || 0,
      interactiveFeatures: interactiveFeatures || {},
      score,
      percentage,
      xpEarned,
      completedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Store in mock database (replace with actual database)
    const userProgressKey = `${userId}_${courseId}`;
    const existingProgress = mockProgressData.get(userProgressKey) || [];
    existingProgress.push(progressRecord);
    mockProgressData.set(userProgressKey, existingProgress);
    
    // Generate certificate for module completion
    const certificateGenerated = action === 'complete_assessment' && percentage >= 70;
    
    // Response data
    const responseData = {
      success: true,
      data: {
        progressId: progressRecord.id,
        xpEarned,
        certificateGenerated,
        levelUp: false, // Calculate based on user's total XP
        achievements: generateAchievements(progressData, xpEarned),
        nextMilestone: getNextMilestone(userId, courseId, xpEarned),
        progress: calculateProgress(userId, courseId)
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Enhanced progress tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    // Get progress data from mock database
    const userProgressKey = `${userId}_${courseId}`;
    const progressData = mockProgressData.get(userProgressKey) || [];
    
    // Filter by module if specified
    const filteredData = moduleId 
      ? progressData.filter((record: any) => record.moduleId === parseInt(moduleId))
      : progressData;
    
    // Calculate summary statistics
    const summary = {
      totalXpEarned: filteredData.reduce((sum: number, record: any) => sum + record.xpEarned, 0),
      totalTimeSpent: filteredData.reduce((sum: number, record: any) => sum + record.timeSpent, 0),
      assessmentsCompleted: filteredData.filter((r: any) => r.action === 'complete_assessment').length,
      exercisesCompleted: filteredData.filter((r: any) => r.action === 'complete_exercise').length,
      caseStudiesCompleted: filteredData.filter((r: any) => r.action === 'complete_case_study').length,
      lessonsCompleted: filteredData.filter((r: any) => r.action === 'complete_lesson').length,
      averageScore: filteredData.filter((r: any) => r.score !== undefined).reduce((sum: number, record: any, _, arr) => {
        return sum + record.score / arr.length;
      }, 0),
      lastActivity: filteredData.length > 0 ? Math.max(...filteredData.map((r: any) => r.timestamp)) : null
    };
    
    return NextResponse.json({
      success: true,
      data: {
        progress: filteredData,
        summary,
        userId,
        courseId,
        moduleId: moduleId ? parseInt(moduleId) : null
      }
    });
  } catch (error) {
    console.error('Enhanced progress retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAchievements(progressData: EnhancedProgressData, xpEarned: number): string[] {
  const achievements = [];
  
  if (xpEarned >= 200) {
    achievements.push('High Performer');
  }
  
  if (progressData.interactiveFeatures?.calculatorUsed) {
    achievements.push('Calculator Master');
  }
  
  if (progressData.interactiveFeatures?.caseStudyCompleted) {
    achievements.push('Case Study Expert');
  }
  
  if (progressData.score && progressData.score >= 90) {
    achievements.push('Perfect Score');
  }
  
  return achievements;
}

function getNextMilestone(userId: string, courseId: string, currentXp: number): string {
  const milestones = [
    { xp: 500, title: 'Learning Enthusiast' },
    { xp: 1000, title: 'Knowledge Seeker' },
    { xp: 2000, title: 'Finance Expert' },
    { xp: 5000, title: 'Investment Guru' }
  ];
  
  const nextMilestone = milestones.find(m => m.xp > currentXp);
  return nextMilestone ? `${nextMilestone.xp - currentXp} XP to ${nextMilestone.title}` : 'Max level reached!';
}

function calculateProgress(userId: string, courseId: string): number {
  // Mock progress calculation - in real app, this would check against course structure
  const userProgressKey = `${userId}_${courseId}`;
  const progressData = mockProgressData.get(userProgressKey) || [];
  
  const completedItems = progressData.filter((r: any) => 
    r.action === 'complete_lesson' || 
    r.action === 'complete_assessment' || 
    r.action === 'complete_exercise'
  ).length;
  
  // Assume 20 total items for mock calculation
  const totalItems = 20;
  return Math.min(100, (completedItems / totalItems) * 100);
}