# BantayAlert Settings & Profile Documentation

## Overview
The BantayAlert settings system has been completely redesigned into a modular, user-friendly architecture with full Supabase integration. Settings are organized into focused dialogs for better user experience and maintainability.

## Architecture

### Settings Hub
- **Component**: `SettingsHub.tsx`
- **Purpose**: Main navigation center for all app settings
- **Features**:
  - Clean card-based interface
  - Quick access to all settings categories
  - Cloud sync status display
  - Privacy policy access
  - App version info

### Settings Categories

#### 1. Profile Settings
- **Component**: `ProfileDialog.tsx`
- **Database Table**: `user_profiles`
- **Features**:
  - Name management
  - Email display (read-only)
  - Avatar with initials
  - Account creation date
  - Last update timestamp
- **Supabase Integration**: ✅ Full CRUD operations
- **Functions Used**:
  - `getUserProfile(userId)` - Load profile data
  - `updateUserProfile(userId, profile)` - Save changes
  - Auth metadata sync via `supabase.auth.updateUser()`

#### 2. Notification Settings
- **Component**: `NotificationSettingsDialog.tsx`
- **Database Table**: `user_settings`
- **Features**:
  - Master notification toggle
  - Severe weather alerts
  - Earthquake alerts
  - Flood alerts
  - Typhoon alerts
  - Critical alert disclaimer
- **Supabase Integration**: ✅ Full sync
- **Database Fields**:
  - `notification_enabled` - Master switch
  - `alert_severe_weather` - Weather toggle
  - `alert_earthquakes` - Earthquake toggle
  - `alert_floods` - Flood toggle
  - `alert_typhoons` - Typhoon toggle

#### 3. Location & Family Settings
- **Component**: `LocationSettingsDialog.tsx`
- **Database Tables**: `user_settings` + `user_profiles`
- **Features**:
  - NCR city selection (17 cities)
  - Contact phone number
  - Family member count
  - Emergency planning context
- **Supabase Integration**: ✅ Dual table updates
- **Database Fields**:
  - `location_city` - Selected NCR city
  - `family_members` - Household size
  - `phone_number` - Contact number (in user_profiles)

#### 4. Language & Appearance
- **Status**: Coming Soon
- **Planned Features**:
  - English/Filipino/Tagalog support
  - Dark mode toggle
  - Font size adjustment

## Database Schema

### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_settings Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_city TEXT,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  family_members INTEGER DEFAULT 1,
  alert_severe_weather BOOLEAN DEFAULT true,
  alert_earthquakes BOOLEAN DEFAULT true,
  alert_floods BOOLEAN DEFAULT true,
  alert_typhoons BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Flow

### Accessing Settings
1. **From Header Dropdown**:
   - Click avatar/name → Select "Settings"
   
2. **From Sidebar**:
   - Open menu → Click "Settings" button

3. **Profile Quick Access**:
   - Click avatar/name → Select "Profile"
   - Opens ProfileDialog directly

### Settings Navigation
```
SettingsHub
├── Profile Settings → ProfileDialog
├── Notification Settings → NotificationSettingsDialog  
├── Location Settings → LocationSettingsDialog
├── Language & Region → (Coming Soon)
└── Appearance → (Coming Soon)
```

## API Functions Reference

### Profile Management
```typescript
// Load user profile
const profile = await getUserProfile(userId);

// Update profile
await updateUserProfile(userId, {
  name: "New Name",
  phone_number: "+63 912 345 6789",
  city: "Makati"
});

// Create new profile
await createUserProfile(userId, {
  name: "User Name",
  email: "user@email.com"
});
```

### Settings Management
```typescript
// Load settings
const settings = await getUserSettings(userId);

// Save settings
await saveUserSettings(userId, {
  location_city: "Quezon City",
  family_members: 4,
  alert_severe_weather: true,
  alert_earthquakes: true,
  alert_floods: false,
  alert_typhoons: true,
  notification_enabled: true
});
```

## State Management

### User State Updates
When profile name is changed:
1. Update `user_profiles` table
2. Update auth metadata
3. Update local app state via callback
4. Show success toast

### Settings Persistence
- All settings auto-save to Supabase
- Real-time sync across devices
- Offline changes queued for sync
- Automatic conflict resolution

## Error Handling

### Common Scenarios
1. **Not Authenticated**:
   - Gracefully handle auth check
   - Show appropriate error message
   - Don't crash the app

