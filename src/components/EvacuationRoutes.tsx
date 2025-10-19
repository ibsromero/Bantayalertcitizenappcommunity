import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { makePhoneCall } from "../utils/phoneUtils";
import { getCurrentLocation, isGeolocationAvailable } from "../utils/geolocationUtils";
import { 
  getNearestEvacuationCenters, 
  getEvacuationDirectionsUrl,
  type EvacuationCenter 
} from "../utils/evacuationUtils";
import { getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";

interface EvacuationRoutesProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function EvacuationRoutes({ user }: EvacuationRoutesProps) {
  const [selectedShelter, setSelectedShelter] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestCenters, setNearestCenters] = useState<(EvacuationCenter & { distance: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>("");

  useEffect(() => {
    // Try to load saved location first
    const savedCoords = getFromStorage<{ lat: number; lng: number } | null>("LOCATION_COORDS");
    if (savedCoords) {
      setUserLocation(savedCoords);
      updateNearestCenters(savedCoords);
    } else {
      // Set default location to Manila City Hall
      const defaultLocation = { lat: 14.5906, lng: 120.9794 };
      setUserLocation(defaultLocation);
      updateNearestCenters(defaultLocation);
      
      // Try to auto-detect in background
      if (isGeolocationAvailable()) {
        detectUserLocation();
      }
    }
  }, []);

  const detectUserLocation = async () => {
    if (!isGeolocationAvailable()) {
      toast.info("Geolocation not available", {
        description: "Showing evacuation centers from Manila area",
      });
      return;
    }

    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      setUserLocation(coords);
      updateNearestCenters(coords);
      
      toast.success("Location detected", {
        description: "Showing evacuation centers near you",
      });
    } catch (error) {
      toast.info("Location access denied", {
        description: "Showing evacuation centers from Manila area",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNearestCenters = (coords: { lat: number; lng: number }) => {
    const nearest = getNearestEvacuationCenters(coords.lat, coords.lng, 5);
    setNearestCenters(nearest);
    
    // Update map URL
    if (nearest.length > 0) {
      const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${nearest[0].lat},${nearest[0].lng}&center=${coords.lat},${coords.lng}&zoom=12`;
      setMapUrl(mapEmbedUrl);
    }
  };

  const handleGetDirections = (center: EvacuationCenter) => {
    if (!userLocation) {
      toast.error("Location not available", {
        description: "Please enable location services",
      });
      return;
    }

    const directionsUrl = getEvacuationDirectionsUrl(
      userLocation.lat,
      userLocation.lng,
      center.lat,
      center.lng
    );
    
    window.open(directionsUrl, '_blank');
    
    toast.success("Opening directions", {
      description: `Navigating to ${center.name}`,
    });

    logActivity("evacuation_viewed", `Viewed directions to ${center.name}`, user?.accessToken);
  };

  const handleCall = (name: string, phone: string) => {
    makePhoneCall(phone, name);
    toast.success(`Calling ${name}`, {
      description: phone,
    });
  };

  const handleRefreshLocation = () => {
    detectUserLocation();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Evacuation Routes</h1>
        <div className="flex items-center space-x-2">
          {userLocation && (
            <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs">
              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshLocation}
            disabled={loading}
            className="touch-manipulation min-h-[36px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          {userLocation && nearestCenters.length > 0 ? (
            <div className="relative bg-gray-100 h-64 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestCenters[0].lat},${nearestCenters[0].lng}&mode=driving`}
              />
            </div>
          ) : (
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 h-64 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                {loading ? (
                  <>
                    <Loader2 className="h-12 w-12 mx-auto text-blue-600 mb-2 animate-spin" />
                    <p className="text-gray-700 font-medium">Detecting your location...</p>
                  </>
                ) : (
                  <>
                    <MapPin className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                    <p className="text-gray-700 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-600">Enable location to view nearby routes</p>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Important Reminder</h3>
              <p className="text-sm text-orange-700 mt-1">
                Always follow local government evacuation orders. Bring your emergency kit and important documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearest Evacuation Centers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Nearest Evacuation Centers</h2>
          {userLocation && (
            <Badge variant="secondary" className="text-xs">
              Top 5 Nearest
            </Badge>
          )}
        </div>
        
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Loading evacuation centers...</p>
            </CardContent>
          </Card>
        ) : nearestCenters.length > 0 ? (
          nearestCenters.map((center) => (
            <Card
              key={center.id}
              className={`cursor-pointer transition-all ${
                selectedShelter === center.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedShelter(center.id)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{center.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {center.city}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                      {center.distance.toFixed(1)} km
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {center.facilities.map((facility, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Capacity: {center.capacity}</span>
                    <span>{center.phone}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 touch-manipulation min-h-[40px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirections(center);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="touch-manipulation min-h-[40px] min-w-[60px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCall(center.name, center.phone);
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">No evacuation centers found</p>
              <p className="text-sm text-gray-500 mt-1">Try enabling location services</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
