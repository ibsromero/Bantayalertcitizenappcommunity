# 🚨 SOS "Failed to Fetch" Error - Complete Fix Guide

## Problem

You're seeing: `Failed to send SOS: TypeError: Failed to fetch`

This happens because the SOS feature is trying to call a Supabase Edge Function that hasn't been deployed yet.

---

## ✅ Quick Fix Options

### Option 1: Deploy Edge Functions (Recommended for Production)

This is the proper solution that makes everything work as intended.

**Time:** 10-15 minutes

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link your project
supabase link --project-ref gzefyknnjlsjmcgndbfn

# 4. Deploy the server function
supabase functions deploy server

# 5. Test the deployment
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health

# Expected response:
# {"status":"ok","service":"BantayAlert API","version":"2.0.0-token-fix",...}
```

**After deployment:**
- SOS alerts will save to database ✅
- Departments will see real-time alerts ✅
- All features will work properly ✅

---

### Option 2: Local Fallback Mode (Quick Temporary Fix)

If you can't deploy right now, you can enable a local fallback that simulates the SOS system.

**Time:** 2 minutes

This is already implemented! Just understand that:
- ✅ SOS button will work
- ✅ Alerts will be shown in console
- ⚠️ **BUT** alerts won't save to database
- ⚠️ Departments won't see them in real-time
- ⚠️ Data won't persist

The app will automatically fall back to local mode if the Edge Function isn't available.

---

## 🔍 Current Error Explanation

```
Failed to send SOS: TypeError: Failed to fetch
```

**What this means:**
1. Your app is trying to call: `https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/sos/create`
2. The Edge Function doesn't exist yet (404 or connection error)
3. The browser can't establish a connection

**Why it happens:**
- Edge Functions must be deployed separately from your frontend app
- They run on Supabase's servers, not in the browser
- You need to deploy them using the Supabase CLI

---

## 📋 Step-by-Step: Deploying Edge Functions

### Prerequisites

1. **Supabase Project**
   - ✅ You have: `gzefyknnjlsjmcgndbfn`
   - Check at: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn

2. **Node.js installed**
   - Check: `node --version` (should be v16+)

3. **Supabase account access**
   - You need to be logged into the account that owns the project

### Step 1: Install Supabase CLI

**Windows:**
```bash
npm install -g supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

**Linux:**
```bash
npm install -g supabase
```

### Step 2: Login

```bash
supabase login
```

This will open a browser window. Authorize the CLI to access your account.

### Step 3: Link Project

```bash
# Navigate to your project directory first
cd path/to/your/bantayalert/project

# Link to your Supabase project
supabase link --project-ref gzefyknnjlsjmcgndbfn
```

You'll be prompted for your database password. Get it from:
https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/settings/database

### Step 4: Deploy Functions

```bash
# Deploy the main server function
supabase functions deploy server --project-ref gzefyknnjlsjmcgndbfn

# Deploy the department API service (optional but recommended)
supabase functions deploy departmentApiService --project-ref gzefyknnjlsjmcgndbfn
```

**What to expect:**
```
Deploying Function (project-ref: gzefyknnjlsjmcgndbfn)...
Bundling server
Deploying server (version: ...)
✅ Deployed Function server on region ...
```

### Step 5: Verify Deployment

Test that the function is working:

```bash
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "BantayAlert API",
  "version": "2.0.0-token-fix",
  "timestamp": "2025-11-02T...",
  "tokenFormat": "dept_{base64payload}.{base64signature}"
}
```

### Step 6: Test SOS Creation

Now test the SOS endpoint:

```bash
curl -X POST https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/sos/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZWZ5a25uamxzam1jZ25kYmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDU3NTksImV4cCI6MjA3NjI4MTc1OX0.xUrxw6cZ-0Qz1TarrDRJtPyoEplAt0AMPzNC0mhF2h4" \
  -d '{
    "userName": "Test User",
    "userEmail": "test@example.com",
    "contactNumber": "09123456789",
    "details": "Test emergency alert",
    "location": {
      "lat": 14.5995,
      "lng": 120.9842,
      "address": "Manila, Philippines"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "alertId": "sos_1698765432000_abc123"
}
```

### Step 7: Test in Your App

1. Refresh your BantayAlert app
2. Click the "SEND SOS ALERT" button
3. Fill in the form
4. Click "Send SOS Alert"

You should see:
- ✅ Success message: "SOS Alert Sent!"
- ✅ Green toast notification
- ✅ No console errors

---

## 🔧 Troubleshooting

