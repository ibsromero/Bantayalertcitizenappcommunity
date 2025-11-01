import { useState, useEffect } from "react";
import { MapPin, Phone, Navigation, Clock, User, CheckCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";
import { getSOSAlerts, updateSOSAlert } from "../../utils/departmentApiService";
import { makePhoneCall } from "../../utils/phoneUtils";

interface SOSAlert {
  id: string;
  userEmail: string;
  userName: string;
  contactNumber: string;
  location: { lat: number | null; lng: number | null; address: string };
  details: string;
  priority: "critical" | "high" | "medium";
  status: "active" | "responding" | "resolved" | "cancelled";
  created_at: string;
  updated_at: string;
  responded_by?: string;
  resolution?: string;
  responseProgress?: "dispatched" | "enroute" | "onsite" | "assisting" | "completed";
}

interface EmergencyMapProps {
  user: any;
}

export function EmergencyMap({ user }: EmergencyMapProps) {
  console.log("🟢 EmergencyMap component mounting. User:", {
    name: user?.name,
    hasToken: !!user?.accessToken
  });

  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    console.log("🟢 EmergencyMap useEffect triggered");
    loadAlerts();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 10000);
    return () => {
      console.log("🟢 EmergencyMap cleanup");
      clearInterval(interval);
    };
  }, [user?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAlerts = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      const token = user?.accessToken;
      if (!token) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const data = await getSOSAlerts(token, "all");
      let filteredAlerts = data.alerts || [];
      
      if (filterLocation !== "all") {
        filteredAlerts = filteredAlerts.filter((a: SOSAlert) => a.location.address.includes(filterLocation));
      }
      
      if (filterPriority !== "all") {
        filteredAlerts = filteredAlerts.filter((a: SOSAlert) => a.priority === filterPriority);
      }
      
      setAlerts(filteredAlerts);
    } catch (error: any) {
      console.error("Failed to load alerts:", error);
      if (!silent) {
        toast.error("Failed to load alerts", {
          description: error.message || "Could not connect to server",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateProgress = async (alertId: string, progress: string) => {
    try {
      const token = user?.accessToken;
      if (!token) return;

      const statusMap: { [key: string]: string } = {
        dispatched: "responding",
        enroute: "responding",
        onsite: "responding",
        assisting: "responding",
        completed: "resolved"
      };

      const newStatus = statusMap[progress] || "responding";
      
      await updateSOSAlert(token, alertId, { 
        status: newStatus,
        resolution: progress === "completed" ? "Assistance provided successfully" : undefined
      });
      
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId 
            ? { ...alert, status: newStatus as any, responseProgress: progress as any } 
            : alert
        )
      );
      
      toast.success("Progress updated", {
        description: `Status changed to ${progress}`,
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleCallCitizen = (alert: SOSAlert) => {
    try {
      makePhoneCall(alert.contactNumber, alert.userName);
      toast.success(`Calling ${alert.userName}`, {
        description: alert.contactNumber,
      });
    } catch (error) {
      toast.error("Failed to make call");
    }
  };

  const handleNavigate = (alert: SOSAlert) => {
    if (alert.location.lat && alert.location.lng) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${alert.location.lat},${alert.location.lng}`;
      window.open(mapsUrl, "_blank");
      toast.success("Opening navigation", {
        description: `Navigating to ${alert.location.address}`,
      });
    } else {
      toast.error("Location not available", {
        description: "This alert does not have GPS coordinates",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-600 text-white";
      case "medium": return "bg-yellow-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "border-red-300 text-red-700 bg-red-50";
      case "responding": return "border-blue-300 text-blue-700 bg-blue-50";
      case "resolved": return "border-green-300 text-green-700 bg-green-50";
      case "cancelled": return "border-gray-300 text-gray-700 bg-gray-50";
      default: return "border-gray-300 text-gray-700 bg-gray-50";
    }
  };

  const getProgressSteps = (currentProgress?: string) => {
    const steps = ["dispatched", "enroute", "onsite", "assisting", "completed"];
    const currentIndex = currentProgress ? steps.indexOf(currentProgress) : -1;
    
    return steps.map((step, index) => ({
      step,
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: step === currentProgress
    }));
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Emergency Response Map</h2>
          <p className="text-gray-600">
            Real-time tracking of emergency locations with response progress monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="City Center">City Center</SelectItem>
              <SelectItem value="Residential Area">Residential Area</SelectItem>
              <SelectItem value="Industrial Zone">Industrial Zone</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAlerts()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.status === "active").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responding</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.status === "responding").length}
                </p>
              </div>
              <Navigation className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.status === "resolved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Locations List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No emergency alerts to display</p>
            </CardContent>
          </Card>
        ) : (
          alerts
            .sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2 };
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
            .map((alert) => (
              <Card key={alert.id} className="border-l-4" style={{
                borderLeftColor: alert.priority === "critical" ? "#dc2626" : alert.priority === "high" ? "#ea580c" : "#ca8a04"
              }}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{alert.userName}</p>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Alert ID: {alert.id}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {getRelativeTime(alert.created_at)}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-900">{alert.location.address}</p>
                          {alert.location.lat && alert.location.lng && (
                            <p className="text-sm text-blue-700 mt-1">
                              Coordinates: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Emergency Details:</p>
                      <p className="text-sm text-gray-900">{alert.details}</p>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{alert.contactNumber}</p>
                    </div>

                    {/* Progress Tracker (only for responding status) */}
                    {alert.status === "responding" && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3">Response Progress:</p>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {getProgressSteps(alert.responseProgress).map((step, index) => (
                              <div key={step.step} className="flex-1">
                                <Button
                                  size="sm"
                                  variant={step.active ? "default" : step.completed ? "secondary" : "outline"}
                                  className="w-full text-xs"
                                  onClick={() => handleUpdateProgress(alert.id, step.step)}
                                >
                                  {step.completed && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {step.label}
                                </Button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            Click to update response progress
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Responded By */}
                    {alert.responded_by && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <User className="h-4 w-4" />
                        <p>Responded by: {alert.responded_by}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallCitizen(alert)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call Citizen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigate(alert)}
                        disabled={!alert.location.lat || !alert.location.lng}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Open in Maps
                      </Button>
                      {alert.status === "active" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateProgress(alert.id, "dispatched")}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Dispatch Team
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}