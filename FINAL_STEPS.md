# 🎯 Final Steps - Make Widget Work on Your Website

## ✅ Your Backend is Live!
**Production URL:** `https://chatbot-api-pmbr.onrender.com`

---

## 📋 Complete These Steps:

### **Step 1: Update CORS on Render** (2 minutes)

Your backend needs permission to accept requests from your Netlify website.

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your service: **chatbot-api-pmbr**
3. Go to **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"**
5. Add this:
   ```
   Key: ALLOWED_ORIGINS
   Value: https://gleeful-taffy-b550dd.netlify.app,http://localhost:5173
   ```
6. Click **"Save Changes"**
7. Wait 1-2 minutes for automatic redeploy

---

### **Step 2: Get Your Chatbot ID** (1 minute)

You need your chatbot ID from your dashboard.

**Option A: Start Your Dashboard Locally**
```powershell
# Terminal 1 - Backend
cd "C:\Users\endri\Desktop\Chatbot\back-end"
npm start

# Terminal 2 - Frontend  
cd "C:\Users\endri\Desktop\Chatbot\front-end\chatbot-dashboard"
npm run dev
```

Then:
1. Open http://localhost:5173
2. Go to **Chatbots** page
3. Find or create a chatbot for "Samite Gastro Bar"
4. **Copy the chatbot ID** (looks like: `abc123xyz456` or similar)

**Option B: Check Database**
If you can't access the dashboard, your chatbot ID is in your Supabase database:
1. Go to https://supabase.com/dashboard
2. Open your project
3. Click "Table Editor"
4. Open "chatbots" table
5. Copy the ID from there

---

### **Step 3: Get the Widget Code** (30 seconds)

1. Open the file I just created: **`WIDGET_CODE_READY.html`**
2. Double-click it to open in your browser
3. Click **"Copy Widget Code"** button
4. In a text editor, find line 5:
   ```javascript
   chatbotId: 'YOUR_CHATBOT_ID_HERE',
   ```
5. Replace `YOUR_CHATBOT_ID_HERE` with your actual chatbot ID

---

### **Step 4: Add to Your Netlify Website**

Now you need to add this widget code to your Netlify site.

#### **Option A: If You Have the Source Code**

1. Find your website's HTML file (probably `index.html`)
2. Scroll to the bottom
3. Find the `</body>` tag
4. Paste the widget code **RIGHT BEFORE** `</body>`
5. Save the file
6. Re-deploy to Netlify:
   - Drag & drop folder to Netlify, OR
   - Push to GitHub if connected, OR
   - Use Netlify CLI: `netlify deploy --prod`

#### **Option B: Don't Have Source Code?**

If your Netlify site was built with a website builder or you don't have access to the code:

**Copy this prompt and send to ChatGPT/Claude:**

```
I need help adding a JavaScript chatbot widget to my Netlify website.

My website: https://gleeful-taffy-b550dd.netlify.app/
Platform: Netlify

I have the widget code (a <script> tag) that needs to be added before the </body> tag.

Can you guide me step-by-step on how to:
1. Access my Netlify site's HTML files
2. Find the </body> tag
3. Add my widget code
4. Re-deploy the site

I'm not very technical, so please explain in simple terms!
```

---

### **Step 5: Train Your Chatbot** (5 minutes)

Your chatbot needs to know about your restaurant!

1. Go to your dashboard: http://localhost:5173
2. Click **"Train"** (left sidebar)
3. Select your chatbot
4. Enter your website URL: `https://gleeful-taffy-b550dd.netlify.app/`
5. Click **"Start Training"**
6. Wait 2-5 minutes for scraping to complete

The AI will learn:
- Restaurant hours
- Location & contact info
- Menu items
- Reservation process
- Any other info on your website

---

### **Step 6: Test It!** (1 minute)

1. Visit your website: https://gleeful-taffy-b550dd.netlify.app/
2. Look for the **brown/gold chat bubble** in the bottom-right corner
3. Click the bubble
4. Ask: **"What are your opening hours?"**
5. The AI should respond with your restaurant's hours!

---

## 🎉 Success Criteria:

You'll know it's working when:
- ✅ Chat bubble appears on your website
- ✅ Clicking it opens the chat window
- ✅ You can send messages
- ✅ AI responds with information about your restaurant
- ✅ No CORS errors in browser console (press F12)

---

## 🆘 Troubleshooting:

### **Problem: Chat bubble doesn't appear**
- Check browser console (F12) for errors
- Make sure you replaced `YOUR_CHATBOT_ID_HERE`
- Make sure widget code is before `</body>` tag

### **Problem: "Not allowed by CORS" error**
- Go to Render Dashboard → Environment
- Make sure `ALLOWED_ORIGINS` includes your Netlify domain
- Wait for redeploy (1-2 min)

### **Problem: AI says "I don't know"**
- Make sure you trained the chatbot on your website
- Check training status in dashboard
- Try re-training if it failed

### **Problem: "Could not connect" error**
- Check backend is live: https://chatbot-api-pmbr.onrender.com/health
- If it says "Service Unavailable", wait 30-60 seconds (free tier wakes up)
- Try again

---

## 📊 Current Status:

| Task | Status |
|------|--------|
| Backend deployed | ✅ Done |
| Production URL | ✅ https://chatbot-api-pmbr.onrender.com |
| Widget code created | ✅ Done |
| Update CORS | ⏳ **DO THIS NOW** |
| Get chatbot ID | ⏳ Next |
| Update widget code | ⏳ Next |
| Add to Netlify | ⏳ Next |
| Train chatbot | ⏳ Next |
| Test on website | ⏳ Last |

---

## 🚀 Start Now:

**First action:** Go to Render and add the `ALLOWED_ORIGINS` environment variable!

Then follow the other steps in order. You're almost done! 💪
