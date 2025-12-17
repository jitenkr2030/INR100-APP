"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Leaf,
  Users,
  Shield,
  Download,
  TrendingUp,
  BarChart3,
  Target
} from "lucide-react";

interface ESGCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    investmentAmount?: number;
    esgReturn?: number;
    conventionalReturn?: number;
    carbonFootprint?: number;
    impactScore?: number;
  };
  showImpactMetrics?: boolean;
}

export default function ESGCalculator({ 
  title = "ESG Investment Impact Calculator",
  description = "Measure the financial and environmental impact of your ESG investments",
  initialValues = {
    investmentAmount: 500000,
    esgReturn: 10.5,
    conventionalReturn: 11.2,
    carbonFootprint: 100,
    impactScore: 75
  },
  showImpactMetrics = true
}: ESGCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(initialValues.investmentAmount || 500000);
  const [esgReturn, setEsgReturn] = useState(initialValues.esgReturn || 10.5);
  const [conventionalReturn, setConventionalReturn] = useState(initialValues.conventionalReturn || 11.2);
  const [carbonFootprint, setCarbonFootprint] = useState(initialValues.carbonFootprint || 100);
  const [impactScore, setImpactScore] = useState(initialValues.impactScore || 75);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [selectedESG, setSelectedESG] = useState<'environmental' | 'social' | 'governance'>('environmental');
  
  const [results, setResults] = useState({
    financial: {
      esgValue: 0,
      conventionalValue: 0,
      performanceGap: 0,
      sustainabilityPremium: 0
    },
    environmental: {
      carbonReduction: 0,
      treesEquivalent: 0,
      cleanEnergyMwh: 0,
      waterSavedLiters: 0
    },
    social: {
      jobsCreated: 0,
      communityBenefit: 0,
      educationImpact: 0,
      healthcareBenefit: 0
    },
    governance: {
      transparencyScore: 0,
      boardDiversity: 0,
      ethicalPractices: 0,
      riskManagement: 0
    }
  });

  useEffect(() => {
    calculateESGImpact();
  }, [investmentAmount, esgReturn, conventionalReturn, carbonFootprint, impactScore, investmentPeriod, selectedESG]);

  const calculateESGImpact = () => {
    // Financial calculations
    const esgFutureValue = investmentAmount * Math.pow(1 + esgReturn / 100, investmentPeriod);
    const conventionalFutureValue = investmentAmount * Math.pow(1 + conventionalReturn / 100, investmentPeriod);
    const performanceGap = ((esgFutureValue - conventionalFutureValue) / conventionalFutureValue) * 100;
    const sustainabilityPremium = ((esgReturn - conventionalReturn) / conventionalReturn) * 100;

    // Environmental impact (based on carbon footprint reduction)
    const carbonReduction = (carbonFootprint * investmentAmount / 100000) * 0.3; // 30% improvement
    const treesEquivalent = carbonReduction * 0.05; // 1 tree absorbs ~20kg CO2/year
    const cleanEnergyMwh = carbonReduction * 0.8; // 1 MWh renewable energy
    const waterSavedLiters = carbonReduction * 1000; // Water savings correlation

    // Social impact (jobs, education, healthcare)
    const jobsCreated = Math.round((investmentAmount / 100000) * 0.5); // Jobs per lakh invested
    const communityBenefit = impactScore * investmentAmount / 1000; // Community impact score
    const educationImpact = Math.round(communityBenefit / 100); // People educated
    const healthcareBenefit = Math.round(communityBenefit / 200); // Healthcare beneficiaries

    // Governance metrics (based on impact score)
    const transparencyScore = impactScore;
    const boardDiversity = Math.min(impactScore * 1.2, 100);
    const ethicalPractices = Math.min(impactScore * 0.9, 100);
    const riskManagement = Math.min(impactScore * 1.1, 100);

    setResults({
      financial: {
        esgValue: Math.round(esgFutureValue),
        conventionalValue: Math.round(conventionalFutureValue),
        performanceGap: Math.round(performanceGap * 100) / 100,
        sustainabilityPremium: Math.round(sustainabilityPremium * 100) / 100
      },
      environmental: {
        carbonReduction: Math.round(carbonReduction),
        treesEquivalent: Math.round(treesEquivalent),
        cleanEnergyMwh: Math.round(cleanEnergyMwh),
        waterSavedLiters: Math.round(waterSavedLiters)
      },
      social: {
        jobsCreated,
        communityBenefit: Math.round(communityBenefit),
        educationImpact,
        healthcareBenefit
      },
      governance: {
        transparencyScore: Math.round(transparencyScore),
        boardDiversity: Math.round(boardDiversity),
        ethicalPractices: Math.round(ethicalPractices),
        riskManagement: Math.round(riskManagement)
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getESGCategoryData = () => {
    const categories = {
      environmental: {
        name: 'Environmental',
        color: 'green',
        icon: Leaf,
        keyMetrics: ['Carbon Reduction', 'Clean Energy', 'Water Conservation'],
        description: 'Focus on climate change, renewable energy, and environmental protection'
      },
      social: {
        name: 'Social',
        color: 'blue',
        icon: Users,
        keyMetrics: ['Job Creation', 'Education Impact', 'Community Benefit'],
        description: 'Emphasis on human rights, community development, and social equity'
      },
      governance: {
        name: 'Governance',
        color: 'purple',
        icon: Shield,
        keyMetrics: ['Transparency', 'Board Diversity', 'Ethical Practices'],
        description: 'Corporate governance, ethical business practices, and stakeholder rights'
      }
    };
    return categories[selectedESG];
  };

  const categoryData = getESGCategoryData();
  const CategoryIcon = categoryData.icon;

  const handleDownload = () => {
    const csvContent = [
      ['Impact Category', 'Metric', 'Value', 'Unit'],
      ['Financial', 'ESG Investment Value', results.financial.esgValue, '₹'],
      ['Financial', 'Conventional Investment Value', results.financial.conventionalValue, '₹'],
      ['Financial', 'Performance Gap', results.financial.performanceGap, '%'],
      ['Environmental', 'Carbon Reduction', results.environmental.carbonReduction, 'tonnes CO2'],
      ['Environmental', 'Trees Equivalent', results.environmental.treesEquivalent, 'trees'],
      ['Environmental', 'Clean Energy Generated', results.environmental.cleanEnergyMwh, 'MWh'],
      ['Social', 'Jobs Created', results.social.jobsCreated, 'jobs'],
      ['Social', 'Community Benefit Score', results.social.communityBenefit, 'points'],
      ['Social', 'Education Impact', results.social.educationImpact, 'people'],
      ['Governance', 'Transparency Score', results.governance.transparencyScore, '/100'],
      ['Governance', 'Board Diversity', results.governance.boardDiversity, '/100'],
      ['Governance', 'Ethical Practices', results.governance.ethicalPractices, '/100']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esg-impact-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-green-200 bg-green-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">{title}</h3>
            <p className="text-sm text-green-700">{description}</p>
          </div>
        </div>

        <Tabs value={selectedESG} onValueChange={(value) => setSelectedESG(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 mt-6">
            <div>
              <Label htmlFor="investment" className="text-sm font-medium text-gray-700">
                Investment Amount (₹)
              </Label>
              <Input
                id="investment"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="mt-1"
                min="10000"
                step="10000"
              />
            </div>

            <div>
              <Label htmlFor="esg-return" className="text-sm font-medium text-gray-700">
                ESG Fund Return (%)
              </Label>
              <Input
                id="esg-return"
                type="number"
                value={esgReturn}
                onChange={(e) => setEsgReturn(Number(e.target.value))}
                className="mt-1"
                min="5"
                max="20"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="conventional-return" className="text-sm font-medium text-gray-700">
                Conventional Return (%)
              </Label>
              <Input
                id="conventional-return"
                type="number"
                value={conventionalReturn}
                onChange={(e) => setConventionalReturn(Number(e.target.value))}
                className="mt-1"
                min="5"
                max="20"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="carbon-footprint" className="text-sm font-medium text-gray-700">
                Carbon Footprint (tonnes)
              </Label>
              <Input
                id="carbon-footprint"
                type="number"
                value={carbonFootprint}
                onChange={(e) => setCarbonFootprint(Number(e.target.value))}
                className="mt-1"
                min="0"
                step="10"
              />
            </div>

            <div>
              <Label htmlFor="impact-score" className="text-sm font-medium text-gray-700">
                Impact Score (/100)
              </Label>
              <Input
                id="impact-score"
                type="number"
                value={impactScore}
                onChange={(e) => setImpactScore(Number(e.target.value))}
                className="mt-1"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div>
              <Label htmlFor="period" className="text-sm font-medium text-gray-700">
                Investment Period (Years)
              </Label>
              <Input
                id="period"
                type="number"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                className="mt-1"
                min="1"
                max="30"
              />
            </div>
          </div>

          <TabsContent value={selectedESG} className="space-y-6">
            {/* Category Overview */}
            <div className={`bg-${categoryData.color}-50 border border-${categoryData.color}-200 rounded-lg p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <CategoryIcon className={`h-6 w-6 text-${categoryData.color}-600`} />
                <h4 className={`font-semibold text-${categoryData.color}-900`}>{categoryData.name} Focus</h4>
              </div>
              <p className={`text-sm text-${categoryData.color}-800 mb-3`}>{categoryData.description}</p>
              <div className="flex flex-wrap gap-2">
                {categoryData.keyMetrics.map((metric, index) => (
                  <span key={index} className={`px-3 py-1 bg-${categoryData.color}-100 text-${categoryData.color}-800 text-xs rounded-full`}>
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            {/* Financial Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">ESG Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.financial.esgValue)}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Conventional Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.financial.conventionalValue)}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${
                results.financial.performanceGap >= 0 ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Performance Gap</p>
                </div>
                <p className={`text-2xl font-bold ${
                  results.financial.performanceGap >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.financial.performanceGap}%
                </p>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Sustainability Premium</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {results.financial.sustainabilityPremium}%
                </p>
              </div>
            </div>

            {/* Impact Metrics */}
            {showImpactMetrics && (
              <div className="space-y-4">
                {selectedESG === 'environmental' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Carbon Reduction</p>
                      <p className="text-xl font-bold text-green-600">
                        {results.environmental.carbonReduction} tonnes CO₂
                      </p>
                    </div>
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Trees Equivalent</p>
                      <p className="text-xl font-bold text-green-600">
                        {results.environmental.treesEquivalent} trees
                      </p>
                    </div>
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Clean Energy</p>
                      <p className="text-xl font-bold text-green-600">
                        {results.environmental.cleanEnergyMwh} MWh
                      </p>
                    </div>
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Water Saved</p>
                      <p className="text-xl font-bold text-green-600">
                        {(results.environmental.waterSavedLiters / 1000).toFixed(0)}K liters
                      </p>
                    </div>
                  </div>
                )}

                {selectedESG === 'social' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Jobs Created</p>
                      <p className="text-xl font-bold text-blue-600">
                        {results.social.jobsCreated} jobs
                      </p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Community Benefit</p>
                      <p className="text-xl font-bold text-blue-600">
                        {results.social.communityBenefit} points
                      </p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Education Impact</p>
                      <p className="text-xl font-bold text-blue-600">
                        {results.social.educationImpact} people
                      </p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Healthcare Benefit</p>
                      <p className="text-xl font-bold text-blue-600">
                        {results.social.healthcareBenefit} people
                      </p>
                    </div>
                  </div>
                )}

                {selectedESG === 'governance' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Transparency</p>
                      <p className="text-xl font-bold text-purple-600">
                        {results.governance.transparencyScore}/100
                      </p>
                    </div>
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Board Diversity</p>
                      <p className="text-xl font-bold text-purple-600">
                        {results.governance.boardDiversity}/100
                      </p>
                    </div>
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Ethical Practices</p>
                      <p className="text-xl font-bold text-purple-600">
                        {results.governance.ethicalPractices}/100
                      </p>
                    </div>
                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Risk Management</p>
                      <p className="text-xl font-bold text-purple-600">
                        {results.governance.riskManagement}/100
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ESG Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-green-900 mb-2">🌱 ESG Investment Benefits</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Long-term risk reduction through sustainable practices</li>
            <li>• Access to growth sectors like clean energy and technology</li>
            <li>• Positive impact on environment and society</li>
            <li>• Alignment with personal values and beliefs</li>
            <li>• Growing institutional support and regulatory backing</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Impact Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}