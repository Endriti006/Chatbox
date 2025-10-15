/**
 * Enhanced in-memory store for testing with realistic data
 */
const store = {
  documents: new Map(),
  users: new Map(),
  chats: new Map(),
  settings: new Map()
};

// Sample business profiles for testing
const businessProfiles = {
  'restaurant': {
    name: 'Tasty Bites Restaurant',
    content: [
      "Welcome to Tasty Bites! We're a family-owned restaurant serving delicious Italian cuisine since 2010.",
      "Our menu features authentic pasta dishes, wood-fired pizzas, and fresh seafood.",
      "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, Sunday 12pm-9pm.",
      "Reservations can be made by calling (555) 123-4567 or through our website.",
      "We offer dine-in, takeout, and delivery services within 5 miles.",
      "Our chef Marco has over 20 years of experience in Italian cuisine.",
      "We source ingredients locally from farmers markets and sustainable suppliers.",
      "Private dining room available for parties of 15-30 people.",
      "Happy hour specials every weekday 4-6pm with half-price appetizers.",
      "Catering services available for events with a 48-hour notice."
    ],
    settings: {
      botName: 'Tasty Bot',
      color: '#e74c3c',
      greeting: 'Buongiorno! Welcome to Tasty Bites! How can I help you today?'
    }
  },
  'salon': {
    name: 'Beauty Haven Salon',
    content: [
      "Beauty Haven Salon - Your destination for premium hair and beauty services.",
      "Services include haircuts, coloring, highlights, balayage, and keratin treatments.",
      "We also offer manicures, pedicures, facials, and makeup services.",
      "Our stylists are certified professionals with ongoing education in latest trends.",
      "Prices: Haircut $45-$75, Color $80-$150, Highlights from $120, Manicure $30.",
      "We use organic and cruelty-free products from premium brands.",
      "Open Tuesday-Saturday 9am-7pm, closed Sunday and Monday.",
      "Located at 123 Main Street, downtown area with free parking.",
      "First-time clients receive 20% off their first service.",
      "Book appointments online or call (555) 234-5678."
    ],
    settings: {
      botName: 'Beauty Assistant',
      color: '#e91e63',
      greeting: '💇‍♀️ Welcome to Beauty Haven! How can we make you look fabulous today?'
    }
  },
  'tech': {
    name: 'TechSolutions Inc',
    content: [
      "TechSolutions Inc - Professional IT services and software development.",
      "We specialize in custom software development, mobile apps, and web applications.",
      "Services include: cloud migration, cybersecurity, IT consulting, and DevOps.",
      "Our team has 15+ years of experience working with Fortune 500 companies.",
      "Technology stack: React, Node.js, Python, AWS, Azure, Docker, Kubernetes.",
      "Free consultation for new clients to discuss your project needs.",
      "Flexible engagement models: fixed price, time & materials, dedicated team.",
      "Case studies available showing 40% average cost reduction for clients.",
      "24/7 support available for enterprise clients.",
      "Contact: sales@techsolutions.com or call (555) 345-6789."
    ],
    settings: {
      botName: 'Tech Assistant',
      color: '#2196f3',
      greeting: '👋 Hi! I\'m here to help with your tech needs. What can I do for you?'
    }
  },
  'fitness': {
    name: 'FitLife Gym',
    content: [
      "FitLife Gym - Transform your body and mind with us!",
      "Membership options: Basic $29/month, Premium $49/month, Elite $79/month.",
      "Facilities include: weight room, cardio area, group fitness studio, pool, sauna.",
      "Classes offered: yoga, spin, HIIT, boxing, pilates, zumba, and more.",
      "Personal training available starting at $50 per session.",
      "Open 24/7 for Premium and Elite members, 5am-11pm for Basic members.",
      "Free trial day available for new members - no credit card required.",
      "Certified trainers with specializations in weight loss, bodybuilding, sports performance.",
      "Nutrition counseling and meal planning services available.",
      "Join now and get 2 months free with annual membership!"
    ],
    settings: {
      botName: 'Fit Bot',
      color: '#4caf50',
      greeting: '💪 Welcome to FitLife! Ready to crush your fitness goals?'
    }
  }
};

