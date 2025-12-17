import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Trading Integration API
// Connects learning to actual trading with practical application

interface TradingScenario {
  id: string;
  title: string;
  description: string;
  category: 'equity' | 'mutual_fund' | 'etf' | 'bond' | 'commodity' | 'crypto';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningModuleId: number;
  prerequisites: string[];
  learningObjectives: string[];
  practicalApplication: string;
  simulationData: {
    marketConditions: MarketCondition[];
    portfolioAllocation: PortfolioAllocation[];
    riskFactors: RiskFactor[];
    performanceMetrics: PerformanceMetric[];
  };
  assessmentCriteria: AssessmentCriteria;
  rewards: {
    xpMultiplier: number;
    badges: string[];
    certificates: string[];
  };
}

interface MarketCondition {
  type: 'bullish' | 'bearish' | 'volatile' | 'sideways';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  probability: number;
  expectedReturn: number;
}

interface PortfolioAllocation {
  assetClass: string;
  currentAllocation: number;
  recommendedAllocation: number;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface RiskFactor {
  name: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface PerformanceMetric {
  name: string;
  formula: string;
  target: number;
  current: number;
  status: 'above_target' | 'on_target' | 'below_target';
}

interface AssessmentCriteria {
  criteria: {
    name: string;
    weight: number;
    description: string;
    measurement: string;
  }[];
  passingScore: number;
  excellentScore: number;
}

interface TradingApplication {
  id: string;
  userId: string;
  scenarioId: string;
  learningModuleId: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startDate: Date;
  endDate?: Date;
  decisions: TradingDecision[];
  performance: TradingPerformance;
  score?: number;
  feedback?: string;
}

interface TradingDecision {
  id: string;
  timestamp: Date;
  action: 'buy' | 'sell' | 'hold' | 'rebalance';
  asset: string;
  quantity: number;
  price: number;
  reasoning: string;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TradingPerformance {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  riskAdjustedReturn: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'scenarios';
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');
    const category = searchParams.get('category');
    const applicationId = searchParams.get('applicationId');
    
    switch (action) {
      case 'scenarios':
        return await getTradingScenarios(userId, moduleId, category);
      case 'scenario':
        return await getTradingScenario(searchParams.get('scenarioId'));
      case 'applications':
        return await getUserApplications(userId);
      case 'application':
        return await getApplicationDetails(applicationId, userId);
      case 'performance':
        return await getTradingPerformance(userId, moduleId);
      case 'recommendations':
        return await getTradingRecommendations(userId);
      case 'market-data':
        return await getCurrentMarketData(searchParams.get('category'));
      case 'learning-progress':
        return await getLearningTradingProgress(userId);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Trading Integration API error:', error);
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
      case 'start-application':
        return await startTradingApplication(await request.json());
      case 'make-decision':
        return await makeTradingDecision(await request.json());
      case 'complete-application':
        return await completeTradingApplication(await request.json());
      case 'request-review':
        return await requestExpertReview(await request.json());
      case 'track-performance':
        return await trackPerformance(await request.json());
      case 'update':
        return await updateTradingPreferences(await request.json());
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Trading Integration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get trading scenarios based on learning modules
async function getTradingScenarios(userId?: string, moduleId?: string, category?: string) {
  const scenarios = getMockTradingScenarios();
  
  let filteredScenarios = scenarios;
  
  // Filter by learning module
  if (moduleId) {
    filteredScenarios = filteredScenarios.filter(s => s.learningModuleId === parseInt(moduleId));
  }
  
  // Filter by category
  if (category) {
    filteredScenarios = filteredScenarios.filter(s => s.category === category);
  }
  
  // Add user-specific data if userId provided
  if (userId) {
    const userApplications = await getUserApplicationsData(userId);
    
    filteredScenarios = filteredScenarios.map(scenario => {
      const userApplication = userApplications.find(app => app.scenarioId === scenario.id);
      return {
        ...scenario,
        hasApplication: !!userApplication,
        applicationStatus: userApplication?.status || 'not_started',
        bestScore: userApplication?.score || 0,
        lastAttempt: userApplication?.endDate || null
      };
    });
  }
  
  return NextResponse.json({
    success: true,
    data: {
      scenarios: filteredScenarios,
      categories: [...new Set(scenarios.map(s => s.category))],
      modules: [...new Set(scenarios.map(s => s.learningModuleId))]
    }
  });
}

// Get detailed trading scenario
async function getTradingScenario(scenarioId: string | null) {
  if (!scenarioId) {
    return NextResponse.json(
      { success: false, error: 'scenarioId required' },
      { status: 400 }
    );
  }
  
  const scenarios = getMockTradingScenarios();
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

// Start a new trading application
async function startTradingApplication(data: { 
  userId: string; 
  scenarioId: string; 
  learningModuleId: number 
}) {
  const { userId, scenarioId, learningModuleId } = data;
  
  if (!userId || !scenarioId || !learningModuleId) {
    return NextResponse.json(
      { success: false, error: 'userId, scenarioId, and learningModuleId required' },
      { status: 400 }
    );
  }
  
  const scenarios = getMockTradingScenarios();
  const scenario = scenarios.find(s => s.id === scenarioId);
  
  if (!scenario) {
    return NextResponse.json(
      { success: false, error: 'Scenario not found' },
      { status: 404 }
    );
  }
  
  // Verify user has completed prerequisites
  const userProgress = await getUserLearningProgress(userId);
  const hasPrerequisites = scenario.prerequisites.every(prereq => 
    userProgress.completedModules.includes(prereq)
  );
  
  if (!hasPrerequisites) {
    return NextResponse.json(
      { success: false, error: 'Learning prerequisites not completed' },
      { status: 400 }
    );
  }
  
  // Create trading application
  const application: TradingApplication = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    scenarioId,
    learningModuleId,
    status: 'in_progress',
    startDate: new Date(),
    decisions: [],
    performance: {
      totalReturn: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      riskAdjustedReturn: 0
    }
  };
  
  // Store application (in real implementation, would save to database)
  console.log('Trading application started:', application);
  
  // Award initial XP for starting practical application
  await awardInitialXp(userId, scenario);
  
  return NextResponse.json({
    success: true,
    data: {
      application,
      scenario,
      learningConnection: {
        moduleId,
        objectives: scenario.learningObjectives,
        practicalApplication: scenario.practicalApplication
      },
      message: 'Trading application started successfully'
    }
  });
}

// Make a trading decision
async function makeTradingDecision(data: { 
  applicationId: string; 
  decision: Omit<TradingDecision, 'id' | 'timestamp'> 
}) {
  const { applicationId, decision } = data;
  
  if (!applicationId || !decision) {
    return NextResponse.json(
      { success: false, error: 'applicationId and decision required' },
      { status: 400 }
    );
  }
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    return NextResponse.json(
      { success: false, error: 'Application not found' },
      { status: 404 }
    );
  }
  
  if (application.status !== 'in_progress') {
    return NextResponse.json(
      { success: false, error: 'Application is not in progress' },
      { status: 400 }
    );
  }
  
  // Create decision record
  const tradingDecision: TradingDecision = {
    id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...decision
  };
  
  // Validate decision
  const validation = validateTradingDecision(tradingDecision, application);
  
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }
  
  // Update application with decision
  application.decisions.push(tradingDecision);
  
  // Calculate performance impact
  const performanceImpact = calculatePerformanceImpact(tradingDecision, application);
  
  // Update performance metrics
  updatePerformanceMetrics(application, performanceImpact);
  
  // Check for learning milestone achievements
  const milestones = checkLearningMilestones(application);
  
  return NextResponse.json({
    success: true,
    data: {
      decision: tradingDecision,
      performanceImpact,
      currentPerformance: application.performance,
      milestones,
      nextRecommendations: generateTradingRecommendations(application),
      progress: calculateApplicationProgress(application)
    }
  });
}

// Complete trading application
async function completeTradingApplication(data: { 
  applicationId: string; 
  finalNotes?: string 
}) {
  const { applicationId, finalNotes } = data;
  
  if (!applicationId) {
    return NextResponse.json(
      { success: false, error: 'applicationId required' },
      { status: 400 }
    );
  }
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    return NextResponse.json(
      { success: false, error: 'Application not found' },
      { status: 404 }
    );
  }
  
  if (application.status !== 'in_progress') {
    return NextResponse.json(
      { success: false, error: 'Application is not in progress' },
      { status: 400 }
    );
  }
  
  // Calculate final score
  const score = calculateFinalScore(application);
  const grade = determineGrade(score);
  
  // Update application status
  application.status = 'completed';
  application.endDate = new Date();
  application.score = score;
  application.feedback = finalNotes;
  
  // Award final rewards
  const rewards = await awardTradingRewards(application.userId, application, score);
  
  // Generate comprehensive feedback
  const feedback = generateComprehensiveFeedback(application, score);
  
  // Update learning progress
  await updateLearningProgress(application.userId, application.learningModuleId, score);
  
  return NextResponse.json({
    success: true,
    data: {
      application,
      score,
      grade,
      rewards,
      feedback,
      achievements: rewards.badges,
      xpEarned: rewards.totalXp,
      learningProgress: {
        moduleId: application.learningModuleId,
        completed: true,
        score,
        practicalApplicationUnlocked: score >= 70
      }
    }
  });
}

// Get user trading applications
async function getUserApplications(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const applications = await getUserApplicationsData(userId);
  const scenarios = getMockTradingScenarios();
  
  const enrichedApplications = applications.map(app => ({
    ...app,
    scenario: scenarios.find(s => s.id === app.scenarioId)
  }));
  
  const summary = {
    totalApplications: applications.length,
    completedApplications: applications.filter(a => a.status === 'completed').length,
    inProgressApplications: applications.filter(a => a.status === 'in_progress').length,
    averageScore: applications.filter(a => a.score).reduce((sum, a) => sum + a.score, 0) / 
                 applications.filter(a => a.score).length || 0,
    bestScore: Math.max(...applications.filter(a => a.score).map(a => a.score || 0), 0),
    totalXpEarned: applications.reduce((sum, a) => sum + (a.score ? a.score * 2 : 0), 0) // Mock XP calculation
  };
  
  return NextResponse.json({
    success: true,
    data: {
      applications: enrichedApplications,
      summary
    }
  });
}

// Get application details
async function getApplicationDetails(applicationId: string | null, userId?: string) {
  if (!applicationId) {
    return NextResponse.json(
      { success: false, error: 'applicationId required' },
      { status: 400 }
    );
  }
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    return NextResponse.json(
      { success: false, error: 'Application not found' },
      { status: 404 }
    );
  }
  
  if (userId && application.userId !== userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 403 }
    );
  }
  
  const scenarios = getMockTradingScenarios();
  const scenario = scenarios.find(s => s.id === application.scenarioId);
  
  return NextResponse.json({
    success: true,
    data: {
      application,
      scenario,
      progress: calculateApplicationProgress(application),
      performanceAnalysis: analyzePerformance(application),
      learningConnection: {
        moduleId: application.learningModuleId,
        objectives: scenario?.learningObjectives || [],
        practicalApplication: scenario?.practicalApplication || ''
      }
    }
  });
}

