# BantayAlert Essential Guide

## 🚀 Quick Start

### Citizen Access
Just open the app - no login required for basic features!
- View emergency contacts
- Access preparation checklists
- Send SOS alerts (no login needed!)
- Check weather alerts

### Department Access
**Login Credentials:**
```
LGU:         lgu@bantayalert.ph         / LGU2025!Manila
Responder:   responder@bantayalert.ph   / RESP2025!911
Healthcare:  healthcare@bantayalert.ph  / HEALTH2025!Care
NDRRMC:      ndrrmc@bantayalert.ph      / NDRRMC2025!PH
```

---

## 📱 Features Overview

### Citizen Features
- **Emergency Contacts** - Store and call emergency contacts
- **Preparation Checklist** - Track disaster preparedness tasks
- **Emergency Kit** - Manage survival supplies inventory
- **Weather Alerts** - PAGASA integration for weather warnings
- **Evacuation Routes** - Map-based evacuation planning
- **Resources** - Educational materials and guides
- **SOS Alert** - Send distress signal (no login required)

### Department Features
- **Real-time Dashboard** - Monitor all disasters across NCR
- **SOS Alert Tracking** - View and respond to citizen SOS alerts
- **Disaster Monitoring** - Track active disasters and incidents
- **Healthcare Integration** - Hospital capacity and availability
- **Analytics** - Post-disaster assessment and reporting
- **Emergency Map** - Live map of incidents (LGU/Responders only)

---

## 🔧 Edge Functions Deployment

### Prerequisites
```bash
# Install Node.js 18+ from nodejs.org
# Install Supabase CLI
npm install -g supabase
```

### Deploy Steps
```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref gzefyknnjlsjmcgndbfn

# 3. Deploy main server
supabase functions deploy server --project-ref gzefyknnjlsjmcgndbfn

# 4. Deploy department API
supabase functions deploy departmentApiService --project-ref gzefyknnjlsjmcgndbfn

# 5. Test deployment
curl https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/make-server-dd0f68d8/health
```

### After Deployment
Update `/utils/departmentApiService.ts`:
```typescript
const USE_MOCK_DATA = false; // Change from true to false
```

---

## 🏥 SOS Alert System

### For Citizens
1. Click the red "SEND SOS ALERT" button (no login required)
2. Fill in your details:
   - Name
   - Email/Phone
   - Emergency details
   - Location (auto-detected or manual)
3. Click "Send SOS Alert"
4. Alert is immediately sent to all department dashboards

### For Departments
1. Sign in with department credentials
2. Navigate to "SOS Alerts" tab
3. View all incoming SOS alerts in real-time
4. Update alert status:
   - Pending → Responding → Resolved
5. View alert details and location

---

## 📊 Department Dashboard

### Overview Tab
- Quick stats: Active disasters, SOS alerts, evacuees, hospitals
- Critical weather alerts
- Recent activity feed
- Analytics summary

### Monitoring Tab
- List of active disasters
- Create new disaster events
- Update disaster status
- View affected areas and casualties

### SOS Alerts Tab
- Real-time SOS distress signals
- Filter by status (pending/responding/resolved)
- Respond to alerts
- View citizen contact info and location

### Healthcare Tab
- Hospital network status
- Bed capacity tracking
- Emergency room availability
- Update hospital information

### Emergency Map Tab (LGU/Responders)
- Interactive map of NCR
- SOS alert locations
- Disaster event markers
- Evacuation center locations

---

## 🔐 Authentication

### Citizen Sign Up
```
1. Click "Sign In" button
2. Select "Citizen" user type
3. Click "Sign Up"
4. Enter email, name, and password
5. Automatically confirmed (no email verification needed)
```

### Department Sign In
```
1. Click "Sign In" button
2. Select "Department" user type
3. Choose department role (LGU, Responder, Healthcare, NDRRMC)
4. Enter department email and password
5. Access department dashboard
```

---

## 🗂️ Data Storage

### For Citizens (Signed In)
- All data syncs to Supabase
- Accessible from any device
- Automatic cloud backup
- Real-time sync across sessions

### For Citizens (Not Signed In)
- Data stored in browser localStorage
- Stays on current device only
- Still fully functional
- Can sign up later to sync data

### For Departments
- All data stored in Supabase
- Real-time updates across all users
- Historical data retention
- Analytics and reporting

---

## 🛠️ Troubleshooting

### SOS Alerts Not Sending
**If you see orange "Local Mode" warning:**
1. Edge Functions not deployed yet
2. Alerts save to browser storage temporarily
3. Deploy Edge Functions to enable cloud delivery
4. See "Edge Functions Deployment" section above

**If you see green "Success" message:**
✅ Working perfectly! Alert sent to cloud and departments.

