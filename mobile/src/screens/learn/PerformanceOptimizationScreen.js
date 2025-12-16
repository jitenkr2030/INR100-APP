/**
 * Performance Optimization Screen for INR100 Mobile App
 * Displays performance metrics, optimization recommendations, and test results
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// Services
import APIService from '../../services/APIService';
import AnalyticsService from '../../services/AnalyticsService';

// Styles
import { Colors, Typography, Spacing, BorderRadius, GlobalStyles } from '../../styles/GlobalStyles';

const { width } = Dimensions.get('window');

const PerformanceOptimizationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId = 'demo-user' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [optimizations, setOptimizations] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    loadPerformanceData();
    loadOptimizations();
    loadTestResults();
    trackScreenView();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      const response = await APIService.get('/learn/performance/metrics');
      
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOptimizations = () => {
    const mockOptimizations = [
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
      }
    ];
    setOptimizations(mockOptimizations);
  };

  const loadTestResults = () => {
    const mockTestResults = [
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
    
    try {
      // Simulate running tests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update test results with new timestamps
      setTestResults(prev => prev.map(test => ({
        ...test,
        duration: test.duration + Math.floor(Math.random() * 500)
      })));
      
      Alert.alert('Tests Completed', 'Performance tests have finished running');
    } catch (error) {
      console.error('Error running tests:', error);
      Alert.alert('Error', 'Failed to run performance tests');
    } finally {
      setRunningTests(false);
    }
  };

  const trackScreenView = () => {
    AnalyticsService.trackScreen('PerformanceOptimizationScreen');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPerformanceData();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return 'checkmark-circle';
      case 'warning':
      case 'in-progress':
        return 'warning';
      case 'failed':
      case 'pending':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return Colors.success;
      case 'warning':
      case 'in-progress':
        return Colors.warning;
      case 'failed':
      case 'pending':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const renderMetricCard = (title, value, subtitle, icon, color, progress) => (
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.metricCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && (
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      )}
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.min(progress, 100)}%</Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderOptimizationCard = (optimization) => (
    <TouchableOpacity key={optimization.id} style={styles.optimizationCard}>
      <View style={styles.optimizationHeader}>
        <View style={styles.optimizationInfo}>
          <Ionicons 
            name={getStatusIcon(optimization.status)} 
            size={20} 
            color={getStatusColor(optimization.status)} 
          />
          <View style={styles.optimizationDetails}>
            <Text style={styles.optimizationTitle}>{optimization.title}</Text>
            <Text style={styles.optimizationDescription}>{optimization.description}</Text>
          </View>
        </View>
        <View style={styles.impactBadge}>
          <Text style={[styles.impactText, { color: getImpactColor(optimization.impact) }]}>
            {optimization.impact}
          </Text>
        </View>
      </View>
      
      <View style={styles.optimizationFooter}>
        <Text style={styles.optimizationStatus}>
          Status: <Text style={{ fontWeight: '600' }}>{optimization.status}</Text>
        </Text>
        <Text style={styles.optimizationImprovement}>
          {optimization.estimatedImprovement}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.optimizationAction}>
        <Text style={styles.optimizationActionText}>
          {optimization.status === 'completed' ? 'View Details' : 'Implement'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTestResult = (test) => (
    <View key={test.id} style={styles.testResult}>
      <View style={styles.testHeader}>
        <Ionicons 
          name={getStatusIcon(test.status)} 
          size={20} 
          color={getStatusColor(test.status)} 
        />
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testDetails}>{test.details}</Text>
        </View>
        <View style={styles.testStatus}>
          <Text style={[
            styles.testStatusText,
            { color: getStatusColor(test.status) }
          ]}>
            {test.status}
          </Text>
          <Text style={styles.testDuration}>{test.duration}ms</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Performance Optimization</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading performance data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Performance Optimization</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name={refreshing ? "refresh" : "refresh-outline"} 
            size={20} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          {metrics && (
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Page Load Time',
                `${metrics.loadTime}ms`,
                undefined,
                'time',
                Colors.primary
              )}
              
              {renderMetricCard(
                'Bundle Size',
                formatBytes(metrics.bundleSize),
                undefined,
                'hardware-chip',
                Colors.success
              )}
              
              {renderMetricCard(
                'DB Queries',
                metrics.databaseQueries.toString(),
                undefined,
                'database',
                Colors.secondary
              )}
              
              {renderMetricCard(
                'Cache Hit Rate',
                `${metrics.cacheHitRate}%`,
                undefined,
                'cloud',
                Colors.warning,
                metrics.cacheHitRate
              )}
            </View>
          )}
        </View>

        {/* Performance Tests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Tests</Text>
            <TouchableOpacity
              style={[
                styles.runTestsButton,
                runningTests && styles.runTestsButtonDisabled
              ]}
              onPress={runPerformanceTests}
              disabled={runningTests}
            >
              {runningTests ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="play" size={16} color={Colors.white} />
              )}
              <Text style={styles.runTestsButtonText}>
                {runningTests ? 'Running...' : 'Run Tests'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.testResults}>
            {testResults.map(renderTestResult)}
          </View>
          
          <View style={styles.testSummary}>
            <Text style={styles.testSummaryText}>
              {testResults.filter(t => t.status === 'passed').length} passed, 
              {testResults.filter(t => t.status === 'warning').length} warnings, 
              {testResults.filter(t => t.status === 'failed').length} failed
            </Text>
            <Text style={styles.testSummarySubtext}>
              Average Duration: {Math.round(testResults.reduce((sum, test) => sum + test.duration, 0) / testResults.length)}ms
            </Text>
          </View>
        </View>

        {/* Optimization Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimization Recommendations</Text>
          <View style={styles.optimizations}>
            {optimizations.map(renderOptimizationCard)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  refreshButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - Spacing.md * 3) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metricValue: {
    ...Typography.h4,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  metricSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    minWidth: 35,
  },
  runTestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  runTestsButtonDisabled: {
    opacity: 0.6,
  },
  runTestsButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  testResults: {
    marginBottom: Spacing.md,
  },
  testResult: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...GlobalStyles.shadow,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  testInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  testName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  testDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  testStatus: {
    alignItems: 'flex-end',
  },
  testStatusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  testDuration: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  testSummary: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  testSummaryText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  testSummarySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  optimizations: {
    gap: Spacing.sm,
  },
  optimizationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...GlobalStyles.shadow,
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  optimizationInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  optimizationDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  optimizationTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  optimizationDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  impactBadge: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  impactText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  optimizationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  optimizationStatus: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  optimizationImprovement: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  optimizationAction: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  optimizationActionText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});

export default PerformanceOptimizationScreen;