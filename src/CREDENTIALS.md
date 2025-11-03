# BantayAlert Access Credentials

## Department Accounts

### LGU (Local Government Unit)
```
Email:    lgu@bantayalert.ph
Password: LGU2025!Manila
Role:     LGU Command Center
Access:   Full dashboard, Emergency Map, All features
```

### Emergency Responder
```
Email:    responder@bantayalert.ph
Password: RESP2025!911
Role:     Emergency Response Center
Access:   Full dashboard, Emergency Map, Response coordination
```

### Healthcare Provider
```
Email:    healthcare@bantayalert.ph
Password: HEALTH2025!Care
Role:     Healthcare Coordination Hub
Access:   Full dashboard, Hospital management, Patient tracking
```

### NDRRMC (National Disaster Risk Reduction)
```
Email:    ndrrmc@bantayalert.ph
Password: NDRRMC2025!PH
Role:     NDRRMC Operations Center
Access:   Full dashboard, Analytics, Multi-agency coordination
```

## Supabase Project

```
Project ID:     gzefyknnjlsjmcgndbfn
Project URL:    https://gzefyknnjlsjmcgndbfn.supabase.co
Anon Key:       (stored in /utils/supabase/info.tsx)
```

## API Endpoints

### Main Server
```
Base URL: https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8

Routes:
  GET  /health                     - Health check
  POST /sos/create                 - Create SOS alert (no auth)
  POST /department/signin          - Department login
  POST /department/signout         - Department logout
  POST /init-sample-data           - Initialize sample data
```

### Department API
```
Base URL: https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/departmentApiService

Routes:
  GET  /sos/alerts                 - Get all SOS alerts (auth required)
  PUT  /sos/alert/:id              - Update alert status (auth required)
  GET  /disasters/active           - Get active disasters (auth required)
  POST /disasters/event            - Create/update disaster (auth required)
  GET  /healthcare/hospitals       - Get hospitals (public)
  PUT  /healthcare/hospital/:id    - Update hospital (auth required)
  GET  /analytics/summary          - Get analytics (auth required)
```

## Database Tables

### kv_store_dd0f68d8 (Main KV table)
```
Stores:
  - user_profiles_{userId}
  - emergency_contacts_{userId}
  - checklist_items_{userId}
  - kit_items_{userId}
  - sos_alerts_{alertId}
  - disasters_{eventId}
  - hospitals_{hospitalId}
  - analytics_summary
```

## Feature Flags

### In Code
```typescript
// /utils/departmentApiService.ts
const USE_MOCK_DATA = true;  // Set to false after Edge Function deployment
```

## Quick Test Commands

### Test SOS Alert Creation
```bash
curl -X POST https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/sos/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "userName": "Test User",
    "userEmail": "test@example.com",
    "contactNumber": "09123456789",
    "details": "Test emergency",
    "location": {"lat": 14.5995, "lng": 120.9842, "address": "Manila"}
  }'
```

### Test Health Check
```bash
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

## Security Notes

⚠️ **Important:**
- Never commit Supabase Service Role Key to git
- Department passwords are for testing only
- Change passwords before production deployment
- Keep database password secure
- Rotate API keys regularly

## Backup Credentials Location

All credentials are also stored in:
- Supabase Dashboard → Project Settings
- Environment variables in Edge Functions
- `/utils/supabase/info.tsx` (frontend keys only)
