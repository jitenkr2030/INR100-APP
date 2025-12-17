"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Star,
  Trophy,
  BookOpen,
  Calculator,
  Building2,
  TrendingUp,
  Users,
  Shield,
  PieChart,
  ArrowRight
} from "lucide-react";
import ContentRenderer from "./ContentRenderer";
import CaseStudyComponent from "./CaseStudyComponent";
import SIPCalculator from "./calculators/SIPCalculator";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";

interface Question {
  id: number;
  question: string;
  type: 'multiple-choice' | 'scenario' | 'calculation' | 'case-study';
  options?: string[];
  correct_answer?: number | string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  scenario?: {
    context: string;
    data: any;
  };
  calculator?: {
    type: 'sip' | 'compound-interest' | 'retirement';
    inputs: any;
    expectedRange: { min: number; max: number };
  };
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  module: number;
  timeLimit: number; // minutes
  passingScore: number; // percentage
  totalPoints: number;
  sections: {
    name: string;
    questions: Question[];
    weight: number; // percentage of total
  }[];
}

interface ModuleAssessmentProps {
  moduleNumber: number;
  moduleTitle: string;
  onComplete?: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  score: number;
  percentage: number;
  timeSpent: number;
  sectionScores: Record<string, number>;
  completedAt: string;
  passed: boolean;
  recommendations: string[];
}

