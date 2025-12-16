#!/usr/bin/env node

/**
 * Simple API test for dynamic data endpoints
 * Tests basic connectivity without external dependencies
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class SimpleAPITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Simple API Tests...\n');

    await this.testDashboard();
    await this.testInvest();
    await this.testPortfolio();
    await this.testRealTrading();
    await this.testBrokerSetup();
    await this.testLearn();
    await this.testCommunity();
    await this.testRewards();

    this.printSummary();
  }

  async testDashboard() {
    console.log('📊 Testing Dashboard API...');
    await this.testEndpoint('/api/dashboard', 'Dashboard');
  }

  async testInvest() {
    console.log('💰 Testing Invest API...');
    await this.testEndpoint('/api/invest', 'Invest');
  }

  async testPortfolio() {
    console.log('📈 Testing Portfolio API...');
    await this.testEndpoint('/api/portfolio/dynamic', 'Portfolio');
  }

  async testRealTrading() {
    console.log('🔄 Testing Real Trading API...');
    await this.testEndpoint('/api/real-trading', 'Real Trading');
  }

  async testBrokerSetup() {
    console.log('🏢 Testing Broker Setup API...');
    await this.testEndpoint('/api/broker-setup', 'Broker Setup');
  }

  async testLearn() {
    console.log('📚 Testing Learn API...');
    await this.testEndpoint('/api/learn/dynamic', 'Learn');
  }

  async testCommunity() {
    console.log('👥 Testing Community API...');
    await this.testEndpoint('/api/community/dynamic', 'Community');
  }

  async testRewards() {
    console.log('🏆 Testing Rewards API...');
    await this.testEndpoint('/api/rewards/dynamic', 'Rewards');
  }

  async testEndpoint(path, name) {
    try {
      const response = await this.makeRequest(`${BASE_URL}${path}?userId=demo-user`);
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        if (data.success !== false) {
          this.logSuccess(name, 'API accessible', `Status: ${response.statusCode}`);
        } else {
          this.logFailure(name, 'API returned error', data.error || 'Unknown error');
        }
      } else {
        this.logFailure(name, 'API error', `Status: ${response.statusCode}`);
      }
    } catch (error) {
      this.logFailure(name, 'Connection failed', error.message);
    }
    console.log('');
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  logSuccess(testName, result, details) {
    this.results.passed++;
    this.results.tests.push({
      name: testName,
      status: 'PASSED',
      result,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`  ✅ ${testName}: ${result}`);
  }

  logFailure(testName, error, details) {
    this.results.failed++;
    this.results.tests.push({
      name: testName,
      status: 'FAILED',
      error,
      details,
      timestamp: new Date().toISOString()
    });
    console.log(`  ❌ ${testName}: ${error} - ${details}`);
  }

  printSummary() {
    console.log('📋 Test Summary\n');
    console.log('=' * 50);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
    console.log('');

    if (this.results.failed === 0) {
      console.log('🎉 All API endpoints are accessible!');
    } else {
      console.log('⚠️  Some API endpoints failed. Check the server and endpoints.');
    }

    console.log('\nTo test with a running server:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Run this test: node scripts/simple-api-test.js');
    console.log('3. Test individual endpoints with curl:');
    console.log('   curl http://localhost:3000/api/dashboard?userId=demo-user');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SimpleAPITester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = SimpleAPITester;