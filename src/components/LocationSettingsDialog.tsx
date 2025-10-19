import { useState, useEffect } from "react";
import { MapPin, Save, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";
import { supabase } from "../utils/supabaseClient";
import { getUserSettings, saveUserSettings, updateUserProfile } from "../utils/supabaseDataService";

interface LocationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; accessToken?: string } | null;
}

export function LocationSettingsDialog({ isOpen, onClose, user }: LocationSettingsDialogProps) {
  const [selectedCity, setSelectedCity] = useState("Manila");
  const [familyMembers, setFamilyMembers] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    try {
      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        console.log('Demo mode - using default settings');
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      if (authUser) {
        const settings = await getUserSettings(authUser.id);
        if (settings) {
          setSelectedCity(settings.location_city || "Manila");
          setFamilyMembers(settings.family_members || 1);
        }
        
        // Load phone from profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('phone_number')
          .eq('user_id', authUser.id)
          .single();
        
        if (profile?.phone_number) {
          setPhoneNumber(profile.phone_number);
        }
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const ncrCities = [
    "Manila", "Quezon City", "Caloocan", "Las Piñas", "Makati",
    "Malabon", "Mandaluyong", "Marikina", "Muntinlupa", "Navotas",
    "Parañaque", "Pasay", "Pasig", "Pateros", "San Juan",
    "Taguig", "Valenzuela"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        // Demo mode - just show success message
        toast.success("Settings updated", {
          description: `Location set to ${selectedCity}, NCR (Demo Mode)`,
        });
        onClose();
        setIsLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      
      if (!authUser) {
        throw new Error("Not authenticated");
      }

      // Save location and family settings
      await saveUserSettings(authUser.id, {
        location_city: selectedCity,
        family_members: familyMembers
      });

      // Update phone number in profile if provided
      if (phoneNumber) {
        await updateUserProfile(authUser.id, {
          phone_number: phoneNumber,
          city: selectedCity
        });
      }

      toast.success("Settings updated", {
        description: `Location set to ${selectedCity}, NCR`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error saving location settings:', error);
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
            <MapPin className="h-5 w-5" />
            <span>Location & Family Settings</span>
          </DialogTitle>
          <DialogDescription>
            Set your location and household information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* City Selection */}
          <div className="space-y-2">
            <Label htmlFor="city">City/Municipality</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ncrCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Metro Manila (NCR) cities only
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+63 9XX XXX XXXX"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              For emergency contact purposes
            </p>
          </div>

          {/* Family Members */}
          <div className="space-y-2">
            <Label htmlFor="family" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Number of Family Members</span>
            </Label>
            <Input
              id="family"
              type="number"
              min="1"
              max="50"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Helps plan emergency supplies
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
