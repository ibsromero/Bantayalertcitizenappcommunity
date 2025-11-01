# Department Token Debug Guide

## 🔍 Understanding the Token Format

### Valid Token Format
```
dept_{base64_payload}.{base64_signature}
```

Example:
```
dept_eyJlbWFpbCI6ImxndUBiYW50YXlhbGVydC5waCIs...}.bWFrYXRpQGJhbnRheWFsZXJ0LnBoIl0sIm5h...
```

### Old/Invalid Format
```
dept_{random_numbers_and_letters}
```

Example (INVALID):
```
dept_1761469281086_a3d6h9k2
```

## 🛠️ Troubleshooting Steps

### Step 1: Check Your Token
1. Open browser DevTools (F12)
2. Go to Console
3. Type: `JSON.parse(localStorage.getItem("USER"))`
4. Look at the `accessToken` field
5. Check if it has a period (`.`) in it after `dept_`

### Step 2: Verify Token Structure
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem("USER"));
const token = user.accessToken;

// Check format
console.log("Has dept_ prefix:", token.startsWith("dept_"));
console.log("Has period:", token.includes("."));
console.log("Parts:", token.substring(5).split(".").length); // Should be 2
```

### Step 3: Clear Old Tokens
If you see an old format token:

**Option A: Automatic (Recommended)**
1. Just reload the page - the app will auto-detect and clear old tokens
2. You'll see a message: "Session Expired"
3. Sign in again

**Option B: Manual**
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Step 4: Fresh Sign-In
1. After clearing, sign in with department credentials:
   - LGU: `lgu@bantayalert.ph` / `LGU2025!PH`
   - Emergency: `responder@bantayalert.ph` / `RESPONDER2025!PH`
   - Healthcare: `hospital@bantayalert.ph` / `HOSPITAL2025!PH`
   - Disaster Mgmt: `ndrrmc@bantayalert.ph` / `NDRRMC2025!PH`

## 🔄 How Token Validation Works

### Client-Side (App.tsx)
1. App loads → imports `clearOldTokens.ts` FIRST
2. `clearOldTokens.ts` checks localStorage for old tokens
3. If old token found → clears storage → reloads page
4. User sees "Session Expired" message

### API Request (departmentApiService.ts)
1. Before each API call → validates token format
2. Checks for `dept_` prefix
3. Checks for two parts separated by period
4. If invalid → throws error immediately
5. If valid → sends to server

### Server-Side (Edge Function)
1. Receives `X-Department-Token` header
2. Checks prefix and structure
3. Decodes base64 payload
4. Verifies signature
5. Checks email against credentials
6. If all pass → allows request

## 🚨 Common Errors

### Error: "OLD TOKEN FORMAT DETECTED"
**Cause**: Token from old system is still in localStorage
**Solution**: Reload page (auto-clears), then sign in again

### Error: "Authentication failed. Please sign in again."
**Cause**: Token validation failed on server
**Solutions**:
1. Check token format (see Step 1-2 above)
2. Clear storage and sign in again
3. Make sure using correct department email/password

### Error: "Invalid token format. Please sign in again."
**Cause**: Token doesn't have proper structure
**Solution**: Clear localStorage and sign in fresh

### Error: "Unauthorized - Department access only"
**Cause**: Token missing or doesn't start with `dept_`
**Solution**: Sign in with department account (not citizen)

## 🧪 Testing Token Generation

### Test New Sign-In
1. Clear storage: `localStorage.clear()`
2. Sign in with LGU account
3. Check token in console:
```javascript
const user = JSON.parse(localStorage.getItem("USER"));
console.log("Token format:", user.accessToken.substring(0, 50) + "...");
console.log("Has period:", user.accessToken.includes("."));
console.log("Parts count:", user.accessToken.substring(5).split(".").length);
```
4. Should see: `Has period: true`, `Parts count: 2`

### Test API Call
```javascript
// After signing in:
const user = JSON.parse(localStorage.getItem("USER"));
const token = user.accessToken;

fetch("YOUR_SUPABASE_URL/functions/v1/make-server-dd0f68d8/sos/alerts?status=all", {
  headers: {
    "X-Department-Token": token,
    "Authorization": "Bearer YOUR_ANON_KEY"
  }
})
.then(r => r.json())
.then(data => console.log("API Response:", data))
.catch(err => console.error("API Error:", err));
```

## 📝 Logging

### Enable Debug Logging
All token operations are logged. Check console for:

**Token Detection**:
```
🔍 Checking for old department tokens...
❌ OLD TOKEN FORMAT DETECTED!
🧹 Clearing old department token from storage...
```

**API Requests**:
```
🔵 Department API Request: /sos/alerts?status=all
Token: dept_eyJlbWFpbCI6...
✅ Token validated
```

**Sign-In**:
```
✅ Department login successful:
  name: "Local Government Unit"
  role: "lgu"
  department: "LGU"
  tokenHasPeriod: true
```

## 🔐 Security Notes

1. **Never share your department token** - treat it like a password
2. **Tokens don't expire** (in prototype) - in production, add expiration
3. **Server validates every request** - even if client sends token
4. **Signature prevents tampering** - payload is signed with secret key

## 📞 Still Having Issues?

If you're still seeing 401 errors:

1. **Check server logs** in Supabase Edge Functions
2. **Verify credentials** match server-side config
3. **Check network tab** - see actual request/response
4. **Try incognito mode** - eliminates cache issues
5. **Check Supabase status** - make sure service is running

### Debug Checklist
- [ ] Token has `dept_` prefix
- [ ] Token has period (`.`) separator
- [ ] Token has 2 parts when split by period
- [ ] Using department email (not citizen)
- [ ] Using correct password
- [ ] localStorage.USER exists
- [ ] user.userType === "department"
- [ ] Edge Function is deployed
- [ ] Network requests show X-Department-Token header

## 🎯 Expected Behavior

**On First Load with Old Token:**
1. Page loads → Auto-detection runs
2. Console: "🔴 OLD TOKEN DETECTED - CLEARING NOW..."
3. Storage cleared
4. Page reloads with `?cleared=1` parameter
5. Toast: "Session expired. Please sign in again."
6. Auth modal opens

**On Fresh Sign-In:**
1. Enter department credentials
2. Server generates new format token
3. Token saved to localStorage
4. Dashboard loads successfully
5. API calls work without errors

**On Subsequent Visits:**
1. Token loaded from localStorage
2. Token validation passes
3. Dashboard loads immediately
4. All API calls succeed
