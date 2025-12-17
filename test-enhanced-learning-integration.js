#!/usr/bin/env node

/**
 * Enhanced Learning System API Integration Test
 * Tests all enhanced learning APIs and dashboard integration
 */

const API_BASE_URL = 'http://localhost:3000/api/learn/enhanced';

// Mock user data for testing
const testUserId = 'test-user-enhanced';
const demoUserId = 'demo-user-id';

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

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test Functions
async function testProgressAPI() {
  log('\n🔍 Testing Enhanced Progress API', 'cyan');
  
  // Test GET progress
  const getResult = await makeRequest(`/progress?userId=${demoUserId}&courseId=banking-insurance`);
  if (getResult.ok && getResult.data.success) {
    logTest('GET Progress - Basic', 'PASS', `Retrieved ${getResult.data.data.progress.length} progress records`);
  } else {
    logTest('GET Progress - Basic', 'FAIL', getResult.error || 'Failed to fetch progress');
  }
  
  // Test POST progress
  const postData = {
    userId: testUserId,
    courseId: 'banking-insurance',
    lessonId: 'lesson-1',
    moduleId: 17,
    action: 'complete_lesson',
    timeSpent: 30,
    interactiveFeatures: {
      calculatorUsed: true,
      caseStudyCompleted: false,
      assessmentTaken: false,
      exerciseCompleted: true
    },
    score: 85,
    percentage: 85
  };
  
  const postResult = await makeRequest('/progress', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
  
  if (postResult.ok && postResult.data.success) {
    logTest('POST Progress - Lesson Completion', 'PASS', `Earned ${postResult.data.data.xpEarned} XP`);
  } else {
    logTest('POST Progress - Lesson Completion', 'FAIL', postResult.error || 'Failed to post progress');
  }
}

async function testCoursesAPI() {
  log('\n🔍 Testing Enhanced Courses API', 'cyan');
  
  // Test GET courses
  const getResult = await makeRequest(`/courses?userId=${demoUserId}`);
  if (getResult.ok && getResult.data.success) {
    const coursesCount = getResult.data.data.courses.length;
    const enrolledCount = getResult.data.data.courses.filter(c => c.isEnrolled).length;
    logTest('GET Courses - Basic', 'PASS', `${coursesCount} courses, ${enrolledCount} enrolled`);
  } else {
    logTest('GET Courses - Basic', 'FAIL', getResult.error || 'Failed to fetch courses');
  }
  
  // Test GET courses by category
  const categoryResult = await makeRequest(`/courses?userId=${demoUserId}&category=foundations`);
  if (categoryResult.ok && categoryResult.data.success) {
    logTest('GET Courses - By Category', 'PASS', `Found ${categoryResult.data.data.courses.length} foundation courses`);
  } else {
    logTest('GET Courses - By Category', 'FAIL', categoryResult.error || 'Failed to fetch filtered courses');
  }
  
  // Test POST enrollment
  const enrollResult = await makeRequest('/courses', {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      courseId: 'module-19',
      action: 'enroll'
    })
  });
  
  if (enrollResult.ok && enrollResult.data.success) {
    logTest('POST Course Enrollment', 'PASS', 'Successfully enrolled in course');
  } else {
    logTest('POST Course Enrollment', 'FAIL', enrollResult.error || 'Failed to enroll');
  }
}

