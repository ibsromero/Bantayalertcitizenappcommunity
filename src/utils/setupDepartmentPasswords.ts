/**
 * Department Password Setup Utility
 * 
 * This is a simple authentication setup for department accounts.
 * For production, you should use proper password hashing with bcrypt.
 * 
 * TEMPORARY SOLUTION:
 * We're using simple password matching here. Replace with bcrypt hashing before production!
 */

import { supabase } from "./supabaseClient";

// ============================================
// TEMPORARY PASSWORD STORE
// Replace this with bcrypt hashed passwords in production!
// ============================================

export const DEPARTMENT_PASSWORDS: Record<string, string> = {
  "lgu@bantayalert.ph": "LGU2025!Manila",
  "responder@bantayalert.ph": "RESP2025!911",
  "healthcare@bantayalert.ph": "HEALTH2025!Care",
  "ndrrmc@bantayalert.ph": "NDRRMC2025!PH",
};

// ============================================
// SIMPLE AUTHENTICATION (TEMPORARY)
// ============================================

/**
 * Verify department login
 * This is a SIMPLIFIED version for quick setup
 * In production, use bcrypt to hash/verify passwords
 */
export async function verifyDepartmentLogin(
  email: string,
  password: string
): Promise<{ user: any | null; token: string | null; error: string | null }> {
  try {
    // Check if password matches
    if (DEPARTMENT_PASSWORDS[email] !== password) {
      return { user: null, token: null, error: "Invalid email or password" };
    }

    // Get department user from database
    const { data: departmentUser, error } = await supabase
      .from("department_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !departmentUser) {
      return { user: null, token: null, error: "Department account not found" };
    }

    // Create a simple token (in production, use JWT)
    const token = `dept_${btoa(
      JSON.stringify({
        id: departmentUser.id,
        email: departmentUser.email,
        type: departmentUser.department_type,
        timestamp: Date.now(),
      })
    )}`;

    console.log("✅ Department login successful:", departmentUser.department_name);

    return {
      user: departmentUser,
      token,
      error: null,
    };
  } catch (error: any) {
    console.error("❌ Department login error:", error);
    return { user: null, token: null, error: error.message };
  }
}

/**
 * Check if department token is valid
 */
export function verifyDepartmentToken(token: string): { valid: boolean; data: any | null } {
  try {
    if (!token || !token.startsWith("dept_")) {
      return { valid: false, data: null };
    }

    const encodedData = token.substring(5); // Remove "dept_" prefix
    const decoded = JSON.parse(atob(encodedData));

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - decoded.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (tokenAge > maxAge) {
      return { valid: false, data: null };
    }

    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, data: null };
  }
}

// ============================================
// PRODUCTION PASSWORD HASHING SETUP
// Uncomment and use this when ready for production
// ============================================

/*
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Function to update all department passwords with hashed versions
export async function setupProductionPasswords() {
  const departments = [
    { email: "lgu@bantayalert.ph", password: "LGU2025!Manila" },
    { email: "responder@bantayalert.ph", password: "RESP2025!911" },
    { email: "healthcare@bantayalert.ph", password: "HEALTH2025!Care" },
    { email: "ndrrmc@bantayalert.ph", password: "NDRRMC2025!PH" },
  ];

  for (const dept of departments) {
    const hashedPassword = await hashPassword(dept.password);
    
    await supabase
      .from("department_users")
      .update({ password_hash: hashedPassword })
      .eq("email", dept.email);
    
    console.log(`✅ Updated password for ${dept.email}`);
  }
}

// Production login verification
export async function verifyDepartmentLoginProduction(
  email: string,
  password: string
): Promise<{ user: any | null; token: string | null; error: string | null }> {
  try {
    const { data: departmentUser, error } = await supabase
      .from("department_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (error || !departmentUser) {
      return { user: null, token: null, error: "Invalid credentials" };
    }

    // Verify password hash
    const isValid = await verifyPasswordHash(password, departmentUser.password_hash);
    
    if (!isValid) {
      return { user: null, token: null, error: "Invalid credentials" };
    }

    // Create JWT token (install jsonwebtoken package)
    const token = jwt.sign(
      {
        id: departmentUser.id,
        email: departmentUser.email,
        type: departmentUser.department_type,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      user: departmentUser,
      token: `dept_${token}`,
      error: null,
    };
  } catch (error: any) {
    return { user: null, token: null, error: error.message };
  }
}
*/

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current department user from token
 */
export function getCurrentDepartmentUser(): any | null {
  try {
    const token = localStorage.getItem("department_token");
    if (!token) return null;

    const { valid, data } = verifyDepartmentToken(token);
    if (!valid) return null;

    const userJson = localStorage.getItem("department_user");
    if (!userJson) return null;

    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is logged in as department
 */
export function isDepartmentLoggedIn(): boolean {
  const token = localStorage.getItem("department_token");
  if (!token) return false;

  const { valid } = verifyDepartmentToken(token);
  return valid;
}

/**
 * Logout department user
 */
export function logoutDepartment() {
  localStorage.removeItem("department_token");
  localStorage.removeItem("department_user");
  console.log("✅ Department logged out");
}

// ============================================
// INSTRUCTIONS
// ============================================

export const PASSWORD_SETUP_INSTRUCTIONS = `
DEPARTMENT ACCOUNT CREDENTIALS
===============================

⚠️  TESTING/PROTOTYPE MODE ONLY - NOT SECURE FOR PRODUCTION

There are 4 department accounts configured:

1. LGU Administrator
   Email: lgu@bantayalert.ph
   Password: LGU2025!Manila
   Department: Local Government Unit - Manila

2. Emergency Responder
   Email: responder@bantayalert.ph
   Password: RESP2025!911
   Department: Emergency Response Team

3. Healthcare Provider
   Email: healthcare@bantayalert.ph
   Password: HEALTH2025!Care
   Department: Healthcare Services

4. Disaster Management
   Email: ndrrmc@bantayalert.ph
   Password: NDRRMC2025!PH
   Department: NDRRMC - National Disaster Risk Reduction


FOR PRODUCTION:
1. Install bcrypt: npm install bcrypt
2. Uncomment the production functions in setupDepartmentPasswords.ts
3. Run setupProductionPasswords() to hash all passwords
4. Update verifyDepartmentLogin to use verifyDepartmentLoginProduction
5. Never store plain text passwords


SECURITY NOTES:
- Current implementation is for TESTING ONLY
- Passwords are stored in code (NOT SECURE)
- Use bcrypt hashing for production
- Use proper JWT tokens
- Add rate limiting
- Add 2FA for sensitive departments
- Monitor login attempts
`;

console.log(PASSWORD_SETUP_INSTRUCTIONS);
