"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calculator, 
  Target, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  BarChart3,
  PieChart,
  Building2,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share,
  Bookmark,
  Zap,
  Trophy,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import ModuleAssessment from "./ModuleAssessment";
import InteractiveExercises from "./InteractiveExercises";
import CaseStudyComponent from "./CaseStudyComponent";
import LearningPathways from "./LearningPathways";
import ContentRenderer from "./ContentRenderer";
import SIPCalculator from "./calculators/SIPCalculator";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";

interface ModuleContent {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  xpReward: number;
  lessons: LessonContent[];
  assessments: Assessment[];
  caseStudies: CaseStudy[];
  exercises: Exercise[];
  prerequisites?: number[];
  color: string;
}

interface LessonContent {
  id: string;
  title: string;
  description: string;
  type: 'theory' | 'practical' | 'interactive';
  content: any;
  duration: number;
  completed: boolean;
  xpReward: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: any[];
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  character: string;
  scenario: string;
}

interface Exercise {
  id: string;
  title: string;
  type: 'calculation' | 'scenario' | 'planning';
  description: string;
}

interface ModuleIntegrationProps {
  moduleNumber: number;
  moduleTitle: string;
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  onProgressUpdate?: (progress: any) => void;
  onLessonComplete?: (lessonId: string) => void;
  completedLessons?: string[];
}

