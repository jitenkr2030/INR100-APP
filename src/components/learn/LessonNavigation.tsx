"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play,
  List,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface LessonNavigationProps {
  categoryId: string;
  moduleId: string;
  currentLesson: string;
}

export default function LessonNavigation({ 
  categoryId, 
  moduleId, 
  currentLesson 
}: LessonNavigationProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessonList();
  }, [categoryId, moduleId]);

  const loadLessonList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/${categoryId}/${moduleId}/lessons`);
      const data = await response.json();
      
      if (data.success) {
        setLessons(data.data.lessons || []);
      }
    } catch (error) {
      console.error('Error loading lesson list:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLesson = (lessonId: string) => {
    router.push(`/learn/${categoryId}/${moduleId}/lesson/${lessonId}`);
  };

  const getLessonStatus = (lessonId: string) => {
    // Mock progress data - in real app, this would come from API
    const progressMap: Record<string, 'completed' | 'current' | 'locked'> = {
      'lesson-1': 'completed',
      'lesson-2': 'current',
      'lesson-3': 'locked',
      'lesson-4': 'locked',
      'lesson-5': 'locked',
    };
    
    return progressMap[lessonId] || 'locked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'current':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'current':
        return 'border-blue-200 bg-blue-50';
      case 'locked':
        return 'border-gray-200 bg-gray-50 opacity-60';
      default:
        return 'border-gray-200';
    }
  };

  const getTotalLessons = () => lessons.length;
  const getCompletedLessons = () => {
    return lessons.filter(lesson => getLessonStatus(lesson.id) === 'completed').length;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessons();
    const completed = getCompletedLessons();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <List className="h-5 w-5" />
            <span>Lessons</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <List className="h-5 w-5" />
            <span>Course Lessons</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {expanded && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress: {getCompletedLessons()}/{getTotalLessons()}</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-0">
          <div className="space-y-1">
            {lessons.map((lesson: any, index: number) => {
              const status = getLessonStatus(lesson.id);
              const isActive = lesson.id === currentLesson;
              
              return (
                <div
                  key={lesson.id}
                  className={`p-3 border-l-4 transition-all ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50' 
                      : getStatusColor(status)
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(status)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive ? 'text-blue-900' : 
                          status === 'locked' ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Lesson {index + 1} • {lesson.estimatedDuration} min
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {lesson.xpReward && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          +{lesson.xpReward} XP
                        </Badge>
                      )}
                      
                      {status !== 'locked' && (
                        <Button
                          size="sm"
                          variant={isActive ? "default" : "outline"}
                          onClick={() => navigateToLesson(lesson.id)}
                          className="text-xs"
                        >
                          {status === 'current' ? 'Continue' : 
                           status === 'completed' ? 'Review' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Course Overview */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(`/learn/${categoryId}/${moduleId}`)}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Back to Course Overview
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}