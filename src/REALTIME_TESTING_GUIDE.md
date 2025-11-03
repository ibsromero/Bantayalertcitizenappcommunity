# 🧪 BantayAlert Real-Time Testing Guide

**Complete testing procedures for real-time features**

---

## 📋 Pre-Testing Checklist

Before testing, ensure:

- [ ] Database setup complete (`FINAL_SUPABASE_SETUP.sql` executed)
- [ ] Real-time enabled (`DATABASE_REALTIME_SETUP.sql` executed)
- [ ] Edge Functions deployed (both `server` and `departmentApiService`)
- [ ] Environment variables set in Supabase
- [ ] Browser console open for monitoring

---

## 🎯 Test Scenarios

### Test 1: Basic SOS Alert Real-Time

**Goal:** Verify SOS alerts appear instantly in department dashboard

**Setup:**
1. Open app in **two browser tabs**
2. Tab 1: Sign in as **Citizen** 
   - Email: `test@email.com`
   - Create an account if needed
3. Tab 2: Sign in as **Department** 
   - Email: `lgu@bantayalert.ph`
   - Password: `LGU2025!Manila`

**Test Steps:**

1. **In Tab 2 (Department):**
   - Go to "SOS Alerts" tab
   - Note current number of alerts
   - Open browser console
   - Look for: `🔴 Real-time SOS alert update`

2. **In Tab 1 (Citizen):**
   - Click the red **SOS button** (bottom right)
   - Fill in details:
     - Location: Allow browser location OR enter manually
     - Details: "Test Real-Time Alert"
     - Emergency contact: Your test number
   - Click "Send SOS Alert"

3. **In Tab 2 (Department):**
   - **DO NOT REFRESH**
   - Watch for new alert to appear (should be instant)
   - Console should show: `🔴 Real-time SOS alert update: INSERT`

**Expected Results:**
✅ Alert appears in department tab within 1-2 seconds  
✅ Console shows real-time notification  
✅ Alert details match what was entered  
✅ No page refresh required  

**If it fails:**
- Check console for errors
- Verify realtime is enabled: Run `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`
- Check network tab for subscription connection

---

### Test 2: Status Update Real-Time

**Goal:** Verify status changes propagate instantly

**Setup:**
- Keep both tabs open from Test 1
- Ensure there's at least one active SOS alert

**Test Steps:**

1. **In Tab 2 (Department):**
   - Find an active SOS alert
   - Click "Update Status"
   - Change status to **"Responding"**
   - Add resolution note: "Team dispatched"
   - Click Save

2. **In Tab 2 (Same Department tab):**
   - Status should update immediately
   - Badge color should change

3. **In Tab 1 (Citizen):**
   - If citizen sent the alert, they should see status change on refresh
   - (Future: implement citizen-side real-time too)

**Expected Results:**
✅ Status updates instantly in department dashboard  
✅ Badge color changes (red → yellow → green)  
✅ Resolution text appears  
✅ "Last updated" timestamp updates  

---

### Test 3: Multi-Department Coordination

**Goal:** Test real-time sync across multiple department users

**Setup:**
1. Open app in **three browser tabs/windows**
2. Tab 1: Citizen account
3. Tab 2: LGU (`lgu@bantayalert.ph` / `LGU2025!Manila`)
4. Tab 3: Emergency Responder (`responder@bantayalert.ph` / `RESP2025!911`)

**Test Steps:**

1. **In Tab 1 (Citizen):**
   - Send new SOS alert
   - Details: "Multi-department coordination test"

2. **In Tab 2 AND Tab 3 (Both Departments):**
   - **DO NOT REFRESH**
   - Both should see the new alert appear instantly
   - Console in both should show: `🔴 Real-time SOS alert update`

3. **In Tab 2 (LGU):**
   - Update alert status to "Responding"
   - Change priority to "Critical"

4. **In Tab 3 (Emergency Responder):**
   - **DO NOT REFRESH**
   - Should see status change to "Responding"
   - Should see priority change to "Critical"
   - Should see "Last updated by: LGU Administrator"

**Expected Results:**
✅ All departments see new alert instantly  
✅ Status updates propagate to all connected clients  
✅ No conflicts or race conditions  
✅ Last updater is tracked correctly  

---

### Test 4: Database Direct Insert

