# BantayAlert - Supabase Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DEVICE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          UI Components                          │  │  │
│  │  │  • EmergencyContacts                            │  │  │
│  │  │  • PreparationChecklist                         │  │  │
│  │  │  • EmergencyKit                                 │  │  │
│  │  │  • Dashboard                                    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                        ↕                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │       Data Service Layer                        │  │  │
│  │  │  • supabaseDataService.ts                       │  │  │
│  │  │  • dataSyncUtils.ts                             │  │  │
│  │  │  • activityUtils.ts                             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                        ↕                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     Supabase Client (supabaseClient.ts)         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                        ↕                               │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     localStorage (Offline Cache)                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Authentication (Auth)                    │  │
│  │  • User signup/login                                  │  │
│  │  • Session management                                 │  │
│  │  • Password reset                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         PostgreSQL Database (13 Tables)               │  │
│  │                                                        │  │
│  │  User Data:                                           │  │
│  │  • user_profiles                                      │  │
│  │  • user_settings                                      │  │
│  │                                                        │  │
│  │  Emergency Data:                                      │  │
│  │  • emergency_contacts                                 │  │
│  │  • preparation_checklists                            │  │
│  │  • checklist_items                                   │  │
│  │  • emergency_kit_categories                          │  │
│  │  • emergency_kit_items                               │  │
│  │  • kit_item_expirations                              │  │
│  │  • equipment_tests                                   │  │
│  │                                                        │  │
│  │  Plans & Routes:                                      │  │
│  │  • communication_plans                               │  │
│  │  • evacuation_favorites                              │  │
│  │                                                        │  │
│  │  History:                                             │  │
│  │  • activity_logs                                     │  │
│  │  • weather_alerts_history                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS) Layer                │  │
│  │  • User data isolation                                │  │
│  │  • Automatic security policies                        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Supabase Dashboard (You!)                     │  │
│  │  • Table Editor - View all data                       │  │
│  │  • SQL Editor - Run queries                           │  │
│  │  • Logs - Monitor system                              │  │
│  │  • Analytics - Track metrics                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### 1. User Sign Up Flow
```
User signs up
     ↓
Supabase Auth creates account
     ↓
User profile created in user_profiles table
     ↓
Default checklists initialized
     ↓
Default emergency kit initialized
     ↓
Activity logged
     ↓
User sees welcome screen
```

### 2. Add Emergency Contact Flow
```
User adds contact in UI
     ↓
Component calls addEmergencyContact()
     ↓
supabaseDataService validates data
     ↓
INSERT into emergency_contacts table
     ↓
RLS checks user_id matches auth.uid()
     ↓
Data saved to database
     ↓
Activity logged to activity_logs
     ↓
Data cached in localStorage
     ↓
UI updates with new contact
     ↓
Success toast shown
```

### 3. First Login Migration Flow
```
Existing user logs in
     ↓
App checks if migration done
     ↓
Finds localStorage data
     ↓
Reads all local data:
  • Contacts
  • Checklists
  • Kit items
  • Settings
     ↓
Migrates to Supabase:
  • Creates records in tables
  • Links to user_id
  • Maintains relationships
     ↓
Marks migration complete
     ↓
Shows success message
     ↓
App now uses Supabase
```

### 4. Data Sync on App Load
```
User opens app
     ↓
App checks Supabase session
     ↓
Session valid?
     ├─ Yes: Load user data
     │       ↓
     │  Fetch from all tables:
     │    • Contacts
     │    • Checklists
     │    • Kit items
     │    • Settings
     │    • Activities
     │       ↓
     │  Cache in localStorage
     │       ↓
     │  Update UI
     │
     └─ No: Use localStorage cache
            ↓
       Show offline mode
```

## 🔐 Security Architecture

```
User Request
     ↓
Supabase Auth validates JWT token
     ↓
Row Level Security (RLS) checks:
  • Is user authenticated?
  • Does user_id match auth.uid()?
  • Is operation allowed (SELECT/INSERT/UPDATE/DELETE)?
     ↓
Policy allows? ─┬─ Yes: Execute query
                │       ↓
                │  Return data
                │
                └─ No: Block request
                        ↓
                   Return error
```

## 📁 File Organization

```
/
├── App.tsx                      # Main app with auth & sync
├── components/
│   ├── EmergencyContacts.tsx    # Uses Supabase for contacts
│   ├── PreparationChecklist.tsx # Uses Supabase for checklists
│   ├── EmergencyKit.tsx         # Uses Supabase for kit
│   ├── Dashboard.tsx            # Shows Supabase activities
│   ├── DataSyncStatus.tsx       # Shows sync status
│   └── ui/                      # Reusable UI components
├── utils/
│   ├── supabaseClient.ts        # Supabase client config
│   ├── supabaseSetup.ts         # Database schema SQL
│   ├── supabaseDataService.ts   # CRUD operations
│   ├── dataSyncUtils.ts         # Migration & sync
│   ├── storageUtils.ts          # localStorage utils
│   └── activityUtils.ts         # Activity tracking
└── docs/
    ├── QUICK_START.md           # 5-min setup guide
    ├── SUPABASE_SETUP_GUIDE.md  # Detailed setup
    ├── SUPABASE_INTEGRATION.md  # Technical docs
    ├── SUPABASE_QUERIES.sql     # Useful queries
    └── ARCHITECTURE.md          # This file
```

