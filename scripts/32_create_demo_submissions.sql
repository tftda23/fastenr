-- Create demo form submissions table
-- This table will store demo access requests with no read permissions
CREATE TABLE IF NOT EXISTS demo_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT DEFAULT CONCAT('demo_', EXTRACT(EPOCH FROM NOW())::bigint, '_', substr(gen_random_uuid()::text, 1, 8)) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wants_to_speak BOOLEAN DEFAULT false,
  signed_up BOOLEAN DEFAULT false,
  organization_id UUID NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient querying (even though reads are restricted)
CREATE INDEX IF NOT EXISTS idx_demo_submissions_created_at ON demo_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_email ON demo_submissions(email);
CREATE INDEX IF NOT EXISTS idx_demo_submissions_tracking_id ON demo_submissions(tracking_id);

-- Enable Row Level Security
ALTER TABLE demo_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows INSERT for anyone, but NO SELECT
CREATE POLICY "Allow anonymous inserts on demo_submissions" 
  ON demo_submissions FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT policy - this ensures data cannot be read back
-- Only system administrators with direct database access can view this data

-- Grant necessary permissions
GRANT INSERT ON demo_submissions TO anon;
GRANT INSERT ON demo_submissions TO authenticated;

-- Add comment to document the security model
COMMENT ON TABLE demo_submissions IS 'Stores demo access form submissions. Write-only table with no read access via application.';