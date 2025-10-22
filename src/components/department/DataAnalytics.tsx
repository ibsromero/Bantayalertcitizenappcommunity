import { useState, useEffect } from "react";
import { TrendingUp, Users, MapPin, Package, Download, Calendar, RefreshCw, AlertCircle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";
import { getAnalyticsSummary } from "../../utils/departmentApiService";

interface DataAnalyticsProps {
  user: any;
}

interface AnalyticsData {
  alerts: {
    total: number;
    active: number;
    resolved: number;
  };
  disasters: {
    total: number;
    critical: number;
  };
  healthcare: {
    totalHospitals: number;
    totalBeds: number;
    availableBeds: number;
    occupancyRate: string;
  };
  lastUpdated: string;
}

export function DataAnalytics({ user }: DataAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("24h");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const loadAnalytics = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      const token = user?.accessToken;
      if (!token) {
        console.error("DataAnalytics: No access token available. User:", user);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      console.log("DataAnalytics: Loading analytics with token:", token.substring(0, 10) + '...');
      const data = await getAnalyticsSummary(token);
      console.log("DataAnalytics: Analytics loaded successfully:", data);
      setAnalytics(data);
    } catch (error: any) {
      console.error("DataAnalytics: Failed to load analytics:", error.message || error);
      if (!silent) {
        toast.error("Failed to load analytics", {
          description: error.message || "Could not connect to server",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const affectedAreas = [
    { city: "Marikina City", affected: 1250, evacuees: 450, severity: "high", damageLevel: 75 },
    { city: "Quezon City", affected: 980, evacuees: 320, severity: "medium", damageLevel: 55 },
    { city: "Manila", affected: 750, evacuees: 280, severity: "medium", damageLevel: 45 },
    { city: "Pasig City", affected: 620, evacuees: 210, severity: "low", damageLevel: 35 },
    { city: "Makati City", affected: 420, evacuees: 150, severity: "low", damageLevel: 25 },
  ];

  const resourceDistribution = [
    { resource: "Food Packs", distributed: 1250, target: 1500, percentage: 83 },
    { resource: "Water (Liters)", distributed: 5400, target: 6000, percentage: 90 },
    { resource: "Hygiene Kits", distributed: 680, target: 1000, percentage: 68 },
    { resource: "Medical Supplies", distributed: 420, target: 500, percentage: 84 },
    { resource: "Blankets", distributed: 890, target: 1000, percentage: 89 },
  ];

  const evacuationCenters = [
    { name: "Marikina Sports Center", capacity: 500, current: 450, available: 50 },
    { name: "QC Memorial Circle", capacity: 800, current: 320, available: 480 },
    { name: "Rizal Park Gymnasium", capacity: 400, current: 280, available: 120 },
    { name: "Pasig City Hall", capacity: 300, current: 210, available: 90 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-orange-100 text-orange-700 border-orange-300";
      case "low": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const handleExportReport = () => {
    toast.success("Report exported", {
      description: "Disaster assessment report has been downloaded",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <p className="text-gray-700 font-medium">No analytics data available</p>
          <p className="text-sm text-gray-500 mt-1">
            Data is being loaded or the server is unavailable
          </p>
        </div>
        <Button onClick={() => loadAnalytics()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Data Analytics & Post-Disaster Assessment</h2>
          <p className="text-gray-600">
            Evidence-based decision-making for relief distribution and resource allocation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadAnalytics()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Real-time Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total SOS Alerts</p>
                <p className="text-2xl font-bold">{analytics.alerts.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.alerts.active} active, {analytics.alerts.resolved} resolved
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Disasters</p>
                <p className="text-2xl font-bold">{analytics.disasters.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.disasters.critical} critical
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hospital Capacity</p>
                <p className="text-2xl font-bold">{analytics.healthcare.totalHospitals}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.healthcare.availableBeds} beds available
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bed Occupancy</p>
                <p className="text-2xl font-bold">{analytics.healthcare.occupancyRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.healthcare.totalBeds} total beds
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Affected</p>
                <p className="text-3xl font-bold">4,020</p>
                <p className="text-xs text-gray-500 mt-1">+245 from yesterday</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Evacuees</p>
                <p className="text-3xl font-bold">1,410</p>
                <p className="text-xs text-gray-500 mt-1">Across 4 centers</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Areas Affected</p>
                <p className="text-3xl font-bold">5</p>
                <p className="text-xs text-gray-500 mt-1">NCR cities</p>
              </div>
              <MapPin className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resources Deployed</p>
                <p className="text-3xl font-bold">82%</p>
                <p className="text-xs text-gray-500 mt-1">Of total allocation</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affected Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Affected Areas Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {affectedAreas.map((area) => (
              <div key={area.city} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{area.city}</p>
                      <Badge variant="outline" className={getSeverityColor(area.severity)}>
                        {area.severity.toUpperCase()} SEVERITY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{area.affected} affected citizens</span>
                      <span>•</span>
                      <span>{area.evacuees} evacuees</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{area.damageLevel}%</p>
                    <p className="text-xs text-gray-600">Damage level</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Damage Assessment</span>
                    <span>{area.damageLevel}%</span>
                  </div>
                  <Progress value={area.damageLevel} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Distribution Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resourceDistribution.map((resource) => (
              <div key={resource.resource}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{resource.resource}</p>
                    <p className="text-sm text-gray-600">
                      {resource.distributed.toLocaleString()} / {resource.target.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={resource.percentage >= 80 ? "default" : "outline"}>
                    {resource.percentage}%
                  </Badge>
                </div>
                <Progress value={resource.percentage} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evacuation Centers */}
      <Card>
        <CardHeader>
          <CardTitle>Evacuation Center Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evacuationCenters.map((center) => (
              <div key={center.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{center.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{center.current} / {center.capacity} occupied</span>
                      <span>•</span>
                      <span className={center.available < 100 ? "text-orange-600" : "text-green-600"}>
                        {center.available} available
                      </span>
                    </div>
                  </div>
                  <Badge variant={center.available < 100 ? "outline" : "default"}>
                    {Math.round((center.current / center.capacity) * 100)}% Full
                  </Badge>
                </div>
                <Progress value={(center.current / center.capacity) * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
