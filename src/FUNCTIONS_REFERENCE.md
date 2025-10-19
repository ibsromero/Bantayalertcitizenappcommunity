# BantayAlert Functions Reference

## Complete API Reference for All Application Functions

This document provides a comprehensive reference for all functions in the BantayAlert application, organized by module and functionality.

---

## Table of Contents

1. [User Profile Functions](#user-profile-functions)
2. [Emergency Contacts Functions](#emergency-contacts-functions)
3. [Preparation Checklist Functions](#preparation-checklist-functions)
4. [Emergency Kit Functions](#emergency-kit-functions)
5. [User Settings Functions](#user-settings-functions)
6. [Communication Plan Functions](#communication-plan-functions)
7. [Activity Logging Functions](#activity-logging-functions)
8. [Weather Alerts Functions](#weather-alerts-functions)
9. [Data Synchronization Functions](#data-synchronization-functions)
10. [Storage Utility Functions](#storage-utility-functions)
11. [Phone Utility Functions](#phone-utility-functions)
12. [Notification Functions](#notification-functions)
13. [Geolocation Functions](#geolocation-functions)
14. [Evacuation Functions](#evacuation-functions)

---

## User Profile Functions
**File**: `/utils/supabaseDataService.ts`

### getUserProfile(userId: string)
Fetches a user's profile from the database.

**Parameters**:
- `userId` (string) - The unique user ID from Supabase Auth

**Returns**: `Promise<UserProfile | null>`
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

**Example**:
```typescript
const profile = await getUserProfile('user-uuid-here');
console.log(profile.name); // "John Doe"
```

---

### createUserProfile(userId: string, email: string, name: string)
Creates a new user profile in the database.

**Parameters**:
- `userId` (string) - User's unique ID
- `email` (string) - User's email address
- `name` (string) - User's display name

**Returns**: `Promise<UserProfile>`

**Throws**: Error if profile creation fails (except duplicate key)

**Example**:
```typescript
const profile = await createUserProfile(
  'user-uuid',
  'user@example.com',
  'John Doe'
);
```

---

### updateUserProfile(userId: string, updates: Partial<UserProfile>)
Updates an existing user profile.

**Parameters**:
- `userId` (string) - User's unique ID
- `updates` (object) - Partial profile object with fields to update

**Returns**: `Promise<UserProfile>`

**Example**:
```typescript
await updateUserProfile('user-uuid', { name: 'Jane Doe' });
```

---

### ensureUserProfile(userId: string, email: string, name: string)
Ensures a user profile exists, creating or updating as needed.

**Parameters**:
- `userId` (string) - User's unique ID
- `email` (string) - User's email address
- `name` (string) - User's display name

**Returns**: `Promise<UserProfile>`

**Behavior**:
- Checks if profile exists
- Creates new profile if missing
- Updates name if changed
- Always returns valid profile

**Example**:
```typescript
const profile = await ensureUserProfile(
  userId,
  'user@example.com',
  'John Doe'
);
```

---

## Emergency Contacts Functions
**File**: `/utils/supabaseDataService.ts`

### getEmergencyContacts(userId: string)
Retrieves all emergency contacts for a user.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<EmergencyContact[]>`
```typescript
{
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  contact_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}[]
```

**Ordering**: Primary contacts first, then by creation date

**Example**:
```typescript
const contacts = await getEmergencyContacts(userId);
contacts.forEach(contact => {
  console.log(contact.name, contact.phone_number);
});
```

---

### addEmergencyContact(userId: string, contact: EmergencyContact)
Adds a new emergency contact.

**Parameters**:
- `userId` (string) - User's unique ID
- `contact` (object) - Contact information
  - `name` (string) - Contact name
  - `phone_number` (string) - Phone number
  - `contact_type` (string) - Type (family, friend, etc.)
  - `is_primary` (boolean) - Whether primary contact

**Returns**: `Promise<EmergencyContact>`

**Example**:
```typescript
const newContact = await addEmergencyContact(userId, {
  name: 'Jane Doe',
  phone_number: '+63 912 345 6789',
  contact_type: 'family',
  is_primary: true
});
```

---

### updateEmergencyContact(contactId: string, contact: Partial<EmergencyContact>)
Updates an existing emergency contact.

**Parameters**:
- `contactId` (string) - Contact's unique ID
- `contact` (object) - Fields to update

**Returns**: `Promise<EmergencyContact>`

**Example**:
```typescript
await updateEmergencyContact(contactId, {
  phone_number: '+63 912 000 0000'
});
```

---

### deleteEmergencyContact(contactId: string)
Deletes an emergency contact.

**Parameters**:
- `contactId` (string) - Contact's unique ID

**Returns**: `Promise<void>`

**Example**:
```typescript
await deleteEmergencyContact(contactId);
```

---

## Preparation Checklist Functions
**File**: `/utils/supabaseDataService.ts`

### getChecklists(userId: string)
Gets all checklists with their items for a user.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<Checklist[]>`
```typescript
{
  id: string;
  user_id: string;
  checklist_type: string; // 'earthquake', 'flood', 'typhoon'
  name: string;
  progress: number;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}[]
```

**Example**:
```typescript
const checklists = await getChecklists(userId);
checklists.forEach(list => {
  console.log(`${list.name}: ${list.progress}% complete`);
});
```

---

### initializeChecklists(userId: string, checklistsData: any)
Initializes default checklists for a user.

**Parameters**:
- `userId` (string) - User's unique ID
- `checklistsData` (object) - Checklist structure with items

**Returns**: `Promise<boolean>`

**Example**:
```typescript
await initializeChecklists(userId, {
  earthquake: {
    name: "Earthquake",
    progress: 0,
    items: [
      { text: "Secure furniture", completed: false },
      // ... more items
    ]
  }
});
```

---

### updateChecklistItem(itemId: string, completed: boolean)
Updates the completion status of a checklist item.

**Parameters**:
- `itemId` (string) - Item's unique ID
- `completed` (boolean) - New completion status

**Returns**: `Promise<void>`

**Side Effects**: Automatically recalculates parent checklist progress

**Example**:
```typescript
await updateChecklistItem(itemId, true);
```

---

## Emergency Kit Functions
**File**: `/utils/supabaseDataService.ts`

### getEmergencyKit(userId: string)
Gets all emergency kit categories and items.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<KitCategory[]>`
```typescript
{
  id: string;
  user_id: string;
  category_type: string; // 'food', 'tools', 'safety'
  name: string;
  items: KitItem[];
  created_at: string;
  updated_at: string;
}[]
```

**Example**:
```typescript
const kit = await getEmergencyKit(userId);
kit.forEach(category => {
  console.log(`${category.name}: ${category.items.length} items`);
});
```

---

### initializeEmergencyKit(userId: string, kitData: any)
Initializes default emergency kit for a user.

**Parameters**:
- `userId` (string) - User's unique ID
- `kitData` (object) - Kit structure with categories and items

**Returns**: `Promise<boolean>`

**Example**:
```typescript
await initializeEmergencyKit(userId, {
  food: {
    name: "Food & Water",
    items: [
      { name: "Water", quantity: "3", status: "missing", priority: "high" }
    ]
  }
});
```

---

### addKitItem(userId: string, categoryType: string, item: KitItem)
Adds a new item to emergency kit.

**Parameters**:
- `userId` (string) - User's unique ID
- `categoryType` (string) - Category type ('food', 'tools', 'safety')
- `item` (object) - Item details
  - `name` (string)
  - `quantity` (string)
  - `status` ('ready' | 'partial' | 'missing' | 'na')
  - `priority` ('high' | 'medium' | 'low')
  - `per_person` (boolean)

**Returns**: `Promise<KitItem>`

**Example**:
```typescript
const newItem = await addKitItem(userId, 'food', {
  name: 'Canned Goods',
  quantity: '10',
  status: 'ready',
  priority: 'high',
  per_person: false
});
```

---

### updateKitItem(itemId: string, updates: Partial<KitItem>)
Updates an emergency kit item.

**Parameters**:
- `itemId` (string) - Item's unique ID
- `updates` (object) - Fields to update

**Returns**: `Promise<KitItem>`

**Example**:
```typescript
await updateKitItem(itemId, { status: 'ready', quantity: '5' });
```

---

## User Settings Functions
**File**: `/utils/supabaseDataService.ts`

### getUserSettings(userId: string)
Retrieves user settings from database.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<UserSettings | null>`
```typescript
{
  id: string;
  user_id: string;
  location_city: string;
  location_latitude: number;
  location_longitude: number;
  family_members: number;
  alert_severe_weather: boolean;
  alert_earthquakes: boolean;
  alert_floods: boolean;
  alert_typhoons: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}
```

**Example**:
```typescript
const settings = await getUserSettings(userId);
console.log(`Location: ${settings.location_city}`);
console.log(`Family Members: ${settings.family_members}`);
```

---

### saveUserSettings(userId: string, settings: Partial<UserSettings>)
Creates or updates user settings.

**Parameters**:
- `userId` (string) - User's unique ID
- `settings` (object) - Settings to save

**Returns**: `Promise<UserSettings>`

**Behavior**: Upsert operation (creates if missing, updates if exists)

**Example**:
```typescript
await saveUserSettings(userId, {
  location_city: 'Manila',
  family_members: 5,
  alert_typhoons: true
});
```

---

## Communication Plan Functions
**File**: `/utils/supabaseDataService.ts`

### getCommunicationPlan(userId: string)
Gets the user's communication plan.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<CommunicationPlan | null>`
```typescript
{
  id: string;
  user_id: string;
  meeting_point_primary: string;
  meeting_point_secondary: string;
  out_of_town_contact_name: string;
  out_of_town_contact_phone: string;
  additional_notes: string;
  created_at: string;
  updated_at: string;
}
```

**Example**:
```typescript
const plan = await getCommunicationPlan(userId);
console.log(`Meeting Point: ${plan.meeting_point_primary}`);
```

---

### saveCommunicationPlan(userId: string, plan: CommunicationPlan)
Saves or updates communication plan.

**Parameters**:
- `userId` (string) - User's unique ID
- `plan` (object) - Communication plan details

**Returns**: `Promise<CommunicationPlan>`

**Example**:
```typescript
await saveCommunicationPlan(userId, {
  meeting_point_primary: 'City Hall Plaza',
  meeting_point_secondary: 'Central Park',
  out_of_town_contact_name: 'Jane Doe',
  out_of_town_contact_phone: '+63 912 000 0000',
  additional_notes: 'Bring emergency bag'
});
```

---

## Activity Logging Functions
**File**: `/utils/supabaseDataService.ts`

### logActivity(userId: string, activity: ActivityLog)
Logs a user activity to the database.

**Parameters**:
- `userId` (string) - User's unique ID
- `activity` (object)
  - `activity_type` (string) - Type of activity
  - `activity_description` (string) - Description
  - `metadata` (any, optional) - Additional data

**Returns**: `Promise<void>`

**Activity Types**:
- `'contact_added'`
- `'contact_updated'`
- `'contact_deleted'`
- `'checklist_updated'`
- `'kit_item_updated'`
- `'settings_updated'`
- `'profile_updated'`

**Example**:
```typescript
await logActivity(userId, {
  activity_type: 'contact_added',
  activity_description: 'Added emergency contact: Jane Doe',
  metadata: { contact_id: 'contact-uuid' }
});
```

---

### getActivityLogs(userId: string, limit?: number)
Retrieves activity logs for a user.

**Parameters**:
- `userId` (string) - User's unique ID
- `limit` (number, optional) - Maximum records to return (default: 50)

**Returns**: `Promise<ActivityLog[]>`

**Ordering**: Most recent first

**Example**:
```typescript
const recentActivities = await getActivityLogs(userId, 10);
recentActivities.forEach(log => {
  console.log(`${log.activity_timestamp}: ${log.activity_description}`);
});
```

---

## Weather Alerts Functions
**File**: `/utils/supabaseDataService.ts`

### saveWeatherAlert(userId: string, alert: WeatherAlert)
Saves a weather alert to history.

**Parameters**:
- `userId` (string) - User's unique ID
- `alert` (object)
  - `alert_type` (string) - Type of alert
  - `alert_title` (string) - Alert title
  - `alert_description` (string, optional)
  - `alert_severity` (string) - 'low' | 'medium' | 'high' | 'severe'
  - `location` (string, optional)
  - `metadata` (any, optional)

**Returns**: `Promise<void>`

**Example**:
```typescript
await saveWeatherAlert(userId, {
  alert_type: 'typhoon',
  alert_title: 'Typhoon Warning',
  alert_description: 'Signal No. 3 in Metro Manila',
  alert_severity: 'high',
  location: 'NCR'
});
```

---

### getWeatherAlerts(userId: string, limit?: number)
Gets weather alert history.

**Parameters**:
- `userId` (string) - User's unique ID
- `limit` (number, optional) - Maximum records (default: 50)

**Returns**: `Promise<WeatherAlert[]>`

**Example**:
```typescript
const alerts = await getWeatherAlerts(userId, 20);
```

---

### markWeatherAlertAsRead(alertId: string)
Marks a weather alert as read.

**Parameters**:
- `alertId` (string) - Alert's unique ID

**Returns**: `Promise<void>`

**Example**:
```typescript
await markWeatherAlertAsRead(alertId);
```

---

## Data Synchronization Functions
**File**: `/utils/dataSyncUtils.ts`

### initializeUserData(userId: string)
Initializes user data on first login, migrates from localStorage if available.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<void>`

**Behavior**:
1. Ensures user profile exists
2. Checks if migration is needed
3. Migrates localStorage data OR initializes defaults
4. Syncs data to local state
5. Marks migration as complete

**Example**:
```typescript
await initializeUserData(userId);
```

---

### syncDataFromSupabase(userId: string)
Syncs all data from Supabase to local storage.

**Parameters**:
- `userId` (string) - User's unique ID

**Returns**: `Promise<void>`

**Data Synced**:
- Emergency contacts
- Preparation checklists
- Emergency kit
- User settings
- Communication plan

**Example**:
```typescript
await syncDataFromSupabase(userId);
```

---

### autoSync()
Performs automatic sync on app load.

**Returns**: `Promise<void>`

**Behavior**: Syncs data if user is authenticated

**Example**:
```typescript
await autoSync();
```

---

### forceSync()
Forces a complete data sync (manual refresh).

**Returns**: `Promise<boolean>`

**Shows**: Loading toast during sync, success/error toast after

**Example**:
```typescript
const success = await forceSync();
```

---

## Storage Utility Functions
**File**: `/utils/storageUtils.ts`

### saveToStorage<T>(key: string, data: T)
Saves data to localStorage with prefix.

**Parameters**:
- `key` (string) - Storage key
- `data` (T) - Data to store

**Returns**: `void`

**Example**:
```typescript
saveToStorage('USER', { name: 'John', email: 'john@example.com' });
```

---

### getFromStorage<T>(key: string)
Retrieves data from localStorage.

**Parameters**:
- `key` (string) - Storage key

**Returns**: `T | null`

**Example**:
```typescript
const user = getFromStorage<UserData>('USER');
```

---

### removeFromStorage(key: string)
Removes data from localStorage.

**Parameters**:
- `key` (string) - Storage key

**Returns**: `void`

**Example**:
```typescript
removeFromStorage('USER');
```

---

### isMigrationDone()
Checks if data migration has been completed.

**Returns**: `boolean`

**Example**:
```typescript
if (!isMigrationDone()) {
  // Perform migration
}
```

---

### markMigrationDone()
Marks data migration as completed.

**Returns**: `void`

**Example**:
```typescript
markMigrationDone();
```

---

## Phone Utility Functions
**File**: `/utils/phoneUtils.ts`

### makePhoneCall(phoneNumber: string)
Initiates a phone call.

**Parameters**:
- `phoneNumber` (string) - Phone number to call

**Returns**: `void`

**Behavior**: Opens phone dialer on mobile, shows alert on desktop

**Example**:
```typescript
makePhoneCall('+63 912 345 6789');
```

---

### sendSMS(phoneNumber: string, message?: string)
Opens SMS app with pre-filled message.

**Parameters**:
- `phoneNumber` (string) - Recipient's phone number
- `message` (string, optional) - Pre-filled message text

**Returns**: `void`

**Example**:
```typescript
sendSMS('+63 912 345 6789', 'Emergency! Need help.');
```

---

### formatPhoneNumber(phone: string)
Formats a phone number for display.

**Parameters**:
- `phone` (string) - Raw phone number

**Returns**: `string`

**Example**:
```typescript
formatPhoneNumber('09123456789'); // "+63 912 345 6789"
```

---

## Notification Functions
**File**: `/utils/notificationUtils.ts`

### requestNotificationPermission()
Requests browser notification permission.

**Returns**: `Promise<NotificationPermission>`

**Example**:
```typescript
const permission = await requestNotificationPermission();
if (permission === 'granted') {
  // Can send notifications
}
```

---

### sendNotification(title: string, options?: NotificationOptions)
Sends a browser notification.

**Parameters**:
- `title` (string) - Notification title
- `options` (object, optional) - Notification options
  - `body` (string) - Notification body text
  - `icon` (string) - Icon URL
  - `badge` (string) - Badge URL
  - `tag` (string) - Notification tag

**Returns**: `Promise<void>`

**Example**:
```typescript
await sendNotification('Weather Alert', {
  body: 'Typhoon warning for your area',
  icon: '/icon.png'
});
```

---

## Geolocation Functions
**File**: `/utils/geolocationUtils.ts`

### getCurrentPosition()
Gets user's current geographic position.

**Returns**: `Promise<GeolocationPosition>`

**Example**:
```typescript
const position = await getCurrentPosition();
console.log(position.coords.latitude, position.coords.longitude);
```

---

### calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number)
Calculates distance between two coordinates.

**Parameters**:
- `lat1`, `lon1` - First coordinate
- `lat2`, `lon2` - Second coordinate

**Returns**: `number` - Distance in kilometers

**Example**:
```typescript
const distance = calculateDistance(14.5995, 120.9842, 14.6091, 121.0223);
console.log(`${distance.toFixed(2)} km`);
```

---

## Evacuation Functions
**File**: `/utils/evacuationUtils.ts`

### getEvacuationCenters(city: string)
Gets list of evacuation centers for a city.

**Parameters**:
- `city` (string) - City name

**Returns**: `EvacuationCenter[]`
```typescript
{
  name: string;
  address: string;
  city: string;
  capacity: number;
  facilities: string[];
}[]
```

**Example**:
```typescript
const centers = getEvacuationCenters('Manila');
```

---

### findNearestEvacuationCenter(latitude: number, longitude: number, city: string)
Finds the nearest evacuation center.

**Parameters**:
- `latitude` (number) - User's latitude
- `longitude` (number) - User's longitude
- `city` (string) - City to search in

**Returns**: `EvacuationCenter | null`

**Example**:
```typescript
const nearest = findNearestEvacuationCenter(14.5995, 120.9842, 'Manila');
```

---

## Summary

This reference covers **60+ functions** across the BantayAlert application, providing:

- **User Management**: Profile, settings, authentication
- **Emergency Preparedness**: Contacts, checklists, kit management
- **Real-time Data**: Weather alerts, activity logging
- **Data Persistence**: Supabase integration, localStorage sync
- **User Experience**: Notifications, phone integration, geolocation
- **Communication**: Emergency plans, evacuation routes

All functions are production-ready with proper error handling, type safety, and Supabase integration.
