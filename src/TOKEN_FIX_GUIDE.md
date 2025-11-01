# Department Token Fix Guide

## Problem
The department authentication system was updated to use a new token format with cryptographic signatures. Old tokens stored in your browser are incompatible and causing 401 errors.

## Token Formats

### Old Format (INCOMPATIBLE) ❌
```
dept_17612...
```
- Simple timestamp-based
- No signature verification
- Causes 401 errors

### New Format (REQUIRED) ✅
```
dept_eyJlbWFpbCI6ImxndUBi...VzdGFtcCI6MTczNTg5...UxMjN9.W3siZW1haWwiOiJsZ...
```
- Contains a period (`.`) separating payload and signature
- Cryptographically signed
- Much more secure

## Automatic Fix

The app now automatically detects and clears old tokens. When you refresh the page:

1. ✅ Old token detected
2. ✅ Cleared from localStorage
3. ✅ You'll be signed out automatically
4. ℹ️ Console message: "⚠️ Old department token format detected. Clearing session..."

## Manual Fix (If Needed)

If you're still experiencing issues, manually clear your session:

### Option 1: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
localStorage.clear(); location.reload();
```

### Option 2: Application Storage
1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Find "Local Storage" → Your site URL
4. Delete the "USER" key
5. Refresh the page

## How to Sign In Again

1. **Click "Sign In"** in the header
2. **Select "Department"** tab
3. **Choose your role** from the dropdown
4. **Enter credentials** (or use pre-filled ones):

   | Role | Email | Password |
   |------|-------|----------|
   | **LGU Administrator** | `lgu@bantayalert.ph` | `LGU2025!Manila` |
   | **Emergency Responder** | `responder@bantayalert.ph` | `RESP2025!911` |
   | **Healthcare Provider** | `healthcare@bantayalert.ph` | `HEALTH2025!Care` |
   | **Disaster Management** | `ndrrmc@bantayalert.ph` | `NDRRMC2025!PH` |

5. **Click "Sign In"**

## Verify Fix

After signing in with the new token, check the console:

### ✅ Success Indicators:
```
App.tsx: handleLogin called with: { userType: "department", tokenPrefix: "dept_eyJlbWFpbC..." }
✓ Token verified for: [Department Name] [role]
SOS alerts request authorized for: [Department Name]
Analytics request authorized for: [Department Name]
```

### ❌ Still Seeing Errors?
If you still see 401 errors:

1. **Check token format in console logs** - Should contain a period (`.`)
2. **Sign out completely** - Click your name → Sign Out
3. **Clear browser cache** - Ctrl+Shift+Delete
4. **Sign in again** - Use department credentials

## Edge Function Deployment

The Edge Function has been updated with the new token verification system. Make sure it's deployed:

### Check Deployment Status:
1. Go to Supabase Dashboard
2. Navigate to "Edge Functions"
3. Find "make-server-dd0f68d8" or "server"
4. Verify deployment timestamp is recent

### If Not Deployed:
The Edge Function should auto-deploy when you make changes. If you see a 403 error during deployment, it means you don't have permission to deploy manually. Contact your Supabase project administrator.

## How the New System Works

### Token Creation (Sign In)
```
1. User signs in with department credentials
2. Server validates credentials
3. Server creates payload: { email, name, role, department, timestamp }
4. Server signs payload with secret key
5. Returns: dept_[base64_payload].[signature]
```

### Token Verification (API Requests)
```
1. API receives request with Bearer token
2. Extracts payload and signature from token
3. Recreates expected signature
4. Compares signatures
5. If match → Authorized ✓
6. If no match → 401 Unauthorized ✗
```

### Benefits:
- ✅ No database lookups needed (faster)
- ✅ Tamper-proof (cryptographic signature)
- ✅ Stateless (works across multiple servers)
- ✅ More reliable (no session race conditions)

## Troubleshooting

### Error: "Token verification failed: Invalid token structure"
**Cause:** Old token format still in use
**Fix:** Clear localStorage and sign in again

### Error: "Invalid token signature"
**Cause:** Token was tampered with
**Fix:** Sign in again to get a fresh token

### Error: "Invalid department email in token"
**Cause:** Token contains non-existent email
**Fix:** Sign in again with valid department credentials

### Error: "Request failed with status 401"
**Cause:** No token or invalid token
**Fix:** 
1. Check console for specific error message
2. Sign out
3. Sign in again
4. Verify new token format (has a period)

## Support

If you continue experiencing issues after following this guide:

1. Check the browser console for error messages
2. Copy any error messages
3. Check the Edge Function logs in Supabase Dashboard
4. Verify you're using the latest version of the app

## Summary

✅ **DO THIS:**
- Refresh the page (old token auto-clears)
- Sign in again to get new token
- Verify console shows new token format with period (`.`)

❌ **DON'T DO THIS:**
- Try to modify tokens manually
- Use old tokens from backups
- Share tokens between different sessions
