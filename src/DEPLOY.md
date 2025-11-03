# Deploy BantayAlert to Production

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Terminal/command line access

## Step 1: Install Supabase CLI

### Windows/Mac/Linux
```bash
npm install -g supabase
```

## Step 2: Login
```bash
supabase login
# Browser will open - click "Authorize"
```

## Step 3: Link Project
```bash
supabase link --project-ref gzefyknnjlsjmcgndbfn
# Enter your database password when prompted
```

## Step 4: Deploy Functions
```bash
# Deploy main server
supabase functions deploy server --project-ref gzefyknnjlsjmcgndbfn

# Deploy department API  
supabase functions deploy departmentApiService --project-ref gzefyknnjlsjmcgndbfn
```

## Step 5: Test Deployment
```bash
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
# Should return: {"status":"ok","service":"BantayAlert API"...}
```

## Step 6: Update Code
Edit `/utils/departmentApiService.ts`:
```typescript
const USE_MOCK_DATA = false; // Change from true to false
```

## Step 7: Verify
1. Open BantayAlert app
2. Send a test SOS alert
3. Sign in as department user
4. Check SOS Alerts tab - should see your test alert
5. Orange "Local Mode" warning should be gone

## Done! 🎉

Your app is now fully deployed and production-ready.

## Troubleshooting

**"Command not found: supabase"**
```bash
# Add npm global bin to PATH
npm config get prefix
# Add that path to your system PATH
```

**"Invalid project ref"**
- Verify: `gzefyknnjlsjmcgndbfn`
- Make sure you're logged in: `supabase login`

**"Function deployment failed"**
```bash
# Check logs
supabase functions logs server --project-ref gzefyknnjlsjmcgndbfn
```

**"404 Not Found" when testing**
- Wait 1-2 minutes for deployment to propagate
- Check function list: `supabase functions list`

## Update Functions Later
```bash
# After making code changes
supabase functions deploy server --project-ref gzefyknnjlsjmcgndbfn
```

## View Logs
```bash
# See recent logs
supabase functions logs server --project-ref gzefyknnjlsjmcgndbfn

# Stream live logs
supabase functions logs server --project-ref gzefyknnjlsjmcgndbfn --follow
```
