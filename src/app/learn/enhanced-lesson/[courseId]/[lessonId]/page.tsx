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
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trophy,
  Play,
  Calculator,
  Award,
  Building2,
  Target,
  Brain,
  Users,
  Star,
  Lightbulb,
  TrendingUp,
  Home
} from "lucide-react";

// Import enhanced components
import ContentRenderer from "@/components/learn/ContentRenderer";
import ModuleAssessment from "@/components/learn/ModuleAssessment";
import InteractiveExercises from "@/components/learn/InteractiveExercises";
import CaseStudyComponent from "@/components/learn/CaseStudyComponent";
import LearningPathways from "@/components/learn/LearningPathways";

interface EnhancedLesson {
  id: string;
  title: string;
  content: any;
  duration: number;
  xpReward: number;
  order: number;
  type: 'theory' | 'practical' | 'interactive' | 'assessment';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  hasCalculator?: boolean;
  hasCaseStudy?: boolean;
  hasQuiz?: boolean;
  hasExercises?: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  moduleNumber?: number;
  lessons: number;
  lessonsList: EnhancedLesson[];
  progress: number;
}

export default function EnhancedLessonViewer() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<EnhancedLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<EnhancedLesson | null>(null);
  const [previousLesson, setPreviousLesson] = useState<EnhancedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [showAssessment, setShowAssessment] = useState(false);
  const [showExercises, setShowExercises] = useState(false);

  // Timer for tracking time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch course and lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const userId = "demo-user-id";
        const response = await fetch(`/api/learn/lesson/${courseId}/${lessonId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Enhanced course data with interactive features
          const enhancedCourse = {
            ...data.course,
            moduleNumber: getModuleNumberFromCourseId(courseId),
            lessonsList: data.course.lessonsList.map((lesson: any) => ({
              ...lesson,
              type: getLessonType(lesson.id),
              difficulty: getLessonDifficulty(lesson.id),
              hasCalculator: hasCalculatorFeature(lesson.id),
              hasCaseStudy: hasCaseStudyFeature(lesson.id),
              hasQuiz: hasQuizFeature(lesson.id),
              hasExercises: hasExercisesFeature(lesson.id)
            }))
          };

          setCourse(enhancedCourse);
          setCurrentLesson(data.currentLesson ? {
            ...data.currentLesson,
            type: getLessonType(data.currentLesson.id),
            difficulty: getLessonDifficulty(data.currentLesson.id),
            hasCalculator: hasCalculatorFeature(data.currentLesson.id),
            hasCaseStudy: hasCaseStudyFeature(data.currentLesson.id),
            hasQuiz: hasQuizFeature(data.currentLesson.id),
            hasExercises: hasExercisesFeature(data.currentLesson.id)
          } : null);
          setNextLesson(data.nextLesson);
          setPreviousLesson(data.previousLesson);
          
          // Start lesson tracking
          await fetch('/api/learn/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              courseId,
              lessonId,
              action: 'start_lesson'
            })
          });
        } else {
          console.error("Failed to fetch lesson data:", data.error);
          router.push('/learn');
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        router.push('/learn');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLessonData();
    }
  }, [courseId, lessonId]);

  // Helper functions for enhanced features
  const getModuleNumberFromCourseId = (id: string): number => {
    if (id.includes('banking-insurance')) return 17;
    if (id.includes('module-17')) return 17;
    if (id.includes('module-18')) return 18;
    if (id.includes('module-19')) return 19;
    if (id.includes('module-20')) return 20;
    if (id.includes('module-21')) return 21;
    if (id.includes('module-22')) return 22;
    if (id.includes('module-23')) return 23;
    return 17; // default
  };

  const getLessonType = (id: string): 'theory' | 'practical' | 'interactive' | 'assessment' => {
    if (id.includes('assessment') || id.includes('quiz')) return 'assessment';
    if (id.includes('exercise') || id.includes('practice')) return 'interactive';
    if (id.includes('calculator') || id.includes('case-study')) return 'interactive';
    return 'theory';
  };

  const getLessonDifficulty = (id: string): 'beginner' | 'intermediate' | 'advanced' => {
    if (id.includes('advanced') || id.includes('expert')) return 'advanced';
    if (id.includes('intermediate') || id.includes('moderate')) return 'intermediate';
    return 'beginner';
  };

  const hasCalculatorFeature = (id: string): boolean => {
    return id.includes('sip') || id.includes('insurance') || id.includes('retirement') || 
           id.includes('compound') || id.includes('tax');
  };

  const hasCaseStudyFeature = (id: string): boolean => {
    return id.includes('case') || id.includes('real-world') || id.includes('scenario') ||
           id.includes('planning') || id.includes('insurance');
  };

  const hasQuizFeature = (id: string): boolean => {
    return true; // All lessons have quizzes
  };

  const hasExercisesFeature = (id: string): boolean => {
    return id.includes('exercise') || id.includes('practice') || id.includes('calculation') ||
           id.includes('planning');
  };

  const handleCompleteLesson = async () => {
    try {
      const userId = "demo-user-id";
      
      const response = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId,
          lessonId,
          action: 'complete_lesson',
          timeSpent
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsCompleted(true);
        alert(`Lesson completed! You earned ${data.xpEarned} XP! ${data.certificateGenerated ? '🎉 Certificate generated!' : ''}`);
        
        // Navigate to next lesson if available
        if (course && course.lessonsList) {
          const currentIndex = course.lessonsList.findIndex(l => l.id === lessonId);
          if (currentIndex < course.lessonsList.length - 1) {
            const nextLesson = course.lessonsList[currentIndex + 1];
            router.push(`/learn/enhanced-lesson/${courseId}/${nextLesson.id}`);
          } else {
            // Course completed
            alert("🎉 Congratulations! You've completed the entire course!");
            router.push('/learn');
          }
        }
      } else {
        alert(data.error || "Failed to complete lesson");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
      alert("Failed to complete lesson. Please try again.");
    }
  };

  const handleAssessmentComplete = (results: any) => {
    console.log('Assessment completed:', results);
    // Update progress and XP
    setIsCompleted(true);
    alert(`Assessment completed! Score: ${results.percentage.toFixed(1)}%`);
  };

  const handleExerciseComplete = (results: any) => {
    console.log('Exercise completed:', results);
    // Update progress
    alert('Exercise completed successfully!');
  };

  const goToPreviousLesson = () => {
    if (!previousLesson) return;
    router.push(`/learn/enhanced-lesson/${courseId}/${previousLesson.id}`);
  };

  const goToNextLesson = () => {
    if (!nextLesson) return;
    router.push(`/learn/enhanced-lesson/${courseId}/${nextLesson.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theory': return BookOpen;
      case 'practical': return Calculator;
      case 'interactive': return Play;
      case 'assessment': return Award;
      default: return BookOpen;
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={{
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        avatar: "/placeholder-avatar.jpg",
        level: 5,
        xp: 2500,
        nextLevelXp: 3000,
        walletBalance: 15000,
        notifications: 3
      }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enhanced lesson...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course || !currentLesson) {
    return (
      <DashboardLayout user={{
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        avatar: "/placeholder-avatar.jpg",
        level: 5,
        xp: 2500,
        nextLevelXp: 3000,
        walletBalance: 15000,
        notifications: 3
      }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-4">The requested lesson could not be found.</p>
            <Button onClick={() => router.push('/learn')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learning
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const TypeIcon = getTypeIcon(currentLesson.type);

  return (
    <DashboardLayout user={{
      name: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      avatar: "/placeholder-avatar.jpg",
      level: 5,
      xp: 2500,
      nextLevelXp: 3000,
      walletBalance: 15000,
      notifications: 3
    }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/learn')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Courses</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-gray-600">{currentLesson.title}</p>
                  <Badge className={getDifficultyColor(currentLesson.difficulty)}>
                    {currentLesson.difficulty}
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <TypeIcon className="h-3 w-3" />
                    <span>{currentLesson.type}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                <Trophy className="h-3 w-3 mr-1" />
                +{currentLesson.xpReward} XP
              </Badge>
              {course.moduleNumber && (
                <Badge className="bg-blue-100 text-blue-800">
                  Module {course.moduleNumber}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-500">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>

          {/* Enhanced Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={goToPreviousLesson}
              disabled={course.lessonsList.findIndex(l => l.id === currentLesson.id) === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Lesson {currentLesson.order} of {course.lessonsList.length}
              </div>
              <div className="text-xs text-gray-500">
                ~{currentLesson.duration} minutes
              </div>
              <div className="flex items-center justify-center space-x-2 mt-1">
                {currentLesson.hasCalculator && (
                  <Badge variant="outline" className="text-xs">Calculator</Badge>
                )}
                {currentLesson.hasCaseStudy && (
                  <Badge variant="outline" className="text-xs">Case Study</Badge>
                )}
                {currentLesson.hasQuiz && (
                  <Badge variant="outline" className="text-xs">Quiz</Badge>
                )}
                {currentLesson.hasExercises && (
                  <Badge variant="outline" className="text-xs">Exercises</Badge>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={goToNextLesson}
              disabled={course.lessonsList.findIndex(l => l.id === currentLesson.id) === course.lessonsList.length - 1}
            >
              Next Lesson
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Enhanced Content Tabs */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 h-auto p-1">
                  <TabsTrigger value="content" className="flex flex-col items-center space-y-1 py-3">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs">Content</span>
                  </TabsTrigger>
                  
                  {currentLesson.hasCalculator && (
                    <TabsTrigger value="calculator" className="flex flex-col items-center space-y-1 py-3">
                      <Calculator className="h-4 w-4" />
                      <span className="text-xs">Calculator</span>
                    </TabsTrigger>
                  )}
                  
                  {currentLesson.hasCaseStudy && (
                    <TabsTrigger value="case-study" className="flex flex-col items-center space-y-1 py-3">
                      <Building2 className="h-4 w-4" />
                      <span className="text-xs">Case Study</span>
                    </TabsTrigger>
                  )}
                  
                  <TabsTrigger value="quiz" className="flex flex-col items-center space-y-1 py-3">
                    <Award className="h-4 w-4" />
                    <span className="text-xs">Quiz</span>
                  </TabsTrigger>
                  
                  {currentLesson.hasExercises && (
                    <TabsTrigger value="exercises" className="flex flex-col items-center space-y-1 py-3">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Exercises</span>
                    </TabsTrigger>
                  )}
                  
                  {course.moduleNumber && course.moduleNumber >= 17 && (
                    <TabsTrigger value="assessment" className="flex flex-col items-center space-y-1 py-3">
                      <Brain className="h-4 w-4" />
                      <span className="text-xs">Assessment</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          <span>{currentLesson.title}</span>
                        </CardTitle>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Learn about {currentLesson.title.toLowerCase()} with this comprehensive lesson.
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <ContentRenderer 
                        content={{
                          type: 'interactive',
                          html: `<div class="lesson-content">Enhanced lesson content with interactive elements will be rendered here.</div>`,
                          interactiveElements: currentLesson.hasCalculator ? [
                            {
                              type: 'calculator',
                              title: 'Interactive Calculator',
                              description: 'Use this calculator to solve practical problems',
                              calculatorType: 'sip'
                            }
                          ] : []
                        }}
                        className="border border-gray-100"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Calculator Tab */}
                {currentLesson.hasCalculator && (
                  <TabsContent value="calculator" className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Calculator className="h-5 w-5 text-green-600" />
                          <span>Interactive Calculator</span>
                        </CardTitle>
                        <CardDescription>
                          Use these tools to solve practical problems and understand concepts better.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* This would integrate with the actual calculators */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h3 className="font-semibold text-green-900 mb-2">Calculator Tools Available</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Button variant="outline" className="justify-start">
                                <Calculator className="h-4 w-4 mr-2" />
                                SIP Calculator
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Compound Interest
                              </Button>
                              <Button variant="outline" className="justify-start">
                                <Target className="h-4 w-4 mr-2" />
                                Retirement Planning
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Case Study Tab */}
                {currentLesson.hasCaseStudy && (
                  <TabsContent value="case-study" className="space-y-6">
                    <CaseStudyComponent
                      caseStudyId={`${courseId}-${lessonId}`}
                      title={`${currentLesson.title} Case Study`}
                      description="Real-world scenario to apply your learning"
                    />
                  </TabsContent>
                )}

                {/* Quiz Tab */}
                <TabsContent value="quiz" className="space-y-6">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        <span>Knowledge Check</span>
                      </CardTitle>
                      <CardDescription>
                        Test your understanding of the concepts covered in this lesson.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                        <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-purple-900 mb-2">Quiz Available</h3>
                        <p className="text-purple-700 mb-4">
                          Ready to test your knowledge? This quiz will help reinforce what you've learned.
                        </p>
                        <Button 
                          onClick={() => setShowAssessment(true)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Start Quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Exercises Tab */}
                {currentLesson.hasExercises && (
                  <TabsContent value="exercises" className="space-y-6">
                    <InteractiveExercises
                      moduleNumber={course.moduleNumber || 17}
                      moduleTitle={course.title}
                      onComplete={handleExerciseComplete}
                    />
                  </TabsContent>
                )}

                {/* Assessment Tab (for modules 17+) */}
                {course.moduleNumber && course.moduleNumber >= 17 && (
                  <TabsContent value="assessment" className="space-y-6">
                    <ModuleAssessment
                      moduleNumber={course.moduleNumber}
                      moduleTitle={course.title}
                      onComplete={handleAssessmentComplete}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Complete Lesson */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Trophy className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Complete This Lesson</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        You've spent {Math.floor(timeSpent / 60)} minutes on this lesson.
                      </p>
                      <div className="flex items-center justify-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {currentLesson.xpReward} XP
                        </Badge>
                        {currentLesson.hasQuiz && (
                          <Badge variant="outline" className="text-xs">
                            Quiz Available
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCompleteLesson}
                      disabled={isCompleted}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Complete Lesson (+{currentLesson.xpReward} XP)
                        </>
                      )}
                    </Button>

                    {course.moduleNumber && course.moduleNumber >= 17 && (
                      <Button 
                        onClick={() => setActiveTab('assessment')}
                        variant="outline"
                        className="w-full"
                        disabled={!isCompleted}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Take Module Assessment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Course Lessons List */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Course Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessonsList.map((lesson, index) => {
                      const LessonIcon = getTypeIcon(lesson.type);
                      return (
                        <div 
                          key={lesson.id}
                          className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            lesson.id === currentLesson.id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => router.push(`/learn/enhanced-lesson/${courseId}/${lesson.id}`)}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isCompleted && lesson.id === currentLesson.id
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <LessonIcon className="h-4 w-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{lesson.title}</div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500">{lesson.duration}min</div>
                              <Badge className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}>
                                {lesson.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            {lesson.hasCalculator && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                            {lesson.hasCaseStudy && <div className="w-2 h-2 bg-blue-400 rounded-full"></div>}
                            {lesson.hasQuiz && <div className="w-2 h-2 bg-purple-400 rounded-full"></div>}
                            {lesson.hasExercises && <div className="w-2 h-2 bg-orange-400 rounded-full"></div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/learn')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Learning Dashboard
                  </Button>
                  
                  {course.moduleNumber && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/learn/pathways?level=intermediate`)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Learning Pathways
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowExercises(true)}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Practice Exercises
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}