# 🔄 Mock to Real Data Migration Guide

This guide will help you transition your INR100 platform from mock data to real, dynamic data sources.

## 📋 **Migration Overview**

Your platform currently uses a **hybrid approach** with:
- ✅ **Real database operations** for payments, auth, and backend systems
- 🎭 **Mock data** for user-facing features (market data, analytics, social features)

## 🆓 **Free API Services Setup**

### **1. Market Data APIs (Recommended)**

#### **Option A: Yahoo Finance (Completely Free)**
```bash
# No API key required
# Simply update your market data service to use Yahoo Finance endpoints
```

**Pros:**
- ✅ Completely free
- ✅ No rate limits
- ✅ Good Indian market coverage
- ✅ Real-time and historical data

**Cons:**
- ❌ Unofficial API (may break)
- ❌ Less reliable than paid services

#### **Option B: Alpha Vantage (Free Tier)**
```bash
# Get free API key: https://www.alphavantage.co/support/#api-key
# Free: 5 requests/minute, 500 requests/day
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**Pros:**
- ✅ Official API
- ✅ High-quality data
- ✅ Good documentation
- ✅ Free tier available

**Cons:**
- ❌ Limited requests per day
- ❌ Slower response times

#### **Option C: IEX Cloud (Free Tier)**
```bash
# Get free API key: https://iexcloud.io/cloud-login#/register
# Free: 500,000 requests/month
IEX_CLOUD_API_KEY=your_api_key_here
```

**Pros:**
- ✅ Generous free tier
- ✅ High-quality data
- ✅ Good performance

**Cons:**
- ❌ Limited to US markets primarily

### **2. Database Setup for Real Analytics**

Your platform already has the complete database schema. To enable real analytics:

```bash
# 1. Set up production database
DATABASE_URL="postgresql://username:password@localhost:5432/inr100_production"

# 2. Run migrations
npm run db:migrate

# 3. Seed with initial data (optional)
npm run db:seed
```

## 🚀 **Step-by-Step Migration**

### **Phase 1: Market Data Integration**

#### **1. Update Environment Variables**
```bash
# Copy the example file
cp .env.real-data.example .env

# Fill in your API keys
ALPHA_VANTAGE_API_KEY=your_key_here
ENABLE_REAL_MARKET_DATA=true
```

#### **2. Replace Mock Market Data Service**

**Before (Mock):**
```typescript
// src/app/api/market-data/route.ts
const mockData = generateMockData();
return NextResponse.json({ data: mockData });
```

**After (Real):**
```typescript
// src/app/api/market-data/route.ts
import RealMarketDataService from '@/lib/marketDataService';

const marketData = RealMarketDataService.getInstance();
const realData = await marketData.getStockData(symbols);
return NextResponse.json({ data: realData });
```

#### **3. Test Market Data Integration**
```bash
# Test the new API endpoint
curl "http://localhost:3000/api/market-data-real?type=stocks&symbols=RELIANCE,TCS"
```

### **Phase 2: Real Analytics Implementation**

#### **1. Enable User Session Tracking**

Add session tracking to your learning components:

```typescript
// In your lesson component
useEffect(() => {
  const startTime = Date.now();
  
  return () => {
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
    saveUserSession(userId, duration);
  };
}, []);
```

#### **2. Update Analytics API**

**Before (Mock):**
```typescript
// src/app/api/learn/analytics/route.ts
const mockAnalytics = generateMockAnalytics();
return NextResponse.json({ data: mockAnalytics });
```

**After (Real):**
```typescript
// src/app/api/learn/analytics-real/route.ts
import RealAnalyticsService from '@/lib/analyticsService';

const analytics = RealAnalyticsService.getInstance();
const realAnalytics = await analytics.getUserLearningMetrics(userId);
return NextResponse.json({ data: realAnalytics });
```

#### **3. Database Tables for Analytics**

Ensure these tables exist for real analytics:

```sql
-- User sessions tracking
CREATE TABLE user_session (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration INTEGER, -- in minutes
  efficiency_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts for performance tracking
CREATE TABLE quiz_attempt (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  quiz_id VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  attempted_at TIMESTAMP DEFAULT NOW(),
  time_taken INTEGER -- in seconds
);

-- Learning progress with detailed tracking
CREATE TABLE learn_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  time_spent INTEGER, -- in minutes
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Phase 3: Real Social Features**

#### **1. Database Setup for Social Features**

```sql
-- Discussions
CREATE TABLE discussion (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  course VARCHAR(255),
  lesson VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Discussion likes
CREATE TABLE discussion_like (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  discussion_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study groups
CREATE TABLE study_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  difficulty VARCHAR(50),
  max_members INTEGER DEFAULT 50,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Study group memberships
CREATE TABLE study_group_membership (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  group_id INTEGER NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Progress shares
CREATE TABLE progress_share (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- achievement, course_completion, streak, quiz_score
  title VARCHAR(255) NOT NULL,
  description TEXT,
  achievement JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. Update Social Features API**

**Before (Mock):**
```typescript
// src/app/api/learn/social/discussions/route.ts
const mockDiscussions = getMockDiscussions();
return NextResponse.json({ data: { discussions: mockDiscussions } });
```

**After (Real):**
```typescript
// src/app/api/learn/social-real/route.ts
import RealSocialService from '@/lib/socialService';

const social = RealSocialService.getInstance();
const realDiscussions = await social.getDiscussions(userId);
return NextResponse.json({ data: realDiscussions });
```

### **Phase 4: Frontend Integration**

#### **1. Update Components to Use Real APIs**

**Market Data Component:**
```typescript
// Before
const { data: marketData } = useMarketData(); // Uses mock data

// After
const { data: marketData } = useMarketData({
  apiEndpoint: '/api/market-data-real'
});
```

**Analytics Component:**
```typescript
// Before
const { data: analytics } = useAnalytics(); // Uses mock data

// After
const { data: analytics } = useAnalytics({
  apiEndpoint: '/api/learn/analytics-real'
});
```

#### **2. Add Loading States**

Since real APIs may have slower response times:

```typescript
const { data: marketData, loading, error } = useRealMarketData(symbols);

if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message="Failed to load market data" />;
}
```

## 🔧 **Configuration and Monitoring**

### **1. Environment Configuration**

```bash
# Development
NODE_ENV=development
ENABLE_REAL_MARKET_DATA=false  # Use mock for development
ENABLE_REAL_ANALYTICS=false    # Use mock for development

