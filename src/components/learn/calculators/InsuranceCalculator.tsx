"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Heart,
  Shield,
  Home,
  Car,
  Download,
  TrendingUp,
  AlertTriangle,
  Users
} from "lucide-react";

interface InsuranceCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    age?: number;
    income?: number;
    dependents?: number;
    liabilities?: number;
    lifestyle?: number;
    healthScore?: number;
  };
  showAllTypes?: boolean;
}

export default function InsuranceCalculator({ 
  title = "Comprehensive Insurance Calculator",
  description = "Calculate optimal insurance coverage for life, health, and property protection",
  initialValues = {
    age: 35,
    income: 1200000,
    dependents: 2,
    liabilities: 5000000,
    lifestyle: 75000,
    healthScore: 80
  },
  showAllTypes = true
}: InsuranceCalculatorProps) {
  const [age, setAge] = useState(initialValues.age || 35);
  const [annualIncome, setAnnualIncome] = useState(initialValues.income || 1200000);
  const [dependents, setDependents] = useState(initialValues.dependents || 2);
  const [liabilities, setLiabilities] = useState(initialValues.liabilities || 5000000);
  const [monthlyLifestyle, setMonthlyLifestyle] = useState(initialValues.lifestyle || 75000);
  const [healthScore, setHealthScore] = useState(initialValues.healthScore || 80);
  const [selectedInsurance, setSelectedInsurance] = useState<'life' | 'health' | 'property' | 'critical'>('life');
  
  const [results, setResults] = useState({
    life: {
      coverage: 0,
      premium: 0,
      term: 0,
      replacementRatio: 0
    },
    health: {
      baseCoverage: 0,
      familyCoverage: 0,
      premium: 0,
      deductible: 0
    },
    property: {
      coverage: 0,
      premium: 0,
      contentsCoverage: 0,
      liability: 0
    },
    critical: {
      coverage: 0,
      premium: 0,
      benefits: 0,
      waitingPeriod: 0
    }
  });

  useEffect(() => {
    calculateInsurance();
  }, [age, annualIncome, dependents, liabilities, monthlyLifestyle, healthScore, selectedInsurance]);

  const calculateInsurance = () => {
    // Life Insurance Calculation
    const humanLifeValue = annualIncome * (60 - age); // Income replacement method
    const dependentsProtection = dependents * monthlyLifestyle * 12 * 20; // 20 years of income
    const liabilityCoverage = liabilities * 1.1; // 10% buffer
    const lifeCoverage = Math.max(humanLifeValue, dependentsProtection, liabilityCoverage);
    const lifeTerm = Math.min(60 - age, 30); // Term until 60 or 30 years
    const lifePremium = (lifeCoverage * 0.004) * (1 + (60 - age - 25) * 0.05); // Age-based premium
    const replacementRatio = (lifeCoverage / (annualIncome * 20)) * 100;

    // Health Insurance Calculation
    const baseHealthCoverage = Math.max(monthlyLifestyle * 12 * 5, 500000); // 5x annual expenses or 5 lakh minimum
    const familyCoverage = baseHealthCoverage * (1 + (dependents * 0.3)); // 30% per dependent
    const ageMultiplier = 1 + (age - 30) * 0.02; // 2% increase per year after 30
    const healthPremium = familyCoverage * 0.06 * ageMultiplier; // 6% of coverage as premium
    const deductible = Math.min(baseHealthCoverage * 0.1, 50000); // 10% or 50k max

    // Property Insurance Calculation
    const propertyCoverage = Math.max(liabilities * 0.5, 2500000); // 50% of liabilities or 25 lakh minimum
    const contentsCoverage = propertyCoverage * 0.2; // 20% for contents
    const propertyLiability = propertyCoverage * 0.5; // 50% for liability
    const propertyPremium = (propertyCoverage * 0.001) + (contentsCoverage * 0.002); // 0.1% for structure, 0.2% for contents

    // Critical Illness Insurance
    const criticalCoverage = Math.max(monthlyLifestyle * 12 * 2, 1000000); // 2 years income or 10 lakh minimum
    const criticalPremium = criticalCoverage * 0.02 * (1 + (60 - age) * 0.01); // 2% + age factor
    const criticalBenefits = criticalCoverage; // Lump sum benefit
    const criticalWaitingPeriod = 90; // Standard 90 days

    setResults({
      life: {
        coverage: Math.round(lifeCoverage),
        premium: Math.round(lifePremium / 12), // Monthly premium
        term: lifeTerm,
        replacementRatio: Math.round(replacementRatio)
      },
      health: {
        baseCoverage: Math.round(baseHealthCoverage),
        familyCoverage: Math.round(familyCoverage),
        premium: Math.round(healthPremium / 12), // Monthly premium
        deductible: Math.round(deductible)
      },
      property: {
        coverage: Math.round(propertyCoverage),
        premium: Math.round(propertyPremium / 12), // Monthly premium
        contentsCoverage: Math.round(contentsCoverage),
        liability: Math.round(propertyLiability)
      },
      critical: {
        coverage: Math.round(criticalCoverage),
        premium: Math.round(criticalPremium / 12), // Monthly premium
        benefits: Math.round(criticalBenefits),
        waitingPeriod: criticalWaitingPeriod
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

  const getInsuranceTypeData = () => {
    const types = {
      life: {
        name: 'Life Insurance',
        icon: Heart,
        color: 'blue',
        description: 'Financial protection for your family in case of your untimely demise'
      },
      health: {
        name: 'Health Insurance',
        icon: Shield,
        color: 'green',
        description: 'Medical coverage for hospitalization and treatment expenses'
      },
      property: {
        name: 'Property Insurance',
        icon: Home,
        color: 'purple',
        description: 'Protection for your home, contents, and liability coverage'
      },
      critical: {
        name: 'Critical Illness',
        icon: AlertTriangle,
        color: 'red',
        description: 'Lump sum payment for specified critical illnesses'
      }
    };
    return types[selectedInsurance];
  };

  const insuranceData = getInsuranceTypeData();
  const InsuranceIcon = insuranceData.icon;

  const handleDownload = () => {
    const csvContent = [
      ['Insurance Type', 'Coverage Amount (₹)', 'Monthly Premium (₹)', 'Term/Duration', 'Key Benefits'],
      ['Life Insurance', results.life.coverage, results.life.premium, `${results.life.term} years`, `${results.life.replacementRatio}% income replacement`],
      ['Health Insurance', results.health.familyCoverage, results.health.premium, 'Annual renewal', `₹${results.health.deductible} deductible`],
      ['Property Insurance', results.property.coverage, results.property.premium, 'Annual renewal', `Contents: ₹${results.property.contentsCoverage}`],
      ['Critical Illness', results.critical.coverage, results.critical.premium, 'Annual/Term', `${results.critical.waitingPeriod} days waiting period`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insurance-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
            <p className="text-sm text-blue-700">{description}</p>
          </div>
        </div>

        <Tabs value={selectedInsurance} onValueChange={(value) => setSelectedInsurance(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="life">Life</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="property">Property</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
          </TabsList>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 mt-6">
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="mt-1"
                min="18"
                max="65"
              />
            </div>

            <div>
              <Label htmlFor="income" className="text-sm font-medium text-gray-700">
                Annual Income (₹)
              </Label>
              <Input
                id="income"
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="mt-1"
                min="300000"
                step="100000"
              />
            </div>

            <div>
              <Label htmlFor="dependents" className="text-sm font-medium text-gray-700">
                Dependents
              </Label>
              <Input
                id="dependents"
                type="number"
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="mt-1"
                min="0"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="liabilities" className="text-sm font-medium text-gray-700">
                Liabilities (₹)
              </Label>
              <Input
                id="liabilities"
                type="number"
                value={liabilities}
                onChange={(e) => setLiabilities(Number(e.target.value))}
                className="mt-1"
                min="0"
                step="100000"
              />
            </div>

            <div>
              <Label htmlFor="lifestyle" className="text-sm font-medium text-gray-700">
                Monthly Lifestyle (₹)
              </Label>
              <Input
                id="lifestyle"
                type="number"
                value={monthlyLifestyle}
                onChange={(e) => setMonthlyLifestyle(Number(e.target.value))}
                className="mt-1"
                min="10000"
                step="5000"
              />
            </div>

            <div>
              <Label htmlFor="health-score" className="text-sm font-medium text-gray-700">
                Health Score (/100)
              </Label>
              <Input
                id="health-score"
                type="number"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="mt-1"
                min="0"
                max="100"
              />
            </div>
          </div>

          <TabsContent value={selectedInsurance} className="space-y-6">
            {/* Insurance Type Overview */}
            <div className={`bg-${insuranceData.color}-50 border border-${insuranceData.color}-200 rounded-lg p-4`}>
              <div className="flex items-center space-x-3 mb-3">
                <InsuranceIcon className={`h-6 w-6 text-${insuranceData.color}-600`} />
                <h4 className={`font-semibold text-${insuranceData.color}-900`}>{insuranceData.name}</h4>
              </div>
              <p className={`text-sm text-${insuranceData.color}-800`}>{insuranceData.description}</p>
            </div>

            {/* Coverage Calculations */}
            {selectedInsurance === 'life' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Coverage Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.life.coverage)}
                  </p>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.life.premium)}
                  </p>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Policy Term</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {results.life.term} years
                  </p>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-gray-600">Replacement Ratio</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {results.life.replacementRatio}%
                  </p>
                </div>
              </div>
            )}

            {selectedInsurance === 'health' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Base Coverage</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.health.baseCoverage)}
                  </p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Family Coverage</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.health.familyCoverage)}
                  </p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.health.premium)}
                  </p>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-gray-600">Deductible</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(results.health.deductible)}
                  </p>
                </div>
              </div>
            )}

            {selectedInsurance === 'property' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Property Coverage</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.property.coverage)}
                  </p>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.property.premium)}
                  </p>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Contents Coverage</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.property.contentsCoverage)}
                  </p>
                </div>

                <div className="bg-white border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-gray-600">Liability Coverage</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(results.property.liability)}
                  </p>
                </div>
              </div>
            )}

            {selectedInsurance === 'critical' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-gray-600">Coverage Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(results.critical.coverage)}
                  </p>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">Monthly Premium</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.critical.premium)}
                  </p>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-600">Lump Sum Benefit</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.critical.benefits)}
                  </p>
                </div>

                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-gray-600">Waiting Period</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {results.critical.waitingPeriod} days
                  </p>
                </div>
              </div>
            )}

            {/* Insurance Tips */}
            <div className={`bg-${insuranceData.color}-50 border border-${insuranceData.color}-200 rounded-lg p-4`}>
              <h4 className={`font-semibold text-${insuranceData.color}-900 mb-2`}>💡 {insuranceData.name} Tips</h4>
              {selectedInsurance === 'life' && (
                <ul className={`text-sm text-${insuranceData.color}-800 space-y-1`}>
                  <li>• Get term life insurance, not whole life for pure protection</li>
                  <li>• Coverage should be 10-15 times your annual income</li>
                  <li>• Consider increasing coverage with salary hikes</li>
                  <li>• Review and update coverage every 5 years</li>
                </ul>
              )}
              {selectedInsurance === 'health' && (
                <ul className={`text-sm text-${insuranceData.color}-800 space-y-1`}>
                  <li>• Get health insurance early to avoid exclusions</li>
                  <li>• Family floater plans are cost-effective</li>
                  <li>• Check network hospitals and claim settlement ratio</li>
                  <li>• Consider top-up plans for additional coverage</li>
                </ul>
              )}
              {selectedInsurance === 'property' && (
                <ul className={`text-sm text-${insuranceData.color}-800 space-y-1`}>
                  <li>• Coverage should match current market value</li>
                  <li>• Include contents and liability coverage</li>
                  <li>• Review coverage annually for inflation</li>
                  <li>• Consider earthquake and flood coverage if in risky areas</li>
                </ul>
              )}
              {selectedInsurance === 'critical' && (
                <ul className={`text-sm text-${insuranceData.color}-800 space-y-1`}>
                  <li>• Provides lump sum on diagnosis of critical illness</li>
                  <li>• Covers major illnesses like cancer, heart attack, stroke</li>
                  <li>• Can be used for treatment or to replace income</li>
                  <li>• Consider as supplement to health insurance</li>
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Total Insurance Cost Summary */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">💰 Total Monthly Insurance Cost</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Life Insurance</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(results.life.premium)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Health Insurance</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(results.health.premium)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Property Insurance</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(results.property.premium)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Critical Illness</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(results.critical.premium)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-lg font-bold text-gray-900">
              Total: {formatCurrency(results.life.premium + results.health.premium + results.property.premium + results.critical.premium)}/month
            </p>
            <p className="text-sm text-gray-600">
              ({((results.life.premium + results.health.premium + results.property.premium + results.critical.premium) / (annualIncome / 12) * 100).toFixed(1)}% of monthly income)
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Insurance Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}