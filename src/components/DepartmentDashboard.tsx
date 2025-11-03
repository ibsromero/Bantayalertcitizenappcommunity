import { useState, useEffect } from "react";
import { AlertTriangle, Users, Heart, Activity, MapPin, TrendingUp, Clock, Shield, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import { ErrorBoundary } from "./ErrorBoundary";
import { DisasterMonitoring } from "./department/DisasterMonitoring";
import { SOSAlertTracker } from "./department/SOSAlertTracker";
import { DataAnalytics } from "./department/DataAnalytics";
import { HealthcareIntegration } from "./department/HealthcareIntegration";
import { EmergencyMap } from "./department/EmergencyMap";
import { DatabaseSetupChecker } from "./DatabaseSetupChecker";
import { MockDataBanner } from "./MockDataBanner";
import type { DepartmentRole } from "./AuthModal";
import { getSOSAlerts, getActiveDisasters, getHospitals, subscribeToSOSAlerts, subscribeToDisasters, subscribeToHospitals, unsubscribeChannel } from "../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface DepartmentDashboardProps {
  user: { 
    name: string; 
    email: string; 
    accessToken?: string;
    userType?: string;
    departmentRole?: DepartmentRole;
  };
  initialSection?: string;
}

export function DepartmentDashboard({ user, initialSection }: DepartmentDashboardProps) {
  console.log("🔵 DepartmentDashboard rendering with user:", {
    name: user.name,
    email: user.email,
    hasToken: !!user.accessToken,
    tokenLength: user.accessToken?.length,
    tokenPrefix: user.accessToken?.substring(0, 20),
    userType: user.userType,
    departmentRole: user.departmentRole
  });

  // Map section names to tab values
  const getTabFromSection = (section?: string) => {
    if (!section || !section.startsWith('dashboard-')) return "overview";
    const tabName = section.replace('dashboard-', '');
    // Map to valid tab names
    if (tabName === 'overview') return 'overview';
    if (tabName === 'sos') return 'sos';
    if (tabName === 'monitoring') return 'monitoring';
    if (tabName === 'healthcare') return 'healthcare';
    if (tabName === 'analytics') return 'overview'; // Analytics shown in overview
    if (tabName === 'evacuee') return 'overview'; // Evacuee management shown in overview
    if (tabName === 'map') return 'map';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromSection(initialSection));
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    sosAlerts: 0,
    evacuees: 0,
    hospitalsOnline: 0
  });
  const [sosChannel, setSosChannel] = useState<RealtimeChannel | null>(null);
  const [disasterChannel, setDisasterChannel] = useState<RealtimeChannel | null>(null);
  const [hospitalChannel, setHospitalChannel] = useState<RealtimeChannel | null>(null);

  // Update active tab when section changes
  useEffect(() => {
    const newTab = getTabFromSection(initialSection);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [initialSection]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log("🔵 DepartmentDashboard useEffect triggered - Setting up real-time subscriptions");
    loadStats();
    setupRealtimeSubscriptions();
    
    return () => {
      console.log("🔵 DepartmentDashboard cleaning up - Unsubscribing from real-time channels");
      if (sosChannel) unsubscribeChannel(sosChannel);
      if (disasterChannel) unsubscribeChannel(disasterChannel);
      if (hospitalChannel) unsubscribeChannel(hospitalChannel);
    };
  }, [user?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const setupRealtimeSubscriptions = () => {
    console.log("🔴 Setting up real-time subscriptions for dashboard");
    
    // Subscribe to SOS alerts
    const sos = subscribeToSOSAlerts((payload) => {
      console.log("🔴 Real-time SOS alert update received:", payload);
      loadStats(); // Refresh stats when data changes
    });
    setSosChannel(sos);
    
    // Subscribe to disasters
    const disaster = subscribeToDisasters((payload) => {
      console.log("🔴 Real-time disaster update received:", payload);
      loadStats();
    });
    setDisasterChannel(disaster);
    
    // Subscribe to hospitals
    const hospital = subscribeToHospitals((payload) => {
      console.log("🔴 Real-time hospital update received:", payload);
      loadStats();
    });
    setHospitalChannel(hospital);
  };

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      console.log("📊 Loading department stats from real-time database...");

      // Load SOS alerts (no token needed - direct Supabase access)
      console.log("Fetching SOS alerts...");
      const sosData = await getSOSAlerts("all");
      console.log("✓ SOS alerts loaded:", sosData?.alerts?.length || 0);
      const activeSOSCount = (sosData?.alerts || []).filter((a: any) => 
        a.status === "active" || a.status === "responding"
      ).length;

      // Load disasters
      console.log("Fetching disasters...");
      const disasterData = await getActiveDisasters();
      console.log("✓ Disasters loaded:", disasterData?.disasters?.length || 0);
      const totalEvacuees = (disasterData?.disasters || []).reduce((sum: number, d: any) => 
        sum + (d.families_affected || 0), 0
      );

      // Load hospitals
      console.log("Fetching hospitals...");
      const hospitalData = await getHospitals();
      console.log("✓ Hospitals loaded:", hospitalData?.hospitals?.length || 0);
      const onlineHospitals = (hospitalData?.hospitals || []).filter((h: any) => 
        h.status === "operational"
      ).length;

      setStats({
        activeAlerts: (disasterData?.disasters || []).length,
        sosAlerts: activeSOSCount,
        evacuees: totalEvacuees,
        hospitalsOnline: onlineHospitals
      });
      
      console.log("✓ Dashboard stats updated successfully from real-time database");
      setIsLoading(false);
      setHasError(false);
    } catch (error: any) {
      console.error("❌ Failed to load dashboard stats:", error);
      console.error("Error details:", error?.message || "Unknown error");
      setIsLoading(false);
      setHasError(true);
      
      // Check if it's an authentication error
      const isAuthError = error?.message && (
        error.message.includes("Authentication failed") ||
        error.message.includes("Invalid token") ||
        error.message.includes("sign in again")
      );
      
      // Show a toast notification to the user
      import("sonner@2.0.3").then(({ toast }) => {
        toast.error("Failed to load dashboard data", {
          description: isAuthError 
            ? "Your session has expired. Please sign in again." 
            : (error?.message || "Please check your connection and try again"),
          duration: isAuthError ? 8000 : 5000,
        });
        
        // If auth error, clear storage and suggest reload
        if (isAuthError) {
          setTimeout(() => {
            localStorage.removeItem("USER");
            toast.info("Please sign in again", {
              description: "Click anywhere to reload and sign in",
              action: {
                label: "Reload",
                onClick: () => window.location.reload(),
              },
            });
          }, 3000);
        }
      });
    }
  };

  const getRoleName = () => {
    switch (user.departmentRole) {
      case "lgu": return "LGU Command Center";
      case "emergency_responder": return "Emergency Response Center";
      case "healthcare": return "Healthcare Coordination Hub";
      case "disaster_management": return "NDRRMC Operations Center";
      default: return "Department Dashboard";
    }
  };

  const getQuickStats = () => {
    return [
      { 
        id: "alerts", 
        icon: AlertTriangle, 
        label: "Active Disasters", 
        value: stats.activeAlerts, 
        color: "bg-orange-500",
        change: "Click to view details"
      },
      { 
        id: "sos", 
        icon: Shield, 
        label: "SOS Distress Signals", 
        value: stats.sosAlerts, 
        color: "bg-red-500",
        change: stats.sosAlerts > 0 ? "Urgent attention needed" : "No active alerts"
      },
      { 
        id: "evacuees", 
        icon: Users, 
        label: "Total Evacuees", 
        value: stats.evacuees, 
        color: "bg-blue-500",
        change: "Across all evacuation centers"
      },
      { 
        id: "hospitals", 
        icon: Heart, 
        label: "Hospitals Online", 
        value: stats.hospitalsOnline, 
        color: "bg-green-500",
        change: "Click for hospital details"
      },
    ];
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{getRoleName()}</h1>
            <p className="text-blue-100">Real-time disaster response coordination for NCR</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStats()}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">System Active</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && !isLoading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Unable to Load Dashboard Data</h3>
                <p className="text-sm text-red-700 mt-1">
                  There was a problem connecting to the server. Please check the console for details or try refreshing.
                </p>
                <Button
                  onClick={() => loadStats()}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          getQuickStats().map((stat) => (
            <Card 
              key={stat.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (stat.id === "alerts") setActiveTab("monitoring");
                if (stat.id === "sos") setActiveTab("sos");
                if (stat.id === "hospitals") setActiveTab("healthcare");
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Critical Alerts Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Critical Weather Alert - PAGASA</h3>
              <p className="text-sm text-red-700 mt-1">
                Tropical Depression Signal No. 2 affecting Metro Manila. Heavy rainfall and flooding expected.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-red-300 text-red-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated 5 mins ago
                </Badge>
                <Badge variant="outline" className="border-red-300 text-red-700">
                  <MapPin className="h-3 w-3 mr-1" />
                  All NCR Cities
                </Badge>
              </div>
            </div>
            <Button variant="destructive" size="sm">
              Broadcast Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${(user.departmentRole === "lgu" || user.departmentRole === "emergency_responder") ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {(user.departmentRole === "lgu" || user.departmentRole === "emergency_responder") && (
            <TabsTrigger value="map">Emergency Map</TabsTrigger>
          )}
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="sos">SOS Alerts</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {activeTab === "overview" && (
            <ErrorBoundary fallback={
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                  <p className="text-red-900 font-medium">Failed to load Analytics</p>
                  <p className="text-red-700 text-sm mt-1">Please refresh the page or contact support</p>
                </CardContent>
              </Card>
            }>
              <DataAnalytics user={user} />
            </ErrorBoundary>
          )}
        </TabsContent>

        {(user.departmentRole === "lgu" || user.departmentRole === "emergency_responder") && (
          <TabsContent value="map" className="mt-6">
            {activeTab === "map" && (
              <ErrorBoundary fallback={
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                    <p className="text-red-900 font-medium">Failed to load Emergency Map</p>
                    <p className="text-red-700 text-sm mt-1">Please refresh the page or contact support</p>
                  </CardContent>
                </Card>
              }>
                <EmergencyMap user={user} />
              </ErrorBoundary>
            )}
          </TabsContent>
        )}

        <TabsContent value="monitoring" className="mt-6">
          {activeTab === "monitoring" && (
            <ErrorBoundary fallback={
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                  <p className="text-red-900 font-medium">Failed to load Disaster Monitoring</p>
                  <p className="text-red-700 text-sm mt-1">Please refresh the page or contact support</p>
                </CardContent>
              </Card>
            }>
              <DisasterMonitoring user={user} />
            </ErrorBoundary>
          )}
        </TabsContent>

        <TabsContent value="sos" className="mt-6">
          {activeTab === "sos" && (
            <ErrorBoundary fallback={
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                  <p className="text-red-900 font-medium">Failed to load SOS Alerts</p>
                  <p className="text-red-700 text-sm mt-1">Please refresh the page or contact support</p>
                </CardContent>
              </Card>
            }>
              <SOSAlertTracker user={user} />
            </ErrorBoundary>
          )}
        </TabsContent>

        <TabsContent value="healthcare" className="mt-6">
          {activeTab === "healthcare" && (
            <ErrorBoundary fallback={
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-600" />
                  <p className="text-red-900 font-medium">Failed to load Healthcare Integration</p>
                  <p className="text-red-700 text-sm mt-1">Please refresh the page or contact support</p>
                </CardContent>
              </Card>
            }>
              <HealthcareIntegration user={user} />
            </ErrorBoundary>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}