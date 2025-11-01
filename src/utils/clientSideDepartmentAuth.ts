/**
 * CLIENT-SIDE DEPARTMENT AUTHENTICATION
 * 
 * TEMPORARY FIX: This creates department tokens client-side with the correct format
 * until the Edge Function can be redeployed.
 * 
 * ⚠️ WARNING: This is NOT secure for production! 
 * Passwords are checked client-side and tokens are generated client-side.
 * This is ONLY for prototype/demo purposes.
 */

const DEPARTMENT_CREDENTIALS = {
  lgu: {
    email: "lgu@bantayalert.ph",
    password: "LGU2025!Manila",
    name: "LGU Administrator",
    role: "lgu" as const,
    department: "LGU"
  },
  emergency_responder: {
    email: "responder@bantayalert.ph",
    password: "RESP2025!911",
    name: "Emergency Responder",
    role: "emergency_responder" as const,
    department: "Emergency Response"
  },
  healthcare: {
    email: "healthcare@bantayalert.ph",
    password: "HEALTH2025!Care",
    name: "Healthcare Provider",
    role: "healthcare" as const,
    department: "Healthcare Services"
  },
  disaster_management: {
    email: "ndrrmc@bantayalert.ph",
    password: "NDRRMC2025!PH",
    name: "Disaster Management",
    role: "disaster_management" as const,
    department: "NDRRMC"
  }
};

function createDepartmentToken(email: string, role: string, name: string, department: string): string {
  const payload = {
    email,
    role,
    name,
    department,
    timestamp: Date.now()
  };
  
  // Base64 encode the payload with a simple signature
  const payloadStr = JSON.stringify(payload);
  const signature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
  const token = `dept_${btoa(payloadStr)}.${signature}`;
  
  console.log("🔐 Created department token:");
  console.log("  - Format: dept_{payload}.{signature}");
  console.log("  - Has period:", token.includes("."));
  console.log("  - Parts:", token.substring(5).split(".").length);
  console.log("  - Sample:", token.substring(0, 50) + "...");
  
  return token;
}

export async function clientSideDepartmentSignIn(email: string, password: string): Promise<{
  success: boolean;
  session?: {
    token: string;
    email: string;
    name: string;
    role: string;
    department: string;
  };
  error?: string;
}> {
  console.log("🔐 Client-side department sign-in for:", email);
  
  // Find matching department
  const deptEntry = Object.values(DEPARTMENT_CREDENTIALS).find(d => d.email === email);
  
  if (!deptEntry || deptEntry.password !== password) {
    console.error("❌ Invalid department credentials");
    return {
      success: false,
      error: "Invalid department credentials"
    };
  }
  
  // Create token
  const token = createDepartmentToken(
    deptEntry.email,
    deptEntry.role,
    deptEntry.name,
    deptEntry.department
  );
  
  console.log("✅ Department sign-in successful");
  console.log("Token validation:");
  console.log("  - Starts with dept_:", token.startsWith("dept_"));
  console.log("  - Contains period:", token.includes("."));
  console.log("  - Proper structure:", token.substring(5).split(".").length === 2);
  
  return {
    success: true,
    session: {
      token,
      email: deptEntry.email,
      name: deptEntry.name,
      role: deptEntry.role,
      department: deptEntry.department
    }
  };
}

export function validateDepartmentToken(token: string): boolean {
  if (!token || !token.startsWith("dept_")) {
    console.error("❌ Token validation failed: Missing dept_ prefix");
    return false;
  }
  
  const parts = token.substring(5).split(".");
  if (parts.length !== 2) {
    console.error("❌ Token validation failed: Invalid structure");
    console.error("Expected 2 parts, got:", parts.length);
    return false;
  }
  
  try {
    // Try to decode payload
    const payloadB64 = parts[0];
    const payloadStr = atob(payloadB64);
    const payload = JSON.parse(payloadStr);
    
    console.log("✅ Token validated:", {
      email: payload.email,
      role: payload.role,
      name: payload.name
    });
    
    return true;
  } catch (error) {
    console.error("❌ Token validation failed: Cannot decode payload");
    return false;
  }
}
