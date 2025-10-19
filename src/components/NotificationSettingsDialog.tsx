import { useState, useEffect } from "react";
import { Bell, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { supabase } from "../utils/supabaseClient";
import { getUserSettings, saveUserSettings } from "../utils/supabaseDataService";

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; accessToken?: string } | null;
}

export function NotificationSettingsDialog({ isOpen, onClose, user }: NotificationSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [severeWeatherAlerts, setSevereWeatherAlerts] = useState(true);
  const [earthquakeAlerts, setEarthquakeAlerts] = useState(true);
  const [floodAlerts, setFloodAlerts] = useState(true);
  const [typhoonAlerts, setTyphoonAlerts] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    try {
      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        console.log('Demo mode - using default notification settings');
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      if (authUser) {
        const settings = await getUserSettings(authUser.id);
        if (settings) {
          setNotificationsEnabled(settings.notification_enabled ?? true);
          setSevereWeatherAlerts(settings.alert_severe_weather ?? true);
          setEarthquakeAlerts(settings.alert_earthquakes ?? true);
          setFloodAlerts(settings.alert_floods ?? true);
          setTyphoonAlerts(settings.alert_typhoons ?? true);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        // Demo mode - just show success message
        toast.success("Settings updated", {
          description: "Your notification preferences have been saved (Demo Mode)"
        });
        onClose();
        setIsLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      
      if (!authUser) {
        throw new Error("Not authenticated");
      }

      await saveUserSettings(authUser.id, {
        notification_enabled: notificationsEnabled,
        alert_severe_weather: severeWeatherAlerts,
        alert_earthquakes: earthquakeAlerts,
        alert_floods: floodAlerts,
        alert_typhoons: typhoonAlerts
      });

      toast.success("Settings updated", {
        description: "Your notification preferences have been saved"
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      toast.error("Failed to save settings", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your alert and notification preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="master-notifications" className="text-sm">
                    Enable All Notifications
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Master switch for all alerts
                  </p>
                </div>
                <Switch
                  id="master-notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weather & Disaster Alerts */}
          <div className="space-y-4">
            <h3 className="text-sm">Alert Types</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="severe-weather" className="text-sm">
                  Severe Weather Alerts
                </Label>
                <Switch
                  id="severe-weather"
                  checked={severeWeatherAlerts}
                  onCheckedChange={setSevereWeatherAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="earthquake" className="text-sm">
                  Earthquake Alerts
                </Label>
                <Switch
                  id="earthquake"
                  checked={earthquakeAlerts}
                  onCheckedChange={setEarthquakeAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="flood" className="text-sm">
                  Flood Alerts
                </Label>
                <Switch
                  id="flood"
                  checked={floodAlerts}
                  onCheckedChange={setFloodAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="typhoon" className="text-sm">
                  Typhoon Alerts
                </Label>
                <Switch
                  id="typhoon"
                  checked={typhoonAlerts}
                  onCheckedChange={setTyphoonAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> Critical emergency alerts will always be delivered regardless of these settings.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
