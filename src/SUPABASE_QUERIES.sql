-- ============================================
-- BantayAlert - Supabase Dashboard Queries
-- Quick reference for managing and viewing data
-- ============================================

-- ============================================
-- USER OVERVIEW
-- ============================================

-- Total users
SELECT COUNT(*) as total_users FROM user_profiles;

-- Users registered in last 7 days
SELECT 
  email,
  name,
  created_at
FROM user_profiles
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Most active users
SELECT 
  up.email,
  up.name,
  COUNT(al.id) as activity_count
FROM user_profiles up
LEFT JOIN activity_logs al ON up.id = al.user_id
GROUP BY up.id
ORDER BY activity_count DESC
LIMIT 20;

-- ============================================
-- EMERGENCY CONTACTS
-- ============================================

-- Total emergency contacts
SELECT 
  COUNT(*) as total_contacts,
  COUNT(DISTINCT user_id) as users_with_contacts
FROM emergency_contacts;

-- Contacts per user
SELECT 
  up.email,
  COUNT(ec.id) as contact_count
FROM user_profiles up
LEFT JOIN emergency_contacts ec ON up.id = ec.user_id
GROUP BY up.email
ORDER BY contact_count DESC;

-- Users without emergency contacts
SELECT 
  up.email,
  up.name
FROM user_profiles up
LEFT JOIN emergency_contacts ec ON up.id = ec.user_id
WHERE ec.id IS NULL;

-- ============================================
-- PREPAREDNESS STATUS
-- ============================================

-- Overall preparedness by disaster type
SELECT 
  checklist_type,
  ROUND(AVG(progress), 2) as avg_progress,
  COUNT(*) as user_count
FROM preparation_checklists
GROUP BY checklist_type
ORDER BY avg_progress DESC;

-- Most prepared users
SELECT 
  up.email,
  ROUND(AVG(pc.progress), 2) as avg_preparedness,
  COUNT(pc.id) as checklists_count
FROM user_profiles up
LEFT JOIN preparation_checklists pc ON up.id = pc.user_id
GROUP BY up.email
HAVING AVG(pc.progress) IS NOT NULL
ORDER BY avg_preparedness DESC
LIMIT 10;

-- Users with 100% completion
SELECT 
  up.email,
  pc.checklist_type,
  pc.progress
FROM preparation_checklists pc
JOIN user_profiles up ON pc.user_id = up.id
WHERE pc.progress = 100
ORDER BY up.email;

-- Checklist completion rate
SELECT 
  checklist_type,
  COUNT(*) FILTER (WHERE progress = 100) as completed,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE progress = 100) / COUNT(*), 2) as completion_rate
FROM preparation_checklists
GROUP BY checklist_type;

-- ============================================
-- EMERGENCY KIT STATUS
-- ============================================

-- Kit items by status
SELECT 
  status,
  COUNT(*) as item_count,
  COUNT(DISTINCT user_id) as user_count
FROM emergency_kit_items
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'ready' THEN 1
    WHEN 'partial' THEN 2
    WHEN 'missing' THEN 3
    ELSE 4
  END;

-- Users with most ready items
SELECT 
  up.email,
  COUNT(*) FILTER (WHERE eki.status = 'ready') as ready_items,
  COUNT(*) as total_items,
  ROUND(100.0 * COUNT(*) FILTER (WHERE eki.status = 'ready') / COUNT(*), 2) as ready_percentage
FROM user_profiles up
LEFT JOIN emergency_kit_categories ekc ON up.id = ekc.user_id
LEFT JOIN emergency_kit_items eki ON ekc.id = eki.category_id
GROUP BY up.email
HAVING COUNT(*) > 0
ORDER BY ready_percentage DESC;

-- High priority items not ready
SELECT 
  up.email,
  eki.name,
  eki.status,
  eki.priority
FROM emergency_kit_items eki
JOIN emergency_kit_categories ekc ON eki.category_id = ekc.id
JOIN user_profiles up ON ekc.user_id = up.id
WHERE eki.priority = 'high' AND eki.status != 'ready'
ORDER BY up.email;

-- ============================================
-- ACTIVITY TRACKING
-- ============================================

-- Recent activities (last 24 hours)
SELECT 
  up.email,
  al.activity_type,
  al.activity_description,
  al.activity_timestamp
FROM activity_logs al
JOIN user_profiles up ON al.user_id = up.id
WHERE al.activity_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY al.activity_timestamp DESC;

-- Activity by type
SELECT 
  activity_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM activity_logs
GROUP BY activity_type
ORDER BY count DESC;

-- User engagement (activities per day)
SELECT 
  DATE(activity_timestamp) as date,
  COUNT(*) as activities,
  COUNT(DISTINCT user_id) as active_users
FROM activity_logs
WHERE activity_timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(activity_timestamp)
ORDER BY date DESC;

-- Most engaged users (last 30 days)
SELECT 
  up.email,
  COUNT(al.id) as activity_count,
  MAX(al.activity_timestamp) as last_activity
FROM user_profiles up
LEFT JOIN activity_logs al ON up.id = al.user_id
WHERE al.activity_timestamp > NOW() - INTERVAL '30 days'
GROUP BY up.email
ORDER BY activity_count DESC
LIMIT 10;

-- ============================================
-- USER SETTINGS
-- ============================================

-- Location distribution
SELECT 
  location_city,
  COUNT(*) as user_count
FROM user_settings
WHERE location_city IS NOT NULL
GROUP BY location_city
ORDER BY user_count DESC;

-- Family size distribution
SELECT 
  family_members,
  COUNT(*) as user_count
FROM user_settings
GROUP BY family_members
ORDER BY family_members;

