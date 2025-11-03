# ✅ BantayAlert - Master Deployment Checklist

**Complete deployment guide from zero to production**

Last Updated: November 3, 2025

---

## 🎯 Overview

This checklist covers **everything** needed to deploy BantayAlert with full real-time functionality.

**Estimated Time:** 30-45 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Supabase account, basic terminal knowledge

---

## 📦 Phase 1: Initial Setup (5 minutes)

### 1.1 Supabase Account
- [ ] Created Supabase account at https://supabase.com
- [ ] Created new project (or using existing: `gzefyknnjlsjmcgndbfn`)
- [ ] Project is active and accessible

### 1.2 Project Information Collected
- [ ] Project ID: `gzefyknnjlsjmcgndbfn`
- [ ] Project URL: `https://gzefyknnjlsjmcgndbfn.supabase.co`
- [ ] Anon Key: (already in `/utils/supabase/info.tsx`)
- [ ] Service Role Key: (from Settings → API → `service_role`)

⚠️ **IMPORTANT:** Keep Service Role Key secret!

### 1.3 Tools Installation
- [ ] Supabase CLI installed
  ```bash
  brew install supabase/tap/supabase  # macOS
  scoop install supabase              # Windows
  ```
- [ ] Verified installation: `supabase --version`
- [ ] Git installed and configured

---

## 🗄️ Phase 2: Database Setup (10 minutes)

### 2.1 Run Main Database Script
- [ ] Opened Supabase Dashboard → SQL Editor
- [ ] Copied `/FINAL_SUPABASE_SETUP.sql`
- [ ] Pasted and clicked **Run**
- [ ] Verified success: All tables created

**Verify:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- [ ] `user_profiles`
- [ ] `emergency_contacts`
- [ ] `preparation_checklists`
- [ ] `emergency_kit_items`
- [ ] `sos_alerts`
- [ ] `disasters`
- [ ] `hospitals`
- [ ] `evacuation_centers`
- [ ] `kv_store`
- [ ] `user_activity_log`

### 2.2 Enable Real-Time
- [ ] Copied `/DATABASE_REALTIME_SETUP.sql`
- [ ] Pasted in SQL Editor and ran
- [ ] Verified realtime enabled on critical tables

**Verify:**
```sql
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
ORDER BY tablename;
```

Expected tables with realtime:
- [ ] `sos_alerts` ⭐ CRITICAL
- [ ] `disasters`
- [ ] `hospitals`
- [ ] `evacuation_centers`

### 2.3 Enable Realtime in Dashboard
- [ ] Went to Database → Replication
- [ ] Enabled realtime for:
  - [ ] `sos_alerts`
  - [ ] `disasters`
  - [ ] `hospitals`
- [ ] Saved changes

---

## 🚀 Phase 3: Edge Functions Deployment (10 minutes)

### 3.1 CLI Setup
- [ ] Logged in: `supabase login`
- [ ] Linked project: `supabase link --project-ref gzefyknnjlsjmcgndbfn`
- [ ] Entered database password when prompted

### 3.2 Set Environment Variables
- [ ] Set Supabase URL:
  ```bash
  supabase secrets set SUPABASE_URL=https://gzefyknnjlsjmcgndbfn.supabase.co
  ```
- [ ] Set Service Role Key:
  ```bash
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```

**Verify:**
```bash
supabase secrets list
```

Should show:
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### 3.3 Deploy Functions
- [ ] Deployed server function:
  ```bash
  supabase functions deploy server
  ```
- [ ] Deployed department API:
  ```bash
  supabase functions deploy departmentApiService
  ```

**Verify:**
```bash
supabase functions list
```

Should show:
- [ ] `server` (deployed)
- [ ] `departmentApiService` (deployed)

### 3.4 Test Deployment
- [ ] Tested health endpoint:
  ```bash
  curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
  ```
- [ ] Received response: `{"status":"ok"}`

---

## 🧪 Phase 4: Testing (10 minutes)

