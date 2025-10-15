# 🚀 EMBED YOUR AI CHATBOT ON ANY WEBSITE

## Quick Start Guide

### ✅ What You Need:
1. Your **Chatbot ID** (from the dashboard)
2. Your **backend API URL** (currently: `http://localhost:3002`)
3. A website (Netlify, GitHub Pages, or any hosting)

---

## 📝 Step-by-Step Instructions

### Step 1: Get Your Chatbot ID
1. Go to your dashboard: `http://localhost:5173/chatbots`
2. Find your chatbot in the list
3. Copy the ID (looks like: `11ab9f9a-80ae-4bf3-b5f9-c79424db0a15`)

### Step 2: Prepare Your Website
You have 2 options:

#### Option A: Use the Test Website (Easiest)
1. Open `test-website.html` in this folder
2. Find this line (around line 255):
   ```javascript
   chatbotId: 'YOUR_CHATBOT_ID_HERE',  // 👈 Replace with your chatbot ID
   ```
3. Replace `YOUR_CHATBOT_ID_HERE` with your actual ID
4. Save the file
5. Upload to Netlify (see Step 3)

#### Option B: Add to Your Existing Website
1. Copy the widget code from `WIDGET_INSTALLATION.html`
2. Paste it before the `</body>` tag in your HTML
3. Update the configuration:
   ```javascript
   chatbotId: 'your-actual-id',
   apiUrl: 'http://localhost:3002',  // Your backend URL
   color: '#667eea',                  // Your brand color
   position: 'bottom-right'            // Widget position
   ```

### Step 3: Deploy to Netlify

#### Method 1: Drag & Drop (Easiest)
1. Go to [Netlify](https://app.netlify.com/)
2. Sign in or create account
3. Click "Add new site" → "Deploy manually"
4. Drag your `test-website.html` file
5. Done! You'll get a URL like: `https://your-site.netlify.app`

#### Method 2: Git Deploy (Better for updates)
1. Create a new folder for your site
2. Add your HTML file
3. Push to GitHub
4. Connect GitHub repo to Netlify
5. Auto-deploys on every push!

### Step 4: Test It!
1. Open your Netlify URL
2. You should see a purple chat bubble in the bottom-right
3. Click it to open the chat
4. Send a message - it should connect to your backend!

---

## ⚠️ IMPORTANT: Backend Must Be Running!

Your backend needs to be accessible for the widget to work:

### For Local Testing:
```bash
cd back-end
npm start
```
- Backend runs at: `http://localhost:3002`
- Widget connects to: `http://localhost:3002/chat/message`

### For Production:
You need to deploy your backend to a public server:

#### Option 1: Render.com (Free)
1. Go to [Render](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Deploy!
7. You'll get URL like: `https://your-app.onrender.com`
8. Update widget config:
   ```javascript
   apiUrl: 'https://your-app.onrender.com'
   ```

#### Option 2: Railway.app (Free)
1. Go to [Railway](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects Node.js
5. Deploy!

#### Option 3: Heroku (Paid)
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. Done!

---

## 🎨 Customization Options

### Change Colors:
```javascript
color: '#667eea',  // Change to your brand color
```

### Change Position:
```javascript
position: 'bottom-right'   // Options: bottom-right, bottom-left, top-right, top-left
```

### Change Widget Text:
In the HTML, find:
```html
<div><strong>AI Assistant</strong><br><span>Online</span></div>
```
Change "AI Assistant" to your company name!

### Change Greeting:
```html
<div class="message-content">👋 Hi! How can I help you today?</div>
```

---

## 🧪 Testing Checklist

Before deploying to production:

- [ ] Backend is running and accessible
- [ ] Chatbot is trained on your website
- [ ] Chatbot ID is correct in the widget code
- [ ] API URL is correct (`http://localhost:3002` or production URL)
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test sending messages
- [ ] Test closing and reopening chat
- [ ] Check AI responses are accurate

---

## 🐛 Troubleshooting

### Widget doesn't appear:
- Check browser console for errors (F12)
- Make sure JavaScript is enabled
- Check if the script tag is before `</body>`

### Chat not connecting:
- Verify backend is running
- Check `apiUrl` in configuration
- Check browser console for CORS errors
- Make sure chatbot ID is correct

### CORS Errors:
If you see CORS errors in console, your backend needs to allow your website's domain.

In `back-end/src/index.js`, update CORS config:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-site.netlify.app']
}));
```

### No AI Response:
- Check if backend logs show any errors
- Verify chatbot is trained (has documents in database)
- Check Mistral API key is valid
- Try training the chatbot again

---

## 📤 Share Your Test Website

Once deployed to Netlify:

1. Copy your Netlify URL
2. Share it with anyone
3. They can test your AI chatbot!
4. No installation needed!

Example:
```
https://my-awesome-chatbot-test.netlify.app
```

---

## 🎯 Next Steps

### For Production:
1. Deploy backend to Render/Railway/Heroku
2. Update widget `apiUrl` to production URL
3. Add custom domain to Netlify (optional)
4. Train chatbot on your actual business content
5. Customize colors to match your brand
6. Add the widget to your real website!

### For Multiple Clients:
Each client gets:
- Their own chatbot ID
- Trained on their own website
- Customized colors
- Same widget code, different IDs!

---

## 📞 Support

Need help? Check:
- Backend logs for errors
- Browser console (F12) for JavaScript errors
- Network tab to see API requests
- Make sure all URLs are correct

---

**You're ready to embed AI chat on any website!** 🚀

Just update the chatbot ID, deploy to Netlify, and share your URL!
