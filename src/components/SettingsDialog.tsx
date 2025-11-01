import { useState, useEffect } from "react";
import { Settings, Bell, Moon, Globe, Shield, Database, User, RefreshCw, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner@2.0.3";
import { DataSyncStatus } from "./DataSyncStatus";
import { getSettings, saveSettings, type UserSettings } from "../utils/settingsUtils";
import type { Language } from "../utils/translations";
import { syncAllData } from "../utils/dataSyncUtils";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string; accessToken?: string } | null;
  onNameUpdate?: (newName: string) => void;
}

export function SettingsDialog({ isOpen, onClose, user, onNameUpdate }: SettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [userName, setUserName] = useState(user?.name || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [autoBackup, setAutoBackup] = useState(true);

  // Load settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setUserName(user?.name || "");
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await getSettings(user?.accessToken);
      setNotificationsEnabled(settings.notificationsEnabled);
      setWeatherAlerts(settings.weatherAlertsEnabled);
      setEmergencyAlerts(settings.emergencyAlertsEnabled);
      setDarkMode(settings.darkMode);
      setLanguage(settings.language);
      setAutoBackup(settings.autoBackup);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save all settings
      const settings: Partial<UserSettings> = {
        notificationsEnabled,
        weatherAlertsEnabled: weatherAlerts,
        emergencyAlertsEnabled: emergencyAlerts,
        darkMode,
        language,
        autoBackup,
      };

      await saveSettings(settings, user?.accessToken);

      // Update user name if changed
      if (userName !== user?.name && onNameUpdate) {
        onNameUpdate(userName);
      }

      toast.success("Settings saved", {
        description: "Your preferences have been updated successfully",
      });

      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings", {
        description: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = async (checked: boolean) => {
    setDarkMode(checked);
    // Apply dark mode immediately
    if (checked) {
      document.documentElement.classList.add("dark");
      toast.success("Dark mode enabled");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Dark mode disabled");
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    toast.success(
      newLanguage === "tl" ? "Pinalitan ang wika sa Tagalog" : "Language changed to English"
    );
  };

  const handleSyncNow = async () => {
    if (!user?.accessToken) {
      toast.error("Please sign in to sync data");
      return;
    }

    setSyncing(true);
    try {
      await syncAllData(user.accessToken);
      toast.success("Sync completed", {
        description: "All your data has been synced to the cloud",
      });
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Sync failed", {
        description: "Please check your connection and try again",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !notificationsEnabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" aria-describedby="loading-description">
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p id="loading-description" className="text-sm text-gray-500">Loading settings...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>Manage your app preferences and account settings</DialogDescription>
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
                  <CardContent className="p-3 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="text-xs">
                        Display Name
                      </Label>
                      <Input
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm">{user.email}</p>
                    </div>
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
                Dark Mode
              </Label>
              <Switch id="darkMode" checked={darkMode} onCheckedChange={handleToggleDarkMode} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {darkMode
                ? "Dark mode is enabled for reduced eye strain"
                : "Switch to dark mode for comfortable viewing in low light"}
            </p>
          </div>

          <Separator />

          {/* Language */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Language
            </h3>
            <Select value={language} onValueChange={(val) => handleLanguageChange(val as Language)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tl">Tagalog</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              {language === "tl"
                ? "Ang app ay naglalahad sa Tagalog"
                : "App will display in English"}
            </p>
          </div>

          <Separator />

          {/* Data & Privacy */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data & Backup
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoBackup" className="text-sm">
                  Auto Cloud Backup
                </Label>
                <Switch id="autoBackup" checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
              {user?.accessToken && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleSyncNow}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </div>
          </div>

          {user && (
            <>
              <Separator />
              {/* Data Sync Status */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Sync Status
                </h3>
                <DataSyncStatus user={user} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