2. **Network Errors**:
   - Display user-friendly message
   - Retry mechanism (automatic via Supabase)
   - Offline mode support

3. **Validation Errors**:
   - Client-side validation before submission
   - Server-side validation
   - Clear error messages

### Error Messages
```typescript
// Profile update error
toast.error("Failed to update profile", {
  description: error.message || "Please try again"
});

// Settings save error  
toast.error("Failed to save settings", {
  description: "Check your connection and try again"
});
```

## Toast Notifications

### Success Messages
- ✅ "Profile updated" - Profile changes saved
- ✅ "Settings updated" - Notification preferences saved
- ✅ "Settings updated" - Location settings saved

### Error Messages
- ❌ "Failed to update profile" - Profile save error
- ❌ "Failed to save settings" - Settings save error
- ❌ "Name is required" - Validation error

## Testing Checklist

### Profile Settings
- [ ] Load existing profile data
- [ ] Update name successfully
- [ ] Email is read-only
- [ ] Avatar shows correct initials
- [ ] Timestamps display correctly
- [ ] Changes reflect in header
- [ ] Sync to Supabase verified

### Notification Settings
- [ ] Load current preferences
- [ ] Master toggle disables all alerts
- [ ] Individual toggles work
- [ ] Changes save to database
- [ ] Settings persist across sessions

### Location Settings
- [ ] Load current city/family data
- [ ] All 17 NCR cities available
- [ ] Phone number optional
- [ ] Family member count validation
- [ ] Multi-table update works
- [ ] Changes visible in alerts

## Migration Notes

### From Old SettingsDialog
The previous monolithic `SettingsDialog.tsx` (200 lines) has been replaced with:
- `SettingsHub.tsx` (150 lines) - Navigation hub
- `ProfileDialog.tsx` (200 lines) - Profile management
- `NotificationSettingsDialog.tsx` (190 lines) - Alert preferences
- `LocationSettingsDialog.tsx` (150 lines) - Location & family

**Benefits**:
- Better code organization
- Easier maintenance
- Improved UX with focused interfaces
- Faster load times
- Better error handling per section

### Data Migration
Existing localStorage data automatically migrates to Supabase via `dataSyncUtils.ts`:
- User profile from auth metadata
- Settings from localStorage keys
- One-time migration on first login

## Security Considerations

### Row Level Security (RLS)
All settings tables use RLS policies:
```sql
-- Users can only read their own data
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Data Validation
- Server-side validation in Supabase
- Client-side validation before submission
- Type safety with TypeScript interfaces
- Sanitized inputs

## Performance Optimizations

### Loading Strategy
- Settings load only when dialog opens
- Lazy loading of sub-dialogs
- Cached user data in local state
- Minimal re-renders

### Database Queries
- Single query per settings category
- Indexed user_id fields
- Optimized joins
- Connection pooling via Supabase

## Future Enhancements

### Planned Features
1. **Dark Mode**:
   - Theme toggle in Appearance
   - System preference detection
   - Smooth transitions

2. **Language Support**:
   - Filipino translations
   - Tagalog support
   - Language switching

3. **Advanced Preferences**:
   - Custom alert sounds
   - Notification scheduling
   - Geofencing options

4. **Profile Enhancements**:
   - Profile picture upload
   - Bio/notes field
   - Account deletion

## Troubleshooting

### Settings Not Saving
1. Check authentication status
2. Verify network connection
3. Check browser console for errors
4. Confirm Supabase connection
5. Check RLS policies

### Profile Not Loading
1. Verify user is authenticated
2. Check `user_profiles` table exists
3. Confirm data migration ran
4. Check RLS policies
5. Verify user_id matches

### Can't Access Settings
1. Ensure user is logged in
2. Check Header component props
3. Verify dialog state management
4. Check for JavaScript errors

## Support & Maintenance

### Code Owners
- Settings Hub: `/components/SettingsHub.tsx`
- Profile: `/components/ProfileDialog.tsx`
- Notifications: `/components/NotificationSettingsDialog.tsx`
- Location: `/components/LocationSettingsDialog.tsx`
- Data Service: `/utils/supabaseDataService.ts`

### Related Files
- Database schema: `/SUPABASE_QUERIES.sql`
- Setup guide: `/SUPABASE_SETUP_GUIDE.md`
- API reference: `/FUNCTIONS_REFERENCE.md`
- Architecture: `/ARCHITECTURE.md`

---

**Last Updated**: October 19, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
