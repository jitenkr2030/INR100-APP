/**
 * Course Detail Screen for INR100 Mobile App
 * Displays individual course information and allows enrollment
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// Services
import APIService from '../../services/APIService';
import AnalyticsService from '../../services/AnalyticsService';

// Styles
import { Colors, Typography, Spacing, BorderRadius, GlobalStyles } from '../../styles/GlobalStyles';

const { width } = Dimensions.get('window');

const CourseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, moduleId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    loadCourseDetail();
    
    // Track screen view
    AnalyticsService.getInstance().trackScreenView('CourseDetail', 'CourseDetailScreen');
  }, [categoryId, moduleId]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      
      const apiService = APIService.getInstance();
      const response = await apiService.getLearningContent();
      
      if (response.success) {
        const categoryData = response.data.courses.find((cat: any) => cat.id === categoryId);
        if (categoryData) {
          const courseData = categoryData.modules.find((mod: any) => mod.id === moduleId);
          if (courseData) {
            setCourse(courseData);
            setEnrolled(courseData.isEnrolled);
          }
        }
      }
    } catch (error) {
      console.error('Load course detail error:', error);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      // Track enrollment
      await AnalyticsService.getInstance().trackLearningStart(course.id, 'course');
      
      setEnrolled(true);
      setCourse((prev: any) => ({ ...prev, isEnrolled: true, progress: 0 }));
      
      Alert.alert('Success', 'Successfully enrolled in course!');
    } catch (error) {
      console.error('Enroll error:', error);
      Alert.alert('Error', 'Failed to enroll in course');
    }
  };

  const handleStartCourse = () => {
    navigation.navigate('LessonDetail', {
      categoryId,
      moduleId,
      lessonId: 'lesson-1'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.gray500;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.info;
      case 'low': return Colors.gray500;
      default: return Colors.gray500;
    }
  };

  const getIconName = (icon: string) => {
    const icons: Record<string, string> = {
      'BookOpen': 'book-outline',
      'TrendingUp': 'trending-up-outline',
      'PieChart': 'pie-chart-outline',
      'PiggyBank': 'wallet-outline',
      'Brain': 'brain-outline',
      'Shield': 'shield-checkmark-outline',
      'AlertTriangle': 'warning-outline',
      'Home': 'home-outline',
      'Building': 'business-outline',
      'CreditCard': 'card-outline',
      'Target': 'target-outline',
      'Zap': 'flash-outline',
      'Award': 'trophy-outline'
    };
    return icons[icon] || 'book-outline';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.white} />
      </TouchableOpacity>
      
      <View style={styles.courseInfo}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getIconName(course?.icon)} 
            size={32} 
            color={Colors.white} 
          />
        </View>
        <Text style={styles.courseTitle}>{course?.title}</Text>
        <Text style={styles.courseSubtitle}>
          {course?.duration} • {course?.lessons} lessons
        </Text>
      </View>
    </LinearGradient>
  );

  const renderEnrollmentCard = () => (
    <View style={styles.enrollmentCard}>
      {enrolled ? (
        <View style={styles.enrolledContainer}>
          <View style={styles.enrolledIcon}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
          <View style={styles.enrolledText}>
            <Text style={styles.enrolledTitle}>You're Enrolled!</Text>
            <Text style={styles.enrolledSubtitle}>Continue your learning journey</Text>
          </View>
        </View>
      ) : (
        <View style={styles.notEnrolledContainer}>
          <Text style={styles.enrollTitle}>Start Learning Today</Text>
          <Text style={styles.enrollSubtitle}>Join thousands of learners</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.enrollButton,
          enrolled && styles.continueButton
        ]}
        onPress={enrolled ? handleStartCourse : handleEnroll}
      >
        <Text style={styles.enrollButtonText}>
          {enrolled ? (course?.progress > 0 ? 'Continue Learning' : 'Start Course') : 'Enroll Now - Free'}
        </Text>
        <Ionicons 
          name={enrolled ? "play-circle-outline" : "add-circle-outline"} 
          size={20} 
          color={Colors.white} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderCourseStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{course?.lessons}</Text>
        <Text style={styles.statLabel}>Lessons</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{course?.topics?.length}</Text>
        <Text style={styles.statLabel}>Topics</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>+{course?.xpReward}</Text>
        <Text style={styles.statLabel}>XP Reward</Text>
      </View>
    </View>
  );

  const renderProgress = () => {
    if (!enrolled || !course?.progress) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>{course.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${course.progress}%` }
              ]} 
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Math.floor((course.progress / 100) * course.lessons)}
              </Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {course.lessons - Math.floor((course.progress / 100) * course.lessons)}
              </Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {Math.floor((course.progress / 100) * course.xpReward)}
              </Text>
              <Text style={styles.progressStatLabel}>XP Earned</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTopics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What You'll Learn</Text>
      <Text style={styles.sectionSubtitle}>
        This course covers {course?.topics?.length} key topics designed to build your expertise
      </Text>
      
      <View style={styles.topicsList}>
        {course?.topics?.map((topic: string, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={styles.topicItem}
            onPress={() => {
              const lessonId = `lesson-${(index + 1).toString().padStart(3, '0')}`;
              navigation.navigate('LessonDetail', {
                categoryId,
                moduleId,
                lessonId
              });
            }}
          >
            <View style={styles.topicNumber}>
              <Text style={styles.topicNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.topicText}>{topic}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBenefits = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Why Take This Course?</Text>
      
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: `${Colors.accent}20` }]}>
            <Ionicons name="trophy-outline" size={20} color={Colors.accent} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Earn XP Rewards</Text>
            <Text style={styles.benefitDescription}>
              Complete lessons and earn up to {course?.xpReward} experience points
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: `${Colors.success}20` }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Build Expertise</Text>
            <Text style={styles.benefitDescription}>
              Master the fundamentals with structured learning
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: `${Colors.primary}20` }]}>
            <Ionicons name="analytics-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Track Progress</Text>
            <Text style={styles.benefitDescription}>
              Monitor your learning journey with detailed analytics
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.badgesContainer}>
      <View style={[
        styles.badge,
        { backgroundColor: `${getLevelColor(course?.level)}20` }
      ]}>
        <Text style={[
          styles.badgeText,
          { color: getLevelColor(course?.level) }
        ]}>
          {course?.level?.toUpperCase()}
        </Text>
      </View>
      
      <View style={[
        styles.badge,
        { backgroundColor: `${getImportanceColor(course?.importance)}20` }
      ]}>
        <Text style={[
          styles.badgeText,
          { color: getImportanceColor(course?.importance) }
        ]}>
          {course?.importance?.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading course...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Course Not Found</Text>
            <Text style={styles.errorSubtitle}>The requested course could not be found</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{course.description}</Text>
          {renderBadges()}
        </View>

        {/* Course Stats */}
        <View style={styles.statsCard}>
          {renderCourseStats()}
        </View>

        {/* Enrollment */}
        <View style={styles.section}>
          {renderEnrollmentCard()}
        </View>

        {/* Progress */}
        {renderProgress()}

        {/* Topics */}
        {renderTopics()}

        {/* Benefits */}
        {renderBenefits()}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: Colors.white + '30',
    borderTopColor: Colors.white,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  loadingText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  errorSubtitle: {
    color: Colors.white + '80',
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  courseInfo: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.white + '20',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  courseTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  courseSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.white + '80',
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray700,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray200,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    marginBottom: Spacing.md,
  },
  enrollmentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  enrolledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  enrolledIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.success + '20',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  enrolledText: {
    flex: 1,
  },
  enrolledTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.success,
  },
  enrolledSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  notEnrolledContainer: {
    marginBottom: Spacing.md,
  },
  enrollTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  enrollSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  enrollButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: Colors.success,
  },
  enrollButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  progressCard: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
    color: Colors.gray700,
  },
  progressPercentage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.gray900,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray600,
  },
  topicsList: {
    gap: Spacing.sm,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  topicNumber: {
    width: 24,
    height: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  topicNumberText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  topicText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
    flex: 1,
  },
  benefitsList: {
    gap: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    lineHeight: 20,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
});

export default CourseDetailScreen;