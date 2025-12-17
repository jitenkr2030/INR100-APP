'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Clock, 
  Target, 
  Star,
  Bell,
  Download,
  Wifi,
  WifiOff,
  TrendingUp,
  Users,
  Award,
  Calendar
} from 'lucide-react';

interface MobileLearningDashboardProps {
  userId: string;
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    xp: number;
    streak: number;
  };
  todayProgress: {
    completed: number;
    timeSpent: number;
    xpEarned: number;
  };
  quickStats: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    certificatesEarned: number;
    achievementsUnlocked: number;
  };
  nextMilestone: {
    level: number;
    xpNeeded: number;
    progress: number;
  };
  quickActions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    action: string;
    priority: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
    timestamp: string;
  }>;
}

export function MobileLearningDashboard({ userId }: MobileLearningDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    
    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/enhanced/mobile?action=dashboard&userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data.dashboard);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Load cached data if available
      loadCachedData();
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/learn/enhanced/mobile?action=notifications&userId=${userId}`);
      const data = await response.json();
      
      if (data.success && dashboardData) {
        setDashboardData({
          ...dashboardData,
          notifications: data.data.notifications
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const loadCachedData = () => {
    // Load data from localStorage for offline mode
    const cached = localStorage.getItem('mobileDashboardData');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setDashboardData(data.dashboard);
        setLastSync(new Date(data.syncTime));
      } catch (error) {
        console.error('Failed to load cached data:', error);
      }
    }
  };

  const syncData = async () => {
    if (!isOnline) return;
    
    try {
      const response = await fetch(`/api/learn/enhanced/mobile?action=sync-data&userId=${userId}&lastSync=${lastSync?.toISOString()}`);
      const data = await response.json();
      
      if (data.success) {
        // Update localStorage
        localStorage.setItem('mobileDashboardData', JSON.stringify({
          dashboard: dashboardData,
          syncTime: new Date().toISOString()
        }));
        setLastSync(new Date());
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleQuickAction = async (action: any) => {
    switch (action.id) {
      case 'continue_learning':
        // Navigate to continue learning
        window.location.href = '/learn/enhanced-dashboard';
        break;
      case 'quick_assessment':
        // Navigate to assessment
        window.location.href = '/learn/enhanced-module/banking-insurance/17';
        break;
      case 'maintain_streak':
        // Start learning to maintain streak
        window.location.href = '/learn/enhanced-lesson/banking-insurance/lesson-1';
        break;
      default:
        console.log('Action:', action);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      BookOpen,
      CheckCircle,
      Award,
      Flame,
      Target,
      Star,
      Clock,
      TrendingUp,
      Users
    };
    return icons[iconName] || BookOpen;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'reminder': return <Bell className="h-4 w-4 text-blue-600" />;
      case 'celebration': return <Star className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="animate-pulse">
            <div className="h-32 bg-white rounded-xl shadow-sm"></div>
            <div className="h-24 bg-white rounded-xl shadow-sm mt-4"></div>
            <div className="h-32 bg-white rounded-xl shadow-sm mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Offline Mode</h3>
            <p className="text-gray-600 mb-4">Connect to internet to sync your learning data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-sm mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {dashboardData.user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{dashboardData.user.name}</h1>
              <p className="text-sm text-gray-500">Level {dashboardData.user.level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <Button variant="ghost" size="sm" onClick={syncData} disabled={!isOnline}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto p-4 space-y-6">
        {/* Today's Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.todayProgress.completed}
                </div>
                <div className="text-xs text-gray-500">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData.todayProgress.timeSpent}m
                </div>
                <div className="text-xs text-gray-500">Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.todayProgress.xpEarned}
                </div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Progress Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Level {dashboardData.user.level}</span>
                <span className="text-sm font-medium">
                  {dashboardData.nextMilestone.xpNeeded} XP to Level {dashboardData.nextMilestone.level}
                </span>
              </div>
              <Progress value={dashboardData.nextMilestone.progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{dashboardData.user.xp} XP</span>
                <span>{dashboardData.nextMilestone.level * 500} XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-orange-600">
                  {dashboardData.quickStats.currentStreak}
                </div>
                <div className="text-xs text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-yellow-600">
                  {dashboardData.quickStats.achievementsUnlocked}
                </div>
                <div className="text-xs text-gray-600">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.quickActions.map((action) => {
              const IconComponent = getIconComponent(action.icon);
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`w-full justify-start h-auto p-4 ${getPriorityColor(action.priority)}`}
                  onClick={() => handleQuickAction(action)}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs opacity-80">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Notifications */}
        {dashboardData.notifications && dashboardData.notifications.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notification.title}</div>
                    <div className="text-xs text-gray-600">{notification.message}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sync Status */}
        {lastSync && (
          <div className="text-center text-xs text-gray-500 pb-4">
            Last synced: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileLearningDashboard;