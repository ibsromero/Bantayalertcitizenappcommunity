# 🔧 Edge Function Quick Setup

**Fast track deployment for BantayAlert Edge Functions**

---

## ⚡ Quick Start (5 Minutes)

### 1. Install & Login

```bash
# Install Supabase CLI (choose your OS)
brew install supabase/tap/supabase  # macOS
scoop install supabase              # Windows

# Login
supabase login
```

### 2. Link Project

```bash
supabase link --project-ref gzefyknnjlsjmcgndbfn
```

### 3. Set Secrets

```bash
# Get your Service Role Key from: https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn/settings/api

supabase secrets set SUPABASE_URL=https://gzefyknnjlsjmcgndbfn.supabase.co

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Deploy Functions

```bash
# Deploy both functions
supabase functions deploy server
supabase functions deploy departmentApiService
```

### 5. Test Deployment

```bash
# Test health endpoint
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

Expected response:
```json
{"status":"ok","service":"BantayAlert API"}
```

---

## ✅ Deployment Verification

After deploying, check:

1. **Function List**
   ```bash
   supabase functions list
   ```
   Should show: `server` and `departmentApiService`

2. **Function Logs**
   ```bash
   supabase functions logs server --tail
   ```

3. **In Browser Console** (Department Dashboard)
   - Should see: `✓ Analytics loaded from server`
   - NOT: `⚠️ Analytics API failed, falling back to mock data`

---

## 🔄 Update Deployment

When you change Edge Function code:

```bash
# Deploy updated function
supabase functions deploy server

# Or deploy all functions
supabase functions deploy
```

---

## 🧪 Local Testing

Test functions locally before deploying:

```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve server --env-file .env.local

# In another terminal, test
curl http://localhost:54321/functions/v1/make-server-dd0f68d8/health
```

Create `.env.local`:
```
SUPABASE_URL=https://gzefyknnjlsjmcgndbfn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🐛 Troubleshooting

### "Command not found: supabase"

**Solution:** Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### "Project not found"

**Solution:** Link to correct project
```bash
supabase link --project-ref gzefyknnjlsjmcgndbfn
```

### "Deployment failed"

**Solution:** Check secrets are set
```bash
supabase secrets list
```

### "Function returns 401 Unauthorized"

**Solution:** 
1. Check Service Role Key is correct
2. Verify secrets: `supabase secrets list`
3. Re-deploy: `supabase functions deploy server`

---

## 📊 Monitor Deployment

### View Logs in Real-Time

```bash
# All logs
supabase functions logs --tail

# Specific function
supabase functions logs server --tail

# Only errors
supabase functions logs --level error
```

### Check Function Health

```bash
# Quick health check
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health | jq
```

---

## 🔐 Security Notes

1. **Never commit** `.env.local` to Git
2. **Keep Service Role Key secret** - it has admin access
3. **Rotate keys** if accidentally exposed
4. **Use secrets** for sensitive data, not environment variables

---

## 🚀 Production Checklist

Before going live:

- [ ] Edge Functions deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] Secrets configured correctly
- [ ] Database tables created
- [ ] Realtime enabled on critical tables
- [ ] RLS policies in place
- [ ] Test SOS alert end-to-end
- [ ] Test department authentication
- [ ] Monitor function logs for errors
- [ ] Set up error alerting (optional)

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Project ID | `gzefyknnjlsjmcgndbfn` |
| Project URL | `https://gzefyknnjlsjmcgndbfn.supabase.co` |
| Functions URL | `https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/` |
| Dashboard | `https://supabase.com/dashboard/project/gzefyknnjlsjmcgndbfn` |

---

**Need detailed guide?** See `/REALTIME_DEPLOYMENT_GUIDE.md`