// Get trading performance analytics
async function getTradingPerformance(userId: string | null, moduleId?: string) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const applications = await getUserApplicationsData(userId);
  let filteredApplications = applications;
  
  if (moduleId) {
    filteredApplications = applications.filter(a => a.learningModuleId === parseInt(moduleId));
  }
  
  const completedApplications = filteredApplications.filter(a => a.status === 'completed' && a.score);
  
  const performance = {
    overallPerformance: calculateOverallPerformance(completedApplications),
    categoryPerformance: calculateCategoryPerformance(completedApplications),
    improvementTrend: calculateImprovementTrend(completedApplications),
    strengths: identifyTradingStrengths(completedApplications),
    areasForImprovement: identifyImprovementAreas(completedApplications),
    recommendations: generatePerformanceRecommendations(completedApplications),
    benchmarkComparison: getBenchmarkComparison(completedApplications)
  };
  
  return NextResponse.json({
    success: true,
    data: { performance }
  });
}

// Get personalized trading recommendations
async function getTradingRecommendations(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const userProgress = await getUserLearningProgress(userId);
  const applications = await getUserApplicationsData(userId);
  
  // Generate personalized recommendations based on learning progress and trading performance
  const recommendations = {
    nextLearningModules: suggestNextModules(userProgress),
    tradingScenarios: suggestTradingScenarios(userProgress, applications),
    skillDevelopment: suggestSkillDevelopment(applications),
    practicalApplications: suggestPracticalApplications(userProgress),
    resources: recommendResources(userProgress),
    timeline: createLearningTimeline(userProgress, applications)
  };
  
  return NextResponse.json({
    success: true,
    data: { recommendations }
  });
}

