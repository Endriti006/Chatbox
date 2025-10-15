# 🚀 Deploy Your Backend to Render.com (FREE)

## ✅ Why Render.com?
- **100% FREE** forever (no trial, no credit card required)
- Super easy setup (5 minutes)
- Automatic HTTPS
- Auto-deploys when you push to GitHub

---

## 📋 Step-by-Step Guide

### **Step 1: Prepare Your Code** ✅ (Already Done!)

I've already created `render.yaml` for you - this tells Render how to deploy your backend.

---

### **Step 2: Push to GitHub**

Your code needs to be on GitHub for Render to access it.

#### **Option A: If You Already Have a GitHub Repo**

Just push your latest changes:
```bash
cd "C:\Users\endri\Desktop\Chatbot"
git add .
git commit -m "Add Render deployment config"
git push origin feat/dev
```

#### **Option B: If You DON'T Have a GitHub Repo Yet**

1. Go to https://github.com/new
2. Create a new repository (name: `chatbot-backend`)
3. Run these commands:

```bash
cd "C:\Users\endri\Desktop\Chatbot"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Chatbot backend"

# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/chatbot-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### **Step 3: Deploy to Render**

#### **3.1 - Sign Up / Log In**
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest way)
4. Authorize Render to access your GitHub

#### **3.2 - Create New Web Service**
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - If you see your repo: **Select it**
   - If not: Click **"Configure account"** → Grant access to your repo

#### **3.3 - Configure Service**
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `chatbot-backend` (or any name you want) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `feat/dev` (or `main` if you pushed there) |
| **Root Directory** | `back-end` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | **Free** ⭐ |

#### **3.4 - Add Environment Variables** ⚙️

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**.

Add each of these (copy the actual values from your `back-end/.env` file):

```
NODE_ENV = production
PORT = 10000

MISTRAL_API_KEY = <copy from your .env file>
GROQ_API_KEY = <copy from your .env file>

DATABASE_URL = <copy from your .env file>

SUPABASE_URL = <copy from your .env file>
SUPABASE_ANON_KEY = <copy from your .env file>
```

**⚠️ Security Note:** Never commit API keys to GitHub! Always use environment variables.

**Important:** Click the little 🔒 lock icon next to sensitive keys (MISTRAL_API_KEY, GROQ_API_KEY, DATABASE_URL)

#### **3.5 - Deploy!** 🚀
1. Click **"Create Web Service"** button
2. Wait 3-5 minutes while Render builds and deploys
3. You'll see logs in real-time

---

### **Step 4: Get Your Production URL** 🎉

Once deployed, you'll see:
```
Your service is live at https://chatbot-backend-xxxx.onrender.com
```

**Copy this URL!** This is your production backend URL.

---

### **Step 5: Update CORS Settings** 🔐

Your backend needs to allow requests from your Netlify website.

1. In your Render dashboard, find your service
2. Go to **"Environment"** tab
3. Add a new variable:
   ```
   ALLOWED_ORIGINS = https://gleeful-taffy-b550dd.netlify.app,http://localhost:5173
   ```
4. Click **"Save Changes"**
5. Render will auto-redeploy (1-2 minutes)

Then update your backend code:

**File:** `back-end/src/index.js`

Find this line:
```javascript
app.use(cors());
```

Replace with:
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

### **Step 6: Test Your Backend** ✅

Open your production URL in browser:
```
https://chatbot-backend-xxxx.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T...",
  "environment": "production"
}
```

✅ **Success!** Your backend is live!

---

### **Step 7: Update Widget Code** 🔄

Now update your chatbot widget to use the production URL:

**In your widget code, change:**
```javascript
apiUrl: 'http://localhost:3002',  // ❌ Old
```

**To:**
```javascript
apiUrl: 'https://chatbot-backend-xxxx.onrender.com',  // ✅ New (use YOUR actual URL)
```

---

## 📊 Render Free Plan Limits

| Feature | Free Plan |
|---------|-----------|
| **Price** | $0/month forever |
| **RAM** | 512 MB |
| **CPU** | Shared |
| **Bandwidth** | 100 GB/month |
| **Build Minutes** | 500/month |
| **Sleep After** | 15 min inactivity (wakes on request) |
| **SSL** | ✅ Free HTTPS |

**⚠️ Important:** Free services "sleep" after 15 minutes of inactivity. First request after sleep takes 30-60 seconds to wake up. After that, it's instant!

---

## 🔄 How to Update/Redeploy

Render auto-deploys when you push to GitHub:

```bash
cd "C:\Users\endri\Desktop\Chatbot"
git add .
git commit -m "Update backend"
git push
```

Render detects the push and redeploys automatically! 🎉

---

## 🆘 Troubleshooting

### **Problem: Build Failed**
- Check logs in Render dashboard
- Make sure `back-end` is the root directory
- Verify `package.json` has all dependencies

### **Problem: Service Won't Start**
- Check environment variables are set correctly
- Look for errors in Render logs
- Make sure PORT is set to `10000`

### **Problem: CORS Errors**
- Add your Netlify domain to ALLOWED_ORIGINS
- Update CORS code in `src/index.js`
- Redeploy

### **Problem: Slow First Request**
- This is normal on free plan (service sleeps)
- First request wakes it up (30-60 sec)
- Consider upgrading to paid plan ($7/mo) for 24/7 uptime

---

## 📝 Next Steps

After deploying to Render:

1. ✅ Copy your production URL
2. ✅ Update widget code with production URL
3. ✅ Update CORS settings
4. ✅ Test `/health` endpoint
5. ✅ Test chatbot on your website
6. ✅ Add widget to your Netlify site

---

## 🎯 Summary

| What | Where |
|------|-------|
| **Your Backend URL** | `https://chatbot-backend-xxxx.onrender.com` |
| **Dashboard** | https://dashboard.render.com |
| **Logs** | Render Dashboard → Your Service → Logs |
| **Environment Vars** | Render Dashboard → Your Service → Environment |

---

## 💡 Pro Tips

1. **Keep GitHub repo private** if you have sensitive data
2. **Use environment variables** for ALL secrets (never hardcode)
3. **Check logs regularly** to catch errors early
4. **Upgrade to paid plan** ($7/mo) if you need 24/7 uptime
5. **Add custom domain** (free on Render) for professional URL

---

Need help? Let me know! 🚀
