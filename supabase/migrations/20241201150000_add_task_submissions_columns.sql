-- Add missing columns to task_submissions table
-- created_at for ordering, feedback for reviewer comments

-- Add created_at column with default if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Add feedback column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'task_submissions' AND column_name = 'feedback'
  ) THEN
    ALTER TABLE task_submissions ADD COLUMN feedback TEXT;
  END IF;
END $$;

-- Enable RLS on task_submissions if not already enabled
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Users can create own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON task_submissions;

-- Allow users to view their own submissions
CREATE POLICY "Users can view own submissions" ON task_submissions
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Allow users to create their own submissions
CREATE POLICY "Users can create own submissions" ON task_submissions
  FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM users WHERE clerk_id = auth.uid()::text
  ));

-- Allow admins to view all submissions
CREATE POLICY "Admins can view all submissions" ON task_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.uid()::text
      AND role IN ('admin', 'super_admin', 'regional_leader')
    )
  );

-- Allow admins to update submissions (for review)
CREATE POLICY "Admins can update submissions" ON task_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE clerk_id = auth.uid()::text
      AND role IN ('admin', 'super_admin', 'regional_leader')
    )
  );