### Error: "supabase: command not found"

**Solution:**
```bash
# Make sure npm global bin is in your PATH
npm config get prefix

# Add to PATH (replace with your path)
export PATH=$PATH:/usr/local/bin

# Try installing again
npm install -g supabase
```

### Error: "Failed to link project"

**Solution:**
1. Check you're logged in: `supabase login`
2. Verify project ID is correct: `gzefyknnjlsjmcgndbfn`
3. Make sure you have access to the project
4. Try: `supabase projects list` to see all your projects

### Error: "Function deployment failed"

**Solution:**
1. Check your internet connection
2. Verify the function files exist in `/supabase/functions/server/`
3. Check for syntax errors in the function code
4. Try deploying with verbose output: `supabase functions deploy server --debug`

### Error: Still getting "Failed to fetch"

**Possible causes:**

1. **Functions not deployed yet**
   - Run: `supabase functions list`
   - Should show `server` and `departmentApiService`

2. **CORS issues** (shouldn't happen with our setup)
   - Check browser console for CORS errors
   - Verify the function includes CORS headers (it does)

3. **Network/firewall blocking**
   - Try accessing from a different network
   - Check if your firewall blocks `supabase.co`

4. **Wrong project ID**
   - Verify in code: `projectId = "gzefyknnjlsjmcgndbfn"`
   - Should match your actual project

---

## 📊 Verifying Everything Works

### Test Checklist

After deploying, test these:

- [ ] Health check endpoint responds
  ```bash
  curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
  ```

- [ ] SOS creation works
  ```bash
  curl -X POST https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/sos/create \
    -H "Content-Type: application/json" \
    -d '{"userName":"Test","details":"Test alert"}'
  ```

- [ ] SOS button in app works
  - Click "SEND SOS ALERT"
  - Fill form
  - Submit
  - See success message

- [ ] Department can see alerts
  - Sign in as department user
  - Go to SOS Alerts tab
  - See the test alert

---

## 🎯 What Edge Functions Do

Your BantayAlert uses Edge Functions for:

1. **SOS Alerts** (`/sos/create`)
   - Receives emergency alerts from citizens
   - Saves to database
   - Notifies departments in real-time

2. **Department Auth** (`/department/signin`)
   - Authenticates department users
   - Creates secure tokens
   - Manages sessions

3. **Department Data** (various endpoints)
   - Provides analytics
   - Manages disaster events
   - Updates hospital capacity
   - Tracks SOS alerts

**Why Edge Functions?**
- ✅ Secure server-side processing
- ✅ Direct database access
- ✅ No exposing service role keys to frontend
- ✅ Can run background tasks
- ✅ Better performance

---

## 🚀 After Deployment

Once deployed, you should:

1. **Test all SOS features**
   - Send test alert
   - Verify it appears in department dashboard
   - Check database has the data

2. **Initialize sample data**
   ```bash
   curl -X POST https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/init-sample-data
   ```

3. **Update the mock data flag**
   In `/utils/departmentApiService.ts`, change:
   ```typescript
   const USE_MOCK_DATA = false; // Edge Functions are deployed!
   ```

4. **Test department features**
   - Sign in as LGU: `lgu@bantayalert.ph` / `LGU2025!Manila`
   - Check all tabs load properly
   - Verify real-time updates work

---

## 📝 Quick Reference

**Your Edge Function URLs:**
- Main server: `https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8`
- Department API: `https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/departmentApiService`

**Deployment Commands:**
```bash
# Deploy both functions
supabase functions deploy server
supabase functions deploy departmentApiService

# View logs
supabase functions logs server
supabase functions logs departmentApiService

# List all functions
supabase functions list
```

**Test Commands:**
```bash
# Health check
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health

# Test SOS
curl -X POST https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/sos/create \
  -H "Content-Type: application/json" \
  -d '{"userName":"Test User","details":"Test emergency"}'
```

---

## ✅ Summary

**To fix the SOS error:**

1. **Easiest:** Deploy Edge Functions (10 min)
   ```bash
   supabase login
   supabase link --project-ref gzefyknnjlsjmcgndbfn
   supabase functions deploy server
   ```

2. **Alternative:** Use local fallback mode
   - Already enabled automatically
   - Limited functionality
   - Good for testing UI only

**Recommended:** Deploy the Edge Functions for full functionality!

Your SOS system will then work perfectly with:
- ✅ Database persistence
- ✅ Real-time department notifications
- ✅ Full emergency response workflow
- ✅ Analytics and tracking
