# SOS System Testing Guide

## Prerequisites
- Supabase project connected
- Both citizen and department accounts set up

## Test Scenario 1: Citizen Sends SOS Alert

### Steps:
1. **Sign in as a Citizen**
   - Use regular email/password sign in
   - Navigate to Dashboard

2. **Add Phone Number** (Recommended)
   - Click on your profile icon → Profile
   - Add your phone number
   - Save changes

3. **Send SOS Alert**
   - On Dashboard, find the red "Emergency Alert" card
   - Click "SEND SOS ALERT" button
   - Dialog opens with:
     - Your information (name, email, phone)
     - Location detection (if enabled)
   - Enter emergency description, e.g.:
     ```
     Trapped in flooded building, 3rd floor, water rising rapidly. 
     Need immediate evacuation assistance.
     ```
   - Click "Send SOS Alert"

4. **Verify Success**
   - Should see green success toast: "SOS Alert Sent!"
   - Activity log shows "SOS alert sent: [your message]"
   - Dialog closes automatically

### Expected Results:
✅ Alert created in database
✅ Activity logged
✅ Location captured (if available)
✅ User information included
✅ Timestamp recorded

---

## Test Scenario 2: Department Receives and Responds to SOS

### Steps:
1. **Sign in as Department**
   - Click "Sign In"
   - Select "Department" user type
   - Choose department role (e.g., Emergency Responder)
   - Use credentials:
     - **LGU**: lgu@bantayalert.ph / LGU2025!Manila
     - **Emergency Responder**: responder@bantayalert.ph / RESP2025!911
     - **Healthcare**: healthcare@bantayalert.ph / HEALTH2025!Care
     - **Disaster Management**: ndrrmc@bantayalert.ph / NDRRMC2025!PH

2. **View SOS Alerts**
   - Department Dashboard loads
   - Navigate to "SOS Alert Tracker" tab
   - Should see the alert sent by citizen
   - Alert shows:
     - Red/orange/yellow badge for priority
     - Citizen name and contact
     - Emergency description
     - Location with coordinates
     - Time since alert (e.g., "5 min ago")

3. **Respond to Alert**
   - Click "Call Citizen" button
     - Should open phone dialer with citizen's number
   - Click "Navigate" button
     - Should open Google Maps with location
   - Click "Dispatch Team" button
     - Alert status changes to "Responding"
     - Badge changes to blue
     - Shows "Responded by: [Your Name]"

4. **Mark as Resolved**
   - Once resolved, click "Mark Resolved"
   - Alert status changes to "Resolved"
   - Badge changes to green
   - Alert moves out of active list

### Expected Results:
✅ Alert visible in real-time
✅ All action buttons functional
✅ Status updates sync immediately
✅ Responder name recorded
✅ Statistics update (Active count decreases)

---

## Test Scenario 3: Multiple Alerts Priority

### Steps:
1. Send 3 SOS alerts as different citizens with varying urgency:
   - Alert 1: "Minor flooding, need sandbags" (Medium priority)
   - Alert 2: "Elderly trapped, medical emergency" (Critical priority)
   - Alert 3: "Power outage, need assistance" (Medium priority)

2. View as Department:
   - Alerts should be sorted by priority
   - Critical alerts at top with red badge
   - Summary stats show:
     - Total Active alerts
     - Critical count
     - Responding count

### Expected Results:
✅ Alerts sorted correctly (Critical → High → Medium)
✅ Color coding clear and distinct
✅ Summary statistics accurate
✅ Auto-refresh every 30 seconds

---

## Test Scenario 4: Location Features

### Steps:
1. **With Location Enabled**:
   - Allow browser location access
   - Send SOS alert
   - Verify coordinates captured

2. **Without Location**:
   - Deny or disable location
   - Send SOS alert
   - Should show "Location unavailable"
   - Alert still sent successfully

3. **Department Navigation**:
   - Click "Navigate" on alert with location
   - Google Maps opens with directions
   - Verify coordinates match

### Expected Results:
✅ Location captured when available
✅ Graceful fallback when unavailable
✅ Google Maps integration works
✅ Coordinates displayed correctly

---

## Test Scenario 5: Error Handling

### Test Cases:

1. **Unsigned User**:
   - Log out
   - Try to click "SEND SOS ALERT"
   - Should show toast: "Please sign in to send SOS alerts"

2. **Empty Message**:
   - Sign in
   - Open SOS dialog
   - Try to send without message
   - Should show error: "Please describe your emergency"

3. **Network Error**:
   - Disable network (or simulate)
   - Try to send SOS
   - Should show error with fallback to 911

4. **Department Access Only**:
   - Try to access SOS alerts API as citizen
   - Should get 401 Unauthorized

### Expected Results:
✅ All validation messages shown
✅ Graceful error handling
✅ Clear user feedback
✅ Security checks enforced

---

## Test Scenario 6: Auto-Refresh and Real-Time

### Steps:
1. Open Department Dashboard in one browser
2. Send SOS alert from another browser/device
3. Wait up to 30 seconds
4. Alert should appear automatically
5. Update status in Department Dashboard
6. Refresh citizen side - activity log updated

### Expected Results:
✅ Alerts appear within 30 seconds
✅ Status changes sync
✅ No page refresh needed
✅ Activity logs update

---

## Performance Benchmarks

- **Alert Creation**: < 2 seconds
- **Alert Retrieval**: < 1 second
- **Status Update**: < 1 second
- **Auto-refresh Interval**: 30 seconds
- **Alert Display Limit**: 50 active alerts

---

## Common Issues and Solutions

### Issue: "Failed to send SOS"
**Solution**: 
- Check internet connection
- Verify Supabase credentials
- Check browser console for errors
- Fallback: Call 911 directly

### Issue: Alerts not appearing in Department
**Solution**:
- Verify department login credentials
- Check authorization token
- Refresh the page
- Check Supabase KV store data

### Issue: Location not detected
**Solution**:
- Enable browser location permissions
- Try again in a few seconds
- SOS still works without location

### Issue: Can't call citizen
**Solution**:
- Ensure phone number is in profile
- Check device phone capabilities
- Use alternative contact method

---

## Data Verification

### Check Supabase KV Store:

**Active Alerts**:
```
Key: sos_alerts_active
Value: Array of active/responding alerts
```

**All Alerts History**:
```
Key: sos_alerts_all
Value: Array of all alerts including resolved
```

### Alert Structure:
```json
{
  "id": "sos_1729700000_abc123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "contactNumber": "+63 917 123 4567",
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "address": "Makati City"
  },
  "details": "Emergency description",
  "priority": "high",
  "status": "active",
  "created_at": "2025-10-23T10:00:00.000Z",
  "updated_at": "2025-10-23T10:00:00.000Z",
  "responded_by": null,
  "resolution": null
}
```

---

## Success Criteria

✅ Citizens can send SOS alerts when signed in
✅ Alerts include location, contact info, and description
✅ Departments receive alerts in real-time
✅ All action buttons (Call, Navigate, Dispatch) work
✅ Status updates sync between systems
✅ Activity logs track SOS alerts
✅ Error handling is robust
✅ Security restrictions enforced
✅ Performance meets benchmarks

---

## Next Steps After Testing

1. Monitor alert response times
2. Collect user feedback
3. Optimize location detection
4. Add push notifications
5. Integrate with SMS gateway
6. Add alert escalation rules
7. Create analytics dashboard
8. Set up alert archiving

---

Last Updated: October 23, 2025
