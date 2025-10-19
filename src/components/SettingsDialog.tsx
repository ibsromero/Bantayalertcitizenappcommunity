import { useState } from "react";
import { Settings, Bell, Moon, Globe, Shield, Database, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { DataSyncStatus } from "./DataSyncStatus";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string } | null;
}

export function SettingsDialog({ isOpen, onClose, user }: SettingsDialogProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    toast.success("Settings saved", {
      description: "Your preferences have been updated",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your app preferences and notifications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          {user && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </h3>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">
                  Enable Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weather" className="text-sm">
                  Weather Alerts
                </Label>
                <Switch
                  id="weather"
                  checked={weatherAlerts}
                  onCheckedChange={setWeatherAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emergency" className="text-sm">
                  Emergency Alerts
                </Label>
                <Switch
                  id="emergency"
                  checked={emergencyAlerts}
                  onCheckedChange={setEmergencyAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Moon className="h-4 w-4 mr-2" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-sm">
                Dark Mode (Coming Soon)
              </Label>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                disabled
              />
            </div>
          </div>

          <Separator />

          {/* Language */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </h3>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fil">Filipino</SelectItem>
                <SelectItem value="tl">Tagalog</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Data & Privacy */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data & Privacy
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup" className="text-sm">
                  Auto Cloud Backup
                </Label>
                <Switch
                  id="autoBackup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </div>
          </div>

          <Separator />

          {/* Data Sync Status */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Sync Status
            </h3>
            <DataSyncStatus user={user} />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
