"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  Trophy, 
  Target, 
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Award,
  Users,
  Search,
  Lock,
  Unlock,
  Calendar,
  BarChart3,
  Brain,
  Briefcase,
  Shield,
  AlertTriangle,
  PieChart,
  Heart,
  DollarSign,
  GraduationCap,
  FileText,
  ThumbsUp,
  Scale,
  ShieldCheck,
  Calculator,
  Home,
  PiggyBank,
  CreditCard,
  Umbrella,
  Zap,
  Timer,
  Filter,
  ChevronRight,
  Folder,
  FolderOpen,
  Book,
  Video,
  Building2,
  TargetIcon,
  ArrowRight,
  Grid,
  List,
  Flame,
  Medal,
  Crown,
  Sparkles,
  Activity
} from "lucide-react";

// Import enhanced components
import LearningPathways from "@/components/learn/LearningPathways";
import ModuleAssessment from "@/components/learn/ModuleAssessment";
import InteractiveExercises from "@/components/learn/InteractiveExercises";

interface EnhancedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  module: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessons: number;
  topics: string[];
  isEnrolled: boolean;
  progress: number;
  xpReward: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  warning?: string;
  icon: any;
  color: string;
  filePath: string;
  lessonsList?: any[];
  completedLessons?: string[];
  // Enhanced features
  moduleNumber?: number;
  hasAssessments: boolean;
  hasExercises: boolean;
  hasCaseStudies: boolean;
  hasCalculators: boolean;
  interactiveLessons: number;
  totalInteractiveFeatures: number;
  lastAccessed?: string;
  nextMilestone?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface LearningStats {
  totalXp: number;
  currentLevel: number;
  nextLevelXp: number;
  completedCourses: number;
  totalCourses: number;
  streak: number;
  studyTime: number; // minutes
  achievements: number;
  certificates: number;
}

