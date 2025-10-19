# BantayAlert - Testing Checklist

## Authentication & User Management

- [ ] **Sign Up**
  - [ ] Create new account with email/password
  - [ ] Verify password confirmation works
  - [ ] Check minimum password length validation (6 characters)
  - [ ] Confirm user is logged in after signup
  - [ ] Verify session persists after page refresh

- [ ] **Sign In**
  - [ ] Login with demo credentials (demo@bantayalert.ph / demo123)
  - [ ] Login with custom email/password
  - [ ] Check "show/hide password" toggle works
  - [ ] Verify error handling for invalid credentials
  - [ ] Confirm session persists after page refresh

- [ ] **Forgot Password**
  - [ ] Click "Forgot your password?" link
  - [ ] Enter email address
  - [ ] Verify success message is displayed
  - [ ] Check email sent confirmation screen

- [ ] **Sign Out**
  - [ ] Sign out from header dropdown menu
  - [ ] Sign out from sidebar navigation
  - [ ] Verify user returns to signed-out state
  - [ ] Confirm session is cleared from storage

## Emergency Contacts

- [ ] **View Contacts**
  - [ ] Emergency services (911, 143, etc.) are displayed
  - [ ] Personal contacts are displayed
  - [ ] Primary contact shows star icon

- [ ] **Add Contact**
  - [ ] Click "Add Contact" button
  - [ ] Fill in name, number, and type
  - [ ] Save new contact
  - [ ] Verify contact appears in list
  - [ ] Check toast notification appears

- [ ] **Edit Contact**
  - [ ] Click edit button on a contact
  - [ ] Modify contact information
  - [ ] Save changes
  - [ ] Verify changes are reflected
  - [ ] Check toast notification appears

- [ ] **Remove Contact**
  - [ ] Click delete button on a contact
  - [ ] Confirm deletion in alert dialog
  - [ ] Verify contact is removed from list
  - [ ] Check toast notification appears
  - [ ] Verify cannot delete emergency services

- [ ] **Call & SMS**
  - [ ] Click phone icon to initiate call
  - [ ] Click SMS icon to open messaging
  - [ ] Test "Call Primary Contact" quick action

- [ ] **Data Persistence**
  - [ ] Refresh page and verify contacts remain
  - [ ] Sign in and verify cloud sync works
  - [ ] Make changes on one device, check sync

## Emergency Kit

- [ ] **Family Members Setting**
  - [ ] Change family member count (1-10)
  - [ ] Verify quantity calculations update
  - [ ] Check "per person" items multiply correctly

- [ ] **View Kit Items**
  - [ ] Switch between Food & Water, Tools, Safety tabs
  - [ ] Verify all categories show items
  - [ ] Check progress bars display correctly
  - [ ] Verify category overview shows percentages

- [ ] **Update Item Status**
  - [ ] Change item status (Ready/Partial/Missing/N/A)
  - [ ] Verify progress updates immediately
  - [ ] Check overall progress updates
  - [ ] Verify toast notification appears

- [ ] **Add Custom Items**
  - [ ] Click "Add Item" in any category
  - [ ] Fill in item details
  - [ ] Save new item
  - [ ] Verify item appears in list

- [ ] **Maintenance Actions**
  - [ ] Click "Check Expiration Dates"
  - [ ] Click "Test Equipment"
  - [ ] Verify dialogs open properly

- [ ] **Data Persistence**
  - [ ] Refresh page and verify kit data remains
  - [ ] Change family members and verify persistence
  - [ ] Sign in and verify cloud sync works

## Preparation Checklist

- [ ] **View Checklists**
  - [ ] Switch between Earthquake, Flood, Typhoon tabs
  - [ ] Verify all items are displayed
  - [ ] Check progress bars show correctly

- [ ] **Toggle Items**
  - [ ] Check/uncheck checklist items
  - [ ] Verify progress updates immediately
  - [ ] Verify overall progress updates
  - [ ] Check toast notifications

- [ ] **Communication Plan**
  - [ ] Click "Create Family Communication Plan"
  - [ ] Fill in all required fields
  - [ ] Save plan
  - [ ] Verify plan shows in dashboard
  - [ ] Edit existing plan

- [ ] **Data Persistence**
  - [ ] Refresh page and verify checklist state
  - [ ] Sign in and verify cloud sync works

## Weather Alerts

- [ ] **Location Detection**
  - [ ] Click "Detect Location" button
  - [ ] Grant location permission
  - [ ] Verify location is detected and displayed
  - [ ] Test manual location change

