import { useState, useEffect } from "react";
import { User, Mail, Calendar, Save, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import { supabase } from "../utils/supabaseClient";
import { getUserProfile, updateUserProfile } from "../utils/supabaseDataService";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; accessToken?: string; userType?: string; departmentRole?: string } | null;
  onProfileUpdate?: (name: string) => void;
}

export function ProfileDialog({ isOpen, onClose, user, onProfileUpdate }: ProfileDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    try {
      // Department users: just use the session info (no Supabase profile)
      if (user?.userType === "department") {
        console.log('Department user - using session data');
        setName(user?.name || "");
        setPhoneNumber(""); // Department users don't have phone numbers
        setProfileData({ 
          name: user.name, 
          email: user.email,
          role: user.departmentRole 
        });
        return;
      }

      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        console.log('Demo mode - using local profile data');
        setName(user?.name || "");
        setPhoneNumber("");
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      if (authUser) {
        const profile = await getUserProfile(authUser.id);
        setProfileData(profile);
        if (profile) {
          setName(profile.name);
          setPhoneNumber(profile.phone_number || "");
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required", {
        description: "Please enter your name"
      });
      return;
    }

    // Validate phone number format if provided
    if (phoneNumber && !/^(\+63|0)?9\d{9}$/.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid Philippine mobile number (e.g., 09XX XXX XXXX)"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Department users cannot edit their profile
      if (user?.userType === "department") {
        toast.info("Department Profile", {
          description: "Department account details cannot be modified. Contact your administrator to update department information."
        });
        setIsLoading(false);
        return;
      }

      // Check if user has access token (authenticated with Supabase)
      if (!user?.accessToken) {
        // Demo mode - just show success message
        toast.success("Profile updated", {
          description: "Your profile has been successfully updated (Demo Mode)"
        });
        
        // Notify parent component
        if (onProfileUpdate) {
          onProfileUpdate(name.trim());
        }
        
        onClose();
        setIsLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser(user.accessToken);
      
      if (!authUser) {
        throw new Error("Not authenticated");
      }

      // Update user profile in database with phone number
      await updateUserProfile(authUser.id, { 
        name: name.trim(),
        phone_number: phoneNumber.trim() || null
      });

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { 
          name: name.trim(),
          phone_number: phoneNumber.trim() || null
        }
      });

      toast.success("Profile updated", {
        description: "Your profile has been successfully updated"
      });

      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(name.trim());
      }

      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </DialogTitle>
          <DialogDescription>
            View and edit your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {getInitials(name || user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500">Profile Avatar</p>
          </div>

          {/* Department Role (for department users) */}
          {user?.userType === "department" && (
            <div className="space-y-2">
              <Label htmlFor="role">Department Role</Label>
              <Input
                id="role"
                value={user.departmentRole?.toUpperCase().replace('_', ' ') || ""}
                disabled
                className="bg-blue-50 cursor-not-allowed font-semibold"
              />
              <p className="text-xs text-gray-500">Department account type</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className={`pl-9 w-full ${user?.userType === "department" ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                disabled={user?.userType === "department"}
              />
            </div>
            {user?.userType === "department" && (
              <p className="text-xs text-gray-500">Department names cannot be changed</p>
            )}
          </div>

          {/* Phone Number Field (Citizen only) */}
          {user?.userType !== "department" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (recommended)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="pl-9 w-full"
                />
              </div>
              <p className="text-xs text-gray-500">
                Used for emergency contact and SOS alerts. Format: 09XX XXX XXXX
              </p>
            </div>
          )}

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="pl-9 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Account Information */}
          {profileData && user?.userType !== "department" && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-sm">{formatDate(profileData.created_at)}</p>
                    </div>
                  </div>
                </div>
                {profileData.updated_at && profileData.updated_at !== profileData.created_at && (
                  <div className="flex items-start justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm">{formatDate(profileData.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Department Info Card */}
          {user?.userType === "department" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-900">
                  <strong>Department Account</strong>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  This is an official department account for {user.departmentRole?.toUpperCase().replace('_', ' ')}. 
                  Profile details are managed by system administrators.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {user?.userType === "department" ? "Close" : "Cancel"}
          </Button>
          {user?.userType !== "department" && (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
