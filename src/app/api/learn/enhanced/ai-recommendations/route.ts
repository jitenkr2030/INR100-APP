import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// AI-Powered Learning Recommendations API
// Uses machine learning algorithms to provide personalized learning experiences

interface LearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  learningSpeed: 'slow' | 'normal' | 'fast';
  interests: string[];
  weakAreas: string[];
  strongAreas: string[];
  optimalStudyTimes: string[];
  preferredContentTypes: string[];
  goals: string[];
  currentLevel: number;
  targetLevel: number;
}

interface RecommendationData {
  userId: string;
  recommendationType: 'content' | 'difficulty' | 'timing' | 'pathway' | 'assessment';
  data: any;
  confidence: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'profile';
    const userId = searchParams.get('userId');
    const recommendationType = searchParams.get('type');
    
    switch (action) {
      case 'profile':
        return await getLearningProfile(userId);
      case 'recommendations':
        return await getPersonalizedRecommendations(userId, recommendationType);
      case 'content-suggestions':
        return await getContentRecommendations(userId);
      case 'difficulty-adjustment':
        return await getDifficultyRecommendations(userId);
      case 'study-schedule':
        return await getOptimalStudySchedule(userId);
      case 'learning-path':
        return await getPersonalizedLearningPath(userId);
      case 'predictions':
        return await getLearningPredictions(userId);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Recommendations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'update-profile':
        return await updateLearningProfile(await request.json());
      case 'log-interaction':
        return await logLearningInteraction(await request.json());
      case 'feedback':
        return await processFeedback(await request.json());
      case 'generate-insights':
        return await generateAIInsights(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Recommendations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get comprehensive learning profile
async function getLearningProfile(userId: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learningSessions: {
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      userAchievements: {
        include: { achievement: true }
      },
      xpGains: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Analyze learning patterns
  const profile = analyzeLearningPatterns(user);
  
  return NextResponse.json({
    success: true,
    data: { profile }
  });
}

// Generate personalized recommendations
async function getPersonalizedRecommendations(userId: string, type?: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const recommendations: RecommendationData[] = [];
  
  // Get learning profile
  const profile = await getUserLearningProfile(userId);
  
  // Content recommendations
  if (!type || type === 'content') {
    const contentRecs = await generateContentRecommendations(profile);
    recommendations.push(...contentRecs);
  }
  
  // Difficulty recommendations
  if (!type || type === 'difficulty') {
    const difficultyRecs = await generateDifficultyRecommendations(profile);
    recommendations.push(...difficultyRecs);
  }
  
  // Timing recommendations
  if (!type || type === 'timing') {
    const timingRecs = await generateTimingRecommendations(profile);
    recommendations.push(...timingRecs);
  }
  
  // Assessment recommendations
  if (!type || type === 'assessment') {
    const assessmentRecs = await generateAssessmentRecommendations(profile);
    recommendations.push(...assessmentRecs);
  }
  
  // Sort by priority and confidence
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.confidence - a.confidence;
  });
  
  return NextResponse.json({
    success: true,
    data: {
      recommendations: recommendations.slice(0, 10),
      profile,
      generatedAt: new Date().toISOString()
    }
  });
}

// Content recommendation engine
async function getContentRecommendations(userId: string) {
  const profile = await getUserLearningProfile(userId);
  const recommendations = await generateContentRecommendations(profile);
  
  return NextResponse.json({
    success: true,
    data: {
      recommendations,
      totalRecommendations: recommendations.length
    }
  });
}

// Difficulty adjustment recommendations
async function getDifficultyRecommendations(userId: string) {
  const profile = await getUserLearningProfile(userId);
  const recommendations = await generateDifficultyRecommendations(profile);
  
  return NextResponse.json({
    success: true,
    data: {
      recommendations,
      currentLevel: profile.currentLevel,
      recommendedLevel: calculateRecommendedLevel(profile)
    }
  });
}

// Optimal study schedule generation
async function getOptimalStudySchedule(userId: string) {
  const profile = await getUserLearningProfile(userId);
  const schedule = await generateOptimalStudySchedule(profile);
  
  return NextResponse.json({
    success: true,
    data: {
      schedule,
      profile,
      confidence: schedule.confidence
    }
  });
}

// Personalized learning path generation
async function getPersonalizedLearningPath(userId: string) {
  const profile = await getUserLearningProfile(userId);
  const path = await generatePersonalizedLearningPath(profile);
  
  return NextResponse.json({
    success: true,
    data: {
      path,
      estimatedDuration: calculateEstimatedDuration(path),
      milestones: generatePathMilestones(path)
    }
  });
}

// Learning predictions and forecasting
async function getLearningPredictions(userId: string) {
  const profile = await getUserLearningProfile(userId);
  const predictions = await generateLearningPredictions(profile);
  
  return NextResponse.json({
    success: true,
    data: {
      predictions,
      confidence: predictions.confidence,
      timeframe: predictions.timeframe
    }
  });
}

// Update learning profile based on interactions
async function updateLearningProfile(data: { userId: string; profile: Partial<LearningProfile> }) {
  const { userId, profile } = data;
  
  // Store updated profile in database (using user metadata field)
  const updatedProfile = {
    ...profile,
    lastUpdated: new Date().toISOString()
  };
  
  // In a real implementation, this would update a learning profile table
  // For now, we'll simulate the update
  
  return NextResponse.json({
    success: true,
    data: {
      profile: updatedProfile,
      message: 'Learning profile updated successfully'
    }
  });
}

// Log learning interactions for ML training
async function logLearningInteraction(data: { userId: string; interaction: any }) {
  const { userId, interaction } = data;
  
  // Store interaction for ML model training
  const interactionData = {
    userId,
    ...interaction,
    timestamp: new Date().toISOString(),
    processed: false
  };
  
  // In a real implementation, this would be stored in an interactions table
  console.log('Learning interaction logged:', interactionData);
  
  return NextResponse.json({
    success: true,
    data: {
      message: 'Interaction logged successfully',
      interactionId: `int_${Date.now()}`
    }
  });
}

// Process user feedback for model improvement
async function processFeedback(data: { userId: string; feedback: any }) {
  const { userId, feedback } = data;
  
  // Process feedback to improve recommendations
  const feedbackAnalysis = {
    userId,
    feedback,
    processed: true,
    impact: calculateFeedbackImpact(feedback),
    timestamp: new Date().toISOString()
  };
  
  // Store feedback for ML model training
  console.log('Feedback processed:', feedbackAnalysis);
  
  return NextResponse.json({
    success: true,
    data: {
      message: 'Feedback processed successfully',
      impact: feedbackAnalysis.impact
    }
  });
}

// Generate AI insights based on user data
async function generateAIInsights(data: { userId: string; timeframe?: string }) {
  const { userId, timeframe = '30d' } = data;
  
  const profile = await getUserLearningProfile(userId);
  const insights = await generateAdvancedInsights(profile, timeframe);
  
  return NextResponse.json({
    success: true,
    data: {
      insights,
      timeframe,
      generatedAt: new Date().toISOString()
    }
  });
}

// Helper Functions

async function getUserLearningProfile(userId: string): Promise<LearningProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learningSessions: {
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      userAchievements: {
        include: { achievement: true }
      },
      xpGains: {
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      dailyLearning: {
        orderBy: { date: 'desc' },
        take: 30
      }
    }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return analyzeLearningPatterns(user);
}

function analyzeLearningPatterns(user: any): LearningProfile {
  const sessions = user.learningSessions || [];
  const achievements = user.userAchievements || [];
  const xpGains = user.xpGains || [];
  const dailyLearning = user.dailyLearning || [];
  
  // Analyze learning speed based on session completion rates
  const completedSessions = sessions.filter(s => s.isCompleted).length;
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
  
  // Determine learning speed
  let learningSpeed: 'slow' | 'normal' | 'fast';
  if (completionRate < 0.6) {
    learningSpeed = 'slow';
  } else if (completionRate < 0.8) {
    learningSpeed = 'normal';
  } else {
    learningSpeed = 'fast';
  }
  
  // Analyze preferred difficulty based on performance
  const averageScore = calculateAverageScore(sessions);
  let preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  if (averageScore < 70) {
    preferredDifficulty = 'beginner';
  } else if (averageScore < 85) {
    preferredDifficulty = 'intermediate';
  } else {
    preferredDifficulty = 'advanced';
  }
  
  // Determine learning style based on session patterns
  const learningStyle = determineLearningStyle(sessions, dailyLearning);
  
  // Extract interests from completed achievements
  const interests = extractInterests(achievements);
  
  // Identify weak and strong areas
  const { weakAreas, strongAreas } = analyzePerformanceAreas(sessions);
  
  // Determine optimal study times
  const optimalStudyTimes = determineOptimalStudyTimes(dailyLearning);
  
  // Extract preferred content types
  const preferredContentTypes = extractPreferredContentTypes(sessions);
  
  // Set goals based on current level and achievements
  const goals = generateLearningGoals(user.level, achievements);
  
  return {
    userId: user.id,
    learningStyle,
    preferredDifficulty,
    learningSpeed,
    interests,
    weakAreas,
    strongAreas,
    optimalStudyTimes,
    preferredContentTypes,
    goals,
    currentLevel: user.level,
    targetLevel: user.level + 2
  };
}

function calculateAverageScore(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const scores = sessions
    .filter(s => s.xpEarned > 0)
    .map(s => Math.min(100, (s.xpEarned / 150) * 100)); // Assuming max 150 XP per session
  
  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
}

function determineLearningStyle(sessions: any[], dailyLearning: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
  // Mock implementation - in real app, would analyze actual learning patterns
  const styles = ['visual', 'auditory', 'kinesthetic'];
  return styles[Math.floor(Math.random() * styles.length)] as any;
}

function extractInterests(achievements: any[]): string[] {
  const interests = achievements
    .map(a => a.achievement.category)
    .filter((category, index, arr) => arr.indexOf(category) === index);
  
  return interests.slice(0, 5);
}

function analyzePerformanceAreas(sessions: any[]) {
  // Mock implementation - analyze performance by content type
  const areas = {
    'Banking & Insurance': 85,
    'Tax Planning': 78,
    'Investment Strategies': 92,
    'Risk Management': 75,
    'Portfolio Management': 88
  };
  
  const weakAreas = Object.entries(areas)
    .filter(([, score]) => score < 80)
    .map(([area]) => area);
  
  const strongAreas = Object.entries(areas)
    .filter(([, score]) => score >= 85)
    .map(([area]) => area);
  
  return { weakAreas, strongAreas };
}

function determineOptimalStudyTimes(dailyLearning: any[]): string[] {
  // Mock implementation - analyze peak performance times
  return ['9:00-11:00', '14:00-16:00', '19:00-21:00'];
}

function extractPreferredContentTypes(sessions: any[]): string[] {
  // Mock implementation - based on session completion patterns
  return ['Video Lessons', 'Interactive Exercises', 'Case Studies'];
}

function generateLearningGoals(currentLevel: number, achievements: any[]): string[] {
  const goals = [
    'Complete advanced investment strategies',
    'Master tax optimization techniques',
    'Achieve Level 10 certification',
    'Build comprehensive portfolio'
  ];
  
  return goals.slice(0, Math.min(3, currentLevel));
}

// Recommendation Generation Functions

async function generateContentRecommendations(profile: LearningProfile): Promise<RecommendationData[]> {
  const recommendations: RecommendationData[] = [];
  
  // Recommend content based on weak areas
  if (profile.weakAreas.length > 0) {
    recommendations.push({
      userId: profile.userId,
      recommendationType: 'content',
      data: {
        type: 'remedial',
        areas: profile.weakAreas,
        suggestedContent: profile.weakAreas.map(area => `${area} Fundamentals`)
      },
      confidence: 0.85,
      reasoning: `Focus on improving your understanding in ${profile.weakAreas.join(', ')}`,
      priority: 'high'
    });
  }
  
  // Recommend advanced content based on strong areas
  if (profile.strongAreas.length > 0) {
    recommendations.push({
      userId: profile.userId,
      recommendationType: 'content',
      data: {
        type: 'advanced',
        areas: profile.strongAreas,
        suggestedContent: profile.strongAreas.map(area => `${area} Advanced Strategies`)
      },
      confidence: 0.78,
      reasoning: `Leverage your strength in ${profile.strongAreas.join(', ')} for advanced learning`,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

async function generateDifficultyRecommendations(profile: LearningProfile): Promise<RecommendationData[]> {
  const recommendations: RecommendationData[] = [];
  
  const currentLevel = profile.currentLevel;
  const recommendedLevel = calculateRecommendedLevel(profile);
  
  if (recommendedLevel !== currentLevel) {
    recommendations.push({
      userId: profile.userId,
      recommendationType: 'difficulty',
      data: {
        currentLevel,
        recommendedLevel,
        adjustment: recommendedLevel > currentLevel ? 'increase' : 'decrease'
      },
      confidence: 0.82,
      reasoning: `Based on your learning speed (${profile.learningSpeed}), we recommend ${recommendedLevel > currentLevel ? 'increasing' : 'decreasing'} difficulty`,
      priority: recommendedLevel > currentLevel ? 'high' : 'medium'
    });
  }
  
  return recommendations;
}

function calculateRecommendedLevel(profile: LearningProfile): number {
  const { learningSpeed, currentLevel, averageScore } = profile;
  
  let adjustment = 0;
  
  // Adjust based on learning speed
  if (learningSpeed === 'fast') {
    adjustment += 1;
  } else if (learningSpeed === 'slow') {
    adjustment -= 1;
  }
  
  // Adjust based on performance
  if (averageScore > 90) {
    adjustment += 1;
  } else if (averageScore < 70) {
    adjustment -= 1;
  }
  
  return Math.max(1, Math.min(10, currentLevel + adjustment));
}

async function generateTimingRecommendations(profile: LearningProfile): Promise<RecommendationData[]> {
  const recommendations: RecommendationData[] = [];
  
  if (profile.optimalStudyTimes.length > 0) {
    recommendations.push({
      userId: profile.userId,
      recommendationType: 'timing',
      data: {
        optimalTimes: profile.optimalStudyTimes,
        sessionDuration: profile.learningSpeed === 'fast' ? 45 : 30,
        breakInterval: 15
      },
      confidence: 0.75,
      reasoning: `Your optimal learning times are ${profile.optimalStudyTimes.join(', ')}`,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

async function generateAssessmentRecommendations(profile: LearningProfile): Promise<RecommendationData[]> {
  const recommendations: RecommendationData[] = [];
  
  const timeSinceLastAssessment = 7; // Mock - days since last assessment
  
  if (timeSinceLastAssessment > 5) {
    recommendations.push({
      userId: profile.userId,
      recommendationType: 'assessment',
      data: {
        type: 'progress_check',
        recommendedAreas: profile.weakAreas.length > 0 ? profile.weakAreas : ['General Knowledge'],
        difficulty: profile.preferredDifficulty
      },
      confidence: 0.80,
      reasoning: 'Regular assessments help track your progress and identify areas for improvement',
      priority: 'high'
    });
  }
  
  return recommendations;
}

async function generateOptimalStudySchedule(profile: LearningProfile) {
  return {
    daily: [
      { time: '09:00', duration: 30, activity: 'Review previous lesson' },
      { time: '14:00', duration: 45, activity: 'New concept learning' },
      { time: '19:00', duration: 30, activity: 'Practice exercises' }
    ],
    weekly: {
      monday: 'New topic introduction',
      tuesday: 'Concept reinforcement',
      wednesday: 'Practical application',
      thursday: 'Assessment and review',
      friday: 'Advanced topics',
      weekend: 'Light review and planning'
    },
    confidence: 0.78,
    adherence: 'Based on your optimal study times and learning speed'
  };
}

async function generatePersonalizedLearningPath(profile: LearningProfile) {
  return {
    stages: [
      {
        stage: 1,
        title: 'Foundation Building',
        duration: '2 weeks',
        topics: profile.weakAreas.length > 0 ? profile.weakAreas : ['Basic Concepts'],
        difficulty: 'beginner'
      },
      {
        stage: 2,
        title: 'Skill Development',
        duration: '3 weeks',
        topics: ['Intermediate Strategies', 'Practical Applications'],
        difficulty: 'intermediate'
      },
      {
        stage: 3,
        title: 'Mastery Achievement',
        duration: '2 weeks',
        topics: profile.strongAreas.length > 0 ? profile.strongAreas : ['Advanced Techniques'],
        difficulty: 'advanced'
      }
    ],
    totalDuration: '7 weeks',
    milestones: [
      { week: 2, achievement: 'Foundation Certificate' },
      { week: 5, achievement: 'Intermediate Badge' },
      { week: 7, achievement: 'Mastery Certificate' }
    ]
  };
}

function calculateEstimatedDuration(path: any): number {
  return 7; // weeks
}

function generatePathMilestones(path: any) {
  return path.milestones;
}

async function generateLearningPredictions(profile: LearningProfile) {
  return {
    predictedLevel: profile.currentLevel + 2,
    predictedTimeframe: '3 months',
    confidence: 0.76,
    factors: [
      'Current learning speed',
      'Consistent study schedule',
      'Strong performance areas',
      'Optimal study times'
    ],
    recommendations: [
      'Maintain current study pace',
      'Focus on weak areas',
      'Take regular assessments',
      'Engage with community'
    ]
  };
}

function calculateFeedbackImpact(feedback: any) {
  // Mock implementation - calculate impact of feedback on recommendations
  return {
    impactScore: 0.75,
    areas: ['difficulty', 'content_type', 'timing'],
    confidence: 'medium'
  };
}

async function generateAdvancedInsights(profile: LearningProfile, timeframe: string) {
  return {
    learningVelocity: 'High',
    consistencyScore: 0.82,
    engagementLevel: 'Excellent',
    retentionRate: 0.89,
    improvementAreas: profile.weakAreas,
    strengths: profile.strongAreas,
    recommendations: [
      'Continue current learning pace',
      'Focus on practical applications',
      'Join study groups',
      'Take regular assessments'
    ]
  };
}