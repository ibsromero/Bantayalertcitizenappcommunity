# Profile & Settings Documentation

## Overview
This document covers the Profile and Settings functionality in BantayAlert, including how they work, their integration with Supabase, and all available features.

---

## Profile Management

### Features
The Profile Dialog provides users with the ability to:
- **View profile information** - Display user's name, email, and account details
- **Edit profile name** - Update display name across the application
- **View account metadata** - See account creation date and last update timestamp
- **Sync with Supabase** - All changes are saved to the cloud database

### Components

#### ProfileDialog Component
**Location**: `/components/ProfileDialog.tsx`

**Props**:
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog is closed
- `user: { name: string; email: string; accessToken?: string } | null` - Current user data
- `onProfileUpdate?: (name: string) => void` - Callback when profile is updated

**Functionality**:
1. **Profile Loading**
   - Fetches user profile from Supabase on dialog open
   - Displays current name, email, and metadata
   - Shows formatted creation and update dates

2. **Profile Editing**
   - Users can edit their display name
   - Email field is read-only (cannot be changed)
   - Real-time validation ensures name is not empty

3. **Profile Saving**
   - Updates `user_profiles` table in Supabase
   - Updates Supabase Auth user metadata
   - Propagates changes to parent component
   - Shows success/error notifications

4. **Avatar Display**
   - Automatically generates initials from user name
   - Shows in a large 96x96 avatar
   - Updates when name changes

### Database Integration

#### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Level Security (RLS)**:
- Users can only view their own profile
- Users can only update their own profile
- Profile ID matches Supabase Auth user ID

### API Functions

#### getUserProfile(userId: string)
**Location**: `/utils/supabaseDataService.ts`

Fetches user profile from database.

**Returns**: `UserProfile | null`
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

#### updateUserProfile(userId: string, updates: Partial<UserProfile>)
Updates user profile in database.

**Parameters**:
- `userId` - User's unique ID
- `updates` - Partial profile object with fields to update

**Returns**: Updated profile data

#### ensureUserProfile(userId: string, email: string, name: string)
Creates or updates user profile. Used during login/signup.

**Behavior**:
- Checks if profile exists
- Creates new profile if missing
- Updates name if different
- Returns profile data

---

## Settings Management

### Features
The Settings Dialog allows users to configure:
- **Notification preferences** - Enable/disable all notifications
- **Alert type settings** - Configure specific disaster alerts
  - Severe Weather Alerts
  - Earthquake Alerts
  - Flood Alerts
  - Typhoon Alerts
- **Appearance settings** - Dark mode (coming soon)
- **Language preferences** - English, Filipino, Tagalog (coming soon)
- **Data & Privacy** - Auto backup settings, privacy policy
- **Sync Status** - View real-time data synchronization status

### Components

#### SettingsDialog Component
**Location**: `/components/SettingsDialog.tsx`

**Props**:
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog is closed
- `user?: { name: string; email: string } | null` - Current user data

**Key Features**:
1. **Scrollable Layout**
   - Uses `ScrollArea` component for better UX
   - Compact design fits all settings
   - Fixed header and footer for easy navigation

2. **Settings Sections**:
   - **Notifications** - Master toggle + individual alert types
   - **Appearance** - Theme settings (future)
   - **Language** - Localization options (future)
   - **Data & Privacy** - Backup and privacy controls
   - **Sync Status** - Real-time sync information

3. **State Management**
   - Loads settings from Supabase on open
   - Local state for immediate UI updates
   - Saves to Supabase on "Save Changes"
   - Shows loading states during operations

4. **Form Validation**
   - Individual switches depend on master notification toggle
   - Disabled state for unavailable features
   - Clear visual feedback

### Database Integration

#### user_settings Table
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_city TEXT,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  family_members INTEGER DEFAULT 4,
  alert_severe_weather BOOLEAN DEFAULT TRUE,
  alert_earthquakes BOOLEAN DEFAULT TRUE,
  alert_floods BOOLEAN DEFAULT TRUE,
  alert_typhoons BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Row Level Security (RLS)**:
- Users can only view their own settings
- Users can only update their own settings
- One settings record per user (enforced by UNIQUE constraint)

### API Functions

#### getUserSettings(userId: string)
**Location**: `/utils/supabaseDataService.ts`

Fetches user settings from database.

**Returns**: `UserSettings | null`
```typescript
{
  id: string;
  user_id: string;
  location_city?: string;
  location_latitude?: number;
  location_longitude?: number;
  family_members?: number;
  alert_severe_weather?: boolean;
  alert_earthquakes?: boolean;
  alert_floods?: boolean;
  alert_typhoons?: boolean;
  notification_enabled?: boolean;
  created_at: string;
  updated_at: string;
}
```

#### saveUserSettings(userId: string, settings: Partial<UserSettings>)
Creates or updates user settings.

**Behavior**:
- Checks if settings exist for user
- Updates existing settings or creates new record
- Returns updated settings data

---

## Integration Points

### Header Component
**Location**: `/components/Header.tsx`

The Header component integrates both Profile and Settings:

1. **Profile Button**
   - Shows in dropdown menu when user is logged in
   - Clicking "Profile" opens ProfileDialog
   - Updates user name in header on profile save

2. **Settings Button**
   - Available in dropdown menu and sidebar
   - Opens SettingsDialog
   - Accessible from multiple locations

