# BantayAlert - Disaster Preparedness App

A comprehensive disaster preparedness and emergency response application for NCR, Philippines, with full Supabase integration.

## 🚀 Quick Start

### First-Time Setup (Required):
1. **Database Setup**: Run `COMPLETE_SUPABASE_SETUP.sql` in [Supabase SQL Editor](https://app.supabase.com/project/gzefyknnjlsjmcgndbfn/editor)
2. **Disable Email Confirmation**: Go to Supabase → Authentication → Settings → Toggle OFF "Confirm email"
3. **Enable Real-time**: Go to Supabase → Database → Replication → Enable all tables

### For Users:
1. Open the app in your browser or Android device
2. **Sign Up** - Create an account (no email verification needed)
3. **Login** - Access all features immediately
4. Explore emergency preparedness features

### For Department/Admin Access:
Use these pre-configured accounts:
- **LGU**: lgu@bantayalert.ph / LGU@NCR2024
- **Emergency Responder**: responder@bantayalert.ph / RESPONDER@NCR2024
- **Healthcare**: healthcare@bantayalert.ph / HEALTHCARE@NCR2024
- **NDRRMC**: ndrrmc@bantayalert.ph / NDRRMC@NCR2024

## 📚 Essential Documentation

- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Complete setup and deployment guide
- **[COMPLETE_SUPABASE_SETUP.sql](./COMPLETE_SUPABASE_SETUP.sql)** - Database setup SQL (run in Supabase SQL Editor)
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[TEST_CHECKLIST.md](./TEST_CHECKLIST.md)** - Comprehensive testing checklist
- **[COMPREHENSIVE_ERROR_CHECK.md](./COMPREHENSIVE_ERROR_CHECK.md)** - Full validation report
- **[CREDENTIALS.md](./CREDENTIALS.md)** - Login credentials and API keys

## ✨ Key Features

### For Citizens:
- ✅ **Emergency Contacts** - Save and manage emergency contacts
- ✅ **Preparation Checklists** - Track disaster preparedness tasks
- ✅ **Emergency Kit** - Inventory management with family size calculations
- ✅ **Weather Alerts** - Real-time PAGASA integration
- ✅ **Evacuation Routes** - Find nearest evacuation centers
- ✅ **SOS Alerts** - One-tap emergency alerts to responders
- ✅ **Emergency Resources** - Quick access to hotlines and hospitals

### For Departments:
- ✅ **Real-time SOS Monitoring** - Track all emergency alerts
- ✅ **Disaster Monitoring** - View and manage active disasters
- ✅ **Healthcare Integration** - Hospital capacity tracking
- ✅ **Data Analytics** - Response metrics and insights
- ✅ **Emergency Map** - Geospatial view of all incidents
- ✅ **Post-Disaster Assessment** - Analysis and reporting tools

## 🛠 Recent Fixes (November 2, 2025)

### Emergency Kit:
- ✅ Added delete button for custom items
- ✅ Items scale with family size (per-person checkbox)
- ✅ Family size changes update suggested quantities
- ✅ All changes save to Supabase automatically

### Authentication:
- ✅ Email confirmation disabled - instant login
- ✅ User profiles save to Supabase on signup
- ✅ Fixed demo mode - now requires valid credentials
- ✅ Department profiles display correctly

### SOS Alerts:
- ✅ SOS alerts save directly to Supabase
- ✅ Alerts visible on department dashboard in real-time
- ✅ Works for both logged-in and guest users
- ✅ Department can update alert status

## 📊 Database Tables

All data stored in Supabase:
- `user_profiles` - User account information
- `emergency_contacts` - Emergency contact lists
- `preparation_checklists` - Disaster prep checklists
- `emergency_kit_items` - Emergency kit inventories
- `sos_alerts` - Emergency SOS alerts (citizen → department)
- `disasters` - Active disaster monitoring
- `hospitals` - Hospital locations and capacity
- `evacuation_centers` - Evacuation center locations
- `user_activity_log` - Activity tracking
- `kv_store` - Key-value storage

## 🔄 Real-time Features

All tables have real-time enabled:
- SOS alerts appear on department dashboard immediately
- Hospital capacity updates sync across all users
- Disaster updates broadcast to all connected clients
- No page refresh needed - data updates automatically

## 🌐 Web Deployment (GitHub Pages)

### Automatic Deployment:
1. Push code to GitHub
2. GitHub Actions automatically builds and deploys
3. Access at: `https://[your-username].github.io/[repo-name]`

### Manual Deployment:
```bash
npm install
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Supported Platforms:
- ✅ GitHub Pages
- ✅ Vercel
- ✅ Netlify
- ✅ Any static hosting service

## 📱 Android Deployment

### Quick Start:
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init
# App name: BantayAlert
# Package ID: com.bantayalert.app

# Build web app
npm run build

# Add Android platform
npx cap add android

# Sync files
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Build APK:
1. Open project in Android Studio
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Install on device or publish to Play Store

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for detailed instructions.

## 🆘 Support & Issues

### Common Issues:

**"Please check your email to verify"**
- Solution: Disable email confirmation in Supabase (see COMPLETE_SETUP_GUIDE.md Part 2)

**SOS alerts not showing on department side**
- Solution: Run COMPLETE_SUPABASE_SETUP.sql to create tables and enable RLS policies

**Items won't delete from Emergency Kit**
- Solution: Fixed! Hover over item to see delete button (trash icon)

**Family size doesn't update quantities**
- Solution: Fixed! Quantities update automatically, check "per-person" when adding items

## 📞 Emergency Contacts

For real emergencies in the Philippines:
- **Emergency Hotline**: 911
- **NDRRMC**: (02) 8911-1406
- **Red Cross**: 143
- **MMDA**: 136

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Department accounts have read-only access to citizen data
- SOS alerts visible to all for emergency response
- Secure authentication with Supabase Auth

## 📄 License

See guidelines/Guidelines.md for project guidelines and standards.

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, Capacitor
**Target:** NCR, Philippines
**Status:** Fully Functional ✅