### Department Login Issues
**"Invalid credentials" error:**
- Double-check email and password (case-sensitive)
- Ensure correct department role selected
- Try copy-pasting credentials from this guide

**Session expires immediately:**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for errors

### Data Not Syncing
**For citizens:**
- Ensure you're signed in
- Check internet connection
- Look for sync status indicator in settings

**For departments:**
- Verify Edge Functions deployed
- Check browser console for errors
- Ensure valid authentication token

---

## 📱 Mobile Deployment (Android)

### Setup Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android
npx cap add android
```

### Build APK
```bash
npm run build
npx cap sync
npx cap open android
# Build APK in Android Studio
```

### Install on Device
```bash
# Connect Android device via USB
adb install app-debug.apk
```

---

## 🔍 Testing

### Test Citizen Features
- [ ] Open app (no login)
- [ ] Add emergency contact
- [ ] Complete checklist item
- [ ] Add kit item
- [ ] Send SOS alert
- [ ] View weather alerts

### Test Department Features
- [ ] Sign in as LGU
- [ ] View dashboard stats
- [ ] Check SOS alerts tab
- [ ] Create disaster event
- [ ] Update hospital capacity
- [ ] View emergency map

### Test Authentication
- [ ] Sign up as citizen
- [ ] Sign out and sign back in
- [ ] Sign in as department user
- [ ] Switch between accounts
- [ ] Profile updates save

---

## 📞 Support

### Key Files
- `App.tsx` - Main application entry
- `components/DepartmentDashboard.tsx` - Department interface
- `components/SOSButton.tsx` - SOS alert system
- `supabase/functions/server/index.tsx` - Main API
- `utils/departmentApiService.ts` - Department data service

### Useful Commands
```bash
# View function logs
supabase functions logs server --project-ref gzefyknnjlsjmcgndbfn

# Update function
supabase functions deploy server --project-ref gzefyknnjlsjmcgndbfn

# List all functions
supabase functions list
```

### Common Issues

**Q: SOS alerts in "Local Mode"?**  
A: Deploy Edge Functions using steps in "Edge Functions Deployment" section.

**Q: Department dashboard shows no data?**  
A: Edge Functions must be deployed. Change `USE_MOCK_DATA` to false after deployment.

**Q: Can't sign in?**  
A: Use credentials from "Department Access" section. Case-sensitive!

**Q: Features not working offline?**  
A: Citizen features work offline with localStorage. Department features require internet.

---

## ✅ Production Checklist

Before going live:

### Required
- [ ] Deploy Edge Functions to Supabase
- [ ] Set `USE_MOCK_DATA = false` in departmentApiService.ts
- [ ] Test SOS alerts end-to-end
- [ ] Test all department credentials
- [ ] Verify real-time updates working

### Recommended
- [ ] Set up PAGASA API integration
- [ ] Configure push notifications
- [ ] Add real hospital data
- [ ] Set up data backups
- [ ] Enable analytics tracking

### Optional
- [ ] Build Android APK
- [ ] Submit to Play Store
- [ ] Set up custom domain
- [ ] Add iOS support (Capacitor)
- [ ] Enable dark mode

---

## 🎯 Key Differences

### Department Sidebar vs Citizen Sidebar

**Department users see:**
- Dashboard Overview
- SOS Alerts
- Disaster Monitoring  
- Healthcare Network
- Analytics & Reports
- Evacuee Management

**Citizen users see:**
- Emergency Contacts
- Preparation Checklist
- Emergency Kit
- Weather Alerts
- Evacuation Routes
- Resources
- SOS Alert Button

### Phone Number Field
Added to citizen profiles:
- Format: 09XX XXX XXXX
- Used in SOS alerts
- Emergency contact
- Optional but recommended

---

## 🚨 Emergency Procedures

### For Citizens in Emergency
1. Click "SEND SOS ALERT" (big red button)
2. Location auto-detected
3. Add emergency details
4. Click send - alert goes to all departments immediately
5. Wait for response - help is on the way!

### For Departments Receiving SOS
1. Alert appears in SOS Alerts tab
2. View citizen location and details
3. Update status to "Responding"
4. Coordinate response
5. Mark as "Resolved" when complete

---

## 📈 Next Steps

1. **Deploy Edge Functions** - Enable full cloud functionality
2. **Test All Features** - Verify everything works
3. **Add Real Data** - Import actual hospital/evacuation data  
4. **Train Users** - Educate departments on using system
5. **Go Live** - Launch to public

**Current Status:** ✅ Fully functional with local fallback  
**Production Ready:** ⚠️ After Edge Functions deployment  
**Mobile Ready:** ✅ Responsive design complete  

---

*For detailed deployment steps, see the Edge Functions section above.*  
*For technical details, check the source code comments.*  
*For issues, check browser console and function logs.*
