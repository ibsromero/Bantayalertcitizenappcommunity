/**
 * GENTLE TOKEN VALIDATOR
 * 
 * This utility checks department tokens but doesn't aggressively clear them.
 * Only marks tokens as invalid for user notification, doesn't force reload.
 * 
 * ✅ Safe mode - won't break logout or cause infinite loops
 */

console.log("🔍 Token validator loading (gentle mode)...");

function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }
  
  // Must start with dept_
  if (!token.startsWith("dept_")) {
    return false;
  }
  
  // Check if it's a fresh token (just created in last 5 seconds)
  const freshToken = sessionStorage.getItem('FRESH_DEPT_TOKEN');
  const freshTime = sessionStorage.getItem('FRESH_DEPT_TOKEN_TIME');
  
  if (freshToken === token && freshTime) {
    const timeSince = Date.now() - parseInt(freshTime);
    if (timeSince < 5000) {
      console.log("✅ Token is fresh (just created), skipping validation");
      return true;
    }
  }
  
  // Must have exactly one period separator
  if (!token.includes(".")) {
    return false;
  }
  
  // Must have exactly 2 parts after dept_ prefix
  const withoutPrefix = token.substring(5);
  const parts = withoutPrefix.split(".");
  
  if (parts.length !== 2) {
    return false;
  }
  
  // Both parts must be non-empty
  if (!parts[0] || !parts[1]) {
    return false;
  }
  
  // Try to decode first part (should be valid base64 JSON)
  try {
    const payloadStr = atob(parts[0]);
    const payload = JSON.parse(payloadStr);
    
    if (!payload.email || !payload.role || !payload.timestamp) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

function checkTokenQuietly(): { hasInvalidToken: boolean; shouldNotify: boolean } {
  try {
    const userStr = localStorage.getItem("USER");
    if (!userStr) {
      return { hasInvalidToken: false, shouldNotify: false };
    }
    
    const user = JSON.parse(userStr);
    
    // Check if it's a department user with a token
    if (user && user.userType === "department") {
      if (!user.accessToken) {
        console.log("⚠️ Department user has no token - will require re-login");
        return { hasInvalidToken: true, shouldNotify: true };
      }
      
      const token = user.accessToken;
      
      if (!isValidTokenFormat(token)) {
        console.log("⚠️ Invalid token format detected - will require re-login");
        return { hasInvalidToken: true, shouldNotify: true };
      }
      
      console.log("✅ Token format is valid");
    }
    
    return { hasInvalidToken: false, shouldNotify: false };
  } catch (error) {
    console.error("Error checking token:", error);
    // Don't clear on errors - just notify
    return { hasInvalidToken: true, shouldNotify: false };
  }
}

// ========================================
// RUN CHECK - NO FORCED CLEARING
// ========================================

console.log("🔍 Running gentle token check...");

const checkResult = checkTokenQuietly();

if (checkResult.shouldNotify) {
  console.log("⚠️ Invalid token detected - will notify user but won't force reload");
  
  // Just dispatch event for app to handle gracefully
  setTimeout(() => {
    const event = new CustomEvent("invalidTokenDetected", {
      detail: { 
        message: "Your session format is outdated. Please sign in again.",
        shouldLogout: true
      }
    });
    window.dispatchEvent(event);
  }, 1000);
} else {
  console.log("✅ Token check complete - all good");
}

// Export a manual clear function that app can call explicitly
export function manualClearInvalidToken(): void {
  console.log("🧹 Manual token clear requested");
  
  try {
    const userStr = localStorage.getItem("USER");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.userType === "department") {
        // Only clear department user data
        localStorage.removeItem("USER");
        sessionStorage.clear();
        console.log("✅ Department session cleared");
        
        // Dispatch event
        const event = new CustomEvent("tokenCleared", {
          detail: { 
            message: "Session cleared. Please sign in again."
          }
        });
        window.dispatchEvent(event);
      }
    }
  } catch (error) {
    console.error("Error during manual clear:", error);
  }
}

export {};
