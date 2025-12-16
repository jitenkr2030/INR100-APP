"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  Star,
  Award,
  TrendingUp,
  Flame,
  Calendar,
  Gift,
  Share2,
  Download,
  BookOpen
} from "lucide-react";
import AchievementBadges from "./AchievementBadges";
import CertificateGenerator from "./CertificateGenerator";
import StreakTracker from "./StreakTracker";

interface ProgressTrackerProps {
  categoryId: string;
  moduleId: string;
  currentLesson: string;
  showDetailed?: boolean;
  userId?: string;
}

export default function ProgressTracker({ 
  categoryId, 
  moduleId, 
  currentLesson,
  showDetailed = false,
  userId = 'demo-user'
}: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState({
    totalLessons: 0,
    completedLessons: 0,
    currentLesson: 1,
    totalDuration: 0,
    completedDuration: 0,
    xpEarned: 0,
    xpTotal: 0,
    streakDays: 0,
    nextMilestone: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, [categoryId, moduleId, currentLesson]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/progress?category=${categoryId}&module=${moduleId}`);
      const data = await response.json();
      
      if (data.success) {
        setProgressData(data.data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return progressData.totalLessons > 0 
      ? (progressData.completedLessons / progressData.totalLessons) * 100 
      : 0;
  };

  const getTimeProgressPercentage = () => {
    return progressData.totalDuration > 0 
      ? (progressData.completedDuration / progressData.totalDuration) * 100 
      : 0;
  };

  const getXpProgressPercentage = () => {
    return progressData.xpTotal > 0 
      ? (progressData.xpEarned / progressData.xpTotal) * 100 
      : 0;
  };

  const getNextMilestone = () => {
    const milestones = [
      { lessons: 1, xp: 50, title: "First Steps", description: "Complete your first lesson" },
      { lessons: 3, xp: 150, title: "Getting Started", description: "Complete 3 lessons" },
      { lessons: 5, xp: 250, title: "Learning Momentum", description: "Complete 5 lessons" },
      { lessons: 10, xp: 500, title: "Course Champion", description: "Complete entire course" }
    ];

    const completedMilestones = milestones.filter(
      milestone => progressData.completedLessons >= milestone.lessons
    );

    return completedMilestones.length < milestones.length 
      ? milestones[completedMilestones.length] 
      : null;
  };

  const nextMilestone = getNextMilestone();

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If showDetailed is true, render comprehensive progress dashboard
  if (showDetailed) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Lesson Progress */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Lesson Progress</h3>
                  <p className="text-sm text-gray-600">
                    {progressData.completedLessons}/{progressData.totalLessons} lessons
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-xs text-gray-600">
                  {Math.round(getProgressPercentage())}% complete
                </p>
              </div>
            </div>

            {/* Time Progress */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Time Invested</h3>
                  <p className="text-sm text-gray-600">
                    {Math.round(progressData.completedDuration)}/{progressData.totalDuration} min
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={getTimeProgressPercentage()} className="h-2" />
                <p className="text-xs text-gray-600">
                  {Math.round(getTimeProgressPercentage())}% of total time
                </p>
              </div>
            </div>

            {/* XP Progress */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">XP Earned</h3>
                  <p className="text-sm text-gray-600">
                    {progressData.xpEarned}/{progressData.xpTotal} XP
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={getXpProgressPercentage()} className="h-2" />
                <p className="text-xs text-gray-600">
                  {Math.round(getXpProgressPercentage())}% to next level
                </p>
              </div>
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Learning Streak</h3>
                  <p className="text-sm text-gray-600">
                    {progressData.streakDays} day{progressData.streakDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-800">
                  <Trophy className="h-3 w-3 mr-1" />
                  Keep it up!
                </Badge>
                <p className="text-xs text-gray-600">
                  {progressData.streakDays >= 7 ? 'Amazing consistency!' : 'Build your streak!'}
                </p>
              </div>
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">{nextMilestone.title}</h4>
                  <p className="text-sm text-blue-700">{nextMilestone.description}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-600 text-white">
                    +{nextMilestone.xp} XP
                  </Badge>
                  <p className="text-xs text-blue-600 mt-1">
                    {nextMilestone.lessons - progressData.completedLessons} lessons to go
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Achievement unlocked */}
          {getProgressPercentage() === 100 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">🎉 Course Completed!</h4>
                  <p className="text-sm text-green-700">
                    Congratulations! You've mastered this module.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Certificate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Progress Tabs */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4 m-0 rounded-none h-auto p-0">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger 
                  value="streaks" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  Streaks
                </TabsTrigger>
                <TabsTrigger 
                  value="certificates" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Certificates
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="p-6 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StreakTracker userId={userId} showDetails={true} />
                <AchievementBadges userId={userId} limit={4} />
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="p-6 m-0">
              <AchievementBadges userId={userId} showAll={true} />
            </TabsContent>
            
            <TabsContent value="streaks" className="p-6 m-0">
              <StreakTracker userId={userId} showDetails={true} />
            </TabsContent>
            
            <TabsContent value="certificates" className="p-6 m-0">
              <CertificateGenerator userId={userId} showGenerateButton={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

  // Simple progress view (when showDetailed is false)
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressData.completedLessons}/{progressData.totalLessons}
              </div>
              <div className="text-xs text-gray-600">Lessons</div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {progressData.xpEarned}
              </div>
              <div className="text-xs text-gray-600">XP</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {progressData.streakDays}
              </div>
            </div>
          </div>
          
          {showDetailed === undefined && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                // Trigger detailed view by setting showDetailed to true
                window.location.hash = '#detailed-progress';
              }}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Next milestone indicator for simple view */}
        {nextMilestone && getProgressPercentage() < 100 && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
            <p className="text-sm text-blue-700">
              <Award className="h-3 w-3 inline mr-1" />
              Next: {nextMilestone.title} 
              ({nextMilestone.lessons - progressData.completedLessons} lessons to go)
            </p>
          </div>
        )}
        
        {/* Course completion celebration */}
        {getProgressPercentage() === 100 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-sm text-green-700">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              🎉 Course completed! You earned a certificate!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}