async function testAssessmentsAPI() {
  log('\n🔍 Testing Enhanced Assessments API', 'cyan');
  
  // Test GET all assessments
  const getAllResult = await makeRequest('/assessments');
  if (getAllResult.ok && getAllResult.data.success) {
    logTest('GET Assessments - All', 'PASS', `${getAllResult.data.data.assessments.length} assessments available`);
  } else {
    logTest('GET Assessments - All', 'FAIL', getAllResult.error || 'Failed to fetch assessments');
  }
  
  // Test GET specific assessment
  const getSpecificResult = await makeRequest('/assessments?moduleId=17');
  if (getSpecificResult.ok && getSpecificResult.data.success) {
    const assessment = getSpecificResult.data.data.assessment;
    logTest('GET Assessment - Module 17', 'PASS', `${assessment.questions.length} questions, ${assessment.timeLimit}min time limit`);
  } else {
    logTest('GET Assessment - Module 17', 'FAIL', getSpecificResult.error || 'Failed to fetch module 17 assessment');
  }
  
  // Test POST assessment submission
  const mockAnswers = {
    'q1': 'Protection against financial loss due to death',
    'q2': 75000,
    'q3': 'Term Life Insurance + Critical Illness Rider',
    'q4': 'True',
    'q5': '150000'
  };
  
  const submitResult = await makeRequest('/assessments', {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      assessmentId: 'assessment-module-17',
      answers: mockAnswers,
      timeSpent: 1800, // 30 minutes
      startTime: new Date(Date.now() - 1800000).toISOString()
    })
  });
  
  if (submitResult.ok && submitResult.data.success) {
    const result = submitResult.data.data.result;
    logTest('POST Assessment Submission', 'PASS', `Score: ${result.percentage}%, XP: ${result.xpEarned}, Passed: ${result.passed}`);
  } else {
    logTest('POST Assessment Submission', 'FAIL', submitResult.error || 'Failed to submit assessment');
  }
}

async function testAchievementsAPI() {
  log('\n🔍 Testing Enhanced Achievements API', 'cyan');
  
  // Test GET achievements
  const getResult = await makeRequest(`/achievements?userId=${demoUserId}&includeProgress=true`);
  if (getResult.ok && getResult.data.success) {
    const achievements = getResult.data.data.achievements;
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    logTest('GET Achievements - With Progress', 'PASS', `${unlockedCount}/${totalCount} achievements unlocked`);
  } else {
    logTest('GET Achievements - With Progress', 'FAIL', getResult.error || 'Failed to fetch achievements');
  }
  
  // Test GET achievements by category
  const categoryResult = await makeRequest(`/achievements?userId=${demoUserId}&category=learning`);
  if (categoryResult.ok && categoryResult.data.success) {
    const learningAchievements = categoryResult.data.data.achievements.length;
    logTest('GET Achievements - Learning Category', 'PASS', `${learningAchievements} learning achievements`);
  } else {
    logTest('GET Achievements - Learning Category', 'FAIL', categoryResult.error || 'Failed to fetch category achievements');
  }
  
  // Test POST unlock achievement
  const unlockResult = await makeRequest('/achievements', {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      action: 'unlock',
      achievementId: 'first_lesson'
    })
  });
  
  if (unlockResult.ok && unlockResult.data.success) {
    logTest('POST Achievement Unlock', 'PASS', `Unlocked: ${unlockResult.data.data.achievement.title}`);
  } else {
    logTest('POST Achievement Unlock', 'FAIL', unlockResult.error || 'Failed to unlock achievement');
  }
}

async function testCertificatesAPI() {
  log('\n🔍 Testing Enhanced Certificates API', 'cyan');
  
  // Test GET certificates
  const getResult = await makeRequest(`/certificates?userId=${demoUserId}`);
  if (getResult.ok && getResult.data.success) {
    const certificates = getResult.data.data.certificates;
    const availableCount = getResult.data.data.availableCertificates.length;
    logTest('GET Certificates - User Portfolio', 'PASS', `${certificates.length} certificates owned, ${availableCount} available`);
  } else {
    logTest('GET Certificates - User Portfolio', 'FAIL', getResult.error || 'Failed to fetch certificates');
  }
  
  // Test GET certificate by ID
  if (mockCertificates.length > 0) {
    const certificateId = mockCertificates[0].id;
    const getCertResult = await makeRequest(`/certificates/${certificateId}`);
    if (getCertResult.ok && getCertResult.data.success) {
      logTest('GET Certificate Details', 'PASS', `Retrieved: ${getCertResult.data.data.certificate.title}`);
    } else {
      logTest('GET Certificate Details', 'FAIL', getCertResult.error || 'Failed to fetch certificate details');
    }
  }
  
  // Test POST certificate generation
  const generateResult = await makeRequest('/certificates', {
    method: 'POST',
    body: JSON.stringify({
      userId: testUserId,
      type: 'module_completion',
      moduleId: 18,
      metadata: {
        timeSpent: 240,
        featuresUsed: ['calculators', 'case_studies'],
        achievements: ['Module Master'],
        level: 3,
        xp: 1500
      }
    })
  });
  
  if (generateResult.ok && generateResult.data.success) {
    const certificate = generateResult.data.data.certificate;
    logTest('POST Certificate Generation', 'PASS', `Generated: ${certificate.title} (${certificate.verificationCode})`);
  } else {
    logTest('POST Certificate Generation', 'FAIL', generateResult.error || 'Failed to generate certificate');
  }
}

