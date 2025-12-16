"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  RotateCcw,
  Award,
  Target
} from "lucide-react";
import LessonPlayer from "@/components/learn/LessonPlayer";
import LessonNavigation from "@/components/learn/LessonNavigation";
import ProgressTracker from "@/components/learn/ProgressTracker";
import SocialLearning from "@/components/learn/SocialLearning";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);

  const categoryId = params.category as string;
  const moduleId = params.module as string;
  const lessonId = params.lessonId as string;

  useEffect(() => {
    loadLessonContent();
  }, [categoryId, moduleId, lessonId]);

  const loadLessonContent = async () => {
    try {
      setLoading(true);
      
      // Call the lesson API to get content
      const response = await fetch(`/api/learn/${categoryId}/${moduleId}/lesson/${lessonId}`);
      const data = await response.json();
      
      if (data.success) {
        setLesson(data.data);
        setCompleted(data.data.completed || false);
        setDuration(data.data.estimatedDuration || 0);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleted(true);
      
      // Update progress via API
      await fetch(`/api/learn/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          categoryId,
          moduleId,
          completed: true,
          timeSpent: currentTime
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNextLesson = () => {
    // Navigate to next lesson in sequence
    const nextLessonId = getNextLessonId();
    if (nextLessonId) {
      router.push(`/learn/${categoryId}/${moduleId}/lesson/${nextLessonId}`);
    } else {
      // Navigate back to course overview
      router.push(`/learn/${categoryId}/${moduleId}`);
    }
  };

  const handlePreviousLesson = () => {
    const prevLessonId = getPreviousLessonId();
    if (prevLessonId) {
      router.push(`/learn/${categoryId}/${moduleId}/lesson/${prevLessonId}`);
    } else {
      // Navigate back to course overview
      router.push(`/learn/${categoryId}/${moduleId}`);
    }
  };

  const getNextLessonId = () => {
    // Logic to determine next lesson ID based on current lesson
    const lessonNumber = parseInt(lessonId.split('-')[1]);
    return `lesson-${lessonNumber + 1}`;
  };

  const getPreviousLessonId = () => {
    const lessonNumber = parseInt(lessonId.split('-')[1]);
    return lessonNumber > 1 ? `lesson-${lessonNumber - 1}` : null;
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lesson content...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson) {
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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">The requested lesson could not be loaded.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => router.push(`/learn/${categoryId}/${moduleId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              <Award className="h-3 w-3 mr-1" />
              +{lesson.xpReward || 50} XP
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {duration} min
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressTracker 
          categoryId={categoryId}
          moduleId={moduleId}
          currentLesson={lessonId}
        />

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Lesson Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Lesson Content</span>
                  </CardTitle>
                  {completed && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <LessonPlayer 
                  lesson={lesson}
                  isPlaying={isPlaying}
                  onPlayToggle={handlePlayToggle}
                  onTimeUpdate={setCurrentTime}
                  onComplete={handleComplete}
                />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <Button 
                variant="outline"
                onClick={handlePreviousLesson}
                disabled={!getPreviousLessonId()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
              
              {!completed && (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
              
              <Button 
                onClick={handleNextLesson}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lesson Navigation */}
            <LessonNavigation 
              categoryId={categoryId}
              moduleId={moduleId}
              currentLesson={lessonId}
            />

            {/* Learning Objectives */}
            {lesson.objectives && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Learning Objectives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lesson.objectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lesson.resources.map((resource: any, index: number) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Social Learning Section */}
        <div className="mt-8">
          <SocialLearning 
            userId="demo-user"
            currentCourse={categoryId}
            currentLesson={lessonId}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}