- [ ] **Notifications**
  - [ ] Click "Enable Alerts" button
  - [ ] Grant notification permission
  - [ ] Verify test notification is sent
  - [ ] Check notification badge in header

- [ ] **View Alerts**
  - [ ] View active weather alerts
  - [ ] Check severity levels (High/Medium/Low)
  - [ ] Verify instructions are displayed
  - [ ] Check time ranges

- [ ] **Weather Data**
  - [ ] View current weather
  - [ ] View 4-day forecast
  - [ ] Click "Refresh" to update data

- [ ] **Alert Settings**
  - [ ] Click "Customize Alert Types"
  - [ ] Click "Update Location"
  - [ ] Verify dialogs open properly

## Evacuation Routes

- [ ] **View Evacuation Centers**
  - [ ] Verify 5 nearest centers are shown by default
  - [ ] Check centers show distance in km
  - [ ] Verify facilities are listed
  - [ ] Check capacity and phone numbers

- [ ] **Location Detection**
  - [ ] Centers show without geolocation (Manila default)
  - [ ] Click location refresh button
  - [ ] Grant location permission
  - [ ] Verify centers update based on location

- [ ] **Get Directions**
  - [ ] Click "Get Directions" on a center
  - [ ] Verify Google Maps opens
  - [ ] Check directions are shown

- [ ] **Call Center**
  - [ ] Click phone button on a center
  - [ ] Verify phone call is initiated

- [ ] **Map Display**
  - [ ] Verify map shows directions
  - [ ] Check map updates with location

## Emergency Resources

- [ ] **Emergency Hotlines**
  - [ ] View all emergency numbers
  - [ ] Click phone button to call
  - [ ] Verify availability times

- [ ] **Download Guides**
  - [ ] Download Typhoon Guide
  - [ ] Download Earthquake Guide
  - [ ] Download Flood Guide
  - [ ] Download Fire Safety Guide
  - [ ] Verify PDF downloads

- [ ] **Community Resources**
  - [ ] View resources for current location
  - [ ] Click "Get Directions"
  - [ ] Verify Google Maps opens
  - [ ] Check services are listed

- [ ] **Official Links**
  - [ ] Click NDRRMC link
  - [ ] Click PAGASA link
  - [ ] Click PHIVOLCS link
  - [ ] Verify websites open in new tab

## Dashboard

- [ ] **Quick Actions**
  - [ ] Click each quick action button
  - [ ] Verify navigation to correct sections

- [ ] **Preparedness Status**
  - [ ] View preparedness percentages
  - [ ] Verify status badges (Complete/In Progress/Pending)

- [ ] **Communication Plan**
  - [ ] View priority action if plan not complete
  - [ ] View plan details if complete
  - [ ] Click "Complete Now" or "Update Plan"

- [ ] **Recent Activity**
  - [ ] View activity log
  - [ ] Verify timestamps are relative
  - [ ] Check activity types are logged

## Notifications System

- [ ] **Open Notifications**
  - [ ] Click bell icon in header
  - [ ] Verify notification dialog opens
  - [ ] Check unread count badge

- [ ] **View Notifications**
  - [ ] View all notifications
  - [ ] Check notification types (alert/success/info)
  - [ ] Verify timestamps
  - [ ] Identify unread notifications

- [ ] **Mark as Read**
  - [ ] Click "Mark all as read" button
  - [ ] Verify unread indicators disappear

## Settings

- [ ] **Open Settings**
  - [ ] Click settings from header dropdown
  - [ ] Click settings from sidebar
  - [ ] Verify settings dialog opens

- [ ] **Account Information**
  - [ ] View user name and email
  - [ ] Verify displayed when signed in

- [ ] **Notification Settings**
  - [ ] Toggle notifications on/off
  - [ ] Toggle weather alerts
  - [ ] Toggle emergency alerts
  - [ ] Verify switches work

- [ ] **Appearance**
  - [ ] Check dark mode toggle (disabled)

- [ ] **Language**
  - [ ] Change language selection
  - [ ] Verify options: English, Filipino, Tagalog

- [ ] **Data & Privacy**
  - [ ] Toggle auto cloud backup
  - [ ] Click "Privacy Policy" button

- [ ] **Save Settings**
  - [ ] Click "Save Changes"
  - [ ] Verify toast notification
  - [ ] Verify settings persist

## Navigation

- [ ] **Header**
  - [ ] Click menu icon to open sidebar
  - [ ] Click notification bell
  - [ ] Click user avatar dropdown
  - [ ] Click sign in button (when logged out)