-- Alert preferences
SELECT 
  COUNT(*) FILTER (WHERE alert_severe_weather = true) as severe_weather_enabled,
  COUNT(*) FILTER (WHERE alert_earthquakes = true) as earthquakes_enabled,
  COUNT(*) FILTER (WHERE alert_floods = true) as floods_enabled,
  COUNT(*) FILTER (WHERE alert_typhoons = true) as typhoons_enabled,
  COUNT(*) as total_users
FROM user_settings;

-- ============================================
-- WEATHER ALERTS
-- ============================================

-- Recent weather alerts
SELECT 
  up.email,
  wa.alert_type,
  wa.alert_title,
  wa.alert_severity,
  wa.alert_timestamp,
  wa.is_read
FROM weather_alerts_history wa
JOIN user_profiles up ON wa.user_id = up.id
ORDER BY wa.alert_timestamp DESC
LIMIT 50;

-- Alert engagement
SELECT 
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (WHERE is_read = true) as read_alerts,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_read = true) / COUNT(*), 2) as read_rate
FROM weather_alerts_history;

-- Alerts by severity
SELECT 
  alert_severity,
  COUNT(*) as count
FROM weather_alerts_history
GROUP BY alert_severity
ORDER BY 
  CASE alert_severity
    WHEN 'severe' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
    ELSE 5
  END;

-- ============================================
-- COMMUNICATION PLANS
-- ============================================

-- Users with communication plans
SELECT 
  COUNT(*) as users_with_plans,
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM user_profiles), 2) as percentage
FROM communication_plans;

-- Communication plan completeness
SELECT 
  up.email,
  cp.meeting_point_primary IS NOT NULL as has_primary_meeting_point,
  cp.meeting_point_secondary IS NOT NULL as has_secondary_meeting_point,
  cp.out_of_town_contact_name IS NOT NULL as has_out_of_town_contact
FROM user_profiles up
LEFT JOIN communication_plans cp ON up.id = cp.user_id;

-- ============================================
-- DATA QUALITY CHECKS
-- ============================================

-- Users with incomplete profiles
SELECT 
  up.email,
  up.name,
  (SELECT COUNT(*) FROM emergency_contacts WHERE user_id = up.id) as contacts,
  (SELECT AVG(progress) FROM preparation_checklists WHERE user_id = up.id) as avg_preparedness,
  (SELECT COUNT(*) FROM emergency_kit_items eki 
   JOIN emergency_kit_categories ekc ON eki.category_id = ekc.id 
   WHERE ekc.user_id = up.id AND eki.status = 'ready') as ready_items
FROM user_profiles up;

-- Orphaned records check (should all be 0)
SELECT 
  'emergency_contacts' as table_name,
  COUNT(*) as orphaned_records
FROM emergency_contacts ec
LEFT JOIN user_profiles up ON ec.user_id = up.id
WHERE up.id IS NULL

UNION ALL

SELECT 
  'activity_logs' as table_name,
  COUNT(*) as orphaned_records
FROM activity_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
WHERE up.id IS NULL;

-- ============================================
-- EXPORT QUERIES
-- ============================================

-- Export all user data (for backup)
SELECT 
  up.email,
  up.name,
  up.created_at,
  (SELECT COUNT(*) FROM emergency_contacts WHERE user_id = up.id) as emergency_contacts,
  (SELECT AVG(progress) FROM preparation_checklists WHERE user_id = up.id) as avg_preparedness,
  (SELECT COUNT(*) FROM activity_logs WHERE user_id = up.id) as total_activities,
  us.location_city,
  us.family_members
FROM user_profiles up
LEFT JOIN user_settings us ON up.id = us.user_id
ORDER BY up.created_at DESC;

-- Export emergency preparedness report
SELECT 
  up.email,
  pc.checklist_type,
  pc.progress,
  pc.updated_at as last_updated
FROM preparation_checklists pc
JOIN user_profiles up ON pc.user_id = up.id
ORDER BY up.email, pc.checklist_type;

-- ============================================
-- MONITORING & ALERTS
-- ============================================

-- Inactive users (no activity in 30 days)
SELECT 
  up.email,
  up.name,
  MAX(al.activity_timestamp) as last_activity
FROM user_profiles up
LEFT JOIN activity_logs al ON up.id = al.user_id
GROUP BY up.id
HAVING MAX(al.activity_timestamp) < NOW() - INTERVAL '30 days'
   OR MAX(al.activity_timestamp) IS NULL
ORDER BY last_activity DESC NULLS LAST;

-- Users who signed up but never took action
SELECT 
  up.email,
  up.created_at,
  COUNT(al.id) as activity_count
FROM user_profiles up
LEFT JOIN activity_logs al ON up.id = al.user_id
GROUP BY up.id
HAVING COUNT(al.id) = 0
ORDER BY up.created_at DESC;

-- Database statistics
SELECT 
  'Users' as metric,
  COUNT(*) as count
FROM user_profiles

UNION ALL

SELECT 
  'Emergency Contacts' as metric,
  COUNT(*) as count
FROM emergency_contacts

UNION ALL

SELECT 
  'Checklist Items' as metric,
  COUNT(*) as count
FROM checklist_items

UNION ALL

SELECT 
  'Kit Items' as metric,
  COUNT(*) as count
FROM emergency_kit_items

UNION ALL

SELECT 
  'Activities Logged' as metric,
  COUNT(*) as count
FROM activity_logs

UNION ALL

SELECT 
  'Weather Alerts' as metric,
  COUNT(*) as count
FROM weather_alerts_history;

-- ============================================
-- PERFORMANCE QUERIES
-- ============================================

-- Table sizes (for monitoring)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
