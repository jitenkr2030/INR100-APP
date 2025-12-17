import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Advanced AI Recommendation Engine
interface UserProfile {
  id: string;
  learningHistory: LearningRecord[];
  preferences: UserPreferences;
  performance: PerformanceMetrics;
  goals: LearningGoal[];
}

interface LearningRecord {
  lessonId: string;
  completedAt: Date;
  score: number;
  timeSpent: number;
  difficulty: string;
  tags: string[];
}

interface UserPreferences {
  preferredDuration: number;
  preferredDifficulty: string;
  preferredTopics: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  timePreference: 'morning' | 'afternoon' | 'evening' | 'any';
}

interface PerformanceMetrics {
  averageScore: number;
  completionRate: number;
  consistencyScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
}

interface LearningGoal {
  id: string;
  type: 'skill' | 'certification' | 'career';
  target: string;
  timeframe: number; // days
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100
}

// Machine Learning Algorithms
class RecommendationEngine {
  
  // Collaborative Filtering Algorithm
  async collaborativeFiltering(userId: string): Promise<string[]> {
    // Find users with similar learning patterns
    const similarUsers = await this.findSimilarUsers(userId);
    
    // Get lessons that similar users completed successfully
    const recommendedLessons = await this.getLessonsFromSimilarUsers(similarUsers);
    
    return recommendedLessons;
  }
  
  // Content-Based Filtering Algorithm  
  async contentBasedFiltering(userProfile: UserProfile): Promise<string[]> {
    // Analyze user's completed lessons and preferences
    const userTopics = this.extractUserTopics(userProfile);
    
    // Find lessons matching user preferences
    const recommendedLessons = await this.getContentBasedRecommendations(userTopics, userProfile.preferences);
    
    return recommendedLessons;
  }
  
  // Hybrid Recommendation Algorithm
  async hybridRecommendations(userProfile: UserProfile): Promise<RecommendationResult[]> {
    const [collaborative, contentBased, trending] = await Promise.all([
      this.collaborativeFiltering(userProfile.id),
      this.contentBasedFiltering(userProfile), 
      this.getTrendingLessons()
    ]);
    
    // Combine recommendations with weights
    const hybridRecommendations = this.combineRecommendations(
      collaborative, 
      contentBased, 
      trending, 
      userProfile
    );
    
    return hybridRecommendations;
  }
  
  // Personal Learning Path Generation
  async generateLearningPath(userProfile: UserProfile, targetSkills: string[]): Promise<LearningPath> {
    const currentLevel = this.assessCurrentLevel(userProfile);
    const targetLevel = this.determineTargetLevel(targetSkills);
    
    // Generate optimal sequence
    const path = await this.createOptimalSequence(currentLevel, targetLevel, userProfile);
    
    return {
      id: `path-${Date.now()}`,
      userId: userProfile.id,
      title: `Learning Path: ${targetSkills.join(', ')}`,
      lessons: path.lessons,
      estimatedDuration: path.totalDuration,
      difficulty: path.difficulty,
      prerequisites: path.prerequisites,
      milestones: path.milestones,
      adaptive: true,
      createdAt: new Date(),
      estimatedCompletion: new Date(Date.now() + path.totalDuration * 24 * 60 * 60 * 1000)
    };
  }
  
  // Performance Prediction
  async predictPerformance(userId: string, lessonId: string): Promise<PerformancePrediction> {
    const userHistory = await this.getUserLearningHistory(userId);
    const lessonData = await this.getLessonData(lessonId);
    
    // AI model prediction based on similar users and content
    const prediction = await this.mlPrediction(userHistory, lessonData);
    
    return {
      predictedScore: prediction.score,
      predictedTime: prediction.time,
      confidence: prediction.confidence,
      factors: prediction.factors,
      recommendations: prediction.recommendations
    };
  }
  
  // Adaptive Difficulty Adjustment
  async adjustDifficulty(userId: string, currentLessonId: string): Promise<DifficultyAdjustment> {
    const userPerformance = await this.analyzeRecentPerformance(userId);
    const lessonDifficulty = await this.getLessonDifficulty(currentLessonId);
    
    const adjustment = {
      currentDifficulty: lessonDifficulty,
      recommendedDifficulty: this.calculateOptimalDifficulty(userPerformance, lessonDifficulty),
      reason: this.getAdjustmentReason(userPerformance, lessonDifficulty),
      nextLessonSuggestions: await this.getDifficultyAdjustedLessons(userPerformance, lessonDifficulty)
    };
    
    return adjustment;
  }
  
