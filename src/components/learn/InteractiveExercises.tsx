"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Shield,
  Building2
} from "lucide-react";
import SIPCalculator from "./calculators/SIPCalculator";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'calculation' | 'scenario' | 'planning' | 'analysis';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  category: string;
  instructions: string[];
  scenarios: {
    id: string;
    name: string;
    data: any;
    questions: Question[];
    expectedOutcomes?: any;
  }[];
  hints: string[];
  resources?: string[];
}

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'numerical' | 'text' | 'calculation';
  options?: string[];
  expectedAnswer?: any;
  hint?: string;
  explanation?: string;
}

interface InteractiveExercisesProps {
  moduleNumber: number;
  moduleTitle: string;
  onComplete?: (results: ExerciseResults) => void;
}

interface ExerciseResults {
  exerciseId: string;
  scenarioResults: Record<string, any>;
  overallScore: number;
  completedAt: string;
  timeSpent: number;
}

export default function InteractiveExercises({ 
  moduleNumber, 
  moduleTitle, 
  onComplete 
}: InteractiveExercisesProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());
  const [showCalculator, setShowCalculator] = useState<any>(null);

  const exercises = getExercisesForModule(moduleNumber);

  function getExercisesForModule(moduleNum: number): Exercise[] {
    const exerciseLibrary: Record<number, Exercise[]> = {
      17: [
        {
          id: 'life-insurance-planning',
          title: 'Life Insurance Coverage Calculator',
          description: 'Calculate optimal life insurance coverage based on income, dependents, and financial goals',
          type: 'calculation',
          difficulty: 'medium',
          estimatedTime: 15,
          category: 'Insurance Planning',
          instructions: [
            'Analyze the client\'s financial situation',
            'Calculate coverage based on income replacement ratio',
            'Consider existing debts and future obligations',
            'Factor in inflation and lifestyle changes'
          ],
          scenarios: [
            {
              id: 'young-professional',
              name: 'Young Professional - Rajesh',
              data: {
                age: 28,
                income: 60000,
                spouseIncome: 35000,
                dependents: 1,
                monthlyExpenses: 45000,
                existingInsurance: 0,
                homeLoan: 2500000,
                carLoan: 500000,
                emergencyFund: 300000,
                futureGoals: ['Child Education', 'Retirement Planning']
              },
              questions: [
                {
                  id: 'coverage-calculation',
                  question: 'What should be Rajesh\'s optimal life insurance coverage?',
                  type: 'numerical',
                  expectedAnswer: { min: 4000000, max: 6000000 },
                  hint: 'Consider income replacement for 10-15 years plus outstanding debts',
                  explanation: 'Coverage = (Annual Income × 12) + Outstanding Debts - Emergency Fund = ₹7.2L + ₹30L - ₹3L = ₹34.2L minimum. With dependents, 15x income is recommended.'
                },
                {
                  id: 'insurance-type',
                  question: 'What type of life insurance would be most suitable?',
                  type: 'multiple-choice',
                  options: [
                    'Endowment Policy',
                    'Term Life Insurance',
                    'Whole Life Insurance',
                    'ULIP'
                  ],
                  expectedAnswer: 'Term Life Insurance',
                  hint: 'Consider cost-effectiveness and pure protection',
                  explanation: 'Term insurance provides highest coverage at lowest cost, perfect for income replacement needs.'
                }
              ]
            },
            {
              id: 'family-protection',
              name: 'Family Protection - Priya',
              data: {
                age: 32,
                income: 80000,
                spouseIncome: 45000,
                dependents: 2,
                monthlyExpenses: 60000,
                existingInsurance: 500000,
                homeLoan: 3500000,
                children: ['Age 5', 'Age 2'],
                specialNeeds: 'Special child education fund needed'
              },
              questions: [
                {
                  id: 'enhanced-coverage',
                  question: 'How should Priya\'s coverage be adjusted for special needs?',
                  type: 'text',
                  hint: 'Consider additional corpus for special requirements',
                  explanation: 'Additional ₹20-30 lakhs should be added for special education and care fund.'
                }
              ]
            }
          ],
          hints: [
            'Use income replacement ratio of 10-15x annual income',
            'Add outstanding debts to coverage calculation',
            'Subtract existing emergency fund',
            'Consider inflation adjustment for long-term goals'
          ],
          resources: [
            'Life Insurance Calculator Guide',
            'Term vs Endowment Comparison',
            'Inflation Impact Calculator'
          ]
        },
        {
          id: 'health-insurance-planning',
          title: 'Health Insurance Strategy',
          description: 'Design comprehensive health insurance coverage for different family scenarios',
          type: 'scenario',
          difficulty: 'medium',
          estimatedTime: 20,
          category: 'Health Insurance',
          instructions: [
            'Assess current health coverage gaps',
            'Calculate adequate sum insured based on healthcare costs',
            'Consider family history and lifestyle factors',
            'Plan for inflation and medical inflation'
          ],
          scenarios: [
            {
              id: 'nuclear-family',
              name: 'Nuclear Family Planning',
              data: {
                familySize: 4,
                ages: [35, 32, 8, 5],
                existingCoverage: 300000,
                city: 'Mumbai',
                lifestyle: 'Active',
                familyHistory: 'Diabetes (father)',
                budget: 25000
              },
              questions: [
                {
                  id: 'sum-insured',
                  question: 'What sum insured would be appropriate for this family?',
                  type: 'numerical',
                  expectedAnswer: { min: 5000000, max: 10000000 },
                  hint: 'Consider medical inflation of 15-20% and city healthcare costs',
                  explanation: 'Base calculation: ₹5-10 lakhs per family member, adjusted for Mumbai costs and medical inflation.'
                }
              ]
            }
          ],
          hints: [
            'Healthcare costs in metro cities are 50-100% higher',
            'Medical inflation runs at 15-20% annually',
            'Consider critical illness riders',
            'Plan for maternity and child coverage'
          ]
        }
      ],
      18: [
        {
          id: 'elss-investment-planning',
          title: 'ELSS Investment Strategy',
          description: 'Optimize ELSS investments for maximum tax savings and wealth creation',
          type: 'calculation',
          difficulty: 'medium',
          estimatedTime: 18,
          category: 'Tax Planning',
          instructions: [
            'Calculate optimal ELSS investment amount',
            'Compare different ELSS fund strategies',
            'Plan SIP vs lump sum investments',
            'Consider tax implications and exits'
          ],
          scenarios: [
            {
              id: 'salaried-investor',
              name: 'Salaried Investor - Amit',
              data: {
                age: 30,
                income: 1200000,
                taxSlab: '30%',
                existing80C: 150000,
                riskProfile: 'Moderate',
                investmentHorizon: 15,
                monthlyCapacity: 12500
              },
              questions: [
                {
                  id: 'elss-calculation',
                  question: 'What is the optimal ELSS investment strategy for maximum tax benefit?',
                  type: 'calculation',
                  hint: 'Calculate ₹1.5 lakh ELSS investment tax savings',
                  explanation: 'Tax savings = ₹1,50,000 × 30% = ₹45,000 actual tax saved, not just deduction.'
                }
              ]
            }
          ],
          hints: [
            'ELSS has shortest 3-year lock-in among 80C options',
            'SIP in ELSS provides better rupee cost averaging',
            'Consider step-up SIP with salary hikes',
            'Exit strategy important for tax efficiency'
          ]
        }
      ],
      19: [
        {
          id: 'goal-based-sip-planning',
          title: 'Goal-Based SIP Calculator',
          description: 'Create systematic investment plans for various life goals with proper timelines',
          type: 'planning',
          difficulty: 'hard',
          estimatedTime: 25,
          category: 'Goal Planning',
          instructions: [
            'Identify and prioritize life goals',
            'Calculate required SIP amounts for each goal',
            'Create step-up SIP strategies',
            'Balance multiple goals with available resources'
          ],
          scenarios: [
            {
              id: 'comprehensive-planning',
              name: 'Comprehensive Life Planning',
              data: {
                age: 28,
                income: 75000,
                currentSavings: 200000,
                goals: [
                  { name: 'House Down Payment', amount: 2000000, timeline: 5 },
                  { name: 'Child Education', amount: 5000000, timeline: 15 },
                  { name: 'Retirement', amount: 20000000, timeline: 32 }
                ],
                existingSIP: 8000,
                riskProfile: 'Moderate'
              },
              questions: [
                {
                  id: 'sip-calculation',
                  question: 'Calculate the monthly SIP required for the house down payment goal',
                  type: 'calculation',
                  expectedAnswer: { min: 25000, max: 30000 },
                  hint: 'Use 12% expected returns for 5-year timeline',
                  explanation: 'SIP = ₹20,00,000 / [((1.12)^5 - 1) / 0.12] = ₹28,000 approximately'
                }
              ]
            }
          ],
          hints: [
            'Prioritize goals by timeline and importance',
            'Use appropriate expected returns for each timeline',
            'Consider step-up SIP for salary growth',
            'Balance aggressive and conservative goals'
          ],
          resources: [
            'SIP Planning Template',
            'Goal Prioritization Matrix',
            'Step-up SIP Calculator'
          ]
        }
      ],
      20: [
        {
          id: 'retirement-planning',
          title: 'Retirement Corpus Planning',
          description: 'Calculate retirement corpus requirements and create accumulation strategy',
          type: 'planning',
          difficulty: 'hard',
          estimatedTime: 30,
          category: 'Retirement Planning',
          instructions: [
            'Calculate retirement corpus needed',
            'Plan monthly savings required',
            'Consider inflation impact',
            'Create withdrawal strategy'
          ],
          scenarios: [
            {
              id: 'corporate-planner',
              name: 'Corporate Professional Planning',
              data: {
                currentAge: 30,
                retirementAge: 60,
                currentIncome: 100000,
                currentSavings: 500000,
                monthlyExpenses: 60000,
                inflationRate: 6,
                postRetirementReturn: 8,
                withdrawalRate: 4
              },
              questions: [
                {
                  id: 'retirement-corpus',
                  question: 'Calculate the retirement corpus required',
                  type: 'calculation',
                  expectedAnswer: { min: 18000000, max: 25000000 },
                  hint: 'First calculate future monthly expenses, then corpus needed',
                  explanation: 'Future expenses = ₹60,000 × (1.06)^30 = ₹3.44 lakhs. Corpus = ₹3.44L × 12 / 0.04 = ₹10.3 crores approximately'
                }
              ]
            }
          ],
          hints: [
            'Use 4% withdrawal rate for sustainable corpus',
            'Factor in healthcare costs separately',
            'Consider multiple income sources in retirement',
            'Plan for inflation throughout retirement'
          ]
        }
      ]
    };

    // Generate basic exercises for remaining modules
    for (let i = 21; i <= 23; i++) {
      exerciseLibrary[i] = [
        {
          id: `module-${i}-planning-exercise`,
          title: `Module ${i} Strategic Planning`,
          description: `Advanced planning exercise for module ${i} concepts`,
          type: 'planning',
          difficulty: 'hard',
          estimatedTime: 35,
          category: 'Strategic Planning',
          instructions: [
            'Analyze complex financial scenarios',
            'Apply advanced planning strategies',
            'Consider multiple variables and constraints',
            'Create comprehensive financial plans'
          ],
          scenarios: [
            {
              id: `module-${i}-scenario`,
              name: `Complex Scenario ${i}`,
              data: {
                income: 150000,
                age: 35,
                goals: ['Multiple objectives'],
                constraints: ['Complex requirements']
              },
              questions: [
                {
                  id: `question-${i}`,
                  question: `Apply module ${i} concepts to this complex scenario`,
                  type: 'text',
                  explanation: 'This tests advanced application of module concepts'
                }
              ]
            }
          ],
          hints: [
            'Consider all variables in the scenario',
            'Apply systematic approach to problem solving',
            'Balance multiple competing objectives'
          ]
        }
      ];
    }

    return exerciseLibrary[moduleNum] || [];
  }

  const handleScenarioComplete = (scenarioId: string) => {
    setCompletedScenarios(prev => new Set([...prev, scenarioId]));
  };

  const getExerciseProgress = () => {
    if (!selectedExercise) return 0;
    return (completedScenarios.size / selectedExercise.scenarios.length) * 100;
  };

  const getOverallProgress = () => {
    const completedExercises = exercises.filter(ex => 
      ex.scenarios.every(scenario => completedScenarios.has(scenario.id))
    ).length;
    return (completedExercises / exercises.length) * 100;
  };

  const resetExercise = () => {
    setAnswers({});
    setCompletedScenarios(new Set());
    setShowHints({});
    setCurrentScenario(0);
  };

  if (!selectedExercise) {
    // Exercise Selection Screen
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-blue-900">Interactive Exercises - Module {moduleNumber}</CardTitle>
            <p className="text-blue-700">Practice real-world scenarios and calculations</p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{getOverallProgress().toFixed(1)}% Complete</span>
              </div>
              <Progress value={getOverallProgress()} />
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedExercise(exercise)}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${
                    exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exercise.difficulty}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {exercise.estimatedTime} min
                  </Badge>
                </div>
                <CardTitle className="text-lg">{exercise.title}</CardTitle>
                <p className="text-sm text-gray-600">{exercise.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Target className="h-4 w-4" />
                    <span>{exercise.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <BarChart3 className="h-4 w-4" />
                    <span>{exercise.scenarios.length} scenarios</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{exercise.instructions.length} key steps</span>
                  </div>
                  
                  {/* Exercise Completion Status */}
                  {exercise.scenarios.every(scenario => completedScenarios.has(scenario.id)) && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentScenarioData = selectedExercise.scenarios[currentScenario];
  const currentQuestion = currentScenarioData?.questions[0]; // Simplified to first question for demo

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Exercise Header */}
      <Card className="border border-blue-200 bg-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedExercise(null)}
                className="mb-2"
              >
                ← Back to Exercises
              </Button>
              <CardTitle className="text-blue-900">{selectedExercise.title}</CardTitle>
              <p className="text-blue-700">{selectedExercise.description}</p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-100 text-blue-800 mb-2">
                {selectedExercise.estimatedTime} min
              </Badge>
              <div className="text-sm text-blue-600">
                {getExerciseProgress().toFixed(1)}% Complete
              </div>
            </div>
          </div>
          
          <Progress value={getExerciseProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {selectedExercise.scenarios.map((scenario, index) => (
              <button
                key={scenario.id}
                onClick={() => setCurrentScenario(index)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  index === currentScenario
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{scenario.name}</h4>
                    <p className="text-sm text-gray-600">
                      {Object.keys(scenario.data).length} data points
                    </p>
                  </div>
                  {completedScenarios.has(scenario.id) && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Current Scenario */}
      {currentScenarioData && (
        <Card>
          <CardHeader>
            <CardTitle>{currentScenarioData.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Data */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Scenario Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(currentScenarioData.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1">
                {selectedExercise.instructions.map((instruction, index) => (
                  <li key={index} className="text-blue-800 text-sm">{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentScenarioData.questions.map((question, qIndex) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Question {qIndex + 1}</Badge>
                    <Badge className={`${
                      question.type === 'multiple-choice' ? 'bg-blue-100 text-blue-800' :
                      question.type === 'numerical' ? 'bg-green-100 text-green-800' :
                      question.type === 'calculation' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {question.type}
                    </Badge>
                  </div>
                  
                  <h4 className="text-lg font-medium">{question.question}</h4>

                  {/* Question Type Specific UI */}
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => setAnswers(prev => ({ ...prev, [question.id]: index }))}
                          className={`w-full text-left p-3 rounded border transition-colors ${
                            answers[question.id] === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {(question.type === 'numerical' || question.type === 'calculation') && (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Enter your answer"
                          value={answers[question.id] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                          className="flex-1 p-3 border border-gray-200 rounded-lg"
                        />
                        <Button
                          onClick={() => setShowCalculator({
                            type: 'sip',
                            inputs: currentScenarioData.data,
                            questionId: question.id
                          })}
                          variant="outline"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculator
                        </Button>
                      </div>
                    </div>
                  )}

                  {question.type === 'text' && (
                    <textarea
                      placeholder="Enter your analysis and reasoning..."
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg"
                      rows={4}
                    />
                  )}

                  {/* Hints */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHints(prev => ({ ...prev, [question.id]: !prev[question.id] }))}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {showHints[question.id] ? 'Hide Hint' : 'Show Hint'}
                    </Button>
                    
                    {showHints[question.id] && question.hint && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-yellow-800 text-sm">{question.hint}</p>
                      </div>
                    )}
                  </div>

                  {/* Calculator Integration */}
                  {showCalculator?.questionId === question.id && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Calculator</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCalculator(null)}
                        >
                          ×
                        </Button>
                      </div>
                      <SIPCalculator
                        title="Exercise Calculator"
                        description="Use this calculator to solve the question"
                        initialValues={showCalculator.inputs}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button onClick={resetExercise} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Exercise
              </Button>
              
              <Button
                onClick={() => handleScenarioComplete(currentScenarioData.id)}
                disabled={completedScenarios.has(currentScenarioData.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                {completedScenarios.has(currentScenarioData.id) ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Complete Scenario
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Completion */}
      {getExerciseProgress() === 100 && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Award className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 mb-2">Exercise Completed!</h3>
            <p className="text-green-700 mb-4">
              You have successfully completed all scenarios in this exercise.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={resetExercise} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => setSelectedExercise(null)} className="bg-green-600 hover:bg-green-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Next Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}