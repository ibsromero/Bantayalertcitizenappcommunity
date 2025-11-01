/**
 * MANUAL TOKEN CLEARER
 * 
 * Call this function to manually clear all stored tokens and force a fresh sign-in
 */

export function clearAllTokens(): void {
  console.log("🧹 Manually clearing all tokens and session data...");
  
  try {
    // Clear localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keysToRemove.push(key);
      }
    }
    
    console.log(`Removing ${keysToRemove.length} localStorage items:`, keysToRemove);
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any cookies (though we don't use them)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log("✅ All storage cleared successfully");
    console.log("ℹ️ You can now sign in fresh");
    
    return;
  } catch (error) {
    console.error("❌ Error clearing tokens:", error);
    throw error;
  }
}

export function inspectCurrentToken(): any {
  try {
    const userStr = localStorage.getItem("USER");
    if (!userStr) {
      console.log("ℹ️ No USER data in localStorage");
      return null;
    }
    
    const user = JSON.parse(userStr);
    
    if (!user.accessToken) {
      console.log("ℹ️ User has no accessToken");
      return { user, hasToken: false };
    }
    
    const token = user.accessToken;
    
    const analysis = {
      raw: token,
      prefix: token.substring(0, 5),
      hasPrefix: token.startsWith("dept_"),
      hasPeriod: token.includes("."),
      length: token.length,
      sample: token.substring(0, 60) + "...",
      structure: {
        parts: token.substring(5).split("."),
        partsCount: token.substring(5).split(".").length
      },
      isValidFormat: token.startsWith("dept_") && token.includes(".") && token.substring(5).split(".").length === 2
    };
    
    console.log("🔍 Current Token Analysis:", analysis);
    
    return {
      user,
      hasToken: true,
      analysis
    };
  } catch (error) {
    console.error("❌ Error inspecting token:", error);
    return { error: error.message };
  }
}

// Make functions available in browser console for debugging
if (typeof window !== "undefined") {
  (window as any).clearAllTokens = clearAllTokens;
  (window as any).inspectCurrentToken = inspectCurrentToken;
  
  console.log("🛠️ Token utilities loaded:");
  console.log("  - clearAllTokens() - Clear all stored data");
  console.log("  - inspectCurrentToken() - Inspect current token");
}

export {};
