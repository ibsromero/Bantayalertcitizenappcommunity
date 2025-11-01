# Department Login Crash - Comprehensive Fix

## Problem Statement
When users sign into the department side, the entire application crashes. The "Clear Old Token" button also doesn't reload the program properly.

## Root Causes & Solutions

### 1. **Clear Token Button Not Working**
**Problem**: Using `window.location.href` with query parameters doesn't force a proper reload
**Solution**: Changed to `window.location.replace()` with clean URL and added `localStorage.clear()` + `sessionStorage.clear()`

```tsx
// BEFORE
window.location.href = window.location.href.split('?')[0] + '?cleared=' + Date.now();

// AFTER
localStorage.clear();
sessionStorage.clear();
setUser(null);
setTimeout(() => {
  window.location.replace(window.location.origin + window.location.pathname);
}, 500);
```

### 2. **Tab Grid Layout Mismatch**
**Problem**: `grid-cols-5` was hardcoded but Emergency Map tab was conditional
**Solution**: Made grid columns dynamic based on department role

```tsx
className={`grid w-full ${(user.departmentRole === "lgu" || user.departmentRole === "emergency_responder") ? 'grid-cols-5' : 'grid-cols-4'}`}
```

### 3. **Unsafe String/Array Operations**
**Problem**: Code assumed tokens and API responses were always defined
**Solution**: Added null-safe operations throughout

```tsx
// Token operations
(user.accessToken || "").substring(0, 20)

// Array operations  
(sosData?.alerts || []).filter(...)
(disasterData?.disasters || []).reduce(...)
```

### 4. **No Component-Level Error Boundaries**
**Problem**: Errors in child components would crash the entire app
**Solution**: Wrapped each tab content in ErrorBoundary

```tsx
<TabsContent value="overview">
  {activeTab === "overview" && (
    <ErrorBoundary fallback={<ErrorUI />}>
      <DataAnalytics user={user} />
    </ErrorBoundary>
  )}
</TabsContent>
```

### 5. **Lazy Rendering for Performance**
**Problem**: All tab components rendering simultaneously on mount
**Solution**: Added conditional rendering based on activeTab

```tsx
{activeTab === "overview" && <DataAnalytics user={user} />}
```

## Files Modified

### `/App.tsx`
- ✅ Added ErrorBoundary wrapper around main content
- ✅ Fixed token clear button to use `window.location.replace()`
- ✅ Added comprehensive auth validation before rendering DepartmentDashboard
- ✅ Added try-catch in renderCurrentSection()

### `/components/DepartmentDashboard.tsx`
- ✅ Fixed dynamic grid-cols based on department role
- ✅ Added extensive console logging for debugging
- ✅ Added null-safe operations for all token/array access
- ✅ Wrapped each tab content in ErrorBoundary
- ✅ Added lazy rendering - only render active tab
- ✅ Imported ErrorBoundary component

### `/components/ErrorBoundary.tsx`
- ✅ Created new React Error Boundary component
- ✅ Displays user-friendly error UI
- ✅ Provides recovery options (Try Again, Reload Page)
- ✅ Logs errors to console

## Debugging Features Added

### Console Logs
The following debug information is now logged:

1. **When DepartmentDashboard renders**:
   ```
   🔵 DepartmentDashboard rendering with user: {
     name, email, hasToken, tokenLength, tokenPrefix, userType, departmentRole
   }
   ```

2. **When useEffect triggers**:
   ```
   🔵 DepartmentDashboard useEffect triggered
   ```

3. **When loading stats**:
   ```
   📊 Loading department stats...
   Token format: dept_eyJ...
   Fetching SOS alerts...
   ✓ SOS alerts loaded: X
   ```

4. **On errors**:
   ```
   ❌ Failed to load dashboard stats: {error}
   Error details: {message}
   ```

### Visual Debug Info
A debug card at the top of the dashboard shows:
- User name and department role
- Token format validation (✓ Valid or ✗ Invalid)
- Full token preview
- Real-time status badge

## Testing Checklist

After deploying these fixes, test the following scenarios:

- [ ] **LGU Login**: Sign in with LGU credentials
  - Should show 5 tabs (including Emergency Map)
  - Dashboard should load without crashes
  
- [ ] **Emergency Responder Login**: Sign in with Emergency Responder credentials
  - Should show 5 tabs (including Emergency Map)
  - Dashboard should load without crashes

- [ ] **Healthcare Login**: Sign in with Healthcare credentials
  - Should show 4 tabs (NO Emergency Map)
  - Dashboard should load without crashes

- [ ] **Disaster Management Login**: Sign in with Disaster Management credentials
  - Should show 4 tabs (NO Emergency Map)
  - Dashboard should load without crashes

- [ ] **Clear Token Button**: If old token is detected
  - Button should appear
  - Clicking should clear all storage
  - Page should reload properly
  - User should be signed out

- [ ] **Error Handling**: Simulate API errors
  - Dashboard should show error banner
  - "Try Again" button should work
  - App should NOT crash

- [ ] **Tab Switching**: Switch between all tabs
  - Each tab should load properly
  - Errors in one tab shouldn't crash others
  - Loading states should display correctly

## Department Credentials

### LGU
- Email: `lgu@bantayalert.ph`
- Password: `LGU2025!Manila`
- Has: Emergency Map tab

### Emergency Responder
- Email: `responder@bantayalert.ph`
- Password: `RESP2025!911`
- Has: Emergency Map tab

### Healthcare
- Email: `healthcare@bantayalert.ph`
- Password: `HEALTH2025!Care`
- NO Emergency Map tab

### Disaster Management
- Email: `ndrrmc@bantayalert.ph`
- Password: `NDRRMC2025!PH`
- NO Emergency Map tab

## How to Troubleshoot If Crashes Still Occur

1. **Open Browser Console** (F12)
   - Look for red error messages
   - Check for console.log messages starting with 🔵, 📊, ✓, or ❌

2. **Check the Debug Card**
   - At the top of the department dashboard
   - Verify token format shows "✓ Valid (New)"
   - Verify token contains a period (.)

3. **Check Network Tab**
   - Look for failed API requests (status 401, 403, 500)
   - Verify department signin endpoint is being called
   - Check response data structure

4. **If a specific tab crashes**:
   - The ErrorBoundary should catch it and show an error message
   - Check console for which component failed
   - Try other tabs to see if they work

5. **If the entire app crashes**:
   - Check if it's before or after login
   - Look at the last console message before crash
   - Try clearing browser cache and localStorage manually

## Next Steps If Issues Persist

1. Check Supabase backend is running
2. Verify all department credentials are configured correctly
3. Check that kv_store_dd0f68d8 table exists in Supabase
4. Verify Edge Function is deployed properly
5. Check browser compatibility (use Chrome/Edge for best results)

## Success Indicators

When working correctly, you should see:
- ✅ Login succeeds with toast notification
- ✅ Blue debug card appears with valid token indicator
- ✅ Dashboard header shows with department name
- ✅ Quick stats cards load (may show 0s if no data)
- ✅ Tabs render correctly (4 or 5 depending on role)
- ✅ NO red error messages in console
- ✅ NO white screen or app crash

## Recovery Options for Users

If a user experiences a crash:

1. **Clear Old Token Button** (if visible)
   - Click the red button at bottom-right
   - Wait for page to reload
   - Sign in again

2. **Manual Cache Clear**
   - Press F12 to open DevTools
   - Go to Application tab
   - Clear localStorage and sessionStorage
   - Refresh the page

3. **Hard Refresh**
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - This clears cache and reloads

4. **Incognito Mode**
   - Open in incognito/private window
   - Sign in fresh without cached data
