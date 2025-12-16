export interface StockPrice {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  lastUpdated: Date
}

export interface IndexData {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
  lastUpdated: Date
}

export interface MarketData {
  stocks: StockPrice[]
  indices: IndexData[]
  marketStatus: 'open' | 'closed' | 'pre-market' | 'post-market'
  lastUpdated: Date
}