import { useState, useEffect } from "react";
import { Cloud, Wind, Droplets, Thermometer, Activity, AlertTriangle, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface DisasterMonitoringProps {
  user: any;
}

export function DisasterMonitoring({ user }: DisasterMonitoringProps) {
  console.log("🟢 DisasterMonitoring component mounting. User:", {
    name: user?.name,
    hasToken: !!user?.accessToken
  });

  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 85,
    windSpeed: 45,
    rainfall: 120,
    pressure: 1008
  });

  const [seismicActivity, setSeismicActivity] = useState([
    { id: 1, magnitude: 3.2, location: "Manila Bay", depth: 15, time: "2 hours ago", status: "normal" },
    { id: 2, magnitude: 2.8, location: "Quezon City", depth: 10, time: "5 hours ago", status: "normal" },
  ]);

  const [floodLevels, setFloodLevels] = useState([
    { id: 1, location: "Pasig River", level: 12.5, critical: 15, status: "warning" },
    { id: 2, location: "Marikina River", level: 14.8, critical: 16, status: "critical" },
    { id: 3, location: "Taguig Creek", level: 8.2, critical: 12, status: "normal" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "warning": return "text-orange-600 bg-orange-50 border-orange-200";
      case "normal": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getFloodProgress = (level: number, critical: number) => {
    return (level / critical) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Real-time Disaster Monitoring</h2>
        <p className="text-gray-600">
          Centralized monitoring of weather conditions, seismic activity, and flooding levels across NCR
        </p>
      </div>

      <Tabs defaultValue="weather">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="seismic">Seismic</TabsTrigger>
          <TabsTrigger value="flooding">Flooding</TabsTrigger>
        </TabsList>

        {/* Weather Monitoring */}
        <TabsContent value="weather" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <Badge variant="outline">Live</Badge>
                </div>
                <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-xs text-gray-600">Temperature</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <Badge variant="outline">Live</Badge>
                </div>
                <p className="text-2xl font-bold">{weatherData.humidity}%</p>
                <p className="text-xs text-gray-600">Humidity</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wind className="h-5 w-5 text-purple-500" />
                  <Badge variant="outline" className="border-orange-300 text-orange-700">Warning</Badge>
                </div>
                <p className="text-2xl font-bold">{weatherData.windSpeed} km/h</p>
                <p className="text-xs text-gray-600">Wind Speed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Cloud className="h-5 w-5 text-gray-500" />
                  <Badge variant="outline" className="border-red-300 text-red-700">Critical</Badge>
                </div>
                <p className="text-2xl font-bold">{weatherData.rainfall} mm</p>
                <p className="text-xs text-gray-600">Rainfall (24h)</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  <Badge variant="outline">Live</Badge>
                </div>
                <p className="text-2xl font-bold">{weatherData.pressure} hPa</p>
                <p className="text-xs text-gray-600">Pressure</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PAGASA Weather Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Enhanced Southwest Monsoon (Habagat)</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Heavy to intense rainfall expected over Metro Manila and nearby provinces. 
                      Flooding and landslides possible in low-lying and mountainous areas.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Valid until 8:00 PM today</Badge>
                      <Badge variant="outline">Signal No. 2</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seismic Monitoring */}
        <TabsContent value="seismic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Seismic Activity - PHIVOLCS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seismicActivity.map((quake) => (
                  <div key={quake.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-2xl font-bold">M {quake.magnitude}</p>
                          <Badge className={getStatusColor(quake.status)}>{quake.status}</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{quake.location}</span>
                          </div>
                          <p className="text-sm text-gray-600">Depth: {quake.depth} km</p>
                          <p className="text-xs text-gray-500">{quake.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flood Monitoring */}
        <TabsContent value="flooding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Water Level Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {floodLevels.map((flood) => (
                  <div key={flood.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{flood.location}</p>
                        <p className="text-sm text-gray-600">
                          {flood.level}m / {flood.critical}m (critical level)
                        </p>
                      </div>
                      <Badge className={getStatusColor(flood.status)}>
                        {flood.status.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress value={getFloodProgress(flood.level, flood.critical)} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}