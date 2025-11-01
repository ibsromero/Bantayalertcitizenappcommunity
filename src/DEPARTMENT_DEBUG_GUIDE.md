# Department Dashboard Debug Guide

## Issue
After logging into the department side, the dashboard renders but shows no data ("nothing's popping up").

## Changes Made

### 1. Enhanced Logging (DepartmentDashboard.tsx)
- Added comprehensive console logging throughout the `loadStats()` function
- Each API call now logs before and after execution with status
- Token format is logged to verify it has the correct structure
- Success and error states are clearly indicated with emoji prefixes (✓, ❌, ⚠️)

### 2. Loading States
- Added `isLoading` state to track when data is being fetched
- Loading spinner shows in header while fetching
- Skeleton loaders show in stat cards during initial load
- Manual refresh button added to header

### 3. Error Handling
- Added `hasError` state to track if data loading failed
- Error banner displays if loading fails with actionable "Try Again" button
- Toast notifications show when API calls fail with descriptive messages
- Errors are caught and logged with full details

### 4. Debug Information
- Debug panel shows in development mode with:
  - User name and role
  - Token prefix (first 25 characters)
  - Whether token has period (indicates new format)

### 5. API Service Improvements (departmentApiService.ts)
- Enhanced logging for all department API requests
- Better error messages for different HTTP status codes:
  - 401: "Authentication failed. Please sign in again."
  - 403: "Access denied. Insufficient permissions."
- Full request/response details logged to console

### 6. Authentication Logging (AuthModal.tsx)
- Added detailed logging when department login succeeds
- Logs token structure details (has period, length, etc.)
- Tracks the onLogin call flow

## How to Debug

### Step 1: Check Console on Login
After logging in as a department user, open the browser console and look for:

1. **Authentication Success:**
   ```
   ✅ Department login successful: {
     name: "LGU Administrator",
     role: "lgu",
     department: "Local Government Unit",
     tokenPrefix: "dept_eyJ...",
     tokenHasPeriod: true,
     tokenLength: 200+
   }
   ```

2. **Dashboard Loading:**
   ```
   📊 Loading department stats...
   Token format: dept_eyJ...
   Fetching SOS alerts...
   🔵 Department API Request: /sos/alerts?status=all
   ```

3. **Look for Errors:**
   - Any ❌ symbols indicate failures
   - Check for 401 Unauthorized errors
   - Check for "Invalid token format" messages

### Step 2: Check Debug Panel
In development mode, you'll see a gray debug panel at the top showing:
- Your user details
- Token prefix
- Whether token has period (✓ = good, ✗ = old format)

### Step 3: Common Issues to Check

#### Issue: Old Token Format (No Period)
**Symptoms:** Token shows as `dept_17612...` without period
**Solution:** Clear localStorage and sign in again

#### Issue: 401 Errors
**Symptoms:** "Unauthorized" or "Authentication failed" in console
**Possible Causes:**
1. Old token still in use
2. Token not being sent correctly
3. Server-side token verification failing

#### Issue: No Data but No Errors
**Symptoms:** Dashboard shows all zeros, no error messages
**Possible Causes:**
1. Sample data not initialized
2. API returning empty arrays
3. Silent failures being caught

### Step 4: Manual Checks

1. **Check Sample Data Initialization:**
   Look for: `✓ Department sample data initialized successfully`
   If not present, the sample data wasn't loaded.

2. **Check Token Format:**
   Valid token: `dept_eyJlbWFpbCI6ImxndUBiYW50Y...abc.dGVzdDp0ZXN0...xyz`
   Old token: `dept_1761234567890` (no periods)

3. **Test API Manually:**
   You can test the server endpoints in the console:
   ```javascript
   // Get user token
   const user = JSON.parse(localStorage.getItem('USER'));
   console.log('Token:', user.accessToken);
   
   // Test SOS alerts endpoint
   fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-dd0f68d8/sos/alerts?status=all', {
     headers: {
       'Authorization': `Bearer ${user.accessToken}`
     }
   }).then(r => r.json()).then(console.log);
   ```

## Expected Behavior

When everything works correctly, you should see:

1. **Initial Load:**
   - Loading spinner in header
   - Skeleton loaders in stat cards
   - Console shows "Loading department stats..."

2. **Data Loading:**
   - Console shows each API request with 🔵
   - Each successful response shows ✅
   - Stats update with real numbers

3. **Final State:**
   - "System Active" indicator with pulse animation
   - Stat cards show real numbers
   - No error banners
   - Tabs are clickable and functional

## Quick Fixes

### Clear Everything and Start Fresh
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Force Sample Data Initialization
```javascript
// Run in browser console
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-dd0f68d8/init-sample-data', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer [ANON_KEY]'
  }
}).then(r => r.json()).then(console.log);
```

## Next Steps

1. **Sign in as department user**
2. **Open browser console immediately**
3. **Watch for the log messages**
4. **Share the console output** if issues persist

The enhanced logging will help identify exactly where the process is failing.
