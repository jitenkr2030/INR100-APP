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
  TrendingUp,
  Building2
} from "lucide-react";

// Import all enhanced components
import ContentRenderer from "./ContentRenderer";
import VideoPlayer from "./VideoPlayer";
import SIPCalculator from "./calculators/SIPCalculator";
import CompoundInterestCalculator from "./calculators/CompoundInterestCalculator";
import RetirementCalculator from "./calculators/RetirementCalculator";
import DownloadableResources from "./DownloadableResources";
import CaseStudyComponent from "./CaseStudyComponent";
import ProgressTracker from "./ProgressTracker";

interface CompleteInteractiveExampleProps {
  lessonId: string;
  courseId: string;
}

export default function CompleteInteractiveExample({ lessonId, courseId }: CompleteInteractiveExampleProps) {
  const [activeTab, setActiveTab] = useState('content');

  // Comprehensive lesson with ALL interactive components
  const comprehensiveLesson = {
    id: lessonId,
    title: "Complete Financial Planning: From Basics to Advanced",
    description: "Master personal finance through interactive lessons, real calculations, and practical case studies",
    duration: 45,
    difficulty: "Intermediate",
    xpReward: 150,
    courseId,
    
    learningObjectives: [
      "Understand systematic investment planning",
      "Calculate compound interest and SIP returns",
      "Analyze real-world financial scenarios",
      "Create comprehensive financial plans",
      "Master risk management techniques"
    ],

    // Content with ALL interactive elements
    content: {
      type: 'interactive',
      html: `
        <h2>Welcome to Complete Financial Planning</h2>
        <p>In this comprehensive lesson, you'll learn financial planning through hands-on experience with calculators, real case studies, and interactive scenarios.</p>
        
        <h3>What You'll Experience:</h3>
        <ul>
          <li><strong>Interactive SIP Calculator:</strong> Plan your investment journey with real calculations</li>
          <li><strong>Compound Interest Demonstrations:</strong> See the power of compounding in action</li>
          <li><strong>Real Case Study:</strong> Follow Rajesh's transformation from confused investor to systematic planner</li>
          <li><strong>Retirement Planning:</strong> Calculate your retirement corpus requirements</li>
          <li><strong>Downloadable Resources:</strong> Get templates and guides for your own planning</li>
        </ul>

        <div class="highlight-box">
          <h4>🎯 Learning Approach</h4>
          <p>This lesson uses a practical, hands-on approach. You'll make real calculations, analyze actual scenarios, and build your own financial plans using professional-grade tools.</p>
        </div>
      `,
      
      interactiveElements: [
        {
          type: 'calculator',
          title: 'SIP Investment Calculator',
          description: 'Calculate how much your SIP will grow over time',
          calculatorType: 'sip'
        },
        {
          type: 'calculator',
          title: 'Compound Interest Explorer',
          description: 'See how compound interest accelerates wealth building',
          calculatorType: 'compound-interest'
        },
        {
          type: 'calculator',
          title: 'Retirement Planning Calculator',
          description: 'Plan your retirement corpus with inflation adjustment',
          calculatorType: 'retirement'
        },
        {
          type: 'case-study',
          title: 'Real Investment Journey',
          description: 'Follow Rajesh\'s complete transformation story',
          caseStudyId: 'rajesh-sip-journey'
        }
      ],

      // Enhanced video content
      videoData: {
        id: 'complete-financial-planning',
        title: 'Complete Financial Planning Guide',
        description: 'Comprehensive guide covering all aspects of personal finance planning',
        duration: '8:45',
        autoPlay: false
      },

      // Comprehensive quiz
      quizQuestions: [
        {
          id: 1,
          question: "What is the main advantage of SIP investing?",
          options: [
            "Guaranteed high returns",
            "Rupee cost averaging reduces timing risk",
            "No market exposure",
            "Tax-free returns"
          ],
          correct_answer: 1,
          explanation: "SIP's rupee cost averaging means you buy more units when prices are low and fewer when high, averaging out your purchase cost and reducing timing risk."
        },
        {
          id: 2,
          question: "How does compound interest work in investments?",
          options: [
            "Returns are calculated only on principal amount",
            "Returns generate additional returns over time",
            "Interest rate remains constant every year",
            "Compound interest is only for debt instruments"
          ],
          correct_answer: 1,
          explanation: "Compound interest means your returns also earn returns. Over time, this creates exponential growth, which is why starting early is so powerful."
        },
        {
          id: 3,
          question: "What should be the primary goal of retirement planning?",
          options: [
            "Accumulate maximum wealth regardless of risk",
            "Generate income that maintains lifestyle post-retirement",
            "Save as much as possible without planning",
            "Focus only on government schemes"
          ],
          correct_answer: 1,
          explanation: "Retirement planning should focus on creating a corpus that can generate regular income to maintain your desired lifestyle after retirement."
        },
        {
          id: 4,
          question: "In Rajesh's case study, what was his biggest mistake?",
          options: [
            "Earning too much money",
            "Keeping money in low-yield savings accounts",
            "Starting SIP too early",
            "Having clear financial goals"
          ],
          correct_answer: 1,
          explanation: "Rajesh's money was sitting in savings accounts earning only 3.5% when it could have been earning 10-12% in equity funds through SIP."
        }
      ]
    },

    // Comprehensive resources
    resources: [
      {
        id: 'complete-planning-guide',
        title: 'Complete Financial Planning Guide',
        description: 'Comprehensive 50-page guide covering all aspects of personal finance',
        type: 'pdf',
        url: '/courses/downloads/complete-planning-guide.pdf',
        size: '3.2 MB',
        category: 'Guide',
        downloadCount: 2500,
        rating: 4.9
      },
      {
        id: 'sip-planning-template',
        title: 'SIP Planning & Tracking Template',
        description: 'Excel template for SIP planning, tracking, and step-up calculations',
        type: 'excel',
        url: '/courses/downloads/sip-planning-template.xlsx',
        size: '245 KB',
        category: 'Tools',
        downloadCount: 1800,
        rating: 4.7
      },
      {
        id: 'retirement-calculator',
        title: 'Advanced Retirement Calculator',
        description: 'Comprehensive retirement planning calculator with inflation adjustments',
        type: 'excel',
        url: '/courses/downloads/retirement-calculator.xlsx',
        size: '198 KB',
        category: 'Tools',
        downloadCount: 1200,
        rating: 4.8
      },
      {
        id: 'compound-interest-demonstrator',
        title: 'Compound Interest Visualizer',
        description: 'Interactive tool to visualize compound interest over different time periods',
        type: 'excel',
        url: '/courses/downloads/compound-interest-visualizer.xlsx',
        size: '156 KB',
        category: 'Tools',
        downloadCount: 980,
        rating: 4.6
      },
      {
        id: 'financial-goals-worksheet',
        title: 'Financial Goals Setting Worksheet',
        description: 'Step-by-step worksheet to set and track your financial goals',
        type: 'pdf',
        url: '/courses/downloads/financial-goals-worksheet.pdf',
        size: '1.1 MB',
        category: 'Planning',
        downloadCount: 1650,
        rating: 4.5
      },
      {
        id: 'emergency-fund-planner',
        title: 'Emergency Fund Planning Guide',
        description: 'Complete guide to building and maintaining your emergency fund',
        type: 'pdf',
        url: '/courses/downloads/emergency-fund-planner.pdf',
        size: '890 KB',
        category: 'Planning',
        downloadCount: 1420,
        rating: 4.4
      }
    ],

    nextLesson: {
      id: 'advanced-portfolio-building',
      title: 'Advanced Portfolio Building Strategies',
      url: '/learn/lesson/advanced-portfolio-building'
    },

    previousLesson: {
      id: 'mutual-funds-fundamentals',
      title: 'Mutual Funds Fundamentals',
      url: '/learn/lesson/mutual-funds-fundamentals'
    }
  };

  const handleQuizComplete = (score: number, answers: Record<string, number>) => {
    console.log('Comprehensive quiz completed:', { score, answers });
    // In real app, save progress and award XP based on score
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border border-blue-200 rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {comprehensiveLesson.difficulty}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {comprehensiveLesson.duration} min
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                +{comprehensiveLesson.xpReward} XP
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Interactive
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{comprehensiveLesson.title}</h1>
            <p className="text-gray-700 text-lg mb-6">{comprehensiveLesson.description}</p>
            
            {/* Learning Objectives */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Learning Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comprehensiveLesson.learningObjectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="ml-8">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
                <div className="text-sm text-gray-600">Interactive Tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="content" className="flex flex-col items-center space-y-1 py-3">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Content</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex flex-col items-center space-y-1 py-3">
            <Play className="h-4 w-4" />
            <span className="text-xs">Video</span>
          </TabsTrigger>
          <TabsTrigger value="calculators" className="flex flex-col items-center space-y-1 py-3">
            <Calculator className="h-4 w-4" />
            <span className="text-xs">Calculators</span>
          </TabsTrigger>
          <TabsTrigger value="case-study" className="flex flex-col items-center space-y-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">Case Study</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex flex-col items-center space-y-1 py-3">
            <Download className="h-4 w-4" />
            <span className="text-xs">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex flex-col items-center space-y-1 py-3">
            <Award className="h-4 w-4" />
            <span className="text-xs">Quiz</span>
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <ContentRenderer 
            content={comprehensiveLesson.content}
            className="border border-gray-200"
          />
          
          {/* Enhanced Key Insights */}
          <Card className="border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900">Key Financial Planning Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium text-yellow-900">Start with SIP</p>
                      <p className="text-sm text-yellow-800">Even ₹5,000/month can create ₹50 lakhs in 20 years</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium text-yellow-900">Compound Interest is Magic</p>
                      <p className="text-sm text-yellow-800">Time in market beats timing the market</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium text-yellow-900">Emergency Fund First</p>
                      <p className="text-sm text-yellow-800">6 months expenses before aggressive investing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-medium text-yellow-900">Step-up Your SIP</p>
                      <p className="text-sm text-yellow-800">Increase SIP with salary hikes for faster wealth building</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video" className="space-y-6">
          <VideoPlayer
            videoId={comprehensiveLesson.content.videoData.id}
            title={comprehensiveLesson.content.videoData.title}
            description={comprehensiveLesson.content.videoData.description}
            duration={comprehensiveLesson.content.videoData.duration}
            autoPlay={comprehensiveLesson.content.videoData.autoPlay}
            showControls={true}
            allowDownload={true}
            allowShare={true}
          />
        </TabsContent>

        {/* Calculators Tab */}
        <TabsContent value="calculators" className="space-y-8">
          <div className="space-y-8">
            <SIPCalculator
              title="Plan Your SIP Investment Journey"
              description="Calculate exactly how much you need to invest monthly to reach your goals"
              initialValues={{
                monthlyAmount: 10000,
                annualRate: 12,
                years: 15
              }}
            />
            
            <CompoundInterestCalculator
              title="Explore the Power of Compounding"
              description="See how different investment amounts and time periods affect your wealth"
              initialValues={{
                principal: 100000,
                rate: 12,
                time: 20,
                frequency: 'monthly'
              }}
            />

            <RetirementCalculator
              title="Plan Your Retirement Corpus"
              description="Calculate how much you need to save for a comfortable retirement"
              initialValues={{
                currentAge: 30,
                retirementAge: 60,
                currentSavings: 500000,
                monthlyContribution: 20000,
                expectedReturn: 10,
                inflationRate: 5,
                monthlyExpenses: 75000
              }}
            />
          </div>
        </TabsContent>

        {/* Case Study Tab */}
        <TabsContent value="case-study" className="space-y-6">
          <CaseStudyComponent
            caseStudyId="rajesh-sip-journey"
            title="Real Investment Transformation Story"
            description="Follow Rajesh's journey from financial confusion to systematic wealth building"
          />
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <DownloadableResources
            lessonId={lessonId}
            resources={comprehensiveLesson.resources}
            title="Complete Financial Planning Resource Kit"
            description="Get access to comprehensive guides, templates, and tools for your financial planning journey"
            showCategories={true}
            maxResources={6}
          />
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <Card className="border border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Comprehensive Knowledge Assessment</h3>
                  <p className="text-sm text-blue-700">Test your understanding of financial planning concepts</p>
                </div>
              </div>
              
              {comprehensiveLesson.content.quizQuestions && (
                <ContentRenderer 
                  content={{
                    ...comprehensiveLesson.content,
                    type: 'quiz'
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          {comprehensiveLesson.previousLesson && (
            <a
              href={comprehensiveLesson.previousLesson.url}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <div>
                <div className="text-sm text-gray-600">Previous Lesson</div>
                <div className="font-medium">{comprehensiveLesson.previousLesson.title}</div>
              </div>
            </a>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Complete Lesson Progress</div>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4"></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">75% Complete</div>
        </div>
        
        <div>
          {comprehensiveLesson.nextLesson && (
            <a
              href={comprehensiveLesson.nextLesson.url}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm text-gray-600">Next Lesson</div>
                <div className="font-medium">{comprehensiveLesson.nextLesson.title}</div>
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