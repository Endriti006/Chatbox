-- Add missing columns to training_jobs table

ALTER TABLE training_jobs 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add index for source_url
CREATE INDEX IF NOT EXISTS training_jobs_source_url_idx ON training_jobs(source_url);

SELECT 'Training jobs columns added successfully! ✅' as status;