// Get current market data
async function getCurrentMarketData(category?: string | null) {
  // Mock market data - in real implementation, would fetch from live data providers
  const marketData = {
    timestamp: new Date().toISOString(),
    data: generateMockMarketData(category),
    trends: analyzeMarketTrends(category),
    volatility: calculateMarketVolatility(category),
    sentiment: getMarketSentiment()
  };
  
  return NextResponse.json({
    success: true,
    data: marketData
  });
}

// Get learning-trading progress correlation
async function getLearningTradingProgress(userId: string | null) {
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId required' },
      { status: 400 }
    );
  }
  
  const learningProgress = await getUserLearningProgress(userId);
  const tradingApplications = await getUserApplicationsData(userId);
  
  const correlation = {
    learningCompletionRate: learningProgress.completedModules.length / learningProgress.totalModules,
    tradingApplicationRate: tradingApplications.length / learningProgress.completedModules.length,
    scoreCorrelation: calculateScoreCorrelation(learningProgress, tradingApplications),
    skillTransfer: analyzeSkillTransfer(learningProgress, tradingApplications),
    practicalApplicationSuccess: calculatePracticalSuccess(tradingApplications),
    recommendations: generateProgressRecommendations(learningProgress, tradingApplications)
  };
  
  return NextResponse.json({
    success: true,
    data: { correlation }
  });
}

