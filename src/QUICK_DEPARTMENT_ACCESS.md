# 🚀 Quick Department Access Guide

## 4 Department Accounts

### Copy-Paste Login Credentials

#### 1️⃣ LGU Administrator
```
lgu@bantayalert.ph
LGU2025!Manila
```

#### 2️⃣ Emergency Responder
```
responder@bantayalert.ph
RESP2025!911
```

#### 3️⃣ Healthcare Provider
```
healthcare@bantayalert.ph
HEALTH2025!Care
```

#### 4️⃣ Disaster Management (NDRRMC)
```
ndrrmc@bantayalert.ph
NDRRMC2025!PH
```

---

## How to Login

1. Open BantayAlert app
2. Click **"Sign In"** button
3. Select **"Department"** tab (not Citizen)
4. Copy-paste email and password from above
5. Click "Sign In"

---

## ⚠️ Important Notes

### About the Warning
- ✅ You have **4 department accounts** (this is correct)
- ✅ The warning about "5 accounts" has been fixed
- ✅ All 4 accounts are fully configured and working

### About Realtime
- ⚠️ Supabase Realtime is currently in **early access**
- ✅ Your app works perfectly without it (uses polling mode)
- ✅ When you get access, just run the SQL to enable it
- 📖 See `/REALTIME_EARLY_ACCESS_NOTE.md` for details

---

## What Each Account Can Do

| Account | SOS Alerts | Disasters | Hospitals | Analytics |
|---------|-----------|-----------|-----------|-----------|
| LGU | ✅ View/Manage | ✅ Create/Edit | ✅ View | ✅ Local Data |
| Emergency | ✅ Respond | ✅ View | ✅ View | ✅ Response Times |
| Healthcare | ✅ View | ✅ View | ✅ Update Status | ✅ Medical Stats |
| NDRRMC | ✅ Full Access | ✅ Full Access | ✅ View | ✅ All Analytics |

---

## Troubleshooting

**Can't see department dashboard?**
- Make sure you clicked "Department" not "Citizen"
- Check that email/password are copied exactly
- Passwords are case-sensitive

**Getting 401 errors?**
- Database tables might not be set up yet
- Run `/PHASE_2_DATABASE_SETUP.sql` in Supabase
- Check browser console for specific error

**Database warning message?**
- This means you need to run the SQL setup
- Go to Supabase → SQL Editor
- Copy all SQL from `/PHASE_2_DATABASE_SETUP.sql`
- Click RUN

---

## Full Documentation

📖 **Detailed credentials:** `/DEPARTMENT_CREDENTIALS.md`
📖 **Realtime info:** `/REALTIME_EARLY_ACCESS_NOTE.md`
📖 **Setup guide:** `/PHASE_1_STABILITY_COMPLETE.md`
📖 **Database setup:** `/PHASE_2_DATABASE_SETUP.sql`

---

**Last Updated:** November 1, 2025
**Status:** ✅ All 4 accounts working | ⚠️ Realtime in early access (optional)
