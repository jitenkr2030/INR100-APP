"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Brain, 
  Calendar,
  BookOpen,
  Award,
  Flame,
  Star,
  Activity,
  PieChart,
  LineChart,
  Users,
  Zap,
  CheckCircle,
  Timer,
  Medal,
  Trophy,
  Globe
} from "lucide-react";

interface LearningAnalytics {
  totalTimeSpent: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionTime: number;
  weeklyProgress: number;
  monthlyProgress: number;
  learningVelocity: number;
  consistencyScore: number;
  knowledgeRetention: number;
  engagementLevel: number;
}

interface SubjectPerformance {
  subject: string;
  completion: number;
  averageScore: number;
  timeSpent: number;
  lessonsCount: number;
  lastActivity: string;
}

interface LearningPattern {
  hour: number;
  activity: number;
  efficiency: number;
}

interface Weakness {
  area: string;
  score: number;
  recommendedLessons: string[];
  difficulty: string;
}

interface Strength {
  area: string;
  score: number;
  completedLessons: number;
  masteryLevel: string;
}

interface LearningInsights {
  bestLearningTime: string;
  preferredLearningDuration: number;
  knowledgeRetentionRate: number;
  learningVelocity: number;
  engagementTrends: string[];
  recommendations: string[];
}

interface AnalyticsProps {
  userId?: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
}

export default function LearningAnalytics({ 
  userId = 'demo-user', 
  dateRange = 'month' 
}: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [weaknesses, setWeaknesses] = useState<Weakness[]>([]);
  const [strengths, setStrengths] = useState<Strength[]>([]);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/learn/analytics?userId=${userId}&range=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data.overview);
        setSubjectPerformance(data.data.subjectPerformance);
        setLearningPatterns(data.data.learningPatterns);
        setWeaknesses(data.data.weaknesses);
        setStrengths(data.data.strengths);
        setInsights(data.data.insights);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Medal className="h-4 w-4 text-yellow-600" />;
    return <Target className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Learning Analytics</span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <LineChart className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-5 m-0 rounded-none h-auto p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Target className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="patterns" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Activity className="h-4 w-4 mr-2" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="insights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                <Zap className="h-4 w-4 mr-2" />
                Actions
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 m-0">
            {/* Key Metrics */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Learning Time</p>
                        <p className="text-2xl font-bold">{formatTime(analytics.totalTimeSpent)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Avg: {formatTime(analytics.averageSessionTime)}/session
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lessons Completed</p>
                        <p className="text-2xl font-bold">{analytics.lessonsCompleted}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {analytics.coursesCompleted} courses
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Streak</p>
                        <p className="text-2xl font-bold">{analytics.currentStreak}</p>
                      </div>
                      <Flame className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Best: {analytics.longestStreak} days
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Consistency Score</p>
                        <p className="text-2xl font-bold">{analytics.consistencyScore}%</p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-2">
                      <Progress value={analytics.consistencyScore} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Learning Velocity Chart */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Learning Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Learning velocity chart would be here</p>
                    <p className="text-sm text-gray-400">
                      Progress: {analytics?.learningVelocity}% this {dateRange}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="p-6 m-0">
            {/* Subject Performance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
              {subjectPerformance.map((subject, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getPerformanceIcon(subject.averageScore)}
                        <div>
                          <h4 className="font-medium">{subject.subject}</h4>
                          <p className="text-sm text-gray-500">
                            {subject.lessonsCount} lessons • Last active {subject.lastActivity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getPerformanceColor(subject.averageScore)}`}>
                          {subject.averageScore}%
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(subject.timeSpent)} spent</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span>{subject.completion}%</span>
                      </div>
                      <Progress value={subject.completion} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="p-6 m-0">
            {/* Learning Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Learning Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Activity pattern visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Peak Performance Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningPatterns.slice(0, 6).map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{pattern.hour}:00</span>
                          </div>
                          <span className="text-sm">{pattern.activity}% activity</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={pattern.efficiency} className="w-20 h-2" />
                          <span className="text-xs text-gray-500">{pattern.efficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="p-6 m-0">
            {insights && (
              <div className="space-y-6">
                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Best Learning Time</h4>
                          <p className="text-2xl font-bold text-blue-600">{insights.bestLearningTime}</p>
                          <p className="text-sm text-gray-500">Peak performance hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Timer className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium">Optimal Session</h4>
                          <p className="text-2xl font-bold text-green-600">{insights.preferredLearningDuration}min</p>
                          <p className="text-sm text-gray-500">Best session length</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Engagement Trends */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Engagement Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Positive Trends</h4>
                        <div className="space-y-2">
                          {insights.engagementTrends.filter(trend => trend.includes('↗')).map((trend, index) => (
                            <Badge key={index} variant="secondary" className="block text-left">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Areas for Improvement</h4>
                        <div className="space-y-2">
                          {insights.engagementTrends.filter(trend => trend.includes('↘')).map((trend, index) => (
                            <Badge key={index} variant="outline" className="block text-left">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="p-6 m-0">
            <div className="space-y-6">
              {/* Weaknesses to Address */}
              {weaknesses.length > 0 && (
                <Card className="border border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weaknesses.map((weakness, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-red-800">{weakness.area}</h4>
                            <Badge variant="destructive">Score: {weakness.score}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Difficulty: {weakness.difficulty}
                          </p>
                          <div>
                            <p className="text-sm font-medium mb-1">Recommended lessons:</p>
                            <div className="flex flex-wrap gap-1">
                              {weakness.recommendedLessons.map((lesson, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {lesson}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths to Build Upon */}
              {strengths.length > 0 && (
                <Card className="border border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">Your Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {strengths.map((strength, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-green-800">{strength.area}</h4>
                            <Badge className="bg-green-600">Score: {strength.score}%</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Mastery Level: {strength.masteryLevel} • {strength.completedLessons} lessons completed
                          </p>
                          <Button size="sm" variant="outline">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Explore Advanced Topics
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations */}
              {insights && (
                <Card className="border border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Personalized Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded border">
                          <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Create Study Plan
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Sessions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}