export default function ModuleIntegration({ 
  moduleNumber, 
  moduleTitle, 
  studentLevel,
  onProgressUpdate,
  onLessonComplete,
  completedLessons = []
}: ModuleIntegrationProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [moduleContent] = useState(getModuleContent(moduleNumber, moduleTitle));
  const [userProgress, setUserProgress] = useState({
    lessonsCompleted: 0,
    exercisesCompleted: 0,
    assessmentsCompleted: 0,
    caseStudiesCompleted: 0,
    totalXp: 0,
    timeSpent: 0
  });

  function getModuleContent(moduleNum: number, title: string): ModuleContent {
    // Generate comprehensive module content for modules 17-23
    const moduleData: Record<number, ModuleContent> = {
      17: {
        id: 17,
        title: "Insurance & Risk Management",
        description: "Master insurance fundamentals, risk assessment, and comprehensive protection planning",
        category: "Protection & Security",
        difficulty: "intermediate",
        estimatedTime: 8,
        xpReward: 800,
        color: "purple",
        prerequisites: [1, 2, 3],
        lessons: [
          {
            id: 'lesson-17-1',
            title: 'Life Insurance Fundamentals',
            description: 'Understanding life insurance types, coverage calculations, and policy selection',
            type: 'theory',
            duration: 60,
            completed: completedLessons.includes('lesson-17-1'),
            xpReward: 100,
            content: {
              type: 'interactive',
              html: `
                <h2>Life Insurance Fundamentals</h2>
                <p>Life insurance is the cornerstone of financial protection, providing financial security for your loved ones in case of your untimely demise.</p>
                
                <h3>Types of Life Insurance</h3>
                <ul>
                  <li><strong>Term Life Insurance:</strong> Pure protection with lowest cost</li>
                  <li><strong>Whole Life Insurance:</strong> Protection with savings component</li>
                  <li><strong>Endowment Plans:</strong> Insurance with maturity benefits</li>
                  <li><strong>ULIPs:</strong> Investment-linked insurance plans</li>
                </ul>

                <div class="highlight-box">
                  <h4>💡 Key Insight</h4>
                  <p>For most people, term life insurance provides the highest coverage at the lowest cost, making it ideal for income replacement.</p>
                </div>
              `,
              interactiveElements: [
                {
                  type: 'calculator',
                  title: 'Life Insurance Coverage Calculator',
                  description: 'Calculate optimal coverage based on your profile',
                  calculatorType: 'retirement'
                }
              ],
              quizQuestions: [
                {
                  id: 1,
                  question: "What is the primary purpose of life insurance?",
                  options: [
                    "Investment returns",
                    "Income replacement for dependents",
                    "Tax savings",
                    "Emergency fund"
                  ],
                  correct_answer: 1,
                  explanation: "Life insurance's primary purpose is to replace the insured person's income for their dependents in case of untimely death."
                }
              ]
            }
          },
          {
            id: 'lesson-17-2',
            title: 'Health Insurance Planning',
            description: 'Comprehensive health coverage strategy and policy optimization',
            type: 'practical',
            duration: 55,
            completed: completedLessons.includes('lesson-17-2'),
            xpReward: 90,
            content: {
              type: 'interactive',
              html: `
                <h2>Health Insurance Planning</h2>
                <p>Healthcare costs are rising rapidly. A comprehensive health insurance plan is essential for protecting your savings from medical emergencies.</p>
                
                <h3>Coverage Components</h3>
                <ul>
                  <li>Room rent limits</li>
                  <li>Day care procedures</li>
                  <li>Pre and post hospitalization</li>
                  <li>Critical illness coverage</li>
                  <li>Maternity benefits</li>
                </ul>
              `,
              interactiveElements: [
                {
                  type: 'case-study',
                  title: 'Family Health Insurance Planning',
                  description: 'Plan health insurance for a family of four',
                  caseStudyId: 'family-health-planning'
                }
              ]
            }
          },
          {
            id: 'lesson-17-3',
            title: 'Risk Assessment & Mitigation',
            description: 'Identifying and managing various financial risks in life',
            type: 'interactive',
            duration: 50,
            completed: completedLessons.includes('lesson-17-3'),
            xpReward: 110,
            content: {
              type: 'interactive',
              html: `
                <h2>Risk Assessment & Mitigation</h2>
                <p>Understanding different types of risks and appropriate mitigation strategies is crucial for comprehensive financial planning.</p>
                
                <h3>Risk Categories</h3>
                <div class="risk-grid">
                  <div class="risk-item">
                    <h4>Life Risk</h4>
                    <p>Risk of premature death - mitigated by life insurance</p>
                  </div>
                  <div class="risk-item">
                    <h4>Health Risk</h4>
                    <p>Risk of medical emergencies - mitigated by health insurance</p>
                  </div>
                  <div class="risk-item">
                    <h4>Income Risk</h4>
                    <p>Risk of job loss or income disruption - emergency fund</p>
                  </div>
                  <div class="risk-item">
                    <h4>Investment Risk</h4>
                    <p>Market volatility - diversification and asset allocation</p>
                  </div>
                </div>
              `,
              interactiveElements: [
                {
                  type: 'exercise',
                  title: 'Personal Risk Assessment',
                  description: 'Assess your personal risk profile and mitigation strategies'
                }
              ]
            }
          }
        ],
        assessments: [
          {
            id: 'module-17-assessment',
            title: 'Insurance & Risk Management Assessment',
            description: 'Comprehensive test of insurance and risk management concepts',
            timeLimit: 30,
            passingScore: 70,
            questions: [
              {
                id: 1,
                question: "What coverage ratio should be used for life insurance calculation?",
                options: ["5-8x annual income", "10-15x annual income", "20-25x annual income", "30x annual income"],
                correct_answer: 1,
                explanation: "Life insurance coverage should typically be 10-15x annual income for adequate protection."
              }
            ]
          }
        ],
        caseStudies: [
          {
            id: 'young-family-protection',
            title: 'Young Family Protection Strategy',
            description: 'Plan insurance for a young family with children',
            character: 'Rajesh & Priya',
            scenario: 'Young couple with 2 children needs comprehensive protection planning'
          },
          {
            id: 'single-professional-insurance',
            title: 'Single Professional Insurance Planning',
            description: 'Insurance planning for unmarried professionals',
            character: 'Amit',
            scenario: 'Single software engineer needs to plan insurance for future family'
          }
        ],
        exercises: [
          {
            id: 'life-insurance-calculation',
            title: 'Life Insurance Coverage Calculator',
            type: 'calculation',
            description: 'Calculate optimal life insurance coverage for different profiles'
          },
          {
            id: 'health-insurance-comparison',
            title: 'Health Insurance Plan Comparison',
            type: 'scenario',
            description: 'Compare and select optimal health insurance plans'
          }
        ]
      },
      18: {
        id: 18,
        title: "Tax Planning & Investment",
        description: "Optimize taxes while building wealth through strategic investments",
        category: "Tax Optimization",
        difficulty: "intermediate",
        estimatedTime: 7,
        xpReward: 700,
        color: "orange",
        prerequisites: [17],
        lessons: [
          {
            id: 'lesson-18-1',
            title: 'Tax-Saving Investment Options',
            description: 'ELSS, PPF, and other Section 80C investment options',
            type: 'theory',
            duration: 55,
            completed: completedLessons.includes('lesson-18-1'),
            xpReward: 95,
            content: {
              type: 'interactive',
              html: `
                <h2>Tax-Saving Investment Options</h2>
                <p>Section 80C offers various investment options to save taxes while building wealth.</p>
                
                <h3>Popular 80C Options</h3>
                <div class="investment-comparison">
                  <div class="investment-item">
                    <h4>ELSS Funds</h4>
                    <p>Lock-in: 3 years | Expected Return: 12-15% | Best for: Wealth creation</p>
                  </div>
                  <div class="investment-item">
                    <h4>Public Provident Fund (PPF)</h4>
                    <p>Lock-in: 15 years | Expected Return: 7-8% | Best for: Safe long-term savings</p>
                  </div>
                  <div class="investment-item">
                    <h4>Employee Provident Fund (EPF)</h4>
                    <p>Lock-in: Employment tenure | Expected Return: 8-9% | Best for: Forced savings</p>
                  </div>
                  <div class="investment-item">
                    <h4>National Savings Certificate (NSC)</h4>
                    <p>Lock-in: 5 years | Expected Return: 6-7% | Best for: Conservative investors</p>
                  </div>
                </div>
              `,
              interactiveElements: [
                {
                  type: 'calculator',
                  title: 'Tax Savings Calculator',
                  description: 'Calculate actual tax savings from different 80C options',
                  calculatorType: 'compound-interest'
                }
              ]
            }
          }
        ],
        assessments: [
          {
            id: 'module-18-assessment',
            title: 'Tax Planning Assessment',
            description: 'Test your understanding of tax-saving strategies',
            timeLimit: 25,
            passingScore: 75,
            questions: []
          }
        ],
        caseStudies: [
          {
            id: 'elss-investment-strategy',
            title: 'ELSS Investment Strategy',
            description: 'Optimize ELSS investments for maximum benefit',
            character: 'Kavya',
            scenario: 'Young professional planning tax-saving investments'
          }
        ],
        exercises: [
          {
            id: 'elss-planning',
            title: 'ELSS Investment Planning',
            type: 'planning',
            description: 'Plan optimal ELSS investment strategy'
          }
        ]
      }
      // Continue for modules 19-23...
    };

    // Generate basic content for remaining modules
    for (let i = 19; i <= 23; i++) {
      moduleData[i] = {
        id: i,
        title: `Module ${i}: Advanced Financial Planning`,
        description: `Advanced financial planning concepts for module ${i}`,
        category: "Advanced Planning",
        difficulty: i <= 20 ? "intermediate" : "advanced",
        estimatedTime: 8,
        xpReward: 800,
        color: i <= 20 ? "teal" : "indigo",
        prerequisites: i > 17 ? [i-1] : undefined,
        lessons: [
          {
            id: `lesson-${i}-1`,
            title: `Core Concepts ${i}`,
            description: `Fundamental concepts for module ${i}`,
            type: 'theory',
            duration: 60,
            completed: completedLessons.includes(`lesson-${i}-1`),
            xpReward: 100,
            content: {
              type: 'interactive',
              html: `
                <h2>Module ${i} Core Concepts</h2>
                <p>This lesson covers the fundamental concepts of module ${i}.</p>
                <h3>Key Topics</h3>
                <ul>
                  <li>Topic 1: Advanced planning strategies</li>
                  <li>Topic 2: Risk management techniques</li>
                  <li>Topic 3: Optimization methods</li>
                </ul>
              `,
              interactiveElements: [
                {
                  type: 'calculator',
                  title: 'Module Calculator',
                  description: 'Interactive calculator for module concepts',
                  calculatorType: 'sip'
                }
              ]
            }
          }
        ],
        assessments: [
          {
            id: `module-${i}-assessment`,
            title: `Module ${i} Assessment`,
            description: `Comprehensive assessment for module ${i}`,
            timeLimit: 30,
            passingScore: 75,
            questions: []
          }
        ],
        caseStudies: [
          {
            id: `module-${i}-case-study`,
            title: `Module ${i} Case Study`,
            description: `Real-world application of module ${i} concepts`,
            character: 'Client Profile',
            scenario: `Complex scenario requiring module ${i} expertise`
          }
        ],
        exercises: [
          {
            id: `module-${i}-exercise`,
            title: `Module ${i} Exercise`,
            type: 'planning',
            description: `Practical exercise for module ${i} concepts`
          }
        ]
      };
    }

    return moduleData[moduleNum];
  }

  const calculateOverallProgress = () => {
    const totalItems = moduleContent.lessons.length + 
                      moduleContent.exercises.length + 
                      moduleContent.assessments.length + 
                      moduleContent.caseStudies.length;
    const completedItems = moduleContent.lessons.filter(l => l.completed).length +
                          userProgress.exercisesCompleted +
                          userProgress.assessmentsCompleted +
                          userProgress.caseStudiesCompleted;
    
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'border-purple-200 bg-purple-50/30',
      orange: 'border-orange-200 bg-orange-50/30',
      teal: 'border-teal-200 bg-teal-50/30',
      indigo: 'border-indigo-200 bg-indigo-50/30'
    };
    return colorMap[color] || 'border-gray-200 bg-gray-50/30';
  };

  const handleLessonComplete = (lessonId: string) => {
    onLessonComplete?.(lessonId);
    setUserProgress(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
      totalXp: prev.totalXp + 100
    }));
  };

  const handleAssessmentComplete = (results: any) => {
    setUserProgress(prev => ({
      ...prev,
      assessmentsCompleted: prev.assessmentsCompleted + 1,
      totalXp: prev.totalXp + results.score
    }));
    onProgressUpdate?.({ ...userProgress, assessmentsCompleted: userProgress.assessmentsCompleted + 1 });
  };

  const handleExerciseComplete = (results: any) => {
    setUserProgress(prev => ({
      ...prev,
      exercisesCompleted: prev.exercisesCompleted + 1,
      totalXp: prev.totalXp + 50
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Module Header */}
      <Card className={`border ${getModuleColorClass(moduleContent.color)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{moduleContent.title}</CardTitle>
                <Badge className={getDifficultyColor(moduleContent.difficulty)}>
                  {moduleContent.difficulty}
                </Badge>
                <Badge variant="outline">{moduleContent.category}</Badge>
              </div>
              <p className="text-gray-600 mb-4">{moduleContent.description}</p>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{moduleContent.estimatedTime} hours</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4" />
                  <span>{moduleContent.xpReward} XP</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{moduleContent.lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{moduleContent.assessments.length} assessments</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
              <div className="text-3xl font-bold text-blue-600">
                {calculateOverallProgress().toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {userProgress.totalXp} XP Earned
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          {moduleContent.prerequisites && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Prerequisites: Complete modules {moduleContent.prerequisites.join(', ')} first
                </span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 py-3">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex flex-col items-center space-y-1 py-3">
            <Play className="h-4 w-4" />
            <span className="text-xs">Lessons</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex flex-col items-center space-y-1 py-3">
            <Calculator className="h-4 w-4" />
            <span className="text-xs">Exercises</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex flex-col items-center space-y-1 py-3">
            <Award className="h-4 w-4" />
            <span className="text-xs">Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="case-studies" className="flex flex-col items-center space-y-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">Case Studies</span>
          </TabsTrigger>
          <TabsTrigger value="pathway" className="flex flex-col items-center space-y-1 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Pathway</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Objectives */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moduleContent.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`h-5 w-5 mt-0.5 ${
                        lesson.completed ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {moduleContent.lessons.filter(l => l.completed).length}/{moduleContent.lessons.length}
                  </div>
                  <div className="text-sm text-blue-700">Lessons Completed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userProgress.exercisesCompleted}/{moduleContent.exercises.length}
                  </div>
                  <div className="text-sm text-green-700">Exercises Done</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProgress.assessmentsCompleted}/{moduleContent.assessments.length}
                  </div>
                  <div className="text-sm text-purple-700">Assessments Passed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userProgress.caseStudiesCompleted}/{moduleContent.caseStudies.length}
                  </div>
                  <div className="text-sm text-orange-700">Case Studies</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => setActiveTab('lessons')} className="justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button onClick={() => setActiveTab('exercises')} variant="outline" className="justify-start">
                    <Calculator className="h-4 w-4 mr-2" />
                    Practice Exercises
                  </Button>
                  <Button onClick={() => setActiveTab('assessments')} variant="outline" className="justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <div className="space-y-4">
            {moduleContent.lessons.map((lesson) => (
              <Card key={lesson.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          lesson.completed ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Play className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{lesson.title}</h3>
                        <Badge className={`text-xs ${
                          lesson.type === 'theory' ? 'bg-blue-100 text-blue-800' :
                          lesson.type === 'practical' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {lesson.type}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{lesson.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{lesson.duration} min</span>
                        <span>{lesson.xpReward} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          // Open lesson content
                          setActiveTab('lessons');
                        }}
                        variant={lesson.completed ? "outline" : "default"}
                      >
                        {lesson.completed ? 'Review' : 'Start Lesson'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Lesson Content Preview */}
                  {lesson.content && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <ContentRenderer 
                        content={lesson.content}
                        className="border border-gray-100"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-6">
          <InteractiveExercises
            moduleNumber={moduleNumber}
            moduleTitle={moduleTitle}
            onComplete={handleExerciseComplete}
          />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <ModuleAssessment
            moduleNumber={moduleNumber}
            moduleTitle={moduleTitle}
            onComplete={handleAssessmentComplete}
          />
        </TabsContent>

        {/* Case Studies Tab */}
        <TabsContent value="case-studies" className="space-y-6">
          <div className="space-y-6">
            {moduleContent.caseStudies.map((caseStudy) => (
              <Card key={caseStudy.id} className="border border-gray-200">
                <CardHeader>
                  <CardTitle>{caseStudy.title}</CardTitle>
                  <p className="text-gray-600">{caseStudy.description}</p>
                </CardHeader>
                <CardContent>
                  <CaseStudyComponent
                    caseStudyId={caseStudy.id}
                    title={caseStudy.title}
                    description={caseStudy.description}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learning Pathway Tab */}
        <TabsContent value="pathway" className="space-y-6">
          <LearningPathways
            studentLevel={studentLevel}
            completedModules={[moduleNumber]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}