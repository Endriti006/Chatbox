# 🤖 Prompt to Send to Another AI Assistant

Copy and paste this entire prompt to another AI (like ChatGPT, Claude, etc.):

---

## **PROMPT START:**

Hi! I need help adding a chatbot widget to my Netlify website.

**My Website:** https://gleeful-taffy-b550dd.netlify.app/  
**What I Need:** Add a JavaScript chatbot widget to my live Netlify site

### **The Widget Code I Need to Add:**

```html
<!-- AI Chatbot Widget for Samite Gastro Bar -->
<script>
(function() {
  const config = {
    chatbotId: 'REPLACE_WITH_YOUR_CHATBOT_ID',
    apiUrl: 'REPLACE_WITH_YOUR_BACKEND_URL',
    color: '#8B4513',
    position: 'bottom-right',
    botName: 'Samite Assistant',
    greeting: '👋 Welcome to Samite Gastro Bar! How can I help you today?'
  };

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
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      }
    } catch (error) {
      typingDiv.remove();
      addMessage('Sorry, I could not connect. Please try again later.', 'bot');
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

### **What I Need Help With:**

1. **How do I access the source code** of my Netlify website to edit it?
2. **Where exactly should I paste** this widget code? (I think it goes before the `</body>` tag?)
3. **How do I re-deploy** to Netlify after making the change?

### **Additional Context:**

- My website is a **restaurant reservation website** (Samite Gastro Bar)
- I want a **chatbot bubble in the bottom-right corner** that customers can click
- The chatbot will answer questions about the menu, hours, location, etc.
- I'm not a developer, so please explain in simple terms!

### **Questions:**

- Is there a way to edit my Netlify site directly through their dashboard?
- Do I need to download the code, edit it locally, then re-upload?
- Can you walk me through the exact steps on Netlify's interface?

Please provide **step-by-step instructions with screenshots or detailed descriptions** of what buttons to click in Netlify!

Thank you! 🙏

---

## **PROMPT END**

---

# 📝 Additional Information to Share (if needed):

If the AI asks for more details, you can provide:

**About Your Website:**
- URL: https://gleeful-taffy-b550dd.netlify.app/
- Type: Restaurant reservation website (Resy platform)
- Purpose: Adding AI chatbot for customer support

**About the Widget:**
- Should appear as a brown/gold chat bubble
- Bottom-right corner of the page
- Customers click to open chat window
- AI answers questions about restaurant

**Technical Details:**
- The code is a self-contained JavaScript snippet
- No external dependencies required
- Just needs to be added before `</body>` tag
- Works on any HTML-based website

---

# 🎯 What to Expect:

The AI should help you with:
1. ✅ Accessing your Netlify site's source code
2. ✅ Finding the correct HTML file to edit
3. ✅ Where to paste the widget code
4. ✅ How to save and re-deploy on Netlify

---

# ⚠️ Important Notes:

**BEFORE deploying to production:**
1. You MUST deploy your backend first (see DEPLOYMENT_GUIDE.md)
2. Replace `REPLACE_WITH_YOUR_BACKEND_URL` with your production URL
3. Replace `REPLACE_WITH_YOUR_CHATBOT_ID` with your actual chatbot ID
4. Test locally first if possible!

**For now, you can test with:**
- `apiUrl: 'http://localhost:3002'` (only works on your computer)
- This lets you see how it looks before deploying backend

---

Good luck! Let me know if you need anything else! 🚀
