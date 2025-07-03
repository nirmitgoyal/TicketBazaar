#!/usr/bin/env node

import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';

class ComprehensiveTestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {
      api: [],
      frontend: [],
      database: [],
      security: [],
      performance: []
    };
  }

  async waitForServer(timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        await this.makeRequest('/');
        console.log('✓ Server is ready');
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Server failed to start within timeout');
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const reqOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TestRunner/1.0',
          ...options.headers
        }
      };

      const req = http.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: parsedData,
              rawData: data
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data
            });
          }
        });
      });

      req.on('error', reject);

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    });
  }

  async testAPI() {
    console.log('\n=== API Testing ===');
    
    const apiTests = [
      {
        name: 'Health Check',
        path: '/api/health',
        expectedStatus: 200
      },
      {
        name: 'Get All Tickets',
        path: '/api/tickets',
        expectedStatus: 200
      },

      {
        name: 'Search Tickets',
        path: '/api/tickets/search?query=concert',
        expectedStatus: 200
      },
      {
        name: 'User Authentication Status',
        path: '/api/auth/user',
        expectedStatus: [200, 401]
      },
      {
        name: 'Search Hints',
        path: '/api/search/hints?query=taylor',
        expectedStatus: 200
      },
      {
        name: 'Autocomplete',
        path: '/api/autocomplete?query=concert',
        expectedStatus: 200
      }
    ];

    for (const test of apiTests) {
      try {
        const response = await this.makeRequest(test.path);
        const statusOk = Array.isArray(test.expectedStatus) 
          ? test.expectedStatus.includes(response.statusCode)
          : response.statusCode === test.expectedStatus;

        const result = {
          name: test.name,
          status: statusOk ? 'PASS' : 'FAIL',
          statusCode: response.statusCode,
          hasData: !!response.data,
          responseTime: Date.now()
        };

        console.log(`${result.status === 'PASS' ? '✓' : '✗'} ${test.name}: ${response.statusCode}`);
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`  └─ Returned ${response.data.length} items`);
        }

        this.results.api.push(result);
      } catch (error) {
        console.log(`✗ ${test.name}: ERROR - ${error.message}`);
        this.results.api.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testFrontend() {
    console.log('\n=== Frontend Testing ===');
    
    const frontendTests = [
      {
        name: 'Homepage Load',
        path: '/',
        expectedStatus: 200
      },
      {
        name: 'Login Page',
        path: '/login',
        expectedStatus: 200
      },
      {
        name: 'Register Page',
        path: '/register',
        expectedStatus: 200
      },
      {
        name: 'List Ticket Page',
        path: '/list-ticket',
        expectedStatus: 200
      },
      {
        name: 'Map View',
        path: '/map',
        expectedStatus: 200
      },
      {
        name: 'Cities Page',
        path: '/cities',
        expectedStatus: 200
      },
      {
        name: '404 Handling',
        path: '/nonexistent-page',
        expectedStatus: 200 // React Router handles this
      }
    ];

    for (const test of frontendTests) {
      try {
        const response = await this.makeRequest(test.path);
        const statusOk = response.statusCode === test.expectedStatus;
        const hasHtml = response.rawData.includes('<html') || response.rawData.includes('<!DOCTYPE');

        const result = {
          name: test.name,
          status: statusOk && hasHtml ? 'PASS' : 'FAIL',
          statusCode: response.statusCode,
          hasHtml: hasHtml
        };

        console.log(`${result.status === 'PASS' ? '✓' : '✗'} ${test.name}: ${response.statusCode}`);
        this.results.frontend.push(result);
      } catch (error) {
        console.log(`✗ ${test.name}: ERROR - ${error.message}`);
        this.results.frontend.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testDatabase() {
    console.log('\n=== Database Testing ===');
    
    try {
      // Test database connectivity through API
      const healthResponse = await this.makeRequest('/api/health');
      const dbHealthy = healthResponse.statusCode === 200;
      
      console.log(`${dbHealthy ? '✓' : '✗'} Database Connectivity: ${healthResponse.statusCode}`);
      
      // Test data retrieval
      const ticketsResponse = await this.makeRequest('/api/tickets');
      const hasTickets = ticketsResponse.data && Array.isArray(ticketsResponse.data);
      
      console.log(`${hasTickets ? '✓' : '✗'} Data Retrieval: ${ticketsResponse.statusCode}`);
      if (hasTickets) {
        console.log(`  └─ Found ${ticketsResponse.data.length} tickets in database`);
      }

      // Test search functionality
      const searchResponse = await this.makeRequest('/api/tickets/search?query=concert');
      const searchWorks = searchResponse.statusCode === 200;
      
      console.log(`${searchWorks ? '✓' : '✗'} Search Functionality: ${searchResponse.statusCode}`);

      this.results.database.push({
        connectivity: dbHealthy,
        dataRetrieval: hasTickets,
        searchFunctionality: searchWorks
      });
    } catch (error) {
      console.log(`✗ Database Testing: ERROR - ${error.message}`);
      this.results.database.push({ error: error.message });
    }
  }

  async testSecurity() {
    console.log('\n=== Security Testing ===');
    
    const securityTests = [
      {
        name: 'CORS Headers',
        test: async () => {
          const response = await this.makeRequest('/api/tickets');
          return response.headers['access-control-allow-origin'] !== undefined;
        }
      },
      {
        name: 'Content Security',
        test: async () => {
          const response = await this.makeRequest('/');
          return response.headers['content-type'] !== undefined;
        }
      },
      {
        name: 'Rate Limiting Protection',
        test: async () => {
          // Make rapid requests to test rate limiting
          const promises = [];
          for (let i = 0; i < 20; i++) {
            promises.push(this.makeRequest('/api/tickets'));
          }
          const responses = await Promise.all(promises);
          return responses.some(r => r.statusCode === 429);
        }
      }
    ];

    for (const test of securityTests) {
      try {
        const passed = await test.test();
        console.log(`${passed ? '✓' : '✗'} ${test.name}`);
        this.results.security.push({
          name: test.name,
          status: passed ? 'PASS' : 'FAIL'
        });
      } catch (error) {
        console.log(`✗ ${test.name}: ERROR`);
        this.results.security.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
      }
    }
  }

  async testResponsiveness() {
    console.log('\n=== Performance & Responsiveness ===');
    
    const performanceTests = [
      { name: 'Homepage', path: '/' },
      { name: 'API Tickets', path: '/api/tickets' },
      { name: 'API Search', path: '/api/tickets/search?query=concert' }
    ];

    for (const test of performanceTests) {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
          await this.makeRequest(test.path);
          times.push(Date.now() - start);
        } catch (error) {
          console.log(`✗ ${test.name}: Request failed`);
          break;
        }
      }
      
      if (times.length > 0) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        const performance = avgTime < 2000 ? 'GOOD' : avgTime < 5000 ? 'MODERATE' : 'SLOW';
        
        console.log(`${performance === 'GOOD' ? '✓' : performance === 'MODERATE' ? '⚠' : '✗'} ${test.name}: ${avgTime.toFixed(0)}ms avg, ${maxTime}ms max`);
        
        this.results.performance.push({
          name: test.name,
          avgTime,
          maxTime,
          performance
        });
      }
    }
  }

  generateReport() {
    console.log('\n=== Test Summary Report ===');
    
    const apiPassed = this.results.api.filter(t => t.status === 'PASS').length;
    const frontendPassed = this.results.frontend.filter(t => t.status === 'PASS').length;
    const securityPassed = this.results.security.filter(t => t.status === 'PASS').length;
    const performanceGood = this.results.performance.filter(t => t.performance === 'GOOD').length;
    
    console.log(`API Tests: ${apiPassed}/${this.results.api.length} passed`);
    console.log(`Frontend Tests: ${frontendPassed}/${this.results.frontend.length} passed`);
    console.log(`Security Tests: ${securityPassed}/${this.results.security.length} passed`);
    console.log(`Performance: ${performanceGood}/${this.results.performance.length} good`);
    
    const overallScore = (
      (apiPassed / this.results.api.length) * 0.3 +
      (frontendPassed / this.results.frontend.length) * 0.3 +
      (securityPassed / this.results.security.length) * 0.2 +
      (performanceGood / this.results.performance.length) * 0.2
    ) * 100;
    
    console.log(`\nOverall Application Health: ${overallScore.toFixed(1)}%`);
    
    if (overallScore >= 90) {
      console.log('🟢 Excellent - Application is ready for production');
    } else if (overallScore >= 75) {
      console.log('🟡 Good - Minor issues to address');
    } else if (overallScore >= 60) {
      console.log('🟠 Fair - Several issues need attention');
    } else {
      console.log('🔴 Poor - Significant issues require immediate attention');
    }

    // Write detailed results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      overallScore,
      results: this.results
    };
    
    fs.writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed results saved to test-results.json');
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Application Testing');
    console.log('============================================');
    
    try {
      await this.waitForServer();
      await this.testAPI();
      await this.testFrontend();
      await this.testDatabase();
      await this.testSecurity();
      await this.testResponsiveness();
      this.generateReport();
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      process.exit(1);
    }
  }
}

// Run tests
const runner = new ComprehensiveTestRunner();
runner.runAllTests();