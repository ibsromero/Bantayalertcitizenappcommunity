import { useState, useEffect } from "react";
import { AlertCircle, MapPin, Phone, Clock, User, CheckCircle, XCircle, Navigation, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import { makePhoneCall } from "../../utils/phoneUtils";
import { getSOSAlerts, updateSOSAlert } from "../../utils/departmentApiService";

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
}

interface SOSAlertTrackerProps {
  user: any;
}

export function SOSAlertTracker({ user }: SOSAlertTrackerProps) {
  console.log("🟢 SOSAlertTracker component mounting. User:", {
    name: user?.name,
    hasToken: !!user?.accessToken
  });

  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log("🟢 SOSAlertTracker useEffect triggered");
    loadAlerts();
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      loadAlerts(true);
    }, 15000);
    return () => {
      console.log("🟢 SOSAlertTracker cleanup");
      clearInterval(interval);
    };
  }, [statusFilter, user?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAlerts = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setIsRefreshing(true);

      const token = user?.accessToken;
      if (!token) {
        console.error("❌ SOSAlertTracker: No access token");
        setIsLoading(false);
        setIsRefreshing(false);
        toast.error("Authentication Required", {
          description: "Please sign in to view SOS alerts"
        });
        return;
      }

      console.log("📡 SOSAlertTracker: Loading alerts with filter:", statusFilter);
      const data = await getSOSAlerts(token, statusFilter);
      console.log("✅ SOSAlertTracker: Loaded", data?.alerts?.length || 0, "alerts");
      setAlerts(data?.alerts || []);
    } catch (error: any) {
      console.error("❌ SOSAlertTracker: Failed to load alerts:", error.message);
      if (!silent) {
        toast.error("Failed to load SOS alerts", {
          description: error.message || "Could not connect to server",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
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

  const handleUpdateStatus = async (alertId: string, newStatus: string, resolution?: string) => {
    try {
      const token = user?.accessToken;
      if (!token) return;

      await updateSOSAlert(token, alertId, { status: newStatus, resolution });
      
      // Update local state
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, status: newStatus as any, resolution } : alert
        )
      );
      
      toast.success("Alert status updated", {
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const handleDispatchTeam = async (alert: SOSAlert) => {
    await handleUpdateStatus(alert.id, "responding");
    toast.success("Team dispatched", {
      description: `Emergency team en route to ${alert.location.address}`,
    });
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
          <h2 className="text-xl font-semibold mb-2">SOS Alert Tracker</h2>
          <p className="text-gray-600">
            Real-time tracking and management of citizen distress signals. Prioritize high-risk cases and allocate resources effectively.
          </p>
        </div>
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
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.priority === "critical").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 animate-pulse" />
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
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No SOS alerts at this time</p>
            </CardContent>
          </Card>
        ) : (
          alerts
            .sort((a, b) => {
              // Sort by priority, then by timestamp
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{alert.userName}</p>
                            <Badge className={getUrgencyColor(alert.priority)}>
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

                      {/* Message */}
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm">{alert.details}</p>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{alert.location.address}</p>
                          {alert.location.lat && alert.location.lng && (
                            <p className="text-xs text-gray-500">
                              {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <p>{alert.contactNumber}</p>
                      </div>

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
                          variant="default"
                          onClick={() => handleDispatchTeam(alert)}
                          disabled={alert.status !== "active"}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Dispatch Team
                        </Button>
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
                          <MapPin className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        {alert.status === "responding" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700"
                            onClick={() => handleUpdateStatus(alert.id, "resolved", "Assistance provided")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                        )}
                        {alert.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                            onClick={() => handleUpdateStatus(alert.id, "cancelled", "False alarm")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
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