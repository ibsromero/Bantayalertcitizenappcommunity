import { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Phone, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner@2.0.3";
import { getCurrentLocation, isGeolocationAvailable } from "../utils/geolocationUtils";
import { logActivity } from "../utils/activityUtils";
import { createSOSAlert } from "../utils/departmentApiService";
import { getUserProfile } from "../utils/supabaseDataService";
import { supabase } from "../utils/supabaseClient";

interface SOSButtonProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function SOSButton({ user }: SOSButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Contact information - pre-filled for authenticated users, manual entry for others
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Load user's information from profile if authenticated
  useEffect(() => {
    const loadUserInfo = async () => {
      if (user?.accessToken) {
        // Set basic user info
        setName(user.name);
        setEmail(user.email);
        
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
          if (authUser) {
            const profile = await getUserProfile(authUser.id);
            if (profile?.phone_number) {
              setPhoneNumber(profile.phone_number);
            }
          }
        } catch (error) {
          console.error("Failed to load phone number:", error);
        }
      } else {
        // Reset fields for non-authenticated users
        setName("");
        setEmail("");
        setPhoneNumber("");
      }
    };

    loadUserInfo();
  }, [user]);

  const handleOpenDialog = async () => {
    setShowDialog(true);
    
    // Try to get location
    if (isGeolocationAvailable()) {
      try {
        const coords = await getCurrentLocation();
        setLocation(coords);
      } catch (error) {
        // Silently fail - location is optional for SOS alerts
        // User will see "Getting location..." message if it fails
      }
    }
  };

  const handleSendSOS = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!message.trim()) {
      toast.error("Please describe your emergency");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare alert data
      const alertData = {
        userEmail: email || "Not provided",
        userName: name,
        location: {
          lat: location?.lat || null,
          lng: location?.lng || null,
          address: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Location unavailable"
        },
        details: message,
        contactNumber: phoneNumber || "Not provided",
        isAuthenticated: !!user
      };

      console.log("Sending SOS alert:", alertData);

      // Send to department through API
      await createSOSAlert(alertData);

      // Log the activity (only if authenticated)
      if (user?.accessToken) {
        logActivity("sos_sent", `SOS alert sent: ${message}`, user.accessToken);
      }

      toast.success("SOS Alert Sent!", {
        description: "Emergency responders have been notified of your location and situation. Stay safe!",
        duration: 5000,
      });

      setShowDialog(false);
      setMessage("");
      setLocation(null);
      
      // Only clear contact info if not authenticated
      if (!user) {
        setName("");
        setEmail("");
        setPhoneNumber("");
      }
    } catch (error: any) {
      console.error("Failed to send SOS:", error);
      toast.error("Failed to send SOS", {
        description: error.message || "Please try calling emergency services directly at 911",
        duration: 6000,
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
            {/* Contact Information */}
            <div className="space-y-3">
              {user ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-medium text-blue-900 mb-2">Your Information:</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {phoneNumber && (
                    <p className="text-sm text-gray-600">📱 {phoneNumber}</p>
                  )}
                  {!phoneNumber && (
                    <p className="text-xs text-orange-600 mt-1">⚠️ Add phone number in Profile for better response</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <p className="text-xs text-orange-900">
                      ℹ️ You're sending an anonymous SOS. For faster response, consider signing in or provide contact details below.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sos-name">Your Name *</Label>
                    <Input
                      id="sos-name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sos-email">Email Address (optional)</Label>
                    <Input
                      id="sos-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sos-phone">Phone Number (recommended)</Label>
                    <Input
                      id="sos-phone"
                      type="tel"
                      placeholder="09XX XXX XXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

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
              disabled={isSubmitting || !message.trim() || !name.trim()}
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