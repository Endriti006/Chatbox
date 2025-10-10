/**
 * AI Chatbot Widget - Embeddable chat bubble
 * Usage: <script src="your-domain.com/widget.js" data-chatbot-id="user123"></script>
 */

(function() {
  // Get configuration from script tag
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:3002';
  const primaryColor = script.getAttribute('data-color') || '#0084ff';
  const botName = script.getAttribute('data-bot-name') || 'ChatBot';

  // Widget HTML
  const widgetHTML = `
    <div id="chatbot-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
      <!-- Chat Button -->
      <button id="chat-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      ">
        <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      <!-- Chat Window -->
      <div id="chat-window" style="
        display: none;
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: ${primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 36px;
              height: 36px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">🤖</div>
            <div>
              <div style="font-weight: 600;">${botName}</div>
              <div style="font-size: 12px; opacity: 0.9;">Online</div>
            </div>
          </div>
          <button id="chat-close" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 24px;
            padding: 0;
            width: 24px;
            height: 24px;
          ">×</button>
        </div>

        <!-- Messages -->
        <div id="chat-messages" style="
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f5f5f5;
        ">
          <div class="message bot-message" style="margin-bottom: 12px;">
            <div style="
              background: white;
              padding: 12px;
              border-radius: 8px;
              max-width: 80%;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">
              Hi! How can I help you today?
            </div>
          </div>
        </div>

        <!-- Input -->
        <div style="
          padding: 12px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
        ">
          <input 
            id="chat-input" 
            type="text" 
            placeholder="Type your message..."
            style="
              flex: 1;
              padding: 12px;
              border: 1px solid #e0e0e0;
              border-radius: 24px;
              outline: none;
              font-size: 14px;
            "
          />
          <button id="chat-send" style="
            background: ${primaryColor};
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Inject widget into page
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Get elements
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window');
    const messagesDiv = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    // Toggle chat
    toggleBtn.addEventListener('click', () => {
      chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });

    // Send message
    async function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addMessage(message, 'user');
      input.value = '';

      // Show typing indicator
      const typingId = addTypingIndicator();

      try {
        // Call API
        const response = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: chatbotId,
            message: message
          })
        });

        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Add bot response
        addMessage(data.answer || 'Sorry, I could not process that.', 'bot');
      } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator(typingId);
        addMessage('Sorry, something went wrong. Please try again.', 'bot');
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    // Add message to chat
    function addMessage(text, sender) {
      const isBot = sender === 'bot';
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}-message`;
      messageDiv.style.cssText = `
        margin-bottom: 12px;
        display: flex;
        justify-content: ${isBot ? 'flex-start' : 'flex-end'};
      `;

      messageDiv.innerHTML = `
        <div style="
          background: ${isBot ? 'white' : primaryColor};
          color: ${isBot ? '#333' : 'white'};
          padding: 12px;
          border-radius: 8px;
          max-width: 80%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          word-wrap: break-word;
        ">${text}</div>
      `;

      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Typing indicator
    let typingCounter = 0;
    function addTypingIndicator() {
      const id = `typing-${typingCounter++}`;
      const typingDiv = document.createElement('div');
      typingDiv.id = id;
      typingDiv.style.cssText = 'margin-bottom: 12px;';
      typingDiv.innerHTML = `
        <div style="
          background: white;
          padding: 12px;
          border-radius: 8px;
          max-width: 80px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; gap: 4px;">
            <div class="typing-dot" style="
              width: 8px;
              height: 8px;
              background: #999;
              border-radius: 50%;
              animation: typing 1.4s infinite;
            "></div>
            <div class="typing-dot" style="
              width: 8px;
              height: 8px;
              background: #999;
              border-radius: 50%;
              animation: typing 1.4s infinite 0.2s;
            "></div>
            <div class="typing-dot" style="
              width: 8px;
              height: 8px;
              background: #999;
              border-radius: 50%;
              animation: typing 1.4s infinite 0.4s;
            "></div>
          </div>
        </div>
      `;
      messagesDiv.appendChild(typingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      return id;
    }

    function removeTypingIndicator(id) {
      const element = document.getElementById(id);
      if (element) element.remove();
    }

    // Add typing animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }
      #chat-toggle:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
  });
})();