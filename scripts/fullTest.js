require('dotenv').config();
const axios = require('axios');
const testStore = require('../src/services/enhancedTestStore');

const config = {
  baseUrl: 'http://127.0.0.1:3002',
  businessTypes: ['restaurant', 'salon', 'tech', 'fitness']
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testChat(userId, question) {
  try {
    const response = await axios.post(`${config.baseUrl}/chat`, {
      userId,
      message: question
    });
    return { success: true, answer: response.data.answer };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║         AI CHATBOT BACKEND - COMPREHENSIVE TEST          ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

  // Initialize test data for all business types
  log('📊 Initializing test data...', 'yellow');
  const users = testStore.initializeMultipleUsers();
  log('', 'reset');

  // Test each business type
  for (const businessType of config.businessTypes) {
    const userId = `test-user-${businessType}`;
    const profile = testStore.businessProfiles[businessType];
    
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`🏢 Testing: ${profile.name} (${businessType.toUpperCase()})`, 'blue');
    log('='.repeat(60), 'blue');

    // Test questions for this business type
    const questions = [
      "What services do you provide?",
      "What are your hours?",
      "How can I contact you?",
      "What are your prices?"
    ];

    for (const question of questions) {
      log(`\n❓ Question: ${question}`, 'yellow');
      
      const result = await testChat(userId, question);
      
      if (result.success) {
        log('✅ Response received:', 'green');
        log(`   ${result.answer}\n`, 'reset');
      } else {
        log('❌ Error:', 'red');
        log(`   ${result.error}\n`, 'reset');
      }

      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Display stats for this user
    const stats = testStore.getStats(userId);
    log('\n📈 Statistics:', 'cyan');
    log(`   Total Chats: ${stats.totalChats}`, 'reset');
    log(`   Documents: ${stats.documentsCount}`, 'reset');
    log(`   Avg Rating: ${stats.averageRating}/5.0`, 'reset');
  }

  // Summary
  log('\n\n╔══════════════════════════════════════════════════════════╗', 'green');
  log('║                     TEST COMPLETED!                      ║', 'green');
  log('╚══════════════════════════════════════════════════════════╝\n', 'green');

  log('📝 Next Steps:', 'yellow');
  log('   1. Test the widget at: http://localhost:3002/widget/preview', 'reset');
  log('   2. Check chat history endpoint', 'reset');
  log('   3. Test admin features', 'reset');
  log('   4. Deploy to production\n', 'reset');

  log('🔗 Available Test Users:', 'cyan');
  config.businessTypes.forEach(type => {
    log(`   - test-user-${type} (${testStore.businessProfiles[type].name})`, 'reset');
  });
  log('');
}

// Run the test
runComprehensiveTest().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});