"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  Target, 
  TrendingUp,
  Download,
  Calendar,
  Home,
  Car,
  GraduationCap
} from "lucide-react";

interface RetirementCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    currentAge?: number;
    retirementAge?: number;
    currentSavings?: number;
    monthlyContribution?: number;
    expectedReturn?: number;
    inflationRate?: number;
    monthlyExpenses?: number;
  };
  showDetailed?: boolean;
}

export default function RetirementCalculator({ 
  title = "Retirement Planning Calculator",
  description = "Plan your retirement savings and calculate how much you'll need",
  initialValues = {
    currentAge: 30,
    retirementAge: 60,
    currentSavings: 500000,
    monthlyContribution: 15000,
    expectedReturn: 10,
    inflationRate: 5,
    monthlyExpenses: 50000
  },
  showDetailed = true
}: RetirementCalculatorProps) {
  const [currentAge, setCurrentAge] = useState(initialValues.currentAge || 30);
  const [retirementAge, setRetirementAge] = useState(initialValues.retirementAge || 60);
  const [currentSavings, setCurrentSavings] = useState(initialValues.currentSavings || 500000);
  const [monthlyContribution, setMonthlyContribution] = useState(initialValues.monthlyContribution || 15000);
  const [expectedReturn, setExpectedReturn] = useState(initialValues.expectedReturn || 10);
  const [inflationRate, setInflationRate] = useState(initialValues.inflationRate || 5);
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialValues.monthlyExpenses || 50000);
  
  const [results, setResults] = useState({
    yearsToRetirement: 0,
    totalContributions: 0,
    corpusAtRetirement: 0,
    requiredCorpus: 0,
    shortFall: 0,
    neededMonthlyContribution: 0,
    yearlyProjection: [] as Array<{
      year: number;
      age: number;
      savings: number;
      contributions: number;
      total: number;
    }>
  });

  useEffect(() => {
    calculateRetirement();
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, inflationRate, monthlyExpenses]);

  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const monthlyRate = expectedReturn / 100 / 12;
    const inflationMonthlyRate = inflationRate / 100 / 12;
    
    // Calculate corpus at retirement with current savings and monthly contributions
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement);
    
    // Future value of monthly contributions (SIP)
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, yearsToRetirement * 12) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const corpusAtRetirement = futureValueCurrent + futureValueContributions;
    const totalContributions = monthlyContribution * yearsToRetirement * 12;
    
    // Calculate required corpus (assuming 25x annual expenses rule with inflation adjustment)
    const realMonthlyExpenses = monthlyExpenses;
    const annualExpensesAtRetirement = realMonthlyExpenses * 12 * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const requiredCorpus = annualExpensesAtRetirement * 25; // 25x rule
    
    const shortFall = Math.max(0, requiredCorpus - corpusAtRetirement);
    
    // Calculate required monthly contribution to meet the goal
    let neededMonthlyContribution = monthlyContribution;
    if (shortFall > 0) {
      const remainingCorpus = shortFall;
      const futureValueNeeded = remainingCorpus;
      if (monthlyRate > 0) {
        neededMonthlyContribution = (futureValueNeeded * monthlyRate) / 
          ((Math.pow(1 + monthlyRate, yearsToRetirement * 12) - 1) * (1 + monthlyRate));
      }
    }
    
    // Calculate yearly projection
    const yearlyProjection = [];
    for (let year = 0; year <= yearsToRetirement; year += 5) {
      const age = currentAge + year;
      const yearsElapsed = year;
      
      const savingsAtYear = currentSavings * Math.pow(1 + expectedReturn / 100, yearsElapsed);
      const contributionsAtYear = monthlyContribution * yearsElapsed * 12 * 
        Math.pow(1 + expectedReturn / 100, 0); // Simplified for projection
      const totalAtYear = savingsAtYear + contributionsAtYear;
      
      yearlyProjection.push({
        year,
        age,
        savings: Math.round(savingsAtYear),
        contributions: Math.round(contributionsAtYear),
        total: Math.round(totalAtYear)
      });
    }

    setResults({
      yearsToRetirement,
      totalContributions: Math.round(totalContributions),
      corpusAtRetirement: Math.round(corpusAtRetirement),
      requiredCorpus: Math.round(requiredCorpus),
      shortFall: Math.round(shortFall),
      neededMonthlyContribution: Math.round(neededMonthlyContribution),
      yearlyProjection
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownload = () => {
    const csvContent = [
      ['Year', 'Age', 'Current Savings', 'Contributions', 'Total Corpus'],
      ...results.yearlyProjection.map(row => [
        row.year,
        row.age,
        row.savings,
        row.contributions,
        row.total
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retirement-plan-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-green-200 bg-green-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">{title}</h3>
            <p className="text-sm text-green-700">{description}</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="current-age" className="text-sm font-medium text-gray-700">
              Current Age
            </Label>
            <Input
              id="current-age"
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="mt-1"
              min="18"
              max="70"
            />
          </div>

          <div>
            <Label htmlFor="retirement-age" className="text-sm font-medium text-gray-700">
              Retirement Age
            </Label>
            <Input
              id="retirement-age"
              type="number"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
              className="mt-1"
              min="50"
              max="80"
            />
          </div>

          <div>
            <Label htmlFor="current-savings" className="text-sm font-medium text-gray-700">
              Current Savings (₹)
            </Label>
            <Input
              id="current-savings"
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="mt-1"
              min="0"
              step="10000"
            />
          </div>

          <div>
            <Label htmlFor="monthly-contribution" className="text-sm font-medium text-gray-700">
              Monthly Contribution (₹)
            </Label>
            <Input
              id="monthly-contribution"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="mt-1"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <Label htmlFor="expected-return" className="text-sm font-medium text-gray-700">
              Expected Return (% p.a.)
            </Label>
            <Input
              id="expected-return"
              type="number"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="mt-1"
              min="5"
              max="20"
              step="0.5"
            />
          </div>

          <div>
            <Label htmlFor="inflation-rate" className="text-sm font-medium text-gray-700">
              Inflation Rate (% p.a.)
            </Label>
            <Input
              id="inflation-rate"
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="mt-1"
              min="2"
              max="10"
              step="0.5"
            />
          </div>

          <div>
            <Label htmlFor="monthly-expenses" className="text-sm font-medium text-gray-700">
              Current Monthly Expenses (₹)
            </Label>
            <Input
              id="monthly-expenses"
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="mt-1"
              min="10000"
              step="5000"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-600">Corpus at Retirement</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(results.corpusAtRetirement)}
            </p>
          </div>

          <div className="bg-white border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-gray-600">Required Corpus</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(results.requiredCorpus)}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${
            results.shortFall > 0 
              ? 'bg-red-100 border border-red-200' 
              : 'bg-green-100 border border-green-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-gray-600">Status</p>
            </div>
            <p className={`text-xl font-bold ${
              results.shortFall > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {results.shortFall > 0 ? 'Need More' : 'On Track!'}
            </p>
          </div>
        </div>

        {/* Shortfall Analysis */}
        {results.shortFall > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Shortfall Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-red-800">
                  <strong>Shortfall Amount:</strong> {formatCurrency(results.shortFall)}
                </p>
              </div>
              <div>
                <p className="text-sm text-red-800">
                  <strong>Needed Monthly Contribution:</strong> {formatCurrency(results.neededMonthlyContribution)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Retirement Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Home className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-700">Housing</p>
            </div>
            <p className="text-lg font-semibold text-blue-900">
              {formatCurrency(results.requiredCorpus * 0.4)}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-purple-700">Lifestyle</p>
            </div>
            <p className="text-lg font-semibold text-purple-900">
              {formatCurrency(results.requiredCorpus * 0.35)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">Legacy</p>
            </div>
            <p className="text-lg font-semibold text-green-900">
              {formatCurrency(results.requiredCorpus * 0.25)}
            </p>
          </div>
        </div>

        {/* Yearly Projection */}
        {showDetailed && results.yearlyProjection.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Retirement Corpus Projection</h4>
              <Button 
                onClick={handleDownload}
                size="sm" 
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Plan
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium">Years</th>
                    <th className="px-3 py-2 text-left font-medium">Age</th>
                    <th className="px-3 py-2 text-right font-medium">Current Savings</th>
                    <th className="px-3 py-2 text-right font-medium">Contributions</th>
                    <th className="px-3 py-2 text-right font-medium">Total Corpus</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyProjection.map((year) => (
                    <tr key={year.year} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{year.year}</td>
                      <td className="px-3 py-2 font-medium">{year.age}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {formatCurrency(year.savings)}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-600">
                        {formatCurrency(year.contributions)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-green-600">
                        {formatCurrency(year.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Retirement Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💰 Retirement Planning Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Start saving early to benefit from compound interest</li>
            <li>• Aim to save 15-20% of your income for retirement</li>
            <li>• Diversify investments across equity, debt, and real estate</li>
            <li>• Plan for inflation and healthcare costs</li>
            <li>• Consider NPS, PPF, and ELSS for tax benefits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}