// Request expert review
async function requestExpertReview(data: { 
  applicationId: string; 
  requestType: 'decision_review' | 'strategy_review' | 'performance_review' 
}) {
  const { applicationId, requestType } = data;
  
  // Create review request
  const reviewRequest = {
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    applicationId,
    requestType,
    status: 'pending',
    requestedAt: new Date(),
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    priority: 'medium'
  };
  
  // Store review request (in real implementation, would save to database)
  console.log('Expert review requested:', reviewRequest);
  
  return NextResponse.json({
    success: true,
    data: {
      reviewRequest,
      message: 'Expert review request submitted successfully',
      estimatedCompletionTime: '24 hours'
    }
  });
}

// Track performance update
async function trackPerformanceUpdate(data: { 
  applicationId: string; 
  metrics: Partial<TradingPerformance> 
}) {
  const { applicationId, metrics } = data;
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    return NextResponse.json(
      { success: false, error: 'Application not found' },
      { status: 404 }
    );
  }
  
  // Update performance metrics
  Object.assign(application.performance, metrics);
  
  // Check for performance milestones
  const milestones = checkPerformanceMilestones(application);
  
  return NextResponse.json({
    success: true,
    data: {
      updatedPerformance: application.performance,
      milestones,
      alerts: generatePerformanceAlerts(application)
    }
  });
}

// Helper Functions

