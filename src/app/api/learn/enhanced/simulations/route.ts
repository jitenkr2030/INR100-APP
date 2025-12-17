import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Advanced Financial Simulations API
// Provides realistic financial scenarios for hands-on learning

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  category: 'investment' | 'tax_planning' | 'insurance' | 'retirement' | 'emergency_fund' | 'debt_management';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  realWorldApplication: string;
  variables: SimulationVariable[];
  outcomes: SimulationOutcome[];
  scoring: SimulationScoring;
}

interface SimulationVariable {
  name: string;
  type: 'number' | 'percentage' | 'currency' | 'choice' | 'date';
  description: string;
  defaultValue: any;
  constraints: {
    min?: number;
    max?: number;
    choices?: string[];
  };
  impact: 'high' | 'medium' | 'low';
}

interface SimulationOutcome {
  id: string;
  title: string;
  description: string;
  conditions: any; // JSON conditions
  result: {
    type: 'success' | 'warning' | 'failure';
    message: string;
    recommendations: string[];
    score: number;
  };
}

interface SimulationScoring {
  criteria: {
    name: string;
    weight: number;
    description: string;
  }[];
  passingScore: number;
  excellentScore: number;
}

interface SimulationSession {
  id: string;
  userId: string;
  scenarioId: string;
  variables: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  result?: string;
  decisions: SimulationDecision[];
}

interface SimulationDecision {
  step: number;
  variable: string;
  value: any;
  timestamp: Date;
  reasoning?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'scenarios';
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const sessionId = searchParams.get('sessionId');
    
