"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  TrendingUp, 
  PieChart,
  Download,
  BarChart3
} from "lucide-react";

interface CompoundInterestCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    principal?: number;
    rate?: number;
    time?: number;
    frequency?: 'monthly' | 'quarterly' | 'annually';
  };
  showDetailed?: boolean;
  showChart?: boolean;
}

export default function CompoundInterestCalculator({ 
  title = "Compound Interest Calculator",
  description = "See how your money grows with compound interest over time",
  initialValues = {
    principal: 100000,
    rate: 8,
    time: 10,
    frequency: 'annually'
  },
  showDetailed = true,
  showChart = true
}: CompoundInterestCalculatorProps) {
  const [principal, setPrincipal] = useState(initialValues.principal || 100000);
  const [rate, setRate] = useState(initialValues.rate || 8);
  const [time, setTime] = useState(initialValues.time || 10);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annually'>(
    initialValues.frequency || 'annually'
  );
  
  const [results, setResults] = useState({
    finalAmount: 0,
    totalInterest: 0,
    yearlyBreakdown: [] as Array<{
      year: number;
      principal: number;
      interest: number;
      total: number;
      growth: number;
    }>
  });

  useEffect(() => {
    calculateCompoundInterest();
  }, [principal, rate, time, frequency]);

  const calculateCompoundInterest = () => {
    const freqMap = {
      monthly: 12,
      quarterly: 4,
      annually: 1
    };

    const n = freqMap[frequency];
    const r = rate / 100;
    const t = time;

    // A = P(1 + r/n)^(nt)
    const finalAmount = principal * Math.pow(1 + r / n, n * t);
    const totalInterest = finalAmount - principal;

    // Calculate yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= t; year++) {
      const amount = principal * Math.pow(1 + r / n, n * year);
      const interest = amount - principal;
      const prevAmount = year === 1 ? principal : principal * Math.pow(1 + r / n, n * (year - 1));
      const growth = amount - prevAmount;

      yearlyBreakdown.push({
        year,
        principal: Math.round(principal),
        interest: Math.round(interest),
        total: Math.round(amount),
        growth: Math.round(growth)
      });
    }

    setResults({
      finalAmount: Math.round(finalAmount),
      totalInterest: Math.round(totalInterest),
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

  const getEffectiveRate = () => {
    const freqMap = {
      monthly: 12,
      quarterly: 4,
      annually: 1
    };
    const n = freqMap[frequency];
    const r = rate / 100;
    return ((Math.pow(1 + r / n, n) - 1) * 100);
  };

  const handleDownload = () => {
    const csvContent = [
      ['Year', 'Principal', 'Interest Earned', 'Total Amount', 'Growth This Year'],
      ...results.yearlyBreakdown.map(row => [
        row.year,
        row.principal,
        row.interest,
        row.total,
        row.growth
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compound-interest-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-purple-200 bg-purple-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">{title}</h3>
            <p className="text-sm text-purple-700">{description}</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="principal" className="text-sm font-medium text-gray-700">
              Principal Amount (₹)
            </Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="mt-1"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <Label htmlFor="rate" className="text-sm font-medium text-gray-700">
              Annual Interest Rate (%)
            </Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-1"
              min="1"
              max="30"
              step="0.1"
            />
          </div>

          <div>
            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
              Time Period (Years)
            </Label>
            <Input
              id="time"
              type="number"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="mt-1"
              min="1"
              max="50"
            />
          </div>

          <div>
            <Label htmlFor="frequency" className="text-sm font-medium text-gray-700">
              Compounding Frequency
            </Label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm text-gray-600">Final Amount</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(results.finalAmount)}
            </p>
          </div>

          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-600">Total Interest</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(results.totalInterest)}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4" />
              <p className="text-sm opacity-90">Growth Multiplier</p>
            </div>
            <p className="text-2xl font-bold">
              {(results.finalAmount / principal).toFixed(2)}x
            </p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-2">💡 Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-800">
                <strong>Effective Annual Rate:</strong> 
                <span className="font-bold"> {getEffectiveRate().toFixed(2)}%</span>
              </p>
            </div>
            <div>
              <p className="text-purple-800">
                <strong>Interest vs Principal:</strong> 
                <span className="font-bold"> {((results.totalInterest / principal) * 100).toFixed(1)}%</span> return
              </p>
            </div>
          </div>
        </div>

        {/* Yearly Breakdown */}
        {showChart && results.yearlyBreakdown.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Growth Breakdown</h4>
              <Button 
                onClick={handleDownload}
                size="sm" 
                variant="outline"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
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
                    <th className="px-3 py-2 text-right font-medium">Principal</th>
                    <th className="px-3 py-2 text-right font-medium">Interest</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                    <th className="px-3 py-2 text-right font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {results.yearlyBreakdown.map((year) => (
                    <tr key={year.year} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{year.year}</td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {formatCurrency(year.principal)}
                      </td>
                      <td className="px-3 py-2 text-right text-blue-600">
                        {formatCurrency(year.interest)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-purple-600">
                        {formatCurrency(year.total)}
                      </td>
                      <td className="px-3 py-2 text-right text-green-600">
                        +{formatCurrency(year.growth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Power of Compounding Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">🚀 Power of Compounding</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Higher compounding frequency = More returns</li>
            <li>• Time is your biggest advantage - start early!</li>
            <li>• Even small amounts grow significantly over long periods</li>
            <li>• Reinvest returns to accelerate growth</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}