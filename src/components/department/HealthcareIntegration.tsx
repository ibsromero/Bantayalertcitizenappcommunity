import { useState, useEffect } from "react";
import { Heart, Bed, Activity, AlertCircle, MapPin, Phone, RefreshCw, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { makePhoneCall } from "../../utils/phoneUtils";
import { getHospitals, updateHospitalCapacity } from "../../utils/departmentApiService";

interface Hospital {
  id: string;
  name: string;
  location: string;
  contact: string;
  totalBeds: number;
  availableBeds: number;
  emergencyCapacity: number;
  icuCapacity: number;
  status: "operational" | "overwhelmed" | "offline";
  updated_at: string;
}

interface HealthcareIntegrationProps {
  user: any;
}

export function HealthcareIntegration({ user }: HealthcareIntegrationProps) {
  console.log("🟢 HealthcareIntegration component mounting. User:", {
    name: user?.name,
    hasToken: !!user?.accessToken
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [updateFormData, setUpdateFormData] = useState({
    availableBeds: 0,
    emergencyCapacity: 0,
    icuCapacity: 0,
    status: "operational"
  });

  useEffect(() => {
    console.log("🟢 HealthcareIntegration useEffect triggered");
    loadHospitals();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadHospitals(true);
    }, 30000);
    return () => {
      console.log("🟢 HealthcareIntegration cleanup");
      clearInterval(interval);
    };
  }, [user?.accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHospitals = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setIsRefreshing(true);

      console.log("🏥 HealthcareIntegration: Loading hospitals...");
      const data = await getHospitals();
      console.log("✅ HealthcareIntegration: Loaded", data?.hospitals?.length || 0, "hospitals");
      setHospitals(data?.hospitals || []);
    } catch (error: any) {
      console.error("❌ HealthcareIntegration: Failed to load hospitals:", error.message);
      if (!silent) {
        toast.error("Failed to load hospital data", {
          description: error.message || "Could not connect to server",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleOpenUpdateDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setUpdateFormData({
      availableBeds: hospital.availableBeds,
      emergencyCapacity: hospital.emergencyCapacity,
      icuCapacity: hospital.icuCapacity,
      status: hospital.status
    });
    setUpdateDialogOpen(true);
  };

  const handleUpdateCapacity = async () => {
    if (!selectedHospital || !user?.accessToken) return;

    try {
      await updateHospitalCapacity(user.accessToken, selectedHospital.id, updateFormData);
      
      // Update local state
      setHospitals(prev => 
        prev.map(h => 
          h.id === selectedHospital.id 
            ? { ...h, ...updateFormData, updated_at: new Date().toISOString() }
            : h
        )
      );

      toast.success("Hospital capacity updated", {
        description: `${selectedHospital.name} information has been updated`,
      });

      setUpdateDialogOpen(false);
    } catch (error) {
      console.error("Failed to update hospital:", error);
      toast.error("Update failed", {
        description: "Could not update hospital capacity",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "border-green-300 text-green-700 bg-green-50";
      case "overwhelmed": return "border-orange-300 text-orange-700 bg-orange-50";
      case "offline": return "border-red-300 text-red-700 bg-red-50";
      default: return "border-gray-300 text-gray-700 bg-gray-50";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  };

  const handleCallHospital = (hospital: Hospital) => {
    try {
      makePhoneCall(hospital.contact, hospital.name);
      toast.success(`Calling ${hospital.name}`);
    } catch (error) {
      toast.error("Failed to make call");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Healthcare Integration</h2>
          <p className="text-gray-600">
            Hospital bed capacity tracking and citizen hospital locator for effective medical response coordination
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadHospitals()}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hospitals Online</p>
                <p className="text-3xl font-bold text-green-600">
                  {hospitals.filter(h => h.status === "operational").length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Of {hospitals.length} total</p>
              </div>
              <Heart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Beds</p>
                <p className="text-3xl font-bold text-blue-600">
                  {hospitals.reduce((sum, h) => sum + h.availableBeds, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Of {hospitals.reduce((sum, h) => sum + h.totalBeds, 0)} total
                </p>
              </div>
              <Bed className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ICU Capacity</p>
                <p className="text-3xl font-bold text-purple-600">
                  {hospitals.reduce((sum, h) => sum + h.icuCapacity, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Critical care beds</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Emergency Capacity</p>
                <p className="text-3xl font-bold text-orange-600">
                  {hospitals.reduce((sum, h) => sum + h.emergencyCapacity, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">ER beds available</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hospital List */}
      <div className="space-y-4">
        {hospitals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hospital data available</p>
            </CardContent>
          </Card>
        ) : (
          hospitals.map((hospital) => (
            <Card key={hospital.id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{hospital.name}</h3>
                        <Badge variant="outline" className={getStatusColor(hospital.status)}>
                          {hospital.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{hospital.location}</span>
                        <span>•</span>
                        <Phone className="h-4 w-4" />
                        <span>{hospital.contact}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {getRelativeTime(hospital.updated_at)}
                      </p>
                    </div>
                  </div>

                  {/* Bed Capacity */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Regular Beds</span>
                        <span className="text-sm font-bold">
                          {hospital.availableBeds} / {hospital.totalBeds}
                        </span>
                      </div>
                      <Progress 
                        value={(hospital.availableBeds / hospital.totalBeds) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">ICU Beds</span>
                        <span className="text-sm font-bold">
                          {hospital.icuCapacity}
                        </span>
                      </div>
                      <Progress 
                        value={hospital.icuCapacity > 0 ? 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Emergency</span>
                        <span className="text-sm font-bold">
                          {hospital.emergencyCapacity}
                        </span>
                      </div>
                      <Progress 
                        value={hospital.emergencyCapacity > 0 ? 100 : 0}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCallHospital(hospital)}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call Hospital
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenUpdateDialog(hospital)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Update Capacity
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Capacity Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Hospital Capacity</DialogTitle>
            <DialogDescription>
              Update bed availability for {selectedHospital?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="availableBeds">Available Beds</Label>
              <Input
                id="availableBeds"
                type="number"
                min="0"
                value={updateFormData.availableBeds}
                onChange={(e) => setUpdateFormData(prev => ({
                  ...prev,
                  availableBeds: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyCapacity">Emergency Capacity</Label>
              <Input
                id="emergencyCapacity"
                type="number"
                min="0"
                value={updateFormData.emergencyCapacity}
                onChange={(e) => setUpdateFormData(prev => ({
                  ...prev,
                  emergencyCapacity: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icuCapacity">ICU Capacity</Label>
              <Input
                id="icuCapacity"
                type="number"
                min="0"
                value={updateFormData.icuCapacity}
                onChange={(e) => setUpdateFormData(prev => ({
                  ...prev,
                  icuCapacity: parseInt(e.target.value) || 0
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCapacity}>
              Update Capacity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}