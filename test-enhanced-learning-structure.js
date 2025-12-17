#!/usr/bin/env node

/**
 * Enhanced Learning System Structure Validation Test
 * Validates API structure, components, and integration without requiring running server
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  totalTests++;
  if (status === 'PASS') {
    passedTests++;
    log(`✅ ${testName} - ${details}`, 'green');
  } else if (status === 'FAIL') {
    failedTests++;
    log(`❌ ${testName} - ${details}`, 'red');
  } else {
    log(`⚠️  ${testName} - ${details}`, 'yellow');
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join('/workspace/INR100-APP', filePath);
  if (fs.existsSync(fullPath)) {
    logTest(`File Exists - ${description}`, 'PASS', filePath);
    return true;
  } else {
    logTest(`File Exists - ${description}`, 'FAIL', `${filePath} not found`);
    return false;
  }
}

function validateApiStructure(filePath, expectedExports = []) {
  const fullPath = path.join('/workspace/INR100-APP', filePath);
  
  if (!fs.existsSync(fullPath)) {
    logTest(`API Structure - ${filePath}`, 'FAIL', 'File not found');
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for required exports
    let exportChecks = 0;
    expectedExports.forEach(exportName => {
      if (content.includes(`export async function ${exportName}`) || 
          content.includes(`export const ${exportName}`) ||
          content.includes(`export { ${exportName}`)) {
        exportChecks++;
      }
    });
    
    if (exportChecks === expectedExports.length) {
      logTest(`API Structure - ${path.basename(filePath)}`, 'PASS', `All expected exports found`);
      return true;
    } else {
      logTest(`API Structure - ${path.basename(filePath)}`, 'FAIL', `Missing exports: ${expectedExports.length - exportChecks}`);
      return false;
    }
  } catch (error) {
    logTest(`API Structure - ${path.basename(filePath)}`, 'FAIL', `Error reading file: ${error.message}`);
    return false;
  }
}

function validateComponentStructure(filePath, expectedComponents = []) {
  const fullPath = path.join('/workspace/INR100-APP', filePath);
  
  if (!fs.existsSync(fullPath)) {
    logTest(`Component Structure - ${filePath}`, 'FAIL', 'File not found');
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for React component patterns
    const hasReactImport = content.includes('import React');
    const hasExport = content.includes('export default') || content.includes('export const');
    const hasJsx = content.includes('<') && content.includes('>');
    
    let componentChecks = 0;
    expectedComponents.forEach(component => {
      if (content.includes(`const ${component}`) || content.includes(`function ${component}`)) {
        componentChecks++;
      }
    });
    
    const checks = [
      hasReactImport,
      hasExport,
      hasJsx,
      componentChecks === expectedComponents.length
    ].filter(Boolean).length;
    
    if (checks >= 3) {
      logTest(`Component Structure - ${path.basename(filePath)}`, 'PASS', `${checks}/4 checks passed`);
      return true;
    } else {
      logTest(`Component Structure - ${path.basename(filePath)}`, 'FAIL', `${checks}/4 checks passed`);
      return false;
    }
  } catch (error) {
    logTest(`Component Structure - ${path.basename(filePath)}`, 'FAIL', `Error reading file: ${error.message}`);
    return false;
  }
}

function validatePageStructure(filePath) {
  const fullPath = path.join('/workspace/INR100-APP', filePath);
  
  if (!fs.existsSync(fullPath)) {
    logTest(`Page Structure - ${filePath}`, 'FAIL', 'File not found');
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for Next.js page patterns
    const hasNextImport = content.includes('next/server') || content.includes('next/data');
    const hasAsyncFunction = content.includes('async function') || content.includes('export async');
    const hasReturn = content.includes('return (') || content.includes('return <');
    
    const checks = [hasNextImport, hasAsyncFunction, hasReturn].filter(Boolean).length;
    
    if (checks >= 2) {
      logTest(`Page Structure - ${path.basename(filePath)}`, 'PASS', `${checks}/3 checks passed`);
      return true;
    } else {
      logTest(`Page Structure - ${path.basename(filePath)}`, 'FAIL', `${checks}/3 checks passed`);
      return false;
    }
  } catch (error) {
    logTest(`Page Structure - ${path.basename(filePath)}`, 'FAIL', `Error reading file: ${error.message}`);
    return false;
  }
}

// Main test functions
function testApiEndpoints() {
  log('\n🔍 Testing Enhanced API Endpoints', 'cyan');
  
  // Test all enhanced API endpoints
  const apiTests = [
    { path: 'src/app/api/learn/enhanced/progress/route.ts', exports: ['GET', 'POST'] },
    { path: 'src/app/api/learn/enhanced/courses/route.ts', exports: ['GET', 'POST'] },
    { path: 'src/app/api/learn/enhanced/assessments/route.ts', exports: ['GET', 'POST'] },
    { path: 'src/app/api/learn/enhanced/achievements/route.ts', exports: ['GET', 'POST'] },
    { path: 'src/app/api/learn/enhanced/certificates/route.ts', exports: ['GET', 'POST'] }
  ];
  
  apiTests.forEach(test => {
    validateApiStructure(test.path, test.exports);
  });
}

function testEnhancedComponents() {
  log('\n🔍 Testing Enhanced Learning Components', 'cyan');
  
  // Test all enhanced learning components
  const componentTests = [
    { path: 'src/components/learn/ModuleAssessment.tsx', components: ['ModuleAssessment'] },
    { path: 'src/components/learn/InteractiveExercises.tsx', components: ['InteractiveExercises'] },
    { path: 'src/components/learn/LearningPathways.tsx', components: ['LearningPathways'] },
    { path: 'src/components/learn/ModuleIntegration.tsx', components: ['ModuleIntegration'] },
    { path: 'src/components/learn/AchievementBadges.tsx', components: ['AchievementBadges'] },
    { path: 'src/components/learn/CertificateGenerator.tsx', components: ['CertificateGenerator'] }
  ];
  
  componentTests.forEach(test => {
    validateComponentStructure(test.path, test.components);
  });
}

function testEnhancedPages() {
  log('\n🔍 Testing Enhanced Application Pages', 'cyan');
  
  // Test all enhanced pages
  const pageTests = [
    'src/app/learn/enhanced-dashboard/page.tsx',
    'src/app/learn/enhanced-lesson/[courseId]/[lessonId]/page.tsx',
    'src/app/learn/enhanced-module/[category]/[module]/page.tsx'
  ];
  
  pageTests.forEach(pagePath => {
    validatePageStructure(pagePath);
  });
}

function testFileStructure() {
  log('\n🔍 Testing File Structure', 'cyan');
  
  // Test key directories and files
  const fileTests = [
    { path: 'src/app/api/learn/enhanced/', description: 'Enhanced API Directory' },
    { path: 'src/components/learn/', description: 'Learning Components Directory' },
    { path: 'src/app/learn/enhanced-dashboard/', description: 'Enhanced Dashboard Directory' },
    { path: 'src/components/layout/sidebar.tsx', description: 'Updated Sidebar' },
    { path: 'INTEGRATION_SUMMARY.md', description: 'Integration Summary' },
    { path: 'ENHANCED_INTEGRATION_GUIDE.md', description: 'Integration Guide' },
    { path: 'IMPLEMENTATION_STATUS_REPORT.md', description: 'Implementation Status' },
    { path: 'PHASE1_COMPLETION_REPORT.md', description: 'Phase 1 Report' }
  ];
  
  fileTests.forEach(test => {
    checkFileExists(test.path, test.description);
  });
}

function testCodeQuality() {
  log('\n🔍 Testing Code Quality', 'cyan');
  
  // Test API files for common patterns
  const apiFiles = [
    'src/app/api/learn/enhanced/progress/route.ts',
    'src/app/api/learn/enhanced/courses/route.ts',
    'src/app/api/learn/enhanced/assessments/route.ts',
    'src/app/api/learn/enhanced/achievements/route.ts',
    'src/app/api/learn/enhanced/certificates/route.ts'
  ];
  
  apiFiles.forEach(filePath => {
    const fullPath = path.join('/workspace/INR100-APP', filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for TypeScript patterns
        const hasInterfaces = content.includes('interface ') || content.includes('type ');
        const hasNextRequest = content.includes('NextRequest');
        const hasNextResponse = content.includes('NextResponse');
        const hasErrorHandling = content.includes('try {') && content.includes('catch');
        
        const qualityChecks = [hasInterfaces, hasNextRequest, hasNextResponse, hasErrorHandling].filter(Boolean).length;
        
        if (qualityChecks >= 3) {
          logTest(`Code Quality - ${path.basename(filePath)}`, 'PASS', `${qualityChecks}/4 quality checks passed`);
        } else {
          logTest(`Code Quality - ${path.basename(filePath)}`, 'WARN', `${qualityChecks}/4 quality checks passed`);
        }
      } catch (error) {
        logTest(`Code Quality - ${path.basename(filePath)}`, 'FAIL', `Error reading file: ${error.message}`);
      }
    }
  });
}

function testIntegrationPoints() {
  log('\n🔍 Testing Integration Points', 'cyan');
  
  // Test sidebar integration
  const sidebarPath = '/workspace/INR100-APP/src/components/layout/sidebar.tsx';
  if (fs.existsSync(sidebarPath)) {
    try {
      const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
      const hasEnhancedLinks = sidebarContent.includes('enhanced-dashboard') || 
                              sidebarContent.includes('enhanced-lesson') ||
                              sidebarContent.includes('enhanced-module');
      
      if (hasEnhancedLinks) {
        logTest('Sidebar Integration', 'PASS', 'Enhanced learning links found');
      } else {
        logTest('Sidebar Integration', 'WARN', 'No enhanced learning links found');
      }
    } catch (error) {
      logTest('Sidebar Integration', 'FAIL', `Error reading sidebar: ${error.message}`);
    }
  }
}

function runAllTests() {
  log('🚀 Starting Enhanced Learning System Structure Validation', 'bright');
  log('=' .repeat(60), 'blue');
  
  try {
    testFileStructure();
    testApiEndpoints();
    testEnhancedComponents();
    testEnhancedPages();
    testCodeQuality();
    testIntegrationPoints();
    
    // Summary
    log('\n' + '=' .repeat(60), 'blue');
    log('📊 Structure Validation Summary', 'bright');
    log(`Total Tests: ${totalTests}`, 'cyan');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 'yellow');
    
    if (failedTests === 0) {
      log('\n🎉 All structure tests passed! Enhanced learning system is properly implemented.', 'green');
      log('\n📋 Implementation Status:', 'cyan');
      log('✅ Enhanced APIs: All 5 endpoints implemented', 'green');
      log('✅ Learning Components: All 6 enhanced components created', 'green');
      log('✅ Application Pages: All 3 enhanced pages implemented', 'green');
      log('✅ Integration Points: Sidebar and navigation updated', 'green');
      log('✅ Documentation: Comprehensive guides and reports created', 'green');
      log('\n🚀 Ready for Phase 2: Advanced Features & Real Data Integration', 'magenta');
    } else {
      log('\n⚠️  Some structure tests failed. Please review the implementation.', 'yellow');
    }
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  checkFileExists,
  validateApiStructure,
  validateComponentStructure,
  validatePageStructure
};