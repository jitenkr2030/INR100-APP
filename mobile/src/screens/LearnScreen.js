/**
 * Enhanced Learn Screen for INR100 Mobile App
 * Matching web app functionality with tabs and full learning capabilities
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

// Services
import APIService from '../../services/APIService';
import AnalyticsService from '../../services/AnalyticsService';

// Styles
import { Colors, Typography, Spacing, BorderRadius, GlobalStyles } from '../../styles/GlobalStyles';

const { width } = Dimensions.get('window');

const LearnScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Learning data states
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userData, setUserData] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Learning Paths Data (matching web app)
  const LEARNING_PATHS = [
    {
      id: 'beginner-path',
      title: 'Complete Beginner Path',
      description: 'Start from zero and build strong foundations',
      duration: '2-3 weeks',
      level: 'beginner',
      totalXp: 575,
      icon: 'star-outline',
      color: 'bg-green-100',
      courses: []
    },
    {
      id: 'safety-first',
      title: 'Safety First Path',
      description: 'Learn to protect yourself and invest safely',
      duration: '1-2 weeks',
      level: 'beginner',
      totalXp: 400,
      icon: 'shield-checkmark-outline',
      color: 'bg-blue-100',
      courses: []
    },
    {
      id: 'wealth-builder',
      title: 'Wealth Builder Path',
      description: 'Focus on long-term wealth creation',
      duration: '2-3 weeks',
      level: 'intermediate',
      totalXp: 500,
      icon: 'trending-up-outline',
      color: 'bg-purple-100',
      courses: []
    },
    {
      id: 'advanced-investor',
      title: 'Advanced Investor Path',
      description: 'Master sophisticated investment strategies',
      duration: '4-6 weeks',
      level: 'advanced',
      totalXp: 725,
      icon: 'trophy-outline',
      color: 'bg-red-100',
      courses: []
    }
  ];

  // Achievements Data (matching web app)
  const ACHIEVEMENTS = [
    {
      id: 'safety-first',
      title: 'Safety First',
      description: 'Complete Scam Awareness course',
      icon: 'shield-checkmark-outline',
      isUnlocked: true,
      unlockedAt: '2024-01-15',
      progress: 100
    },
    {
      id: 'foundation-builder',
      title: 'Foundation Builder',
      description: 'Complete Stock Market Foundations',
      icon: 'briefcase-outline',
      isUnlocked: false,
      progress: 60
    },
    {
      id: 'wealth-creator',
      title: 'Wealth Creator',
      description: 'Complete SIP & Wealth Building course',
      icon: 'wallet-outline',
      isUnlocked: false,
      progress: 30
    },
    {
      id: 'knowledge-seeker',
      title: 'Knowledge Seeker',
      description: 'Complete 5 courses',
      icon: 'book-outline',
      isUnlocked: false,
      progress: 2
    },
    {
      id: 'risk-manager',
      title: 'Risk Manager',
      description: 'Complete Risk Management course',
      icon: 'shield-outline',
      isUnlocked: false,
      progress: 45
    },
    {
      id: 'financial-planner',
      title: 'Financial Planner',
      description: 'Complete Personal Finance course',
      icon: 'school-outline',
      isUnlocked: false,
      progress: 20
    }
  ];

  const CATEGORY_TITLES = {
    'stock-market': 'Stock Market',
    'mutual-funds': 'Mutual Funds',
    'wealth-building': 'Wealth Building',
    'psychology': 'Behavioral Finance',
    'risk-management': 'Risk Management',
    'safety': 'Safety & Security'
  };

  useEffect(() => {
    loadLearningData();
    
    // Track screen view
    AnalyticsService.getInstance().trackScreenView('Learn', 'LearnScreen');
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      const apiService = APIService.getInstance();
      
      // Load courses from the same API as web app
      const response = await apiService.getLearningContent();
      if (response.success) {
        // Handle the web app API response format
        if (response.data.courses) {
          setCourses(response.data.courses);
        } else {
          // Fallback for mobile format
          setCourses(response.data);
        }
      }

      // Load user data from web app API
      const userResponse = await apiService.getUserStats();
      if (userResponse.success) {
        setUserData(userResponse.data.user || userResponse.data.learningStats || {
          subscriptionTier: 'BASIC',
          totalXp: 2500,
          level: 5,
          completedLessons: 3
        });
      }

      // Set learning paths and achievements
      setLearningPaths(LEARNING_PATHS);
      setAchievements(ACHIEVEMENTS);

    } catch (error) {
      console.error('Load learning data error:', error);
      
      // Fallback to mock data if API fails
      setCourses(getMockCourses());
      setUserData({
        subscriptionTier: 'BASIC',
        totalXp: 2500,
        level: 5,
        completedLessons: 3
      });
      setLearningPaths(LEARNING_PATHS);
      setAchievements(ACHIEVEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const getMockCourses = () => [
    {
      id: 'stock-foundations-001',
      title: 'Stock Market Foundations',
      description: 'Beginner friendly introduction to stock market basics',
      category: 'stock-market',
      module: 'stock-foundations',
      level: 'beginner',
      duration: '2-3 hours',
      lessons: 10,
      topics: ['How the stock market works', 'Primary vs secondary market', 'IPO basics', 'Market indices', 'Trading hours'],
      isEnrolled: true,
      progress: 60,
      xpReward: 150,
      importance: 'high',
      icon: 'trending-up-outline',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'mutual-funds-001',
      title: 'Mutual Funds Deep Dive',
      description: 'Comprehensive guide to mutual fund investing',
      category: 'mutual-funds',
      module: 'mutual-funds-deep-dive',
      level: 'intermediate',
      duration: '3-4 hours',
      lessons: 11,
      topics: ['Types of mutual funds', 'Index vs active funds', 'How NAV works', 'Expense ratio', 'Fund management'],
      isEnrolled: false,
      progress: 0,
      xpReward: 200,
      importance: 'high',
      icon: 'pie-chart-outline',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'sip-wealth-001',
      title: 'SIP & Wealth Building',
      description: 'Master systematic investment and wealth creation',
      category: 'wealth-building',
      module: 'sip-wealth-building',
      level: 'beginner',
      duration: '2-3 hours',
      lessons: 9,
      topics: ['SIP vs lump-sum', 'Power of compounding', 'SIP calculations', 'Financial goals', 'Asset allocation'],
      isEnrolled: true,
      progress: 30,
      xpReward: 175,
      importance: 'high',
      icon: 'wallet-outline',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const refreshLearningData = async () => {
    setRefreshing(true);
    await loadLearningData();
    setRefreshing(false);
  };

  // Event handlers
  const handleEnrollCourse = async (courseId) => {
    try {
      const apiService = APIService.getInstance();
      const response = await apiService.updateLearningProgress(courseId, 0);
      
      if (response.success) {
        // Update local state
        setCourses(prev => prev.map(course => 
          course.id === courseId ? { ...course, isEnrolled: true } : course
        ));
        Alert.alert('Success', 'Successfully enrolled in course!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      Alert.alert('Error', 'Failed to enroll in course');
    }
  };

  const handleStartCourse = (course) => {
    if (!course.isEnrolled) {
      handleEnrollCourse(course.id);
      return;
    }
    
    // Navigate to lesson with course ID
    navigation.navigate('LessonDetail', {
      courseId: course.id,
      lessonId: course.lessonsList?.[0]?.id || 'lesson-01'
    });
  };

  const handleContinueCourse = (course) => {
    navigation.navigate('LessonDetail', {
      courseId: course.id,
      lessonId: 'continue', // This will be handled by the lesson screen
      continue: true
    });
  };

  const handleStartLearningPath = (path) => {
    Alert.alert(
      'Start Learning Path',
      `Begin "${path.title}"? This will enroll you in all courses in this path.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Path', 
          onPress: () => {
            // Navigate to first course in path
            const firstCourse = courses.find(course => 
              path.id === 'beginner-path' && course.category === 'stock-market'
            );
            if (firstCourse) {
              handleStartCourse(firstCourse);
            }
          }
        }
      ]
    );
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.gray500;
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { id: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
        { id: 'categories', label: 'Courses', icon: 'book-outline' },
        { id: 'paths', label: 'Paths', icon: 'map-outline' },
        { id: 'achievements', label: 'Achievements', icon: 'trophy-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Ionicons 
            name={activeTab === tab.id ? tab.icon.replace('-outline', '') : tab.icon}
            size={20}
            color={activeTab === tab.id ? Colors.primary : Colors.gray500}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.tabLabelActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDashboard = () => {
    const enrolledCourses = courses.filter(course => course.isEnrolled);
    const completedCourses = courses.filter(course => course.progress === 100);
    const inProgressCourses = courses.filter(course => course.progress > 0 && course.progress < 100);
    
    const totalLessons = enrolledCourses.reduce((sum, course) => sum + course.lessons, 0);
    const completedLessons = enrolledCourses.reduce((sum, course) => sum + Math.floor(course.lessons * course.progress / 100), 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          style={styles.dashboardHeader}
        >
          <Text style={styles.dashboardTitle}>Welcome back! 🎓</Text>
          <Text style={styles.dashboardSubtitle}>
            Continue building your financial education
          </Text>
          <View style={styles.overallProgress}>
            <Text style={styles.overallProgressText}>{overallProgress}% Complete</Text>
            <View style={styles.overallProgressBar}>
              <View style={[styles.overallProgressFill, { width: `${overallProgress}%` }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {[
            { label: 'Courses Enrolled', value: enrolledCourses.length, icon: 'book-outline', color: Colors.primary },
            { label: 'Courses Completed', value: completedCourses.length, icon: 'checkmark-circle-outline', color: Colors.success },
            { label: 'Lessons Completed', value: `${completedLessons}/${totalLessons}`, icon: 'document-text-outline', color: Colors.accent },
            { label: 'Total XP', value: userData?.totalXp || 0, icon: 'star-outline', color: Colors.warning }
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Continue Learning */}
        {inProgressCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            {inProgressCourses.slice(0, 3).map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => handleContinueCourse(course)}
              >
                <View style={styles.courseHeader}>
                  <Ionicons name={course.icon} size={24} color={Colors.primary} />
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseProgressText}>{course.progress}% complete</Text>
                    <View style={styles.courseProgressBar}>
                      <View style={[styles.courseProgressFill, { width: `${course.progress}%` }]} />
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recommended Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          {courses.filter(course => !course.isEnrolled).slice(0, 3).map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.recommendedCard}
              onPress={() => handleStartCourse(course)}
            >
              <View style={styles.recommendedHeader}>
                <Ionicons name={course.icon} size={20} color={Colors.primary} />
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedTitle}>{course.title}</Text>
                  <Text style={styles.recommendedDescription}>{course.duration}</Text>
                </View>
                <Ionicons name="play-circle-outline" size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderCategories = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.gray500} />
          <Text style={styles.searchInput}>Search courses...</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'all', label: 'All' },
            { id: 'stock-market', label: 'Stock Market' },
            { id: 'mutual-funds', label: 'Mutual Funds' },
            { id: 'wealth-building', label: 'Wealth Building' },
            { id: 'risk-management', label: 'Risk Management' },
            { id: 'safety', label: 'Safety' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedCategory === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(filter.id)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === filter.id && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Courses List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          All Courses ({filteredCourses.length})
        </Text>
        {filteredCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            onPress={() => handleStartCourse(course)}
          >
            <View style={styles.courseHeader}>
              <View style={[styles.courseIconContainer, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name={course.icon} size={24} color={Colors.primary} />
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {course.description}
                </Text>
                <View style={styles.courseMeta}>
                  <View style={styles.courseMetaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.courseMetaText}>{course.duration}</Text>
                  </View>
                  <View style={styles.courseMetaItem}>
                    <Ionicons name="document-outline" size={14} color={Colors.gray500} />
                    <Text style={styles.courseMetaText}>{course.lessons} lessons</Text>
                  </View>
                </View>
                <View style={styles.badgesContainer}>
                  <View style={[
                    styles.levelBadge,
                    { backgroundColor: `${getLevelColor(course.level)}20` }
                  ]}>
                    <Text style={[
                      styles.levelBadgeText,
                      { color: getLevelColor(course.level) }
                    ]}>
                      {course.level.toUpperCase()}
                    </Text>
                  </View>
                  {course.importance === 'critical' && (
                    <View style={styles.importanceBadge}>
                      <Text style={styles.importanceBadgeText}>CRITICAL</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            {course.isEnrolled && (
              <View style={styles.courseProgressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>{course.progress || 0}%</Text>
                </View>
                <View style={styles.courseProgressBar}>
                  <View 
                    style={[
                      styles.courseProgressFill,
                      { 
                        width: `${course.progress || 0}%`,
                        backgroundColor: getLevelColor(course.level)
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {course.isEnrolled ? (course.progress > 0 ? 'Continue' : 'Start Course') : 'View Course'}
              </Text>
              <Ionicons name="play-circle-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderPaths = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Paths</Text>
        <Text style={styles.sectionSubtitle}>
          Structured learning journeys to build your financial knowledge
        </Text>
        
        {learningPaths.map((path) => {
          const enrolledCourses = path.courses.filter(course => course.isEnrolled);
          const pathProgress = path.courses.length > 0 ? 
            Math.round((path.courses.filter(course => course.progress === 100).length / path.courses.length) * 100) : 0;

          return (
            <TouchableOpacity
              key={path.id}
              style={styles.pathCard}
              onPress={() => handleStartLearningPath(path)}
            >
              <View style={styles.pathHeader}>
                <View style={[styles.pathIconContainer, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name={path.icon} size={24} color={Colors.primary} />
                </View>
                <View style={styles.pathInfo}>
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <Text style={styles.pathDescription}>{path.description}</Text>
                  <View style={styles.pathMeta}>
                    <View style={styles.pathMetaItem}>
                      <Ionicons name="time-outline" size={14} color={Colors.gray500} />
                      <Text style={styles.pathMetaText}>{path.duration}</Text>
                    </View>
                    <View style={styles.pathMetaItem}>
                      <Ionicons name="star-outline" size={14} color={Colors.warning} />
                      <Text style={styles.pathMetaText}>+{path.totalXp} XP</Text>
                    </View>
                    <View style={[
                      styles.pathLevelBadge,
                      { backgroundColor: `${getLevelColor(path.level)}20` }
                    ]}>
                      <Text style={[
                        styles.pathLevelBadgeText,
                        { color: getLevelColor(path.level) }
                      ]}>
                        {path.level.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {path.courses.length > 0 && (
                <View style={styles.pathProgress}>
                  <Text style={styles.pathProgressText}>{pathProgress}% Complete</Text>
                  <View style={styles.pathProgressBar}>
                    <View style={[styles.pathProgressFill, { width: `${pathProgress}%` }]} />
                  </View>
                </View>
              )}
              
              <TouchableOpacity style={styles.pathActionButton}>
                <Text style={styles.pathActionButtonText}>
                  {enrolledCourses.length > 0 ? 'Continue Path' : 'Start Path'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderAchievements = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          Track your learning milestones and earn rewards
        </Text>
        
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.isUnlocked && styles.achievementCardUnlocked
              ]}
            >
              <View style={[
                styles.achievementIcon,
                achievement.isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked
              ]}>
                <Ionicons 
                  name={achievement.icon} 
                  size={24} 
                  color={achievement.isUnlocked ? Colors.white : Colors.gray400} 
                />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              
              {achievement.isUnlocked ? (
                <View style={styles.achievementUnlockedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.achievementUnlockedText}>Unlocked</Text>
                </View>
              ) : (
                <View style={styles.achievementProgress}>
                  <Text style={styles.achievementProgressText}>{achievement.progress}%</Text>
                  <View style={styles.achievementProgressBar}>
                    <View style={[styles.achievementProgressFill, { width: `${achievement.progress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="book-outline" size={48} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your learning journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>INR100 Learning Academy</Text>
        <Text style={styles.headerSubtitle}>
          Master investing with comprehensive courses
        </Text>
        
        {/* User Stats */}
        <View style={styles.headerStats}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userData?.level || 1}</Text>
            <Text style={styles.headerStatLabel}>Level</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userData?.totalXp || 0}</Text>
            <Text style={styles.headerStatLabel}>XP</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{userData?.completedLessons || 0}</Text>
            <Text style={styles.headerStatLabel}>Lessons</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'paths' && renderPaths()}
      {activeTab === 'achievements' && renderAchievements()}

      {/* Refresh Control */}
      <RefreshControl refreshing={refreshing} onRefresh={refreshLearningData} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.accentLight,
    marginBottom: Spacing.lg,
  },
  headerStats: {
    backgroundColor: Colors.white + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accentLight,
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.white + '30',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  dashboardHeader: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  dashboardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  dashboardSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.accentLight,
    marginBottom: Spacing.lg,
  },
  overallProgress: {
    marginTop: Spacing.md,
  },
  overallProgressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  overallProgressBar: {
    height: 6,
    backgroundColor: Colors.white + '30',
    borderRadius: 3,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    marginBottom: Spacing.md,
  },
  courseCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  courseDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  courseMeta: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  courseMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray500,
    marginLeft: Spacing.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  levelBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  importanceBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.error,
  },
  importanceBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  courseProgressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
  },
  progressPercentage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.gray900,
  },
  courseProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  courseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  filterScroll: {
    marginBottom: Spacing.sm,
  },
  filterChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  pathCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  pathIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  pathDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  pathMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pathMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginBottom: Spacing.xs,
  },
  pathMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray500,
    marginLeft: Spacing.xs,
  },
  pathLevelBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  pathLevelBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
  },
  pathProgress: {
    marginBottom: Spacing.md,
  },
  pathProgressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  pathProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  pathProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pathActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },
  pathActionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  achievementCardUnlocked: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  achievementIconUnlocked: {
    backgroundColor: Colors.accent,
  },
  achievementIconLocked: {
    backgroundColor: Colors.gray200,
  },
  achievementTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  achievementDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  achievementUnlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.success}20`,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  achievementUnlockedText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  achievementProgress: {
    width: '100%',
  },
  achievementProgressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  courseProgressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
    marginBottom: Spacing.xs,
  },
  courseProgressBar: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
  },
  recommendedCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  recommendedTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    color: Colors.gray900,
    marginBottom: Spacing.xs,
  },
  recommendedDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
});

export default LearnScreen;