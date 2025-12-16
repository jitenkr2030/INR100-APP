export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
  timestamp: number;
}

export interface HistoricalData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface MarketIndices {
  nifty50: number;
  sensex: number;
  bankNifty: number;
  niftyIT: number;
  niftyPharma: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  type: string;
}

export class MarketDataService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.MARKET_DATA_API_URL || 'https://api.example.com/v1';
    this.apiKey = apiKey || process.env.MARKET_DATA_API_KEY || '';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async getQuote(symbol: string): Promise<MarketData> {
    try {
      const response = await fetch(`${this.baseUrl}/quote/${symbol}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quote: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        symbol: data.symbol,
        name: data.name,
        price: parseFloat(data.price),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.changePercent),
        volume: parseInt(data.volume),
        marketCap: data.marketCap ? parseInt(data.marketCap) : undefined,
        high52Week: data.high52Week ? parseFloat(data.high52Week) : undefined,
        low52Week: data.low52Week ? parseFloat(data.low52Week) : undefined,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, period: string = '1Y'): Promise<HistoricalData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/historical/${symbol}?period=${period}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        symbol,
        date: item.date,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
        adjustedClose: item.adjustedClose ? parseFloat(item.adjustedClose) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async getMarketIndices(): Promise<MarketIndices> {
    try {
      const response = await fetch(`${this.baseUrl}/indices`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market indices: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        nifty50: parseFloat(data.nifty50),
        sensex: parseFloat(data.sensex),
        bankNifty: parseFloat(data.bankNifty),
        niftyIT: parseFloat(data.niftyIT),
        niftyPharma: parseFloat(data.niftyPharma),
      };
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to search stocks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchange,
        sector: item.sector,
        type: item.type,
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  async getWatchlist(symbols: string[]): Promise<MarketData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/watchlist`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch watchlist: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: parseFloat(item.price),
        change: parseFloat(item.change),
        changePercent: parseFloat(item.changePercent),
        volume: parseInt(item.volume),
        marketCap: item.marketCap ? parseInt(item.marketCap) : undefined,
        high52Week: item.high52Week ? parseFloat(item.high52Week) : undefined,
        low52Week: item.low52Week ? parseFloat(item.low52Week) : undefined,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      throw error;
    }
  }

  async getTopGainers(): Promise<MarketData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-gainers`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top gainers: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: parseFloat(item.price),
        change: parseFloat(item.change),
        changePercent: parseFloat(item.changePercent),
        volume: parseInt(item.volume),
        marketCap: item.marketCap ? parseInt(item.marketCap) : undefined,
        high52Week: item.high52Week ? parseFloat(item.high52Week) : undefined,
        low52Week: item.low52Week ? parseFloat(item.low52Week) : undefined,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  }

  async getTopLosers(): Promise<MarketData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-losers`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top losers: ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: parseFloat(item.price),
        change: parseFloat(item.change),
        changePercent: parseFloat(item.changePercent),
        volume: parseInt(item.volume),
        marketCap: item.marketCap ? parseInt(item.marketCap) : undefined,
        high52Week: item.high52Week ? parseFloat(item.high52Week) : undefined,
        low52Week: item.low52Week ? parseFloat(item.low52Week) : undefined,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  }
}

// Mock implementation for development
export class MockMarketDataService extends MarketDataService {
  constructor() {
    super('mock-api-key');
  }

  async getQuote(symbol: string): Promise<MarketData> {
    // Generate mock data based on symbol
    const basePrice = 100 + Math.random() * 900;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      name: `${symbol} Ltd`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(basePrice * 1000000),
      high52Week: basePrice * 1.2,
      low52Week: basePrice * 0.8,
      timestamp: Date.now(),
    };
  }

  async getHistoricalData(symbol: string, period: string = '1Y'): Promise<HistoricalData[]> {
    const days = period === '1Y' ? 365 : period === '1M' ? 30 : 7;
    const data: HistoricalData[] = [];
    let basePrice = 100 + Math.random() * 900;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const open = basePrice + (Math.random() - 0.5) * 10;
      const high = open + Math.random() * 10;
      const low = open - Math.random() * 10;
      const close = low + Math.random() * (high - low);
      
      data.push({
        symbol,
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 1000000),
      });
      
      basePrice = close;
    }

    return data;
  }

  async getMarketIndices(): Promise<MarketIndices> {
    return {
      nifty50: 19800 + Math.random() * 400,
      sensex: 66500 + Math.random() * 1000,
      bankNifty: 45000 + Math.random() * 1000,
      niftyIT: 35000 + Math.random() * 500,
      niftyPharma: 14000 + Math.random() * 300,
    };
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    const mockResults = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Oil & Gas', type: 'Equity' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', sector: 'IT', type: 'Equity' },
      { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', type: 'Equity' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', type: 'Equity' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', type: 'Equity' },
    ];

    return mockResults.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export default MarketDataService;