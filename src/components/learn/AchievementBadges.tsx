"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Flame,
  CheckCircle,
  Lock,
  Gift,
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  Crown,
  Shield,
  Brain
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  earnedAt?: string;
  icon: string;
  category: string;
  xpReward: number;
}

interface AchievementBadgesProps {
  userId?: string;
  showAll?: boolean;
  limit?: number;
}

export default function AchievementBadges({ 
  userId = 'demo-user', 
  showAll = false, 
  limit = 6 
}: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learn/achievements?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setAchievements(data.data.achievements);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Fallback to mock data
      setAchievements(getMockAchievements());
    } finally {
      setLoading(false);
    }
  };

  const getMockAchievements = (): Achievement[] => [
    {
      id: 'first-lesson',
      name: 'First Steps',
      description: 'Complete your first lesson',
      progress: 100,
      earnedAt: '2025-12-15T10:30:00Z',
      icon: 'Star',
      category: 'learning',
      xpReward: 25
    },
    {
      id: 'safety-first',
      name: 'Safety First',
      description: 'Complete Scam Awareness course',
      progress: 100,
      earnedAt: '2025-12-14T15:45:00Z',
      icon: 'Shield',
      category: 'course',
      xpReward: 100
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      progress: 71, // 5/7 days
      icon: 'Flame',
      category: 'streak',
      xpReward: 150
    },
    {
      id: 'knowledge-seeker',
      name: 'Knowledge Seeker',
      description: 'Complete 10 lessons',
      progress: 80, // 8/10 lessons
      icon: 'Brain',
      category: 'learning',
      xpReward: 200
    },
    {
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Score 100% on 5 quizzes',
      progress: 40, // 2/5 quizzes
      icon: 'Target',
      category: 'quiz',
      xpReward: 75
    },
    {
      id: 'course-champion',
      name: 'Course Champion',
      description: 'Complete your first full course',
      progress: 60,
      icon: 'Crown',
      category: 'course',
      xpReward: 500
    }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Trophy, Star, Award, Target, Flame, CheckCircle, Gift, 
      TrendingUp, Calendar, BookOpen, Zap, Crown, Shield, Brain
    };
    return icons[iconName] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-600';
      case 'course': return 'bg-green-100 text-green-600';
      case 'streak': return 'bg-orange-100 text-orange-600';
      case 'quiz': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'course', name: 'Courses', icon: Award },
    { id: 'streak', name: 'Streaks', icon: Flame },
    { id: 'quiz', name: 'Quizzes', icon: Target }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const displayAchievements = showAll ? filteredAchievements : filteredAchievements.slice(0, limit);

  const earnedCount = achievements.filter(a => a.progress >= 100).length;
  const totalXP = achievements
    .filter(a => a.progress >= 100)
    .reduce((sum, a) => sum + a.xpReward, 0);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
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
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Achievements</span>
            <Badge className="bg-yellow-100 text-yellow-800">
              {earnedCount}/{achievements.length}
            </Badge>
          </CardTitle>
          
          {totalXP > 0 && (
            <Badge className="bg-purple-100 text-purple-800">
              <Star className="h-3 w-3 mr-1" />
              +{totalXP} XP
            </Badge>
          )}
        </div>

        {/* Category Filter */}
        {showAll && (
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayAchievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon);
            const isEarned = achievement.progress >= 100;
            
            return (
              <Card 
                key={achievement.id} 
                className={`border-0 transition-all hover:shadow-lg ${
                  isEarned 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    {/* Achievement Icon */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      isEarned 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gray-300'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${
                        isEarned ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>

                    {/* Achievement Info */}
                    <div>
                      <h3 className={`font-semibold text-sm ${
                        isEarned ? 'text-yellow-800' : 'text-gray-700'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{Math.round(achievement.progress)}%</span>
                      </div>
                      <Progress 
                        value={achievement.progress} 
                        className="h-2"
                      />
                    </div>

                    {/* Achievement Status */}
                    <div className="flex items-center justify-center space-x-2">
                      {isEarned ? (
                        <>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Earned
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            +{achievement.xpReward} XP
                          </Badge>
                        </>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          {100 - Math.round(achievement.progress)}% to go
                        </Badge>
                      )}
                    </div>

                    {/* Earned Date */}
                    {isEarned && achievement.earnedAt && (
                      <p className="text-xs text-gray-500">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Show More Button */}
        {!showAll && achievements.length > limit && (
          <div className="text-center mt-6">
            <Button variant="outline" size="sm">
              View All Achievements ({achievements.length})
            </Button>
          </div>
        )}

        {/* Achievement Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">Achievement Progress</h4>
              <p className="text-sm text-blue-700">
                {earnedCount} of {achievements.length} achievements completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-900">{Math.round((earnedCount / achievements.length) * 100)}%</p>
              <p className="text-xs text-blue-600">Complete</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}