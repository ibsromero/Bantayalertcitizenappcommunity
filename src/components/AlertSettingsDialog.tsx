import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { toast } from "sonner@2.0.3";

interface AlertSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertSettingsDialog({ isOpen, onClose }: AlertSettingsDialogProps) {
  const [settings, setSettings] = useState({
    typhoon: true,
    flooding: true,
    earthquake: true,
    heavyRain: true,
    thunderstorm: true,
    heatWarning: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    const enabledCount = Object.values(settings).filter(Boolean).length;
    toast.success("Alert settings saved", {
      description: `${enabledCount} alert types enabled`,
    });
    onClose();
  };

  const alertTypes = [
    { key: "typhoon", label: "Typhoon Warnings", description: "PAGASA tropical cyclone alerts" },
    { key: "flooding", label: "Flood Warnings", description: "Heavy rainfall and flood advisories" },
    { key: "earthquake", label: "Earthquake Alerts", description: "PHIVOLCS seismic activity updates" },
    { key: "heavyRain", label: "Heavy Rainfall", description: "Severe weather and monsoon alerts" },
    { key: "thunderstorm", label: "Thunderstorm Warnings", description: "Lightning and severe weather" },
    { key: "heatWarning", label: "Heat Index Warnings", description: "Extreme heat advisories" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Alert Types</DialogTitle>
          <DialogDescription>
            Choose which weather alerts you want to receive from PAGASA
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {alertTypes.map((alert) => (
            <div key={alert.key} className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-gray-200">
              <div className="flex-1">
                <Label htmlFor={alert.key} className="cursor-pointer">
                  {alert.label}
                </Label>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              </div>
              <Switch
                id={alert.key}
                checked={settings[alert.key as keyof typeof settings]}
                onCheckedChange={() => handleToggle(alert.key as keyof typeof settings)}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