    switch (action) {
      case 'scenarios':
        return await getAvailableScenarios(userId, category, difficulty);
      case 'scenario':
        return await getScenarioDetails(searchParams.get('scenarioId'));
      case 'session':
        return await getSimulationSession(sessionId, userId);
      case 'sessions':
        return await getUserSessions(userId);
      case 'results':
        return await getSimulationResults(userId, searchParams.get('scenarioId'));
      case 'leaderboard':
        return await getSimulationLeaderboard(searchParams.get('scenarioId'));
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Simulations API error:', error);
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
      case 'start-session':
        return await startSimulationSession(await request.json());
      case 'make-decision':
        return await makeSimulationDecision(await request.json());
      case 'complete-session':
        return await completeSimulationSession(await request.json());
      case 'submit-scenario':
        return await submitScenarioFeedback(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Simulations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get available simulation scenarios
async function getAvailableScenarios(userId?: string, category?: string, difficulty?: string) {
  const scenarios = getMockScenarios();
  
  let filteredScenarios = scenarios;
  
  // Filter by category
  if (category) {
    filteredScenarios = filteredScenarios.filter(s => s.category === category);
  }
  
  // Filter by difficulty
  if (difficulty) {
    filteredScenarios = filteredScenarios.filter(s => s.difficulty === difficulty);
  }
  
  // If userId provided, check completion status
  if (userId) {
    const userSessions = await getUserSimulationSessions(userId);
    const completedScenarioIds = userSessions
      .filter(s => s.endTime && s.score)
      .map(s => s.scenarioId);
    
    filteredScenarios = filteredScenarios.map(scenario => ({
      ...scenario,
      isCompleted: completedScenarioIds.includes(scenario.id),
      bestScore: getBestScoreForScenario(userSessions, scenario.id),
      attempts: userSessions.filter(s => s.scenarioId === scenario.id).length
    }));
  }
  
  return NextResponse.json({
    success: true,
    data: {
      scenarios: filteredScenarios,
      categories: [...new Set(scenarios.map(s => s.category))],
      difficulties: [...new Set(scenarios.map(s => s.difficulty))]
    }
  });
}

// Get detailed scenario information
async function getScenarioDetails(scenarioId: string | null) {
  if (!scenarioId) {
    return NextResponse.json(
      { success: false, error: 'scenarioId required' },
      { status: 400 }
    );
  }
  
  const scenarios = getMockScenarios();
  const scenario = scenarios.find(s => s.id === scenarioId);
  
  if (!scenario) {
    return NextResponse.json(
      { success: false, error: 'Scenario not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: { scenario }
  });
}

// Start a new simulation session
async function startSimulationSession(data: { userId: string; scenarioId: string }) {
  const { userId, scenarioId } = data;
  
  if (!userId || !scenarioId) {
    return NextResponse.json(
      { success: false, error: 'userId and scenarioId required' },
      { status: 400 }
    );
  }
  
  const scenarios = getMockScenarios();
  const scenario = scenarios.find(s => s.id === scenarioId);
  
  if (!scenario) {
    return NextResponse.json(
      { success: false, error: 'Scenario not found' },
      { status: 404 }
    );
  }
  
  // Create session record
  const session: SimulationSession = {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    scenarioId,
    variables: {},
    startTime: new Date(),
    decisions: []
  };
  
  // Initialize variables with default values
  scenario.variables.forEach(variable => {
    session.variables[variable.name] = variable.defaultValue;
  });
  
  // Store session (in real implementation, would save to database)
  console.log('Simulation session started:', session);
  
  return NextResponse.json({
    success: true,
    data: {
      session,
      scenario,
      message: 'Simulation session started successfully'
    }
  });
}

// Make a decision during simulation
async function makeSimulationDecision(data: { 
  sessionId: string; 
  variable: string; 
  value: any; 
  reasoning?: string 
}) {
  const { sessionId, variable, value, reasoning } = data;
  
  if (!sessionId || !variable) {
    return NextResponse.json(
      { success: false, error: 'sessionId and variable required' },
      { status: 400 }
    );
  }
  
  // Find scenario and validate decision
  const scenario = validateDecision(sessionId, variable, value);
  
  if (!scenario.success) {
    return NextResponse.json(scenario, { status: 400 });
  }
  
  // Record decision
  const decision: SimulationDecision = {
    step: getCurrentStep(sessionId),
    variable,
    value,
    timestamp: new Date(),
    reasoning
  };
  
  // Update session (in real implementation, would update database)
  console.log('Decision recorded:', decision);
  
  // Check for immediate outcomes
  const immediateOutcomes = checkImmediateOutcomes(scenario.data, variable, value);
  
  return NextResponse.json({
    success: true,
    data: {
      decision,
      immediateOutcomes,
      nextVariable: getNextVariable(scenario.data, variable),
      progress: calculateProgress(scenario.data, variable)
    }
  });
}

// Complete simulation session
async function completeSimulationSession(data: { 
  sessionId: string; 
  finalVariables: Record<string, any> 
}) {
  const { sessionId, finalVariables } = data;
  
  if (!sessionId || !finalVariables) {
    return NextResponse.json(
      { success: false, error: 'sessionId and finalVariables required' },
      { status: 400 }
    );
  }
  
  const scenarios = getMockScenarios();
  const scenario = scenarios.find(s => s.id === sessionId.split('_')[1]); // Extract scenario ID from session ID
  
  if (!scenario) {
    return NextResponse.json(
      { success: false, error: 'Scenario not found' },
      { status: 404 }
    );
  }
  
  // Calculate final score
  const score = calculateFinalScore(scenario, finalVariables);
  const result = determineOutcome(scenario, finalVariables, score);
  
  // Generate insights and recommendations
  const insights = generateSimulationInsights(scenario, finalVariables, score);
  
  // Complete session
  const completedSession = {
    ...getSessionById(sessionId),
    endTime: new Date(),
    score,
    result: result.type,
    finalVariables,
    insights
  };
  
  // Award XP and achievements
  await awardSimulationRewards(data.userId, scenario, score);
  
  return NextResponse.json({
    success: true,
    data: {
      session: completedSession,
      score,
      result,
      insights,
      recommendations: result.recommendations,
      nextSteps: generateNextSteps(scenario, score)
    }
  });
}

// Get simulation session details
async function getSimulationSession(sessionId: string | null, userId?: string) {
  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'sessionId required' },
      { status: 400 }
    );
  }
  
  const session = getSessionById(sessionId);
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Session not found' },
      { status: 404 }
    );
  }
  
  if (userId && session.userId !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access to session' },
      { status: 403 }
    );
  }
  
  const scenario = getMockScenarios().find(s => s.id === session.scenarioId);
  
  return NextResponse.json({
    success: true,
    data: {
      session,
      scenario,
      progress: calculateProgress(scenario, session.variables)
    }
  });
}

