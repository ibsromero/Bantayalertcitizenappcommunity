# BantayAlert Department Account Credentials

## 🔐 Login Information

**Access URL:** Sign in via the app → Select "Department" → Enter credentials

---

## 4 Department Accounts

### 1. LGU Administrator
- **Email:** `lgu@bantayalert.ph`
- **Password:** `LGU2025!Manila`
- **Department:** Local Government Unit - Manila
- **Type:** `lgu`
- **Coverage:** Manila City

**Responsibilities:**
- Monitor local disaster events
- Coordinate with other departments
- Manage evacuation centers
- Issue local warnings

---

### 2. Emergency Responder
- **Email:** `responder@bantayalert.ph`
- **Password:** `RESP2025!911`
- **Department:** Emergency Response Team
- **Type:** `emergency_responder`
- **Coverage:** Metro Manila

**Responsibilities:**
- Respond to SOS alerts
- Coordinate rescue operations
- Track active emergency incidents
- Manage first responder resources

---

### 3. Healthcare Provider
- **Email:** `healthcare@bantayalert.ph`
- **Password:** `HEALTH2025!Care`
- **Department:** Healthcare Services
- **Type:** `healthcare`
- **Coverage:** Metro Manila

**Responsibilities:**
- Update hospital capacity
- Manage emergency room status
- Coordinate medical response
- Track healthcare resources

---

### 4. Disaster Management
- **Email:** `ndrrmc@bantayalert.ph`
- **Password:** `NDRRMC2025!PH`
- **Department:** NDRRMC - National Disaster Risk Reduction and Management Council
- **Type:** `disaster_management`
- **Coverage:** NCR-wide

**Responsibilities:**
- Overall disaster coordination
- Issue weather warnings
- Manage disaster events
- Post-disaster assessment
- Data analytics and reporting

---

## Quick Test Access

Copy and paste these credentials for quick testing:

```
Email: lgu@bantayalert.ph
Password: LGU2025!Manila
```

```
Email: responder@bantayalert.ph
Password: RESP2025!911
```

```
Email: healthcare@bantayalert.ph
Password: HEALTH2025!Care
```

```
Email: ndrrmc@bantayalert.ph
Password: NDRRMC2025!PH
```

---

## ⚠️ Security Warning

**THIS IS FOR TESTING/PROTOTYPE ONLY**

- Passwords are stored in plain text in the code
- Authentication is done client-side (NOT SECURE)
- No password hashing is implemented
- No rate limiting
- No 2FA

**Before Production:**
1. Implement bcrypt password hashing
2. Use proper JWT tokens
3. Add server-side authentication
4. Implement rate limiting
5. Add 2FA for sensitive accounts
6. Use environment variables for secrets
7. Implement audit logging

See `/utils/setupDepartmentPasswords.ts` for production upgrade instructions.

---

## Department Dashboard Features

Once logged in, department users can access:

### ✅ Disaster Monitoring
- Real-time disaster event tracking
- Severity and status management
- Affected areas visualization
- Family impact statistics

### ✅ SOS Alert Tracking
- Active SOS alerts from citizens
- Priority-based sorting
- Location mapping
- Alert status management (Active → Responding → Resolved)

### ✅ Healthcare Integration
- Hospital capacity tracking
- Emergency room status
- ICU availability
- Citizen hospital locator

### ✅ Data Analytics
- Response time metrics
- Alert volume trends
- Resource utilization
- Post-disaster assessment tools

---

## Notes

- All 4 accounts are pre-configured in the database
- Credentials match across all system files:
  - `/utils/setupDepartmentPasswords.ts`
  - `/utils/clientSideDepartmentAuth.ts`
  - `/PHASE_2_DATABASE_SETUP.sql`
- No conflicts between department types
- Each account has specific permissions and access levels

---

## Troubleshooting

**Can't log in?**
1. Make sure you selected "Department" option (not "Citizen")
2. Copy-paste the email exactly (no extra spaces)
3. Passwords are case-sensitive
4. Check browser console for errors

**Database errors?**
1. Ensure you've run `/PHASE_2_DATABASE_SETUP.sql` in Supabase
2. Check that all 4 department accounts are in the `department_users` table
3. Verify RLS policies are enabled

**Wrong dashboard?**
- Citizens see the emergency preparedness dashboard
- Departments see the monitoring/management dashboard
- Make sure you're using the correct account type

---

Last Updated: November 1, 2025
