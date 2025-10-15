# 🏗️ Project Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI CHATBOT BUILDER SAAS                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐      ┌──────────────────┐      ┌──────────────┐
│   React Frontend    │ ───▶ │  Node.js Backend │ ───▶ │  PostgreSQL  │
│   (Dashboard)       │ HTTP │   (Express API)  │      │   Database   │
│   Port: 5173        │ ◀─── │   Port: 3000     │      │              │
└─────────────────────┘      └──────────────────┘      └──────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌─────────────────────┐      ┌──────────────────┐
│  Business Website   │      │   Gemini API     │
│  (with widget)      │      │   (AI Model)     │
└─────────────────────┘      └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  Stripe API      │
                             │  (Payments)      │
                             └──────────────────┘
```

---

## Frontend Structure

```
src/
│
├── 📄 App.jsx                    # Main app with routing
├── 📄 main.jsx                   # Entry point
│
├── 🎨 components/
│   ├── Header.jsx                # Top navigation bar
│   ├── Sidebar.jsx               # Left navigation menu
│   └── ProtectedRoute.jsx        # Auth guard for routes
│
├── 🔐 context/
│   └── AuthContext.jsx           # Global auth state
│
├── 📐 layouts/
│   └── DashboardLayout.jsx       # Main layout wrapper
│
├── 📄 pages/
│   ├── Dashboard.jsx             # 🏠 Home - Overview & stats
│   ├── Chatbots.jsx              # 🤖 Manage chatbots (CRUD)
│   ├── Train.jsx                 # 🎓 Train with website
│   ├── Settings.jsx              # ⚙️  Customize appearance
│   ├── Analytics.jsx             # 📊 Chat history & metrics
│   ├── Billing.jsx               # 💳 Subscription plans
│   ├── Profile.jsx               # 👤 User settings
│   └── Login.jsx                 # 🔑 Auth (login/register)
│
└── 🔌 services/
    └── api.js                    # API integration layer
```

---

## Page Flow Diagram

```
                        ┌──────────────┐
                        │  Login Page  │
                        └──────┬───────┘
                               │ Login/Register
                               ▼
                        ┌──────────────┐
                        │  Dashboard   │ ◀─── Landing after login
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌───────────┐  ┌───────────┐  ┌──────────┐
         │ Chatbots  │  │   Train   │  │ Settings │
         └─────┬─────┘  └─────┬─────┘  └────┬─────┘
               │              │              │
               │              │              │
               ▼              ▼              ▼
         Create/Edit    Train/Retrain   Get Widget
         
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
         ┌───────────┐  ┌───────────┐  ┌──────────┐
         │ Analytics │  │  Billing  │  │ Profile  │
         └───────────┘  └───────────┘  └──────────┘
```

---

## User Journey

### 1️⃣ **New User Registration**
```
Visit App → Click "Sign up" → Enter Details → Auto Login → Dashboard
```

### 2️⃣ **Create First Chatbot**
```
Dashboard → Create Chatbot → Fill Form → Submit → Chatbots List
```

### 3️⃣ **Train Chatbot**
```
Train Page → Select Bot → Enter URL → Start Training → View Status
```

### 4️⃣ **Customize & Deploy**
```
Settings → Configure Appearance → Get Widget Code → Copy to Website
```

### 5️⃣ **Monitor Performance**
```
Analytics → View Stats → Check Conversations → Export Data
```

### 6️⃣ **Upgrade Plan**
```
Billing → Browse Plans → Select Plan → Stripe Checkout → Success
```

---

## API Integration Map

### **Authentication Flow**
```
┌──────────┐                    ┌──────────┐
│  Login   │ ─── POST /auth ──▶ │ Backend  │
│  Page    │ ◀── JWT Token ──── │          │
└──────────┘                    └──────────┘
     │
     ├─ Store token in localStorage
     └─ Redirect to Dashboard
```

### **Chatbot Operations**
```
Dashboard/Chatbots
     │
     ├─ GET /admin/chatbots          (List all)
     ├─ POST /admin/chatbot          (Create new)
     ├─ GET /admin/chatbot/:id       (Get one)
     ├─ PUT /admin/chatbot/:id       (Update)
     └─ DELETE /admin/chatbot/:id    (Delete)
```

### **Training Flow**
```
Train Page
     │
     ├─ POST /train/website          (Start training)
     ├─ GET /train/status/:id        (Check progress)
     └─ POST /train/retrain/:id      (Retrain bot)
```

### **Analytics Data**
```
Analytics Page
     │
     ├─ GET /admin/analytics/:id     (Get stats)
     └─ GET /admin/chats/:id         (Get history)
