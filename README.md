# Chatbox Backend

Express backend for the AI Chatbot Builder SaaS. Provides routes for auth, training site content, chat, and billing.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. npm install
3. npm run dev

Endpoints
- POST /chat - send { userId, message } to get an answer from the AI based on user's site content.
- POST /train - trigger site scraping and embedding (used by background job or admin panel)
