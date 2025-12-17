// Web Application Course Integration - Next.js Implementation
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  CheckCircle, 
  Lock,
  Award,
  TrendingUp,
  Users,
  Download,
  Share2,
  Bookmark
} from 'lucide-react';

// Course Context for Global State Management
const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Course API integration
  const courseAPI = {
    // Fetch user progress from learning analytics API
    async getUserProgress(userId) {
      try {
        const response = await fetch(`/api/learning-analytics?userId=${userId}&type=dashboard`);
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
        return null;
      }
    },
    
    // Get AI-powered course recommendations
    async getRecommendations(userId, preferences = {}) {
      try {
        const params = new URLSearchParams({
          userId,
          type: 'hybrid',
          ...preferences
        });
        
        const response = await fetch(`/api/ai-recommendations?${params}`);
        const data = await response.json();
        return data.success ? data.data.recommendations : [];
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    },
    
    // Track learning events for analytics
    async trackEvent(userId, lessonId, eventType, metadata = {}) {
      try {
        await fetch('/api/learning-analytics', {
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
    
    // Search and filter course content
    async searchContent(filters) {
      try {
        const params = new URLSearchParams({
          action: 'search',
          ...filters
        });
        
        const response = await fetch(`/api/content?${params}`);
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('Failed to search content:', error);
        return null;
      }
    },
    
    // Get course analytics
    async getCourseAnalytics(courseId) {
      try {
        const response = await fetch(`/api/content?action=analytics&contentId=${courseId}`);
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        console.error('Failed to fetch course analytics:', error);
        return null;
      }
    }
  };
  
  // Initialize course data
  useEffect(() => {
    initializeCourseData();
  }, []);
  
  const initializeCourseData = async () => {
    try {
      setIsLoading(true);
      const userId = await getCurrentUserId();
      
      // Load user progress and recommendations in parallel
      const [progress, recs] = await Promise.all([
        courseAPI.getUserProgress(userId),
        courseAPI.getRecommendations(userId)
      ]);
      
      setUserProgress(progress);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to initialize course data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <CourseContext.Provider value={{
      userProgress,
      setUserProgress,
      recommendations,
      setRecommendations,
      currentCourse,
      setCurrentCourse,
      courseAPI,
      isLoading
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => useContext(CourseContext);

// Main Course Dashboard Component
export const CourseDashboard = () => {
  const { userProgress, recommendations, isLoading } = useCourse();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Learning Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Continue your financial education journey
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Browse All Courses
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <ProgressOverview userProgress={userProgress} />
        
        {/* Quick Actions */}
        <QuickActions router={router} />
        
        {/* Personalized Recommendations */}
        <PersonalizedRecommendations recommendations={recommendations} />
        
        {/* Course Categories */}
        <CourseCategories router={router} />
        
        {/* Recent Activity */}
        <RecentActivity userProgress={userProgress} />
      </main>
    </div>
  );
};

// Progress Overview Component
const ProgressOverview = ({ userProgress }) => {
  if (!userProgress) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  const { overview } = userProgress;
  const progressPercentage = overview ? (overview.totalLessonsCompleted / 382) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {overview?.totalLessonsCompleted || 0}/382
          </div>
          <div className="text-blue-100">Lessons Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {overview?.currentStreak || 0}
          </div>
          <div className="text-blue-100">Day Streak</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {overview?.overallScore || 0}%
          </div>
          <div className="text-blue-100">Average Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {overview?.level || 'Beginner'}
          </div>
          <div className="text-blue-100">Current Level</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-blue-500 bg-opacity-30 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-white h-3 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

// Quick Actions Component
const QuickActions = ({ router }) => {
  const actions = [
    {
      id: 'continue',
      title: 'Continue Learning',
      description: 'Resume where you left off',
      icon: <Play className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => router.push('/learn/continue')
    },
    {
      id: 'recommendations',
      title: 'AI Recommendations',
      description: 'Personalized course suggestions',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => router.push('/recommendations')
    },
    {
      id: 'progress',
      title: 'View Progress',
      description: 'Detailed learning analytics',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => router.push('/progress')
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Your learning milestones',
      icon: <Award className="w-6 h-6" />,
      color: 'bg-yellow-500',
      action: () => router.push('/achievements')
    }
  ];
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`${action.color} text-white p-6 rounded-xl hover:shadow-lg transition-all duration-200 text-left`}
          >
            <div className="flex items-center space-x-3 mb-3">
              {action.icon}
              <h3 className="font-semibold">{action.title}</h3>
            </div>
            <p className="text-sm opacity-90">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

// Personalized Recommendations Component
const PersonalizedRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600">Complete a few lessons to get personalized recommendations!</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.slice(0, 6).map((recommendation, index) => (
          <motion.div
            key={recommendation.lessonId || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-80" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {recommendation.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {recommendation.title || 'Financial Basics'}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {recommendation.description || 'Learn fundamental financial concepts and build a strong foundation for your investment journey.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recommendation.duration || '20 min'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{recommendation.rating || '4.8'}</span>
                  </div>
                </div>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Start
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Course Categories Component
const CourseCategories = ({ router }) => {
  const categories = [
    {
      id: 'foundation',
      title: 'Foundation Level',
      description: 'Start your financial journey with the basics',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      modules: 3,
      lessons: 211,
      level: 'Beginner',
      completed: 45
    },
    {
      id: 'intermediate',
      title: 'Intermediate Level',
      description: 'Build on your knowledge with advanced concepts',
      icon: '📈',
      color: 'from-green-500 to-green-600',
      modules: 3,
      lessons: 101,
      level: 'Intermediate',
      completed: 12
    },
    {
      id: 'advanced',
      title: 'Advanced Level',
      description: 'Master professional financial skills',
      icon: '🎯',
      color: 'from-purple-500 to-purple-600',
      modules: 3,
      lessons: 70,
      level: 'Advanced',
      completed: 2
    }
  ];
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Course Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const progressPercentage = (category.completed / category.lessons) * 100;
          
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
              onClick={() => router.push(`/courses/${category.id}`)}
            >
              <div className={`h-32 bg-gradient-to-r ${category.color} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded">
                    {category.level}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{category.completed}/{category.lessons} lessons</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`bg-gradient-to-r ${category.color} h-2 rounded-full`}
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-lg font-bold text-gray-900">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// Utility Functions
const getCurrentUserId = async () => {
  // Get user ID from authentication context or local storage
  // This would integrate with your existing auth system
  return 'user123'; // Replace with actual user ID
};

export default CourseDashboard;