// Get user's simulation sessions
async function getUserSessions(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const sessions = await getUserSimulationSessions(userId);
  const scenarios = getMockScenarios();
  
  const enrichedSessions = sessions.map(session => ({
    ...session,
    scenario: scenarios.find(s => s.id === session.scenarioId)
  }));
  
  return NextResponse.json({
    success: true,
    data: {
      sessions: enrichedSessions,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.endTime).length,
      averageScore: calculateAverageScore(sessions),
      bestScore: Math.max(...sessions.filter(s => s.score).map(s => s.score || 0))
    }
  });
}

// Get simulation results and analytics
async function getSimulationResults(userId: string | null, scenarioId?: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const sessions = await getUserSimulationSessions(userId);
  let filteredSessions = sessions;
  
  if (scenarioId) {
    filteredSessions = sessions.filter(s => s.scenarioId === scenarioId);
  }
  
  const completedSessions = filteredSessions.filter(s => s.endTime && s.score);
  
  const analytics = {
    totalAttempts: filteredSessions.length,
    completedAttempts: completedSessions.length,
    averageScore: completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length 
      : 0,
    bestScore: completedSessions.length > 0 
      ? Math.max(...completedSessions.map(s => s.score || 0)) 
      : 0,
    improvementTrend: calculateImprovementTrend(completedSessions),
    commonMistakes: analyzeCommonMistakes(completedSessions),
    strengths: identifyStrengths(completedSessions),
    recommendations: generateImprovementRecommendations(completedSessions)
  };
  
  return NextResponse.json({
    success: true,
    data: { analytics }
  });
}

// Get simulation leaderboard
async function getSimulationLeaderboard(scenarioId: string | null) {
  if (!scenarioId) {
    return NextResponse.json(
      { success: false, error: 'scenarioId required' },
      { status: 400 }
    );
  }
  
  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, userName: 'FinancePro', score: 95, completedAt: new Date('2024-12-15') },
    { rank: 2, userName: 'InvestmentGuru', score: 92, completedAt: new Date('2024-12-14') },
    { rank: 3, userName: 'MoneyMaster', score: 89, completedAt: new Date('2024-12-13') },
    { rank: 4, userName: 'WealthBuilder', score: 87, completedAt: new Date('2024-12-12') },
    { rank: 5, userName: 'RiskManager', score: 85, completedAt: new Date('2024-12-11') }
  ];
  
  return NextResponse.json({
    success: true,
    data: {
      leaderboard,
      userRank: 3, // Mock user rank
      totalParticipants: 127
    }
  });
}

// Submit feedback on scenario
async function submitScenarioFeedback(data: { 
  userId: string; 
  scenarioId: string; 
  rating: number; 
  feedback: string; 
  difficulty: string 
}) {
  const { userId, scenarioId, rating, feedback, difficulty } = data;
  
  const feedbackData = {
    userId,
    scenarioId,
    rating,
    feedback,
    difficulty,
    submittedAt: new Date(),
    processed: false
  };
  
  // Store feedback (in real implementation, would save to database)
  console.log('Scenario feedback submitted:', feedbackData);
  
  return NextResponse.json({
    success: true,
    data: {
      message: 'Feedback submitted successfully',
      feedbackId: `fb_${Date.now()}`
    }
  });
}

// Helper Functions