function getMockTradingScenarios(): TradingScenario[] {
  return [
    {
      id: 'equity-portfolio-building',
      title: 'Build Your First Equity Portfolio',
      description: 'Create and manage a diversified equity portfolio based on your risk profile and investment goals',
      category: 'equity',
      difficulty: 'beginner',
      learningModuleId: 17,
      prerequisites: ['Module 1', 'Basic investment concepts'],
      learningObjectives: [
        'Understand portfolio diversification principles',
        'Learn to analyze equity investments',
        'Apply risk management strategies',
        'Monitor and rebalance portfolio'
      ],
      practicalApplication: 'Build a real equity portfolio with ₹50,000 virtual money',
      simulationData: {
        marketConditions: [
          {
            type: 'bullish',
            description: 'Strong market rally with tech stocks leading',
            impact: 'positive',
            probability: 0.3,
            expectedReturn: 0.15
          },
          {
            type: 'volatile',
            description: 'High volatility due to global events',
            impact: 'neutral',
            probability: 0.4,
            expectedReturn: 0.05
          },
          {
            type: 'bearish',
            description: 'Market correction expected',
            impact: 'negative',
            probability: 0.3,
            expectedReturn: -0.10
          }
        ],
        portfolioAllocation: [
          {
            assetClass: 'Large Cap Equity',
            currentAllocation: 0,
            recommendedAllocation: 40,
            reasoning: 'Stability and growth potential',
            riskLevel: 'medium'
          },
          {
            assetClass: 'Mid Cap Equity',
            currentAllocation: 0,
            recommendedAllocation: 30,
            reasoning: 'Higher growth potential with moderate risk',
            riskLevel: 'high'
          },
          {
            assetClass: 'Small Cap Equity',
            currentAllocation: 0,
            recommendedAllocation: 15,
            reasoning: 'High growth potential for aggressive investors',
            riskLevel: 'high'
          },
          {
            assetClass: 'Debt/Liquid Funds',
            currentAllocation: 0,
            recommendedAllocation: 15,
            reasoning: 'Stability and liquidity',
            riskLevel: 'low'
          }
        ],
        riskFactors: [
          {
            name: 'Market Volatility',
            description: 'Sudden market movements affecting portfolio value',
            probability: 0.6,
            impact: 0.3,
            mitigation: 'Diversification and regular monitoring'
          },
          {
            name: 'Sector Concentration',
            description: 'Over-investment in single sectors',
            probability: 0.4,
            impact: 0.4,
            mitigation: 'Sector-wise allocation limits'
          },
          {
            name: 'Inflation Risk',
            description: 'Purchasing power erosion over time',
            probability: 0.8,
            impact: 0.2,
            mitigation: 'Include inflation-hedged assets'
          }
        ],
        performanceMetrics: [
          {
            name: 'Total Return',
            formula: '(Final Value - Initial Value) / Initial Value',
            target: 0.12,
            current: 0,
            status: 'below_target'
          },
          {
            name: 'Sharpe Ratio',
            formula: '(Return - Risk Free Rate) / Volatility',
            target: 1.0,
            current: 0,
            status: 'below_target'
          },
          {
            name: 'Maximum Drawdown',
            formula: 'Max peak-to-trough decline',
            target: -0.15,
            current: 0,
            status: 'below_target'
          }
        ]
      },
      assessmentCriteria: {
        criteria: [
          {
            name: 'Portfolio Diversification',
            weight: 0.25,
            description: 'Appropriate asset allocation across sectors and market caps',
            measurement: 'Sector and market cap distribution analysis'
          },
          {
            name: 'Risk Management',
            weight: 0.25,
            description: 'Implementation of risk management strategies',
            measurement: 'Risk assessment and mitigation measures'
          },
          {
            name: 'Investment Selection',
            weight: 0.25,
            description: 'Quality of individual stock selection',
            measurement: 'Fundamental analysis and research quality'
          },
          {
            name: 'Performance Monitoring',
            weight: 0.25,
            description: 'Regular monitoring and rebalancing decisions',
            measurement: 'Tracking and adjustment decisions'
          }
        ],
        passingScore: 70,
        excellentScore: 85
      },
      rewards: {
        xpMultiplier: 2.0,
        badges: ['Portfolio Builder', 'Equity Analyst', 'Risk Manager'],
        certificates: ['Practical Equity Investment Certificate']
      }
    },
    {
      id: 'sip-strategy-optimization',
      title: 'Optimize Your SIP Strategy',
      description: 'Design and implement an optimal Systematic Investment Plan for long-term wealth creation',
      category: 'mutual_fund',
      difficulty: 'intermediate',
      learningModuleId: 3,
      prerequisites: ['Module 3', 'SIP concepts', 'Compound interest understanding'],
      learningObjectives: [
        'Calculate optimal SIP amounts and duration',
        'Understand rupee cost averaging benefits',
        'Learn fund selection criteria',
        'Plan for different financial goals'
      ],
      practicalApplication: 'Create a real SIP portfolio with automated investments',
      simulationData: {
        marketConditions: [
          {
            type: 'bullish',
            description: 'Strong economic growth supporting markets',
            impact: 'positive',
            probability: 0.35,
            expectedReturn: 0.18
          },
          {
            type: 'sideways',
            description: 'Consolidation phase with sideways movement',
            impact: 'neutral',
            probability: 0.45,
            expectedReturn: 0.10
          },
          {
            type: 'bearish',
            description: 'Economic slowdown affecting markets',
            impact: 'negative',
            probability: 0.20,
            expectedReturn: 0.02
          }
        ],
        portfolioAllocation: [
          {
            assetClass: 'Large Cap Funds',
            currentAllocation: 0,
            recommendedAllocation: 50,
            reasoning: 'Stable returns with lower volatility',
            riskLevel: 'medium'
          },
          {
            assetClass: 'Mid Cap Funds',
            currentAllocation: 0,
            recommendedAllocation: 25,
            reasoning: 'Growth potential with moderate risk',
            riskLevel: 'high'
          },
          {
            assetClass: 'ELSS Funds',
            currentAllocation: 0,
            recommendedAllocation: 15,
            reasoning: 'Tax saving with equity exposure',
            riskLevel: 'high'
          },
          {
            assetClass: 'Debt Funds',
            currentAllocation: 0,
            recommendedAllocation: 10,
            reasoning: 'Stability and capital protection',
            riskLevel: 'low'
          }
        ],
        riskFactors: [
          {
            name: 'Market Timing Risk',
            description: 'Poor entry timing affecting SIP returns',
            probability: 0.3,
            impact: 0.2,
            mitigation: 'Continue SIP through market cycles'
          },
          {
            name: 'Fund Selection Risk',
            description: 'Poor fund performance affecting returns',
            probability: 0.4,
            impact: 0.3,
            mitigation: 'Diversify across fund categories and managers'
          },
          {
            name: 'Inflation Risk',
            description: 'Returns not keeping pace with inflation',
            probability: 0.6,
            impact: 0.2,
            mitigation: 'Include inflation-beating asset classes'
          }
        ],
        performanceMetrics: [
          {
            name: 'CAGR',
            formula: '((Final Value / Initial Value) ^ (1/years)) - 1',
            target: 0.12,
            current: 0,
            status: 'below_target'
          },
          {
            name: 'SIP Efficiency',
            formula: 'Actual returns / Benchmark returns',
            target: 1.1,
            current: 0,
            status: 'below_target'
          }
        ]
      },
      assessmentCriteria: {
        criteria: [
          {
            name: 'SIP Planning',
            weight: 0.3,
            description: 'Optimal SIP amount and duration planning',
            measurement: 'Goal-based SIP calculation accuracy'
          },
          {
            name: 'Fund Selection',
            weight: 0.25,
            description: 'Quality of mutual fund selection',
            measurement: 'Fund performance and consistency analysis'
          },
          {
            name: 'Goal Alignment',
            weight: 0.25,
            description: 'SIP strategy aligned with financial goals',
            measurement: 'Goal-based planning and tracking'
          },
          {
            name: 'Long-term Discipline',
            weight: 0.2,
            description: 'Maintaining SIP discipline through market cycles',
            measurement: 'Consistency in SIP continuation'
          }
        ],
        passingScore: 75,
        excellentScore: 90
      },
      rewards: {
        xpMultiplier: 2.5,
        badges: ['SIP Strategist', 'Wealth Builder', 'Goal Planner'],
        certificates: ['SIP Optimization Expert Certificate']
      }
    }
  ];
}

