/**
 * Learning Analytics Screen for INR100 Mobile App
 * Displays learning progress, performance metrics, and insights
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

const LearningAnalyticsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId = 'demo-user', dateRange = 'month' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
    trackScreenView();
  }, [userId, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const response = await APIService.get(`/learn/analytics?userId=${userId}&range=${dateRange}`);
      
      if (response.success) {
        setAnalytics(response.data.overview);
        setSubjectPerformance(response.data.subjectPerformance);
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const trackScreenView = () => {
    AnalyticsService.trackScreen('LearningAnalyticsScreen');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalyticsData();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const getPerformanceIcon = (score) => {
    if (score >= 80) return 'trophy';
    if (score >= 60) return 'medal';
    return 'target';
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
        <Ionicons name={icon} size={32} color={color} />
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
                { width: `${progress}%`, backgroundColor: color }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderTabButton = (tabKey, label, icon) => (
    <TouchableOpacity
      key={tabKey}
      style={[
        styles.tabButton,
        activeTab === tabKey && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabKey ? Colors.white : Colors.textSecondary} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabKey && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {analytics && (
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Total Learning Time',
            formatTime(analytics.totalTimeSpent),
            `Avg: ${formatTime(analytics.averageSessionTime)}/session`,
            'time',
            Colors.primary
          )}
          
          {renderMetricCard(
            'Lessons Completed',
            analytics.lessonsCompleted.toString(),
            `${analytics.coursesCompleted} courses`,
            'checkmark-circle',
            Colors.success
          )}
          
          {renderMetricCard(
            'Current Streak',
            `${analytics.currentStreak} days`,
            `Best: ${analytics.longestStreak} days`,
            'flame',
            Colors.warning
          )}
          
          {renderMetricCard(
            'Consistency Score',
            `${analytics.consistencyScore}%`,
            undefined,
            'analytics',
            Colors.secondary,
            analytics.consistencyScore
          )}
        </View>
      )}

      {/* Learning Velocity Chart Placeholder */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Learning Velocity</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="trending-up" size={48} color={Colors.textSecondary} />
          <Text style={styles.chartPlaceholderText}>
            Learning velocity: {analytics?.learningVelocity}% this {dateRange}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderPerformance = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Subject Performance</Text>
      {subjectPerformance.map((subject, index) => (
        <TouchableOpacity key={index} style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <View style={styles.subjectInfo}>
              <Ionicons 
                name={getPerformanceIcon(subject.averageScore)} 
                size={24} 
                color={getPerformanceColor(subject.averageScore)} 
              />
              <View style={styles.subjectDetails}>
                <Text style={styles.subjectName}>{subject.subject}</Text>
                <Text style={styles.subjectMeta}>
                  {subject.lessonsCount} lessons • Last active {subject.lastActivity}
                </Text>
              </View>
            </View>
            <View style={styles.subjectScore}>
              <Text style={[
                styles.subjectScoreValue,
                { color: getPerformanceColor(subject.averageScore) }
              ]}>
                {subject.averageScore}%
              </Text>
              <Text style={styles.subjectTimeSpent}>
                {formatTime(subject.timeSpent)} spent
              </Text>
            </View>
          </View>
          
          <View style={styles.completionContainer}>
            <Text style={styles.completionLabel}>Completion</Text>
            <Text style={styles.completionValue}>{subject.completion}%</Text>
          </View>
          
          <View style={styles.completionBar}>
            <View 
              style={[
                styles.completionFill, 
                { 
                  width: `${subject.completion}%`,
                  backgroundColor: getPerformanceColor(subject.averageScore)
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderInsights = () => (
    <ScrollView style={styles.tabContent}>
      {insights && (
        <>
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <Ionicons name="time" size={32} color={Colors.primary} />
              <Text style={styles.insightTitle}>Best Learning Time</Text>
              <Text style={styles.insightValue}>{insights.bestLearningTime}</Text>
              <Text style={styles.insightSubtitle}>Peak performance hours</Text>
            </View>
            
            <View style={styles.insightCard}>
              <Ionicons name="timer" size={32} color={Colors.success} />
              <Text style={styles.insightTitle}>Optimal Session</Text>
              <Text style={styles.insightValue}>{insights.preferredLearningDuration}min</Text>
              <Text style={styles.insightSubtitle}>Best session length</Text>
            </View>
          </View>

          {/* Engagement Trends */}
          <View style={styles.trendsSection}>
            <Text style={styles.sectionTitle}>Engagement Trends</Text>
            
            <View style={styles.trendsContainer}>
              <View style={styles.trendsColumn}>
                <Text style={styles.trendsColumnTitle}>Positive Trends</Text>
                {insights.engagementTrends
                  .filter(trend => trend.includes('↗'))
                  .map((trend, index) => (
                    <View key={index} style={styles.trendItem}>
                      <Ionicons name="trending-up" size={16} color={Colors.success} />
                      <Text style={styles.trendText}>{trend}</Text>
                    </View>
                  ))}
              </View>
              
              <View style={styles.trendsColumn}>
                <Text style={styles.trendsColumnTitle}>Areas for Improvement</Text>
                {insights.engagementTrends
                  .filter(trend => trend.includes('↘'))
                  .map((trend, index) => (
                    <View key={index} style={styles.trendItem}>
                      <Ionicons name="trending-down" size={16} color={Colors.warning} />
                      <Text style={styles.trendText}>{trend}</Text>
                    </View>
                  ))}
              </View>
            </View>
          </View>

          {/* AI Recommendations */}
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
            {insights.recommendations.map((recommendation, index) => (
              <TouchableOpacity key={index} style={styles.recommendationCard}>
                <Ionicons name="bulb" size={20} color={Colors.primary} />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar" size={20} color={Colors.white} />
              <Text style={styles.actionButtonText}>Create Study Plan</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformance();
      case 'insights':
        return renderInsights();
      default:
        return renderOverview();
    }
  };

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
          <Text style={styles.title}>Learning Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
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
        <Text style={styles.title}>Learning Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview', 'analytics')}
        {renderTabButton('performance', 'Performance', 'target')}
        {renderTabButton('insights', 'Insights', 'bulb')}
      </View>

      {renderContent()}
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
  exportButton: {
    padding: Spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
    ...Typography.h3,
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
    minWidth: 30,
  },
  chartContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...GlobalStyles.shadow,
  },
  chartTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  subjectCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...GlobalStyles.shadow,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  subjectName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  subjectMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subjectScore: {
    alignItems: 'flex-end',
  },
  subjectScoreValue: {
    ...Typography.h5,
    fontWeight: '700',
  },
  subjectTimeSpent: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  completionLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  completionValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  completionBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  completionFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  insightCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  insightTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  insightValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  insightSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  trendsSection: {
    marginBottom: Spacing.lg,
  },
  trendsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  trendsColumn: {
    flex: 1,
  },
  trendsColumnTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
  },
  trendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  recommendationsSection: {
    marginBottom: Spacing.lg,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...GlobalStyles.shadow,
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    ...Typography.body,
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

export default LearningAnalyticsScreen;