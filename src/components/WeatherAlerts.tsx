import { useState, useEffect } from "react";
import { AlertTriangle, Cloud, Wind, Thermometer, MapPin, Clock, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { LocationSettingsDialog } from "./LocationSettingsDialog";
import { AlertSettingsDialog } from "./AlertSettingsDialog";
import { getCurrentLocation, getNearestCity, isGeolocationAvailable } from "../utils/geolocationUtils";
import { requestNotificationPermission, sendWeatherAlert, areNotificationsEnabled } from "../utils/notificationUtils";
import { saveToStorage, getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";
import { saveUserData, getUserData } from "../utils/supabaseClient";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WeatherAlertsProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function WeatherAlerts({ user }: WeatherAlertsProps) {
  const [currentLocation, setCurrentLocation] = useState(() => {
    return getFromStorage<string>("LOCATION") || "Manila";
  });
  const [currentCoords, setCurrentCoords] = useState(() => {
    return getFromStorage<{ lat: number; lng: number } | null>("LOCATION_COORDS") || null;
  });
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check notification status
    setNotificationsEnabled(areNotificationsEnabled());
    
    // Save location whenever it changes
    saveToStorage("LOCATION", currentLocation);
    if (currentCoords) {
      saveToStorage("LOCATION_COORDS", currentCoords);
    }

    // Sync to cloud
    if (user?.accessToken) {
      saveUserData("location", { city: currentLocation, coords: currentCoords }, user.accessToken);
    }
  }, [currentLocation, currentCoords, user?.accessToken]);

  const handleDetectLocation = async () => {
    if (!isGeolocationAvailable()) {
      toast.error("Geolocation not available", {
        description: "Your browser doesn't support location detection",
      });
      return;
    }

    try {
      toast.info("Detecting location...", {
        description: "Please allow location access",
      });

      const coords = await getCurrentLocation();
      const nearestCity = getNearestCity(coords);
      
      setCurrentLocation(nearestCity);
      setCurrentCoords(coords);
      
      toast.success("Location detected", {
        description: `Set to ${nearestCity}, NCR (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      });

      logActivity("location_updated", `Location set to ${nearestCity}`, user?.accessToken);
    } catch (error) {
      toast.error("Location detection failed", {
        description: "Please enable location services or select manually",
      });
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      setNotificationsEnabled(true);
      toast.success("Notifications enabled", {
        description: "You'll receive weather alerts from PAGASA",
      });
      
      // Send a test notification
      sendWeatherAlert(
        "Weather Alerts Active",
        "You will now receive important weather updates",
        "low"
      );

      logActivity("alert_enabled", "Enabled weather notifications", user?.accessToken);
    } else {
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser settings",
      });
    }
  };
  const currentAlerts = [
    {
      id: 1,
      type: "Heavy Rainfall Warning - Southwest Monsoon",
      severity: "high",
      description: "Enhanced southwest monsoon (Habagat) bringing heavy to intense rainfall over Metro Manila.",
      location: "NCR, Metro Manila",
      startTime: "2:30 PM",
      endTime: "8:00 PM",
      instructions: "Stay indoors. Monitor flood-prone areas. Avoid unnecessary travel. Follow PAGASA updates.",
      icon: Cloud,
      color: "orange"
    },
    {
      id: 2,
      type: "Thunderstorm Advisory",
      severity: "medium",
      description: "Moderate to heavy rainshowers with lightning and strong winds affecting NCR.",
      location: "Metro Manila",
      startTime: "6:00 PM",
      endTime: "11:00 PM",
      instructions: "Avoid open areas and tall objects. Unplug electrical appliances. Stay away from windows.",
      icon: Wind,
      color: "blue"
    }
  ];

  const weatherData = {
    current: {
      temp: 28,
      condition: "Partly Cloudy",
      humidity: 75,
      windSpeed: 15,
      pressure: 1010
    },
    forecast: [
      { day: "Today", high: 32, low: 26, condition: "Thunderstorms", icon: "⛈️" },
      { day: "Tomorrow", high: 31, low: 25, condition: "Rainy", icon: "🌧️" },
      { day: "Wednesday", high: 30, low: 24, condition: "Cloudy", icon: "☁️" },
      { day: "Thursday", high: 33, low: 26, condition: "Partly Sunny", icon: "⛅" }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-300 bg-red-50 text-red-900";
      case "medium": return "border-orange-300 bg-orange-50 text-orange-900";
      case "low": return "border-yellow-300 bg-yellow-50 text-yellow-900";
      default: return "border-gray-300 bg-gray-50 text-gray-900";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const handleRefresh = () => {
    toast.success("Weather data refreshed", {
      description: "Updated at " + new Date().toLocaleTimeString(),
    });
  };

  const handleCustomizeAlerts = () => {
    setShowAlertDialog(true);
  };

  const handleUpdateLocation = () => {
    setShowLocationDialog(true);
  };

  const handleSaveLocation = (location: string) => {
    setCurrentLocation(location);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Weather Alerts</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              {currentLocation}
            </Badge>
            <Badge variant="outline" className="text-red-700 border-red-300">
              {currentAlerts.length} Active
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="touch-manipulation min-h-[36px]"
            onClick={handleDetectLocation}
          >
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">Detect Location</span>
          </Button>
          
          {!notificationsEnabled && (
            <Button
              size="sm"
              variant="outline"
              className="touch-manipulation min-h-[36px] border-orange-300 text-orange-700"
              onClick={handleEnableNotifications}
            >
              <Bell className="h-4 w-4 mr-2" />
              <span className="text-xs sm:text-sm">Enable Alerts</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-3">
        {currentAlerts.map((alert) => (
          <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <alert.icon className="h-5 w-5" />
                  <span className="text-base">{alert.type}</span>
                </div>
                <Badge variant={getSeverityBadge(alert.severity) as any}>
                  {alert.severity.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{alert.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{alert.startTime} - {alert.endTime}</span>
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Safety Instructions:</h4>
                <p className="text-sm">{alert.instructions}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Weather</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="touch-manipulation min-h-[36px] active:scale-95 transition-transform"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1695029806743-ccf34e57a2a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXZlcmUlMjB3ZWF0aGVyJTIwc3Rvcm0lMjB3YXJuaW5nfGVufDF8fHx8MTc1OTc2NTY2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Current Weather"
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold">{weatherData.current.temp}°C</h3>
            <p className="text-gray-600">{weatherData.current.condition}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-gray-500" />
              <span>Humidity: {weatherData.current.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span>Wind: {weatherData.current.windSpeed} km/h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>4-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="text-center p-2 rounded-lg bg-gray-50">
                <p className="text-xs font-medium">{day.day}</p>
                <div className="text-lg my-1">{day.icon}</div>
                <p className="text-xs text-gray-600">{day.condition}</p>
                <p className="text-xs font-medium">{day.high}°/{day.low}°</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2">Alert Settings</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px] active:scale-95 transition-transform"
              onClick={handleCustomizeAlerts}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Customize Alert Types</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px] active:scale-95 transition-transform"
              onClick={handleUpdateLocation}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Update Location</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <LocationSettingsDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onSave={handleSaveLocation}
      />
      <AlertSettingsDialog
        isOpen={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
      />
    </div>
  );
}