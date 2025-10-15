# 🚀 Deployment Guide - Add Chatbot to Your Netlify Website

## ✅ You've Completed:
1. ✅ Created chatbot & got chatbot ID
2. ✅ Trained on your restaurant website
3. ✅ Tested locally - it works!

---

## 🎯 Next Step: Add to Your Live Netlify Website

You need to **edit your Netlify website's code** to add the chatbot widget.

### **Option 1: If You Have the Source Code** (Recommended)

If you have the original code for `https://gleeful-taffy-b550dd.netlify.app/` on your computer:

**Step 1:** Find your website's HTML file
```
Look for: index.html (or main HTML file)
Location: Your local project folder
```

**Step 2:** Open `index.html` and find the closing `</body>` tag

**Step 3:** Paste this code RIGHT BEFORE `</body>`:

```html
<!-- AI Chatbot Widget for Samite Gastro Bar -->
<script>
(function() {
  // ⚙️ CONFIGURATION
  const config = {
    chatbotId: 'YOUR_CHATBOT_ID_HERE',      // 👈 Replace with your actual chatbot ID
    apiUrl: 'http://localhost:3002',        // 👈 Your backend URL
    color: '#8B4513',
    position: 'bottom-right',
    botName: 'Samite Assistant',
    greeting: '👋 Welcome to Samite Gastro Bar! How can I help you today?'
  };

  // Create widget
  const widget = document.createElement('div');
  widget.id = 'restaurant-chatbot';
  widget.innerHTML = `
    <style>
      #restaurant-chatbot { position: fixed; ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'}; ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'}; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      #chat-bubble { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, ${config.color} 0%, #CD853F 100%); border: none; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transition: all 0.3s; animation: pulse 2s infinite; }
      #chat-bubble:hover { transform: scale(1.1); box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
      @keyframes pulse { 0%, 100% { box-shadow: 0 6px 20px rgba(0,0,0,0.25); } 50% { box-shadow: 0 6px 30px rgba(139,69,19,0.5); } }
      #chat-window { display: none; position: absolute; ${config.position.includes('bottom') ? 'bottom: 80px' : 'top: 80px'}; ${config.position.includes('right') ? 'right: 0' : 'left: 0'}; width: 380px; height: 600px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); flex-direction: column; overflow: hidden; }
      #chat-window.open { display: flex; animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      @keyframes slideIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      #chat-header { background: linear-gradient(135deg, ${config.color} 0%, #CD853F 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      #chat-header-info { display: flex; align-items: center; gap: 12px; }
      #chat-avatar { width: 40px; height: 40px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 20px; }
      #chat-messages { flex: 1; overflow-y: auto; padding: 20px; background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%); }
      .message { margin-bottom: 16px; display: flex; animation: messageIn 0.3s ease; }
      @keyframes messageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .message.user { justify-content: flex-end; }
      .message-content { padding: 12px 16px; border-radius: 16px; max-width: 75%; word-wrap: break-word; line-height: 1.5; }
      .message.bot .message-content { background: white; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-bottom-left-radius: 4px; }
      .message.user .message-content { background: linear-gradient(135deg, ${config.color} 0%, #CD853F 100%); color: white; box-shadow: 0 2px 8px rgba(139,69,19,0.3); border-bottom-right-radius: 4px; }
      #chat-input-area { padding: 20px; border-top: 1px solid #e5e7eb; background: white; display: flex; gap: 12px; }
      #chat-input { flex: 1; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 24px; outline: none; font-size: 14px; transition: border 0.2s; }
      #chat-input:focus { border-color: ${config.color}; }
      #chat-send { background: linear-gradient(135deg, ${config.color} 0%, #CD853F 100%); color: white; border: none; padding: 12px 24px; border-radius: 24px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
      #chat-send:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139,69,19,0.3); }
      #close-chat { background: none; border: none; color: white; font-size: 28px; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s; }
      #close-chat:hover { background: rgba(255,255,255,0.2); }
      .typing { display: flex; gap: 6px; padding: 12px; }
      .typing span { width: 10px; height: 10px; border-radius: 50%; background: ${config.color}; animation: typing 1.4s infinite ease-in-out; }
      .typing span:nth-child(2) { animation-delay: 0.2s; }
      .typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: 0.7; } 30% { transform: translateY(-12px); opacity: 1; } }
      @media (max-width: 480px) { #chat-window { width: calc(100vw - 40px); height: 70vh; } }
    </style>
    
    <button id="chat-bubble">
      <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
      </svg>
    </button>
    
    <div id="chat-window">
      <div id="chat-header">
        <div id="chat-header-info">
          <div id="chat-avatar">🍽️</div>
          <div>
            <strong>${config.botName}</strong><br>
            <span style="font-size: 12px; opacity: 0.9;">Online • Responds instantly</span>
          </div>
        </div>
        <button id="close-chat">&times;</button>
      </div>
      <div id="chat-messages">
        <div class="message bot">
          <div class="message-content">${config.greeting}</div>
        </div>
      </div>
      <div id="chat-input-area">
        <input type="text" id="chat-input" placeholder="Ask about menu, hours, reservations...">
        <button id="chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // Functionality
  const bubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const closeBtn = document.getElementById('close-chat');
  const sendBtn = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  bubble.onclick = () => { chatWindow.classList.add('open'); input.focus(); };
  closeBtn.onclick = () => chatWindow.classList.remove('open');

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = '<div class="message-content typing"><span></span><span></span><span></span></div>';
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    try {
      const response = await fetch(config.apiUrl + '/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: config.chatbotId,
          sessionId: sessionId,
          message: message
        })
      });

      const data = await response.json();
      typingDiv.remove();
      
      if (data.answer) {
        addMessage(data.answer, 'bot');
      } else {
        addMessage('Sorry, I encountered an error. Please try again or call us at +30 231 027 4545.', 'bot');
      }
    } catch (error) {
      typingDiv.remove();
      addMessage('Sorry, I could not connect. Please call us at +30 231 027 4545 or try again later.', 'bot');
    }
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = 'message ' + sender;
    div.innerHTML = '<div class="message-content">' + text.replace(/\n/g, '<br>') + '</div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.onclick = sendMessage;
  input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
})();
</script>
```

**Step 4:** Replace `YOUR_CHATBOT_ID_HERE` with your actual chatbot ID

**Step 5:** Save the file

**Step 6:** Re-deploy to Netlify:
- Drag & drop to Netlify, OR
- Push to Git (if connected), OR
- Use Netlify CLI: `netlify deploy --prod`

---

### **Option 2: If You DON'T Have the Source Code**

If your website was built on a platform (Squarespace, Wix, WordPress, etc.):

**Squarespace:**
```
1. Go to Settings → Advanced → Code Injection
2. Paste the widget code in "Footer"
3. Save
```

**Wix:**
```
1. Add an "Embed Code" element
2. Paste the widget code
3. Publish
```

**WordPress:**
```
1. Appearance → Theme Editor
2. Edit footer.php
3. Paste before </body>
4. Update
```

**Webflow:**
```
1. Project Settings → Custom Code
2. Paste in "Footer Code"
3. Publish
```

---

## ⚠️ IMPORTANT: Deploy Your Backend First!

Your backend is currently on `localhost:3002` - this won't work on a live website!

### **Quick Backend Deployment** (Choose One):

#### **Option A: Render.com** (Free, Easy)
1. Go to https://render.com
2. Sign up / Sign in
3. New → Web Service
4. Connect your GitHub repo (or upload code)
5. Settings:
   - **Build Command:** `cd back-end && npm install`
   - **Start Command:** `cd back-end && npm start`
   - **Environment Variables:** Add all from `.env`
6. Deploy!
7. Copy your URL (e.g., `https://your-app.onrender.com`)

