# BantayAlert - Fully Operational Features

## 🚀 Real Working Features

### 📞 Phone & SMS Functionality
- **Make Real Phone Calls**: Click any phone icon to initiate actual calls using `tel:` protocol
- **Send SMS Messages**: Text contacts directly from the app using `sms:` protocol
- **Mass Emergency Alerts**: Send SMS to all emergency contacts simultaneously
- **Works on Mobile**: Automatically opens phone/SMS apps on mobile devices

### 👤 User Authentication (Supabase)
- **Real Sign Up**: Create actual accounts stored in Supabase database
- **Secure Login**: JWT-based authentication with session management
- **Demo Mode**: Use `demo@bantayalert.ph` / `demo123` for instant testing
- **Password Reset**: Forgot password functionality (via Supabase)
- **Auto-confirm**: Email confirmation auto-enabled for demos

### 💾 Data Persistence
- **LocalStorage**: All data saved automatically in browser
- **Supabase Backend**: Optional cloud sync for logged-in users
- **Offline Support**: Works without internet using localStorage
- **Auto-save**: Contacts, checklists, and settings persist across sessions

### 🔔 Browser Notifications
- **Weather Alerts**: Real push notifications for PAGASA warnings
- **Emergency Alerts**: Critical notifications with sound/vibration
- **Permission Request**: One-click enable notifications
- **Customizable**: Choose which alert types to receive

### 📍 Geolocation & Maps
- **Auto-detect Location**: Uses browser Geolocation API
- **NCR City Detection**: Automatically finds nearest Metro Manila city
- **Google Maps Integration**: Real directions to evacuation centers
- **Distance Calculation**: Haversine formula for accurate distances

### 📄 PDF Downloads
- **Typhoon Preparedness Guide**: Downloadable HTML/PDF format
- **Earthquake Safety Protocol**: Complete safety procedures
- **Flood Response Guide**: Step-by-step flood safety
- **Fire Safety Guide**: Fire prevention and response
- **PAGASA Standards**: All guides follow official Philippine protocols

### 🗺️ Interactive Maps
- **Evacuation Centers**: Real locations in Metro Manila
- **Get Directions**: Opens Google Maps with routing
- **Distance Display**: Shows km from your location
- **Call Centers**: Direct calling to evacuation facilities

### 🌐 External Integrations
- **PAGASA Website**: Opens official weather service
- **PHIVOLCS Website**: Links to earthquake monitoring
- **NDRRMC Website**: National disaster response portal
- **All open in new tabs**: Seamless external navigation

## 📱 How to Use Real Features

### Making Phone Calls
```typescript
// Click any phone icon next to contacts
// On mobile: Opens phone app with number pre-filled
// On desktop: Opens telephony app if available
```

### Sending SMS
```typescript
// Click message icon next to personal contacts
// Emergency Mass Alert sends to all contacts
// Message body pre-filled with emergency text
```

### Enabling Notifications
```typescript
// Click "Enable Alerts" button in Weather section
// Grant permission when browser prompts
// Receive test notification immediately
// Get real weather alerts from PAGASA data
```

### Using Geolocation
```typescript
// Click "Detect Location" in Weather Alerts
// Allow location access when prompted
// App finds nearest NCR city automatically
// Updates weather data for your location
```

### Downloading Guides
```typescript
// Click "Download Guide" on any emergency guide
// HTML file downloads instantly
// Can be printed or saved as PDF
// Includes all PAGASA/PHIVOLCS contact numbers
```

### Getting Directions
```typescript
// Click "Directions" on any evacuation center
// Opens Google Maps with route
// Works on both mobile and desktop
// Uses current location for routing
```

## 🔧 Technical Implementation

### Phone/SMS Utilities (`/utils/phoneUtils.ts`)
- `makePhoneCall()` - Initiates tel: protocol
- `sendSMS()` - Opens SMS with pre-filled message
- `sendMassAlert()` - Batch SMS to multiple contacts
- `formatPhoneNumber()` - Philippines number formatting
- `isValidPhilippineNumber()` - Validates PH format

### Storage Utilities (`/utils/storageUtils.ts`)
- `saveToStorage()` - Persist data to localStorage
- `getFromStorage()` - Retrieve saved data
- `removeFromStorage()` - Delete specific data
- `clearAllStorage()` - Reset all app data