// Sample chat interactions for testing
const sampleChats = {
  'restaurant': [
    { q: "What are your hours?", a: "We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm." },
    { q: "Do you deliver?", a: "Yes! We offer delivery within 5 miles. You can order through our website or call us." },
    { q: "Can I make a reservation?", a: "Absolutely! Call us at (555) 123-4567 or book online through our website." }
  ],
  'salon': [
    { q: "How much is a haircut?", a: "Haircuts range from $45-$75 depending on length and complexity." },
    { q: "Do you do color?", a: "Yes! We offer full color ($80-$150), highlights (from $120), and balayage services." },
    { q: "What are your hours?", a: "We're open Tuesday-Saturday from 9am-7pm. Closed Sunday and Monday." }
  ],
  'tech': [
    { q: "What services do you offer?", a: "We provide custom software development, mobile apps, web applications, cloud migration, and IT consulting." },
    { q: "How much do you charge?", a: "We offer flexible pricing: fixed price projects, hourly rates, or dedicated teams. Contact us for a free consultation!" },
    { q: "What technologies do you use?", a: "We work with React, Node.js, Python, AWS, Azure, Docker, Kubernetes, and more." }
  ],
  'fitness': [
    { q: "How much is membership?", a: "We have three tiers: Basic $29/month, Premium $49/month, and Elite $79/month." },
    { q: "Do you have personal trainers?", a: "Yes! Personal training starts at $50 per session with certified trainers." },
    { q: "Can I try it first?", a: "Absolutely! We offer a free trial day - no credit card required. Come check us out!" }
  ]
};

/**
 * Initialize test data with a specific business profile
 */
function initializeTestData(userId = 'test-user-123', businessType = 'tech') {
  const profile = businessProfiles[businessType] || businessProfiles.tech;
  
  // Store documents
  store.documents.set(userId, profile.content);
  
  // Store user profile
  store.users.set(userId, {
    id: userId,
    email: `test@${businessType}.com`,
    businessName: profile.name,
    businessType: businessType,
    ...profile.settings
  });

  // Store settings
  store.settings.set(userId, {
    userId,
    chatModel: 'groq',
    maxHistory: 10,
    temperature: 0.7,
    ...profile.settings
  });

  // Store sample chats
  const userChats = (sampleChats[businessType] || []).map((chat, i) => ({
    id: `chat-${Date.now()}-${i}`,
    question: chat.q,
    answer: chat.a,
    timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
    rating: Math.floor(Math.random() * 2) + 4 // 4 or 5 stars
  }));
  store.chats.set(userId, userChats);

  console.log(`✅ Test data initialized for ${profile.name} (${businessType})`);
  console.log(`📊 Loaded ${profile.content.length} documents and ${userChats.length} sample chats`);
  
  return userId;
}

/**
 * Initialize multiple test users with different business types
 */
function initializeMultipleUsers() {
  const users = [];
  Object.keys(businessProfiles).forEach((type, index) => {
    const userId = `test-user-${type}`;
    initializeTestData(userId, type);
    users.push(userId);
  });
  console.log(`\n🎉 Initialized ${users.length} test users:`, users);
  return users;
}

// Get stored documents for a user
function getDocuments(userId) {
  return store.documents.get(userId) || [];
}

// Store a chat interaction
function storeChat(userId, question, answer) {
  const userChats = store.chats.get(userId) || [];
  userChats.push({
    id: `chat-${Date.now()}`,
    question,
    answer,
    timestamp: new Date().toISOString(),
    rating: null
  });
  store.chats.set(userId, userChats);
}

// Get chat history for a user
function getChats(userId, limit = 50) {
  const chats = store.chats.get(userId) || [];
  return chats.slice(-limit).reverse(); // Most recent first
}

// Get user data
function getUser(userId) {
  return store.users.get(userId);
}

// Get user settings
function getSettings(userId) {
  return store.settings.get(userId) || {
    chatModel: 'groq',
    maxHistory: 10,
    temperature: 0.7
  };
}

// Update user settings
function updateSettings(userId, updates) {
  const current = store.settings.get(userId) || {};
  const updated = { ...current, ...updates };
  store.settings.set(userId, updated);
  return updated;
}

// Get stats for a user
function getStats(userId) {
  const chats = store.chats.get(userId) || [];
  const totalChats = chats.length;
  const ratedChats = chats.filter(c => c.rating !== null);
  const avgRating = ratedChats.length > 0
    ? ratedChats.reduce((sum, c) => sum + c.rating, 0) / ratedChats.length
    : 0;

  return {
    totalChats,
    ratedChats: ratedChats.length,
    averageRating: avgRating.toFixed(2),
    documentsCount: (store.documents.get(userId) || []).length
  };
}

module.exports = {
  initializeTestData,
  initializeMultipleUsers,
  getDocuments,
  storeChat,
  getChats,
  getUser,
  getSettings,
  updateSettings,
  getStats,
  businessProfiles
};