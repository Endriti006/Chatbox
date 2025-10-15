-- ============================================
-- FIX MISSING COLUMNS
-- Run this in your Supabase SQL Editor to add all missing columns
-- ============================================

-- Add title column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add source columns to training_jobs table
ALTER TABLE training_jobs 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS documents_title_idx ON documents(title);
CREATE INDEX IF NOT EXISTS training_jobs_source_url_idx ON training_jobs(source_url);

SELECT '✅ All missing columns added successfully!' as status;
