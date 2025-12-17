# INR100 Course Integration - Web & Mobile App Implementation Guide

## 🎯 **Course Integration Strategy Overview**

The INR100 Financial Education Platform has been built with a comprehensive course structure that can be seamlessly integrated into both web and mobile applications. Here's the complete integration roadmap.

---

## 📱 **Mobile App Integration**

### **1. Course Content Architecture**

#### **Course Structure Ready for Mobile**
```
Mobile App Structure:
├── Courses/
│   ├── Foundation Level (3 modules)
│   │   ├── Module 1: Money Basics (90 lessons)
│   │   ├── Module 2: Banking Systems (82 lessons)
│   │   └── Module 3: Investing Introduction (39 lessons)
│   ├── Intermediate Level (3 modules)
│   │   ├── Module 4: Mutual Funds (30 lessons)
│   │   ├── Module 5: Stock Analysis (32 lessons)
│   │   └── Module 6: Portfolio Building (39 lessons)
│   └── Advanced Level (3 modules)
│       ├── Module 7: Derivatives (25 lessons)
│       ├── Module 8: Alternative Investments (20 lessons)
│       └── Module 9: Professional Trading (25 lessons)
```

#### **Mobile-Optimized Content Delivery**
- **Lesson Metadata**: Each lesson has mobile-friendly metadata
- **Multimedia Content**: Videos, audio, images, interactive content
- **Offline Support**: Content caching for offline learning
- **Progress Tracking**: Real-time sync with web platform

### **2. Mobile App Course Integration Implementation**
<tool_call>
<invoke name="Write">
<parameter name="content">// Mobile App Course Integration - React Native Implementation
import React, { useState, useEffect, useContext, createContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Course Context for Global State Management
const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [offlineContent, setOfflineContent] = useState(new Set());
  
  // Course API Integration
  const courseAPI = {
    // Get user's course progress
    async getUserProgress(userId) {
      try {
        const response = await fetch(`https://api.inr100.com/learning-analytics?userId=${userId}&type=dashboard`);
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
        return null;
      }
    },
    
    // Get personalized course recommendations
    async getRecommendations(userId) {
      try {
        const response = await fetch(`https://api.inr100.com/ai-recommendations?userId=${userId}&type=hybrid`);
        const data = await response.json();
        return data.data.recommendations;
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    },
    
    // Track learning event
    async trackEvent(userId, lessonId, eventType, metadata = {}) {
      try {
        await fetch('https://api.inr100.com/learning-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId,
            eventType,
            metadata,
            timestamp: new Date()
          })
        });
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    },
    
    // Get course content
    async getCourseContent(moduleId, filters = {}) {
      try {
        const queryParams = new URLSearchParams({
          module: moduleId,
          ...filters
        }).toString();
        
        const response = await fetch(`https://api.inr100.com/content?action=search&${queryParams}`);
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Failed to fetch course content:', error);
        return null;
      }
    }
  };
  
  // Offline content management
  const downloadOfflineContent = async (lessonId) => {
    try {
      // Download lesson content for offline access
      const lessonContent = await courseAPI.getCourseContent(lessonId);
      await AsyncStorage.setItem(`lesson_${lessonId}`, JSON.stringify(lessonContent));
      
      setOfflineContent(prev => new Set([...prev, lessonId]));
    } catch (error) {
      console.error('Failed to download offline content:', error);
    }
  };
  
  const isOfflineContentAvailable = (lessonId) => {
    return offlineContent.has(lessonId);
  };
  
  return (
    <CourseContext.Provider value={{
      userProgress,
      setUserProgress,
      currentLesson,
      setCurrentLesson,
      courseAPI,
      downloadOfflineContent,
      isOfflineContentAvailable,
      offlineContent
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => useContext(CourseContext);

// Course Dashboard Component
export const CourseDashboard = ({ navigation }) => {
  const { userProgress, courseAPI } = useCourse();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Load user-specific recommendations
      const userId = await getCurrentUserId();
      const userRecs = await courseAPI.getRecommendations(userId);
      setRecommendations(userRecs);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading your courses...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ padding: 20, paddingTop: 60 }}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
          Your Learning Journey
        </Text>
        <Text style={{ color: 'white', opacity: 0.9 }}>
          Continue building your financial expertise
        </Text>
      </LinearGradient>
      
      {/* Progress Overview */}
      <CourseProgressCard userProgress={userProgress} />
      
      {/* Quick Actions */}
      <QuickActions navigation={navigation} />
      
      {/* Recommended Courses */}
      <RecommendedCourses recommendations={recommendations} navigation={navigation} />
      
      {/* Course Categories */}
      <CourseCategories navigation={navigation} />
    </ScrollView>
  );
};