function getMockScenarios(): SimulationScenario[] {
  return [
    {
      id: 'sip-calculator',
      title: 'SIP Investment Strategy Planner',
      description: 'Plan your systematic investment plan for long-term wealth creation',
      category: 'investment',
      difficulty: 'beginner',
      duration: 20,
      prerequisites: ['Basic investment concepts'],
      learningObjectives: [
        'Understand SIP benefits and mechanics',
        'Calculate optimal SIP amounts',
        'Plan for different investment goals',
        'Factor in inflation and tax implications'
      ],
      realWorldApplication: 'Create a personalized SIP strategy for your financial goals',
      variables: [
        {
          name: 'monthlyIncome',
          type: 'currency',
          description: 'Your monthly take-home income',
          defaultValue: 50000,
          constraints: { min: 10000, max: 500000 },
          impact: 'high'
        },
        {
          name: 'monthlyExpense',
          type: 'currency',
          description: 'Your monthly essential expenses',
          defaultValue: 30000,
          constraints: { min: 5000, max: 300000 },
          impact: 'high'
        },
        {
          name: 'emergencyFund',
          type: 'currency',
          description: 'Current emergency fund amount',
          defaultValue: 100000,
          constraints: { min: 0, max: 1000000 },
          impact: 'medium'
        },
        {
          name: 'investmentGoal',
          type: 'choice',
          description: 'Primary investment goal',
          defaultValue: 'wealth_creation',
          constraints: { 
            choices: ['wealth_creation', 'retirement', 'home_purchase', 'child_education', 'vacation'] 
          },
          impact: 'high'
        },
        {
          name: 'goalAmount',
          type: 'currency',
          description: 'Target amount for your goal',
          defaultValue: 5000000,
          constraints: { min: 100000, max: 100000000 },
          impact: 'high'
        },
        {
          name: 'timeHorizon',
          type: 'number',
          description: 'Investment time horizon (years)',
          defaultValue: 10,
          constraints: { min: 1, max: 30 },
          impact: 'high'
        },
        {
          name: 'riskTolerance',
          type: 'choice',
          description: 'Your risk tolerance level',
          defaultValue: 'moderate',
          constraints: { choices: ['conservative', 'moderate', 'aggressive'] },
          impact: 'medium'
        },
        {
          name: 'existingInvestments',
          type: 'currency',
          description: 'Current investment portfolio value',
          defaultValue: 0,
          constraints: { min: 0, max: 10000000 },
          impact: 'medium'
        }
      ],
      outcomes: [
        {
          id: 'insufficient_income',
          title: 'Insufficient Income',
          description: 'Monthly expenses exceed income',
          conditions: { monthlyExpense: { $gt: 'monthlyIncome' } },
          result: {
            type: 'failure',
            message: 'Your expenses exceed your income. Focus on expense management first.',
            recommendations: [
              'Track and categorize all expenses',
              'Identify areas for cost reduction',
              'Consider increasing income sources',
              'Build emergency fund before investing'
            ],
            score: 0
          }
        },
        {
          id: 'emergency_fund_missing',
          title: 'No Emergency Fund',
          description: 'Insufficient emergency fund coverage',
          conditions: { emergencyFund: { $lt: { $expression: 'monthlyExpense * 6' } } },
          result: {
            type: 'warning',
            message: 'Your emergency fund is below the recommended 6 months of expenses.',
            recommendations: [
              'Build emergency fund of 6 months expenses first',
              'Consider high-yield savings account',
              'Start SIP only after emergency fund is complete',
              'Automate emergency fund contributions'
            ],
            score: 60
          }
        },
        {
          id: 'realistic_plan',
          title: 'Realistic Investment Plan',
          description: 'Well-balanced investment strategy',
          conditions: { 
            monthlyIncome: { $gt: 'monthlyExpense' },
            emergencyFund: { $gte: { $expression: 'monthlyExpense * 6' } }
          },
          result: {
            type: 'success',
            message: 'Great! You have a solid foundation for SIP investments.',
            recommendations: [
              'Start SIP with 20-30% of surplus income',
              'Diversify across equity and debt funds',
              'Review and rebalance annually',
              'Increase SIP amount with salary hikes'
            ],
            score: 90
          }
        }
      ],
      scoring: {
        criteria: [
          { name: 'Financial Planning', weight: 0.3, description: 'Overall financial planning approach' },
          { name: 'Risk Assessment', weight: 0.25, description: 'Appropriate risk tolerance selection' },
          { name: 'Goal Alignment', weight: 0.25, description: 'Investment aligned with goals' },
          { name: 'Practical Feasibility', weight: 0.2, description: 'Realistic and achievable plan' }
        ],
        passingScore: 70,
        excellentScore: 85
      }
    },
    {
      id: 'tax-optimization',
      title: 'Tax Optimization Strategy',
      description: 'Optimize your investments for maximum tax savings',
      category: 'tax_planning',
      difficulty: 'intermediate',
      duration: 25,
      prerequisites: ['Basic tax concepts', 'Investment knowledge'],
      learningObjectives: [
        'Understand Section 80C and 80D benefits',
        'Calculate tax savings from different investments',
        'Optimize portfolio for tax efficiency',
        'Plan for long-term capital gains'
      ],
      realWorldApplication: 'Create a tax-efficient investment portfolio',
      variables: [
        {
          name: 'annualIncome',
          type: 'currency',
          description: 'Your annual taxable income',
          defaultValue: 800000,
          constraints: { min: 250000, max: 5000000 },
          impact: 'high'
        },
        {
          name: 'age',
          type: 'number',
          description: 'Your current age',
          defaultValue: 30,
          constraints: { min: 18, max: 65 },
          impact: 'medium'
        },
        {
          name: 'currentInvestments',
          type: 'currency',
          description: 'Current tax-saving investments',
          defaultValue: 100000,
          constraints: { min: 0, max: 150000 },
          impact: 'high'
        },
        {
          name: 'insurancePremium',
          type: 'currency',
          description: 'Annual life insurance premium',
          defaultValue: 25000,
          constraints: { min: 0, max: 100000 },
          impact: 'medium'
        },
        {
          name: 'healthInsurance',
          type: 'currency',
          description: 'Annual health insurance premium',
          defaultValue: 15000,
          constraints: { min: 0, max: 50000 },
          impact: 'medium'
        },
        {
          name: 'otherDeductions',
          type: 'currency',
          description: 'Other eligible deductions (80E, 80G, etc.)',
          defaultValue: 50000,
          constraints: { min: 0, max: 200000 },
          impact: 'low'
        }
      ],
      outcomes: [
        {
          id: 'tax_optimized',
          title: 'Tax-Optimized Portfolio',
          description: 'Well-optimized tax-saving strategy',
          conditions: { 
            currentInvestments: { $gte: 150000 },
            insurancePremium: { $gt: 0 },
            healthInsurance: { $gt: 0 }
          },
          result: {
            type: 'success',
            message: 'Excellent tax optimization strategy!',
            recommendations: [
              'Maximize ELSS for equity exposure',
              'Consider PPF for safe long-term returns',
              'Maintain health insurance for 80D benefits',
              'Plan ELSS investments early in financial year'
            ],
            score: 95
          }
        }
      ],
      scoring: {
        criteria: [
          { name: 'Tax Efficiency', weight: 0.4, description: 'Maximizing tax savings' },
          { name: 'Investment Diversification', weight: 0.3, description: 'Balanced portfolio approach' },
          { name: 'Long-term Planning', weight: 0.3, description: 'Sustainable tax strategy' }
        ],
        passingScore: 75,
        excellentScore: 90
      }
    }
  ];
}

