"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Database, 
  Globe, 
  Clock, 
  TrendingUp,
  Shield,
  Monitor,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi
} from "lucide-react";

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  databaseQueries: number;
  apiResponseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  uptime: number;
}

interface Optimization {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'in-progress';
  estimatedImprovement: string;
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  duration: number;
  details?: string;
}

export default function PerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningTests, setRunningTests] = useState(false);

  useEffect(() => {
    loadPerformanceData();
    loadOptimizations();
    loadTestResults();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/learn/performance/metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptimizations = () => {
    const mockOptimizations: Optimization[] = [
      {
        id: 'opt_1',
        title: 'Bundle Size Optimization',
        description: 'Implement code splitting and tree shaking to reduce initial bundle size',
        impact: 'high',
        status: 'completed',
        estimatedImprovement: '40% reduction in load time'
      },
      {
        id: 'opt_2',
        title: 'Database Query Optimization',
        description: 'Add proper indexing and optimize N+1 queries',
        impact: 'high',
        status: 'in-progress',
        estimatedImprovement: '60% faster database operations'
      },
      {
        id: 'opt_3',
        title: 'API Response Caching',
        description: 'Implement Redis caching for frequently accessed data',
        impact: 'medium',
        status: 'pending',
        estimatedImprovement: '50% reduction in API response time'
      },
      {
        id: 'opt_4',
        title: 'Image Optimization',
        description: 'Implement WebP format and lazy loading for images',
        impact: 'medium',
        status: 'completed',
        estimatedImprovement: '30% reduction in bandwidth usage'
      },
      {
        id: 'opt_5',
        title: 'Service Worker Implementation',
        description: 'Add offline functionality and background sync',
        impact: 'medium',
        status: 'pending',
        estimatedImprovement: 'Better offline experience'
      }
    ];
    setOptimizations(mockOptimizations);
  };

  const loadTestResults = () => {
    const mockTestResults: TestResult[] = [
      {
        id: 'test_1',
        name: 'Page Load Performance',
        status: 'passed',
        duration: 1200,
        details: 'All pages load within 2 seconds'
      },
      {
        id: 'test_2',
        name: 'Database Connection Pool',
        status: 'passed',
        duration: 150,
        details: 'Connection pooling working correctly'
      },
      {
        id: 'test_3',
        name: 'API Rate Limiting',
        status: 'warning',
        duration: 2000,
        details: 'Some endpoints approaching rate limits'
      },
      {
        id: 'test_4',
        name: 'Memory Leak Detection',
        status: 'passed',
        duration: 3000,
        details: 'No memory leaks detected'
      },
      {
        id: 'test_5',
        name: 'Cross-browser Compatibility',
        status: 'failed',
        duration: 5000,
        details: 'Issues with Safari on iOS'
      }
    ];
    setTestResults(mockTestResults);
  };

  const runPerformanceTests = async () => {
    setRunningTests(true);
    
    // Simulate running tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update test results with new timestamps
    setTestResults(prev => prev.map(test => ({
      ...test,
      duration: test.duration + Math.floor(Math.random() * 500)
    })));
    
    setRunningTests(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'in-progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed':
      case 'pending':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Metrics Dashboard */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Performance Metrics</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={loadPerformanceData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={runPerformanceTests} disabled={runningTests}>
                {runningTests ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                Run Tests
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Page Load Time</p>
                    <p className="text-2xl font-bold text-blue-900">{metrics.loadTime}ms</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <Progress value={Math.min(metrics.loadTime / 30, 100)} className="mt-2" />
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Bundle Size</p>
                    <p className="text-2xl font-bold text-green-900">{formatBytes(metrics.bundleSize)}</p>
                  </div>
                  <HardDrive className="h-8 w-8 text-green-600" />
                </div>
                <Progress value={Math.min(metrics.bundleSize / 2000000 * 100, 100)} className="mt-2" />
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">DB Queries</p>
                    <p className="text-2xl font-bold text-purple-900">{metrics.databaseQueries}</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-600" />
                </div>
                <Progress value={Math.min(metrics.databaseQueries / 50 * 100, 100)} className="mt-2" />
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Cache Hit Rate</p>
                    <p className="text-2xl font-bold text-orange-900">{metrics.cacheHitRate}%</p>
                  </div>
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
                <Progress value={metrics.cacheHitRate} className="mt-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt) => (
              <div key={opt.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(opt.status)}
                      <h3 className="font-medium">{opt.title}</h3>
                      <Badge className={getImpactColor(opt.impact)}>
                        {opt.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{opt.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Status: <strong className="capitalize">{opt.status}</strong></span>
                      <span>Improvement: {opt.estimatedImprovement}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    {opt.status === 'completed' ? 'View Details' : 'Implement'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>Performance Tests</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    <p className="text-sm text-gray-500">{test.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={test.status === 'passed' ? 'default' : test.status === 'warning' ? 'secondary' : 'destructive'}
                    >
                      {test.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{test.duration}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Test Summary</h4>
                <p className="text-sm text-gray-600">
                  {testResults.filter(t => t.status === 'passed').length} passed, 
                  {testResults.filter(t => t.status === 'warning').length} warnings, 
                  {testResults.filter(t => t.status === 'failed').length} failed
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Average Duration</p>
                <p className="font-medium">
                  {Math.round(testResults.reduce((sum, test) => sum + test.duration, 0) / testResults.length)}ms
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}