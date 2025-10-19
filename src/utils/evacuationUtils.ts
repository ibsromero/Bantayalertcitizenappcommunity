/**
 * Evacuation utilities for calculating nearest centers and getting directions
 */

// NCR evacuation centers with accurate coordinates
export interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: string;
  phone: string;
  facilities: string[];
  city: string;
}

// Real evacuation centers in NCR with accurate coordinates
export const NCR_EVACUATION_CENTERS: EvacuationCenter[] = [
  {
    id: 1,
    name: "Rizal Memorial Sports Complex",
    address: "Pablo Ocampo Sr. Ave, Malate, Manila",
    lat: 14.5653,
    lng: 120.9934,
    capacity: "5,000 persons",
    phone: "(02) 8523-7453",
    facilities: ["Medical Station", "Food Distribution", "Restrooms"],
    city: "Manila"
  },
  {
    id: 2,
    name: "Manila City Hall",
    address: "Arroceros St, Ermita, Manila",
    lat: 14.5906,
    lng: 120.9794,
    capacity: "3,000 persons",
    phone: "(02) 8527-5174",
    facilities: ["Emergency Services", "Communication Center"],
    city: "Manila"
  },
  {
    id: 3,
    name: "University of the Philippines Manila",
    address: "Pedro Gil St, Ermita, Manila",
    lat: 14.5793,
    lng: 120.9856,
    capacity: "8,000 persons",
    phone: "(02) 8526-4252",
    facilities: ["Medical Facility", "Large Capacity", "Security"],
    city: "Manila"
  },
  {
    id: 4,
    name: "Quezon City Hall",
    address: "Elliptical Rd, Diliman, Quezon City",
    lat: 14.6507,
    lng: 121.0494,
    capacity: "6,000 persons",
    phone: "(02) 8988-4242",
    facilities: ["Medical Station", "Emergency Services", "Food Distribution"],
    city: "Quezon City"
  },
  {
    id: 5,
    name: "Amoranto Sports Complex",
    address: "Amoranto Ave, Quezon City",
    lat: 14.6234,
    lng: 121.0131,
    capacity: "4,000 persons",
    phone: "(02) 8924-7032",
    facilities: ["Sports Facility", "Large Open Space", "Medical Aid"],
    city: "Quezon City"
  },
  {
    id: 6,
    name: "Makati City Hall",
    address: "J.P. Rizal Ave, Makati",
    lat: 14.5547,
    lng: 121.0244,
    capacity: "3,500 persons",
    phone: "(02) 8870-1234",
    facilities: ["Emergency Response", "Medical Station"],
    city: "Makati"
  },
  {
    id: 7,
    name: "Pasig City Sports Center",
    address: "Emerald Ave, Pasig",
    lat: 14.5764,
    lng: 121.0851,
    capacity: "5,500 persons",
    phone: "(02) 8643-0000",
    facilities: ["Sports Complex", "Food Distribution", "Restrooms"],
    city: "Pasig"
  },
  {
    id: 8,
    name: "Marikina Sports Center",
    address: "Sumulong Highway, Marikina",
    lat: 14.6507,
    lng: 121.1029,
    capacity: "4,500 persons",
    phone: "(02) 8646-1774",
    facilities: ["Large Capacity", "Medical Station", "Security"],
    city: "Marikina"
  },
  {
    id: 9,
    name: "Taguig City Hall",
    address: "Levi Mariano Ave, Taguig",
    lat: 14.5176,
    lng: 121.0509,
    capacity: "3,000 persons",
    phone: "(02) 8789-3200",
    facilities: ["Emergency Services", "Communication Center"],
    city: "Taguig"
  },
  {
    id: 10,
    name: "Parañaque City Hall",
    address: "Osmena St, Parañaque",
    lat: 14.4793,
    lng: 121.0198,
    capacity: "3,500 persons",
    phone: "(02) 8820-9354",
    facilities: ["Medical Station", "Food Distribution"],
    city: "Parañaque"
  },
  {
    id: 11,
    name: "Caloocan City Hall",
    address: "A. Mabini St, Caloocan",
    lat: 14.6569,
    lng: 120.9819,
    capacity: "4,000 persons",
    phone: "(02) 8288-8181",
    facilities: ["Emergency Response", "Large Capacity"],
    city: "Caloocan"
  },
  {
    id: 12,
    name: "Las Piñas City Sports Complex",
    address: "Real St, Las Piñas",
    lat: 14.4453,
    lng: 120.9831,
    capacity: "3,500 persons",
    phone: "(02) 8801-6243",
    facilities: ["Sports Facility", "Medical Aid"],
    city: "Las Piñas"
  },
  {
    id: 13,
    name: "Muntinlupa Sports Complex",
    address: "National Rd, Muntinlupa",
    lat: 14.4089,
    lng: 121.0424,
    capacity: "3,000 persons",
    phone: "(02) 8862-5816",
    facilities: ["Sports Complex", "Security"],
    city: "Muntinlupa"
  },
  {
    id: 14,
    name: "Pasay City Sports Complex",
    address: "Harrison Plaza vicinity, Pasay",
    lat: 14.5378,
    lng: 121.0014,
    capacity: "4,000 persons",
    phone: "(02) 8834-4000",
    facilities: ["Large Capacity", "Food Distribution"],
    city: "Pasay"
  },
  {
    id: 15,
    name: "Mandaluyong City Hall",
    address: "Maysilo Circle, Mandaluyong",
    lat: 14.5794,
    lng: 121.0359,
    capacity: "2,500 persons",
    phone: "(02) 8532-2196",
    facilities: ["Emergency Services", "Medical Station"],
    city: "Mandaluyong"
  }
];

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get nearest evacuation centers based on user's location
 */
export function getNearestEvacuationCenters(
  userLat: number,
  userLng: number,
  limit: number = 5
): (EvacuationCenter & { distance: number })[] {
  const centersWithDistance = NCR_EVACUATION_CENTERS.map(center => ({
    ...center,
    distance: calculateDistance(userLat, userLng, center.lat, center.lng)
  }));

  return centersWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Get Google Maps directions URL
 */
export function getEvacuationDirectionsUrl(
  userLat: number,
  userLng: number,
  centerLat: number,
  centerLng: number
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${centerLat},${centerLng}&travelmode=driving`;
}

/**
 * Get Google Maps URL for embedding
 */
export function getEmbedMapUrl(
  userLat: number,
  userLng: number,
  centers: (EvacuationCenter & { distance: number })[]
): string {
  const markers = centers
    .map(c => `markers=color:red%7Clabel:E%7C${c.lat},${c.lng}`)
    .join('&');
  
  return `https://www.google.com/maps/embed/v1/directions?key=YOUR_API_KEY&origin=${userLat},${userLng}&destination=${centers[0]?.lat},${centers[0]?.lng}&${markers}`;
}