async function testDashboardIntegration() {
  log('\n🔍 Testing Enhanced Dashboard Integration', 'cyan');
  
  // Test dashboard page access
  try {
    const dashboardResponse = await fetch('http://localhost:3000/learn/enhanced-dashboard');
    const dashboardStatus = dashboardResponse.status;
    
    if (dashboardStatus === 200) {
      logTest('Enhanced Dashboard Page', 'PASS', 'Dashboard page loads successfully');
    } else {
      logTest('Enhanced Dashboard Page', 'FAIL', `HTTP ${dashboardStatus}`);
    }
  } catch (error) {
    logTest('Enhanced Dashboard Page', 'FAIL', `Connection error: ${error.message}`);
  }
  
  // Test enhanced lesson page
  try {
    const lessonResponse = await fetch('http://localhost:3000/learn/enhanced-lesson/banking-insurance/lesson-1');
    const lessonStatus = lessonResponse.status;
    
    if (lessonStatus === 200) {
      logTest('Enhanced Lesson Page', 'PASS', 'Lesson page loads successfully');
    } else {
      logTest('Enhanced Lesson Page', 'FAIL', `HTTP ${lessonStatus}`);
    }
  } catch (error) {
    logTest('Enhanced Lesson Page', 'FAIL', `Connection error: ${error.message}`);
  }
  
  // Test enhanced module page
  try {
    const moduleResponse = await fetch('http://localhost:3000/learn/enhanced-module/banking-insurance');
    const moduleStatus = moduleResponse.status;
    
    if (moduleStatus === 200) {
      logTest('Enhanced Module Page', 'PASS', 'Module page loads successfully');
    } else {
      logTest('Enhanced Module Page', 'FAIL', `HTTP ${moduleStatus}`);
    }
  } catch (error) {
    logTest('Enhanced Module Page', 'FAIL', `Connection error: ${error.message}`);
  }
}

async function testPerformanceMetrics() {
  log('\n🔍 Testing Performance Metrics', 'cyan');
  
  const endpoints = [
    '/progress',
    '/courses',
    '/assessments',
    '/achievements',
    '/certificates'
  ];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    const result = await makeRequest(`${endpoint}?userId=${demoUserId}`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (result.ok) {
      logTest(`Performance - ${endpoint}`, 'PASS', `${responseTime}ms response time`);
    } else {
      logTest(`Performance - ${endpoint}`, 'FAIL', `${responseTime}ms (failed)`);
    }
  }
}

async function runAllTests() {
  log('🚀 Starting Enhanced Learning System API Integration Tests', 'bright');
  log('=' .repeat(60), 'blue');
  
  try {
    await testProgressAPI();
    await testCoursesAPI();
    await testAssessmentsAPI();
    await testAchievementsAPI();
    await testCertificatesAPI();
    await testDashboardIntegration();
    await testPerformanceMetrics();
    
    // Summary
    log('\n' + '=' .repeat(60), 'blue');
    log('📊 Test Summary', 'bright');
    log(`Total Tests: ${totalTests}`, 'cyan');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${failedTests}`, 'red');
    log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 'yellow');
    
    if (failedTests === 0) {
      log('\n🎉 All tests passed! Enhanced learning system is ready for deployment.', 'green');
    } else {
      log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
    }
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
  }
}

// Mock data for certificates API testing
const mockCertificates = [
  {
    id: 'cert-001',
    userId: demoUserId,
    type: 'module_completion',
    title: 'Banking & Insurance Fundamentals',
    issuedAt: '2024-12-15T10:30:00Z',
    verificationCode: 'BIF2024-001'
  }
];

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  makeRequest,
  testProgressAPI,
  testCoursesAPI,
  testAssessmentsAPI,
  testAchievementsAPI,
  testCertificatesAPI,
  testDashboardIntegration,
  testPerformanceMetrics
};