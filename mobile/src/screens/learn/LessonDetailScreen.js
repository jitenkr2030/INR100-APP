/**
 * Lesson Detail Screen for INR100 Mobile App
 * Displays individual lesson content with navigation and progress tracking
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
  ActivityIndicator,
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

const LessonDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { courseId, lessonId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadLessonContent();
    trackScreenView();
  }, [courseId, lessonId]);

  const loadLessonContent = async () => {
    try {
      setLoading(true);
      
      const apiService = APIService.getInstance();
      const response = await apiService.getLessonContent(courseId, lessonId);
      
      if (response.success) {
        setLesson(response.data);
        setCompleted(response.data.completed || false);
        setProgress(response.data.progress || 0);
      }
    } catch (error) {
      console.error('Load lesson error:', error);
      Alert.alert('Error', 'Failed to load lesson content');
    } finally {
      setLoading(false);
    }
  };

  const trackScreenView = () => {
    AnalyticsService.getInstance().trackScreenView('LessonDetail', 'LessonDetailScreen');
  };

  const handleComplete = async () => {
    try {
      const apiService = APIService.getInstance();
      await apiService.updateLessonProgress({
        lessonId,
        courseId,
        completed: true,
        timeSpent: currentTime
      });
      
      setCompleted(true);
      setProgress(100);
      
      Alert.alert(
        'Lesson Completed! 🎉',
        `Congratulations! You've earned ${lesson?.xpReward || 50} XP`,
        [
          {
            text: 'Next Lesson',
            onPress: () => handleNextLesson(),
          },
          {
            text: 'Stay Here',
            style: 'cancel',
          }
        ]
      );
    } catch (error) {
      console.error('Complete lesson error:', error);
      Alert.alert('Error', 'Failed to mark lesson as complete');
    }
  };

  const handleNextLesson = () => {
    // Navigate to next lesson or back to course overview
    navigation.navigate('CourseDetail', {
      courseId,
      showNextLesson: true
    });
  };

  const handlePreviousLesson = () => {
    // Navigate to previous lesson
    navigation.navigate('CourseDetail', {
      courseId,
      showPreviousLesson: true
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (!lesson?.content) {
      return (
        <View style={styles.contentPlaceholder}>
          <Text style={styles.placeholderText}>No content available</Text>
        </View>
      );
    }

    switch (lesson.content.type) {
      case 'text':
      case 'markdown':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{lesson.title}</Text>
            <Text style={styles.contentText}>{lesson.content.text || lesson.content.html}</Text>
          </View>
        );

      case 'interactive':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{lesson.title}</Text>
            <Text style={styles.contentText}>{lesson.content.html}</Text>
            {lesson.content.interactiveElements && (
              <View style={styles.interactiveElements}>
                {lesson.content.interactiveElements.map((element, index) => (
                  <TouchableOpacity key={index} style={styles.interactiveElement}>
                    <Text style={styles.interactiveElementTitle}>{element.title}</Text>
                    <Text style={styles.interactiveElementDesc}>{element.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'quiz':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{lesson.title}</Text>
            <Text style={styles.contentText}>{lesson.content.html}</Text>
            <TouchableOpacity style={styles.quizButton}>
              <Text style={styles.quizButtonText}>Start Quiz ({lesson.content.quizQuestions?.length || 0} questions)</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>{lesson.title}</Text>
            <Text style={styles.contentText}>{lesson.content.text || lesson.content.html}</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {lesson.estimatedDuration} min • +{lesson.xpReward || 50} XP
          </Text>
        </View>
        
        {completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {renderContent()}
        
        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <View style={styles.objectivesContainer}>
            <Text style={styles.objectivesTitle}>Learning Objectives</Text>
            {lesson.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.objectiveText}>{objective}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Advanced Features */}
      <View style={styles.advancedFeatures}>
        <Text style={styles.advancedFeaturesTitle}>Explore Advanced Features</Text>
        <View style={styles.featureButtons}>
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => navigation.navigate('SocialLearning', { 
              userId: 'demo-user',
              currentCourse: courseId,
              currentLesson: lessonId 
            })}
          >
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.featureButtonText}>Social Learning</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureButton}
            onPress={() => navigation.navigate('LearningAnalytics', { 
              userId: 'demo-user',
              dateRange: 'month'
            })}
          >
            <Ionicons name="analytics" size={24} color={Colors.success} />
            <Text style={styles.featureButtonText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handlePreviousLesson}
        >
          <Ionicons name="play-skip-back" size={24} color={Colors.textPrimary} />
          <Text style={styles.controlButtonText}>Previous</Text>
        </TouchableOpacity>

        {!completed ? (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.completedButton}
            onPress={handleNextLesson}
          >
            <Text style={styles.completedButtonText}>Next Lesson</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="bookmark-outline" size={24} color={Colors.textPrimary} />
          <Text style={styles.controlButtonText}>Bookmark</Text>
        </TouchableOpacity>
      </View>
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
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.error,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedBadge: {
    padding: Spacing.xs,
  },
  progressContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  contentScroll: {
    flex: 1,
    padding: Spacing.md,
  },
  contentContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contentPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  contentTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  contentText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  interactiveElements: {
    marginTop: Spacing.lg,
  },
  interactiveElement: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  interactiveElementTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  interactiveElementDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quizButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  quizButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  objectivesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  objectivesTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  objectiveText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  controlButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completeButton: {
    flex: 2,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  completeButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  completedButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  completedButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  advancedFeatures: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  advancedFeaturesTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  featureButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  featureButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  featureButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
});

export default LessonDetailScreen;