**Goal:** Verify app receives database changes from external sources

**Test Steps:**

1. **In Browser:**
   - Open department dashboard
   - Go to SOS Alerts tab
   - Keep console open

2. **In Supabase SQL Editor:**
   ```sql
   INSERT INTO sos_alerts (
     user_email,
     user_name,
     contact_number,
     location_address,
     details,
     status,
     priority
   ) VALUES (
     'external@test.com',
     'External System Test',
     '+63 999 999 9999',
     'Database Direct Insert',
     'Testing real-time from SQL',
     'active',
     'high'
   );
   ```

3. **In Browser:**
   - **DO NOT REFRESH**
   - New alert should appear automatically
   - Console should show real-time update

**Expected Results:**
✅ Alert from SQL appears in app within 1-2 seconds  
✅ Proves real-time works for any database changes  
✅ Can integrate with external systems  

---

### Test 5: Subscription Reconnection

**Goal:** Test real-time recovery after network interruption

**Test Steps:**

1. **Setup:**
   - Open department dashboard
   - Open browser DevTools → Network tab
   - Switch to "Offline" mode

2. **During Offline:**
   - Try to send SOS alert from another tab (will fail)
   - Or insert directly in database

3. **Go Back Online:**
   - Switch network back to "Online"
   - Wait 5-10 seconds

4. **Verify:**
   - Console should show: `✅ Subscribed to SOS alerts channel`
   - Refresh the page
   - All recent alerts should appear

**Expected Results:**
✅ App detects offline state  
✅ Automatically reconnects when online  
✅ Subscription re-established  
✅ No lost messages (on refresh)  

---

### Test 6: High-Volume Real-Time

**Goal:** Test performance with multiple rapid updates

**Test Steps:**

1. **In Supabase SQL Editor:**
   ```sql
   -- Insert 10 alerts rapidly
   DO $$
   DECLARE
     i INTEGER;
   BEGIN
     FOR i IN 1..10 LOOP
       INSERT INTO sos_alerts (
         user_email,
         user_name,
         contact_number,
         location_address,
         details,
         status,
         priority
       ) VALUES (
         'load.test' || i || '@email.com',
         'Load Test User ' || i,
         '+63 999 999 999' || i,
         'Test Location ' || i,
         'Load testing real-time updates',
         'active',
         CASE WHEN i % 2 = 0 THEN 'high' ELSE 'medium' END
       );
       PERFORM pg_sleep(0.1); -- 100ms delay between inserts
     END LOOP;
   END $$;
   ```

2. **In Department Dashboard:**
   - Watch alerts appear in real-time
   - Monitor console for any errors
   - Check for lag or missed updates

**Expected Results:**
✅ All 10 alerts appear  
✅ No errors in console  
✅ UI remains responsive  
✅ Order is maintained  

---

## 🔍 Monitoring & Debugging

### Browser Console Checks

**Good Signs:**
```
✅ Subscribed to SOS alerts channel
🔴 Real-time SOS alert update: INSERT
✅ Retrieved X SOS alerts from Supabase
```

**Bad Signs:**
```
❌ Failed to subscribe to real-time channel
⚠️ Subscription status: CHANNEL_ERROR
❌ Failed to load dashboard data
```

### Network Tab Checks

1. Open DevTools → Network tab
2. Filter: `ws` (WebSocket)
3. Look for: `realtime/v1/websocket`
4. Status should be: `101 Switching Protocols`
5. Messages tab should show heartbeats every 30s

### Database Checks

```sql
-- Check recent SOS alerts
SELECT id, user_name, status, created_at 
FROM sos_alerts 
ORDER BY created_at DESC 
LIMIT 10;

-- Check real-time subscriptions
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = current_database();
```

---

## 📊 Performance Benchmarks

**Expected Performance:**

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Initial Load | < 1s | < 2s | > 3s |
| Real-time Latency | < 500ms | < 2s | > 5s |
| Status Update | < 200ms | < 1s | > 2s |
| Multi-client Sync | < 1s | < 3s | > 5s |
| Reconnection | < 3s | < 10s | > 15s |

**How to Measure:**

```javascript
// In browser console
console.time('realtime-latency');

// Insert alert in database
// Then in browser console when alert appears:
console.timeEnd('realtime-latency');
// Should show: realtime-latency: 500-1000ms
```

