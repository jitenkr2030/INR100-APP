---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3044022055bed47e3fa832b79e1ab185cf3a484a1c5d9ed9b23150637fd5bba47ea08bb90220315af1c6c1eb523ab483dcb2c8e17f7d527b07f73adb0beb8653ebcb1e82a732
    ReservedCode2: 30440220534979e57e1a263534b14b0d2e233d600a25572e2ebb879f7dd8cfb7746da2f202206a26c990c7a4355baecc1bca98c1268ddc2a6e0278704935f5510bc2e0df45dc
---

# Production Monitoring Guide

## Overview
This guide covers the production monitoring setup for INR100 Platform.

## Features Implemented

### 1. Core Web Vitals Monitoring
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP) 
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to First Byte (TTFB)

### 2. API Performance Monitoring
- Response time tracking
- Error rate monitoring
- Slow query detection

### 3. Error Tracking
- JavaScript errors
- Unhandled promise rejections
- API failures

### 4. Health Checks
- Database connectivity
- Memory usage monitoring
- Service availability

## Usage

### Enable Performance Monitoring
Add to your root layout:
```tsx
import './lib/monitoring/performance';
```

### Monitor Health
Visit `/api/health` endpoint for system health.

### View Performance Dashboard
Add `<PerformanceDashboard />` to admin pages.

## Alerting Thresholds

- FCP > 3000ms: Warning
- LCP > 4000ms: Warning  
- CLS > 0.25: Warning
- FID > 300ms: Warning
- API response > 2000ms: Warning

## Next Steps

1. Set up external monitoring service (DataDog, New Relic)
2. Configure alerting rules
3. Implement log aggregation
4. Set up uptime monitoring
