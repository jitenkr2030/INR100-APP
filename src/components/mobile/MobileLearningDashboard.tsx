import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  Target,
  ChevronRight,
  Menu,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle,
  Star
} from 'lucide-react';

interface MobileLearningDashboardProps {
  userId: string;
  currentLesson?: string;
  onLessonSelect: (lessonId: string) => void;
}

interface LearningProgress {
  completedLessons: number;
  totalLessons: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  xpEarned: number;
  level: string;
  nextMilestone: {
    title: string;
    progress: number;
    target: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface TodayActivity {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'review';
  duration: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MobileLearningDashboard: React.FC<MobileLearningDashboardProps> = ({
  userId,
  currentLesson,
  onLessonSelect
}) => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls - replace with actual API integration
      const progressData: LearningProgress = {
        completedLessons: 45,
        totalLessons: 382,
        currentStreak: 7,
        weeklyGoal: 5,
        weeklyProgress: 3,
        xpEarned: 2250,
        level: 'Intermediate',
        nextMilestone: {
          title: 'Complete Stock Analysis Module',
          progress: 8,
          target: 12
        }
      };
      
      const activities: TodayActivity[] = [
        {
          id: '1',
          title: 'Mutual Fund Basics Review',
          type: 'review',
          duration: '15 min',
          completed: false,
          difficulty: 'easy'
        },
        {
          id: '2',
          title: 'Portfolio Construction Quiz',
          type: 'quiz',
          duration: '20 min',
          completed: true,
          difficulty: 'medium'
        },
        {
          id: '3',
          title: 'Derivatives Introduction',
          type: 'lesson',
          duration: '25 min',
          completed: false,
          difficulty: 'hard'
        }
      ];
      
      setProgress(progressData);
      setTodayActivities(activities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'continue',
      title: 'Continue Learning',
      icon: <Play className="w-5 h-5" />,
      action: () => currentLesson && onLessonSelect(currentLesson),
      color: 'bg-blue-500'
    },
    {
      id: 'quiz',
      title: 'Take Quiz',
      icon: <Target className="w-5 h-5" />,
      action: () => router.push('/quiz'),
      color: 'bg-green-500'
    },
    {
      id: 'progress',
      title: 'View Progress',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => router.push('/progress'),
      color: 'bg-purple-500'
    },
    {
      id: 'achievements',
      title: 'Achievements',
      icon: <Award className="w-5 h-5" />,
      action: () => router.push('/achievements'),
      color: 'bg-yellow-500'
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">INR100</h1>
          
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Learning Dashboard</h2>
                  <p className="text-sm text-gray-600">{progress?.level} Level</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <a href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
                  <BookOpen className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="/courses" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
                  <BookOpen className="w-5 h-5" />
                  <span>Courses</span>
                </a>
                <a href="/progress" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
                  <TrendingUp className="w-5 h-5" />
                  <span>Progress</span>
                </a>
                <a href="/achievements" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
                  <Award className="w-5 h-5" />
                  <span>Achievements</span>
                </a>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Greeting */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to continue your financial education journey?
          </p>
        </section>

        {/* Progress Overview */}
        {progress && (
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progress.completedLessons}/{progress.totalLessons}
                </div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progress.currentStreak}
                </div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Weekly Goal</span>
                  <span>{progress.weeklyProgress}/{progress.weeklyGoal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.weeklyProgress / progress.weeklyGoal) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next Milestone</span>
                <span className="text-sm font-medium">
                  {progress.nextMilestone.progress}/{progress.nextMilestone.target}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 hover:shadow-lg`}
              >
                {action.icon}
                <span className="text-sm font-medium text-center">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Today's Activities */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Activities</h3>
            <button className="text-blue-600 text-sm font-medium">View All</button>
          </div>
          
          <div className="space-y-3">
            {todayActivities.map((activity) => (
              <motion.div
                key={activity.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getDifficultyColor(activity.difficulty)}`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{activity.duration}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                            {activity.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {activity.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <button
                        onClick={() => onLessonSelect(activity.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="w-6 h-6" />
              <h4 className="font-semibold">Personalized Learning Path</h4>
            </div>
            <p className="text-blue-100 mb-4">
              Based on your progress, we recommend focusing on portfolio management next.
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Start Recommended Path
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center space-y-1 p-2 text-blue-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Learn</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <Target className="w-5 h-5" />
            <span className="text-xs">Quiz</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Progress</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <Award className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileLearningDashboard;