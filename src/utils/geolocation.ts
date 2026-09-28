// ==============================================================================
// NETSENSE CAMPUS - REAL HARDWARE GEOLOCATION & TRACKING SERVICE
// Zero hardcoded/mocked coordinates. Direct browser Geolocation API integration.
// ==============================================================================

import { CampusLocation } from '../types';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationMatchResult {
  location: CampusLocation;
  distanceMeters: number;
  isWithinCampusRange: boolean;
}

/**
 * Standard High-Accuracy Geolocation options required by NetSense
 */
export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export type LocationStatus =
  | 'PERMISSION_REQUIRED'
  | 'SEARCHING'
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'TRACKING'
  | 'PERMISSION_DENIED'
  | 'UNAVAILABLE'
  | 'TIMEOUT';

export interface LocationResult {
  status: LocationStatus;
  coords: GPSCoordinates | null;
  error: string | null;
}

/**
 * Calculates distance in meters between two lat/lon coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Queries the device's real coordinates once via navigator.geolocation.getCurrentPosition()
 * Uses enableHighAccuracy: true, timeout: 15000, maximumAge: 0
 */
export async function getExactDeviceCoordinates(): Promise<LocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return {
      status: 'UNAVAILABLE',
      coords: null,
      error: 'Geolocation API is not supported by this browser/device.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          status: 'ACTIVE',
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: Math.round(pos.coords.accuracy),
            timestamp: new Date(pos.timestamp).toISOString(),
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
          error: null,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          resolve({
            status: 'PERMISSION_DENIED',
            coords: null,
            error: 'Location permission denied. Please allow location access in your browser/device settings.',
          });
        } else if (err.code === err.TIMEOUT) {
          resolve({
            status: 'TIMEOUT',
            coords: null,
            error: 'Location request timed out. Unable to acquire GPS satellite fix within 15 seconds.',
          });
        } else {
          resolve({
            status: 'UNAVAILABLE',
            coords: null,
            error: 'Unable to obtain your current location.',
          });
        }
      },
      GEOLOCATION_OPTIONS
    );
  });
}

/**
 * Starts continuous real-time device location tracking via navigator.geolocation.watchPosition()
 * Returns watchId for cancellation.
 */
export function startDeviceLocationWatch(
  onUpdate: (coords: GPSCoordinates) => void,
  onError: (result: LocationResult) => void
): number | null {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError({
      status: 'UNAVAILABLE',
      coords: null,
      error: 'Geolocation is not supported by your browser.',
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyMeters: Math.round(pos.coords.accuracy),
        timestamp: new Date(pos.timestamp).toISOString(),
        altitude: pos.coords.altitude,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      });
    },
    (err) => {
      if (err.code === err.PERMISSION_DENIED) {
        onError({
          status: 'PERMISSION_DENIED',
          coords: null,
          error: 'Location permission denied. Please allow location access in your browser/device settings.',
        });
      } else if (err.code === err.TIMEOUT) {
        onError({
          status: 'TIMEOUT',
          coords: null,
          error: 'GPS satellite positioning timed out during active tracking.',
        });
      } else {
        onError({
          status: 'UNAVAILABLE',
          coords: null,
          error: 'Unable to obtain your current location.',
        });
      }
    },
    GEOLOCATION_OPTIONS
  );
}

/**
 * Stops continuous real-time device tracking via navigator.geolocation.clearWatch()
 */
export function stopDeviceLocationWatch(watchId: number): void {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Finds the closest campus building matching user's real coordinates
 */
export function findClosestCampusLocation(
  coords: { latitude: number; longitude: number },
  locations: CampusLocation[]
): LocationMatchResult | null {
  if (!locations || locations.length === 0) return null;

  let closest: CampusLocation = locations[0];
  let minDistance = Infinity;

  for (const loc of locations) {
    const dist = calculateDistanceMeters(
      coords.latitude,
      coords.longitude,
      loc.latitude,
      loc.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return {
    location: closest,
    distanceMeters: minDistance,
    isWithinCampusRange: minDistance < 1500, // within 1.5km of campus
  };
}
