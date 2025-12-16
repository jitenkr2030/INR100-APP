/**
 * Advanced Features Dashboard for INR100 Mobile App
 * Central hub for accessing all advanced learning features
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

const AdvancedFeaturesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId = 'demo-user' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: 1247,
    analyticsAccuracy: 94.2,
    performanceScore: 'A+',
    testCoverage: 89
  });

  useEffect(() => {
    loadDashboardData();
    trackScreenView();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load various statistics
      // In a real app, this would fetch from multiple APIs
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const trackScreenView = () => {
    AnalyticsService.trackScreen('AdvancedFeaturesScreen');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const navigateToFeature = (feature) => {
    switch (feature.id) {
      case 'social-learning':
        navigation.navigate('SocialLearning', { userId });
        break;
      case 'learning-analytics':
        navigation.navigate('LearningAnalytics', { userId, dateRange: 'month' });
        break;
      case 'performance-optimization':
        navigation.navigate('PerformanceOptimization', { userId });
        break;
      default:
        break;
    }
  };

  const features = [
    {
      id: 'social-learning',
      title: 'Social Learning',
      description: 'Connect with peers through discussions, study groups, and progress sharing',
      icon: 'people',
      color: Colors.primary,
      usage: 87,
      impact: 'high'
    },
    {
      id: 'learning-analytics',
      title: 'Learning Analytics',
      description: 'Deep insights into your learning patterns, performance, and personalized recommendations',
      icon: 'analytics',
      color: Colors.success,
      usage: 92,
      impact: 'high'
    },
    {
      id: 'performance-optimization',
      title: 'Performance Optimization',
      description: 'Real-time performance monitoring and optimization recommendations',
      icon: 'speedometer',
      color: Colors.warning,
      usage: 75,
      impact: 'medium'
    }
  ];

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

  const renderFeatureCard = (feature) => (
    <TouchableOpacity
      key={feature.id}
      style={styles.featureCard}
      onPress={() => navigateToFeature(feature)}
    >
      <LinearGradient
        colors={[feature.color + '20', feature.color + '10']}
        style={styles.featureCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featureHeader}>
          <View style={[styles.featureIcon, { backgroundColor: feature.color + '30' }]}>
            <Ionicons name={feature.icon} size={32} color={feature.color} />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription} numberOfLines={2}>
              {feature.description}
            </Text>
            <View style={styles.featureMeta}>
              <Text style={styles.featureMetaText}>
                Usage: {feature.usage}%
              </Text>
              <View style={[styles.impactBadge, { backgroundColor: getImpactColor(feature.impact) + '20' }]}>
                <Text style={[styles.impactText, { color: getImpactColor(feature.impact) }]}>
                  {feature.impact} impact
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderStatCard = (title, value, subtitle, icon, color) => (
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && (
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      )}
    </LinearGradient>
  );

  const renderBenefitCard = (title, description, icon, color) => (
    <View style={styles.benefitCard}>
      <View style={[styles.benefitIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.benefitInfo}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
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
          <Text style={styles.title}>Advanced Features</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.title}>Advanced Features</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Active Users',
              stats.activeUsers.toLocaleString(),
              '+12% this week',
              'people',
              Colors.primary
            )}
            {renderStatCard(
              'Analytics Accuracy',
              `${stats.analyticsAccuracy}%`,
              '+2.1% improvement',
              'checkmark-circle',
              Colors.success
            )}
            {renderStatCard(
              'Performance Score',
              stats.performanceScore,
              'Excellent rating',
              'trophy',
              Colors.warning
            )}
            {renderStatCard(
              'Test Coverage',
              `${stats.testCoverage}%`,
              'Above target',
              'shield-checkmark',
              Colors.secondary
            )}
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          <View style={styles.features}>
            {features.map(renderFeatureCard)}
          </View>
        </View>

        {/* Platform Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Benefits</Text>
          <View style={styles.benefits}>
            {renderBenefitCard(
              'Enhanced Collaboration',
              'Connect with fellow learners through discussions, study groups, and peer support systems.',
              'people',
              Colors.primary
            )}
            {renderBenefitCard(
              'Data-Driven Insights',
              'Get personalized analytics and recommendations based on your learning patterns and progress.',
              'analytics',
              Colors.success
            )}
            {renderBenefitCard(
              'Optimized Performance',
              'Benefit from continuously optimized platform performance and intelligent caching systems.',
              'speedometer',
              Colors.warning
            )}
            {renderBenefitCard(
              'Quality Assurance',
              'Experience a robust, thoroughly tested platform with comprehensive quality control measures.',
              'shield-checkmark',
              Colors.secondary
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activity}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: Colors.success }]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Learning Analytics updated</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: Colors.primary }]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>15 new study group discussions</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: Colors.warning }]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Performance optimization completed</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
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
  settingsButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: (width - Spacing.md * 3) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statValue: {
    ...Typography.h4,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  features: {
    gap: Spacing.sm,
  },
  featureCard: {
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  featureCardGradient: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  impactBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  impactText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  benefits: {
    gap: Spacing.sm,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...GlobalStyles.shadow,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  activity: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    ...GlobalStyles.shadow,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
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

export default AdvancedFeaturesScreen;