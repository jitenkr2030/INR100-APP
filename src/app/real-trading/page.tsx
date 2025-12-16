'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  PieChart, 
  Repeat, 
  RefreshCw, 
  Shield, 
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { brokerIntegrationService } from '@/lib/broker-integration';

interface AccountInfo {
  brokerName: string;
  accountNumber: string;
  tradingAccess: boolean;
  marginAvailable: number;
  lastUpdated: string;
}

interface Balance {
  availableCash: number;
  totalBalance: number;
  marginUsed: number;
  unrealizedPnL: number;
}

interface Stock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  volume: number;
}

interface Holding {
  symbol: string;
  companyName: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  ltp: number;
  pnl: number;
  pnlPercentage: number;
  isin: string;
  exchange: string;
}

const RealTradingPage = () => {
  const [activeTab, setActiveTab] = useState('fractional');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  
  // Trading form state
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    try {
      setIsLoading(true);
      
      const [accountResult, balanceResult, watchlistResult, holdingsResult] = await Promise.all([
        brokerIntegrationService.getAccountInfo(),
        brokerIntegrationService.getAccountBalance(),
        brokerIntegrationService.getWatchlist(),
        brokerIntegrationService.getHoldings()
      ]);

      if (accountResult.success && accountResult.account) {
        setAccountInfo(accountResult.account);
      }
      
      if (balanceResult.success && balanceResult.balance) {
        setBalance(balanceResult.balance);
      }
      
      if (watchlistResult.success && watchlistResult.watchlist) {
        setWatchlist(watchlistResult.watchlist);
      }
      
      if (holdingsResult.success && holdingsResult.holdings) {
        setHoldings(holdingsResult.holdings);
      }
    } catch (error) {
      console.error('Error loading trading data:', error);
      alert('Failed to load trading data. Please check your broker connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTradingData();
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setPrice(stock.currentPrice.toString());
  };

  const calculateFractionalQuantity = () => {
    if (!selectedStock || !investmentAmount) return 0;
    
    const amount = parseFloat(investmentAmount);
    const currentPrice = selectedStock.currentPrice;
    
    return Math.floor((amount / currentPrice) * 100) / 100;
  };

  const handlePlaceOrder = async () => {
    if (!selectedStock || (!investmentAmount && !quantity)) {
      alert('Please select a stock and enter investment details.');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        symbol: selectedStock.symbol,
        currentPrice: selectedStock.currentPrice,
        orderType: orderType === 'BUY' ? 'MARKET' : 'MARKET',
        transactionType: orderType,
        ...(activeTab === 'fractional' ? {
          investmentAmount: parseFloat(investmentAmount),
          fractionalQuantity: calculateFractionalQuantity()
        } : {
          quantity: parseFloat(quantity),
          price: parseFloat(price)
        })
      };

      const result = activeTab === 'fractional' 
        ? await brokerIntegrationService.placeFractionalOrder(orderData)
        : await brokerIntegrationService.placeOrder(orderData);

      if (result.success) {
        alert(`${orderType} order for ${selectedStock.symbol} has been placed successfully.`);
        setInvestmentAmount('');
        setQuantity('');
        setPrice('');
        loadTradingData();
      } else {
        alert(`Order Failed: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountInfo = () => {
    if (!balance) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Account Balance
            {accountInfo && (
              <Badge variant="outline">{accountInfo.brokerName}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Available Cash</p>
              <p className="text-2xl font-bold">₹{balance.availableCash.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold">₹{balance.totalBalance.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Unrealized P&L</p>
              <p className={`text-2xl font-bold ${
                balance.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {balance.unrealizedPnL >= 0 ? '+' : ''}₹{balance.unrealizedPnL.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTradingTabs = () => (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      <Button
        variant={activeTab === 'fractional' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('fractional')}
        className="flex items-center gap-2"
      >
        <PieChart className="h-4 w-4" />
        Fractional
      </Button>
      <Button
        variant={activeTab === 'direct' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('direct')}
        className="flex items-center gap-2"
      >
        <TrendingUp className="h-4 w-4" />
        Direct
      </Button>
      <Button
        variant={activeTab === 'sip' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('sip')}
        className="flex items-center gap-2"
      >
        <Repeat className="h-4 w-4" />
        SIP
      </Button>
    </div>
  );

  const renderStockSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Select Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((stock, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStock?.symbol === stock.symbol ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleStockSelect(stock)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600 truncate">{stock.companyName}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stock.exchange || 'NSE'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold">₹{stock.currentPrice.toFixed(2)}</p>
                  <p className={`text-sm flex items-center gap-1 ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFractionalTrading = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          Fractional Investing
        </CardTitle>
        <CardDescription>
          Invest any amount starting from ₹100 in fractional shares
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Investment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min ₹100)"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
              />
            </div>

            {selectedStock && investmentAmount && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Order Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">{selectedStock.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">₹{investmentAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">{calculateFractionalQuantity()} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Cost:</span>
                    <span className="font-medium">₹{(calculateFractionalQuantity() * selectedStock.currentPrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Quick Amounts</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['500', '1000', '2000', '5000'].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestmentAmount(amount)}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDirectTrading = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Direct Trading
        </CardTitle>
        <CardDescription>
          Trade full shares with market or limit orders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Number of shares"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Order Type</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={orderType === 'BUY' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOrderType('BUY')}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  BUY
                </Button>
                <Button
                  variant={orderType === 'SELL' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setOrderType('SELL')}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  SELL
                </Button>
              </div>
            </div>

            {selectedStock && quantity && price && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Order Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span className="font-medium">{selectedStock.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span className="font-medium">{quantity} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium">₹{price}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>₹{(parseFloat(quantity) * parseFloat(price)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSIPTrading = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-purple-600" />
          Systematic Investment Plan (SIP)
        </CardTitle>
        <CardDescription>
          Automate your investments with regular SIPs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">SIP Feature Coming Soon</h3>
          <p className="text-gray-600">
            Systematic Investment Plans will be available in the next update.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderHoldings = () => {
    if (!holdings.length) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{holding.symbol}</h4>
                    <p className="text-sm text-gray-600">{holding.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)} ({holding.pnlPercentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Qty</p>
                    <p className="font-medium">{holding.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Price</p>
                    <p className="font-medium">₹{holding.avgPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">LTP</p>
                    <p className="font-medium">₹{holding.currentPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPlaceOrderButton = () => {
    const isValid = selectedStock && 
      ((activeTab === 'fractional' && investmentAmount) || 
       (activeTab === 'direct' && quantity && price));

    return (
      <Card className="sticky bottom-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {selectedStock ? `${selectedStock.symbol} - ${orderType}` : 'Select a stock'}
              </p>
              {selectedStock && (
                <p className="text-sm text-gray-600">
                  {activeTab === 'fractional' 
                    ? `Amount: ₹${investmentAmount}` 
                    : `Qty: ${quantity} @ ₹${price}`
                  }
                </p>
              )}
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={!isValid || isLoading}
              size="lg"
              className="min-w-[140px]"
            >
              {isLoading ? 'Placing...' : `Place ${orderType} Order`}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!accountInfo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Broker Setup Required</h3>
            <p className="text-gray-600 mb-4">
              You need to connect your broker account before you can start real trading.
            </p>
            <Button asChild>
              <a href="/broker-setup">Setup Broker</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Real Trading</h1>
        <p className="text-gray-600">
          Invest with real money through your {accountInfo.brokerName} account
        </p>
      </div>

      {renderAccountInfo()}
      {renderTradingTabs()}
      {renderStockSelector()}
      
      {activeTab === 'fractional' && renderFractionalTrading()}
      {activeTab === 'direct' && renderDirectTrading()}
      {activeTab === 'sip' && renderSIPTrading()}
      
      {renderHoldings()}
      {renderPlaceOrderButton()}
    </div>
  );
};

export default RealTradingPage;