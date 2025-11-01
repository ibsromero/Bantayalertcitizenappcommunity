# 🚨 EMERGENCY TOKEN CLEAR INSTRUCTIONS

## You're seeing 401 errors because the old token is still in use.

## ⚡ IMMEDIATE FIX - Do This Now:

### Option 1: Hard Refresh (RECOMMENDED)
1. **Press `Ctrl + Shift + R`** (Windows/Linux) or **`Cmd + Shift + R`** (Mac)
   - This does a HARD refresh and clears the cache
2. Watch for the orange "Clearing Old Session..." screen
3. Page will auto-reload
4. Sign in again with department credentials

### Option 2: Manual Clear Button
If you see a **RED button** in the bottom-right corner that says **"Clear Old Token & Reload"**:
1. Click it
2. Wait for the reload
3. Sign in again

### Option 3: Manual Console Clear
If the above don't work, you can manually clear in the browser's developer console:

1. Open Developer Console:
   - Windows/Linux: `F12` or `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`
   
2. Go to the **Console** tab

3. Paste this code and press Enter:
```javascript
localStorage.removeItem('USER');
localStorage.clear();
console.log('✅ Token cleared!');
window.location.reload();
```

4. The page will reload automatically

5. Sign in again with department credentials

---

## 🔐 After Clearing - Sign In Process:

1. Click **"Sign In"** button (top-right)
2. Click **"Department"** tab
3. Select your department role:
   - **LGU** (Local Government Unit)
   - **Emergency Responder**
   - **Healthcare Provider**
   - **Disaster Management**
4. Credentials will auto-fill
5. Click **"Sign In"**

---

## ✅ How to Know It's Fixed:

### New Token Format (Good):
```
dept_eyJlbWFpbCI6ImxndUBtYW5pbGEuZ292LnBoIn0.dGVzdCI6MTczNzE4MjQwMDAwMH0
```
Notice the **period (.)** in the middle - this is the signature!

### Old Token Format (Bad - will cause 401):
```
dept_17612456789012345
```
No period - just a timestamp - this won't work!

---

## 🎯 What Changed:

The department authentication system was upgraded to use **cryptographic signatures** for better security. Old tokens without signatures cannot be verified by the Edge Function, causing 401 errors.

The fix:
1. Clear the old token
2. Sign in again
3. New token with signature is generated
4. Everything works!

---

## 🆘 Still Having Issues?

If you've tried all the above and still see 401 errors:

1. Check the console for token format:
   ```javascript
   JSON.parse(localStorage.getItem('USER'))?.accessToken
   ```
   
2. If it still shows `dept_17612...` (no period), the token wasn't cleared
   
3. Try clearing browser data:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content
   
4. Close and reopen the browser completely

5. Try the hard refresh again: `Ctrl + Shift + R`

---

**Bottom line:** Just do a hard refresh (`Ctrl + Shift + R`) and sign in again! 🚀
