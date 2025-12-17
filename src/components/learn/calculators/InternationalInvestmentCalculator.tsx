"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  Globe,
  DollarSign,
  Download,
  AlertTriangle,
  BarChart3
} from "lucide-react";

interface InternationalInvestmentCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    investmentAmount?: number;
    usdInrRate?: number;
    annualReturn?: number;
    investmentPeriod?: number;
    currencyRisk?: number;
  };
  showCurrencyRisk?: boolean;
}

export default function InternationalInvestmentCalculator({ 
  title = "International Investment Calculator",
  description = "Calculate returns from international investments including currency risk analysis",
  initialValues = {
    investmentAmount: 500000,
    usdInrRate: 83,
    annualReturn: 12,
    investmentPeriod: 10,
    currencyRisk: 5
  },
  showCurrencyRisk = true
}: InternationalInvestmentCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(initialValues.investmentAmount || 500000);
  const [usdInrRate, setUsdInrRate] = useState(initialValues.usdInrRate || 83);
  const [annualReturn, setAnnualReturn] = useState(initialValues.annualReturn || 12);
  const [investmentPeriod, setInvestmentPeriod] = useState(initialValues.investmentPeriod || 10);
  const [currencyRisk, setCurrencyRisk] = useState(initialValues.currencyRisk || 5);
  const [selectedMarket, setSelectedMarket] = useState<'us' | 'eu' | 'emerging'>('us');
  
  const [results, setResults] = useState({
    baseCase: {
      usdValue: 0,
      inrValue: 0,
      totalReturn: 0
    },
    currencyRisk: {
      bestCase: 0,
      worstCase: 0,
      riskAdjusted: 0
    },
    comparison: {
      indianEquity: 0,
      international: 0,
      blended: 0
    }
  });

  useEffect(() => {
    calculateInternationalReturns();
  }, [investmentAmount, usdInrRate, annualReturn, investmentPeriod, currencyRisk, selectedMarket]);

  const calculateInternationalReturns = () => {
    // Convert INR to USD
    const usdAmount = investmentAmount / usdInrRate;
    
    // Calculate returns in USD
    const futureUsdValue = usdAmount * Math.pow(1 + annualReturn / 100, investmentPeriod);
    
    // Base case: No currency change
    const baseInrValue = futureUsdValue * usdInrRate;
    const baseTotalReturn = ((baseInrValue - investmentAmount) / investmentAmount) * 100;
    
    // Currency risk scenarios
    const bestCaseRate = usdInrRate * (1 - currencyRisk / 100); // INR depreciates
    const worstCaseRate = usdInrRate * (1 + currencyRisk / 100); // INR appreciates
    
    const bestCaseInr = futureUsdValue * bestCaseRate;
    const worstCaseInr = futureUsdValue * worstCaseRate;
    const riskAdjustedReturn = ((baseInrValue - investmentAmount) / investmentAmount) * 100 - (currencyRisk / 2);
    
    // Comparison with Indian markets (assuming 10% for Nifty)
    const indianEquityReturn = 10;
    const indianEquityValue = investmentAmount * Math.pow(1 + indianEquityReturn / 100, investmentPeriod);
    
    // Blended portfolio (50% Indian, 50% International)
    const blendedReturn = (indianEquityReturn + annualReturn) / 2;
    const blendedValue = investmentAmount * Math.pow(1 + blendedReturn / 100, investmentPeriod);
    
    setResults({
      baseCase: {
        usdValue: Math.round(futureUsdValue),
        inrValue: Math.round(baseInrValue),
        totalReturn: Math.round(baseTotalReturn)
      },
      currencyRisk: {
        bestCase: Math.round(((bestCaseInr - investmentAmount) / investmentAmount) * 100),
        worstCase: Math.round(((worstCaseInr - investmentAmount) / investmentAmount) * 100),
        riskAdjusted: Math.round(riskAdjustedReturn)
      },
      comparison: {
        indianEquity: Math.round(indianEquityValue),
        international: Math.round(baseInrValue),
        blended: Math.round(blendedValue)
      }
    });
  };

  const formatCurrency = (amount: number, currency: 'INR' | 'USD' = 'INR') => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const getMarketData = () => {
    const markets = {
      us: {
        name: 'US Markets',
        avgReturn: 10,
        volatility: 18,
        topETFs: ['SPY', 'VTI', 'QQQ']
      },
      eu: {
        name: 'European Markets',
        avgReturn: 8,
        volatility: 15,
        topETFs: ['VGK', 'EZU', 'IEV']
      },
      emerging: {
        name: 'Emerging Markets',
        avgReturn: 12,
        volatility: 25,
        topETFs: ['VWO', 'EEM', 'IEMG']
      }
    };
    return markets[selectedMarket];
  };

  const marketData = getMarketData();

  const handleDownload = () => {
    const csvContent = [
      ['Scenario', 'Investment (₹)', 'Final Value (₹)', 'Return (%)'],
      ['Base Case (No Currency Risk)', investmentAmount, results.baseCase.inrValue, results.baseCase.totalReturn],
      ['Best Case (Currency Beneficial)', investmentAmount, results.baseCase.inrValue * 1.1, results.currencyRisk.bestCase],
      ['Worst Case (Currency Adverse)', investmentAmount, results.baseCase.inrValue * 0.9, results.currencyRisk.worstCase],
      ['Indian Equity Comparison', investmentAmount, results.comparison.indianEquity, ((results.comparison.indianEquity - investmentAmount) / investmentAmount * 100).toFixed(1)],
      ['Blended Portfolio', investmentAmount, results.comparison.blended, ((results.comparison.blended - investmentAmount) / investmentAmount * 100).toFixed(1)]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `international-investment-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
            <p className="text-sm text-blue-700">{description}</p>
          </div>
        </div>

        <Tabs value={selectedMarket} onValueChange={(value) => setSelectedMarket(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="us">US Markets</TabsTrigger>
            <TabsTrigger value="eu">European Markets</TabsTrigger>
            <TabsTrigger value="emerging">Emerging Markets</TabsTrigger>
          </TabsList>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 mt-6">
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
              <Label htmlFor="usd-rate" className="text-sm font-medium text-gray-700">
                USD/INR Rate
              </Label>
              <Input
                id="usd-rate"
                type="number"
                value={usdInrRate}
                onChange={(e) => setUsdInrRate(Number(e.target.value))}
                className="mt-1"
                min="70"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <Label htmlFor="annual-return" className="text-sm font-medium text-gray-700">
                Expected Annual Return (%)
              </Label>
              <Input
                id="annual-return"
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="mt-1"
                min="5"
                max="25"
                step="0.5"
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

            {showCurrencyRisk && (
              <div>
                <Label htmlFor="currency-risk" className="text-sm font-medium text-gray-700">
                  Currency Risk (%)
                </Label>
                <Input
                  id="currency-risk"
                  type="number"
                  value={currencyRisk}
                  onChange={(e) => setCurrencyRisk(Number(e.target.value))}
                  className="mt-1"
                  min="0"
                  max="20"
                  step="1"
                />
              </div>
            )}
          </div>

          <TabsContent value={selectedMarket} className="space-y-6">
            {/* Market Overview */}
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                {marketData.name} Overview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Average Return</p>
                  <p className="text-xl font-bold text-green-600">{marketData.avgReturn}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Volatility</p>
                  <p className="text-xl font-bold text-orange-600">{marketData.volatility}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Top ETFs</p>
                  <p className="text-sm text-gray-700">{marketData.topETFs.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Base Case Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">USD Value</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(results.baseCase.usdValue, 'USD')}
                </p>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">INR Value</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.baseCase.inrValue)}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${
                results.baseCase.totalReturn > 0 ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">Total Return</p>
                </div>
                <p className={`text-2xl font-bold ${
                  results.baseCase.totalReturn > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.baseCase.totalReturn}%
                </p>
              </div>
            </div>

            {/* Currency Risk Analysis */}
            {showCurrencyRisk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Currency Risk Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Best Case (INR Weakens)</p>
                    <p className="text-lg font-bold text-green-600">+{results.currencyRisk.bestCase}%</p>
                  </div>
                  <div className="bg-white border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Risk Adjusted Return</p>
                    <p className="text-lg font-bold text-blue-600">{results.currencyRisk.riskAdjusted}%</p>
                  </div>
                  <div className="bg-white border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Worst Case (INR Strengthens)</p>
                    <p className="text-lg font-bold text-red-600">{results.currencyRisk.worstCase}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Market Comparison */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Investment Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Indian Equity (Nifty)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(results.comparison.indianEquity)}
                  </p>
                  <p className="text-xs text-gray-500">10% annual return</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">{marketData.name}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(results.comparison.international)}
                  </p>
                  <p className="text-xs text-gray-500">{annualReturn}% annual return</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Blended Portfolio</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(results.comparison.blended)}
                  </p>
                  <p className="text-xs text-gray-500">50% Indian, 50% International</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Investment Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 International Investing Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start with established markets like US and Europe</li>
            <li>• Consider currency hedging for large investments</li>
            <li>• Use international mutual funds for easier access</li>
            <li>• Maintain 10-20% international exposure in portfolio</li>
            <li>• Monitor USD/INR movements for timing entry/exit</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}