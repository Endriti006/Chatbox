/**
 * Setup script to create necessary files and folders
 */
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✅ Created directory: ${dirPath}`, 'green');
  } else {
    log(`⏭️  Directory already exists: ${dirPath}`, 'yellow');
  }
}

function createFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    log(`✅ Created file: ${filePath}`, 'green');
  } else {
    log(`⏭️  File already exists: ${filePath}`, 'yellow');
  }
}

log('\n🔧 Setting up project structure...\n', 'yellow');

// Create directories
createDirectory(path.join(__dirname, '../public'));
createDirectory(path.join(__dirname, '../src/routes'));
createDirectory(path.join(__dirname, '../src/services'));
createDirectory(path.join(__dirname, '../src/controllers'));
createDirectory(path.join(__dirname, '../src/middleware'));

// Copy widget.js to public folder
const widgetCode = `/**
 * AI Chatbot Widget - Embeddable chat bubble
 * This file is served to clients who embed the chatbot
 */

(function() {
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:3002';
  const primaryColor = script.getAttribute('data-color') || '#0084ff';
  const botName = script.getAttribute('data-bot-name') || 'ChatBot';

  // Widget will be injected here
  // See the full widget code in the artifacts
  
  console.log('AI Chatbot Widget loaded for:', chatbotId);
})();
`;

createFile(path.join(__dirname, '../public/widget.js'), widgetCode);

// Create .env.example
const envExample = `# API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Server
PORT=3002
NODE_ENV=development

# Database (Optional - will use in-memory store if not provided)
DATABASE_URL=postgresql://user:password@localhost:5432/chatbot

# Supabase (Optional)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Stripe (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Widget URLs (for production)
WIDGET_URL=https://your-domain.com
API_URL=https://api.your-domain.com
`;

createFile(path.join(__dirname, '../.env.example'), envExample);

// Create README
const readme = `# AI Chatbot Builder - Backend

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Copy \`.env.example\` to \`.env\` and fill in your API keys:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Get your Groq API key (FREE):
   - Go to https://console.groq.com
   - Sign up and create an API key
   - Add it to your \`.env\` file

4. Run the setup script:
\`\`\`bash
node scripts/setup.js
\`\`\`

## Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Testing

Run the comprehensive test:
\`\`\`bash
npm run test:full
\`\`\`

Run the simple chat test:
\`\`\`bash
npm run test:chat
\`\`\`

## API Endpoints

- \`POST /chat\` - Send a message to the chatbot
- \`GET /widget/code\` - Get widget embed code
- \`GET /widget/preview\` - Preview widget
- \`POST /train\` - Train chatbot with website content
- \`GET /admin/chats\` - Get chat history
- \`PUT /admin/settings\` - Update settings

## Widget Usage

After getting your embed code from \`/widget/code\`, paste it into your website:

\`\`\`html
<script 
  src="https://your-domain.com/widget.js"
  data-chatbot-id="your-user-id"
  data-api-url="https://api.your-domain.com"
  data-color="#0084ff"
  data-bot-name="MyBot"
></script>
\`\`\`

## Test Users

The system initializes with 4 test business profiles:
- \`test-user-restaurant\` - Restaurant chatbot
- \`test-user-salon\` - Beauty salon chatbot
- \`test-user-tech\` - Tech company chatbot
- \`test-user-fitness\` - Gym/fitness chatbot

## Project Structure

\`\`\`
src/
├── controllers/     # Request handlers
├── routes/          # Express routes
├── services/        # Business logic
├── middleware/      # Auth & validation
└── index.js         # Entry point

scripts/
├── setup.js         # Project setup
├── testChatbot.js   # Simple test
└── fullTest.js      # Comprehensive test

public/
└── widget.js        # Embeddable widget
\`\`\`
`;

createFile(path.join(__dirname, '../README.md'), readme);

// Update package.json scripts
log('\n📝 Updating package.json scripts...', 'yellow');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.scripts = {
    ...packageJson.scripts,
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test:chat": "node scripts/testChatbot.js",
    "test:full": "node scripts/fullTest.js",
    "setup": "node scripts/setup.js"
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  log('✅ Updated package.json scripts', 'green');
}

log('\n✨ Setup complete!\n', 'green');
log('Next steps:', 'yellow');
log('1. Make sure your .env file has GROQ_API_KEY', 'reset');
log('2. Run: npm run dev', 'reset');
log('3. Run: npm run test:full\n', 'reset');