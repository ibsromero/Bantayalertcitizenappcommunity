import { useState } from "react";
import { AlertTriangle, MapPin, Phone, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";
import { getCurrentLocation, isGeolocationAvailable } from "../utils/geolocationUtils";
import { logActivity } from "../utils/activityUtils";

interface SOSButtonProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function SOSButton({ user }: SOSButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleOpenDialog = async () => {
    setShowDialog(true);
    
    // Try to get location
    if (isGeolocationAvailable()) {
      try {
        const coords = await getCurrentLocation();
        setLocation(coords);
      } catch (error) {
        console.error("Failed to get location:", error);
      }
    }
  };

  const handleSendSOS = async () => {
    if (!message.trim()) {
      toast.error("Please describe your emergency");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would send to the server
      // For now, we'll just simulate the send
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the activity
      logActivity("sos_sent", `SOS alert sent: ${message}`, user?.accessToken);

      toast.success("SOS Alert Sent!", {
        description: "Emergency responders have been notified of your location and situation",
      });

      setShowDialog(false);
      setMessage("");
      setLocation(null);
    } catch (error) {
      console.error("Failed to send SOS:", error);
      toast.error("Failed to send SOS", {
        description: "Please try calling emergency services directly at 911",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        className="bg-red-600 hover:bg-red-700 text-white touch-manipulation min-h-[56px] shadow-lg hover:shadow-xl transition-all active:scale-95"
        size="lg"
      >
        <AlertTriangle className="h-5 w-5 mr-2 animate-pulse" />
        <span className="font-bold">SEND SOS ALERT</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Send Emergency SOS Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately alert emergency responders to your location and situation. 
              For immediate life-threatening emergencies, call 911.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* User Info */}
            {user && (
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm font-medium">Your Information:</p>
                <p className="text-sm text-gray-600">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            )}

            {/* Location */}
            <div className="bg-blue-50 rounded p-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {location ? "Location Detected" : "Getting location..."}
                  </p>
                  {location && (
                    <p className="text-xs text-blue-700 mt-1">
                      Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                  {!location && isGeolocationAvailable() && (
                    <p className="text-xs text-blue-700 mt-1">
                      Please allow location access for faster response
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Message */}
            <div className="space-y-2">
              <Label htmlFor="sos-message">Describe your emergency *</Label>
              <Textarea
                id="sos-message"
                placeholder="E.g., Trapped in flooded building, 3rd floor, water rising..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Emergency Number Reminder */}
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    For immediate life-threatening emergencies:
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Call <strong>911</strong> (National Emergency Hotline)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendSOS}
              disabled={isSubmitting || !message.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send SOS Alert
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
