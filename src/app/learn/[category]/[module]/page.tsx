"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  CreditCard
} from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  const categoryId = params.category as string;
  const moduleId = params.module as string;

  useEffect(() => {
    loadCourseDetail();
  }, [categoryId, moduleId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn?category=${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        const foundCourse = data.data.courses.find((cat: any) => cat.id === categoryId)
          ?.modules.find((mod: any) => mod.id === moduleId);
        
        if (foundCourse) {
          setCourse(foundCourse);
          setEnrolled(foundCourse.isEnrolled);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      // In a real app, this would make an API call to enroll
      setEnrolled(true);
      setCourse((prev: any) => ({ ...prev, isEnrolled: true, progress: 0 }));
    } catch (error) {
      console.error('Error enrolling:', error);
    }
  };

  const handleStartCourse = () => {
    router.push(`/learn/${categoryId}/${moduleId}/lesson/1`);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      BookOpen, TrendingUp, PieChart, PiggyBank, Brain, Shield, 
      AlertTriangle, Home, Building, CreditCard, Target, Zap, Award
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
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <p className="text-gray-600">Loading course...</p>
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
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => router.push('/learn')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Learning
        </Button>

        {/* Course Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-lg ${course.color}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <Badge className={getImportanceColor(course.importance)}>
                      {course.importance.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-base mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            {enrolled && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Your Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.floor((course.progress / 100) * course.lessons)}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {course.lessons - Math.floor((course.progress / 100) * course.lessons)}
                        </div>
                        <div className="text-sm text-gray-600">Remaining</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor((course.progress / 100) * course.xpReward)}
                        </div>
                        <div className="text-sm text-gray-600">XP Earned</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Topics Covered */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
                <CardDescription>
                  This course covers {course.topics.length} key topics designed to build your expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {course.topics.map((topic: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-gray-900">{topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Benefits */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Why Take This Course?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Earn XP Rewards</h4>
                      <p className="text-sm text-gray-600">Complete lessons and earn up to {course.xpReward} experience points</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Build Expertise</h4>
                      <p className="text-sm text-gray-600">Master the fundamentals with structured learning</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold">Track Progress</h4>
                      <p className="text-sm text-gray-600">Monitor your learning journey with detailed analytics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="border-0 shadow-lg sticky top-6">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {enrolled ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-600">You're Enrolled!</h3>
                        <p className="text-sm text-gray-600">Continue your learning journey</p>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        onClick={handleStartCourse}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Start Learning Today</h3>
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
                        <span>XP Reward:</span>
                        <span className="font-medium text-purple-600">+{course.xpReward}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Level:</span>
                    <Badge className={getLevelColor(course.level)} size="sm">
                      {course.level}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Importance:</span>
                    <Badge className={getImportanceColor(course.importance)} size="sm">
                      {course.importance}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{course.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}