async function getUserApplicationsData(userId: string): Promise<TradingApplication[]> {
  // Mock implementation - in real app, would fetch from database
  return [
    {
      id: 'trade_1',
      userId,
      scenarioId: 'equity-portfolio-building',
      learningModuleId: 17,
      status: 'completed',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      decisions: [],
      performance: {
        totalReturn: 0.08,
        annualizedReturn: 0.12,
        volatility: 0.15,
        sharpeRatio: 0.8,
        maxDrawdown: -0.05,
        winRate: 0.7,
        riskAdjustedReturn: 0.6
      },
      score: 82,
      feedback: 'Good portfolio building skills demonstrated'
    }
  ];
}

async function getUserLearningProgress(userId: string) {
  // Mock implementation - would fetch from learning progress API
  return {
    completedModules: [1, 2, 3, 17],
    totalModules: 23,
    averageScore: 85,
    currentLevel: 5,
    xp: 2500
  };
}

function getApplicationById(applicationId: string): TradingApplication | null {
  // Mock implementation - in real app, would fetch from database
  return {
    id: applicationId,
    userId: 'mock_user',
    scenarioId: 'equity-portfolio-building',
    learningModuleId: 17,
    status: 'in_progress',
    startDate: new Date(),
    decisions: [],
    performance: {
      totalReturn: 0,
      annualizedReturn: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      riskAdjustedReturn: 0
    }
  };
}

function validateTradingDecision(decision: TradingDecision, application: TradingApplication) {
  // Basic validation logic
  if (!decision.asset || !decision.action || decision.quantity <= 0 || decision.price <= 0) {
    return { valid: false, error: 'Invalid decision parameters' };
  }
  
  // Add more sophisticated validation based on scenario rules
  return { valid: true };
}

function calculatePerformanceImpact(decision: TradingDecision, application: TradingApplication) {
  // Mock performance impact calculation
  return {
    returnImpact: decision.action === 'buy' ? 0.02 : -0.01,
    riskImpact: decision.riskLevel === 'high' ? 0.1 : decision.riskLevel === 'medium' ? 0.05 : 0.02,
    diversificationImpact: 0.01
  };
}

function updatePerformanceMetrics(application: TradingApplication, impact: any) {
  application.performance.totalReturn += impact.returnImpact;
  application.performance.volatility += impact.riskImpact;
  // Update other metrics...
}

function checkLearningMilestones(application: TradingApplication) {
  const milestones = [];
  
  if (application.decisions.length === 1) {
    milestones.push('First Trading Decision');
  }
  
  if (application.performance.totalReturn > 0.05) {
    milestones.push('Positive Returns Achieved');
  }
  
  return milestones;
}

function generateTradingRecommendations(application: TradingApplication) {
  return [
    'Consider diversifying across more sectors',
    'Monitor market conditions regularly',
    'Review and rebalance quarterly',
    'Maintain adequate cash reserves'
  ];
}

function calculateApplicationProgress(application: TradingApplication) {
  const totalDecisions = 10; // Mock target
  return Math.min(100, (application.decisions.length / totalDecisions) * 100);
}

function calculateFinalScore(application: TradingApplication): number {
  // Mock scoring algorithm
  const baseScore = 70;
  const performanceBonus = application.performance.totalReturn * 100;
  const decisionQualityBonus = application.decisions.length * 2;
  
  return Math.min(100, baseScore + performanceBonus + decisionQualityBonus);
}

function determineGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  return 'D';
}