## 🔄 Real-time Sync Flow

```
User Action → Component State Update → Supabase Write → RLS Check → Database Update
                    ↓                                                       ↓
              UI Updates                                            Activity Log
                    ↓                                                       ↓
          localStorage Cache                                     Timestamp Update
```

## 💾 Data Layer Hierarchy

```
┌─────────────────────────────────────┐
│       Component Layer               │  ← User sees and interacts
│  (React Components)                 │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│       Service Layer                 │  ← Business logic
│  (supabaseDataService.ts)           │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│       Client Layer                  │  ← API communication
│  (supabaseClient.ts)                │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│       Cache Layer                   │  ← Offline support
│  (localStorage)                     │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│       Network Layer                 │  ← HTTPS
│  (Internet)                         │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│       Database Layer                │  ← Persistent storage
│  (Supabase PostgreSQL)              │
└─────────────────────────────────────┘
```

## 🎯 Table Relationships

```
user_profiles (1)
    ├─── (1:N) emergency_contacts
    ├─── (1:N) preparation_checklists
    │              └─── (1:N) checklist_items
    ├─── (1:N) emergency_kit_categories
    │              └─── (1:N) emergency_kit_items
    │                         ├─── (1:N) kit_item_expirations
    │                         └─── (1:N) equipment_tests
    ├─── (1:1) user_settings
    ├─── (1:1) communication_plans
    ├─── (1:N) evacuation_favorites
    ├─── (1:N) activity_logs
    └─── (1:N) weather_alerts_history
```

## 🚦 Error Handling Flow

```
User Action
     ↓
Try: Execute operation
     ├─ Success:
     │    ↓
     │  Update UI
     │    ↓
     │  Show success toast
     │    ↓
     │  Log activity
     │
     └─ Error:
          ↓
     Catch error
          ↓
     Log to console
          ↓
     Show error toast
          ↓
     Fallback to localStorage
          ↓
     Retry later (if applicable)
```

## 📊 Admin Visibility

```
Supabase Dashboard (You)
    ↓
┌─────────────────────────────────────┐
│       Table Editor                  │  ← View all tables
│  • Browse data                      │
│  • Filter & search                  │
│  • Export CSV                       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│       SQL Editor                    │  ← Run queries
│  • Custom analytics                 │
│  • Reports                          │
│  • Data exploration                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│       Logs                          │  ← Monitor system
│  • API calls                        │
│  • Errors                           │
│  • Performance                      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│       Auth                          │  ← Manage users
│  • User list                        │
│  • Permissions                      │
│  • Sessions                         │
└─────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App.tsx (Root)
  ├─ Header
  │   ├─ Logo
  │   ├─ AuthModal
  │   └─ SettingsDialog
  │       └─ DataSyncStatus
  ├─ Navigation
  └─ Main Content (Router)
      ├─ Dashboard
      │   ├─ QuickActions
      │   ├─ WeatherAlert
      │   └─ RecentActivity
      ├─ EmergencyContacts
      │   ├─ ContactList
      │   ├─ AddContactDialog
      │   └─ EditContactDialog
      ├─ PreparationChecklist
      │   ├─ ChecklistTabs
      │   ├─ ChecklistItems
      │   └─ CommunicationPlanDialog
      ├─ EmergencyKit
      │   ├─ KitCategories
      │   ├─ KitItems
      │   ├─ ExpirationCheckDialog
      │   └─ EquipmentTestDialog
      ├─ WeatherAlerts
      │   ├─ CurrentAlerts
      │   ├─ AlertSettingsDialog
      │   └─ NotificationsDialog
      ├─ EvacuationRoutes
      │   ├─ CitySelector
      │   ├─ RoutesList
      │   └─ LocationSettingsDialog
      └─ EmergencyResources
          ├─ ResourceCategories
          └─ ResourceList
```

## 🔍 Query Performance

```
User Request
     ↓
Check localStorage cache
     ├─ Cache hit & valid:
     │    ↓
     │  Return cached data (instant)
     │    ↓
     │  Background: Fetch from Supabase
     │    ↓
     │  Update cache if different
     │
     └─ Cache miss:
          ↓
     Fetch from Supabase
          ↓
     Apply RLS filters (indexed)
          ↓
     Return data (fast)
          ↓
     Cache result
```

## 📈 Scalability

```
Current Architecture
     ↓
PostgreSQL (Supabase)
  • Handles millions of rows
  • Automatic indexing
  • Connection pooling
     ↓
Row Level Security
  • Filter at database level
  • No N+1 queries
  • Efficient joins
     ↓
Client-side Caching
  • Reduced API calls
  • Faster UI updates
  • Offline support
     ↓
Result: Scales to thousands of users
```

## 🎯 Summary

The BantayAlert architecture provides:

✅ **Separation of Concerns** - Clear layers for UI, logic, and data
✅ **Security by Default** - RLS ensures data isolation
✅ **Offline First** - localStorage caching for reliability
✅ **Real-time Sync** - Changes reflected immediately
✅ **Scalable** - PostgreSQL handles growth
✅ **Observable** - Complete visibility in dashboard
✅ **Maintainable** - Clean code structure
✅ **Type Safe** - TypeScript throughout
✅ **Error Resilient** - Comprehensive error handling
✅ **User Friendly** - Fast, responsive, reliable

This architecture ensures BantayAlert is production-ready and can scale as your user base grows! 🚀
