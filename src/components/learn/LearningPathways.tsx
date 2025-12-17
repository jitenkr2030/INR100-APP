"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  Target, 
  ArrowRight, 
  Lock,
  Trophy,
  TrendingUp,
  Users,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Zap,
  Crown,
  Play,
  Pause,
  RotateCcw,
  Download
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  xpReward: number;
  completed: boolean;
  locked: boolean;
  type: 'theory' | 'practical' | 'assessment' | 'case-study';
  progress?: number;
}

interface Module {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // hours
  lessons: Lesson[];
  prerequisites?: number[];
  unlocksAt?: number;
  color: string;
}

interface LearningPathway {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  totalDuration: number;
  xpTotal: number;
  certificateEligible: boolean;
  careerPath: string;
}

interface LearningPathwaysProps {
  studentLevel: 'beginner' | 'intermediate' | 'advanced';
  completedModules?: number[];
  onModuleSelect?: (moduleId: number) => void;
  onLessonSelect?: (lessonId: string) => void;
}

export default function LearningPathways({ 
  studentLevel, 
  completedModules = [], 
  onModuleSelect,
  onLessonSelect 
}: LearningPathwaysProps) {
  const [selectedPathway, setSelectedPathway] = useState<LearningPathway | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [pathways] = useState(getLearningPathways(studentLevel));

  function getLearningPathways(level: string): LearningPathway[] {
    const basePathways: Record<string, LearningPathway> = {
      beginner: {
        id: 'foundation-building',
        title: 'Foundation Building Pathway',
        description: 'Start your financial literacy journey with core concepts and essential planning skills',
        careerPath: 'Financial Planning Specialist',
        totalDuration: 25,
        xpTotal: 2500,
        certificateEligible: true,
        modules: [
          {
            id: 1,
            title: 'Financial Literacy Fundamentals',
            description: 'Master the basics of personal finance, budgeting, and money management',
            category: 'Foundations',
            difficulty: 'beginner',
            estimatedTime: 4,
            color: 'blue',
            lessons: [
              {
                id: 'lesson-1-1',
                title: 'Introduction to Personal Finance',
                description: 'Understanding money management basics',
                duration: 30,
                difficulty: 'beginner',
                xpReward: 50,
                completed: completedModules.includes(1),
                locked: false,
                type: 'theory',
                progress: userProgress['lesson-1-1'] || 0
              },
              {
                id: 'lesson-1-2',
                title: 'Budgeting and Cash Flow Management',
                description: 'Learn to create and manage budgets effectively',
                duration: 45,
                difficulty: 'beginner',
                xpReward: 75,
                completed: completedModules.includes(1),
                locked: false,
                type: 'practical',
                progress: userProgress['lesson-1-2'] || 0
              },
              {
                id: 'lesson-1-3',
                title: 'Emergency Fund Planning',
                description: 'Build financial safety net for unexpected events',
                duration: 35,
                difficulty: 'beginner',
                xpReward: 60,
                completed: completedModules.includes(1),
                locked: false,
                type: 'practical',
                progress: userProgress['lesson-1-3'] || 0
              }
            ]
          },
          {
            id: 2,
            title: 'Banking and Savings',
            description: 'Navigate banking products and optimize your savings strategy',
            category: 'Foundations',
            difficulty: 'beginner',
            estimatedTime: 3,
            color: 'green',
            lessons: [
              {
                id: 'lesson-2-1',
                title: 'Banking Products Overview',
                description: 'Understanding different banking products and services',
                duration: 40,
                difficulty: 'beginner',
                xpReward: 65,
                completed: completedModules.includes(2),
                locked: false,
                type: 'theory',
                progress: userProgress['lesson-2-1'] || 0
              },
              {
                id: 'lesson-2-2',
                title: 'Savings Optimization Strategies',
                description: 'Maximize returns on your savings',
                duration: 35,
                difficulty: 'beginner',
                xpReward: 55,
                completed: completedModules.includes(2),
                locked: false,
                type: 'practical',
                progress: userProgress['lesson-2-2'] || 0
              }
            ]
          },
          {
            id: 3,
            title: 'Credit and Debt Management',
            description: 'Learn responsible borrowing and debt elimination strategies',
            category: 'Foundations',
            difficulty: 'beginner',
            estimatedTime: 4,
            color: 'red',
            lessons: [
              {
                id: 'lesson-3-1',
                title: 'Understanding Credit Scores',
                description: 'Build and maintain good creditworthiness',
                duration: 45,
                difficulty: 'beginner',
                xpReward: 70,
                completed: completedModules.includes(3),
                locked: false,
                type: 'theory',
                progress: userProgress['lesson-3-1'] || 0
              },
              {
                id: 'lesson-3-2',
                title: 'Debt Elimination Strategies',
                description: 'Systematic approaches to become debt-free',
                duration: 50,
                difficulty: 'beginner',
                xpReward: 80,
                completed: completedModules.includes(3),
                locked: false,
                type: 'practical',
                progress: userProgress['lesson-3-2'] || 0
              }
            ]
          }
        ]
      },
      intermediate: {
        id: 'wealth-building-mastery',
        title: 'Wealth Building Mastery Pathway',
        description: 'Advance your financial skills with investment strategies and comprehensive planning',
        careerPath: 'Investment Advisor',
        totalDuration: 40,
        xpTotal: 4000,
        certificateEligible: true,
        modules: [
          {
            id: 17,
            title: 'Insurance & Risk Management',
            description: 'Comprehensive coverage planning and risk assessment strategies',
            category: 'Protection',
            difficulty: 'intermediate',
            estimatedTime: 6,
            color: 'purple',
            prerequisites: [1, 2, 3],
            unlocksAt: 3,
            lessons: [
              {
                id: 'lesson-17-1',
                title: 'Life Insurance Fundamentals',
                description: 'Understanding life insurance types and coverage calculations',
                duration: 50,
                difficulty: 'intermediate',
                xpReward: 100,
                completed: completedModules.includes(17),
                locked: !completedModules.includes(3),
                type: 'theory',
                progress: userProgress['lesson-17-1'] || 0
              },
              {
                id: 'lesson-17-2',
                title: 'Health Insurance Planning',
                description: 'Comprehensive health coverage strategy',
                duration: 45,
                difficulty: 'intermediate',
                xpReward: 90,
                completed: completedModules.includes(17),
                locked: !completedModules.includes(3),
                type: 'practical',
                progress: userProgress['lesson-17-2'] || 0
              },
              {
                id: 'lesson-17-3',
                title: 'Risk Assessment and Mitigation',
                description: 'Identifying and managing financial risks',
                duration: 55,
                difficulty: 'intermediate',
                xpReward: 110,
                completed: completedModules.includes(17),
                locked: !completedModules.includes(3),
                type: 'practical',
                progress: userProgress['lesson-17-3'] || 0
              }
            ]
          },
          {
            id: 18,
            title: 'Tax Planning & Investment',
            description: 'Optimize taxes while building wealth through strategic investments',
            category: 'Tax Optimization',
            difficulty: 'intermediate',
            estimatedTime: 7,
            color: 'orange',
            prerequisites: [17],
            unlocksAt: 17,
            lessons: [
              {
                id: 'lesson-18-1',
                title: 'Tax-Saving Investment Options',
                description: 'ELSS, PPF, and other tax-saving instruments',
                duration: 60,
                difficulty: 'intermediate',
                xpReward: 120,
                completed: completedModules.includes(18),
                locked: !completedModules.includes(17),
                type: 'practical',
                progress: userProgress['lesson-18-1'] || 0
              },
              {
                id: 'lesson-18-2',
                title: 'ELSS Fund Strategy',
                description: 'Maximizing returns through ELSS investments',
                duration: 50,
                difficulty: 'intermediate',
                xpReward: 100,
                completed: completedModules.includes(18),
                locked: !completedModules.includes(17),
                type: 'practical',
                progress: userProgress['lesson-18-2'] || 0
              }
            ]
          },
          {
            id: 19,
            title: 'Goal-Based Investment Planning',
            description: 'Create systematic investment plans for life goals',
            category: 'Strategic Planning',
            difficulty: 'intermediate',
            estimatedTime: 8,
            color: 'teal',
            prerequisites: [18],
            unlocksAt: 18,
            lessons: [
              {
                id: 'lesson-19-1',
                title: 'Financial Goal Setting',
                description: 'Setting SMART financial goals',
                duration: 45,
                difficulty: 'intermediate',
                xpReward: 90,
                completed: completedModules.includes(19),
                locked: !completedModules.includes(18),
                type: 'practical',
                progress: userProgress['lesson-19-1'] || 0
              },
              {
                id: 'lesson-19-2',
                title: 'SIP Planning and Execution',
                description: 'Systematic Investment Plan strategies',
                duration: 65,
                difficulty: 'intermediate',
                xpReward: 130,
                completed: completedModules.includes(19),
                locked: !completedModules.includes(18),
                type: 'practical',
                progress: userProgress['lesson-19-2'] || 0
              }
            ]
          }
        ]
      },
      advanced: {
        id: 'financial-expertise-mastery',
        title: 'Financial Expertise Mastery Pathway',
        description: 'Master advanced financial planning, portfolio management, and wealth optimization',
        careerPath: 'Certified Financial Planner',
        totalDuration: 60,
        xpTotal: 6000,
        certificateEligible: true,
        modules: [
          {
            id: 20,
            title: 'Retirement Planning Mastery',
            description: 'Comprehensive retirement corpus planning and optimization',
            category: 'Long-term Planning',
            difficulty: 'advanced',
            estimatedTime: 10,
            color: 'indigo',
            prerequisites: [17, 18, 19],
            unlocksAt: 19,
            lessons: [
              {
                id: 'lesson-20-1',
                title: 'Retirement Corpus Calculation',
                description: 'Advanced retirement planning methodologies',
                duration: 70,
                difficulty: 'advanced',
                xpReward: 140,
                completed: completedModules.includes(20),
                locked: !completedModules.includes(19),
                type: 'practical',
                progress: userProgress['lesson-20-1'] || 0
              },
              {
                id: 'lesson-20-2',
                title: 'Retirement Asset Allocation',
                description: 'Optimizing portfolio for retirement',
                duration: 80,
                difficulty: 'advanced',
                xpReward: 160,
                completed: completedModules.includes(20),
                locked: !completedModules.includes(19),
                type: 'practical',
                progress: userProgress['lesson-20-2'] || 0
              }
            ]
          },
          {
            id: 21,
            title: 'Portfolio Management',
            description: 'Advanced portfolio construction and rebalancing strategies',
            category: 'Investment Management',
            difficulty: 'advanced',
            estimatedTime: 12,
            color: 'pink',
            prerequisites: [20],
            unlocksAt: 20,
            lessons: [
              {
                id: 'lesson-21-1',
                title: 'Modern Portfolio Theory',
                description: 'Academic foundations of portfolio management',
                duration: 90,
                difficulty: 'advanced',
                xpReward: 180,
                completed: completedModules.includes(21),
                locked: !completedModules.includes(20),
                type: 'theory',
                progress: userProgress['lesson-21-1'] || 0
              }
            ]
          },
          {
            id: 22,
            title: 'Estate Planning',
            description: 'Wealth transfer and estate optimization strategies',
            category: 'Wealth Transfer',
            difficulty: 'advanced',
            estimatedTime: 10,
            color: 'gray',
            prerequisites: [21],
            unlocksAt: 21,
            lessons: [
              {
                id: 'lesson-22-1',
                title: 'Estate Planning Fundamentals',
                description: 'Basics of wealth transfer planning',
                duration: 75,
                difficulty: 'advanced',
                xpReward: 150,
                completed: completedModules.includes(22),
                locked: !completedModules.includes(21),
                type: 'theory',
                progress: userProgress['lesson-22-1'] || 0
              }
            ]
          },
          {
            id: 23,
            title: 'Advanced Tax Optimization',
            description: 'Sophisticated tax planning strategies for high-net-worth individuals',
            category: 'Tax Expertise',
            difficulty: 'advanced',
            estimatedTime: 15,
            color: 'yellow',
            prerequisites: [22],
            unlocksAt: 22,
            lessons: [
              {
                id: 'lesson-23-1',
                title: 'Advanced Tax Strategies',
                description: 'Sophisticated tax optimization techniques',
                duration: 90,
                difficulty: 'advanced',
                xpReward: 200,
                completed: completedModules.includes(23),
                locked: !completedModules.includes(22),
                type: 'theory',
                progress: userProgress['lesson-23-1'] || 0
              }
            ]
          }
        ]
      }
    };

    return [basePathways[level]];
  }

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  const getPathwayProgress = (pathway: LearningPathway) => {
    const totalLessons = pathway.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const completedLessons = pathway.modules.reduce((sum, module) => 
      sum + module.lessons.filter(lesson => lesson.completed).length, 0);
    return (completedLessons / totalLessons) * 100;
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
      blue: 'border-blue-200 bg-blue-50/30',
      green: 'border-green-200 bg-green-50/30',
      red: 'border-red-200 bg-red-50/30',
      purple: 'border-purple-200 bg-purple-50/30',
      orange: 'border-orange-200 bg-orange-50/30',
      teal: 'border-teal-200 bg-teal-50/30',
      indigo: 'border-indigo-200 bg-indigo-50/30',
      pink: 'border-pink-200 bg-pink-50/30',
      gray: 'border-gray-200 bg-gray-50/30',
      yellow: 'border-yellow-200 bg-yellow-50/30'
    };
    return colorMap[color] || 'border-gray-200 bg-gray-50/30';
  };

  if (!selectedPathway) {
    // Pathway Selection Screen
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Pathway</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select a learning pathway tailored to your current level and career goals. Each pathway includes 
            structured modules, interactive exercises, and real-world case studies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pathways.map((pathway) => (
            <Card key={pathway.id} className="border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => setSelectedPathway(pathway)}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDifficultyColor(pathway.modules[0]?.difficulty || 'beginner')}>
                    {pathway.modules[0]?.difficulty || 'beginner'}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {pathway.certificateEligible && 'Certificate'}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{pathway.title}</CardTitle>
                <p className="text-gray-600">{pathway.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Career Path:</span>
                    <span className="font-medium">{pathway.careerPath}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{pathway.totalDuration} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">XP Reward:</span>
                    <span className="font-medium">{pathway.xpTotal} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Modules:</span>
                    <span className="font-medium">{pathway.modules.length}</span>
                  </div>

                  {/* Progress indicator if partially completed */}
                  {getPathwayProgress(pathway) > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{getPathwayProgress(pathway).toFixed(1)}%</span>
                      </div>
                      <Progress value={getPathwayProgress(pathway)} />
                    </div>
                  )}

                  <Button className="w-full mt-4" onClick={() => setSelectedPathway(pathway)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Pathway
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Pathway Detail View
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Pathway Header */}
      <Card className="border border-blue-200 bg-blue-50/30">
        <CardHeader>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPathway(null)}
            className="mb-4"
          >
            ← Back to Pathways
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-900">{selectedPathway.title}</CardTitle>
              <p className="text-blue-700">{selectedPathway.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{selectedPathway.careerPath}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{selectedPathway.totalDuration} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">{selectedPathway.xpTotal} XP</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 mb-2">Pathway Progress</div>
              <div className="text-2xl font-bold text-blue-900">
                {getPathwayProgress(selectedPathway).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <Progress value={getPathwayProgress(selectedPathway)} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Modules */}
      <div className="space-y-6">
        {selectedPathway.modules.map((module) => (
          <Card key={module.id} className={`border ${getModuleColorClass(module.color)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <Badge variant="outline">{module.category}</Badge>
                  </div>
                  <p className="text-gray-600">{module.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Module Progress</div>
                  <div className="text-lg font-bold">
                    {getModuleProgress(module).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{module.estimatedTime} hours</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{module.lessons.length} lessons</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{module.lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0)} XP</span>
                </div>
                
                {/* Prerequisites */}
                {module.prerequisites && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>Requires: Modules {module.prerequisites.join(', ')}</span>
                  </div>
                )}
              </div>

              <Progress value={getModuleProgress(module)} className="mt-4" />
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                >
                  {expandedModule === module.id ? 'Hide Lessons' : 'Show Lessons'}
                  <ArrowRight className={`h-4 w-4 ml-2 transition-transform ${
                    expandedModule === module.id ? 'rotate-90' : ''
                  }`} />
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onModuleSelect?.(module.id)}
                    disabled={module.prerequisites && !module.prerequisites.every(req => completedModules.includes(req))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {module.prerequisites && !module.prerequisites.every(req => completedModules.includes(req)) ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Module
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Expanded Lessons */}
            {expandedModule === module.id && (
              <CardContent>
                <div className="space-y-4">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : lesson.locked ? (
                            <Lock className="h-5 w-5 text-gray-400" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">{lesson.duration} min</span>
                            <Badge className={`text-xs ${
                              lesson.type === 'theory' ? 'bg-blue-100 text-blue-800' :
                              lesson.type === 'practical' ? 'bg-green-100 text-green-800' :
                              lesson.type === 'assessment' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {lesson.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{lesson.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {lesson.progress !== undefined && lesson.progress > 0 && lesson.progress < 100 && (
                          <div className="text-xs text-gray-500">
                            {lesson.progress.toFixed(0)}%
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={() => onLessonSelect?.(lesson.id)}
                          disabled={lesson.locked}
                          variant={lesson.completed ? "outline" : "default"}
                        >
                          {lesson.completed ? 'Review' : lesson.locked ? 'Locked' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Certificate Information */}
      {selectedPathway.certificateEligible && getPathwayProgress(selectedPathway) === 100 && (
        <Card className="border border-gold-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <Crown className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-900 mb-2">Congratulations!</h3>
            <p className="text-yellow-800 mb-4">
              You've completed the {selectedPathway.title}. You're now eligible for certification!
            </p>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}