```

---

## State Management

### **AuthContext Flow**
```
┌─────────────────┐
│   AuthContext   │
│   (Global)      │
├─────────────────┤
│ • user          │ ◀─── Current user object
│ • loading       │ ◀─── Loading state
│ • login()       │ ◀─── Login function
│ • logout()      │ ◀─── Logout function
└─────────────────┘
         │
         └──▶ Wraps entire app
              Available in all components
              via useAuth() hook
```

### **Component State**
Each page manages its own state:
- Form data
- Loading states
- Error messages
- Fetched data

---

## Routing Structure

```
/                       → Dashboard (protected)
/login                  → Login/Register (public)
/chatbots              → Chatbots Management (protected)
/train                 → Training Interface (protected)
/settings              → Customization (protected)
/analytics             → Analytics Dashboard (protected)
/billing               → Billing & Plans (protected)
/profile               → User Profile (protected)

Protected routes redirect to /login if not authenticated
```

---

## Data Flow Example: Creating a Chatbot

```
1. User fills form on Chatbots page
        │
        ▼
2. Click "Create" → calls chatbotService.createChatbot()
        │
        ▼
3. API service adds auth token and sends POST /admin/chatbot
        │
        ▼
4. Backend validates, saves to DB, returns new chatbot
        │
        ▼
5. Frontend updates list, closes modal, shows success
        │
        ▼
6. User sees new chatbot in list
```

---

## Technology Stack

### **Frontend**
- ⚛️ React 19 - UI Library
- 🛣️ React Router - Navigation
- 🎨 Tailwind CSS - Styling
- 📡 Axios - HTTP Client
- ⚡ Vite - Build Tool

### **Backend** (Your Existing Setup)
- 🟢 Node.js + Express
- 🐘 PostgreSQL
- 🤖 Gemini API
- 💳 Stripe
- 🔐 Supabase Auth

---

## Development Workflow

```
1. Start Backend:
   cd back-end
   npm start
   ✅ Running on http://localhost:3000

2. Start Frontend:
   cd front-end/chatbot-dashboard
   npm run dev
   ✅ Running on http://localhost:5173

3. Develop:
   - Edit files in src/
   - Hot reload automatically updates browser
   - Check console for errors

4. Build:
   npm run build
   ✅ Production files in dist/

5. Deploy:
   - Backend → Railway
   - Frontend → Vercel/Netlify
```

---

## Key Features by Page

### 🏠 **Dashboard**
- Welcome message
- Stats cards (chatbots, messages, conversations)
- Quick actions
- Recent chatbots
- Getting started guide

### 🤖 **Chatbots**
- Grid/list of chatbots
- Create modal with form
- Edit functionality
- Delete with confirmation
- Color-coded cards

### 🎓 **Train**
- Chatbot selector
- URL input
- Training status display
- Retrain button
- Progress indicators

### ⚙️ **Settings**
- Name & greeting editor
- Color picker
- Position selector
- Avatar uploader
- Widget code generator

### 📊 **Analytics**
- Stats overview
- Conversation list
- Chat detail modal
- Message timeline
- Export functionality

### 💳 **Billing**
- Current plan display
- Plan comparison cards
- Upgrade/downgrade buttons
- Billing history table
- Stripe integration

---

## Security Features

✅ **JWT Authentication**
- Token stored in localStorage
- Sent with every API request
- Auto-logout on token expiry

✅ **Protected Routes**
- ProtectedRoute component guards pages
- Redirects to login if not authenticated
- Checks auth state before rendering

✅ **API Security**
- All requests include Authorization header
- Backend validates token
- CORS configured properly

---

## Performance Optimizations

⚡ **Fast Load Times**
- Code splitting with React Router
- Lazy loading of routes
- Optimized images
- Minimal dependencies

⚡ **Smooth UX**
- Loading states for all async operations
- Optimistic UI updates
- Cached data where appropriate
- Debounced search inputs

---

## Mobile Responsiveness

📱 **Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

📱 **Adaptive Design**
- Sidebar collapses on mobile
- Grid layouts stack vertically
- Touch-friendly buttons
- Responsive typography

---

## Summary

✅ **7 Complete Pages** - All functional and styled
✅ **Full CRUD** - Create, Read, Update, Delete chatbots
✅ **API Integration** - Connected to your backend
✅ **Modern UI** - Tailwind CSS with smooth animations
✅ **Responsive** - Works on all devices
✅ **Production Ready** - Error handling, loading states
✅ **Well Structured** - Clean code, good practices

**Status:** Ready for development and testing! 🎉
