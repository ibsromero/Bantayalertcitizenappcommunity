/**
 * Geolocation Utilities for BantayAlert
 * Handles location detection and distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error("Geolocation not available"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // Don't log geolocation errors to console as they're expected when permission is denied
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
    Math.cos(toRad(coord2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * NCR City coordinates for location detection
 */
export const NCR_CITIES: Record<string, Coordinates> = {
  Manila: { latitude: 14.5995, longitude: 120.9842 },
  "Quezon City": { latitude: 14.6760, longitude: 121.0437 },
  Caloocan: { latitude: 14.6488, longitude: 120.9830 },
  "Las Piñas": { latitude: 14.4453, longitude: 120.9820 },
  Makati: { latitude: 14.5547, longitude: 121.0244 },
  Malabon: { latitude: 14.6620, longitude: 120.9570 },
  Mandaluyong: { latitude: 14.5794, longitude: 121.0359 },
  Marikina: { latitude: 14.6507, longitude: 121.1029 },
  Muntinlupa: { latitude: 14.3816, longitude: 121.0419 },
  Navotas: { latitude: 14.6620, longitude: 120.9401 },
  Parañaque: { latitude: 14.4793, longitude: 121.0198 },
  Pasay: { latitude: 14.5378, longitude: 121.0014 },
  Pasig: { latitude: 14.5764, longitude: 121.0851 },
  Pateros: { latitude: 14.5433, longitude: 121.0685 },
  "San Juan": { latitude: 14.6019, longitude: 121.0355 },
  Taguig: { latitude: 14.5176, longitude: 121.0509 },
  Valenzuela: { latitude: 14.6991, longitude: 120.9830 },
};

/**
 * Detect nearest NCR city based on coordinates
 */
export function getNearestCity(userLocation: Coordinates): string {
  let nearestCity = "Manila";
  let shortestDistance = Infinity;

  Object.entries(NCR_CITIES).forEach(([city, coords]) => {
    const distance = calculateDistance(userLocation, coords);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestCity = city;
    }
  });

  return nearestCity;
}

/**
 * Get directions URL to a location
 */
export function getDirectionsUrl(destination: string, destinationCoords?: Coordinates): string {
  if (destinationCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destinationCoords.latitude},${destinationCoords.longitude}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return 'geolocation' in navigator;
}