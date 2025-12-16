"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BarChart3, 
  Zap, 
  TestTube, 
  TrendingUp,
  Globe,
  Shield,
  Activity,
  Brain,
  Target,
  Award,
  MessageCircle,
  Settings,
  Download,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Clock,
  Star,
  Flame
} from "lucide-react";
import SocialLearning from "./SocialLearning";
import LearningAnalytics from "./LearningAnalytics";
import PerformanceOptimization from "./PerformanceOptimization";
import TestingSuite from "./TestingSuite";

interface AdvancedFeature {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'active' | 'beta' | 'coming-soon';
  category: 'social' | 'analytics' | 'optimization' | 'testing';
  usage: number;
  impact: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export default function AdvancedFeatures() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features: AdvancedFeature[] = [
    {
      id: 'social-learning',
      title: 'Social Learning',
      description: 'Connect with peers through discussions, study groups, and progress sharing',
      icon: Users,
      status: 'active',
      category: 'social',
      usage: 87,
      impact: 'high',
      lastUpdated: '2025-12-16'
    },
    {
      id: 'learning-analytics',
      title: 'Learning Analytics',
      description: 'Deep insights into your learning patterns, performance, and personalized recommendations',
      icon: BarChart3,
      status: 'active',
      category: 'analytics',
      usage: 92,
      impact: 'high',
      lastUpdated: '2025-12-16'
    },
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      description: 'Real-time performance monitoring and optimization recommendations',
      icon: Zap,
      status: 'active',
      category: 'optimization',
      usage: 75,
      impact: 'medium',
      lastUpdated: '2025-12-15'
    },
    {
      id: 'testing-suite',
      title: 'Testing Suite',
      description: 'Comprehensive testing framework for continuous quality assurance',
      icon: TestTube,
      status: 'active',
      category: 'testing',
      usage: 68,
      impact: 'medium',
      lastUpdated: '2025-12-14'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'optimization':
        return <Zap className="h-4 w-4" />;
      case 'testing':
        return <TestTube className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span>Advanced Learning Features</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedFeature === feature.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{feature.title}</h3>
                          <Badge className={getStatusColor(feature.status)}>
                            {feature.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(feature.category)}
                            <span>{feature.category}</span>
                          </div>
                          <span>Usage: {feature.usage}%</span>
                          <span className={getImpactColor(feature.impact)}>
                            Impact: {feature.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-900">1,247</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  +12% this week
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Analytics Accuracy</p>
                  <p className="text-2xl font-bold text-green-900">94.2%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  +2.1% improvement
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Performance Score</p>
                  <p className="text-2xl font-bold text-purple-900">A+</p>
                </div>
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Excellent rating
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Test Coverage</p>
                  <p className="text-2xl font-bold text-orange-900">89%</p>
                </div>
                <TestTube className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Above target
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feature Views */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-5 m-0 rounded-none h-auto p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                  <Globe className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="social" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                  <Users className="h-4 w-4 mr-2" />
                  Social Learning
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                  <Zap className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="testing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent py-3">
                  <TestTube className="h-4 w-4 mr-2" />
                  Testing
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 m-0">
              <div className="space-y-6">
                {/* Feature Benefits */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Platform Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium">Enhanced Collaboration</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Connect with fellow learners through discussions, study groups, and peer support systems.
                      </p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium">Data-Driven Insights</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Get personalized analytics and recommendations based on your learning patterns and progress.
                      </p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        <h4 className="font-medium">Optimized Performance</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Benefit from continuously optimized platform performance and intelligent caching systems.
                      </p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium">Quality Assurance</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Experience a robust, thoroughly tested platform with comprehensive quality control measures.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Learning Analytics updated</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">15 new study group discussions</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Performance optimization completed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="p-6 m-0">
              <SocialLearning userId="demo-user" />
            </TabsContent>

            <TabsContent value="analytics" className="p-6 m-0">
              <LearningAnalytics userId="demo-user" />
            </TabsContent>

            <TabsContent value="performance" className="p-6 m-0">
              <PerformanceOptimization />
            </TabsContent>

            <TabsContent value="testing" className="p-6 m-0">
              <TestingSuite />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}