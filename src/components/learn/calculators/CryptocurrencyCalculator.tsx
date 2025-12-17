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
  PieChart,
  Download,
  Bitcoin,
  Shield,
  AlertTriangle,
  DollarSign
} from "lucide-react";

interface CryptocurrencyCalculatorProps {
  title?: string;
  description?: string;
  initialValues?: {
    investmentAmount?: number;
    bitcoinPrice?: number;
    ethereumPrice?: number;
    monthlyInvestment?: number;
    years?: number;
  };
  showAdvanced?: boolean;
}

export default function CryptocurrencyCalculator({ 
  title = "Cryptocurrency Investment Calculator",
  description = "Plan your cryptocurrency investments with DCA strategies and portfolio analysis",
  initialValues = {
    investmentAmount: 100000,
    bitcoinPrice: 4500000,
    ethereumPrice: 300000,
    monthlyInvestment: 10000,
    years: 5
  },
  showAdvanced = true
}: CryptocurrencyCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(initialValues.investmentAmount || 100000);
  const [bitcoinPrice, setBitcoinPrice] = useState(initialValues.bitcoinPrice || 4500000);
  const [ethereumPrice, setEthereumPrice] = useState(initialValues.ethereumPrice || 300000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(initialValues.monthlyInvestment || 10000);
  const [years, setYears] = useState(initialValues.years || 5);
  const [selectedCrypto, setSelectedCrypto] = useState<'bitcoin' | 'ethereum' | 'portfolio'>('bitcoin');
  
  const [results, setResults] = useState({
    // Bitcoin calculations
    bitcoin: {
      coins: 0,
      futureValue: 0,
      potentialReturn: 0,
      riskScore: 85
    },
    // Ethereum calculations
    ethereum: {
      coins: 0,
      futureValue: 0,
      potentialReturn: 0,
      riskScore: 90
    },
    // Portfolio calculations
    portfolio: {
      totalValue: 0,
      diversifiedReturn: 0,
      riskScore: 75
    }
  });

  useEffect(() => {
    calculateCryptoReturns();
  }, [investmentAmount, bitcoinPrice, ethereumPrice, monthlyInvestment, years, selectedCrypto]);

  const calculateCryptoReturns = () => {
    // Bitcoin calculations (assuming 20% annual growth - highly speculative)
    const bitcoinGrowthRate = 0.20;
    const bitcoinFuturePrice = bitcoinPrice * Math.pow(1 + bitcoinGrowthRate, years);
    const bitcoinCoins = investmentAmount / bitcoinPrice;
    const bitcoinFutureValue = bitcoinCoins * bitcoinFuturePrice;
    const bitcoinReturn = ((bitcoinFutureValue - investmentAmount) / investmentAmount) * 100;

    // Ethereum calculations (assuming 25% annual growth - highly speculative)
    const ethereumGrowthRate = 0.25;
    const ethereumFuturePrice = ethereumPrice * Math.pow(1 + ethereumGrowthRate, years);
    const ethereumCoins = investmentAmount / ethereumPrice;
    const ethereumFutureValue = ethereumCoins * ethereumFuturePrice;
    const ethereumReturn = ((ethereumFutureValue - investmentAmount) / investmentAmount) * 100;

    // Portfolio calculations (60% Bitcoin, 40% Ethereum)
    const bitcoinAllocation = investmentAmount * 0.6;
    const ethereumAllocation = investmentAmount * 0.4;
    
    const portfolioBitcoinValue = (bitcoinAllocation / bitcoinPrice) * bitcoinFuturePrice;
    const portfolioEthereumValue = (ethereumAllocation / ethereumPrice) * ethereumFuturePrice;
    const portfolioTotalValue = portfolioBitcoinValue + portfolioEthereumValue;
    const portfolioReturn = ((portfolioTotalValue - investmentAmount) / investmentAmount) * 100;

    setResults({
      bitcoin: {
        coins: bitcoinCoins,
        futureValue: Math.round(bitcoinFutureValue),
        potentialReturn: Math.round(bitcoinReturn),
        riskScore: 85
      },
      ethereum: {
        coins: ethereumCoins,
        futureValue: Math.round(ethereumFutureValue),
        potentialReturn: Math.round(ethereumReturn),
        riskScore: 90
      },
      portfolio: {
        totalValue: Math.round(portfolioTotalValue),
        diversifiedReturn: Math.round(portfolioReturn),
        riskScore: 75
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

  const calculateDCA = () => {
    const monthlyRate = 0.02; // Assuming 2% monthly growth (very speculative)
    const totalMonths = years * 12;
    
    // Future value of annuity formula
    const futureValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    
    const totalInvestment = monthlyInvestment * totalMonths;
    const totalReturn = futureValue - totalInvestment;
    
    return {
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(totalInvestment),
      totalReturn: Math.round(totalReturn),
      coinsAccumulated: Math.round(futureValue / bitcoinPrice)
    };
  };

  const dcaResults = calculateDCA();

  const handleDownload = () => {
    const csvContent = [
      ['Cryptocurrency', 'Current Price (₹)', 'Coins', 'Future Value (₹)', 'Potential Return (%)', 'Risk Score'],
      ['Bitcoin', bitcoinPrice, results.bitcoin.coins.toFixed(8), results.bitcoin.futureValue, results.bitcoin.potentialReturn, results.bitcoin.riskScore],
      ['Ethereum', ethereumPrice, results.ethereum.coins.toFixed(8), results.ethereum.futureValue, results.ethereum.potentialReturn, results.ethereum.riskScore],
      ['Portfolio (60/40)', '', '', results.portfolio.totalValue, results.portfolio.diversifiedReturn, results.portfolio.riskScore]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-analysis-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-orange-200 bg-orange-50/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bitcoin className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900">{title}</h3>
            <p className="text-sm text-orange-700">{description}</p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-red-900">High Risk Warning</h4>
          </div>
          <p className="text-sm text-red-800 mt-2">
            Cryptocurrency investments are highly volatile and speculative. Past performance does not guarantee future results. 
            Only invest what you can afford to lose.
          </p>
        </div>

        <Tabs value={selectedCrypto} onValueChange={(value) => setSelectedCrypto(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
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
                min="1000"
                step="1000"
              />
            </div>

            <div>
              <Label htmlFor="bitcoin-price" className="text-sm font-medium text-gray-700">
                Bitcoin Price (₹)
              </Label>
              <Input
                id="bitcoin-price"
                type="number"
                value={bitcoinPrice}
                onChange={(e) => setBitcoinPrice(Number(e.target.value))}
                className="mt-1"
                min="100000"
                step="10000"
              />
            </div>

            <div>
              <Label htmlFor="ethereum-price" className="text-sm font-medium text-gray-700">
                Ethereum Price (₹)
              </Label>
              <Input
                id="ethereum-price"
                type="number"
                value={ethereumPrice}
                onChange={(e) => setEthereumPrice(Number(e.target.value))}
                className="mt-1"
                min="10000"
                step="1000"
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
                max="20"
              />
            </div>
          </div>

          <TabsContent value="bitcoin" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Bitcoin className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-gray-600">Bitcoin Coins</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.bitcoin.coins.toFixed(8)}
                </p>
              </div>

              <div className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">Future Value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.bitcoin.futureValue)}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${
                results.bitcoin.potentialReturn > 0 ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Potential Return</p>
                </div>
                <p className={`text-2xl font-bold ${
                  results.bitcoin.potentialReturn > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.bitcoin.potentialReturn}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ethereum" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">Ethereum Coins</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {results.ethereum.coins.toFixed(6)}
                </p>
              </div>

              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-gray-600">Future Value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(results.ethereum.futureValue)}
                </p>
              </div>

              <div className={`rounded-lg p-4 ${
                results.ethereum.potentialReturn > 0 ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Potential Return</p>
                </div>
                <p className={`text-2xl font-bold ${
                  results.ethereum.potentialReturn > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.ethereum.potentialReturn}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="bg-gradient-to-r from-orange-100 to-purple-100 border border-orange-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Diversified Portfolio (60% Bitcoin, 40% Ethereum)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Future Value</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.portfolio.totalValue)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Portfolio Return</p>
                  <p className="text-2xl font-bold text-green-600">
                    {results.portfolio.diversifiedReturn}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {results.portfolio.riskScore}/100
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* DCA Section */}
        {showAdvanced && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-4">Dollar Cost Averaging (DCA) Strategy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="monthly-investment" className="text-sm font-medium text-blue-700">
                  Monthly Investment (₹)
                </Label>
                <Input
                  id="monthly-investment"
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="mt-1"
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600">Total Investment</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dcaResults.totalInvestment)}
                </p>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600">Future Value</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(dcaResults.futureValue)}
                </p>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-600">Bitcoin Accumulated</p>
                <p className="text-xl font-bold text-orange-600">
                  {dcaResults.coinsAccumulated.toFixed(4)} BTC
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security Best Practices
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use hardware wallets for large amounts</li>
            <li>• Enable two-factor authentication on exchanges</li>
            <li>• Never share private keys or seed phrases</li>
            <li>• Diversify across multiple secure wallets</li>
            <li>• Start with small amounts to learn the process</li>
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}