---

## 🐛 Common Issues & Solutions

### Issue 1: No Real-Time Updates

**Symptoms:**
- Alerts don't appear without refresh
- Console shows: `Subscription status: CLOSED`

**Debug:**
```javascript
// In browser console
supabase.getChannels().forEach(channel => {
  console.log('Channel:', channel.topic);
  console.log('State:', channel.state);
});
```

**Solutions:**
1. Check realtime is enabled:
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime';
   ```
2. Re-run `DATABASE_REALTIME_SETUP.sql`
3. Refresh browser page
4. Check Supabase Dashboard → Database → Replication

### Issue 2: Delayed Updates (> 5 seconds)

**Causes:**
- Network latency
- Too many subscriptions
- Database overload

**Solutions:**
1. Check network speed
2. Reduce number of active subscriptions
3. Check Supabase Dashboard → Reports → Performance

### Issue 3: Duplicate Messages

**Symptoms:**
- Same alert appears multiple times
- Console shows duplicate notifications

**Solutions:**
1. Ensure only one subscription per channel
2. Check for multiple component mounts
3. Add unique key props to list items

### Issue 4: Authentication Errors

**Symptoms:**
```
❌ Failed to subscribe: Unauthorized
```

**Solutions:**
1. Check RLS policies allow read access
2. Verify user is authenticated
3. Check Supabase Dashboard → Authentication

---

## ✅ Test Completion Checklist

After running all tests:

- [ ] SOS alerts appear in real-time (< 2 seconds)
- [ ] Status updates propagate instantly
- [ ] Multiple departments see same data simultaneously
- [ ] Database direct inserts appear in app
- [ ] Subscription reconnects after network interruption
- [ ] High-volume updates handled smoothly
- [ ] Console shows no critical errors
- [ ] Network tab shows active WebSocket connection
- [ ] Database queries return expected results
- [ ] Performance meets benchmarks

---

## 📈 Load Testing (Optional)

For production readiness:

### Test 1: Concurrent Users

**Goal:** 10+ departments monitoring simultaneously

**Setup:**
1. Open 10+ browser tabs
2. Sign in to different department accounts
3. All monitoring same SOS alerts

**Test:**
- Send 1 SOS alert
- All 10 tabs should update simultaneously
- Monitor server load in Supabase Dashboard

### Test 2: Sustained Load

**Goal:** Handle continuous stream of alerts

**Setup:**
- Script to insert alerts every 10 seconds for 10 minutes
- Department dashboard open and monitoring

**Test:**
```sql
-- Run in background job
DO $$
DECLARE
  i INTEGER := 0;
BEGIN
  WHILE i < 60 LOOP -- 60 iterations = 10 minutes
    INSERT INTO sos_alerts (...) VALUES (...);
    PERFORM pg_sleep(10);
    i := i + 1;
  END LOOP;
END $$;
```

**Expected:**
- All alerts appear in real-time
- No memory leaks in browser
- Server response time stays < 1s

---

## 🎓 Training Scenarios

For training department users:

### Scenario 1: Typhoon Response

**Story:** Typhoon approaching NCR, multiple citizens need help

1. Simulate 5 SOS alerts from different locations
2. LGU department coordinates response
3. Emergency responders update statuses
4. Healthcare monitors for medical emergencies

### Scenario 2: Earthquake Drill

**Story:** Practice earthquake emergency response

1. Mass SOS alerts (10+) sent simultaneously
2. Departments triage by priority
3. Track response times
4. Coordinate evacuation center assignments

---

## 📚 Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [WebSocket Testing Tools](https://www.piesocket.com/websocket-tester)
- [Database Performance Monitoring](https://supabase.com/docs/guides/database/monitoring)

---

## 🆘 Need Help?

If tests fail:

1. **Check logs:**
   ```bash
   supabase functions logs --tail
   ```

2. **Verify setup:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```

3. **Reset subscriptions:**
   ```javascript
   // In browser console
   await supabase.removeAllChannels();
   window.location.reload();
   ```

4. **Contact support:**
   - Check `/TROUBLESHOOTING.md`
   - Review `/CURRENT_STATUS.md`
   - See `/REALTIME_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** November 3, 2025  
**Test Status:** Ready for Execution  
**Next Review:** After successful deployment
