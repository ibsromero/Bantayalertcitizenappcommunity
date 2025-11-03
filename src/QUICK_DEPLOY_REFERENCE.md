# ⚡ Quick Deploy Reference Card

**Keep this handy during deployment**

---

## 🔑 Your Project Info

```
Project ID:    gzefyknnjlsjmcgndbfn
Project URL:   https://gzefyknnjlsjmcgndbfn.supabase.co
Anon Key:      (already configured in /utils/supabase/info.tsx)
Service Key:   (get from Supabase Dashboard → Settings → API)
```

---

## 📋 Deployment Commands

### 1. Install & Login
```bash
# macOS
brew install supabase/tap/supabase

# Windows (with Scoop)
scoop install supabase

# Login
supabase login
```

### 2. Link Project
```bash
supabase link --project-ref gzefyknnjlsjmcgndbfn
```

### 3. Set Secrets
```bash
supabase secrets set SUPABASE_URL=https://gzefyknnjlsjmcgndbfn.supabase.co

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Deploy Functions
```bash
supabase functions deploy server
supabase functions deploy departmentApiService
```

### 5. Verify
```bash
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

---

## 🗄️ Database Scripts (in Supabase SQL Editor)

### Run in Order:
1. `/FINAL_SUPABASE_SETUP.sql` - Creates all tables
2. `/DATABASE_REALTIME_SETUP.sql` - Enables real-time

---

## ✅ Success Checklist

After deployment:

- [ ] `curl` health endpoint returns `{"status":"ok"}`
- [ ] Browser console shows: `✅ Subscribed to SOS alerts channel`
- [ ] SOS from citizen appears in department < 2 seconds
- [ ] No "Failed to fetch" errors
- [ ] `supabase functions list` shows 2 deployed functions

---

## 🧪 Quick Test

```
1. Open 2 browser tabs
2. Tab 1: Sign in as citizen
3. Tab 2: Sign in as lgu@bantayalert.ph / LGU2025!Manila
4. Tab 1: Send SOS alert
5. Tab 2: Alert appears instantly ✅
```

---

## 🐛 Quick Fixes

**"Failed to fetch"**
```bash
supabase functions deploy server
```

**Real-time not working**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
```

**Check logs**
```bash
supabase functions logs --tail
```

**Redeploy everything**
```bash
supabase functions deploy
```

---

## 📚 Full Guides

| Guide | Purpose |
|-------|---------|
| `/REALTIME_SETUP_SUMMARY.md` | Executive summary |
| `/DEPLOYMENT_MASTER_CHECKLIST.md` | Complete checklist |
| `/REALTIME_DEPLOYMENT_GUIDE.md` | Detailed guide |
| `/EDGE_FUNCTION_SETUP.md` | Function deployment |
| `/REALTIME_TESTING_GUIDE.md` | Testing procedures |

---

## 🔗 Quick Links

- Dashboard: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn
- SQL Editor: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/editor
- Functions: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/functions
- Logs: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/logs

---

## 🎯 Support Commands

```bash
# List functions
supabase functions list

# View logs in real-time
supabase functions logs --tail

# Check secrets
supabase secrets list

# Test locally
supabase functions serve server

# Unlink project
supabase unlink

# Get help
supabase --help
```

---

## 🔐 Department Test Accounts

```
LGU:
  Email: lgu@bantayalert.ph
  Password: LGU2025!Manila

Emergency Responder:
  Email: responder@bantayalert.ph
  Password: RESP2025!911

Healthcare:
  Email: healthcare@bantayalert.ph
  Password: HEALTH2025!Care

NDRRMC:
  Email: ndrrmc@bantayalert.ph
  Password: NDRRMC2025!PH
```

---

**Print this page and keep it handy! 📄**
