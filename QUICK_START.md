# 🚀 Quick Start Guide - AI Chatbot Builder

## Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- Your backend server ready at `http://localhost:3000`

---

## Step 1: Install Frontend Dependencies

```bash
cd front-end/chatbot-dashboard
npm install
```

---

## Step 2: Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3000
```

---

## Step 3: Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:5173**

---

## Step 4: Test the Application

### 1. **Register/Login**
- Visit http://localhost:5173
- Click "Sign up" if new user
- Enter your details and create account

### 2. **Create Your First Chatbot**
- Click "Create Chatbot" button
- Enter:
  - Name: "Support Bot"
  - Website URL: "https://example.com"
  - Greeting: "Hi! How can I help?"
  - Color: Pick your favorite color
- Click "Create"

### 3. **Train Your Chatbot**
- Go to "Train" page from sidebar
- Select your chatbot
- Enter website URL
- Click "Start Training"
- Wait for training to complete

### 4. **Customize Appearance**
- Go to "Settings" page
- Change colors, messages, position
- Click "Get Widget Code"
- Copy code to paste on your website

### 5. **View Analytics**
- Go to "Analytics" page
- See chat statistics
- Browse conversation history

### 6. **Manage Billing**
- Go to "Billing" page
- View current plan
- Browse available plans
- Upgrade if needed

---

## 📋 Available Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview & stats |
| Chatbots | `/chatbots` | Manage chatbots |
| Train | `/train` | Train with website |
| Analytics | `/analytics` | View chat history |
| Settings | `/settings` | Customize chatbot |
| Billing | `/billing` | Manage subscription |
| Profile | `/profile` | User settings |

---

## 🎯 Common Tasks

### Create a Chatbot
1. Click "Create Chatbot" or "+" button
2. Fill in the form
3. Click "Create"

### Train a Chatbot
1. Go to Train page
2. Select chatbot
3. Enter website URL
4. Click "Start Training"

### Get Widget Code
1. Go to Settings page
2. Select chatbot
3. Click "Get Widget Code"
4. Copy and paste on your website

### View Chat History
1. Go to Analytics page
2. Select chatbot
3. Click on any conversation to view details

---

## 🐛 Troubleshooting

### Cannot Connect to Backend
- Check backend is running on port 3000
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

### Login Not Working
- Ensure backend auth routes are working
- Check network tab in browser dev tools
- Verify token is being sent in requests

### Styles Not Loading
- Clear browser cache
- Restart dev server
- Check Tailwind config

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🔧 Configuration

### Change API URL
Edit `.env`:
```
VITE_API_URL=https://your-api.com
```

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    600: '#your-color',
    // ...
  }
}
```

### Add New Page
1. Create file in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add link in `src/components/Sidebar.jsx`

---

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
1. Build project: `npm run build`
2. Upload `dist` folder
3. Configure SPA redirect

---

## ✅ Checklist

- [ ] Backend running on port 3000
- [ ] Frontend dependencies installed
- [ ] `.env` file created and configured
- [ ] Can register/login
- [ ] Can create chatbot
- [ ] Can train chatbot
- [ ] Can view analytics
- [ ] Can customize settings
- [ ] Ready to deploy!

---

## 🆘 Need Help?

- Check `FRONTEND_COMPLETE.md` for detailed docs
- Review backend `README.md` for API details
- Check browser console for errors
- Inspect network tab for API calls

---

## 🎉 You're Ready!

Your AI Chatbot Builder dashboard is now running and ready to use!

**Dashboard:** http://localhost:5173

Happy building! 🚀