### 4.1 Citizen Side Testing
- [ ] Opened app in browser
- [ ] Created new citizen account
- [ ] Verified features work:
  - [ ] Add emergency contact
  - [ ] Complete checklist item
  - [ ] Add kit item
  - [ ] Send SOS alert ⭐ CRITICAL

### 4.2 Department Side Testing
- [ ] Opened app in new incognito window
- [ ] Signed in as LGU:
  - Email: `lgu@bantayalert.ph`
  - Password: `LGU2025!Manila`
- [ ] Verified dashboard loads
- [ ] Checked for errors in console

### 4.3 Real-Time Testing
- [ ] Opened app in TWO tabs:
  - Tab 1: Citizen account
  - Tab 2: Department account (LGU)
- [ ] In Tab 1: Sent SOS alert
- [ ] In Tab 2: Alert appeared WITHOUT refresh ⭐ CRITICAL
- [ ] Console showed: `🔴 Real-time SOS alert update`

### 4.4 Multi-Department Testing
- [ ] Opened third tab with Emergency Responder:
  - Email: `responder@bantayalert.ph`
  - Password: `RESP2025!911`
- [ ] Sent SOS from citizen
- [ ] Both departments saw alert instantly
- [ ] LGU updated status
- [ ] Emergency Responder saw update instantly

---

## 🔐 Phase 5: Security Verification (5 minutes)

