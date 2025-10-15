# 🚀 Supabase Database Setup Guide

Your backend is configured and ready! Since the Node.js migration is having DNS issues, we'll set up the database directly in Supabase.

## ✅ Step 1: Run SQL in Supabase Dashboard

1. **Open your Supabase project**: https://dgqllfgzgxzabhouekta.supabase.co
2. Click **SQL Editor** in the left sidebar (icon looks like `</>`)
3. Click **New query**
4. Open the file: `back-end/migrations/supabase-setup.sql`
5. **Copy the entire SQL file** and paste it into the Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for it to complete - you should see "Database setup complete! ✅"

## ✅ Step 2: Verify Tables Were Created

In Supabase Dashboard:
1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `chatbots` - Your chatbot configurations
   - ✅ `documents` - Website content with AI embeddings
   - ✅ `chats` - Conversation sessions
   - ✅ `messages` - Individual chat messages
   - ✅ `training_jobs` - Website training status
   - ✅ `billing` - Subscription tracking
   - ✅ `analytics` - Usage statistics

## ✅ Step 3: Enable Vector Extension

1. Go to **Database** → **Extensions** (left sidebar)
2. Search for `vector`
3. Click **Enable** if not already enabled
4. This is required for AI embeddings to work!

## ✅ Step 4: Start Your Backend

```powershell
cd back-end
npm start
```

Your backend will now connect to the real Supabase database instead of in-memory storage!

## ✅ Step 5: Test Everything

```powershell
# Terminal 1 - Backend
cd back-end
npm start

# Terminal 2 - Frontend
cd front-end/chatbot-dashboard
npm run dev
```

Visit: http://localhost:5173

## 🔧 Your Configuration Summary

**Backend (.env):**
- ✅ PORT: 3002
- ✅ GROQ_API_KEY: Configured
- ✅ DATABASE_URL: Connected to Supabase
- ✅ SUPABASE_URL: https://dgqllfgzgxzabhouekta.supabase.co
- ✅ SUPABASE_ANON_KEY: Configured

**Frontend (.env):**
- ✅ VITE_API_URL: http://localhost:3002

**Database:**
- ✅ Host: db.dgqllfgzgxzabhouekta.supabase.co
- ✅ Database: postgres
- ✅ User: postgres
- ✅ Password: Kosova123

## 🎯 What's Next?

Once the database is set up, you can:
1. **Create chatbots** in the dashboard
2. **Train them** with website URLs
3. **Customize** colors and settings
4. **Get widget code** to embed on websites
5. **View analytics** and chat history

## 🐛 Troubleshooting

**If SQL fails:**
- Make sure you copied the ENTIRE SQL file
- Check that vector extension is enabled
- Try running the SQL in smaller sections

**If backend won't start:**
- Check that all .env variables are set
- Make sure port 3002 is not in use
- Verify DATABASE_URL is correct

**If frontend can't connect:**
- Backend must be running on port 3002
- Check that .env file exists in front-end/chatbot-dashboard/
- Restart the frontend dev server after creating .env

## 📁 Files Updated

- ✅ `back-end/.env` - Database credentials added
- ✅ `front-end/chatbot-dashboard/.env` - API URL configured
- ✅ `back-end/migrations/supabase-setup.sql` - Ready to run in Supabase

---

**Need help?** Check that:
1. Supabase SQL ran successfully
2. Both .env files exist with correct values
3. Both servers are running (backend:3002, frontend:5173)