- [ ] **Sidebar**
  - [ ] Navigate to Emergency Contacts
  - [ ] Navigate to Preparation Checklist
  - [ ] Navigate to Emergency Kit
  - [ ] Navigate to Weather Alerts
  - [ ] Navigate to Evacuation Routes
  - [ ] Navigate to Resources
  - [ ] View user info (when signed in)
  - [ ] Click settings
  - [ ] Click sign out

- [ ] **Back Button**
  - [ ] Navigate to any section
  - [ ] Click back arrow
  - [ ] Verify returns to dashboard

## Data Persistence & Sync

- [ ] **localStorage**
  - [ ] Make changes while signed out
  - [ ] Refresh page
  - [ ] Verify data persists

- [ ] **Cloud Sync (Supabase)**
  - [ ] Sign in
  - [ ] Make changes to contacts
  - [ ] Make changes to emergency kit
  - [ ] Make changes to checklist
  - [ ] Sign out and sign in again
  - [ ] Verify data synced

- [ ] **Session Persistence**
  - [ ] Sign in
  - [ ] Close and reopen browser
  - [ ] Verify still signed in

## Mobile Responsiveness

- [ ] **Touch Targets**
  - [ ] All buttons are min 44x44px
  - [ ] Buttons have active states
  - [ ] Buttons provide haptic feedback

- [ ] **Layout**
  - [ ] Test on mobile viewport (375px)
  - [ ] Test on tablet viewport (768px)
  - [ ] Test on desktop viewport (1024px+)
  - [ ] Verify text is readable
  - [ ] Check spacing is appropriate

- [ ] **Navigation**
  - [ ] Sidebar slides in on mobile
  - [ ] Quick actions grid adjusts
  - [ ] Cards stack properly

## Error Handling

- [ ] **Network Errors**
  - [ ] Disconnect internet
  - [ ] Try signing in (should fallback to demo)
  - [ ] Try syncing data (should use localStorage)
  - [ ] Reconnect and verify data syncs

- [ ] **Invalid Input**
  - [ ] Try empty form submissions
  - [ ] Try invalid email formats
  - [ ] Try short passwords
  - [ ] Verify validation messages

- [ ] **Missing Data**
  - [ ] Clear localStorage
  - [ ] Refresh page
  - [ ] Verify default data loads

## Accessibility

- [ ] **Keyboard Navigation**
  - [ ] Tab through all interactive elements
  - [ ] Press Enter to activate buttons
  - [ ] Press Escape to close dialogs

- [ ] **Screen Readers**
  - [ ] All buttons have aria-labels
  - [ ] All dialogs have descriptions
  - [ ] All images have alt text

- [ ] **Color Contrast**
  - [ ] Text is readable
  - [ ] Status colors are distinguishable
  - [ ] Focus indicators are visible

## Performance

- [ ] **Page Load**
  - [ ] Initial load is fast
  - [ ] No layout shifts
  - [ ] Images load properly

- [ ] **Interactions**
  - [ ] Button clicks are responsive
  - [ ] Dialogs open/close smoothly
  - [ ] Navigation is instant

- [ ] **Data Operations**
  - [ ] Saving data is fast
  - [ ] Loading data is fast
  - [ ] Syncing doesn't block UI

## Browser Compatibility

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

## Key Test Scenarios

### Scenario 1: New User Setup
1. Open app
2. Sign up with new account
3. Add emergency contacts
4. Set up emergency kit
5. Complete preparation checklist
6. Create communication plan
7. Enable weather alerts
8. View evacuation routes
9. Download emergency guides

### Scenario 2: Daily Usage
1. Sign in
2. Check weather alerts
3. Review preparedness status
4. Update kit item status
5. View recent activity
6. Check notifications
7. Sign out

### Scenario 3: Emergency Response
1. Receive weather alert notification
2. Open app
3. View alert details
4. Call primary emergency contact
5. Check evacuation routes
6. Get directions to nearest center
7. Download relevant emergency guide

### Scenario 4: Data Sync
1. Make changes on Device A while signed in
2. Sign in on Device B
3. Verify all data is synced
4. Make changes on Device B
5. Return to Device A
6. Verify changes are synced

## Sign-off

- [ ] All critical features tested and working
- [ ] All bugs fixed
- [ ] Data persistence verified
- [ ] Cloud sync verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility compliance verified
- [ ] Performance acceptable
- [ ] Ready for production

**Tested By:** _________________  
**Date:** _________________  
**Version:** 1.0.0  
**Status:** [ ] PASS [ ] FAIL
