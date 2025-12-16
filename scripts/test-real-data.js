#!/usr/bin/env node

/**
 * Test script for real data integration
 * Tests market data, analytics, and social features APIs
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class RealDataTester {
  constructor() {
    this.results = {
      marketData: { passed: 0, failed: 0, tests: [] },
      analytics: { passed: 0, failed: 0, tests: [] },
      social: { passed: 0, failed: 0, tests: [] }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Real Data Integration Tests...\n');

    await this.testMarketData();
    await this.testAnalytics();
    await this.testSocialFeatures();

    this.printSummary();
  }

  async testMarketData() {
    console.log('📊 Testing Market Data APIs...');

    // Test 1: Real market data endpoint
    try {
      const response = await axios.get(`${BASE_URL}/api/market-data-real?type=stocks&symbols=RELIANCE,TCS`);
      const data = response.data;
      
      if (data.success && data.data && data.data.length > 0) {
        this.logSuccess('marketData', 'Stock data retrieval', data.data[0]);
      } else {
        this.logFailure('marketData', 'Stock data retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('marketData', 'Stock data retrieval', error.message);
    }

    // Test 2: Market indices
    try {
      const response = await axios.get(`${BASE_URL}/api/market-data-real?type=indices`);
      const data = response.data;
      
      if (data.success && data.data && data.data.length > 0) {
        this.logSuccess('marketData', 'Indices data retrieval', data.data[0]);
      } else {
        this.logFailure('marketData', 'Indices data retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('marketData', 'Indices data retrieval', error.message);
    }

    // Test 3: Top gainers
    try {
      const response = await axios.get(`${BASE_URL}/api/market-data-real?type=gainers`);
      const data = response.data;
      
      if (data.success && data.data && data.data.length > 0) {
        this.logSuccess('marketData', 'Top gainers retrieval', `Found ${data.data.length} gainers`);
      } else {
        this.logFailure('marketData', 'Top gainers retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('marketData', 'Top gainers retrieval', error.message);
    }

    console.log('');
  }

  async testAnalytics() {
    console.log('📈 Testing Analytics APIs...');

    // Test 1: Real analytics endpoint
    try {
      const response = await axios.get(`${BASE_URL}/api/learn/analytics-real?userId=test-user&range=month`);
      const data = response.data;
      
      if (data.success && data.data && data.data.overview) {
        this.logSuccess('analytics', 'Analytics data retrieval', {
          lessonsCompleted: data.data.overview.lessonsCompleted,
          currentStreak: data.data.overview.currentStreak
        });
      } else {
        this.logFailure('analytics', 'Analytics data retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('analytics', 'Analytics data retrieval', error.message);
    }

    // Test 2: Subject performance
    try {
      const response = await axios.get(`${BASE_URL}/api/learn/analytics-real?userId=test-user&type=subjects`);
      const data = response.data;
      
      if (data.success && data.data) {
        this.logSuccess('analytics', 'Subject performance data', `Found ${data.data.length || 0} subjects`);
      } else {
        this.logFailure('analytics', 'Subject performance data', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('analytics', 'Subject performance data', error.message);
    }

    console.log('');
  }

  async testSocialFeatures() {
    console.log('👥 Testing Social Features APIs...');

    // Test 1: Discussions endpoint
    try {
      const response = await axios.get(`${BASE_URL}/api/learn/social-real?type=discussions&userId=test-user`);
      const data = response.data;
      
      if (data.success && data.data) {
        this.logSuccess('social', 'Discussions retrieval', `Found ${data.data.length || 0} discussions`);
      } else {
        this.logFailure('social', 'Discussions retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('social', 'Discussions retrieval', error.message);
    }

    // Test 2: Study groups
    try {
      const response = await axios.get(`${BASE_URL}/api/learn/social-real?type=groups&userId=test-user`);
      const data = response.data;
      
      if (data.success && data.data) {
        this.logSuccess('social', 'Study groups retrieval', `Found ${data.data.length || 0} groups`);
      } else {
        this.logFailure('social', 'Study groups retrieval', 'Invalid response structure');
      }
    } catch (error) {
      this.logFailure('social', 'Study groups retrieval', error.message);
    }

    // Test 3: Create discussion (POST test)
    try {
      const response = await axios.post(`${BASE_URL}/api/learn/social-real`, {
        action: 'create_discussion',
        userId: 'test-user',
        content: 'Test discussion from automated testing',
        course: 'test-course'
      });
      const data = response.data;
      
      if (data.success) {
        this.logSuccess('social', 'Discussion creation', 'Discussion created successfully');
      } else {
        this.logFailure('social', 'Discussion creation', 'Failed to create discussion');
      }
    } catch (error) {
      this.logFailure('social', 'Discussion creation', error.message);
    }

    console.log('');
  }

  logSuccess(category, testName, result) {
    this.results[category].passed++;
    this.results[category].tests.push({
      name: testName,
      status: 'PASSED',
      result: result,
      timestamp: new Date().toISOString()
    });
    console.log(`  ✅ ${testName}: ${typeof result === 'object' ? JSON.stringify(result) : result}`);
  }

  logFailure(category, testName, error) {
    this.results[category].failed++;
    this.results[category].tests.push({
      name: testName,
      status: 'FAILED',
      error: error,
      timestamp: new Date().toISOString()
    });
    console.log(`  ❌ ${testName}: ${error}`);
  }

  printSummary() {
    console.log('📋 Test Summary\n');
    console.log('=' * 50);

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(this.results).forEach(([category, result]) => {
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      console.log(`${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${result.passed}`);
      console.log(`  ❌ Failed: ${result.failed}`);
      console.log(`  📊 Success Rate: ${((result.passed / (result.passed + result.failed)) * 100).toFixed(1)}%`);
      console.log('');
    });

    console.log('OVERALL RESULTS:');
    console.log(`  ✅ Total Passed: ${totalPassed}`);
    console.log(`  ❌ Total Failed: ${totalFailed}`);
    console.log(`  📊 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    console.log('');

    if (totalFailed === 0) {
      console.log('🎉 All tests passed! Real data integration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the configuration and API setup.');
    }

    // Save results to file
    this.saveResults();
  }

  saveResults() {
    const fs = require('fs');
    const resultsFile = './test-results-real-data.json';
    
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      results: this.results,
      summary: {
        totalPassed: Object.values(this.results).reduce((sum, r) => sum + r.passed, 0),
        totalFailed: Object.values(this.results).reduce((sum, r) => sum + r.failed, 0),
        successRate: ((Object.values(this.results).reduce((sum, r) => sum + r.passed, 0) / 
                      (Object.values(this.results).reduce((sum, r) => sum + r.passed + r.failed, 0))) * 100).toFixed(1)
      }
    };

    fs.writeFileSync(resultsFile, JSON.stringify(report, null, 2));
    console.log(`📄 Test results saved to: ${resultsFile}`);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new RealDataTester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = RealDataTester;