-- ============================================
-- SUPABASE SQL EDITOR SETUP
-- Copy and paste this entire file into your Supabase SQL Editor
-- Run it to create all necessary tables for your chatbot
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector operations for AI embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- CHATBOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chatbots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website_url TEXT,
    greeting_message TEXT DEFAULT 'Hello! How can I help you today?',
    color TEXT DEFAULT '#3b82f6',
    position TEXT DEFAULT 'bottom-right',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'training'))
);

-- ============================================
-- DOCUMENTS TABLE (Website content with AI embeddings)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    metadata JSONB DEFAULT '{}',
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index for faster chatbot queries
CREATE INDEX IF NOT EXISTS documents_chatbot_idx ON documents(chatbot_id);

-- ============================================
-- CHATS TABLE (Conversation history)
-- ============================================
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Index for faster session queries
CREATE INDEX IF NOT EXISTS chats_session_idx ON chats(session_id);
CREATE INDEX IF NOT EXISTS chats_chatbot_idx ON chats(chatbot_id);

-- ============================================
-- MESSAGES TABLE (Individual chat messages)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster message queries
CREATE INDEX IF NOT EXISTS messages_chat_idx ON messages(chat_id);

-- ============================================
-- TRAINING_JOBS TABLE (Track website training progress)
-- ============================================
CREATE TABLE IF NOT EXISTS training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    pages_processed INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster status queries
CREATE INDEX IF NOT EXISTS training_jobs_chatbot_idx ON training_jobs(chatbot_id);
CREATE INDEX IF NOT EXISTS training_jobs_status_idx ON training_jobs(status);

-- ============================================
-- BILLING TABLE (Subscription and payment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ANALYTICS TABLE (Usage statistics)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    messages_count INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    avg_response_time FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chatbot_id, date)
);

-- Index for faster analytics queries
CREATE INDEX IF NOT EXISTS analytics_chatbot_date_idx ON analytics(chatbot_id, date DESC);

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatbots_updated_at
    BEFORE UPDATE ON chatbots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
    BEFORE UPDATE ON billing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Insert a test chatbot
INSERT INTO chatbots (name, website_url, greeting_message) 
VALUES ('Demo Chatbot', 'https://example.com', 'Hi! I''m your demo assistant. How can I help?')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see this without errors, your database is ready! ✅
SELECT 'Database setup complete! ✅' as status;
