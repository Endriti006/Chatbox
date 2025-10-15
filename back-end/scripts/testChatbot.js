require('dotenv').config();
const axios = require('axios');
const testStore = require('../src/services/testStore');

// Test configuration
const config = {
  baseUrl: 'http://127.0.0.1:3002', // Change this to match your PORT in .env
  testMode: true,
  userId: 'test-user-123',
  testQuestions: [
    "What services do you provide?",
    "How can I contact you?",
    "How much experience do you have?",
    "Tell me about your team",
    "What's your email address?"
  ]
};

async function runChatbotTest() {
  console.log('Starting chatbot test...\n');

  // Initialize test data
  testStore.initializeTestData(config.userId);
  
  // Test each question
  for (const question of config.testQuestions) {
    console.log('🤔 Question:', question);
    
    try {
      console.log('Sending request to:', `${config.baseUrl}/chat`);
      // Make request to chat endpoint
      const response = await axios.post(`${config.baseUrl}/chat`, {
        userId: config.userId,
        message: question,
        test: true  // Signal that this is a test request
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true'
        }
      });

      console.log('🤖 Answer:', response.data.answer);
      console.log('-------------------\n');
    } catch (error) {
      console.error('❌ Error testing question:', error.message);
      if (error.response?.data) {
        console.error('Server response:', error.response.data);
      }
      console.log('-------------------\n');
    }

    // Small delay between questions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Test completed!');
}

// Run the test
runChatbotTest().catch(console.error);