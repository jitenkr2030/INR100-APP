// Simple test script to verify lesson system
// Run this in browser console or as a simple test

async function testLessonSystem() {
  console.log('🧪 Testing INR100 Lesson System...');
  
  // Test 1: Check if course service loads
  try {
    const courseResponse = await fetch('/api/learn');
    const courseData = await courseResponse.json();
    console.log('✅ Course API working:', courseData.success);
  } catch (error) {
    console.log('❌ Course API failed:', error.message);
  }
  
  // Test 2: Check if lesson list loads
  try {
    const lessonsResponse = await fetch('/api/learn/basics/money-basics/lessons');
    const lessonsData = await lessonsResponse.json();
    console.log('✅ Lessons API working:', lessonsData.success);
    if (lessonsData.success) {
      console.log('📚 Found lessons:', lessonsData.data.lessons.length);
    }
  } catch (error) {
    console.log('❌ Lessons API failed:', error.message);
  }
  
  // Test 3: Check if individual lesson loads
  try {
    const lessonResponse = await fetch('/api/learn/basics/money-basics/lesson/lesson-001-What-is-Money-and-How-it-Works');
    const lessonData = await lessonResponse.json();
    console.log('✅ Individual lesson API working:', lessonData.success);
    if (lessonData.success) {
      console.log('📖 Lesson title:', lessonData.data.title);
    }
  } catch (error) {
    console.log('❌ Individual lesson API failed:', error.message);
  }
  
  // Test 4: Check progress API
  try {
    const progressResponse = await fetch('/api/learn/progress?category=basics&module=money-basics');
    const progressData = await progressResponse.json();
    console.log('✅ Progress API working:', progressData.success);
    if (progressData.success) {
      console.log('📊 Progress data:', progressData.data);
    }
  } catch (error) {
    console.log('❌ Progress API failed:', error.message);
  }
  
  console.log('🎉 Lesson system test completed!');
}

// Run the test
testLessonSystem();