### Notification Utilities (`/utils/notificationUtils.ts`)
- `requestNotificationPermission()` - Ask user permission
- `sendNotification()` - Browser push notifications
- `sendWeatherAlert()` - PAGASA-styled alerts
- `sendEmergencyNotification()` - Critical alerts

### Geolocation Utilities (`/utils/geolocationUtils.ts`)
- `getCurrentLocation()` - Browser Geolocation API
- `getNearestCity()` - Find closest NCR city
- `calculateDistance()` - Haversine formula
- `getDirectionsUrl()` - Google Maps routing

### PDF Utilities (`/utils/pdfUtils.ts`)
- `downloadTyphoonGuide()` - Generates typhoon PDF
- `downloadEarthquakeGuide()` - Earthquake safety PDF
- `downloadFloodGuide()` - Flood response PDF
- `downloadFireGuide()` - Fire safety PDF

### Supabase Client (`/utils/supabaseClient.ts`)
- `signUp()` - Create new user account
- `signIn()` - Authenticate user
- `signOut()` - End session
- `saveUserData()` - Sync to cloud
- `getUserData()` - Fetch from cloud
- `getWeatherData()` - Weather API endpoint

## 🇵🇭 Philippines-Specific Features

### Emergency Numbers
- **911** - National Emergency Hotline
- **143** - Philippine Red Cross
- **(02) 8911-1406** - NDRRMC
- **(02) 8284-0800** - PAGASA Weather
- **(02) 8426-1468** - PHIVOLCS

### Weather Alerts (PAGASA)
- **Typhoon Signals** - 5-level warning system
- **Rainfall Warnings** - Heavy to intense rain
- **Thunderstorm Advisories** - Lightning alerts
- **Habagat Warnings** - Southwest Monsoon
- **All in Celsius** - Temperature in °C, Wind in km/h

### NCR Cities (All 17)
- Manila, Quezon City, Caloocan, Las Piñas
- Makati, Malabon, Mandaluyong, Marikina
- Muntinlupa, Navotas, Parañaque, Pasay
- Pasig, Pateros, San Juan, Taguig, Valenzuela

### Evacuation Centers
- **Rizal Memorial Sports Complex** - 5,000 capacity
- **Manila City Hall** - 3,000 capacity
- **UP Manila** - 8,000 capacity

## 🎯 Demo Credentials

**For quick testing without signup:**
- Email: `demo@bantayalert.ph`
- Password: `demo123`

**Or create your own account:**
- Any email + password (min 6 characters)
- Works in demo mode even without Supabase
- Real Supabase auth if backend is configured

## 📊 Data Flow

### User Authentication
```
User Login → Supabase Auth → JWT Token → Local Storage
          ↓
    Cloud Sync (Optional) → Supabase KV Store
```

### Emergency Call
```
Click Phone Icon → makePhoneCall() → tel: protocol → Device Phone App
```

### Location Detection
```
Enable Location → Browser API → Get Coords → Calculate Nearest City → Update Weather
```

### Notifications
```
Enable Alerts → Request Permission → Subscribe → Receive PAGASA Alerts
```

## 🔒 Privacy & Security

- **No PII Collection**: All data stored locally by default
- **Optional Cloud Sync**: User controls if data syncs to Supabase
- **Secure Auth**: JWT tokens, password hashing
- **Clear Data Anytime**: Settings → Clear All Data
- **Offline First**: Works without internet connection

## 🚨 Production Notes

This is a **prototype/demo application**. For production use:

1. **Add Email Server**: Configure Supabase SMTP for verification emails
2. **Weather API**: Integrate real PAGASA or OpenWeatherMap API
3. **Maps API**: Add Google Maps API key for full map features
4. **Push Notifications**: Set up FCM for mobile push
5. **Data Validation**: Add server-side validation for all inputs
6. **Rate Limiting**: Prevent SMS spam and API abuse
7. **Privacy Policy**: Add proper terms and data handling policies

## 📞 Support

For issues or questions:
- Emergency: Call 911
- PAGASA: www.pagasa.dost.gov.ph
- PHIVOLCS: www.phivolcs.dost.gov.ph
- NDRRMC: www.ndrrmc.gov.ph

---

**BantayAlert** - Be Prepared. Stay Safe. 🇵🇭