  // Helper Methods
  private async findSimilarUsers(userId: string): Promise<string[]> {
    // Implementation of user similarity calculation
    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      include: {
        learningRecords: true
      }
    });
    
    // Calculate similarity scores
    const similarities = users.map(user => ({
      userId: user.id,
      similarity: this.calculateSimilarity(userId, user.id)
    }));
    
    // Return top similar users
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map(s => s.userId);
  }
  
  private calculateSimilarity(user1Id: string, user2Id: string): number {
    // Jaccard similarity for learning patterns
    const user1Lessons = new Set(); // Get from database
    const user2Lessons = new Set(); // Get from database
    
    const intersection = new Set([...user1Lessons].filter(x => user2Lessons.has(x)));
    const union = new Set([...user1Lessons, ...user2Lessons]);
    
    return intersection.size / union.size;
  }
  
  private extractUserTopics(userProfile: UserProfile): string[] {
    const topics = new Set<string>();
    
    userProfile.learningHistory.forEach(record => {
      record.tags.forEach(tag => topics.add(tag));
    });
    
    userProfile.preferences.preferredTopics.forEach(topic => {
      topics.add(topic);
    });
    
    return Array.from(topics);
  }
  
  private async getContentBasedRecommendations(topics: string[], preferences: UserPreferences): Promise<string[]> {
    // Find lessons matching user's topic preferences and difficulty
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: topics.map(topic => ({
          tags: {
            has: topic
          }
        })),
        difficulty: preferences.preferredDifficulty
      },
      take: 20
    });
    
    return lessons.map(lesson => lesson.id);
  }
  
  private combineRecommendations(
    collaborative: string[], 
    contentBased: string[], 
    trending: string[], 
    userProfile: UserProfile
  ): RecommendationResult[] {
    const combined = new Map<string, { score: number; reasons: string[] }>();
    
    // Collaborative filtering weight: 30%
    collaborative.forEach((lessonId, index) => {
      const score = (collaborative.length - index) / collaborative.length * 0.3;
      combined.set(lessonId, { score, reasons: ['similar users'] });
    });
    
    // Content-based weight: 50%
    contentBased.forEach((lessonId, index) => {
      const score = (contentBased.length - index) / contentBased.length * 0.5;
      const existing = combined.get(lessonId);
      if (existing) {
        existing.score += score;
        existing.reasons.push('content match');
      } else {
        combined.set(lessonId, { score, reasons: ['content match'] });
      }
    });
    
    // Trending weight: 20%
    trending.forEach((lessonId, index) => {
      const score = (trending.length - index) / trending.length * 0.2;
      const existing = combined.get(lessonId);
      if (existing) {
        existing.score += score;
        existing.reasons.push('trending');
      } else {
        combined.set(lessonId, { score, reasons: ['trending'] });
      }
    });
    
    return Array.from(combined.entries())
      .map(([lessonId, data]) => ({
        lessonId,
        score: data.score,
        reasons: data.reasons,
        confidence: this.calculateConfidence(data.reasons)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
  
  private calculateConfidence(reasons: string[]): number {
    // Higher confidence for multiple recommendation sources
    return Math.min(reasons.length * 0.3 + 0.4, 1.0);
  }
  
  private assessCurrentLevel(userProfile: UserProfile): string {
    const avgScore = userProfile.performance.averageScore;
    const completedLessons = userProfile.learningHistory.length;
    
    if (avgScore >= 85 && completedLessons >= 50) return 'advanced';
    if (avgScore >= 70 && completedLessons >= 25) return 'intermediate';
    return 'beginner';
  }
  
  private determineTargetLevel(targetSkills: string[]): string {
    // Logic to determine target level based on skills
    if (targetSkills.some(skill => ['derivatives', 'quantitative', 'professional'].includes(skill))) {
      return 'advanced';
    }
    if (targetSkills.some(skill => ['analysis', 'portfolio', 'mutual funds'].includes(skill))) {
      return 'intermediate';
    }
    return 'beginner';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'hybrid';
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const recommendationEngine = new RecommendationEngine();
    
    // Get user profile
    const userProfile = await getUserProfile(userId);
    
    let recommendations;
    switch (type) {
      case 'collaborative':
        recommendations = await recommendationEngine.collaborativeFiltering(userId);
        break;
      case 'content':
        recommendations = await recommendationEngine.contentBasedFiltering(userProfile);
        break;
      case 'learning-path':
        const targetSkills = searchParams.get('targetSkills')?.split(',') || [];
        recommendations = await recommendationEngine.generateLearningPath(userProfile, targetSkills);
        break;
      case 'performance-prediction':
        const lessonId = searchParams.get('lessonId');
        if (!lessonId) {
          return NextResponse.json(
            { success: false, error: 'Lesson ID is required for performance prediction' },
            { status: 400 }
          );
        }
        recommendations = await recommendationEngine.predictPerformance(userId, lessonId);
        break;
      default:
        recommendations = await recommendationEngine.hybridRecommendations(userProfile);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        type,
        generatedAt: new Date(),
        userProfile: {
          currentLevel: recommendationEngine['assessCurrentLevel'](userProfile),
          preferences: userProfile.preferences
        }
      }
    });
    
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation to fetch user profile from database
  // This would integrate with your existing user and learning data
  return {
    id: userId,
    learningHistory: [],
    preferences: {
      preferredDuration: 20,
      preferredDifficulty: 'intermediate',
      preferredTopics: ['investing', 'mutual funds'],
      learningStyle: 'visual',
      timePreference: 'any'
    },
    performance: {
      averageScore: 75,
      completionRate: 80,
      consistencyScore: 85,
      strengthAreas: ['investing'],
      improvementAreas: ['analysis']
    },
    goals: []
  };
}

// POST /api/ai-recommendations - Submit feedback on recommendations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recommendationId, feedback, action } = body;
    
    // Store feedback for ML model improvement
    await prisma.recommendationFeedback.create({
      data: {
        userId,
        recommendationId,
        feedback,
        action,
        timestamp: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
    
  } catch (error) {
    console.error('Feedback Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}