3. **User Display**
   - Shows user avatar with initials
   - Displays name and email in dropdown
   - Updates in real-time when profile changes

### App Component
**Location**: `/App.tsx`

Main application integration:

1. **State Management**
   - Maintains user state across app
   - Syncs with localStorage for persistence
   - Updates on profile changes

2. **Profile Update Handler**
   ```typescript
   const handleProfileUpdate = (newName: string) => {
     if (user) {
       const updatedUser = { ...user, name: newName };
       setUser(updatedUser);
       saveToStorage("USER", updatedUser);
     }
   };
   ```

3. **User Initialization**
   - Ensures user profile exists in database
   - Called during login and auth state changes
   - Syncs profile with auth metadata

---

## User Flows

### Profile Update Flow
1. User clicks profile button in header
2. ProfileDialog opens with current data
3. User edits name field
4. User clicks "Save Changes"
5. System validates input
6. Profile updated in `user_profiles` table
7. Auth metadata updated in Supabase Auth
8. Parent component notified of change
9. UI updates across application
10. Success notification shown

### Settings Update Flow
1. User clicks settings button
2. SettingsDialog opens
3. Current settings loaded from Supabase
4. User toggles notification preferences
5. User clicks "Save Changes"
6. Settings saved to `user_settings` table
7. Success notification shown
8. Dialog closes

### First-Time User Flow
1. User signs up/logs in
2. `ensureUserProfile()` called
3. Profile created in `user_profiles` table
4. Default settings initialized
5. User can immediately access profile/settings
6. All features available

---

## Error Handling

### Profile Dialog
- **Not authenticated**: Shows error if user is not logged in
- **Network errors**: Displays error toast with retry option
- **Validation errors**: Prevents save with empty name
- **Database errors**: Shows user-friendly error messages

### Settings Dialog
- **Load failures**: Gracefully handles missing settings
- **Save failures**: Shows detailed error information
- **Network issues**: Provides retry mechanism
- **RLS violations**: Catches and handles permission errors

---

## Security Considerations

### Row Level Security (RLS)
All database tables enforce RLS policies:
- Users can only access their own data
- Prevents unauthorized data access
- Enforced at database level (cannot be bypassed)

### Data Validation
- Input sanitization on all fields
- Type checking for all updates
- Required field validation
- Length limits enforced

### Authentication
- All operations require valid user session
- Access token verified on each request
- Automatic session refresh handled by Supabase
- Sign-out clears all local data

---

## Future Enhancements

### Planned Features
1. **Profile Picture Upload**
   - Avatar image upload
   - Image cropping/resizing
   - Storage in Supabase Storage

2. **Dark Mode**
   - Theme toggle in settings
   - System preference detection
   - Persistent preference storage

3. **Language Selection**
   - Full Filipino/Tagalog translations
   - Language-specific date formatting
   - RTL support if needed

4. **Additional Settings**
   - Push notification configuration
   - Email notification preferences
   - SMS alert settings
   - Location services permissions

5. **Profile Completion**
   - Profile completeness indicator
   - Required vs optional fields
   - Completion incentives

6. **Account Management**
   - Password change
   - Email update with verification
   - Account deletion
   - Data export

---

## Testing Checklist

### Profile Functionality
- [ ] Profile dialog opens correctly
- [ ] Current data displays properly
- [ ] Name editing works
- [ ] Email is read-only
- [ ] Save updates database
- [ ] Save updates auth metadata
- [ ] UI updates after save
- [ ] Error messages display
- [ ] Loading states work
- [ ] Cancel button works

### Settings Functionality
- [ ] Settings dialog opens
- [ ] Settings load from database
- [ ] All toggles work correctly
- [ ] Master toggle disables sub-toggles
- [ ] Save updates database
- [ ] Success notifications show
- [ ] Error handling works
- [ ] ScrollArea scrolls properly
- [ ] Layout is responsive
- [ ] Coming soon features disabled

### Integration Testing
- [ ] Profile updates reflect in header
- [ ] Settings persist across sessions
- [ ] Logout clears local state
- [ ] Login loads correct data
- [ ] Multiple users isolated
- [ ] RLS policies enforced
- [ ] Network failures handled
- [ ] Concurrent updates handled

---

## Troubleshooting

### Common Issues

**Profile not loading**
- Check user is authenticated
- Verify RLS policies are active
- Check browser console for errors
- Ensure profile exists in database

**Settings not saving**
- Verify user has valid session
- Check network connectivity
- Review Supabase logs for errors
- Confirm RLS policies allow update

**Data not syncing**
- Check authentication status
- Verify Supabase connection
- Review browser console
- Test database connectivity

**UI not updating**
- Check state management
- Verify callback functions
- Review component re-rendering
- Check localStorage sync

---

## Support Resources

- **Supabase Dashboard**: View and manage data directly
- **Activity Logs**: Track all user actions
- **Browser Console**: Debug frontend issues
- **Supabase Logs**: View backend errors
- **Documentation**: This file and related docs

---

## Summary

The Profile and Settings system provides comprehensive user management with:
- ✅ Full profile editing capabilities
- ✅ Extensive settings configuration
- ✅ Supabase cloud integration
- ✅ Real-time synchronization
- ✅ Secure data access
- ✅ User-friendly interface
- ✅ Error handling and validation
- ✅ Mobile-responsive design

All functionality is production-ready and integrated with the Supabase backend for persistent, secure data storage.
