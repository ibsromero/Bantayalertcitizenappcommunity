-- ============================================================================
-- BANTAYALERT - REAL-TIME DATABASE SETUP
-- ============================================================================
-- This script configures Supabase for REAL-TIME updates
-- Run this in Supabase SQL Editor AFTER running FINAL_SUPABASE_SETUP.sql
-- ============================================================================

-- STEP 1: Enable Realtime on Critical Tables
-- ============================================================================
-- This allows the app to receive instant updates when data changes

-- Enable Realtime for SOS Alerts (MOST CRITICAL)
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;

-- Enable Realtime for Disasters
ALTER PUBLICATION supabase_realtime ADD TABLE disasters;

-- Enable Realtime for Hospitals
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;

-- Enable Realtime for Evacuation Centers
ALTER PUBLICATION supabase_realtime ADD TABLE evacuation_centers;

-- Verify Realtime is enabled
SELECT 
  schemaname,
  tablename,
  'Realtime enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- ============================================================================
-- STEP 2: Create Indexes for Fast Real-Time Queries
-- ============================================================================

-- SOS Alerts indexes (for fast filtering and sorting)
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status 
ON sos_alerts(status);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_created 
ON sos_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_priority 
ON sos_alerts(priority);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_user 
ON sos_alerts(user_id);

-- Composite index for active high-priority alerts
CREATE INDEX IF NOT EXISTS idx_sos_alerts_active_priority 
ON sos_alerts(status, priority, created_at DESC) 
WHERE status IN ('active', 'responding');

-- Disasters indexes
CREATE INDEX IF NOT EXISTS idx_disasters_status 
ON disasters(status);

CREATE INDEX IF NOT EXISTS idx_disasters_active 
ON disasters(status, created_at DESC) 
WHERE status IN ('active', 'monitoring');

-- Hospitals indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_status 
ON hospitals(status);

CREATE INDEX IF NOT EXISTS idx_hospitals_capacity 
ON hospitals(available_beds) 
WHERE status = 'operational';

-- ============================================================================
-- STEP 3: Create Real-Time Notification Functions
-- ============================================================================

