# 🚀 BantayAlert Real-Time Deployment Guide

**Complete step-by-step guide to deploy Edge Functions and enable real-time features**

Last Updated: November 3, 2025  
Status: Ready for Production Deployment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Edge Functions Deployment](#edge-functions-deployment)
4. [Real-Time Configuration](#real-time-configuration)
5. [Testing Real-Time Features](#testing-real-time-features)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase

# Or download directly from GitHub
# https://github.com/supabase/cli/releases
```

### 2. Verify Installation

```bash
supabase --version
# Should show version 1.x.x or higher
```

### 3. Get Your Supabase Project Details

From your Supabase Dashboard (https://supabase.com/dashboard):

1. **Project URL**: `https://gzefyknnjlsjmcgndbfn.supabase.co`
2. **Project ID**: `gzefyknnjlsjmcgndbfn`
3. **Anon Key**: Already configured in `/utils/supabase/info.tsx`
4. **Service Role Key**: Found in Settings → API → `service_role` (secret)

⚠️ **IMPORTANT**: Keep your Service Role Key secret! Never commit it to Git.

---

## 🗄️ Database Setup

### Step 1: Enable Realtime on Tables

1. Go to Supabase Dashboard → Database → Replication
2. Enable realtime for these tables:
   - ✅ `sos_alerts`
   - ✅ `disaster_events` (if exists)
   - ✅ `hospitals` (if exists)
   - ✅ `weather_warnings` (if exists)

Or run this SQL in Supabase SQL Editor:

```sql
-- Enable Realtime on SOS Alerts (CRITICAL)
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;

-- Enable Realtime on other department tables (if they exist)
ALTER PUBLICATION supabase_realtime ADD TABLE disaster_events;
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_warnings;
```

### Step 2: Run Complete Database Setup

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `/FINAL_SUPABASE_SETUP.sql`
3. Paste and click **Run**
4. Verify all tables were created successfully

Expected output:
```
✓ Created user_profiles
✓ Created emergency_contacts
✓ Created preparation_checklists
✓ Created emergency_kit_items
✓ Created sos_alerts
✓ Created disasters
✓ Created hospitals
✓ Created evacuation_centers
✓ Created kv_store
✓ Created user_activity_log
```

### Step 3: Verify Row Level Security (RLS)

Run this to check RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

---

## 🚀 Edge Functions Deployment

### Step 1: Login to Supabase

```bash
supabase login
```

This will open your browser. Log in with your Supabase account.

### Step 2: Link Your Project

```bash
supabase link --project-ref gzefyknnjlsjmcgndbfn
```

When prompted for the database password, use your Supabase project database password (found in Settings → Database).

### Step 3: Set Environment Variables

You need to set these secrets for your Edge Functions:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://gzefyknnjlsjmcgndbfn.supabase.co

# Set Service Role Key (get from Supabase Dashboard → Settings → API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Replace `your_service_role_key_here` with your actual service role key!**

### Step 4: Deploy Edge Functions

Deploy both Edge Functions:

```bash
# Deploy the main server function
supabase functions deploy server

# Deploy the department API service
supabase functions deploy departmentApiService
```

Expected output for each:
```
✓ Deployed function: server (version abc123)
✓ Function URL: https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/server
```

### Step 5: Verify Deployment

Test the health endpoint:

```bash
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "BantayAlert API",
  "version": "2.0.0-token-fix",
  "timestamp": "2025-11-03T..."
}
```

---

## 🔴 Real-Time Configuration

### How Real-Time Works in BantayAlert

1. **SOS Alerts**: Citizen sends SOS → Saved to database → Department dashboard updates instantly
2. **Disasters**: Department creates disaster → All dashboards update in real-time
3. **Hospital Capacity**: Hospital updates beds → All users see latest availability

### Already Configured (No Action Needed)

The app already has real-time subscriptions configured in:

- `/utils/realtimeDepartmentService.ts` - All real-time subscriptions
- `/components/DepartmentDashboard.tsx` - Dashboard auto-refresh
- `/components/department/SOSAlertTracker.tsx` - SOS real-time updates

### Real-Time Flow

```
Citizen Sends SOS
    ↓
Saved to sos_alerts table
    ↓
Supabase Realtime broadcasts change
    ↓
Department Dashboard receives update
    ↓
UI updates automatically (no refresh needed)
```

---

## 🧪 Testing Real-Time Features

### Test 1: SOS Alert Real-Time

**Setup:**
1. Open app in two browser windows/tabs
2. Window 1: Sign in as **Citizen** (`test@email.com`)
3. Window 2: Sign in as **Department** (`lgu@bantayalert.ph` / `LGU2025!Manila`)

**Test:**
1. In Window 1 (Citizen): Press SOS button
2. In Window 2 (Department): Watch SOS Alert Tracker tab
3. ✅ **Expected**: Alert appears immediately without refreshing

**Verify in Console:**
```
🔴 Real-time SOS alert update: INSERT
✅ Retrieved X SOS alerts from Supabase
```

### Test 2: Alert Status Update Real-Time

**Setup:**
1. Same two windows as Test 1
2. Make sure there's at least one active SOS alert

**Test:**
1. In Window 2 (Department): Update SOS alert status to "Responding"
2. ✅ **Expected**: Status changes immediately
3. Refresh Window 1 (Citizen): Should see updated status

**Verify in Database:**
```sql
SELECT id, user_name, status, priority, updated_at 
FROM sos_alerts 
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 3: Multi-Department Coordination

**Setup:**
1. Open 3 browser windows
2. Window 1: Citizen
3. Window 2: LGU (`lgu@bantayalert.ph`)
4. Window 3: Emergency Responder (`responder@bantayalert.ph`)

**Test:**
1. Citizen sends SOS
2. ✅ Both department dashboards should show the alert instantly
3. LGU updates status to "Responding"
4. ✅ Emergency Responder sees the status change instantly

### Test 4: Database Direct Insert

**Test real-time without the app:**

```sql
-- Insert a test SOS alert directly in database
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
  'Test Location',
  'Testing real-time updates',
  'active',
  'high'
);
```

✅ **Expected**: Department dashboard shows new alert without refresh

---

## 🔧 Troubleshooting

### Issue 1: "Failed to fetch" Errors After Deployment

**Symptom:**
```
⚠️ Analytics API failed, falling back to mock data
Error details: Failed to fetch
```

**Solution:**
1. Check Edge Function is deployed:
   ```bash
   supabase functions list
   ```
2. Verify environment variables:
   ```bash
   supabase secrets list
   ```
3. Check function logs:
   ```bash
   supabase functions logs departmentApiService
   ```

### Issue 2: Real-Time Not Working

**Symptom:** Changes in database don't appear in app without refresh

**Checklist:**
- [ ] Is Realtime enabled on the table?
  ```sql
  SELECT * FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime';
  ```
- [ ] Are you subscribed to the channel? (Check browser console for "Subscribed" message)
- [ ] Is RLS policy blocking real-time updates?
- [ ] Is the browser tab in focus? (Some browsers pause timers in background tabs)

**Solution:**
1. Re-enable Realtime:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
   ```
2. Refresh the page to restart subscriptions
3. Check browser console for subscription status

### Issue 3: Authentication Errors in Edge Functions

**Symptom:**
```json
{"error": "Unauthorized - Department access only"}
```

**Solution:**
1. Check token is being sent:
   - Open Browser DevTools → Network
   - Look for request headers
   - Should have `X-Department-Token: dept_...`

2. Verify token format:
   ```javascript
   // In browser console
   const user = JSON.parse(localStorage.getItem('USER'));
   console.log('Token:', user.accessToken);
   // Should start with "dept_" and have a "."
   ```

3. Sign out and sign back in to get fresh token

### Issue 4: Database Connection Errors

**Symptom:**
```
Error: relation "sos_alerts" does not exist
```

**Solution:**
Run the complete database setup script again (`/FINAL_SUPABASE_SETUP.sql`)

### Issue 5: CORS Errors

**Symptom:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
Edge Functions already have CORS configured. If you still see errors:
1. Check if URL is correct: `https://gzefyknnjlsjmcgndbfn.supabase.co`
2. Verify function is deployed: `supabase functions list`
3. Check browser is not blocking requests (disable extensions)

### Issue 6: Slow Real-Time Updates

**Symptom:** Updates take 5-10 seconds to appear

**Possible Causes:**
1. Network latency
2. Too many subscriptions
3. Database overload

**Solution:**
1. Reduce number of active subscriptions
2. Use debouncing for rapid updates
3. Check Supabase Dashboard → Reports for database performance

---

## 🎯 Post-Deployment Checklist

After deploying Edge Functions, verify:

- [ ] Health endpoint returns 200 OK
- [ ] SOS alerts save to database (not just kv_store)
- [ ] Real-time subscriptions connect successfully
- [ ] Department authentication works
- [ ] Analytics loads real data (not mock)
- [ ] Console shows no critical errors
- [ ] Citizens can send SOS alerts
- [ ] Departments can update alert status
- [ ] Changes appear instantly (within 1-2 seconds)

---

## 📊 Monitoring Real-Time Performance

### Check Active Subscriptions

```javascript
// In browser console
supabase.getChannels().forEach(channel => {
  console.log('Channel:', channel.topic);
  console.log('State:', channel.state);
});
```

### Monitor Database Connections

In Supabase Dashboard → Database → Connection Pooling:
- Check active connections
- Should be < 10 for normal operation

### View Real-Time Logs

```bash
# View all function logs
supabase functions logs

# View specific function
supabase functions logs departmentApiService --tail

# View only errors
supabase functions logs server --level error
```

---

## 🔐 Security Best Practices

### 1. Protect Service Role Key

Never expose in:
- ❌ Client-side code
- ❌ Git repositories
- ❌ Public documentation
- ❌ Error messages

Only use in:
- ✅ Edge Functions (server-side)
- ✅ Supabase secrets
- ✅ Secure environment variables

### 2. Row Level Security (RLS)

All tables have RLS enabled. Verify policies:

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Department Authentication

Department tokens are verified server-side in Edge Functions. Never trust client-side validation alone.

### 4. Rate Limiting

Supabase automatically rate limits requests. For additional protection:

```typescript
// Add rate limiting in Edge Functions
const rateLimitKey = `rate_limit_${clientIP}`;
// Implement Redis-based rate limiting
```

---

## 🚀 Production Optimization

### 1. Database Indexes

For better real-time performance:

```sql
-- Index for faster SOS alert queries
CREATE INDEX idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX idx_sos_alerts_created ON sos_alerts(created_at DESC);

-- Index for disaster queries
CREATE INDEX idx_disasters_active ON disasters(status) 
WHERE status IN ('active', 'monitoring');
```

### 2. Connection Pooling

Already configured in Supabase. No action needed.

### 3. Caching Strategy

```typescript
// Client-side caching with SWR
import useSWR from 'swr';

const { data, error } = useSWR(
  'sos-alerts',
  () => getSOSAlerts('active'),
  { refreshInterval: 5000 } // Refresh every 5 seconds
);
```

### 4. Realtime Filters

Reduce bandwidth by filtering subscriptions:

```typescript
// Only subscribe to high priority alerts
const channel = supabase
  .channel('critical-sos')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'sos_alerts',
      filter: 'priority=eq.critical'
    },
    callback
  )
  .subscribe();
```

---

## 📚 Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 🆘 Need Help?

### Common Questions

**Q: Do I need to redeploy Edge Functions when I update code?**  
A: Yes. Run `supabase functions deploy [function-name]` after code changes.

**Q: Can I test Edge Functions locally?**  
A: Yes! Use `supabase functions serve server` to run locally.

**Q: How do I roll back a deployment?**  
A: Supabase keeps deployment history. Use dashboard to view and restore previous versions.

**Q: What happens if Edge Functions are down?**  
A: The app automatically falls back to mock data. Critical features (SOS) use direct database access.

---

## ✅ Success Indicators

You've successfully deployed when:

1. ✅ `curl` to health endpoint returns 200
2. ✅ No "Failed to fetch" errors in console
3. ✅ Department dashboard loads real data
4. ✅ SOS alerts appear instantly in department view
5. ✅ Status updates propagate in real-time
6. ✅ Multiple departments see same data simultaneously
7. ✅ Database has recent entries in all tables
8. ✅ Supabase Dashboard shows active connections
9. ✅ Function logs show successful requests
10. ✅ No authentication errors

---

## 🎉 You're Done!

Your BantayAlert app now has:
- ✅ Real-time SOS alerts
- ✅ Live department coordination
- ✅ Instant status updates
- ✅ Multi-user synchronization
- ✅ Production-ready infrastructure

**Next Steps:**
1. Test all features thoroughly
2. Train department users
3. Monitor performance
4. Gather user feedback
5. Iterate and improve!

---

**Last Updated:** November 3, 2025  
**Maintained By:** BantayAlert Development Team  
**Version:** 2.0 - Real-Time Edition