function validateDecision(sessionId: string, variable: string, value: any) {
  const scenarios = getMockScenarios();
  const scenario = scenarios.find(s => s.id === sessionId.split('_')[1]);
  
  if (!scenario) {
    return { success: false, error: 'Scenario not found' };
  }
  
  const variableDef = scenario.variables.find(v => v.name === variable);
  
  if (!variableDef) {
    return { success: false, error: 'Variable not found in scenario' };
  }
  
  // Validate constraints
  if (variableDef.constraints.min !== undefined && value < variableDef.constraints.min) {
    return { success: false, error: `Value must be at least ${variableDef.constraints.min}` };
  }
  
  if (variableDef.constraints.max !== undefined && value > variableDef.constraints.max) {
    return { success: false, error: `Value must be at most ${variableDef.constraints.max}` };
  }
  
  if (variableDef.constraints.choices && !variableDef.constraints.choices.includes(value)) {
    return { success: false, error: `Value must be one of: ${variableDef.constraints.choices.join(', ')}` };
  }
  
  return { success: true, data: scenario };
}

function getCurrentStep(sessionId: string): number {
  // Mock implementation - return current step
  return Math.floor(Math.random() * 8) + 1;
}

function checkImmediateOutcomes(scenario: SimulationScenario, variable: string, value: any) {
  // Check if any outcomes are triggered immediately
  return scenario.outcomes.filter(outcome => {
    return evaluateCondition(outcome.conditions, { ...scenario.variables.reduce((acc, v) => ({ ...acc, [v.name]: v.defaultValue }), {}), [variable]: value });
  });
}

