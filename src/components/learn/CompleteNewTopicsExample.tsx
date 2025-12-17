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
  Bitcoin,
  Globe,
  Leaf,
  Shield,
  Building2
} from "lucide-react";

// Import all new topic calculators
import CryptocurrencyCalculator from "./calculators/CryptocurrencyCalculator";
import GovernmentSchemesCalculator from "./calculators/GovernmentSchemesCalculator";
import InternationalInvestmentCalculator from "./calculators/InternationalInvestmentCalculator";
import ESGCalculator from "./calculators/ESGCalculator";
import InsuranceCalculator from "./calculators/InsuranceCalculator";
import CaseStudyComponent from "./CaseStudyComponent";
import DownloadableResources from "./DownloadableResources";

interface CompleteNewTopicsExampleProps {
  lessonId: string;
  courseId: string;
}

export default function CompleteNewTopicsExample({ lessonId, courseId }: CompleteNewTopicsExampleProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Comprehensive lesson covering all new topics
  const newTopicsLesson = {
    id: lessonId,
    title: "Advanced Financial Planning: Modern Investment Strategies",
    description: "Explore cutting-edge investment opportunities including cryptocurrency, international markets, ESG investing, government schemes, and comprehensive insurance planning",
    duration: 60,
    difficulty: "Advanced",
    xpReward: 200,
    courseId,
    
    learningObjectives: [
      "Understand cryptocurrency investment strategies and risks",
      "Learn to maximize government-backed investment schemes",
      "Explore international investment opportunities",
      "Master ESG and sustainable investing principles",
      "Plan comprehensive insurance coverage",
      "Integrate all strategies into a unified financial plan"
    ],

    // Content covering all new topics
    content: {
      type: 'interactive',
      html: `
        <h2>Welcome to Advanced Financial Planning</h2>
        <p>This comprehensive lesson covers the latest and most important topics in modern financial planning. You'll learn about emerging investment opportunities, government schemes, international markets, sustainable investing, and complete insurance planning.</p>
        
        <h3>What You'll Master:</h3>
        <ul>
          <li><strong>Cryptocurrency & Digital Assets:</strong> Navigate the emerging world of digital currencies safely</li>
          <li><strong>Government Schemes:</strong> Maximize benefits from PPF, EPF, NPS, SSY and other schemes</li>
          <li><strong>International Investing:</strong> Expand your portfolio globally with currency risk management</li>
          <li><strong>ESG Investing:</strong> Align investments with values while generating returns</li>
          <li><strong>Insurance Planning:</strong> Complete protection for life, health, and property</li>
          <li><strong>Advanced Tax Strategies:</strong> Tax-loss harvesting and optimization techniques</li>
        </ul>

        <div class="highlight-box">
          <h4>🎯 Complete Financial Ecosystem</h4>
          <p>By the end of this lesson, you'll have a comprehensive understanding of all modern investment and protection strategies to build a complete financial plan for the future.</p>
        </div>
      `,
      
      interactiveElements: [
        {
          type: 'calculator',
          title: 'Cryptocurrency Investment Calculator',
          description: 'Plan cryptocurrency investments with DCA strategies',
          calculatorType: 'crypto'
        },
        {
          type: 'calculator',
          title: 'Government Schemes Optimizer',
          description: 'Maximize returns from PPF, EPF, NPS, SSY',
          calculatorType: 'government-schemes'
        },
        {
          type: 'calculator',
          title: 'International Investment Analyzer',
          description: 'Explore global markets with currency risk analysis',
          calculatorType: 'international'
        },
        {
          type: 'calculator',
          title: 'ESG Impact Calculator',
          description: 'Measure financial and environmental impact',
          calculatorType: 'esg'
        },
        {
          type: 'calculator',
          title: 'Comprehensive Insurance Planner',
          description: 'Calculate optimal life, health, and property coverage',
          calculatorType: 'insurance'
        }
      ],

      // Case study covering multiple topics
      caseStudyId: 'complete-financial-transformation',
      
      // Comprehensive resources for all topics
      resources: [
        {
          id: 'crypto-guide',
          title: 'Cryptocurrency Investment Guide',
          description: 'Complete guide to safe cryptocurrency investing',
          type: 'pdf',
          url: '/courses/downloads/crypto-guide.pdf',
          size: '2.8 MB',
          category: 'Investment',
          downloadCount: 850,
          rating: 4.6
        },
        {
          id: 'government-schemes-handbook',
          title: 'Government Schemes Handbook',
          description: 'Complete reference for all government-backed schemes',
          type: 'pdf',
          url: '/courses/downloads/government-schemes-handbook.pdf',
          size: '3.5 MB',
          category: 'Investment',
          downloadCount: 1200,
          rating: 4.8
        },
        {
          id: 'international-investing-guide',
          title: 'International Investing Guide',
          description: 'Strategies for global portfolio diversification',
          type: 'pdf',
          url: '/courses/downloads/international-guide.pdf',
          size: '2.2 MB',
          category: 'Investment',
          downloadCount: 650,
          rating: 4.5
        },
        {
          id: 'esg-investing-toolkit',
          title: 'ESG Investing Toolkit',
          description: 'Tools and templates for sustainable investing',
          type: 'excel',
          url: '/courses/downloads/esg-toolkit.xlsx',
          size: '180 KB',
          category: 'Investment',
          downloadCount: 420,
          rating: 4.7
        },
        {
          id: 'insurance-planning-template',
          title: 'Complete Insurance Planning Template',
          description: 'Comprehensive insurance planning spreadsheet',
          type: 'excel',
          url: '/courses/downloads/insurance-template.xlsx',
          size: '145 KB',
          category: 'Protection',
          downloadCount: 780,
          rating: 4.6
        },
        {
          id: 'tax-strategies-guide',
          title: 'Advanced Tax Planning Strategies',
          description: 'Tax-loss harvesting and optimization techniques',
          type: 'pdf',
          url: '/courses/downloads/tax-strategies.pdf',
          size: '1.9 MB',
          category: 'Tax',
          downloadCount: 590,
          rating: 4.4
        }
      ],

      // Quiz covering all topics
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
          question: "Which government scheme offers EEE (Exempt-Exempt-Exempt) treatment?",
          options: [
            "EPF",
            "PPF and SSY",
            "NPS",
            "ELSS"
          ],
          correct_answer: 1,
          explanation: "PPF and Sukanya Samriddhi Yojana (SSY) offer EEE treatment where contributions, returns, and maturity are all tax-exempt."
        },
        {
          id: 3,
          question: "What does ESG stand for in sustainable investing?",
          options: [
            "Economic, Social, Governance",
            "Environmental, Social, Governance",
            "Equity, Security, Growth",
            "Energy, Sustainability, Growth"
          ],
          correct_answer: 1,
          explanation: "ESG stands for Environmental, Social, and Governance - the three key factors in measuring sustainability and ethical impact of investments."
        },
        {
          id: 4,
          question: "What is the recommended life insurance coverage ratio?",
          options: [
            "5-8 times annual income",
            "10-15 times annual income",
            "20-25 times annual income",
            "Life insurance is not necessary"
          ],
          correct_answer: 1,
          explanation: "Financial advisors typically recommend life insurance coverage of 10-15 times annual income to provide adequate family protection."
        }
      ]
    },

    nextLesson: {
      id: 'integrated-financial-plan',
      title: 'Creating Your Integrated Financial Plan',
      url: '/learn/lesson/integrated-financial-plan'
    },

    previousLesson: {
      id: 'advanced-portfolio-management',
      title: 'Advanced Portfolio Management',
      url: '/learn/lesson/advanced-portfolio-management'
    }
  };

  const handleQuizComplete = (score: number, answers: Record<string, number>) => {
    console.log('Advanced topics quiz completed:', { score, answers });
    // In real app, save progress and award bonus XP for advanced topics
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                {newTopicsLesson.difficulty}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {newTopicsLesson.duration} min
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                +{newTopicsLesson.xpReward} XP
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Advanced Topics
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{newTopicsLesson.title}</h1>
            <p className="text-gray-700 text-lg mb-6">{newTopicsLesson.description}</p>
            
            {/* Learning Objectives */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                Advanced Learning Objectives
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newTopicsLesson.learningObjectives.map((objective, index) => (
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
                <div className="text-2xl font-bold text-indigo-600 mb-1">6</div>
                <div className="text-sm text-gray-600">New Topics</div>
                <div className="text-xs text-gray-500 mt-1">Advanced Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col items-center space-y-1 py-3">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex flex-col items-center space-y-1 py-3">
            <Bitcoin className="h-4 w-4" />
            <span className="text-xs">Crypto</span>
          </TabsTrigger>
          <TabsTrigger value="government" className="flex flex-col items-center space-y-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Gov Schemes</span>
          </TabsTrigger>
          <TabsTrigger value="international" className="flex flex-col items-center space-y-1 py-3">
            <Globe className="h-4 w-4" />
            <span className="text-xs">International</span>
          </TabsTrigger>
          <TabsTrigger value="esg" className="flex flex-col items-center space-y-1 py-3">
            <Leaf className="h-4 w-4" />
            <span className="text-xs">ESG</span>
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex flex-col items-center space-y-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Insurance</span>
          </TabsTrigger>
          <TabsTrigger value="case-study" className="flex flex-col items-center space-y-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">Case Study</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">Complete Financial Planning Overview</h3>
                  <p className="text-sm text-indigo-700">Master all modern investment and protection strategies</p>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: newTopicsLesson.content.html }} />
              </div>
            </CardContent>
          </Card>

          {/* Topic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-orange-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('crypto')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bitcoin className="h-8 w-8 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Cryptocurrency</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Navigate digital assets safely with proper risk management</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>
                  <ArrowRight className="h-4 w-4 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('government')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Government Schemes</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Maximize benefits from PPF, EPF, NPS, SSY</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('international')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">International Investing</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Expand globally with currency risk management</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">Medium Risk</Badge>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('esg')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <h4 className="font-semibold text-gray-900">ESG Investing</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Align investments with values for sustainable returns</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Medium Risk</Badge>
                  <ArrowRight className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-purple-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('insurance')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Insurance Planning</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Complete protection for life, health, and property</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800">Essential</Badge>
                  <ArrowRight className="h-4 w-4 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-indigo-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('case-study')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">Case Study</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Real-world transformation story covering all topics</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-100 text-indigo-800">Interactive</Badge>
                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cryptocurrency Tab */}
        <TabsContent value="crypto" className="space-y-6">
          <CryptocurrencyCalculator
            title="Cryptocurrency Investment Planner"
            description="Plan cryptocurrency investments with risk analysis and DCA strategies"
            initialValues={{
              investmentAmount: 100000,
              bitcoinPrice: 4500000,
              ethereumPrice: 300000,
              monthlyInvestment: 5000,
              years: 5
            }}
            showAdvanced={true}
          />
        </TabsContent>

        {/* Government Schemes Tab */}
        <TabsContent value="government" className="space-y-6">
          <GovernmentSchemesCalculator
            title="Government Schemes Optimizer"
            description="Maximize returns from PPF, EPF, NPS, SSY and other government-backed schemes"
            initialValues={{
              ppfAmount: 150000,
              ppfYears: 15,
              epfContribution: 25000,
              npsContribution: 10000,
              ssyAmount: 125000,
              ssyYears: 21
            }}
            showAllSchemes={true}
          />
        </TabsContent>

        {/* International Investing Tab */}
        <TabsContent value="international" className="space-y-6">
          <InternationalInvestmentCalculator
            title="International Investment Analyzer"
            description="Explore global markets with currency risk analysis and portfolio optimization"
            initialValues={{
              investmentAmount: 500000,
              usdInrRate: 83,
              annualReturn: 12,
              investmentPeriod: 10,
              currencyRisk: 5
            }}
            showCurrencyRisk={true}
          />
        </TabsContent>

        {/* ESG Investing Tab */}
        <TabsContent value="esg" className="space-y-6">
          <ESGCalculator
            title="ESG Investment Impact Calculator"
            description="Measure financial returns and environmental/social impact of sustainable investments"
            initialValues={{
              investmentAmount: 500000,
              esgReturn: 10.5,
              conventionalReturn: 11.2,
              carbonFootprint: 100,
              impactScore: 75
            }}
            showImpactMetrics={true}
          />
        </TabsContent>

        {/* Insurance Planning Tab */}
        <TabsContent value="insurance" className="space-y-6">
          <InsuranceCalculator
            title="Comprehensive Insurance Calculator"
            description="Calculate optimal coverage for life, health, property, and critical illness insurance"
            initialValues={{
              age: 35,
              income: 1200000,
              dependents: 2,
              liabilities: 5000000,
              lifestyle: 75000,
              healthScore: 80
            }}
            showAllTypes={true}
          />
        </TabsContent>

        {/* Case Study Tab */}
        <TabsContent value="case-study" className="space-y-6">
          <CaseStudyComponent
            caseStudyId="complete-financial-transformation"
            title="Complete Financial Transformation Journey"
            description="Follow Priya's journey from basic investing to advanced financial planning across all modern strategies"
          />
        </TabsContent>
      </Tabs>

      {/* Resources Section */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <DownloadableResources
            lessonId={lessonId}
            resources={newTopicsLesson.resources}
            title="Advanced Financial Planning Resource Kit"
            description="Comprehensive guides, templates, and tools for modern financial planning"
            showCategories={true}
            maxResources={6}
          />
        </CardContent>
      </Card>

      {/* Enhanced Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <div>
          {newTopicsLesson.previousLesson && (
            <a
              href={newTopicsLesson.previousLesson.url}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <div>
                <div className="text-sm text-gray-600">Previous Lesson</div>
                <div className="font-medium">{newTopicsLesson.previousLesson.title}</div>
              </div>
            </a>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Advanced Topics Progress</div>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full w-1/3"></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">33% Complete</div>
        </div>
        
        <div>
          {newTopicsLesson.nextLesson && (
            <a
              href={newTopicsLesson.nextLesson.url}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm text-gray-600">Next Lesson</div>
                <div className="font-medium">{newTopicsLesson.nextLesson.title}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}