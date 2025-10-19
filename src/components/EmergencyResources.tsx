import { useState, useEffect } from "react";
import { Phone, FileText, Users, Radio, ExternalLink, Download, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { makePhoneCall } from "../utils/phoneUtils";
import { 
  downloadTyphoonGuide, 
  downloadEarthquakeGuide, 
  downloadFloodGuide, 
  downloadFireGuide 
} from "../utils/pdfUtils";
import { getFromStorage } from "../utils/storageUtils";
import { logActivity } from "../utils/activityUtils";

interface EmergencyResourcesProps {
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function EmergencyResources({ user }: EmergencyResourcesProps) {
  const [currentLocation, setCurrentLocation] = useState(() => {
    return getFromStorage<string>("LOCATION") || "Manila";
  });

  useEffect(() => {
    // Update location from storage when it changes
    const location = getFromStorage<string>("LOCATION") || "Manila";
    setCurrentLocation(location);
  }, []);
  const emergencyNumbers = [
    { name: "National Emergency Hotline", number: "911", available: "24/7" },
    { name: "NDRRMC", number: "(02) 8911-1406", available: "24/7" },
    { name: "Philippine Red Cross", number: "143", available: "24/7" },
    { name: "PAGASA Weather", number: "(02) 8284-0800", available: "24/7" },
    { name: "PHIVOLCS", number: "(02) 8426-1468", available: "Office Hours" },
    { name: "Manila Disaster Risk Reduction", number: "(02) 8527-5174", available: "24/7" },
  ];

  const guides = [
    {
      title: "Typhoon Preparedness Guide",
      description: "Essential steps before, during, and after a typhoon",
      category: "Weather",
      downloadFn: downloadTyphoonGuide,
    },
    {
      title: "Earthquake Safety Protocol",
      description: "Drop, Cover, and Hold On techniques and procedures",
      category: "Seismic",
      downloadFn: downloadEarthquakeGuide,
    },
    {
      title: "Flood Response Guide",
      description: "What to do during flash floods and heavy rainfall",
      category: "Weather",
      downloadFn: downloadFloodGuide,
    },
    {
      title: "Fire Safety & Prevention",
      description: "Fire safety tips and evacuation procedures",
      category: "Safety",
      downloadFn: downloadFireGuide,
    },
  ];

  // Community resources based on location
  const getCommunityResources = (location: string) => {
    const resourcesByCity: { [key: string]: any[] } = {
      "Manila": [
        {
          name: "Manila City Government - DRRM Office",
          address: "Manila City Hall, Arroceros St, Ermita, Manila",
          lat: 14.5906,
          lng: 120.9794,
          services: ["Emergency Response", "Evacuation Support", "Relief Goods"],
        },
        {
          name: "Philippine Red Cross - Manila Chapter",
          address: "Bonifacio Drive, Port Area, Manila",
          lat: 14.5857,
          lng: 120.9747,
          services: ["Medical Aid", "Blood Services", "Disaster Response"],
        },
        {
          name: "Manila Disaster Risk Reduction Office",
          address: "City Hall Compound, Manila",
          lat: 14.5906,
          lng: 120.9794,
          services: ["Emergency Coordination", "Relief Distribution"],
        },
      ],
      "Quezon City": [
        {
          name: "Quezon City DRRM Office",
          address: "Quezon City Hall, Elliptical Rd, Diliman",
          lat: 14.6507,
          lng: 121.0494,
          services: ["Emergency Response", "Evacuation Support", "Relief Goods"],
        },
        {
          name: "Philippine Red Cross - QC Chapter",
          address: "Boni Serrano Ave, Quezon City",
          lat: 14.6091,
          lng: 121.0223,
          services: ["Medical Aid", "Blood Services", "Disaster Response"],
        },
      ],
      "Makati": [
        {
          name: "Makati DRRM Office",
          address: "Makati City Hall, J.P. Rizal Ave",
          lat: 14.5547,
          lng: 121.0244,
          services: ["Emergency Response", "Evacuation Support"],
        },
      ],
      "Pasig": [
        {
          name: "Pasig DRRM Office",
          address: "Pasig City Hall, Caruncho Ave",
          lat: 14.5764,
          lng: 121.0851,
          services: ["Emergency Response", "Evacuation Support"],
        },
      ],
    };

    return resourcesByCity[location] || resourcesByCity["Manila"];
  };

  const communityResources = getCommunityResources(currentLocation);

  const handleCall = (name: string, number: string) => {
    makePhoneCall(number, name);
    toast.success(`Calling ${name}`, {
      description: number,
    });
  };

  const handleDownload = (guide: any) => {
    guide.downloadFn();
    toast.success("Guide downloaded", {
      description: `${guide.title} saved to your downloads`,
    });
    
    logActivity("resource_downloaded", `Downloaded ${guide.title}`, user?.accessToken);
  };

  const handleOpenWebsite = (name: string, url: string) => {
    window.open(url, '_blank');
    toast.info(`Opening ${name}`, {
      description: url,
    });
  };

  const handleViewResource = (resource: any) => {
    // Open Google Maps with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${resource.lat},${resource.lng}&destination_place_id=${encodeURIComponent(resource.name)}`;
    window.open(mapsUrl, '_blank');
    
    toast.success("Opening in Google Maps", {
      description: `Getting directions to ${resource.name}`,
    });
    
    logActivity("evacuation_viewed", `Viewed ${resource.name}`, user?.accessToken);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Emergency Resources</h1>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          {currentLocation}, NCR
        </Badge>
      </div>

      {/* Emergency Hotlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Hotlines</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {emergencyNumbers.map((contact, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.number}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {contact.available}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="touch-manipulation min-h-[36px]"
                  onClick={() => handleCall(contact.name, contact.number)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Guides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Emergency Guides</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {guides.map((guide, index) => (
            <div key={index} className="p-3 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{guide.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {guide.category}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 touch-manipulation min-h-[40px]"
                  onClick={() => handleDownload(guide)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Guide
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Community Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Community Resources</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {communityResources.map((resource, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <h4 className="font-medium">{resource.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{resource.address}</p>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {resource.services.map((service, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full touch-manipulation min-h-[40px]"
                onClick={() => handleViewResource(resource)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Official Links */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
            <Radio className="h-4 w-4" />
            <span>Official Government Resources</span>
          </h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px]"
              onClick={() => handleOpenWebsite("NDRRMC", "https://www.ndrrmc.gov.ph")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              NDRRMC - www.ndrrmc.gov.ph
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px]"
              onClick={() => handleOpenWebsite("PAGASA", "https://www.pagasa.dost.gov.ph")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              PAGASA - www.pagasa.dost.gov.ph
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-blue-300 touch-manipulation min-h-[44px]"
              onClick={() => handleOpenWebsite("PHIVOLCS", "https://www.phivolcs.dost.gov.ph")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              PHIVOLCS - www.phivolcs.dost.gov.ph
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
