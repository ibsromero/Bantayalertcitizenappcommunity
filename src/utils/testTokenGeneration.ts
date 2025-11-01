/**
 * TEST TOKEN GENERATION
 * This file tests if client and server token generation match
 */

// Client-side token generation (matches clientSideDepartmentAuth.ts)
function createClientToken(email: string, role: string, name: string, department: string): string {
  const payload = {
    email,
    role,
    name,
    department,
    timestamp: Date.now()
  };
  
  const payloadStr = JSON.stringify(payload);
  const signature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
  const token = `dept_${btoa(payloadStr)}.${signature}`;
  
  return token;
}

// Server-side token verification (matches server/index.tsx)
function verifyServerToken(token: string): any {
  try {
    if (!token || !token.startsWith("dept_")) {
      console.log("❌ Token verification failed: Invalid format or missing dept_ prefix");
      return null;
    }
    
    const parts = token.substring(5).split('.');
    if (parts.length !== 2) {
      console.log("❌ Token verification failed: Invalid token structure");
      console.log("Parts:", parts.length);
      return null;
    }
    
    const [payloadB64, signature] = parts;
    
    try {
      const payloadStr = atob(payloadB64);
      const expectedSignature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
      
      if (signature !== expectedSignature) {
        console.log("❌ Invalid token signature");
        console.log("Expected:", expectedSignature.substring(0, 20) + "...");
        console.log("Got:", signature.substring(0, 20) + "...");
        return null;
      }
      
      const payload = JSON.parse(payloadStr);
      console.log("✅ Token verified successfully");
      return payload;
    } catch (decodeError: any) {
      console.log("❌ Token decode error:", decodeError.message);
      return null;
    }
  } catch (error: any) {
    console.log("❌ Token verification error:", error.message);
    return null;
  }
}

// Test
export function testTokenGeneration() {
  console.log("=== TOKEN GENERATION TEST ===");
  
  const testEmail = "lgu@bantayalert.ph";
  const testRole = "lgu";
  const testName = "LGU Administrator";
  const testDepartment = "LGU";
  
  console.log("\n1. Generating client token...");
  const clientToken = createClientToken(testEmail, testRole, testName, testDepartment);
  console.log("Token:", clientToken.substring(0, 50) + "...");
  console.log("Length:", clientToken.length);
  console.log("Has period:", clientToken.includes("."));
  console.log("Parts:", clientToken.substring(5).split(".").length);
  
  console.log("\n2. Verifying token on server...");
  const verified = verifyServerToken(clientToken);
  
  if (verified) {
    console.log("\n✅ SUCCESS! Token is valid");
    console.log("Payload:", verified);
  } else {
    console.log("\n❌ FAILED! Token is invalid");
  }
  
  return verified !== null;
}

// Run test immediately
if (typeof window !== 'undefined') {
  console.log("\n🧪 Running token generation test...\n");
  const result = testTokenGeneration();
  console.log("\n" + (result ? "✅ TEST PASSED" : "❌ TEST FAILED"));
}
