# Database Configuration Setup Guide

## Current Status Analysis

### ✅ What's Working:
1. **Backend**: Running on port **3002** (not 3000!)
2. **Frontend**: Configured to connect to port 3000 (MISMATCH!)
3. **Database**: Using in-memory test store (no real database connected)

### ❌ Issues Found:

1. **Port Mismatch**: 
   - Backend runs on port `3002` (see `.env`: PORT=3002)
   - Frontend expects port `3000` (default in api.js)
   - **Fix**: Created `.env` file with correct port

2. **No Database Connected**:
   - Backend has no `DATABASE_URL` configured
   - Currently using in-memory test store
   - Data is lost when server restarts

3. **Missing Environment Variables**:
   - No Supabase credentials
   - No OpenAI API key (for embeddings)
   - No Stripe keys (for payments)

---

## 🗄️ Database Setup Options

### Option 1: PostgreSQL Locally (Recommended for Development)

#### Install PostgreSQL:

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password!

**Or use Docker:**
\`\`\`bash
docker run --name chatbot-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres
\`\`\`

#### Create Database:
\`\`\`bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chatbot_db;

# Exit
\\q
\`\`\`

#### Update Backend .env:
\`\`\`properties
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/chatbot_db

# Port
PORT=3002

# AI API Keys
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-key-here  # For embeddings

# Supabase (for auth)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Environment
NODE_ENV=development
\`\`\`

#### Run Migrations:
\`\`\`bash
cd back-end
npm run migrate
\`\`\`

---

### Option 2: Supabase (Free Cloud Database)

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Sign up (free)
   - Create new project
   - Choose a name and password
   - Wait ~2 minutes for setup

2. **Get Connection String**:
   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace [YOUR-PASSWORD] with your database password

3. **Update Backend .env**:
```properties
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
PORT=3002
GROQ_API_KEY=your-groq-api-key-here

# Get these from Supabase Project Settings → API
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

4. **Run Migrations**:
\`\`\`bash
cd back-end
npm run migrate
\`\`\`

---

### Option 3: Quick Test (In-Memory Store)

If you want to test without database setup, the backend already works with in-memory storage!

Just make sure ports match:

**Backend (.env):**
\`\`\`properties
PORT=3002
GROQ_API_KEY=your-groq-api-key-here
\`\`\`

**Frontend (.env):**
\`\`\`properties
VITE_API_URL=http://localhost:3002
\`\`\`

---

## 🔧 Step-by-Step Setup

### 1. Fix Port Mismatch (ALREADY DONE!)

I've created `front-end/chatbot-dashboard/.env` with the correct port:
\`\`\`
VITE_API_URL=http://localhost:3002
\`\`\`

### 2. Choose Database Option

Pick one of the three options above.

### 3. Update Backend .env

Edit `back-end/.env` with your database credentials.

### 4. Run Migrations (if using real database)

\`\`\`bash
cd back-end
npm run migrate
\`\`\`

This will create all necessary tables:
- `profiles` - User profiles
- `documents` - Website content with embeddings
- `chats` - Chat history
- `chatbots` - Multiple chatbot configurations
- `training_jobs` - Training status
- And more...

### 5. Restart Both Servers

**Backend:**
\`\`\`bash
cd back-end
npm start
\`\`\`

**Frontend:**
\`\`\`bash
cd front-end/chatbot-dashboard
npm run dev
\`\`\`

---

## 📊 Database Schema

Your migration file `001_initial_schema.sql` includes:

\`\`\`sql
✅ profiles - User accounts and settings
✅ documents - Training data with vector embeddings
✅ chats - Conversation history
✅ chatbots - Multiple chatbot configs per user
✅ training_jobs - Track training status
✅ billing - Subscription info
✅ analytics - Usage statistics
\`\`\`

---

## 🧪 Testing the Connection

### 1. Test Backend Health:
\`\`\`bash
curl http://localhost:3002/health
\`\`\`

Should return:
\`\`\`json
{"status":"ok","timestamp":"...","environment":"development"}
\`\`\`

### 2. Test Frontend Connection:
- Open http://localhost:5173
- Open browser console (F12)
- Check for any API errors
- Try creating a chatbot

### 3. Check Database:
If using PostgreSQL:
\`\`\`bash
psql -U postgres -d chatbot_db
\\dt  # List tables
SELECT * FROM profiles;
\`\`\`

---

## 🚀 Quick Start (Easiest Path)

### Without Real Database (For Testing):

1. **Backend** - Keep current .env:
\`\`\`properties
PORT=3002
GROQ_API_KEY=your-groq-api-key-here
\`\`\`

2. **Frontend** - Use the .env I created:
\`\`\`properties
VITE_API_URL=http://localhost:3002
\`\`\`

3. **Start both**:
\`\`\`bash
# Terminal 1
cd back-end
npm start

# Terminal 2  
cd front-end/chatbot-dashboard
npm run dev
\`\`\`

4. **Visit**: http://localhost:5173

This will work with in-memory storage - perfect for testing!

---

## 📝 Summary

**FIXED**: ✅ Port mismatch (created frontend .env with port 3002)

**TODO**: 
- [ ] Choose database option (local PostgreSQL, Supabase, or in-memory)
- [ ] Update backend .env with database credentials
- [ ] Run migrations (if using real database)
- [ ] Add OpenAI API key (for embeddings)
- [ ] Add Stripe keys (for payments)
- [ ] Add Supabase keys (for auth)

**Current State**: 
- Backend works with in-memory storage
- Frontend now points to correct port
- Can test immediately without database!

---

## Need Help?

If you choose a specific database option, let me know and I'll help you with the exact setup steps!
