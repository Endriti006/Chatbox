-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector operations
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extended profile data beyond Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    company_name TEXT,
    website_url TEXT,
    chatbot_name TEXT DEFAULT 'AI Assistant',
    chatbot_greeting TEXT DEFAULT 'Hello! How can I help you today?',
    chatbot_color TEXT DEFAULT '#007bff',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    stripe_customer_id TEXT UNIQUE
);

-- Documents table (website content chunks with embeddings)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    url TEXT,  -- Source URL for this content chunk
    CONSTRAINT embedding_dimension CHECK (array_length(embedding, 1) = 1536)
);

-- Create GiST index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Chat history
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5)
);

-- Settings table for per-user configuration
CREATE TABLE IF NOT EXISTS settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id),
    chat_model TEXT DEFAULT 'gemini-pro',  -- or 'gpt-4' etc
    max_history INT DEFAULT 10,  -- max chat history to include
    temperature FLOAT DEFAULT 0.7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    custom_settings JSONB DEFAULT '{}'
);

-- Billing/subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,  -- e.g., 'basic', 'pro', 'enterprise'
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,  -- in cents
    price_yearly INTEGER NOT NULL,  -- in cents
    features JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price_monthly, price_yearly, features) VALUES
('free', 'Free Tier', 'Basic chatbot for small websites', 0, 0, 
 '["1 chatbot", "1000 messages/mo", "Basic customization"]'),
('pro', 'Pro', 'Advanced features for growing businesses', 2900, 29000, 
 '["Unlimited chatbots", "10000 messages/mo", "Advanced customization", "Priority support"]'),
('enterprise', 'Enterprise', 'Custom solutions for large organizations', 9900, 99000,
 '["Custom message limits", "API access", "Dedicated support", "Custom training"]')
ON CONFLICT (id) DO NOTHING;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();