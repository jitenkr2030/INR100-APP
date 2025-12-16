"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trophy,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  xpReward: number;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: number;
  lessonsList: Lesson[];
  progress: number;
}

export default function LessonViewer() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null);
  const [previousLesson, setPreviousLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

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
          setCourse(data.course);
          setCurrentLesson(data.currentLesson);
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
          alert("Lesson not found. Please check the URL and try again.");
          router.push('/learn');
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        alert("Failed to load lesson. Please try again.");
        router.push('/learn');
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLessonData();
    }
  }, [courseId, lessonId]);

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
            router.push(`/learn/lesson/${courseId}/${nextLesson.id}`);
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

  const goToPreviousLesson = () => {
    if (!previousLesson) return;
    router.push(`/learn/lesson/${courseId}/${previousLesson.id}`);
  };

  const goToNextLesson = () => {
    if (!nextLesson) return;
    router.push(`/learn/lesson/${courseId}/${nextLesson.id}`);
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
            <p className="text-gray-600">Loading lesson...</p>
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
          {/* Header */}
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
                <p className="text-gray-600">{currentLesson.title}</p>
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

          {/* Lesson Navigation */}
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

          {/* Lesson Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
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
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Complete Lesson */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Ready to Complete?</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        You've spent {Math.floor(timeSpent / 60)} minutes on this lesson.
                      </p>
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
                  </div>
                </CardContent>
              </Card>

              {/* Course Lessons List */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Course Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessonsList.map((lesson, index) => (
                      <div 
                        key={lesson.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          lesson.id === currentLesson.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => router.push(`/learn/lesson/${courseId}/${lesson.id}`)}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          isCompleted && lesson.id === currentLesson.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{lesson.title}</div>
                          <div className="text-xs text-gray-500">{lesson.duration}min</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}