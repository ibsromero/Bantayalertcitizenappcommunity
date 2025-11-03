# BantayAlert - Disaster Preparedness App

A comprehensive disaster preparedness and emergency response application for NCR, Philippines, with full Supabase integration.

## 🚀 Quick Start

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

### Setup & Configuration:
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)** - Complete setup instructions for Supabase, database, real-time, and Android deployment
- **[COMPLETE_SUPABASE_SETUP.sql](./COMPLETE_SUPABASE_SETUP.sql)** - Database setup SQL (run this in Supabase SQL Editor)
- **[CREDENTIALS.md](./CREDENTIALS.md)** - All login credentials and API keys

### Features & Usage:
- **[ESSENTIAL_GUIDE.md](./ESSENTIAL_GUIDE.md)** - Core features and usage guide
- **[DEPLOY.md](./DEPLOY.md)** - Deployment instructions

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

## 📱 Android Deployment

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) Part 6 for full Android deployment instructions using Capacitor.

Quick steps:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

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
