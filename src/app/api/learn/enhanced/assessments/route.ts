import { NextRequest, NextResponse } from 'next/server';

// Assessment question interfaces
interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'calculation' | 'case_study';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  calculator?: boolean;
  caseStudyId?: string;
  topic: string;
  module: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  moduleId: number;
  timeLimit: number; // minutes
  passingScore: number;
  totalPoints: number;
  questions: AssessmentQuestion[];
  prerequisites?: string[];
  unlocksAt?: number;
  interactiveFeatures: {
    calculators: boolean;
    caseStudies: boolean;
    realTimeFeedback: boolean;
    progressTracking: boolean;
  };
}

// Mock assessment data
const mockAssessments: Assessment[] = [
  {
    id: 'assessment-module-17',
    title: 'Banking & Insurance Fundamentals Assessment',
    description: 'Test your understanding of banking products and insurance planning',
    moduleId: 17,
    timeLimit: 45,
    passingScore: 70,
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is the primary purpose of life insurance?',
        options: [
          'Investment for wealth creation',
          'Protection against financial loss due to death',
          'Tax savings only',
          'Retirement planning'
        ],
        correctAnswer: 'Protection against financial loss due to death',
        explanation: 'Life insurance primarily provides financial protection to dependents in case of the insured\'s death.',
        points: 10,
        difficulty: 'easy',
        topic: 'Life Insurance Fundamentals',
        module: 17
      },
      {
        id: 'q2',
        type: 'calculation',
        question: 'Calculate the annual premium for a term life insurance policy with sum assured of ₹50,00,000, age 30, and premium rate of ₹15 per ₹1000.',
        options: [
          '₹65,000',
          '₹75,000',
          '₹85,000',
          '₹90,000'
        ],
        correctAnswer: 75000,
        explanation: 'Premium = (Sum Assured / 1000) × Premium Rate = (50,00,000 / 1000) × ₹15 = ₹75,000',
        points: 15,
        difficulty: 'medium',
        calculator: true,
        topic: 'Premium Calculation',
        module: 17
      },
      {
        id: 'q3',
        type: 'case_study',
        question: 'Rajesh is 35 years old with a monthly income of ₹75,000. He has a wife and two children. What type of life insurance would you recommend and why?',
        correctAnswer: 'Term Life Insurance + Critical Illness Rider',
        explanation: 'Given his family responsibilities and income level, term life insurance provides maximum coverage at affordable premium. Critical illness rider adds protection against major diseases.',
        points: 20,
        difficulty: 'hard',
        caseStudyId: 'case-rajesh-insurance',
        topic: 'Insurance Planning',
        module: 17
      },
      {
        id: 'q4',
        type: 'true_false',
        question: 'Health insurance premiums are tax-deductible under Section 80D.',
        correctAnswer: 'True',
        explanation: 'Health insurance premiums paid for self, spouse, children, and parents are eligible for deduction under Section 80D (up to ₹25,000 for individuals under 60).',
        points: 10,
        difficulty: 'easy',
        topic: 'Health Insurance Tax Benefits',
        module: 17
      },
      {
        id: 'q5',
        type: 'fill_blank',
        question: 'The maximum amount that can be claimed under Section 80C for life insurance premium is ₹____.',
        correctAnswer: '150000',
        explanation: 'Section 80C allows deduction up to ₹1.5 lakh for various investments including life insurance premiums.',
        points: 10,
        difficulty: 'medium',
        topic: 'Tax Benefits',
        module: 17
      }
    ],
    interactiveFeatures: {
      calculators: true,
      caseStudies: true,
      realTimeFeedback: true,
      progressTracking: true
    }
  },
  {
    id: 'assessment-module-18',
    title: 'Tax Planning & Investment Assessment',
    description: 'Evaluate your knowledge of tax-efficient investing strategies',
    moduleId: 18,
    timeLimit: 60,
    passingScore: 75,
    totalPoints: 150,
    questions: [
      {
        id: 'q6',
        type: 'multiple_choice',
        question: 'Which investment option offers the best tax benefits under Section 80C?',
        options: [
          'Fixed Deposit',
          'ELSS Mutual Funds',
          'PPF',
          'All provide similar benefits'
        ],
        correctAnswer: 'All provide similar benefits',
        explanation: 'All these options qualify for Section 80C deduction up to ₹1.5 lakh. The choice depends on your risk appetite and investment horizon.',
        points: 15,
        difficulty: 'medium',
        topic: 'Section 80C Investments',
        module: 18
      },
      {
        id: 'q7',
        type: 'calculation',
        question: 'If you invest ₹1,00,000 in ELSS funds and earn 12% returns, what will be your corpus after 3 years (ignoring tax implications)?',
        options: [
          '₹1,40,000',
          '₹1,36,000',
          '₹1,32,000',
          '₹1,38,000'
        ],
        correctAnswer: 140492,
        explanation: 'Future Value = ₹1,00,000 × (1.12)³ = ₹1,40,492 (approximately)',
        points: 20,
        difficulty: 'medium',
        calculator: true,
        topic: 'Compound Interest Calculation',
        module: 18
      },
      {
        id: 'q8',
        type: 'case_study',
        question: 'Priya is 28 years old with ₹8,00,000 annual income. She wants to save taxes while building wealth. Create a tax-saving investment plan for her.',
        correctAnswer: 'ELSS ₹75,000 + PPF ₹50,000 + ELSS ₹25,000',
        explanation: 'Diversified approach: ELSS for equity exposure and tax saving, PPF for debt allocation and long-term security.',
        points: 25,
        difficulty: 'hard',
        caseStudyId: 'case-priya-tax-planning',
        topic: 'Tax Planning Strategy',
        module: 18
      }
    ],
    interactiveFeatures: {
      calculators: true,
      caseStudies: true,
      realTimeFeedback: true,
      progressTracking: true
    }
  }
];

