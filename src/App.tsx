import "./utils/clearOldTokens"; // ⚠️ MUST BE FIRST - Auto-clear old tokens BEFORE anything else loads
import "./utils/manualTokenClear"; // Debug utilities for token inspection
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { EmergencyContacts } from "./components/EmergencyContacts";
import { PreparationChecklist } from "./components/PreparationChecklist";
import { EmergencyKit } from "./components/EmergencyKit";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { EvacuationRoutes } from "./components/EvacuationRoutes";
import { EmergencyResources } from "./components/EmergencyResources";
import { TokenErrorBanner } from "./components/TokenErrorBanner";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { getFromStorage, saveToStorage } from "./utils/storageUtils";
import { supabase } from "./utils/supabaseClient";
import { initializeUserData, autoSync } from "./utils/dataSyncUtils";
import { initializeDepartmentData } from "./utils/initializeDepartmentData";
import type { UserType, DepartmentRole } from "./components/AuthModal";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function App() {
  const [showTokenError, setShowTokenError] = useState(false);
  
  // Initialize department sample data on app load
  useEffect(() => {
    initializeDepartmentData();
  }, []);
  
  // Check for invalid tokens on load
  useEffect(() => {
    const checkToken = () => {
      try {
        const userStr = localStorage.getItem("USER");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.userType === "department" && user?.accessToken) {
            const token = user.accessToken;
            // Check if token is invalid
            const isInvalid = token.startsWith("dept_") && (!token.includes(".") || token.substring(5).split(".").length !== 2);
            if (isInvalid) {
              console.error("❌ Invalid token detected on page load!");
              setShowTokenError(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking token:", error);
      }
    };
    
    checkToken();
  }, []);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Single unified event listener for token issues
  useEffect(() => {
    const handleTokenCleared = (event: any) => {
      console.log("🔔 Token cleared event received:", event.detail);
      
      // Hide banner
      setShowTokenError(false);
      
      // Force logout
      setUser(null);
      saveToStorage("USER", null);
      setCurrentSection("dashboard");
      
      // Show toast notification
      toast.error("Session Expired", {
        description: event.detail?.message || "Your session has expired. Please sign in again.",
        duration: 8000,
      });
      
      // Show auth modal
      setShowAuthModal(true);
    };
    
    const handleInvalidToken = (event: any) => {
      console.log("⚠️ Invalid token detected:", event.detail);
      
      if (event.detail?.shouldLogout) {
        // Clear user session
        setUser(null);
        saveToStorage("USER", null);
        setCurrentSection("dashboard");
        
        toast.warning("Session Invalid", {
          description: event.detail?.message || "Please sign in again.",
          duration: 6000,
        });
        
        setShowAuthModal(true);
      }
    };
    
    window.addEventListener("tokenCleared", handleTokenCleared);
    window.addEventListener("invalidTokenDetected", handleInvalidToken);
    
    return () => {
      window.removeEventListener("tokenCleared", handleTokenCleared);
      window.removeEventListener("invalidTokenDetected", handleInvalidToken);
    };
  }, []);
  
  const handleClearTokens = () => {
    console.log("🧹 Manual token clear requested");
    localStorage.clear();
    sessionStorage.clear();
    setShowTokenError(false);
    setUser(null);
    saveToStorage("USER", null);
    toast.success("Tokens Cleared", {
      description: "You can now sign in again with fresh credentials.",
      duration: 5000,
    });
    // Reload to ensure clean state
    setTimeout(() => window.location.reload(), 1000);
  };
  
  const [currentSection, setCurrentSection] = useState("dashboard");
  const [user, setUser] = useState<{ 
    name: string; 
    email: string; 
    accessToken?: string;
    userType?: UserType;
    departmentRole?: DepartmentRole;
  } | null>(() => {
    // Try to restore user session from localStorage
    const savedUser = getFromStorage<{ 
      name: string; 
      email: string; 
      accessToken?: string;
      userType?: UserType;
      departmentRole?: DepartmentRole;
    }>("USER");
    
    console.log("🔄 Initializing app with saved user:", savedUser ? {
      email: savedUser.email,
      userType: savedUser.userType,
      hasToken: !!savedUser.accessToken
    } : "No saved user");
    
    return savedUser;
  });
  const [isInitializing, setIsInitializing] = useState(false);

  // Log department session info for debugging
  useEffect(() => {
    if (user && user.userType === "department" && user.accessToken) {
      console.log("📊 Department session active:", {
        name: user.name,
        email: user.email,
        role: user.departmentRole,
        tokenPrefix: user.accessToken.substring(0, 20) + '...',
        hasProperFormat: user.accessToken.includes('.'),
        tokenStructure: user.accessToken.substring(5).split('.').length + ' parts'
      });
    }
  }, [user]);

  // Initialize Supabase session and data sync on app load
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          const userData = {
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            accessToken: session.access_token
          };
          
          setUser(userData);
          saveToStorage("USER", userData);
          
          // Initialize/sync data
          setIsInitializing(true);
          await initializeUserData(session.user.id);
          if (isMounted) {
            setIsInitializing(false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && isMounted) {
        const userData = {
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          accessToken: session.access_token
        };
        
        setUser(userData);
        saveToStorage("USER", userData);
        
        // Initialize/sync data on sign in
        setIsInitializing(true);
        await initializeUserData(session.user.id);
        if (isMounted) {
          setIsInitializing(false);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        setUser(null);
        saveToStorage("USER", null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  const handleBack = () => {
    setCurrentSection("dashboard");
  };

  const handleLogin = async (
    email: string, 
    name: string, 
    accessToken?: string, 
    userType?: UserType,
    departmentRole?: DepartmentRole
  ) => {
    const userData = { email, name, accessToken, userType, departmentRole };
    console.log("App.tsx: handleLogin called with:", { 
      email, 
      name, 
      userType, 
      departmentRole,
      tokenPrefix: accessToken?.substring(0, 15) + '...' 
    });
    
    // Mark this token as fresh (just logged in) to prevent immediate clearing
    if (accessToken && userType === "department") {
      sessionStorage.setItem('FRESH_DEPT_TOKEN', accessToken);
      sessionStorage.setItem('FRESH_DEPT_TOKEN_TIME', Date.now().toString());
      console.log("✅ Marked department token as fresh");
    }
    
    setUser(userData);
    saveToStorage("USER", userData);
    
    // Initialize data for the logged-in user (only if we have a real access token and is citizen)
    if (accessToken && userType === "citizen") {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user) {
          setIsInitializing(true);
          await initializeUserData(user.id);
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        setIsInitializing(false);
      }
    }
    
    // Reset to dashboard when logging in
    setCurrentSection("dashboard");
  };

  const handleLogout = async () => {
    console.log("🚪 Logout initiated");
    
    try {
      // Clear session markers FIRST to prevent token validation issues
      sessionStorage.removeItem('FRESH_DEPT_TOKEN');
      sessionStorage.removeItem('FRESH_DEPT_TOKEN_TIME');
      
      // Clear user state
      setUser(null);
      saveToStorage("USER", null);
      setCurrentSection("dashboard");
      
      // Sign out from Supabase (for citizen users)
      await supabase.auth.signOut();
      
      console.log("✅ Logout complete");
      
      toast.success("Signed Out", {
        description: "You have been successfully signed out.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, ensure user is logged out locally
      setUser(null);
      saveToStorage("USER", null);
      setCurrentSection("dashboard");
    }
  };

  const renderCurrentSection = () => {
    // Department users see department dashboard
    if (user?.userType === "department") {
      try {
        // Safety check - ensure user has required properties
        if (!user.accessToken) {
          console.error("Department user missing access token!");
          return (
            <div className="p-6">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong className="text-red-900">Authentication Error</strong>
                  <p className="text-red-700 mt-1">
                    Department session is invalid. Please sign out and sign in again.
                  </p>
                  <Button
                    onClick={handleLogout}
                    className="mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          );
        }
        
        return <DepartmentDashboard user={user} />;
      } catch (error) {
        console.error("Error rendering DepartmentDashboard:", error);
        return (
          <div className="p-6">
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong className="text-red-900">Dashboard Error</strong>
                <p className="text-red-700 mt-1">
                  Failed to load department dashboard. Please try refreshing the page.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-3"
                  size="sm"
                >
                  Refresh Page
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        );
      }
    }

    // Citizen users see regular sections
    switch (currentSection) {
      case "emergency":
        return <EmergencyContacts user={user} />;
      case "checklist":
        return <PreparationChecklist user={user} />;
      case "kit":
        return <EmergencyKit user={user} />;
      case "alerts":
        return <WeatherAlerts user={user} />;
      case "evacuation":
        return <EvacuationRoutes user={user} />;
      case "resources":
        return <EmergencyResources user={user} />;
      default:
        return <Dashboard onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show token error banner if invalid token detected */}
      {showTokenError && <TokenErrorBanner onClearTokens={handleClearTokens} />}
      
      <Header 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
      

      
      {/* Only show navigation for citizen users */}
      {user?.userType !== "department" && (
        <Navigation currentSection={currentSection} onBack={handleBack} />
      )}
      <main className="pb-safe" style={showTokenError ? { marginTop: '120px' } : {}}>
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('App ErrorBoundary caught error:', error, errorInfo);
            toast.error('Application Error', {
              description: 'An unexpected error occurred. The page will reload.',
              duration: 5000,
            });
          }}
        >
          {renderCurrentSection()}
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}