async function awardTradingRewards(userId: string, application: TradingApplication, score: number) {
  const scenarios = getMockTradingScenarios();
  const scenario = scenarios.find(s => s.id === application.scenarioId);
  
  if (!scenario) return { totalXp: 0, badges: [], certificates: [] };
  
  const baseXp = 100;
  const scoreMultiplier = score / 100;
  const scenarioMultiplier = scenario.rewards.xpMultiplier;
  
  const totalXp = Math.floor(baseXp * scoreMultiplier * scenarioMultiplier);
  
  // Award XP
  await prisma.xpGain.create({
    data: {
      userId,
      source: 'trading_application',
      sourceId: application.id,
      amount: totalXp,
      reason: `Completed ${scenario.title} trading application`
    }
  });
  
  // Update user XP
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: totalXp
      }
    }
  });
  
  return {
    totalXp,
    badges: score >= 80 ? scenario.rewards.badges : [],
    certificates: score >= 85 ? scenario.rewards.certificates : []
  };
}

function generateComprehensiveFeedback(application: TradingApplication, score: number) {
  return {
    summary: `You scored ${score}% in this trading application.`,
    strengths: [
      'Good understanding of portfolio diversification',
      'Appropriate risk management decisions',
      'Consistent monitoring approach'
    ],
    improvements: score < 80 ? [
      'Focus on fundamental analysis',
      'Improve sector allocation strategy',
      'Enhance risk assessment skills'
    ] : [],
    nextSteps: [
      'Apply these skills in real portfolio management',
      'Continue with advanced trading scenarios',
      'Practice with different market conditions'
    ],
    learningConnection: 'This practical application reinforces your theoretical knowledge from the learning modules.'
  };
}

async function updateLearningProgress(userId: string, moduleId: number, score: number) {
  // Update learning progress with practical application completion
  // In real implementation, would update learning progress records
  console.log(`Updated learning progress for user ${userId}, module ${moduleId}, score ${score}`);
}

function calculateOverallPerformance(applications: TradingApplication[]) {
  if (applications.length === 0) return null;
  
  const totalReturn = applications.reduce((sum, a) => sum + a.performance.totalReturn, 0) / applications.length;
  const avgScore = applications.reduce((sum, a) => sum + a.score, 0) / applications.length;
  
  return {
    averageReturn: totalReturn,
    averageScore: avgScore,
    completionRate: applications.length,
    bestScore: Math.max(...applications.map(a => a.score || 0))
  };
}

function calculateCategoryPerformance(applications: TradingApplication[]) {
  // Mock category performance calculation
  return {
    equity: { averageReturn: 0.08, averageScore: 82 },
    mutual_fund: { averageReturn: 0.12, averageScore: 85 },
    etf: { averageReturn: 0.06, averageScore: 78 }
  };
}

function calculateImprovementTrend(applications: TradingApplication[]) {
  if (applications.length < 2) return 'insufficient_data';
  
  const sorted = applications.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const recent = sorted.slice(-3);
  const older = sorted.slice(0, -3);
  
  const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((sum, a) => sum + a.score, 0) / older.length : recentAvg;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
}

function identifyTradingStrengths(applications: TradingApplication[]) {
  return [
    'Portfolio diversification skills',
    'Risk management understanding',
    'Long-term investment perspective',
    'Disciplined decision making'
  ];
}

function identifyImprovementAreas(applications: TradingApplication[]) {
  return [
    'Fundamental analysis techniques',
    'Market timing decisions',
    'Sector rotation strategies',
    'Performance monitoring frequency'
  ];
}

function generatePerformanceRecommendations(applications: TradingApplication[]) {
  return [
    'Focus on improving fundamental analysis skills',
    'Practice with more diverse market scenarios',
    'Learn advanced portfolio management techniques',
    'Study successful investor strategies'
  ];
}

function getBenchmarkComparison(applications: TradingApplication[]) {
  // Mock benchmark comparison
  return {
    userReturn: 0.08,
    marketBenchmark: 0.10,
    peerAverage: 0.07,
    ranking: 'Above Average'
  };
}

function suggestNextModules(learningProgress: any) {
  return [
    { moduleId: 18, title: 'Tax Planning & Investment', priority: 'high' },
    { moduleId: 19, title: 'Goal-Based Investment Planning', priority: 'medium' },
    { moduleId: 20, title: 'Retirement Planning', priority: 'medium' }
  ];
}

function suggestTradingScenarios(learningProgress: any, applications: TradingApplication[]) {
  return [
    { scenarioId: 'tax-optimization', title: 'Tax-Efficient Portfolio', priority: 'high' },
    { scenarioId: 'retirement-planning', title: 'Retirement Portfolio Design', priority: 'medium' }
  ];
}

function suggestSkillDevelopment(applications: TradingApplication[]) {
  return [
    'Advanced fundamental analysis',
    'Technical analysis basics',
    'Options and derivatives',
    'International investments'
  ];
}