export default function ModuleAssessment({ 
  moduleNumber, 
  moduleTitle, 
  onComplete 
}: ModuleAssessmentProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [assessmentData] = useState(getAssessmentForModule(moduleNumber));
  const [showCalculator, setShowCalculator] = useState<any>(null);

  function getAssessmentForModule(moduleNum: number): Assessment {
    // Module-specific assessments with enhanced content
    const assessments: Record<number, Assessment> = {
      17: {
        id: `module-${moduleNum}-assessment`,
        title: "Insurance & Risk Management Assessment",
        description: "Test your understanding of insurance fundamentals, risk assessment, and protection planning",
        module: moduleNum,
        timeLimit: 30,
        passingScore: 70,
        totalPoints: 100,
        sections: [
          {
            name: "Insurance Fundamentals",
            weight: 40,
            questions: [
              {
                id: 1,
                question: "What is the primary purpose of insurance?",
                type: "multiple-choice",
                options: [
                  "To make profit for insurance companies",
                  "To transfer risk from individuals to insurance companies",
                  "To provide tax benefits",
                  "To replace emergency funds"
                ],
                correct_answer: 1,
                explanation: "Insurance works on the principle of risk pooling, where individuals transfer their specific risks to insurance companies in exchange for premium payments.",
                difficulty: "easy",
                points: 10,
                category: "Fundamentals"
              },
              {
                id: 2,
                question: "A 30-year-old professional earning ₹8 lakh annually should have life insurance coverage of approximately:",
                type: "multiple-choice",
                options: [
                  "₹8 lakh (1x annual income)",
                  "₹24 lakh (3x annual income)", 
                  "₹80 lakh (10x annual income)",
                  "₹1.6 crore (20x annual income)"
                ],
                correct_answer: 3,
                explanation: "Rule of thumb suggests 10-20x annual income for life insurance coverage, with 20x being more appropriate for younger professionals with dependents.",
                difficulty: "medium",
                points: 15,
                category: "Coverage Calculation"
              },
              {
                id: 3,
                question: "Calculate the annual premium for a ₹1 crore term life insurance policy for a healthy 30-year-old non-smoker.",
                type: "calculation",
                correct_answer: "5000-8000",
                explanation: "For a healthy 30-year-old non-smoker, term insurance premium typically ranges from ₹5,000-8,000 annually for ₹1 crore coverage.",
                difficulty: "medium",
                points: 20,
                category: "Premium Calculation",
                calculator: {
                  type: "retirement",
                  inputs: { currentAge: 30, coverage: 10000000 },
                  expectedRange: { min: 5000, max: 8000 }
                }
              }
            ]
          },
          {
            name: "Risk Assessment",
            weight: 35,
            questions: [
              {
                id: 4,
                question: "Which type of risk has the highest probability but lowest financial impact?",
                type: "multiple-choice",
                options: [
                  "Systematic risk",
                  "High-frequency, low-severity risk",
                  "Low-frequency, high-severity risk",
                  "Speculative risk"
                ],
                correct_answer: 1,
                explanation: "High-frequency, low-severity risks (like minor medical expenses) occur often but have minimal financial impact on the household.",
                difficulty: "medium",
                points: 15,
                category: "Risk Types"
              },
              {
                id: 5,
                question: "A family with ₹50,000 monthly expenses and ₹3 lakh in savings needs emergency fund coverage of:",
                type: "scenario",
                options: [
                  "₹3 lakh (current savings)",
                  "₹6 lakh (6 months expenses)",
                  "₹9 lakh (9 months expenses)", 
                  "₹12 lakh (12 months expenses)"
                ],
                correct_answer: 2,
                explanation: "For a family with regular expenses and dependents, 9-12 months of expenses is recommended as emergency fund, especially with moderate savings.",
                difficulty: "medium",
                points: 20,
                category: "Emergency Planning"
              }
            ]
          },
          {
            name: "Case Study Application",
            weight: 25,
            questions: [
              {
                id: 6,
                question: "Priya, 28, has a 2-year-old child, ₹60,000 monthly income, and ₹4 lakh home loan. She currently has no insurance. What should be her priority?",
                type: "case-study",
                explanation: "Priya needs immediate term life insurance to protect her child and family, plus health insurance to cover medical expenses. She should get term life insurance first as it provides higher coverage at lower cost.",
                difficulty: "hard",
                points: 20,
                category: "Practical Application",
                scenario: {
                  context: "Young mother with dependents and debt",
                  data: {
                    age: 28,
                    income: 60000,
                    dependents: 1,
                    debt: 400000,
                    currentInsurance: 0
                  }
                }
              }
            ]
          }
        ]
      },
      18: {
        id: `module-${moduleNum}-assessment`,
        title: "Tax Planning & Investment Assessment", 
        description: "Evaluate your knowledge of tax-saving investments, ELSS funds, and optimal tax planning strategies",
        module: moduleNum,
        timeLimit: 35,
        passingScore: 75,
        totalPoints: 120,
        sections: [
          {
            name: "Tax Planning Basics",
            weight: 30,
            questions: [
              {
                id: 1,
                question: "Under Section 80C, the maximum deduction available is:",
                type: "multiple-choice",
                options: [
                  "₹1 lakh",
                  "₹1.5 lakh", 
                  "₹2 lakh",
                  "₹2.5 lakh"
                ],
                correct_answer: 1,
                explanation: "Section 80C provides a maximum deduction of ₹1.5 lakh under the old tax regime, covering ELSS, PPF, EPF, and other specified investments.",
                difficulty: "easy",
                points: 10,
                category: "Tax Laws"
              }
            ]
          },
          {
            name: "ELSS & Tax-Saving Investments", 
            weight: 45,
            questions: [
              {
                id: 2,
                question: "What is the minimum lock-in period for ELSS funds?",
                type: "multiple-choice",
                options: [
                  "1 year",
                  "3 years",
                  "5 years", 
                  "7 years"
                ],
                correct_answer: 1,
                explanation: "ELSS funds have a mandatory 3-year lock-in period, making them the shortest among tax-saving instruments under Section 80C.",
                difficulty: "medium",
                points: 15,
                category: "Investment Features"
              },
              {
                id: 3,
                question: "Calculate the tax savings for a person in 30% tax bracket investing ₹1.5 lakh in ELSS funds.",
                type: "calculation",
                correct_answer: "45000",
                explanation: "Tax savings = Investment amount × Tax rate = ₹1,50,000 × 30% = ₹45,000. This is the actual tax savings, not just the deduction.",
                difficulty: "medium",
                points: 20,
                category: "Tax Calculations"
              }
            ]
          },
          {
            name: "Strategic Tax Planning",
            weight: 25,
            questions: [
              {
                id: 4,
                question: "For optimal tax planning, investments should be:",
                type: "multiple-choice",
                options: [
                  "Done in March to claim current year benefits",
                  "Done evenly throughout the financial year", 
                  "Done only in ELSS funds",
                  "Done without any planning"
                ],
                correct_answer: 1,
                explanation: "Even investment throughout the year (like SIP) provides better rupee cost averaging and reduces the temptation to time the market.",
                difficulty: "medium",
                points: 15,
                category: "Investment Strategy"
              }
            ]
          }
        ]
      },
      19: {
        id: `module-${moduleNum}-assessment`,
        title: "Goal-Based Investment Planning Assessment",
        description: "Assess your ability to create and execute goal-based investment strategies with proper timelines and risk management",
        module: moduleNum,
        timeLimit: 40,
        passingScore: 75,
        totalPoints: 130,
        sections: [
          {
            name: "Goal Setting & Prioritization",
            weight: 25,
            questions: [
              {
                id: 1,
                question: "Which goal should typically be prioritized first?",
                type: "multiple-choice",
                options: [
                  "Child's higher education (15 years away)",
                  "Buying a car (2 years away)",
                  "Emergency fund (immediate)", 
                  "Retirement planning (30 years away)"
                ],
                correct_answer: 2,
                explanation: "Emergency fund should always be the first priority as it provides financial security and prevents the need to liquidate investments during emergencies.",
                difficulty: "easy",
                points: 10,
                category: "Goal Prioritization"
              }
            ]
          },
          {
            name: "SIP Planning & Execution",
            weight: 40,
            questions: [
              {
                id: 2,
                question: "For a goal 10 years away with ₹50,00,000 target, what SIP amount is needed assuming 12% returns?",
                type: "calculation",
                correct_answer: "24000-26000",
                explanation: "Using PMT formula for SIP calculation: PMT = FV / [((1+r)^n - 1) / r] = ₹50,00,000 / [((1.12)^10 - 1) / 0.12] ≈ ₹25,000 per month.",
                difficulty: "hard",
                points: 25,
                category: "SIP Calculations",
                calculator: {
                  type: "sip",
                  inputs: { 
                    targetAmount: 5000000, 
                    annualRate: 12, 
                    years: 10 
                  },
                  expectedRange: { min: 24000, max: 26000 }
                }
              },
              {
                id: 3,
                question: "What is the advantage of step-up SIP over regular SIP?",
                type: "multiple-choice",
                options: [
                  "Lower risk",
                  "Higher returns through increased contributions",
                  "No lock-in period",
                  "Tax benefits"
                ],
                correct_answer: 1,
                explanation: "Step-up SIP allows increasing SIP amount with salary hikes, leading to significantly higher corpus through the power of compounding on larger amounts.",
                difficulty: "medium",
                points: 15,
                category: "SIP Strategy"
              }
            ]
          },
          {
            name: "Goal-Based Asset Allocation",
            weight: 35,
            questions: [
              {
                id: 4,
                question: "For a 15-year goal, appropriate equity allocation would be:",
                type: "multiple-choice",
                options: [
                  "20-30% (conservative)",
                  "40-60% (moderate)",
                  "70-80% (aggressive)",
                  "90-100% (very aggressive)"
                ],
                correct_answer: 2,
                explanation: "For long-term goals (15+ years), aggressive equity allocation of 70-80% is appropriate to maximize wealth creation potential.",
                difficulty: "medium",
                points: 15,
                category: "Asset Allocation"
              }
            ]
          }
        ]
      }
      // Continue for modules 20-23...
    };

    // Generate assessments for modules 20-23 with similar structure
    for (let i = 20; i <= 23; i++) {
      assessments[i] = {
        id: `module-${i}-assessment`,
        title: `Module ${i} Comprehensive Assessment`,
        description: `Advanced assessment for module ${i} covering practical applications and strategic thinking`,
        module: i,
        timeLimit: 45,
        passingScore: 75,
        totalPoints: 140,
        sections: [
          {
            name: "Conceptual Understanding",
            weight: 35,
            questions: [
              {
                id: 1,
                question: `Question about module ${i} fundamentals`,
                type: "multiple-choice",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_answer: 1,
                explanation: "This tests basic understanding of the module concepts.",
                difficulty: "medium",
                points: 20,
                category: "Fundamentals"
              }
            ]
          },
          {
            name: "Practical Application",
            weight: 40,
            questions: [
              {
                id: 2,
                question: `Real-world scenario question for module ${i}`,
                type: "scenario",
                explanation: "This tests practical application of module concepts.",
                difficulty: "hard",
                points: 30,
                category: "Application"
              }
            ]
          },
          {
            name: "Advanced Analysis",
            weight: 25,
            questions: [
              {
                id: 3,
                question: `Advanced analysis question for module ${i}`,
                type: "case-study",
                explanation: "This tests advanced analytical thinking.",
                difficulty: "hard",
                points: 25,
                category: "Analysis"
              }
            ]
          }
        ]
      };
    }

    return assessments[moduleNum];
  }

  const calculateResults = (): AssessmentResults => {
    let totalScore = 0;
    const sectionScores: Record<string, number> = {};
    
    assessmentData.sections.forEach(section => {
      let sectionScore = 0;
      section.questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (question.type === 'multiple-choice') {
          if (userAnswer === question.correct_answer) {
            sectionScore += question.points;
          }
        } else if (question.type === 'calculation') {
          // For calculations, we'll simulate scoring
          if (userAnswer && typeof userAnswer === 'number') {
            sectionScore += question.points * 0.8; // Partial credit for calculations
          }
        } else {
          // For scenarios and case studies, we'll simulate scoring
          if (userAnswer) {
            sectionScore += question.points * 0.7; // Partial credit for complex answers
          }
        }
        totalScore += sectionScore;
      });
      sectionScores[section.name] = (sectionScore / (section.questions.reduce((sum, q) => sum + q.points, 0))) * 100;
    });

    const percentage = (totalScore / assessmentData.totalPoints) * 100;
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // minutes
    const passed = percentage >= assessmentData.passingScore;

    const recommendations = passed ? 
      ["Excellent work!", "Consider mentoring others", "Explore advanced modules"] :
      ["Review core concepts", "Practice more scenarios", "Focus on weak areas"];

    return {
      score: totalScore,
      percentage,
      timeSpent,
      sectionScores,
      completedAt: new Date().toISOString(),
      passed,
      recommendations
    };
  };

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    const currentSectionData = assessmentData.sections[currentSection];
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < assessmentData.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else {
      // Assessment complete
      const results = calculateResults();
      setShowResults(true);
      if (onComplete) onComplete(results);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionData = assessmentData.sections[currentSection - 1];
      setCurrentQuestion(prevSectionData.questions.length - 1);
    }
  };

  const restartAssessment = () => {
    setCurrentSection(0);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className={`border-2 ${results.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {results.passed ? (
                <Trophy className="h-16 w-16 text-green-600" />
              ) : (
                <RotateCcw className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl ${results.passed ? 'text-green-900' : 'text-red-900'}`}>
              {results.passed ? 'Congratulations!' : 'Assessment Complete'}
            </CardTitle>
            <p className={`${results.passed ? 'text-green-700' : 'text-red-700'}`}>
              {results.passed ? 'You have successfully passed the assessment' : 'You can retake the assessment to improve your score'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Final Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{results.timeSpent} min</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{results.score}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Section-wise Performance</h3>
              {Object.entries(results.sectionScores).map(([section, score]) => (
                <div key={section} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{section}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={score} className="w-32" />
                    <span className="text-sm font-medium">{score.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Recommendations</h3>
              {results.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={restartAssessment} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSectionData = assessmentData.sections[currentSection];
  const currentQuestionData = currentSectionData.questions[currentQuestion];
  const totalQuestions = assessmentData.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const currentQuestionNumber = assessmentData.sections
    .slice(0, currentSection)
    .reduce((sum, section) => sum + section.questions.length, 0) + currentQuestion + 1;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">{assessmentData.title}</CardTitle>
              <p className="text-blue-700">{assessmentData.description}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                {assessmentData.timeLimit} min
              </Badge>
              <div className="text-sm text-blue-600">
                {assessmentData.passingScore}% to pass
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestionNumber} of {totalQuestions}</span>
              <span>{Math.round((currentQuestionNumber / totalQuestions) * 100)}% Complete</span>
            </div>
            <Progress value={(currentQuestionNumber / totalQuestions) * 100} />
          </div>
        </CardHeader>
      </Card>

      {/* Question Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">{currentQuestionData.category}</Badge>
                  <Badge className={`${
                    currentQuestionData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    currentQuestionData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestionData.difficulty}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {currentQuestionData.points} pts
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentQuestionData.question}
                </h3>
              </div>
            </div>

            {/* Scenario Context */}
            {currentQuestionData.scenario && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Scenario</h4>
                <p className="text-yellow-800">{currentQuestionData.scenario.context}</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(currentQuestionData.scenario.data).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-yellow-900">{key}:</span>
                      <span className="ml-1 text-yellow-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculator Integration */}
            {currentQuestionData.calculator && (
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCalculator(currentQuestionData.calculator)}
                  variant="outline"
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Open Calculator for This Question
                </Button>
                
                {showCalculator?.type === currentQuestionData.calculator.type && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    {showCalculator.type === 'sip' && (
                      <SIPCalculator
                        title="SIP Calculator"
                        description="Use this calculator to solve the question"
                        initialValues={showCalculator.inputs}
                      />
                    )}
                    {showCalculator.type === 'compound-interest' && (
                      <CompoundInterestCalculator
                        title="Compound Interest Calculator"
                        description="Use this calculator to solve the question"
                        initialValues={showCalculator.inputs}
                      />
                    )}
                    {showCalculator.type === 'retirement' && (
                      <RetirementCalculator
                        title="Retirement Calculator"
                        description="Use this calculator to solve the question"
                        initialValues={showCalculator.inputs}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestionData.type === 'multiple-choice' && currentQuestionData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestionData.id, index)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    answers[currentQuestionData.id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      answers[currentQuestionData.id] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestionData.id] === index && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}

              {currentQuestionData.type === 'scenario' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Select the most appropriate approach:</p>
                  {currentQuestionData.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(currentQuestionData.id, index)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        answers[currentQuestionData.id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {(currentQuestionData.type === 'calculation' || currentQuestionData.type === 'case-study') && (
                <div className="space-y-2">
                  <textarea
                    placeholder="Enter your answer or reasoning..."
                    value={answers[currentQuestionData.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    {currentQuestionData.type === 'calculation' ? 
                      'Enter your numerical answer or calculation steps' : 
                      'Explain your reasoning and approach'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                onClick={prevQuestion}
                disabled={currentSection === 0 && currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                <div>Section: {currentSectionData.name}</div>
                <div>Section {currentSection + 1} of {assessmentData.sections.length}</div>
              </div>
              
              <Button
                onClick={nextQuestion}
                disabled={
                  (currentQuestionData.type === 'multiple-choice' || currentQuestionData.type === 'scenario') && 
                  answers[currentQuestionData.id] === undefined
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentSection === assessmentData.sections.length - 1 && 
                 currentQuestion === currentSectionData.questions.length - 1 ? 
                  'Complete Assessment' : 'Next'
                }
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}