export default function EnhancedLearningDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<EnhancedCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnhancedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalXp: 2500,
    currentLevel: 5,
    nextLevelXp: 3000,
    completedCourses: 12,
    totalCourses: 24,
    streak: 7,
    studyTime: 240, // minutes
    achievements: 18,
    certificates: 3
  });

  useEffect(() => {
    loadEnhancedCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterLevel, filterCategory]);

  const loadEnhancedCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/learn');
      const data = await response.json();
      
      if (data.success) {
        // Enhance course data with interactive features
        const enhancedCourses: EnhancedCourse[] = data.data.courses.flatMap((category: any) =>
          category.modules.map((course: any) => ({
            ...course,
            moduleNumber: getModuleNumber(course.id),
            hasAssessments: shouldHaveAssessments(course.id),
            hasExercises: shouldHaveExercises(course.id),
            hasCaseStudies: shouldHaveCaseStudies(course.id),
            hasCalculators: shouldHaveCalculators(course.id),
            interactiveLessons: calculateInteractiveLessons(course),
            totalInteractiveFeatures: calculateTotalFeatures(course),
            lastAccessed: getLastAccessed(course.id),
            nextMilestone: getNextMilestone(course),
            difficulty: getCourseDifficulty(course),
            level: course.level // maintain existing level
          }))
        );
        
        setCourses(enhancedCourses);
      }
    } catch (error) {
      console.error('Error loading enhanced courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleNumber = (courseId: string): number => {
    if (courseId.includes('17') || courseId.includes('banking-insurance')) return 17;
    if (courseId.includes('18') || courseId.includes('tax-planning')) return 18;
    if (courseId.includes('19') || courseId.includes('goal-planning')) return 19;
    if (courseId.includes('20') || courseId.includes('retirement')) return 20;
    if (courseId.includes('21')) return 21;
    if (courseId.includes('22')) return 22;
    if (courseId.includes('23')) return 23;
    return 1;
  };

  const shouldHaveAssessments = (courseId: string): boolean => {
    return getModuleNumber(courseId) >= 17;
  };

  const shouldHaveExercises = (courseId: string): boolean => {
    return true; // All courses should have exercises
  };

  const shouldHaveCaseStudies = (courseId: string): boolean => {
    return courseId.includes('insurance') || courseId.includes('banking') || 
           getModuleNumber(courseId) >= 17;
  };

  const shouldHaveCalculators = (courseId: string): boolean => {
    return courseId.includes('sip') || courseId.includes('insurance') || 
           courseId.includes('retirement') || courseId.includes('tax') ||
           getModuleNumber(courseId) >= 17;
  };

  const calculateInteractiveLessons = (course: any): number => {
    return Math.floor(course.lessons * 0.6); // 60% of lessons have interactive features
  };

  const calculateTotalFeatures = (course: any): number => {
    let features = 0;
    if (shouldHaveCalculators(course.id)) features++;
    if (shouldHaveCaseStudies(course.id)) features++;
    if (shouldHaveAssessments(course.id)) features++;
    if (shouldHaveExercises(course.id)) features++;
    return features;
  };

  const getLastAccessed = (courseId: string): string => {
    // Mock data - in real app, this would come from user progress
    const days = Math.floor(Math.random() * 30);
    return days === 0 ? 'Today' : `${days} days ago`;
  };

  const getNextMilestone = (course: any): string => {
    const remainingLessons = course.lessons - Math.floor((course.progress / 100) * course.lessons);
    if (remainingLessons === 0) return 'Complete assessment';
    if (remainingLessons === 1) return '1 lesson remaining';
    return `${remainingLessons} lessons remaining`;
  };

  const getCourseDifficulty = (course: any): 'beginner' | 'intermediate' | 'advanced' => {
    const moduleNum = getModuleNumber(course.id);
    if (moduleNum >= 21) return 'advanced';
    if (moduleNum >= 17) return 'intermediate';
    return course.level || 'beginner';
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterLevel !== 'all') {
      filtered = filtered.filter(course => course.difficulty === filterLevel);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(course => course.category === filterCategory);
    }

    setFilteredCourses(filtered);
  };

  const handleStartCourse = (course: EnhancedCourse) => {
    router.push(`/learn/enhanced-module/${course.category}/${course.id}`);
  };

  const handleContinueCourse = (course: EnhancedCourse) => {
    router.push(`/learn/enhanced-lesson/${course.category}/${course.id}/lesson-1`);
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
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeatureIcons = (course: EnhancedCourse) => {
    const icons = [];
    if (course.hasCalculators) icons.push({ icon: Calculator, color: 'text-green-600', label: 'Calculators' });
    if (course.hasCaseStudies) icons.push({ icon: Building2, color: 'text-blue-600', label: 'Case Studies' });
    if (course.hasAssessments) icons.push({ icon: Brain, color: 'text-purple-600', label: 'Assessments' });
    if (course.hasExercises) icons.push({ icon: Target, color: 'text-orange-600', label: 'Exercises' });
    return icons;
  };

  const categories = [...new Set(courses.map(course => course.category))];

  if (loading) {
    return (
      <DashboardLayout user={{
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        avatar: "/placeholder-avatar.jpg",
        level: learningStats.currentLevel,
        xp: learningStats.totalXp,
        nextLevelXp: learningStats.nextLevelXp,
        walletBalance: 15000,
        notifications: 3
      }}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enhanced learning dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={{
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      avatar: "/placeholder-avatar.jpg",
      level: learningStats.currentLevel,
      xp: learningStats.totalXp,
      nextLevelXp: learningStats.nextLevelXp,
      walletBalance: 15000,
      notifications: 3
    }}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Master personal finance with interactive tools, assessments, and real-world case studies
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800">
              <Flame className="h-3 w-3 mr-1" />
              {learningStats.streak} Day Streak
            </Badge>
            <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
              <Crown className="h-3 w-3 mr-1" />
              Level {learningStats.currentLevel}
            </Badge>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total XP</p>
                  <p className="text-2xl font-bold text-blue-900">{learningStats.totalXp.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">
                    {learningStats.nextLevelXp - learningStats.totalXp} XP to next level
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Star className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Courses Completed</p>
                  <p className="text-2xl font-bold text-green-900">{learningStats.completedCourses}</p>
                  <p className="text-xs text-green-600">of {learningStats.totalCourses} total</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Trophy className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Study Streak</p>
                  <p className="text-2xl font-bold text-purple-900">{learningStats.streak}</p>
                  <p className="text-xs text-purple-600">days consecutive</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <Flame className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Study Time</p>
                  <p className="text-2xl font-bold text-orange-900">{Math.floor(learningStats.studyTime / 60)}h</p>
                  <p className="text-xs text-orange-600">{learningStats.studyTime % 60}m this week</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <Timer className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Certificates</p>
                  <p className="text-2xl font-bold text-yellow-900">{learningStats.certificates}</p>
                  <p className="text-xs text-yellow-600">{learningStats.achievements} achievements</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <Medal className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 py-3">
              <Home className="h-4 w-4" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex flex-col items-center space-y-1 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="pathways" className="flex flex-col items-center space-y-1 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Pathways</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex flex-col items-center space-y-1 py-3">
              <Brain className="h-4 w-4" />
              <span className="text-xs">Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex flex-col items-center space-y-1 py-3">
              <Target className="h-4 w-4" />
              <span className="text-xs">Practice</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Continue Learning */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Play className="h-5 w-5 text-blue-600" />
                      <span>Continue Learning</span>
                    </CardTitle>
                    <CardDescription>
                      Pick up where you left off with your enrolled courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courses.filter(course => course.isEnrolled && course.progress > 0 && course.progress < 100)
                        .slice(0, 3)
                        .map((course) => (
                          <div key={course.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className={`p-3 rounded-lg ${course.color}`}>
                              <course.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{course.title}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Progress value={course.progress} className="w-20 h-2" />
                                  <span className="text-xs text-gray-600">{course.progress}%</span>
                                </div>
                                <Badge className={getLevelColor(course.difficulty)} variant="outline">
                                  {course.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                {getFeatureIcons(course).slice(0, 3).map((feature, index) => {
                                  const IconComponent = feature.icon;
                                  return (
                                    <div key={index} className="flex items-center space-x-1">
                                      <IconComponent className={`h-3 w-3 ${feature.color}`} />
                                      <span className="text-xs text-gray-500">{feature.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleContinueCourse(course)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Continue
                            </Button>
                          </div>
                        ))}
                      
                      {courses.filter(course => course.isEnrolled && course.progress > 0 && course.progress < 100).length === 0 && (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No courses in progress</p>
                          <Button 
                            onClick={() => setActiveTab('courses')}
                            className="mt-4"
                          >
                            Explore Courses
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Courses */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      <span>Recommended for You</span>
                    </CardTitle>
                    <CardDescription>
                      Based on your learning progress and interests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {courses.filter(course => !course.isEnrolled)
                        .sort((a, b) => b.importance.localeCompare(a.importance))
                        .slice(0, 2)
                        .map((course) => (
                          <div key={course.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                            <div className={`p-3 rounded-lg ${course.color}`}>
                              <course.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge className={getImportanceColor(course.importance)} variant="outline">
                                  {course.importance}
                                </Badge>
                                <Badge className={getLevelColor(course.difficulty)} variant="outline">
                                  {course.difficulty}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-gray-600">+{course.xpReward} XP</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleStartCourse(course)}
                              variant="outline"
                            >
                              Start
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('pathways')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Learning Pathways
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('assessments')}
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Take Assessment
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('exercises')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Practice Exercises
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance Basics Completed</p>
                          <p className="text-xs text-gray-600">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Award className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">7-Day Learning Streak</p>
                          <p className="text-xs text-gray-600">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Medal className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">First Assessment Passed</p>
                          <p className="text-xs text-gray-600">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Filters and Search */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">All Courses</h3>
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
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCourses.map((course) => (
                <Card key={course.id} className={`border-0 shadow-lg hover:shadow-xl transition-shadow ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}>
                  <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'space-y-4'}`}>
                      <div className={`${viewMode === 'list' ? 'p-3' : 'p-4'} rounded-lg ${course.color}`}>
                        <course.icon className={`${viewMode === 'list' ? 'h-6 w-6' : 'h-8 w-8'}`} />
                      </div>
                      
                      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold ${viewMode === 'list' ? 'text-lg' : 'text-xl'}`}>
                            {course.title}
                          </h3>
                          {course.moduleNumber && (
                            <Badge className="bg-blue-100 text-blue-800">
                              M{course.moduleNumber}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <Badge className={getLevelColor(course.difficulty)} variant="outline">
                            {course.difficulty}
                          </Badge>
                          <Badge className={getImportanceColor(course.importance)} variant="outline">
                            {course.importance}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">+{course.xpReward}</span>
                          </div>
                        </div>

                        {/* Interactive Features */}
                        <div className="flex items-center space-x-2 mb-3">
                          {getFeatureIcons(course).map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                              <div key={index} className="flex items-center space-x-1">
                                <IconComponent className={`h-3 w-3 ${feature.color}`} />
                                <span className="text-xs text-gray-500">{feature.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress */}
                        {course.isEnrolled && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          onClick={() => course.isEnrolled ? handleContinueCourse(course) : handleStartCourse(course)}
                          className={`w-full ${course.isEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {course.isEnrolled ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continue Learning
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Start Course
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found matching your criteria</p>
              </div>
            )}
          </TabsContent>

          {/* Learning Pathways Tab */}
          <TabsContent value="pathways" className="space-y-6">
            <LearningPathways
              studentLevel="intermediate"
              completedModules={[17, 18]}
            />
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[17, 18, 19, 20].map((moduleNum) => (
                <Card key={moduleNum} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>Module {moduleNum} Assessment</span>
                    </CardTitle>
                    <CardDescription>
                      Test your knowledge with comprehensive assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ModuleAssessment
                      moduleNumber={moduleNum}
                      moduleTitle={`Module ${moduleNum}`}
                      onComplete={(results) => console.log('Assessment completed:', results)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[17, 18, 19, 20].map((moduleNum) => (
                <Card key={moduleNum} className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span>Module {moduleNum} Exercises</span>
                    </CardTitle>
                    <CardDescription>
                      Practice with interactive exercises and real-world scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InteractiveExercises
                      moduleNumber={moduleNum}
                      moduleTitle={`Module ${moduleNum}`}
                      onComplete={(results) => console.log('Exercise completed:', results)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}