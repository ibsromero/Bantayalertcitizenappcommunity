# SOS System Quick Reference

## 🚨 Citizen Side

### Sending an SOS Alert

1. **Location**: Dashboard → Red "Emergency Alert" card
2. **Requirements**: Must be signed in
3. **Button**: Click "SEND SOS ALERT"
4. **Fill in**: Emergency description
5. **Submit**: Click "Send SOS Alert"

### What Gets Sent
- ✅ Your name and email
- ✅ Your phone number (if in profile)
- ✅ Your GPS location (if enabled)
- ✅ Emergency description
- ✅ Timestamp

### After Sending
- ✅ Success confirmation toast
- ✅ Activity log entry
- ✅ Department receives alert immediately

---

## 👮 Department Side

### Viewing SOS Alerts

1. **Location**: Department Dashboard → "SOS Alert Tracker" tab
2. **Auto-refresh**: Every 30 seconds
3. **Sorting**: By priority (Critical → High → Medium)
4. **Statistics**: Active, Responding, Critical counts

### Alert Information Displayed
- 👤 Citizen name and email
- 📱 Phone number
- 📍 GPS location with coordinates
- 📝 Emergency description
- ⏰ Time since alert
- 🏷️ Priority badge (Critical/High/Medium)
- 🔵 Status badge (Active/Responding/Resolved)

### Response Actions

| Button | Action | Effect |
|--------|--------|--------|
| **📞 Call Citizen** | Opens phone dialer | Direct contact with citizen |
| **🗺️ Navigate** | Opens Google Maps | GPS navigation to location |
| **🚨 Dispatch Team** | Changes status | Marks as "Responding", logs responder |
| **✅ Mark Resolved** | Updates status | Moves to resolved, adds resolution note |
| **❌ Cancel** | Closes alert | Marks as cancelled/false alarm |

---

## 🎯 Priority Levels

- 🔴 **CRITICAL**: Life-threatening, immediate response
- 🟠 **HIGH**: Urgent assistance needed
- 🟡 **MEDIUM**: Important but not urgent

---

## 📊 Alert Status Flow

```
📩 ACTIVE
    ↓ (Dispatch Team)
🔵 RESPONDING
    ↓ (Mark Resolved)
✅ RESOLVED
```

---

## 🔐 Security

**Citizen Access**:
- ✅ Can create SOS alerts
- ❌ Cannot view other alerts
- ❌ Cannot access department dashboard

**Department Access**:
- ✅ Can view all SOS alerts
- ✅ Can update alert status
- ✅ Can respond to alerts
- ✅ Role-specific features (LGU, Responder, Healthcare, Disaster Mgmt)

---

## ⚡ Quick Actions

### For Citizens in Emergency:
```
1. Open BantayAlert app
2. Dashboard → "SEND SOS ALERT" button
3. Describe emergency
4. Send
5. Wait for responder contact
```

### For Departments Responding:
```
1. Department Dashboard → SOS Alert Tracker
2. Review critical alerts (red badges)
3. Call citizen to assess
4. Dispatch team
5. Navigate to location
6. Mark resolved when complete
```

---

## 📞 Emergency Hotlines

- **National Emergency**: 911
- **NDRRMC**: 911-1406
- **Red Cross**: 143
- **Fire**: 160-1668
- **Police**: 117

---

## 💡 Best Practices

### Citizens:
- ✅ Keep profile info updated
- ✅ Enable location services
- ✅ Be specific in description
- ✅ Include: injuries, hazards, number of people
- ✅ Stay calm and wait for response

### Departments:
- ✅ Prioritize critical alerts
- ✅ Call citizen first
- ✅ Update status promptly
- ✅ Coordinate with other departments
- ✅ Document resolution

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't send SOS | Check if signed in |
| Location not detected | Enable browser permissions |
| Alert not appearing | Wait 30s for auto-refresh |
| Can't call citizen | Check if phone number in profile |
| "Failed to send" error | Check connection, call 911 |

---

## 📱 API Endpoints

```
POST /sos/create              # Create alert (Citizen)
GET  /sos/alerts?status=...   # Get alerts (Department)
PUT  /sos/alert/:id           # Update alert (Department)
```

---

## 📈 Metrics to Monitor

- ⏱️ Average response time
- 📊 Alerts by priority
- ✅ Resolution rate
- 📍 Alerts by location
- 👥 Active responders

---

**Last Updated**: October 23, 2025
**Version**: 1.0
**Support**: BantayAlert Team