# Production
NODE_ENV=production
ENABLE_REAL_MARKET_DATA=true   # Use real data
ENABLE_REAL_ANALYTICS=true     # Use real data
```

### **2. Rate Limiting**

```typescript
// Add rate limiting to prevent API abuse
const rateLimiter = {
  alphaVantage: { requests: 5, window: 60 }, // 5 requests per minute
  yahooFinance: { requests: 100, window: 60 } // 100 requests per minute
};
```

### **3. Error Handling and Fallbacks**

```typescript
try {
  const realData = await marketAPI.getStockData(symbols);
  return realData;
} catch (error) {
  console.warn('Real API failed, falling back to mock data');
  return generateMockData(symbols);
}
```

### **4. Monitoring and Logging**

```typescript
// Log API calls for monitoring
const logAPICall = (api: string, success: boolean, duration: number) => {
  console.log(`API Call: ${api} - ${success ? 'Success' : 'Failed'} - ${duration}ms`);
};
```

## 📊 **Performance Considerations**

### **1. Caching Strategy**

```typescript
// Cache market data for 5 minutes
const cacheKey = `market-data-${symbols.join('-')}`;
const cached = await redis.get(cacheKey);
if (cached && Date.now() - cached.timestamp < 300000) {
  return cached.data;
}
```

### **2. Batch API Calls**

```typescript
// Batch multiple stock requests
const stockPromises = symbols.map(symbol => 
  marketAPI.getStockData([symbol])
);
const allData = await Promise.all(stockPromises);
```

### **3. Progressive Loading**

```typescript
// Load essential data first, then optional data
const essentialData = await loadEssentialData();
const optionalData = await loadOptionalData();
```

## 🧪 **Testing Strategy**

### **1. Mock Data for Testing**

```typescript
// tests/mocks/realAPIs.ts
export const mockRealMarketData = {
  getStockData: jest.fn().mockResolvedValue([/* real data structure */])
};
```

### **2. Integration Tests**

```typescript
// tests/integration/realAPIs.test.ts
describe('Real Market Data Integration', () => {
  it('should fetch real stock data', async () => {
    const response = await fetch('/api/market-data-real?symbols');
    const=RELIANCE data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });
});
```

## 📈 **Gradual Migration Plan**

### **Week 1: Market Data**
- ✅ Set up Alpha Vantage API
- ✅ Implement real market data service
- ✅ Add caching and fallbacks
- ✅ Test with popular Indian stocks

### **Week 2: Analytics Foundation**
- ✅ Set up user session tracking
- ✅ Implement real analytics service
- ✅ Add database tables for analytics
- ✅ Test analytics calculations

### **Week 3: Social Features**
- ✅ Set up social features database
- ✅ Implement real social service
- ✅ Add user interactions (likes, shares)
- ✅ Test social features

### **Week 4: Integration & Optimization**
- ✅ Update all frontend components
- ✅ Add comprehensive error handling
- ✅ Implement caching strategies
- ✅ Performance optimization
- ✅ Load testing

## 🚨 **Rollback Plan**

If issues arise, you can quickly rollback:

```bash
# Revert to mock data temporarily
ENABLE_REAL_MARKET_DATA=false
ENABLE_REAL_ANALYTICS=false
ENABLE_REAL_SOCIAL_FEATURES=false

# Restart application
npm run dev
```

## 📞 **Support and Resources**

- **Alpha Vantage Docs**: https://www.alphavantage.co/documentation/
- **Yahoo Finance API**: https://github.com/jasonstrimpel/yahoo-finance-api
- **Database Schema**: Check your existing Prisma schema
- **Rate Limiting**: Implement proper rate limiting for all APIs

## 🎯 **Success Metrics**

Track these metrics during migration:

- **API Response Time**: < 2 seconds for market data
- **Cache Hit Rate**: > 80% for frequently requested data
- **Error Rate**: < 5% for API failures
- **User Engagement**: Maintain or improve current engagement levels

---

This migration will transform your platform from a demo to a fully functional system with real, dynamic data while maintaining the excellent user experience you've built!