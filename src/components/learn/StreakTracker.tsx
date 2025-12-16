"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Calendar, 
  Target, 
  Trophy, 
  Star,
  TrendingUp,
  Clock,
  Zap,
  Crown,
  Gift
} from "lucide-react";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  streakBrokenAt?: string;
  totalActiveDays: number;
  thisWeekStreak: number;
  todayCompleted: boolean;
}

interface StreakTrackerProps {
  userId?: string;
  showDetails?: boolean;
}

export default function StreakTracker({ 
  userId = 'demo-user', 
  showDetails = false 
}: StreakTrackerProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [motivationMessage, setMotivationMessage] = useState('');

  useEffect(() => {
    loadStreakData();
    generateMotivationMessage();
  }, [userId, streakData]);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/streak?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setStreakData(data.data);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      // Fallback to mock data
      setStreakData(getMockStreakData());
    } finally {
      setLoading(false);
    }
  };

  const generateMotivationMessage = () => {
    if (!streakData) return;

    const { currentStreak, longestStreak, todayCompleted } = streakData;

    if (currentStreak === 0) {
      setMotivationMessage("🚀 Start your learning journey today!");
    } else if (currentStreak === 1) {
      setMotivationMessage("🎯 Great start! Keep the momentum going!");
    } else if (currentStreak < 7) {
      setMotivationMessage("🔥 You're building a great habit! Keep learning!");
    } else if (currentStreak < 30) {
      setMotivationMessage("💪 Amazing streak! You're becoming a learning champion!");
    } else if (currentStreak < 100) {
      setMotivationMessage("🏆 Incredible dedication! You're a learning master!");
    } else {
      setMotivationMessage("👑 Legendary status! You're the ultimate learning champion!");
    }

    if (!todayCompleted && currentStreak > 0) {
      setMotivationMessage("⚠️ Complete a lesson today to maintain your streak!");
    }
  };

  const getMockStreakData = (): StreakData => ({
    currentStreak: 5,
    longestStreak: 12,
    lastActiveDate: '2025-12-15',
    totalActiveDays: 28,
    thisWeekStreak: 5,
    todayCompleted: false
  });

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { level: 'Legend', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-100' };
    if (streak >= 30) return { level: 'Master', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (streak >= 7) return { level: 'Champion', icon: Star, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (streak >= 3) return { level: 'Warrior', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Beginner', icon: Target, color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 60, 100];
    return milestones.find(m => m > streak) || milestones[milestones.length - 1];
  };

  const getDaysUntilMilestone = (streak: number) => {
    const next = getNextMilestone(streak);
    return next - streak;
  };

  const renderStreakCalendar = () => {
    if (!showDetails) return null;

    const today = new Date();
    const days = [];
    
    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // For demo purposes, mark recent days as active if in streak
      const isActive = streakData && i < (streakData.currentStreak || 0) && dateStr <= (streakData.lastActiveDate || '');
      const isToday = i === 0;
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isActive,
        isToday
      });
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Last 14 Days</h4>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                ${day.isToday 
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                  : day.isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {day.day}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-600" />
            <span>Learning Streak</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) return null;

  const streakLevel = getStreakLevel(streakData.currentStreak);
  const LevelIcon = streakLevel.icon;
  const nextMilestone = getNextMilestone(streakData.currentStreak);
  const daysUntilMilestone = getDaysUntilMilestone(streakData.currentStreak);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-orange-600" />
            <span>Learning Streak</span>
            <Badge className={streakLevel.bg}>
              <LevelIcon className={`h-3 w-3 mr-1 ${streakLevel.color}`} />
              {streakLevel.level}
            </Badge>
          </CardTitle>
          
          {streakData.todayCompleted && (
            <Badge className="bg-green-100 text-green-800">
              <Calendar className="h-3 w-3 mr-1" />
              Today's Goal Met!
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Main Streak Display */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${streakLevel.bg} mb-4`}>
            <span className={`text-3xl font-bold ${streakLevel.color}`}>
              {streakData.currentStreak}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Day{streakData.currentStreak !== 1 ? 's' : ''} Learning Streak
          </h3>
          <p className="text-gray-600 mb-4">
            {motivationMessage}
          </p>
          
          {/* Progress to Next Milestone */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Next: {nextMilestone} days
              </span>
              <span className="font-medium">
                {daysUntilMilestone} to go
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((streakData.currentStreak / nextMilestone) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">
                {streakData.longestStreak}
              </span>
            </div>
            <p className="text-sm text-gray-600">Best Streak</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {streakData.thisWeekStreak}
              </span>
            </div>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {streakData.totalActiveDays}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total Days</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {Math.floor(streakData.totalActiveDays * 0.75)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Avg/Week</p>
          </div>
        </div>

        {/* Streak Calendar */}
        {renderStreakCalendar()}

        {/* Motivational Actions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-orange-900">
                {streakData.todayCompleted ? '🎉 Great Job!' : '⏰ Keep Your Streak Alive!'}
              </h4>
              <p className="text-sm text-orange-700">
                {streakData.todayCompleted 
                  ? 'You\'ve completed today\'s learning goal!' 
                  : `Complete one lesson today to maintain your ${streakData.currentStreak}-day streak!`
                }
              </p>
            </div>
            
            <div className="text-right">
              <Badge className="bg-orange-100 text-orange-800">
                <Flame className="h-3 w-3 mr-1" />
                {nextMilestone - streakData.currentStreak} days to {nextMilestone}
              </Badge>
            </div>
          </div>
        </div>

        {/* Streak Rewards Preview */}
        {streakData.currentStreak > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Streak Rewards: +{(streakData.currentStreak * 2)} bonus XP today!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}