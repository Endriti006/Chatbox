/**
 * Simple in-memory store for testing without a database
 */
const store = {
  documents: new Map(),
  users: new Map(),
  chats: new Map()
};

// Sample website content for testing
const sampleContent = [
  "Welcome to our company! We provide innovative solutions for businesses.",
  "Our services include web development, mobile apps, and cloud solutions.",
  "Contact us at support@example.com or call 555-0123.",
  "We have over 10 years of experience in software development.",
  "Our team consists of expert developers, designers, and project managers."
];

// Initialize with sample data
function initializeTestData(userId = 'test-user-123') {
  // Store sample documents for the test user
  store.documents.set(userId, sampleContent);
  
  // Store a test user
  store.users.set(userId, {
    id: userId,
    email: 'test@example.com',
    settings: {
      chatbot_name: 'TestBot',
      chatbot_greeting: 'Hello! I\'m a test bot. How can I help you?'
    }
  });

  console.log('Test data initialized with userId:', userId);
  return userId;
}

// Get stored documents for a user
function getDocuments(userId) {
  return store.documents.get(userId) || [];
}

// Store a chat interaction
function storeChat(userId, question, answer) {
  const userChats = store.chats.get(userId) || [];
  userChats.push({
    id: Date.now().toString(),
    question,
    answer,
    timestamp: new Date().toISOString()
  });
  store.chats.set(userId, userChats);
}

// Get chat history for a user
function getChats(userId) {
  return store.chats.get(userId) || [];
}

// Get user data
function getUser(userId) {
  return store.users.get(userId);
}

module.exports = {
  initializeTestData,
  getDocuments,
  storeChat,
  getChats,
  getUser
};