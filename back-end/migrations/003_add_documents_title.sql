-- Add title column to documents table

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add index for title for faster searches
CREATE INDEX IF NOT EXISTS documents_title_idx ON documents(title);

SELECT 'Documents title column added successfully! ✅' as status;
