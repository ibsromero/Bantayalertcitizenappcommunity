-- ============================================
-- SOS ALERTS SCHEMA FIX
-- Run this if you get "message column not found" error
-- ============================================

-- This script will fix the sos_alerts table schema mismatch
-- The old schema used: citizen_name, citizen_email, citizen_phone, message
-- The new schema uses: user_name, user_email, contact_number, details, resolution

-- OPTION 1: If you have no data yet (RECOMMENDED)
-- Simply drop and recreate with correct schema
DROP TABLE IF EXISTS public.sos_alerts CASCADE;

CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT DEFAULT 'Location not provided',
  details TEXT NOT NULL,
  priority TEXT DEFAULT 'high',
  status TEXT DEFAULT 'active',
  responded_by TEXT,
  responded_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SOS Alerts
-- Anyone can insert (citizens creating SOS alerts)
CREATE POLICY "Anyone can insert SOS alerts"
  ON public.sos_alerts
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view (departments need to see all alerts)
CREATE POLICY "Anyone can view SOS alerts"
  ON public.sos_alerts
  FOR SELECT
  USING (true);

-- Only authenticated users can update (departments responding to alerts)
CREATE POLICY "Authenticated users can update SOS alerts"
  ON public.sos_alerts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_sos_alerts_status ON public.sos_alerts(status);
CREATE INDEX idx_sos_alerts_priority ON public.sos_alerts(priority);
CREATE INDEX idx_sos_alerts_created_at ON public.sos_alerts(created_at DESC);
CREATE INDEX idx_sos_alerts_user_email ON public.sos_alerts(user_email);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;

-- ============================================
-- OPTION 2: If you have existing data to migrate
-- ============================================
-- Uncomment and run these instead of the DROP TABLE above:

/*
-- Rename old table
ALTER TABLE IF EXISTS public.sos_alerts RENAME TO sos_alerts_old;

-- Create new table with correct schema
CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT DEFAULT 'Location not provided',
  details TEXT NOT NULL,
  priority TEXT DEFAULT 'high',
  status TEXT DEFAULT 'active',
  responded_by TEXT,
  responded_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate data from old table to new table
INSERT INTO public.sos_alerts (
  id,
  user_id,
  user_email,
  user_name,
  contact_number,
  location_lat,
  location_lng,
  location_address,
  details,
  priority,
  status,
  responded_by,
  responded_at,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  COALESCE(citizen_email, 'unknown@example.com'),
  COALESCE(citizen_name, 'Unknown Citizen'),
  COALESCE(citizen_phone, 'Not provided'),
  latitude,
  longitude,
  COALESCE(location_text, 'Location not provided'),
  COALESCE(message, emergency_type, 'Emergency assistance needed'),
  COALESCE(priority, 'high'),
  COALESCE(status, 'active'),
  responded_by,
  responded_at,
  created_at,
  updated_at
FROM sos_alerts_old;

-- Verify migration
SELECT COUNT(*) as old_count FROM sos_alerts_old;
SELECT COUNT(*) as new_count FROM sos_alerts;

-- If counts match and data looks good, drop old table
-- DROP TABLE sos_alerts_old;

-- Apply RLS policies and indexes (same as Option 1)
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert SOS alerts"
  ON public.sos_alerts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view SOS alerts"
  ON public.sos_alerts
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update SOS alerts"
  ON public.sos_alerts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_sos_alerts_status ON public.sos_alerts(status);
CREATE INDEX idx_sos_alerts_priority ON public.sos_alerts(priority);
CREATE INDEX idx_sos_alerts_created_at ON public.sos_alerts(created_at DESC);
CREATE INDEX idx_sos_alerts_user_email ON public.sos_alerts(user_email);

ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sos_alerts'
ORDER BY ordinal_position;

-- Expected columns:
-- id               | uuid                     | NO
-- user_id          | uuid                     | YES
-- user_email       | text                     | NO
-- user_name        | text                     | NO
-- contact_number   | text                     | NO
-- location_lat     | double precision         | YES
-- location_lng     | double precision         | YES
-- location_address | text                     | YES
-- details          | text                     | NO
-- priority         | text                     | YES
-- status           | text                     | YES
-- responded_by     | text                     | YES
-- responded_at     | timestamp with time zone | YES
-- resolution       | text                     | YES
-- created_at       | timestamp with time zone | YES
-- updated_at       | timestamp with time zone | YES

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'sos_alerts';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sos_alerts';

-- Test insert (should work)
INSERT INTO public.sos_alerts (
  user_email,
  user_name,
  contact_number,
  details
) VALUES (
  'test@example.com',
  'Test User',
  '09123456789',
  'Test SOS alert'
) RETURNING *;

-- Clean up test data
DELETE FROM public.sos_alerts WHERE user_email = 'test@example.com';

COMMIT;
