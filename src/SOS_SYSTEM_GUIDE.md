# SOS Emergency Alert System - User Guide

## Overview
The BantayAlert SOS system connects citizens in distress directly to emergency departments through real-time alerts.

## How It Works

### For Citizens:

1. **Send SOS Alert**
   - Click the prominent red "SEND SOS ALERT" button on your dashboard
   - Your location will be automatically detected (if permissions are granted)
   - Describe your emergency situation in detail
   - Click "Send SOS Alert" to notify emergency responders

2. **What Information Is Sent**
   - Your name and email
   - Your phone number (from your profile)
   - Your GPS location (if available)
   - Your emergency description
   - Timestamp of the alert

3. **Important Notes**
   - You must be signed in to send SOS alerts
   - Add your phone number in your Profile settings for better emergency response
   - For life-threatening emergencies, always call 911 first
   - The SOS system is meant to supplement, not replace, emergency hotlines

### For Departments:

1. **Receive Alerts**
   - All SOS alerts appear in real-time on the Department Dashboard
   - Alerts are sorted by priority (Critical → High → Medium)
   - View citizen details, location, and emergency description

2. **Respond to Alerts**
   - **Call Citizen**: Direct phone call to the person in distress
   - **Navigate**: Open GPS navigation to the alert location
   - **Dispatch Team**: Mark alert as "Responding" and send emergency team
   - **Mark Resolved**: Update status when assistance is provided
   - **Cancel**: If it's a false alarm

3. **Alert Priority Levels**
   - 🔴 **Critical**: Immediate life-threatening situations
   - 🟠 **High**: Urgent assistance needed
   - 🟡 **Medium**: Non-urgent but requires attention

4. **Alert Statuses**
   - 🔴 **Active**: New alert, needs response
   - 🔵 **Responding**: Team dispatched, en route
   - 🟢 **Resolved**: Assistance provided successfully
   - ⚫ **Cancelled**: False alarm or duplicate

## Technical Details

### API Endpoints

**Create SOS Alert** (Citizen)
```
POST /make-server-dd0f68d8/sos/create
Body: {
  userEmail: string,
  userName: string,
  location: { lat, lng, address },
  details: string,
  contactNumber: string
}
```

**Get SOS Alerts** (Department Only)
```
GET /make-server-dd0f68d8/sos/alerts?status=active|all
Headers: Authorization: Bearer <dept_token>
```

**Update SOS Alert** (Department Only)
```
PUT /make-server-dd0f68d8/sos/alert/:id
Headers: Authorization: Bearer <dept_token>
Body: {
  status: "active" | "responding" | "resolved" | "cancelled",
  resolution?: string,
  priority?: "critical" | "high" | "medium"
}
```

### Data Storage
- All SOS alerts are stored in Supabase KV store
- Active alerts: `sos_alerts_active`
- All alerts history: `sos_alerts_all`
- Auto-refresh every 30 seconds on department side

## Best Practices

### For Citizens:
1. Keep your profile information up to date
2. Enable location services for faster response
3. Be clear and specific in your emergency description
4. Include important details: number of people, injuries, immediate dangers

### For Departments:
1. Prioritize critical alerts first
2. Always call the citizen to assess the situation
3. Update alert status promptly
4. Coordinate with other departments when needed
5. Document resolution notes for record-keeping

## Emergency Contact Numbers

**National Emergency Hotline**: 911
**NDRRMC**: 911-1406
**Red Cross**: 143
**Fire**: 160-1668
**Police**: 117

## Support

For technical issues or feature requests, contact the BantayAlert development team.

---

Last Updated: October 23, 2025