// Mock user assessment results
const mockAssessmentResults = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const userId = searchParams.get('userId') || 'demo-user-id';
    
    if (moduleId) {
      // Get specific assessment for module
      const assessment = mockAssessments.find(a => a.moduleId === parseInt(moduleId));
      
      if (!assessment) {
        return NextResponse.json(
          { success: false, error: 'Assessment not found for this module' },
          { status: 404 }
        );
      }
      
      // Get user's previous attempts
      const userAttempts = mockAssessmentResults.get(`${userId}_${assessment.id}`) || [];
      const bestScore = userAttempts.length > 0 
        ? Math.max(...userAttempts.map((attempt: any) => attempt.percentage))
        : 0;
      
      return NextResponse.json({
        success: true,
        data: {
          assessment,
          userProgress: {
            attempts: userAttempts.length,
            bestScore,
            lastAttempt: userAttempts[userAttempts.length - 1]?.completedAt || null,
            canRetake: userAttempts.length === 0 || bestScore < assessment.passingScore
          },
          interactiveFeatures: assessment.interactiveFeatures
        }
      });
    }
    
    // Get all available assessments
    const availableAssessments = mockAssessments.map(assessment => ({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      moduleId: assessment.moduleId,
      timeLimit: assessment.timeLimit,
      passingScore: assessment.passingScore,
      totalPoints: assessment.totalPoints,
      questionsCount: assessment.questions.length,
      hasCalculators: assessment.interactiveFeatures.calculators,
      hasCaseStudies: assessment.interactiveFeatures.caseStudies
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        assessments: availableAssessments,
        totalAssessments: availableAssessments.length,
        modulesWithAssessments: [...new Set(mockAssessments.map(a => a.moduleId))]
      }
    });
  } catch (error) {
    console.error('Assessment retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, assessmentId, answers, timeSpent, startTime } = await request.json();
    
    if (!userId || !assessmentId || !answers) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const assessment = mockAssessments.find(a => a.id === assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }
    
    // Calculate score
    let totalScore = 0;
    let maxScore = 0;
    const detailedResults = [];
    
    assessment.questions.forEach(question => {
      maxScore += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        totalScore += question.points;
      }
      
      detailedResults.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation,
        topic: question.topic
      });
    });
    
    const percentage = (totalScore / maxScore) * 100;
    const passed = percentage >= assessment.passingScore;
    const timeUsed = timeSpent || 0;
    const timeEfficiency = (assessment.timeLimit * 60 - timeUsed) / (assessment.timeLimit * 60);
    
    // Calculate XP based on performance
    let xpEarned = 0;
    if (passed) {
      xpEarned = Math.floor(100 + (percentage - assessment.passingScore));
    }
    
    // Create result record
    const resultRecord = {
      id: `${userId}_${assessmentId}_${Date.now()}`,
      userId,
      assessmentId,
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      timeUsed,
      timeEfficiency: Math.round(timeEfficiency * 100),
      xpEarned,
      completedAt: new Date().toISOString(),
      startTime,
      detailedResults,
      feedback: generateFeedback(percentage, passed, assessment),
      certificateEligible: percentage >= 85
    };
    
    // Store result
    const userResultKey = `${userId}_${assessmentId}`;
    const existingResults = mockAssessmentResults.get(userResultKey) || [];
    existingResults.push(resultRecord);
    mockAssessmentResults.set(userResultKey, existingResults);
    
    // Generate achievements
    const achievements = [];
    if (percentage >= 95) {
      achievements.push('Perfect Score');
    }
    if (timeEfficiency >= 0.8) {
      achievements.push('Time Master');
    }
    if (passed && percentage >= 85) {
      achievements.push('Assessment Champion');
    }
    
    // Next steps recommendations
    const recommendations = [];
    if (!passed) {
      recommendations.push({
        type: 'study',
        message: 'Review the topics where you scored lowest and retake the assessment',
        priority: 'high'
      });
    }
    
    if (assessment.moduleId < 23) {
      recommendations.push({
        type: 'next_module',
        message: `Great job! You're ready to proceed to Module ${assessment.moduleId + 1}`,
        priority: 'medium'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        result: resultRecord,
        achievements,
        recommendations,
        progress: {
          completedAssessments: existingResults.length,
          averageScore: existingResults.reduce((sum, r) => sum + r.percentage, 0) / existingResults.length,
          bestScore: Math.max(...existingResults.map(r => r.percentage))
        }
      }
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate feedback
function generateFeedback(percentage: number, passed: boolean, assessment: Assessment): string {
  if (percentage >= 90) {
    return `Excellent work! You have mastered the ${assessment.title} with outstanding performance.`;
  } else if (percentage >= assessment.passingScore) {
    return `Good job! You have successfully completed the ${assessment.title}. Consider reviewing the areas for improvement.`;
  } else {
    return `You need to improve your understanding. Focus on the topics where you struggled and retake the assessment.`;
  }
}