function evaluateCondition(conditions: any, variables: Record<string, any>): boolean {
  // Simple condition evaluation - in real implementation, would use proper expression parser
  for (const [key, condition] of Object.entries(conditions)) {
    if (typeof condition === 'object' && condition.$gt) {
      if (variables[key] <= condition.$gt) return false;
    }
    if (typeof condition === 'object' && condition.$lt) {
      if (variables[key] >= condition.$lt) return false;
    }
    if (typeof condition === 'object' && condition.$gte) {
      if (variables[key] < condition.$gte) return false;
    }
    if (typeof condition === 'object' && condition.$lte) {
      if (variables[key] > condition.$lte) return false;
    }
  }
  return true;
}

function getNextVariable(scenario: SimulationScenario, currentVariable: string) {
  const currentIndex = scenario.variables.findIndex(v => v.name === currentVariable);
  return currentIndex < scenario.variables.length - 1 ? scenario.variables[currentIndex + 1] : null;
}

function calculateProgress(scenario: SimulationScenario, currentVariables: Record<string, any>) {
  const completedVariables = Object.keys(currentVariables).length;
  return (completedVariables / scenario.variables.length) * 100;
}

function calculateFinalScore(scenario: SimulationScenario, variables: Record<string, any>): number {
  // Mock scoring algorithm - in real implementation, would be more sophisticated
  let score = 0;
  
  scenario.variables.forEach(variable => {
    const value = variables[variable.name];
    
    // Scoring based on variable type and value
    switch (variable.name) {
      case 'monthlyIncome':
        if (value > 50000) score += 20;
        else if (value > 30000) score += 15;
        else score += 10;
        break;
      case 'emergencyFund':
        if (value >= variables.monthlyExpense * 6) score += 25;
        else if (value >= variables.monthlyExpense * 3) score += 15;
        else score += 5;
        break;
      case 'investmentGoal':
        score += 15; // All goals are valid
        break;
      default:
        score += 10;
    }
  });
  
  return Math.min(100, score);
}

function determineOutcome(scenario: SimulationScenario, variables: Record<string, any>, score: number) {
  // Check predefined outcomes first
  for (const outcome of scenario.outcomes) {
    if (evaluateCondition(outcome.conditions, variables)) {
      return outcome.result;
    }
  }
  
  // Default outcome based on score
  if (score >= scenario.scoring.excellentScore) {
    return {
      type: 'success',
      message: 'Excellent performance! You\'ve mastered this scenario.',
      recommendations: ['Apply these strategies in real life', 'Try more advanced scenarios'],
      score
    };
  } else if (score >= scenario.scoring.passingScore) {
    return {
      type: 'success',
      message: 'Good job! You\'ve successfully completed this scenario.',
      recommendations: ['Review areas for improvement', 'Practice with similar scenarios'],
      score
    };
  } else {
    return {
      type: 'failure',
      message: 'You need to improve your strategy. Try again with different decisions.',
      recommendations: ['Study the concepts again', 'Focus on the learning objectives', 'Try with a different approach'],
      score
    };
  }
}

function generateSimulationInsights(scenario: SimulationScenario, variables: Record<string, any>, score: number) {
  return {
    keyDecisions: [
      'Emergency fund planning',
      'Investment goal setting',
      'Risk tolerance assessment'
    ],
    strengths: score >= 80 ? ['Comprehensive planning', 'Realistic approach'] : ['Good foundation'],
    improvements: score < 70 ? ['Focus on emergency fund', 'Better goal alignment'] : [],
    realWorldApplication: scenario.realWorldApplication,
    nextSteps: [
      'Implement this strategy in your financial plan',
      'Review and adjust regularly',
      'Monitor progress towards goals'
    ]
  };
}

