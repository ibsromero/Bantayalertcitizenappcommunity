import { useState } from "react";
import { Settings, Bell, MapPin, User, Globe, Database, ChevronRight, Shield, Moon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner@2.0.3";
import { NotificationSettingsDialog } from "./NotificationSettingsDialog";
import { LocationSettingsDialog } from "./LocationSettingsDialog";
import { ProfileDialog } from "./ProfileDialog";
import { DataSyncStatus } from "./DataSyncStatus";

interface SettingsHubProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; accessToken?: string } | null;
}

export function SettingsHub({ isOpen, onClose, user }: SettingsHubProps) {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const settingsOptions = [
    {
      id: 'profile',
      icon: User,
      label: 'Profile Settings',
      description: 'Manage your account information',
      onClick: () => {
        setShowProfile(true);
        onClose();
      }
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notification Settings',
      description: 'Configure alerts and notifications',
      onClick: () => {
        setShowNotificationSettings(true);
        onClose();
      }
    },
    {
      id: 'location',
      icon: MapPin,
      label: 'Location Settings',
      description: 'Set your city and family details',
      onClick: () => {
        setShowLocationSettings(true);
        onClose();
      }
    },
    {
      id: 'language',
      icon: Globe,
      label: 'Language & Region',
      description: 'English (Coming Soon)',
      onClick: () => {},
      disabled: true
    },
    {
      id: 'theme',
      icon: Moon,
      label: 'Appearance',
      description: 'Dark Mode (Coming Soon)',
      onClick: () => {},
      disabled: true
    }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </DialogTitle>
            <DialogDescription>
              Manage your app preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {/* User Info */}
            {user && (
              <>
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </CardContent>
                </Card>
                <Separator />
              </>
            )}

            {/* Settings Options */}
            <div className="space-y-2">
              {settingsOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 hover:bg-gray-100"
                  onClick={option.onClick}
                  disabled={option.disabled}
                >
                  <div className="flex items-start space-x-3 flex-1 text-left">
                    <option.icon className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div>
                      <p className="text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
              ))}
            </div>

            <Separator />

            {/* Data Sync Status */}
            {user && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Database className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm">Cloud Sync Status</h3>
                </div>
                <DataSyncStatus user={user} />
              </div>
            )}

            {/* Privacy Policy */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                toast.info("Privacy Policy", {
                  description: "BantayAlert respects your privacy. Your emergency data is stored securely and never shared with third parties."
                });
              }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
            </Button>

            {/* Version Info */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                BantayAlert v1.0.0
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <ProfileDialog
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
      />
      
      <NotificationSettingsDialog
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        user={user}
      />
      
      <LocationSettingsDialog
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
        user={user}
      />
    </>
  );
}