#### **Option B: Railway.app** (Free, Fast)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd back-end
railway init
railway up
```

#### **Option C: Heroku** (Paid)
```bash
# Install Heroku CLI
npm install -g heroku

# Deploy
cd back-end
heroku create your-chatbot-api
git push heroku main
```

---

## 🔄 Update Widget Code After Deployment

After you deploy your backend, **replace** this line:
```javascript
apiUrl: 'http://localhost:3002',        // ❌ Old
```

With your production URL:
```javascript
apiUrl: 'https://your-app.onrender.com',  // ✅ New
```

---

## ✅ Final Checklist:

- [ ] Backend deployed to production (Render/Railway/Heroku)
- [ ] Got production backend URL
- [ ] Updated `apiUrl` in widget code
- [ ] Updated `chatbotId` in widget code
- [ ] Added widget code to your Netlify website
- [ ] Re-deployed Netlify website
- [ ] Tested chatbot on live site

---

## 🆘 Need Help?

**If you need help editing your Netlify website code, I can give you a specific prompt to share with another AI:**

Just tell me:
1. Do you have the source code for your website?
2. What platform is your website built on? (HTML, React, WordPress, etc.)
3. Do you have access to the code repository (GitHub)?

Then I'll create a **perfect prompt** you can send to another AI assistant to help you add the widget! 🚀