function generateNextSteps(scenario: SimulationScenario, score: number) {
  if (score >= 90) {
    return [
      'Try more advanced scenarios',
      'Mentor other learners',
      'Apply in real-world situations'
    ];
  } else if (score >= 70) {
    return [
      'Review the scenario once more',
      'Try similar scenarios',
      'Practice the concepts'
    ];
  } else {
    return [
      'Study the learning objectives',
      'Review the scenario with guidance',
      'Start with beginner-level scenarios'
    ];
  }
}

async function awardSimulationRewards(userId: string, scenario: SimulationScenario, score: number) {
  // Award XP based on performance
  const baseXp = scenario.difficulty === 'beginner' ? 100 : 
                scenario.difficulty === 'intermediate' ? 150 : 200;
  
  const performanceMultiplier = score >= 90 ? 1.5 : score >= 70 ? 1.0 : 0.5;
  const xpEarned = Math.floor(baseXp * performanceMultiplier);
  
  // Create XP gain record
  await prisma.xpGain.create({
    data: {
      userId,
      source: 'simulation',
      sourceId: scenario.id,
      amount: xpEarned,
      reason: `Completed ${scenario.title} simulation`
    }
  });
  
  // Update user XP
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: xpEarned
      }
    }
  });
  
  console.log(`Awarded ${xpEarned} XP for simulation completion`);
}

function getSessionById(sessionId: string): SimulationSession | null {
  // Mock implementation - in real app, would fetch from database
  return {
    id: sessionId,
    userId: 'mock_user',
    scenarioId: 'sip-calculator',
    variables: {},
    startTime: new Date(),
    decisions: []
  };
}

async function getUserSimulationSessions(userId: string): Promise<SimulationSession[]> {
  // Mock implementation - in real app, would fetch from database
  return [
    {
      id: 'sim_1',
      userId,
      scenarioId: 'sip-calculator',
      variables: {},
      startTime: new Date(),
      endTime: new Date(),
      score: 85,
      result: 'success',
      decisions: []
    }
  ];
}

function getBestScoreForScenario(sessions: SimulationSession[], scenarioId: string): number {
  const scenarioSessions = sessions.filter(s => s.scenarioId === scenarioId && s.score);
  return scenarioSessions.length > 0 ? Math.max(...scenarioSessions.map(s => s.score || 0)) : 0;
}

function calculateAverageScore(sessions: SimulationSession[]): number {
  const scoredSessions = sessions.filter(s => s.score);
  return scoredSessions.length > 0 
    ? scoredSessions.reduce((sum, s) => sum + (s.score || 0), 0) / scoredSessions.length 
    : 0;
}

function calculateImprovementTrend(sessions: SimulationSession[]): string {
  if (sessions.length < 2) return 'insufficient_data';
  
  const sortedSessions = sessions.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  const recentScores = sortedSessions.slice(-3).map(s => s.score || 0);
  const olderScores = sortedSessions.slice(0, -3).map(s => s.score || 0);
  
  const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg = olderScores.length > 0 
    ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length 
    : recentAvg;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
}

function analyzeCommonMistakes(sessions: SimulationSession[]): string[] {
  // Mock analysis of common mistakes
  return [
    'Not building emergency fund first',
    'Setting unrealistic investment goals',
    'Ignoring inflation in calculations'
  ];
}

function identifyStrengths(sessions: SimulationSession[]): string[] {
  // Mock analysis of user strengths
  return [
    'Good risk assessment',
    'Realistic planning approach',
    'Understanding of compound interest'
  ];
}

function generateImprovementRecommendations(sessions: SimulationSession[]): string[] {
  return [
    'Focus on building emergency fund before investing',
    'Practice with more scenario variations',
    'Review tax optimization strategies',
    'Set specific, measurable financial goals'
  ];
}