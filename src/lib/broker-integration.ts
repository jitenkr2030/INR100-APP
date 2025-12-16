export interface BrokerConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  broker: string;
}

export interface BrokerAccount {
  accountId: string;
  name: string;
  broker: string;
  accountType: string;
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface OrderBook {
  symbol: string;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
}

export interface TradeOrder {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  timestamp: number;
}

export class BrokerIntegration {
  private config: BrokerConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: BrokerConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    };
  }

  async getAccountInfo(): Promise<BrokerAccount> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/account`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch account info: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        accountId: data.accountId,
        name: data.name,
        broker: this.config.broker,
        accountType: data.accountType,
        balance: parseFloat(data.balance),
        availableBalance: parseFloat(data.availableBalance),
        currency: data.currency || 'INR',
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const account = await this.getAccountInfo();
      return account.availableBalance;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async getMarketData(symbol: string): Promise<OrderBook> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/market-data/${symbol}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        symbol: data.symbol,
        bid: parseFloat(data.bid),
        ask: parseFloat(data.ask),
        volume: parseFloat(data.volume),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async placeOrder(order: Omit<TradeOrder, 'orderId' | 'status' | 'timestamp'>): Promise<TradeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: order.quantity,
          price: order.price,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        orderId: data.orderId,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        quantity: order.quantity,
        price: order.price,
        status: 'pending',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  async getOrderStatus(orderId: string): Promise<TradeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders/${orderId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get order status: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        orderId: data.orderId,
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        quantity: parseFloat(data.quantity),
        price: parseFloat(data.price),
        status: data.status,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Error getting order status:', error);
      throw error;
    }
  }

  async getPositions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/positions`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }
}

// Factory function to create broker instance
export function createBrokerInstance(config: BrokerConfig): BrokerIntegration {
  return new BrokerIntegration(config);
}

// Mock implementation for development
export class MockBrokerIntegration extends BrokerIntegration {
  constructor() {
    super({
      apiKey: 'mock-api-key',
      apiSecret: 'mock-api-secret',
      baseUrl: 'https://mock-broker-api.com',
      broker: 'MockBroker',
    });
  }

  async getAccountInfo(): Promise<BrokerAccount> {
    return {
      accountId: 'mock-account-123',
      name: 'Demo Account',
      broker: 'MockBroker',
      accountType: 'demo',
      balance: 100000,
      availableBalance: 100000,
      currency: 'INR',
    };
  }

  async getBalance(): Promise<number> {
    return 100000;
  }

  async getMarketData(symbol: string): Promise<OrderBook> {
    return {
      symbol,
      bid: 150.25,
      ask: 150.35,
      volume: 1000,
      timestamp: Date.now(),
    };
  }

  async placeOrder(order: any): Promise<TradeOrder> {
    return {
      orderId: `mock-order-${Date.now()}`,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      status: 'filled',
      timestamp: Date.now(),
    };
  }
}

export default BrokerIntegration;