### 5.1 Row Level Security
- [ ] Verified RLS enabled on all tables:
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  ```
- [ ] All tables show `rowsecurity = true`

### 5.2 API Keys
- [ ] Service Role Key NOT exposed in client code
- [ ] Anon Key only used in client
- [ ] No secrets in Git repository
- [ ] `.env.local` in `.gitignore`

### 5.3 Department Authentication
- [ ] Department passwords are strong
- [ ] Tokens verified server-side
- [ ] Session stored securely
- [ ] No plain-text passwords in logs

---

## 📊 Phase 6: Performance Check (5 minutes)

### 6.1 Real-Time Latency
- [ ] SOS alert appears in < 2 seconds
- [ ] Status updates in < 1 second
- [ ] No lag in UI

### 6.2 Database Performance
- [ ] Checked Supabase Dashboard → Reports
- [ ] Query time < 100ms average
- [ ] No slow queries
- [ ] Connection count < 50

### 6.3 Edge Functions
- [ ] Response time < 1 second
- [ ] No 500 errors in logs
- [ ] Checked logs:
  ```bash
  supabase functions logs --tail
  ```

---

## 🎉 Phase 7: Production Readiness (5 minutes)

### 7.1 Feature Completeness
- [ ] All citizen features working
- [ ] All department features working
- [ ] Real-time updates functional
- [ ] No critical errors in console

### 7.2 Data Integrity
- [ ] Sample data inserted
- [ ] User data persisting
- [ ] SOS alerts saving correctly
- [ ] Status updates working

### 7.3 User Experience
- [ ] Pages load quickly
- [ ] No broken images
- [ ] Mobile responsive
- [ ] Error messages clear

### 7.4 Documentation
- [ ] Read `/REALTIME_DEPLOYMENT_GUIDE.md`
- [ ] Reviewed `/REALTIME_TESTING_GUIDE.md`
- [ ] Checked `/CURRENT_STATUS.md`
- [ ] Familiar with `/TROUBLESHOOTING.md`

---

## 🚨 Critical Path Items

These MUST work for production:

### ⭐ Critical #1: SOS Alerts
- [ ] Citizen can send SOS alert
- [ ] Alert saves to database
- [ ] Department sees alert in real-time
- [ ] Status can be updated
- [ ] Updates sync across departments

**Test:**
1. Citizen sends SOS → ✅ Saved
2. Department sees alert → ✅ < 2 seconds
3. Department updates status → ✅ Instant update
4. All departments synced → ✅ Same data

### ⭐ Critical #2: Authentication
- [ ] Citizens can sign up
- [ ] Citizens can sign in
- [ ] Departments can sign in
- [ ] Sessions persist
- [ ] Logout works

**Test:**
1. Create account → ✅ Success
2. Sign in → ✅ Access granted
3. Refresh page → ✅ Still signed in
4. Sign out → ✅ Session cleared

### ⭐ Critical #3: Real-Time Sync
- [ ] Database changes appear in app
- [ ] No refresh needed
- [ ] Multi-client sync works
- [ ] Reconnection after disconnect

**Test:**
1. Insert in SQL → ✅ Appears in app
2. Two browsers open → ✅ Both update
3. Go offline → ✅ Reconnects
4. High volume → ✅ All messages received

---

## ❌ Known Limitations

Document what doesn't work (yet):

- [ ] Mock data still used for:
  - [ ] Analytics (until Edge Functions fully deployed)
  - [ ] Some disaster events
  - [ ] Some hospital data
- [ ] Citizen-side real-time notifications
- [ ] Push notifications
- [ ] Offline mode

**This is OK!** Core SOS functionality works with real-time.

---

## 🐛 If Something Fails

### Quick Fixes

**Issue: Edge Functions not deploying**
```bash
# Re-deploy with verbose output
supabase functions deploy server --debug
```

**Issue: Real-time not working**
```sql
-- Re-enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
```

**Issue: Authentication errors**
```bash
# Clear and re-set secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
supabase functions deploy server
```

**Issue: Database errors**
- Re-run `/FINAL_SUPABASE_SETUP.sql`
- Check Supabase logs in dashboard

### Get Help

1. Check `/TROUBLESHOOTING.md`
2. Review `/CURRENT_STATUS.md`
3. Check Supabase Dashboard → Logs
4. View function logs: `supabase functions logs --tail`

---

## 📝 Deployment Notes

**Date:** _______________  
**Deployed By:** _______________  
**Version:** 2.0 - Real-Time Edition  

**Issues Encountered:**
- [ ] None
- [ ] Minor (documented below)
- [ ] Major (documented below)

**Notes:**
```
[Space for deployment notes]
```

**Time Taken:**
- Database Setup: _____ minutes
- Edge Functions: _____ minutes
- Testing: _____ minutes
- Total: _____ minutes

---

## ✅ Sign-Off

Deployment is complete when ALL of the following are true:

- [ ] All database tables created
- [ ] Realtime enabled on critical tables
- [ ] Edge Functions deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] Citizen can send SOS alert
- [ ] Department sees alert in real-time (< 2 seconds)
- [ ] Status updates work
- [ ] Multi-department sync works
- [ ] No critical errors in console
- [ ] No critical errors in function logs
- [ ] Authentication works for all user types
- [ ] Data persists across sessions
- [ ] Security verified (RLS, secrets)
- [ ] Performance acceptable (< 2s latency)
- [ ] Documentation reviewed

**Signed:**

**Deployer:** _______________  
**Date:** _______________  
**Status:** [ ] Success  [ ] Partial  [ ] Failed  

---

## 🎯 Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check function logs daily
   - Monitor error rates
   - Track performance metrics

2. **User Training**
   - Train department users
   - Create user guides
   - Conduct demo sessions

3. **Gather Feedback**
   - Beta test with real users
   - Collect improvement suggestions
   - Prioritize feature requests

4. **Optimize**
   - Fine-tune database queries
   - Optimize real-time subscriptions
   - Improve caching

5. **Scale**
   - Add more departments
   - Integrate additional services
   - Expand coverage areas

---

**🎉 Congratulations! BantayAlert is now LIVE with real-time capabilities! 🎉**

---

## 📚 Reference Quick Links

- Project Dashboard: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn
- SQL Editor: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/editor
- Function Logs: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/functions
- Database: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/database/tables

**Documentation:**
- `/REALTIME_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `/EDGE_FUNCTION_SETUP.md` - Quick function deployment
- `/REALTIME_TESTING_GUIDE.md` - Testing procedures
- `/DATABASE_REALTIME_SETUP.sql` - Database configuration
- `/CURRENT_STATUS.md` - Current app status
- `/TROUBLESHOOTING.md` - Common issues and fixes

---

**Version:** 2.0  
**Last Updated:** November 3, 2025  
**Maintained By:** BantayAlert Development Team
