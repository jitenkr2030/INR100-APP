"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  Clock, 
  CheckCircle, 
  Lock,
  Star,
  ArrowLeft,
  Target,
  Award,
  TrendingUp,
  Shield,
  Brain,
  PieChart,
  AlertTriangle,
  Home,
  Zap,
  Building,
  CreditCard,
  Calculator,
  Users,
  BarChart3,
  Trophy,
  Lightbulb,
  ArrowRight,
  Grid,
  List,
  Filter,
  Search
} from "lucide-react";

// Import enhanced components
import ModuleIntegration from "@/components/learn/ModuleIntegration";
import LearningPathways from "@/components/learn/LearningPathways";
import ModuleAssessment from "@/components/learn/ModuleAssessment";
import InteractiveExercises from "@/components/learn/InteractiveExercises";

interface EnhancedCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  moduleNumber?: number;
  duration: string;
  lessons: number;
  xpReward: number;
  progress: number;
  importance: string;
  category: string;
  color: string;
  icon: string;
  topics: string[];
  prerequisites?: number[];
  hasAssessments: boolean;
  hasExercises: boolean;
  hasCaseStudies: boolean;
  hasCalculators: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completedLessons: number;
  enrolled: boolean;
}

export default function EnhancedModulePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<EnhancedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryId = params.category as string;
  const moduleId = params.module as string;

  useEffect(() => {
    loadEnhancedCourseDetail();
  }, [categoryId, moduleId]);

  const loadEnhancedCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn?category=${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        const foundCourse = data.data.courses.find((cat: any) => cat.id === categoryId)
          ?.modules.find((mod: any) => mod.id === moduleId);
        
        if (foundCourse) {
          // Enhance course data with interactive features
          const enhancedCourse: EnhancedCourse = {
            ...foundCourse,
            moduleNumber: getModuleNumber(moduleId),
            hasAssessments: shouldHaveAssessments(moduleId),
            hasExercises: shouldHaveExercises(moduleId),
            hasCaseStudies: shouldHaveCaseStudies(moduleId),
            hasCalculators: shouldHaveCalculators(moduleId),
            difficulty: getModuleDifficulty(moduleId),
            completedLessons: Math.floor((foundCourse.progress / 100) * foundCourse.lessons),
            enrolled: foundCourse.isEnrolled || true
          };
          
          setCourse(enhancedCourse);
        }
      }
    } catch (error) {
      console.error('Error loading enhanced course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleNumber = (moduleId: string): number => {
    if (moduleId.includes('17')) return 17;
    if (moduleId.includes('18')) return 18;
    if (moduleId.includes('19')) return 19;
    if (moduleId.includes('20')) return 20;
    if (moduleId.includes('21')) return 21;
    if (moduleId.includes('22')) return 22;
    if (moduleId.includes('23')) return 23;
    return 17;
  };

  const shouldHaveAssessments = (moduleId: string): boolean => {
    return moduleId.includes('17') || moduleId.includes('18') || 
           moduleId.includes('19') || moduleId.includes('20') ||
           moduleId.includes('21') || moduleId.includes('22') || moduleId.includes('23');
  };

  const shouldHaveExercises = (moduleId: string): boolean => {
    return true; // All modules should have exercises
  };

  const shouldHaveCaseStudies = (moduleId: string): boolean => {
    return moduleId.includes('insurance') || moduleId.includes('17') || 
           moduleId.includes('18') || moduleId.includes('19');
  };

  const shouldHaveCalculators = (moduleId: string): boolean => {
    return moduleId.includes('sip') || moduleId.includes('insurance') || 
           moduleId.includes('retirement') || moduleId.includes('tax') ||
           moduleId.includes('17') || moduleId.includes('18') || 
           moduleId.includes('19') || moduleId.includes('20');
  };

  const getModuleDifficulty = (moduleId: string): 'beginner' | 'intermediate' | 'advanced' => {
    const moduleNum = getModuleNumber(moduleId);
    if (moduleNum >= 21) return 'advanced';
    if (moduleNum >= 17) return 'intermediate';
    return 'beginner';
  };

  const handleEnroll = async () => {
    try {
      setCourse(prev => prev ? { ...prev, enrolled: true, progress: 0 } : null);
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const handleStartCourse = () => {
    router.push(`/learn/enhanced-lesson/${categoryId}/${moduleId}/lesson-1`);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      BookOpen, TrendingUp, PieChart, Brain, Shield, 
      AlertTriangle, Home, Building, CreditCard, Target, 
      Zap, Award, Calculator, Users, BarChart3, Trophy
    };
    return icons[iconName] || BookOpen;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureBadges = (course: EnhancedCourse) => {
    const badges = [];
    if (course.hasCalculators) badges.push({ label: 'Calculators', color: 'bg-green-100 text-green-800', icon: Calculator });
    if (course.hasCaseStudies) badges.push({ label: 'Case Studies', color: 'bg-blue-100 text-blue-800', icon: Building });
    if (course.hasAssessments) badges.push({ label: 'Assessments', color: 'bg-purple-100 text-purple-800', icon: Brain });
    if (course.hasExercises) badges.push({ label: 'Exercises', color: 'bg-orange-100 text-orange-800', icon: Target });
    return badges;
  };

  const handleAssessmentComplete = (results: any) => {
    console.log('Module assessment completed:', results);
    // Update course progress
    setCourse(prev => prev ? { 
      ...prev, 
      progress: Math.min(100, prev.progress + 10),
      completedLessons: prev.completedLessons + 1
    } : null);
  };

  const handleExerciseComplete = (results: any) => {
    console.log('Exercise completed:', results);
    // Update progress
  };

  if (loading) {
    return (
      <DashboardLayout user={{
        name: "Demo User",
        email: "demo@example.com",
        avatar: "/placeholder-avatar.jpg",
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        walletBalance: 0,
        notifications: 0
      }}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enhanced course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout user={{
        name: "Demo User",
        email: "demo@example.com",
        avatar: "/placeholder-avatar.jpg",
        level: 1,
        xp: 0,
        nextLevelXp: 1000,
        walletBalance: 0,
        notifications: 0
      }}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The requested course could not be found.</p>
          <Button onClick={() => router.push('/learn')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learn
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const IconComponent = getIconComponent(course.icon);
  const featureBadges = getFeatureBadges(course);

  return (
    <DashboardLayout user={{
      name: "Demo User",
      email: "demo@example.com",
      avatar: "/placeholder-avatar.jpg",
      level: 1,
      xp: 0,
      nextLevelXp: 1000,
      walletBalance: 0,
      notifications: 0
    }}>
      <div className="space-y-6">
        {/* Enhanced Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.push('/learn')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>

        {/* Enhanced Course Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-lg ${course.color}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    {course.moduleNumber && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Module {course.moduleNumber}
                      </Badge>
                    )}
                    <Badge className={getImportanceColor(course.importance)}>
                      {course.importance.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-base mb-4">
                    {course.description}
                  </CardDescription>
                  
                  {/* Feature Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    {featureBadges.map((badge, index) => {
                      const BadgeIcon = badge.icon;
                      return (
                        <Badge key={index} className={`${badge.color} flex items-center space-x-1`}>
                          <BadgeIcon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </Badge>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{course.topics.length} topics</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>+{course.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getLevelColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <div className="mt-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    <Star className="h-3 w-3 mr-1" />
                    +{course.xpReward} XP
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 py-3">
              <Home className="h-4 w-4" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex flex-col items-center space-y-1 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex flex-col items-center space-y-1 py-3">
              <Target className="h-4 w-4" />
              <span className="text-xs">Exercises</span>
            </TabsTrigger>
            {course.hasAssessments && (
              <TabsTrigger value="assessments" className="flex flex-col items-center space-y-1 py-3">
                <Brain className="h-4 w-4" />
                <span className="text-xs">Assessments</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="pathway" className="flex flex-col items-center space-y-1 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Pathway</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex flex-col items-center space-y-1 py-3">
              <Grid className="h-4 w-4" />
              <span className="text-xs">All Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Enhanced Progress Card */}
                {course.enrolled && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Your Learning Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-3" />
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {course.completedLessons}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">
                              {course.lessons - course.completedLessons}
                            </div>
                            <div className="text-sm text-gray-600">Remaining</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.floor((course.progress / 100) * course.xpReward)}
                            </div>
                            <div className="text-sm text-gray-600">XP Earned</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {course.moduleNumber || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Module</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enhanced Topics Covered */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>What You'll Master</CardTitle>
                    <CardDescription>
                      This enhanced course covers {course.topics.length} key topics with interactive elements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {course.topics.map((topic: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-900 font-medium">{topic}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              {index < 3 && course.hasCalculators && (
                                <Badge variant="outline" className="text-xs">Calculator</Badge>
                              )}
                              {index < 2 && course.hasCaseStudies && (
                                <Badge variant="outline" className="text-xs">Case Study</Badge>
                              )}
                              {course.hasExercises && (
                                <Badge variant="outline" className="text-xs">Exercise</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Course Benefits */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Enhanced Learning Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-yellow-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Interactive Learning</h4>
                            <p className="text-sm text-gray-600">Hands-on calculators, case studies, and real-world scenarios</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Comprehensive Assessments</h4>
                            <p className="text-sm text-gray-600">Test your knowledge with detailed feedback and scoring</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Target className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Practical Exercises</h4>
                            <p className="text-sm text-gray-600">Practice with guided exercises and step-by-step solutions</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Star className="h-5 w-5 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">XP Reward System</h4>
                            <p className="text-sm text-gray-600">Earn up to {course.xpReward} experience points</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <TrendingUp className="h-5 w-5 text-orange-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Learning Pathways</h4>
                            <p className="text-sm text-gray-600">Structured progression with clear milestones</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Users className="h-5 w-5 text-teal-600 mt-1" />
                          <div>
                            <h4 className="font-semibold">Expert Content</h4>
                            <p className="text-sm text-gray-600">Learn from real-world examples and industry insights</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Enhanced Enrollment Card */}
                <Card className="border-0 shadow-lg sticky top-6">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      {course.enrolled ? (
                        <>
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-600">You're Enrolled!</h3>
                            <p className="text-sm text-gray-600">Continue your enhanced learning journey</p>
                          </div>
                          <Button 
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            onClick={handleStartCourse}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            {course.progress > 0 ? 'Continue Learning' : 'Start Enhanced Course'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Start Enhanced Learning</h3>
                            <p className="text-sm text-gray-600">Join thousands of learners</p>
                          </div>
                          <Button 
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            onClick={handleEnroll}
                          >
                            Enroll Now - Free
                          </Button>
                        </>
                      )}
                      
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{course.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Lessons:</span>
                            <span className="font-medium">{course.lessons}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Interactive Tools:</span>
                            <span className="font-medium">{featureBadges.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>XP Reward:</span>
                            <span className="font-medium text-purple-600">+{course.xpReward}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Access Tools */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Access</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('exercises')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Practice Exercises
                    </Button>
                    
                    {course.hasAssessments && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('assessments')}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Module Assessment
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('pathway')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Learning Pathways
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/learn')}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Learning Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Course Lessons</h3>
                <p className="text-sm text-gray-600">Navigate through all lessons with enhanced features</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lessons Grid/List would go here */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">Enhanced Lessons Coming Soon</h3>
              <p className="text-blue-700">
                Individual lesson navigation with interactive features will be implemented here.
              </p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={handleStartCourse}
              >
                Start Learning Now
              </Button>
            </div>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <InteractiveExercises
              moduleNumber={course.moduleNumber || 17}
              moduleTitle={course.title}
              onComplete={handleExerciseComplete}
            />
          </TabsContent>

          {/* Assessments Tab */}
          {course.hasAssessments && (
            <TabsContent value="assessments" className="space-y-6">
              <ModuleAssessment
                moduleNumber={course.moduleNumber || 17}
                moduleTitle={course.title}
                onComplete={handleAssessmentComplete}
              />
            </TabsContent>
          )}

          {/* Learning Pathway Tab */}
          <TabsContent value="pathway" className="space-y-6">
            <LearningPathways
              studentLevel={course.difficulty}
              completedModules={course.enrolled ? [course.moduleNumber || 17] : []}
            />
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <ModuleIntegration
              moduleNumber={course.moduleNumber || 17}
              moduleTitle={course.title}
              studentLevel={course.difficulty}
              onProgressUpdate={(progress) => console.log('Progress updated:', progress)}
              onLessonComplete={(lessonId) => console.log('Lesson completed:', lessonId)}
              completedLessons={[]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}