export interface BrokerConfig {
  apiKey: string
  apiSecret: string
  broker: 'zerodha' | 'upstox' | 'angel' | 'icici' | 'hdfc'
  userId?: string
}

export interface BrokerAccount {
  userId: string
  name: string
  email: string
  phone: string
  broker: string
  accountType: string
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  margin: number
  equity: number
  commodity: number
  currency: number
}

export interface BrokerOrder {
  id?: string
  symbol: string
  exchange: string
  transactionType: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
  productType: 'INTRADAY' | 'DELIVERY' | 'MARGIN' | 'CO' | 'BO'
  quantity: number
  price?: number
  triggerPrice?: number
  status: 'PENDING' | 'COMPLETE' | 'REJECTED' | 'CANCELLED'
  placedAt: Date
  updatedAt: Date
}

export interface BrokerHolding {
  symbol: string
  exchange: string
  quantity: number
  averagePrice: number
  lastPrice: number
  pnl: number
  pnlPercentage: number
  product: string
}