function suggestPracticalApplications(learningProgress: any) {
  return [
    'Start a real SIP with small amounts',
    'Create a paper trading portfolio',
    'Analyze existing investments',
    'Set up automated investments'
  ];
}

function recommendResources(learningProgress: any) {
  return [
    'Financial newspapers and magazines',
    'Investment research reports',
    'Online financial courses',
    'Investment simulation games'
  ];
}

function createLearningTimeline(learningProgress: any, applications: TradingApplication[]) {
  return {
    immediate: 'Complete pending learning modules',
    shortTerm: 'Start practical trading applications',
    mediumTerm: 'Develop advanced investment skills',
    longTerm: 'Achieve investment mastery'
  };
}

function generateMockMarketData(category?: string | null) {
  // Mock market data generation
  return {
    nifty: { value: 19500, change: 0.5, changePercent: 0.25 },
    sensex: { value: 65000, change: 150, changePercent: 0.23 },
    bankNifty: { value: 42000, change: -200, changePercent: -0.47 }
  };
}

function analyzeMarketTrends(category?: string | null) {
  return {
    trend: 'bullish',
    strength: 'moderate',
    keyDrivers: ['GDP growth', 'FII inflows', 'Corporate earnings'],
    sectors: {
      top: ['IT', 'Banking', 'Pharma'],
      bottom: ['Auto', 'Realty', 'Metals']
    }
  };
}

function calculateMarketVolatility(category?: string | null) {
  return {
    current: 0.25,
    historical: 0.30,
    trend: 'decreasing'
  };
}

function getMarketSentiment() {
  return {
    overall: 'positive',
    fearGreedIndex: 65,
    retailSentiment: 'cautiously optimistic',
    institutionalSentiment: 'positive'
  };
}

function analyzePerformance(application: TradingApplication) {
  return {
    strengths: ['Good diversification', 'Risk management'],
    weaknesses: ['Sector concentration', 'Timing decisions'],
    opportunities: ['Market uptrend', 'Growth sectors'],
    threats: ['Market volatility', 'Global events']
  };
}

function calculateScoreCorrelation(learningProgress: any, tradingApplications: TradingApplication[]) {
  // Mock correlation calculation
  return {
    correlation: 0.75,
    interpretation: 'Strong positive correlation between learning scores and trading performance',
    insight: 'Higher learning scores generally lead to better trading decisions'
  };
}

function analyzeSkillTransfer(learningProgress: any, tradingApplications: TradingApplication[]) {
  return {
    theoreticalKnowledge: 0.85,
    practicalApplication: 0.72,
    gap: 0.13,
    recommendations: [
      'Practice more real-world scenarios',
      'Apply theoretical concepts immediately',
      'Seek mentorship for practical guidance'
    ]
  };
}

function calculatePracticalSuccess(tradingApplications: TradingApplication[]) {
  const completed = tradingApplications.filter(a => a.status === 'completed');
  const successful = completed.filter(a => a.score >= 70);
  
  return {
    successRate: completed.length > 0 ? successful.length / completed.length : 0,
    averageScore: completed.length > 0 ? completed.reduce((sum, a) => sum + a.score, 0) / completed.length : 0,
    improvement: 'positive'
  };
}

function generateProgressRecommendations(learningProgress: any, tradingApplications: TradingApplication[]) {
  return [
    'Complete theoretical modules before practical applications',
    'Practice trading scenarios regularly',
    'Seek real-world investment experience',
    'Join investment communities for peer learning'
  ];
}

async function awardInitialXp(userId: string, scenario: TradingScenario) {
  const initialXp = 25;
  
  await prisma.xpGain.create({
    data: {
      userId,
      source: 'trading_application_start',
      sourceId: scenario.id,
      amount: initialXp,
      reason: `Started ${scenario.title} trading application`
    }
  });
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: initialXp
      }
    }
  });
}

function checkPerformanceMilestones(application: TradingApplication) {
  const milestones = [];
  
  if (application.performance.totalReturn > 0.05) {
    milestones.push('Positive Returns Milestone');
  }
  
  if (application.performance.sharpeRatio > 1.0) {
    milestones.push('Risk-Adjusted Returns Milestone');
  }
  
  return milestones;
}

function generatePerformanceAlerts(application: TradingApplication) {
  const alerts = [];
  
  if (application.performance.maxDrawdown < -0.15) {
    alerts.push({
      type: 'risk',
      message: 'Portfolio drawdown exceeds recommended limit',
      action: 'Review risk management strategy'
    });
  }
  
  if (application.decisions.length < 5 && application.startDate.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
    alerts.push({
      type: 'engagement',
      message: 'Low trading activity - consider making more decisions',
      action: 'Review market conditions and make strategic decisions'
    });
  }
  
  return alerts;
}