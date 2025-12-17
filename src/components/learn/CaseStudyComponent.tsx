"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Clock,
  User,
  Calendar,
  Briefcase,
  BookOpen
} from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  category: 'investment' | 'financial-planning' | 'risk-management' | 'retirement';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes to complete
  character: {
    name: string;
    age: number;
    profession: string;
    situation: string;
  };
  scenario: {
    challenge: string;
    currentSituation: {
      income: number;
      expenses: number;
      savings: number;
      investments: {
        type: string;
        amount: number;
        returns: number;
      }[];
    };
    goals: string[];
    constraints: string[];
  };
  analysis: {
    problems: string[];
    solutions: string[];
    recommendations: {
      action: string;
      rationale: string;
      expectedOutcome: string;
      timeline: string;
    }[];
  };
  outcome: {
    projectedResults: {
      metric: string;
      current: number;
      projected: number;
      timeframe: string;
    }[];
    lessons: string[];
  };
}

interface CaseStudyComponentProps {
  caseStudyId: string;
  title?: string;
  description?: string;
  showFullCase?: boolean;
  onComplete?: (results: any) => void;
}

export default function CaseStudyComponent({ 
  caseStudyId,
  title = "Investment Case Study",
  description = "Learn from real-world financial scenarios",
  showFullCase = true,
  onComplete
}: CaseStudyComponentProps) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userDecisions, setUserDecisions] = useState<Record<string, any>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Sample case study data
  const sampleCaseStudy: CaseStudy = {
    id: caseStudyId,
    title: "Rajesh's SIP Investment Journey",
    description: "Follow Rajesh's journey from financial confusion to systematic wealth building through SIP investments",
    category: 'investment',
    difficulty: 'beginner',
    duration: 15,
    
    character: {
      name: "Rajesh Sharma",
      age: 28,
      profession: "Software Engineer",
      situation: "Fresh out of college, earning good salary but struggling to save consistently"
    },
    
    scenario: {
      challenge: "Rajesh earns ₹75,000 per month but struggles to save consistently. He wants to build wealth but doesn't know where to start. His friends are making good returns in stock markets, but he's afraid of market volatility.",
      currentSituation: {
        income: 75000,
        expenses: 55000,
        savings: 20000,
        investments: [
          { type: "Savings Account", amount: 50000, returns: 3.5 },
          { type: "FD", amount: 100000, returns: 6.5 }
        ]
      },
      goals: [
        "Buy a house in 8-10 years (₹1.5 crore corpus needed)",
        "Create emergency fund (6 months expenses)",
        "Plan for children's education (15 years from now)",
        "Build retirement corpus"
      ],
      constraints: [
        "No investment experience",
        "Risk-averse mentality",
        "Irregular savings pattern",
        "Limited time for research"
      ]
    },
    
    analysis: {
      problems: [
        "Money sitting in low-yield savings accounts (3.5%)",
        "No systematic investment approach",
        "Missing out on equity market benefits",
        "No clear financial goals or timeline"
      ],
      solutions: [
        "Start SIP in diversified equity mutual funds",
        "Create systematic investment discipline",
        "Gradually increase SIP amount with salary hikes",
        "Diversify across equity and debt funds"
      ],
      recommendations: [
        {
          action: "Start SIP of ₹15,000/month in diversified equity funds",
          rationale: "Market is down, good entry point; rupee cost averaging will help",
          expectedOutcome: "₹49.97 lakhs in 20 years at 12% returns",
          timeline: "Immediate"
        },
        {
          action: "Create step-up SIP plan (increase 10% annually)",
          rationale: "Match salary growth, accelerate wealth building",
          expectedOutcome: "₹75+ lakhs corpus with same effort",
          timeline: "From year 2"
        },
        {
          action: "Build emergency fund separately (₹3.3 lakhs)",
          rationale: "Liquid fund for emergencies, prevents SIP interruption",
          expectedOutcome: "6 months expenses covered",
          timeline: "6 months"
        }
      ]
    },
    
    outcome: {
      projectedResults: [
        {
          metric: "Monthly SIP",
          current: 0,
          projected: 15000,
          timeframe: "Year 1"
        },
        {
          metric: "Annual Corpus Growth",
          current: 0,
          projected: 180000,
          timeframe: "Year 1"
        },
        {
          metric: "20-Year Corpus",
          current: 0,
          projected: 4997000,
          timeframe: "20 years"
        },
        {
          metric: "Total Investment",
          current: 0,
          projected: 3600000,
          timeframe: "20 years"
        },
        {
          metric: "Wealth Multiplier",
          current: 1,
          projected: 1.39,
          timeframe: "20 years"
        }
      ],
      lessons: [
        "Starting early beats perfect timing",
        "Systematic approach creates discipline",
        "SIP reduces timing risk through averaging",
        "Step-up SIP maximizes compound benefits",
        "Emergency fund prevents investment interruptions"
      ]
    }
  };

  const steps = [
    { id: 'character', title: 'Meet the Character', icon: User },
    { id: 'situation', title: 'Current Situation', icon: BarChart3 },
    { id: 'challenge', title: 'The Challenge', icon: AlertTriangle },
    { id: 'decision', title: 'Your Decision', icon: Target },
    { id: 'analysis', title: 'Analysis', icon: BookOpen },
    { id: 'outcome', title: 'Outcome', icon: CheckCircle }
  ];

  useEffect(() => {
    // In real app, this would fetch from API
    setCaseStudy(sampleCaseStudy);
  }, [caseStudyId]);

  const handleDecision = (questionId: string, decision: any) => {
    setUserDecisions(prev => ({
      ...prev,
      [questionId]: decision
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeCaseStudy = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete({
        decisions: userDecisions,
        completedAt: new Date().toISOString(),
        caseStudyId: caseStudy?.id
      });
    }
  };

  if (!caseStudy) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case study...</p>
        </div>
      </div>
    );
  }

  const CurrentIcon = steps[currentStep].icon;

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-900">{title}</CardTitle>
              <p className="text-sm text-blue-700">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={`${
              caseStudy.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              caseStudy.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {caseStudy.difficulty}
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {caseStudy.duration} min
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-600 border-blue-600 text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  isActive ? 'text-blue-900 font-medium' :
                  isCompleted ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{caseStudy.character.name}</h3>
                <p className="text-gray-600">{caseStudy.character.profession}, Age {caseStudy.character.age}</p>
              </div>
              
              <div className="bg-white border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Current Situation</h4>
                <p className="text-gray-700">{caseStudy.character.situation}</p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Financial Snapshot</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Income</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{caseStudy.scenario.currentSituation.income.toLocaleString()}</p>
                </div>
                
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-gray-600">Monthly Expenses</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">₹{caseStudy.scenario.currentSituation.expenses.toLocaleString()}</p>
                </div>
                
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Current Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">₹{caseStudy.scenario.currentSituation.savings.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Current Investments</h4>
                <div className="space-y-3">
                  {caseStudy.scenario.currentSituation.investments.map((investment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">{investment.type}</span>
                      <span className="text-gray-600">₹{investment.amount.toLocaleString()} @ {investment.returns}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">The Challenge</h3>
              
              <div className="bg-white border border-orange-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-2">The Problem</h4>
                    <p className="text-orange-800">{caseStudy.scenario.challenge}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Financial Goals
                  </h4>
                  <ul className="space-y-2">
                    {caseStudy.scenario.goals.map((goal, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-800">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-6">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Constraints
                  </h4>
                  <ul className="space-y-2">
                    {caseStudy.scenario.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <span className="text-red-800">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Your Decision</h3>
              
              <div className="bg-white border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">What would you recommend for {caseStudy.character.name}?</h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">1. How much should he invest monthly in SIP?</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['₹5,000', '₹10,000', '₹15,000', '₹20,000'].map((amount) => (
                        <Button
                          key={amount}
                          variant={userDecisions.sipAmount === amount ? "default" : "outline"}
                          onClick={() => handleDecision('sipAmount', amount)}
                          className="text-sm"
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">2. What type of funds should he choose?</p>
                    <div className="space-y-2">
                      {[
                        'Large Cap Equity Funds',
                        'Balanced Advantage Funds',
                        'Flexicap Funds',
                        'Index Funds'
                      ].map((fundType) => (
                        <label key={fundType} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="fundType"
                            value={fundType}
                            checked={userDecisions.fundType === fundType}
                            onChange={(e) => handleDecision('fundType', e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-gray-700">{fundType}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">3. Investment timeline?</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['5 years', '10 years', '15 years', '20+ years'].map((timeline) => (
                        <Button
                          key={timeline}
                          variant={userDecisions.timeline === timeline ? "default" : "outline"}
                          onClick={() => handleDecision('timeline', timeline)}
                          className="text-sm"
                        >
                          {timeline}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Expert Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-red-200 rounded-lg p-6">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Problems Identified
                  </h4>
                  <ul className="space-y-2">
                    {caseStudy.analysis.problems.map((problem, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <span className="text-red-800 text-sm">{problem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Solutions
                  </h4>
                  <ul className="space-y-2">
                    {caseStudy.analysis.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-green-800 text-sm">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Recommendations</h4>
                <div className="space-y-4">
                  {caseStudy.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium text-blue-900">{rec.action}</h5>
                      <p className="text-sm text-blue-700 mt-1">{rec.rationale}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                        <span>Expected: {rec.expectedOutcome}</span>
                        <span>Timeline: {rec.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Projected Outcomes</h3>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {caseStudy.outcome.projectedResults.map((result, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600">{result.metric}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.metric.includes('₹') ? 
                          `₹${result.projected.toLocaleString()}` : 
                          result.projected
                        }
                      </p>
                      <p className="text-xs text-gray-500">{result.timeframe}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-3">Key Lessons Learned</h4>
                <ul className="space-y-2">
                  {caseStudy.outcome.lessons.map((lesson, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <span className="text-yellow-800 text-sm">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {completed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Case Study Completed!</h4>
                  <p className="text-green-700">You've successfully analyzed {caseStudy.character.name}'s financial situation.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={completeCaseStudy}
              disabled={completed}
              className="bg-green-600 hover:bg-green-700"
            >
              {completed ? 'Completed!' : 'Complete Case Study'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}