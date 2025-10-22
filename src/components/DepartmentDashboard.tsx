import { useState, useEffect } from "react";
import { AlertTriangle, Users, Heart, Activity, MapPin, TrendingUp, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DisasterMonitoring } from "./department/DisasterMonitoring";
import { SOSAlertTracker } from "./department/SOSAlertTracker";
import { DataAnalytics } from "./department/DataAnalytics";
import { HealthcareIntegration } from "./department/HealthcareIntegration";
import type { DepartmentRole } from "./AuthModal";

interface DepartmentDashboardProps {
  user: { 
    name: string; 
    email: string; 
    accessToken?: string;
    userType?: string;
    departmentRole?: DepartmentRole;
  };
}

export function DepartmentDashboard({ user }: DepartmentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    activeAlerts: 12,
    sosAlerts: 3,
    evacuees: 245,
    hospitalsOnline: 8
  });

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
        label: "Active Alerts", 
        value: stats.activeAlerts, 
        color: "bg-orange-500",
        change: "+2 from last hour"
      },
      { 
        id: "sos", 
        icon: Shield, 
        label: "SOS Distress Signals", 
        value: stats.sosAlerts, 
        color: "bg-red-500",
        change: "Urgent attention needed"
      },
      { 
        id: "evacuees", 
        icon: Users, 
        label: "Total Evacuees", 
        value: stats.evacuees, 
        color: "bg-blue-500",
        change: "+15 in last 30 min"
      },
      { 
        id: "hospitals", 
        icon: Heart, 
        label: "Hospitals Online", 
        value: stats.hospitalsOnline, 
        color: "bg-green-500",
        change: "All reporting"
      },
    ];
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{getRoleName()}</h1>
            <p className="text-blue-100">Real-time disaster response coordination for NCR</p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 animate-pulse" />
            <span className="text-sm">System Active</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {getQuickStats().map((stat) => (
          <Card key={stat.id}>
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
        ))}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="sos">SOS Alerts</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DataAnalytics user={user} />
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <DisasterMonitoring user={user} />
        </TabsContent>

        <TabsContent value="sos" className="mt-6">
          <SOSAlertTracker user={user} />
        </TabsContent>

        <TabsContent value="healthcare" className="mt-6">
          <HealthcareIntegration user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
