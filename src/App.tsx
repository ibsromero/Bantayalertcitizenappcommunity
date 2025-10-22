import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { DepartmentDashboard } from "./components/DepartmentDashboard";
import { EmergencyContacts } from "./components/EmergencyContacts";
import { PreparationChecklist } from "./components/PreparationChecklist";
import { EmergencyKit } from "./components/EmergencyKit";
import { WeatherAlerts } from "./components/WeatherAlerts";
import { EvacuationRoutes } from "./components/EvacuationRoutes";
import { EmergencyResources } from "./components/EmergencyResources";
import { Toaster } from "./components/ui/sonner";
import { getFromStorage, saveToStorage } from "./utils/storageUtils";
import { supabase } from "./utils/supabaseClient";
import { initializeUserData, autoSync } from "./utils/dataSyncUtils";
import { initializeDepartmentData } from "./utils/initializeDepartmentData";
import type { UserType, DepartmentRole } from "./components/AuthModal";

export default function App() {
  // Initialize department sample data on app load
  useEffect(() => {
    initializeDepartmentData();
  }, []);
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
    return savedUser;
  });
  const [isInitializing, setIsInitializing] = useState(false);

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
    await supabase.auth.signOut();
    setUser(null);
    setCurrentSection("dashboard");
    saveToStorage("USER", null);
  };

  const renderCurrentSection = () => {
    // Department users see department dashboard
    if (user?.userType === "department") {
      return <DepartmentDashboard user={user} />;
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
      <main className="pb-safe">
        {renderCurrentSection()}
      </main>
      <Toaster />
    </div>
  );
}