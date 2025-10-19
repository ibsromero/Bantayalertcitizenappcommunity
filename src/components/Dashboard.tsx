import { useState, useEffect } from "react";
import { AlertTriangle, Heart, Package, MapPin, BookOpen, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getActivities, getRelativeTime, logActivity } from "../utils/activityUtils";
import { getFromStorage, saveToStorage } from "../utils/storageUtils";

interface DashboardProps {
  onNavigate: (section: string) => void;
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function Dashboard({ onNavigate, user }: DashboardProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [communicationPlan, setCommunicationPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load communication plan from storage
        const savedPlan = getFromStorage("COMMUNICATION_PLAN");
        setCommunicationPlan(savedPlan);

        // Load activities (from Supabase if logged in, otherwise localStorage)
        const loadedActivities = await getActivities();
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const quickActions = [
    { id: "emergency", icon: Phone, label: "Emergency Contacts", color: "bg-red-500" },
    { id: "checklist", icon: Package, label: "Prep Checklist", color: "bg-blue-500" },
    { id: "kit", icon: Heart, label: "Emergency Kit", color: "bg-green-500" },
    { id: "alerts", icon: AlertTriangle, label: "Weather Alerts", color: "bg-orange-500" },
    { id: "evacuation", icon: MapPin, label: "Evacuation Routes", color: "bg-purple-500" },
    { id: "resources", icon: BookOpen, label: "Resources", color: "bg-teal-500" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Alert Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Heavy Rainfall Warning - PAGASA</h3>
              <p className="text-sm text-orange-700 mt-1">
                Enhanced Southwest Monsoon (Habagat) affecting Metro Manila. Heavy to intense rainfall expected.
              </p>
              <Badge variant="outline" className="mt-2 border-orange-300 text-orange-700">
                Active until 8:00 PM | NCR
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-24 sm:h-28 lg:h-24 flex flex-col items-center justify-center space-y-2 border-gray-200 hover:border-gray-300 active:scale-95 transition-transform touch-manipulation min-h-[88px]"
              onClick={() => onNavigate(action.id)}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center leading-tight">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Preparedness Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preparedness Status
            <Badge variant="secondary">78% Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Emergency Kit</span>
            <Badge variant="outline" className="text-green-700 border-green-300">Complete</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Emergency Contacts</span>
            <Badge variant="outline" className="text-green-700 border-green-300">Complete</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Family Plan</span>
            <Badge variant="outline" className="text-orange-700 border-orange-300">In Progress</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Document Backup</span>
            <Badge variant="outline" className="text-red-700 border-red-300">Pending</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Priority Action Needed */}
      {!communicationPlan ? (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">Priority Action Needed</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Complete your emergency communication plan. This is critical for keeping your family safe and connected during disasters.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 border-orange-300 text-orange-700 touch-manipulation min-h-[40px] active:scale-95 transition-transform"
                  onClick={() => onNavigate("checklist")}
                >
                  Complete Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-green-900">Communication Plan Completed</h3>
                <div className="text-sm text-green-700 mt-2 space-y-1">
                  <p><strong>Meeting Point:</strong> {communicationPlan.meetingPoint}</p>
                  <p><strong>Out-of-Town Contact:</strong> {communicationPlan.outOfTownContact}</p>
                  <p><strong>Emergency Number:</strong> {communicationPlan.emergencyNumber}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 border-green-300 text-green-700 touch-manipulation min-h-[40px] active:scale-95 transition-transform"
                  onClick={() => onNavigate("checklist")}
                >
                  Update Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.length > 0 ? (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No recent activity. Start by adding emergency contacts or preparing your kit.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