// Course Progress Card Component
const CourseProgressCard = ({ userProgress }) => {
  const completedLessons = userProgress?.overview?.totalLessonsCompleted || 0;
  const totalLessons = 382; // Total lessons in platform
  const currentStreak = userProgress?.overview?.currentStreak || 0;
  const progressPercentage = (completedLessons / totalLessons) * 100;
  
  return (
    <View style={{
      margin: 16,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
        Your Progress
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea' }}>
            {completedLessons}/{totalLessons}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Lessons Completed</Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>
            {currentStreak}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Day Streak</Text>
        </View>
      </View>
      
      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Overall Progress</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#667eea' }}>
            {progressPercentage.toFixed(1)}%
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#e9ecef', borderRadius: 4 }}>
          <View
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: '#667eea',
              borderRadius: 4,
              transition: 'width 0.3s ease'
            }}
          />
        </View>
      </View>
    </View>
  );
};

// Course Categories Component
const CourseCategories = ({ navigation }) => {
  const categories = [
    {
      id: 'foundation',
      title: 'Foundation Level',
      description: 'Start your financial journey',
      icon: 'school-outline',
      color: '#667eea',
      modules: 3,
      totalLessons: 211
    },
    {
      id: 'intermediate',
      title: 'Intermediate Level',
      description: 'Build on your knowledge',
      icon: 'trending-up-outline',
      color: '#28a745',
      modules: 3,
      totalLessons: 101
    },
    {
      id: 'advanced',
      title: 'Advanced Level',
      description: 'Master professional skills',
      icon: 'trophy-outline',
      color: '#dc3545',
      modules: 3,
      totalLessons: 70
    }
  ];
  
  return (
    <View style={{ margin: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
        Course Categories
      </Text>
      
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}
          onPress={() => navigation.navigate('CourseCategory', { category })}
        >
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${category.color}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16
          }}>
            <Ionicons name={category.icon} size={24} color={category.color} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
              {category.title}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              {category.description}
            </Text>
            <Text style={{ fontSize: 12, color: category.color, fontWeight: '600' }}>
              {category.modules} modules • {category.totalLessons} lessons
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Lesson Viewer Component
export const LessonViewer = ({ route, navigation }) => {
  const { lessonId, moduleId } = route.params;
  const { courseAPI, trackEvent } = useCourse();
  const [lesson, setLesson] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadLesson();
    // Track lesson start
    trackEvent(getCurrentUserId(), lessonId, 'start');
  }, [lessonId]);
  
  const loadLesson = async () => {
    try {
      setIsLoading(true);
      
      // Check if content is available offline
      const offlineContent = await AsyncStorage.getItem(`lesson_${lessonId}`);
      if (offlineContent) {
        setLesson(JSON.parse(offlineContent));
        setIsOffline(true);
        return;
      }
      
      // Load from API
      const lessonData = await courseAPI.getCourseContent(moduleId, { lessonId });
      setLesson(lessonData);
      setIsOffline(false);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      Alert.alert('Error', 'Failed to load lesson content');
    } finally {
      setIsLoading(false);
    }
  };
  
  const markAsComplete = async () => {
    try {
      await trackEvent(getCurrentUserId(), lessonId, 'complete', {
        timeSpent: Date.now() - lesson.startTime,
        score: 85 // Example score
      });
      
      Alert.alert(
        'Lesson Completed!',
        'Great job! You\'ve completed this lesson.',
        [
          {
            text: 'Continue Learning',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to mark as complete:', error);
    }
  };
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading lesson...</Text>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Lesson Header */}
      <View style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
          {lesson?.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isOffline && (
            <View style={{
              backgroundColor: '#28a745',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginRight: 8
            }}>
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                Offline
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 14, color: '#666' }}>
            {lesson?.duration} • {lesson?.difficulty}
          </Text>
        </View>
      </View>
      
      {/* Lesson Content */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Render lesson content based on type */}
        {lesson?.type === 'video' && (
          <VideoPlayer lesson={lesson} />
        )}
        
        {lesson?.type === 'interactive' && (
          <InteractiveContent lesson={lesson} />
        )}
        
        {lesson?.type === 'text' && (
          <TextContent lesson={lesson} />
        )}
        
        {/* Learning Objectives */}
        {lesson?.learning_objectives && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
              Learning Objectives
            </Text>
            {lesson.learning_objectives.map((objective, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
                <Text style={{ color: '#28a745', marginRight: 8, fontWeight: 'bold' }}>✓</Text>
                <Text style={{ flex: 1, color: '#333' }}>{objective}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Lesson Actions */}
      <View style={{
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white'
      }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#667eea',
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={markAsComplete}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Mark as Complete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Utility Functions
const getCurrentUserId = async () => {
  // Get current user ID from secure storage or context
  return 'user123'; // Replace with actual user ID retrieval
};

export default CourseDashboard;