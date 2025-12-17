"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Clock, 
  Star, 
  Target, 
  BookOpen,
  Calculator,
  Award,
  Download,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp
} from "lucide-react";

// Import all the enhanced components
import LessonPlayer from "./LessonPlayer";
import ContentRenderer from "./ContentRenderer";
import VideoPlayer from "./VideoPlayer";
import SIPCalculator from "./calculators/SIPCalculator";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";
import DownloadableResources from "./DownloadableResources";
import ProgressTracker from "./ProgressTracker";

interface EnhancedLessonExampleProps {
  lessonId: string;
  courseId: string;
}

export default function EnhancedLessonExample({ lessonId, courseId }: EnhancedLessonExampleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Enhanced lesson data with all interactive components
  const lesson = {
    id: lessonId,
    title: "Introduction to SIP - Systematic Investment Plans",
    description: "Learn how SIPs can help you build wealth systematically through regular investments",
    duration: 25,
    difficulty: "Beginner",
    xpReward: 75,
    courseId,
    
    learningObjectives: [
      "Understand what SIP is and how it works",
      "Learn the benefits of systematic investing",
      "Calculate SIP returns using real examples",
      "Plan your first SIP investment strategy"
    ],

    // Enhanced content with multiple types
    content: {
      type: 'interactive',
      html: `
        <h2>What is a Systematic Investment Plan (SIP)?</h2>
        <p>A Systematic Investment Plan (SIP) is a method of investing a fixed amount regularly in mutual funds. It's like automating your investments to build wealth over time.</p>
        
        <h3>Key Benefits of SIP:</h3>
        <ul>
          <li><strong>Rupee Cost Averaging:</strong> Buy more units when prices are low, fewer when prices are high</li>
          <li><strong>Discipline:</strong> Creates a savings and investment habit</li>
          <li><strong>Power of Compounding:</strong> Returns generate returns over time</li>
          <li><strong>Flexibility:</strong> Start with small amounts (₹500) and increase later</li>
          <li><strong>Professional Management:</strong> Fund managers handle your investments</li>
        </ul>

        <div class="highlight-box">
          <h4>💡 Did You Know?</h4>
          <p>Starting a SIP of ₹5,000 per month for 20 years at 12% returns can create a corpus of ₹49.97 lakhs, while you would have invested only ₹12 lakhs!</p>
        </div>
      `,
      
      interactiveElements: [
        {
          type: 'calculator',
          title: 'SIP Calculator',
          description: 'Calculate how much your SIP will grow over time',
          calculatorType: 'sip'
        },
        {
          type: 'calculator',
          title: 'Compound Interest Calculator',
          description: 'See the power of compounding in action',
          calculatorType: 'compound-interest'
        }
      ],

      // Video content
      videoData: {
        id: 'sip-intro-video',
        title: 'SIP Explained in 5 Minutes',
        description: 'Visual explanation of how SIPs work and their benefits',
        duration: '5:30',
        autoPlay: false
      },

      // Quiz questions
      quizQuestions: [
        {
          id: 1,
          question: "What does SIP stand for?",
          options: [
            "Systematic Investment Plan",
            "Savings Investment Program", 
            "Strategic Investment Policy",
            "Standard Investment Process"
          ],
          correct_answer: 0,
          explanation: "SIP stands for Systematic Investment Plan, which allows regular fixed investments in mutual funds."
        },
        {
          id: 2,
          question: "What is the minimum amount to start a SIP?",
          options: [
            "₹100",
            "₹500", 
            "₹1000",
            "₹5000"
          ],
          correct_answer: 1,
          explanation: "You can start a SIP with as little as ₹500 per month in most mutual funds."
        },
        {
          id: 3,
          question: "What is rupee cost averaging?",
          options: [
            "Paying same amount regardless of market conditions",
            "Buying more units when price is low, fewer when high",
            "Investing only in bear markets",
            "Average cost of all investments"
          ],
          correct_answer: 1,
          explanation: "Rupee cost averaging means you buy more units when prices are low and fewer when prices are high, averaging out your purchase cost."
        }
      ]
    },

    resources: [
      {
        id: 'sip-guide',
        title: 'Complete SIP Investment Guide',
        description: 'Comprehensive guide covering all aspects of SIP investing',
        type: 'pdf',
        url: '/courses/downloads/sip-guide.pdf',
        size: '2.5 MB',
        category: 'Guide'
      },
      {
        id: 'sip-calculator',
        title: 'SIP Planning Calculator',
        description: 'Excel template for SIP planning and tracking',
        type: 'excel',
        url: '/courses/downloads/sip-calculator.xlsx',
        size: '180 KB',
        category: 'Tools'
      },
      {
        id: 'fund-comparison',
        title: 'Top SIP Funds Comparison',
        description: 'Comparison of best performing SIP funds',
        type: 'pdf',
        url: '/courses/downloads/fund-comparison.pdf',
        size: '1.8 MB',
        category: 'Research'
      }
    ],

    nextLesson: {
      id: 'sip-calculations',
      title: 'SIP Calculations and Returns',
      url: '/learn/lesson/sip-calculations'
    },

    previousLesson: {
      id: 'mutual-funds-basics',
      title: 'Mutual Funds Basics',
      url: '/learn/lesson/mutual-funds-basics'
    }
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    
    // Auto-complete lesson after 80% watched
    if (time >= (lesson.duration * 60 * 0.8) && !lessonCompleted) {
      setLessonCompleted(true);
    }
  };

  const handleComplete = () => {
    setLessonCompleted(true);
    setIsPlaying(false);
  };

  const handleQuizComplete = (score: number, answers: Record<string, number>) => {
    console.log('Quiz completed:', { score, answers });
    // In real app, save progress and award XP
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Badge className="bg-blue-100 text-blue-800">
                {lesson.difficulty}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {lesson.duration} min
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                +{lesson.xpReward} XP
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{lesson.title}</h1>
            <p className="text-gray-600 text-lg">{lesson.description}</p>
          </div>
          
          {lessonCompleted && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Completed!</span>
            </div>
          )}
        </div>

        {/* Learning Objectives */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-600" />
            Learning Objectives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lesson.learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Video</span>
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Tools</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentRenderer 
            content={lesson.content}
            className="border border-gray-200"
          />
          
          {/* Key Insights */}
          <Card className="border border-yellow-200 bg-yellow-50/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900">Key Takeaways</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                    <p className="text-sm text-yellow-800">
                      <strong>Start Early:</strong> Even small amounts can grow significantly over time
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                    <p className="text-sm text-yellow-800">
                      <strong>Stay Consistent:</strong> Regular investing beats timing the market
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                    <p className="text-sm text-yellow-800">
                      <strong>Increase Gradually:</strong> Step up SIPs with salary hikes
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                    <p className="text-sm text-yellow-800">
                      <strong>Think Long-term:</strong> 5+ years for optimal results
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="space-y-6">
          <VideoPlayer
            videoId={lesson.content.videoData.id}
            title={lesson.content.videoData.title}
            description={lesson.content.videoData.description}
            duration={lesson.content.videoData.duration}
            autoPlay={lesson.content.videoData.autoPlay}
            showControls={true}
            allowDownload={true}
            allowShare={true}
            onTimeUpdate={handleTimeUpdate}
            onComplete={handleComplete}
          />
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <div className="space-y-8">
            <SIPCalculator
              title="Plan Your SIP Investment"
              description="Calculate how much you need to invest monthly to reach your financial goals"
              initialValues={{
                monthlyAmount: 5000,
                annualRate: 12,
                years: 10
              }}
            />
            
            <CompoundInterestCalculator
              title="See the Power of Compounding"
              description="Understand how your investments grow over time"
              initialValues={{
                principal: 100000,
                rate: 12,
                time: 10,
                frequency: 'monthly'
              }}
            />
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <DownloadableResources
            lessonId={lessonId}
            resources={lesson.resources}
            title="Download Learning Materials"
            description="Get access to comprehensive guides, templates, and tools"
            showCategories={true}
          />
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          {lesson.previousLesson && (
            <a
              href={lesson.previousLesson.url}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <div>
                <div className="text-sm text-gray-600">Previous Lesson</div>
                <div className="font-medium">{lesson.previousLesson.title}</div>
              </div>
            </a>
          )}
        </div>
        
        <div>
          {lesson.nextLesson && (
            <a
              href={lesson.nextLesson.url}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <div className="text-right">
                <div className="text-sm text-gray-600">Next Lesson</div>
                <div className="font-medium">{lesson.nextLesson.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <ProgressTracker
        categoryId={courseId}
        moduleId={lessonId}
        currentLesson={lessonId}
        showDetailed={false}
      />
    </div>
  );
}