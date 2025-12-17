"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  TrendingUp, 
  PieChart,
  Download,
  PlayCircle
} from "lucide-react";

interface SIPCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    monthlyAmount?: number;
    annualRate?: number;
    years?: number;
  };
  showDetailed?: boolean;
  showProjection?: boolean;
}

export default function SIPCalculator({ 
  title = "SIP Calculator",
  description = "Calculate how much your Systematic Investment Plan will grow over time",
  initialValues = {
    monthlyAmount: 5000,
    annualRate: 12,
    years: 10
  },
  showDetailed = true,
  showProjection = true
}: SIPCalculatorProps) {
  const [monthlyAmount, setMonthlyAmount] = useState(initialValues.monthlyAmount || 5000);
  const [annualRate, setAnnualRate] = useState(initialValues.annualRate || 12);
  const [years, setYears] = useState(initialValues.years || 10);
  
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    maturityAmount: 0,
    yearlyBreakdown: [] as Array<{
      year: number;
      investment: number;
      returns: number;
      total: number;
    }>
  });

  useEffect(() => {
    calculateSIP();
  }, [monthlyAmount, annualRate, years]);

  const calculateSIP = () => {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    // SIP Formula: P × (((1 + r)^n - 1) / r) × (1 + r)
    // Where P = Monthly amount, r = Monthly rate, n = Total months
    const futureValue = monthlyAmount * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalInvestment = monthlyAmount * months;
    const estimatedReturns = futureValue - totalInvestment;

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= years; year++) {
      const yearMonths = year * 12;
      const yearInvestment = monthlyAmount * yearMonths;
      const yearValue = monthlyAmount * 
        ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate) * 
        (1 + monthlyRate);
      
      yearlyBreakdown.push({
        year,
        investment: Math.round(yearInvestment),
        returns: Math.round(yearValue - yearInvestment),
        total: Math.round(yearValue)
      });
    }

    setResults({
      totalInvestment: Math.round(totalInvestment),
      estimatedReturns: Math.round(estimatedReturns),
      maturityAmount: Math.round(futureValue),
      yearlyBreakdown
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
    // Generate downloadable SIP report
    const csvContent = [
      ['Year', 'Investment', 'Returns', 'Total Value'],
      ...results.yearlyBreakdown.map(row => [
        row.year,
        row.investment,
        row.returns,
        row.total
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sip-calculation-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
            <p className="text-sm text-blue-700">{description}</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="monthly-amount" className="text-sm font-medium text-gray-700">
              Monthly SIP Amount (₹)
            </Label>
            <Input
              id="monthly-amount"
              type="number"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              className="mt-1"
              min="100"
              step="500"
            />
          </div>

          <div>
            <Label htmlFor="annual-rate" className="text-sm font-medium text-gray-700">
              Expected Annual Return (%)
            </Label>
            <Input
              id="annual-rate"
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="mt-1"
              min="1"
              max="30"
              step="0.1"
            />
          </div>

          <div>
            <Label htmlFor="years" className="text-sm font-medium text-gray-700">
              Investment Period (Years)
            </Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-1"
              min="1"
              max="50"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-gray-600">Total Investment</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(results.totalInvestment)}
            </p>
          </div>

          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-gray-600">Estimated Returns</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(results.estimatedReturns)}
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <PlayCircle className="h-4 w-4" />
              <p className="text-sm opacity-90">Maturity Amount</p>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(results.maturityAmount)}
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-800">
                <strong>Wealth Multiplier:</strong> Your money will grow 
                <span className="font-bold"> {(results.maturityAmount / results.totalInvestment).toFixed(1)}x</span>
              </p>
            </div>
            <div>
              <p className="text-blue-800">
                <strong>Monthly Growth:</strong> Your investment grows by approximately 
                <span className="font-bold"> ₹{Math.round(results.estimatedReturns / (years * 12))}</span> every month
              </p>
            </div>
          </div>
        </div>

        {/* Yearly Breakdown */}
        {showProjection && results.yearlyBreakdown.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Yearly Projection</h4>
              <Button 
                onClick={handleDownload}
                size="sm" 
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium">Year</th>
                    <th className="px-3 py-2 text-right font-medium">Investment</th>
                    <th className="px-3 py-2 text-right font-medium">Returns</th>
                    <th className="px-3 py-2 text-right font-medium">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyBreakdown.map((year) => (
                    <tr key={year.year} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{year.year}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {formatCurrency(year.investment)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-600">
                        {formatCurrency(year.returns)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-600">
                        {formatCurrency(year.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investment Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💰 Investment Tips</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Start early to benefit from compound interest</li>
            <li>• Increase SIP amount annually with salary hikes</li>
            <li>• Stay invested for the long term (10+ years)</li>
            <li>• Diversify across equity and debt funds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}