-- Function to notify when new SOS alert is created
CREATE OR REPLACE FUNCTION notify_new_sos_alert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_sos_alert',
    json_build_object(
      'id', NEW.id,
      'user_name', NEW.user_name,
      'priority', NEW.priority,
      'location', NEW.location_address,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify when SOS alert status changes
CREATE OR REPLACE FUNCTION notify_sos_alert_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM pg_notify(
      'sos_alert_status_changed',
      json_build_object(
        'id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'responded_by', NEW.responded_by,
        'updated_at', NEW.updated_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Create Triggers for Real-Time Notifications
-- ============================================================================

-- Trigger for new SOS alerts
DROP TRIGGER IF EXISTS trigger_new_sos_alert ON sos_alerts;
CREATE TRIGGER trigger_new_sos_alert
  AFTER INSERT ON sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_sos_alert();

-- Trigger for SOS alert updates
DROP TRIGGER IF EXISTS trigger_sos_alert_update ON sos_alerts;
CREATE TRIGGER trigger_sos_alert_update
  AFTER UPDATE ON sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION notify_sos_alert_update();

-- ============================================================================
-- STEP 5: Create Analytics View for Real-Time Dashboard
-- ============================================================================

-- View for real-time statistics
CREATE OR REPLACE VIEW realtime_analytics AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'active') as active_sos_alerts,
  COUNT(*) FILTER (WHERE status = 'responding') as responding_sos_alerts,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_sos_alerts,
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_alerts,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_alerts,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as alerts_last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as alerts_last_hour,
  AVG(
    EXTRACT(EPOCH FROM (responded_at - created_at))/60
  ) FILTER (WHERE responded_at IS NOT NULL) as avg_response_time_minutes
FROM sos_alerts;

-- Grant access to analytics view
GRANT SELECT ON realtime_analytics TO authenticated;
GRANT SELECT ON realtime_analytics TO anon;

-- ============================================================================
-- STEP 6: Create Functions for Real-Time Data Aggregation
-- ============================================================================

-- Function to get real-time disaster summary
CREATE OR REPLACE FUNCTION get_disaster_summary()
RETURNS TABLE (
  total_active INTEGER,
  total_affected INTEGER,
  total_evacuees INTEGER,
  critical_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_active,
    COALESCE(SUM(affected_population), 0)::INTEGER as total_affected,
    COALESCE(SUM(evacuees), 0)::INTEGER as total_evacuees,
    COUNT(*) FILTER (WHERE severity = 'critical')::INTEGER as critical_count
  FROM disasters
  WHERE status IN ('active', 'monitoring');
END;
$$ LANGUAGE plpgsql;

-- Function to get hospital capacity summary
CREATE OR REPLACE FUNCTION get_hospital_capacity_summary()
RETURNS TABLE (
  total_hospitals INTEGER,
  operational_hospitals INTEGER,
  total_beds INTEGER,
  available_beds INTEGER,
  occupancy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_hospitals,
    COUNT(*) FILTER (WHERE status = 'operational')::INTEGER as operational_hospitals,
    COALESCE(SUM(total_beds), 0)::INTEGER as total_beds,
    COALESCE(SUM(available_beds), 0)::INTEGER as available_beds,
    CASE 
      WHEN SUM(total_beds) > 0 THEN 
        ROUND((1 - SUM(available_beds)::NUMERIC / SUM(total_beds)) * 100, 1)
      ELSE 0
    END as occupancy_rate
  FROM hospitals;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Set Up Row Level Security for Real-Time
-- ============================================================================

-- Allow authenticated users to subscribe to real-time changes
-- SOS Alerts: Everyone can read, but only departments can update
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to sos_alerts" ON sos_alerts;
CREATE POLICY "Allow public read access to sos_alerts" 
ON sos_alerts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON sos_alerts;
CREATE POLICY "Allow insert for authenticated users" 
ON sos_alerts FOR INSERT 
WITH CHECK (true);

-- Disasters: Read by all, insert by authenticated
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to disasters" ON disasters;
CREATE POLICY "Allow public read access to disasters" 
ON disasters FOR SELECT 
USING (true);

-- Hospitals: Read by all
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to hospitals" ON hospitals;
CREATE POLICY "Allow public read access to hospitals" 
ON hospitals FOR SELECT 
USING (true);

-- ============================================================================
-- STEP 8: Create Sample Data for Testing Real-Time
-- ============================================================================

-- Insert test SOS alert (will trigger real-time notification)
INSERT INTO sos_alerts (
  user_email,
  user_name,
  contact_number,
  location_address,
  details,
  status,
  priority
) VALUES (
  'test@realtime.com',
  'Test Real-Time User',
  '+63 917 123 4567',
  'Test Location, Metro Manila',
  'Testing real-time SOS alerts - please ignore',
  'active',
  'medium'
);

-- Insert test disaster
INSERT INTO disasters (
  disaster_type,
  severity,
  location,
  affected_areas,
  affected_population,
  evacuees,
  status,
  description
) VALUES (
  'flood',
  'medium',
  'Marikina City',
  ARRAY['Brgy. Tumana', 'Brgy. Concepcion'],
  1500,
  450,
  'active',
  'River flooding due to heavy rainfall - TESTING'
);

-- ============================================================================
-- STEP 9: Verify Real-Time Setup
-- ============================================================================

-- Check which tables have realtime enabled
SELECT 
  schemaname,
  tablename,
  'Realtime: ENABLED' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('sos_alerts', 'disasters', 'hospitals')
ORDER BY tablename, indexname;

-- Check triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND event_object_table IN ('sos_alerts', 'disasters', 'hospitals')
ORDER BY event_object_table, trigger_name;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Get real-time statistics
SELECT * FROM realtime_analytics;

-- Get disaster summary
SELECT * FROM get_disaster_summary();

-- Get hospital capacity summary
SELECT * FROM get_hospital_capacity_summary();

-- ============================================================================
-- STEP 10: Test Real-Time Notifications
-- ============================================================================

-- To test real-time in psql:
-- 1. Open two psql sessions
-- 2. In session 1: LISTEN new_sos_alert;
-- 3. In session 2: Run the INSERT below
-- 4. Session 1 should receive notification

-- Test notification (run this to trigger real-time update)
/*
INSERT INTO sos_alerts (
  user_email,
  user_name,
  contact_number,
  location_address,
  details,
  status,
  priority
) VALUES (
  'notification.test@email.com',
  'Notification Test',
  '+63 999 999 9999',
  'Test Address',
  'Testing pg_notify',
  'active',
  'high'
);
*/

-- ============================================================================
-- ✅ SETUP COMPLETE
-- ============================================================================
-- Your database is now configured for real-time updates!
-- 
-- Next steps:
-- 1. Deploy Edge Functions (see /EDGE_FUNCTION_SETUP.md)
-- 2. Test real-time in the app
-- 3. Monitor performance in Supabase Dashboard
-- 
-- To verify everything works:
-- 1. Open app as citizen
-- 2. Send SOS alert
-- 3. Open app as department (different browser/tab)
-- 4. Alert should appear instantly without refresh
-- ============================================================================

-- Show setup summary
SELECT 
  'Real-Time Setup Complete!' as status,
  COUNT(*) as realtime_enabled_tables
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
