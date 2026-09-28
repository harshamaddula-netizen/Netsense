import React, { useState, useEffect, useRef } from 'react';
import {
  getExactDeviceCoordinates,
  startDeviceLocationWatch,
  stopDeviceLocationWatch,
  findClosestCampusLocation,
  GPSCoordinates,
  LocationResult,
  LocationStatus,
  LocationMatchResult,
} from '../../utils/geolocation';
import { CampusLocation, NetworkHistoryRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import { DeviceLocationMap } from '../../components/map/DeviceLocationMap';
import {
  Compass,
  Crosshair,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Map,
  Radio,
  StopCircle,
  Play,
  Clock,
  Navigation,
} from 'lucide-react';

interface ExactLocationCardProps {
  locations?: CampusLocation[];
  onLocationUpdate?: (coords: GPSCoordinates | null) => void;
  historyPoints?: NetworkHistoryRecord[];
}

export const ExactLocationCard: React.FC<ExactLocationCardProps> = ({
  locations = [],
  onLocationUpdate,
  historyPoints = [],
}) => {
  const { setSelectedLocationId } = useAuth();

  // Lifecycle states: PERMISSION_REQUIRED | SEARCHING | ACTIVE | TRACKING | PERMISSION_DENIED | UNAVAILABLE | TIMEOUT
  const [status, setStatus] = useState<LocationStatus>('PERMISSION_REQUIRED');
  const [gpsData, setGpsData] = useState<GPSCoordinates | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [closestMatch, setClosestMatch] = useState<LocationMatchResult | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);

  // Reference for active navigator.geolocation.watchPosition() id
  const watchIdRef = useRef<number | null>(null);

  // Clean up any active watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        stopDeviceLocationWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Update closest campus match whenever coordinates or locations change
  const updateMatchingZone = (coords: GPSCoordinates) => {
    if (locations.length > 0) {
      const match = findClosestCampusLocation(coords, locations);
      if (match) {
        setClosestMatch(match);
        setSelectedLocationId(match.location.id);
      }
    }
  };

  /**
   * One-time location acquisition using getCurrentPosition()
   * Triggered by [Enable Location] or [Refresh Location]
   */
  const handleFetchLocation = async () => {
    setIsRefreshing(true);
    setStatus('SEARCHING');
    setErrorMessage(null);

    try {
      const result: LocationResult = await getExactDeviceCoordinates();
      setStatus(result.status);

      if (result.status === 'ACTIVE' && result.coords) {
        setGpsData(result.coords);
        setLastUpdatedTime(new Date(result.coords.timestamp).toLocaleTimeString());
        onLocationUpdate?.(result.coords);
        updateMatchingZone(result.coords);
      } else {
        setErrorMessage(result.error);
        setGpsData(null);
        onLocationUpdate?.(null);
      }
    } catch (err: any) {
      setStatus('UNAVAILABLE');
      setErrorMessage(err.message || 'Unable to obtain your current location.');
      setGpsData(null);
      onLocationUpdate?.(null);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Start continuous live device tracking using watchPosition()
   */
  const handleStartTracking = () => {
    if (watchIdRef.current !== null) return;

    setStatus('SEARCHING');
    setErrorMessage(null);

    const id = startDeviceLocationWatch(
      (newCoords) => {
        setGpsData(newCoords);
        setStatus('TRACKING');
        setIsTracking(true);
        setLastUpdatedTime(new Date(newCoords.timestamp).toLocaleTimeString());
        onLocationUpdate?.(newCoords);
        updateMatchingZone(newCoords);
      },
      (errorResult) => {
        setStatus(errorResult.status);
        setIsTracking(false);
        setErrorMessage(errorResult.error);
        if (watchIdRef.current !== null) {
          stopDeviceLocationWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      }
    );

    if (id !== null) {
      watchIdRef.current = id;
      setIsTracking(true);
    }
  };

  /**
   * Stop continuous live device tracking using clearWatch()
   */
  const handleStopTracking = () => {
    if (watchIdRef.current !== null) {
      stopDeviceLocationWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    if (gpsData) {
      setStatus('ACTIVE');
    } else {
      setStatus('PERMISSION_REQUIRED');
    }
  };

  // Determine accuracy quality descriptor
  const getAccuracyDescription = (meters: number) => {
    if (meters <= 15) {
      return {
        label: 'High Accuracy (GPS/GNSS Hardware Fix)',
        color: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    } else if (meters <= 50) {
      return {
        label: 'Moderate Accuracy (Wi-Fi / Cellular Triangulation)',
        color: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      };
    } else {
      return {
        label: 'Approximate Accuracy (Network Gateway / Cellular Tower)',
        color: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'TRACKING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold animate-pulse">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>GPS Tracking Active</span>
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-semibold">
            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>GPS Location Active</span>
          </span>
        );
      case 'SEARCHING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Acquiring Device GPS...</span>
          </span>
        );
      case 'PERMISSION_DENIED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Permission Denied</span>
          </span>
        );
      case 'TIMEOUT':
      case 'UNAVAILABLE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Unable to Obtain Location</span>
          </span>
        );
      case 'PERMISSION_REQUIRED':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-semibold">
            <Navigation className="w-3.5 h-3.5 text-slate-400" />
            <span>Permission Required</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-5">
      {/* Header with Title, Status Badge, and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Compass className={`w-5 h-5 ${isRefreshing || isTracking ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Device Physical Location & Real-Time GPS Tracking
              </span>
              <TelemetryBadge type="CLIENT" size="xs" />
            </div>
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
              <span>Device Physical Location</span>
              {getStatusBadge()}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {gpsData && (
            <>
              {isTracking ? (
                <button
                  onClick={handleStopTracking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-300 hover:text-rose-200 bg-rose-500/15 border border-rose-500/40 hover:border-rose-500/70 transition-all shadow-sm"
                  title="Stop continuous watchPosition tracking"
                >
                  <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop Tracking</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTracking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 border border-emerald-500/40 hover:border-emerald-500/70 transition-all shadow-sm"
                  title="Enable real-time continuous GPS tracking"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Continuous Tracking</span>
                </button>
              )}

              <button
                onClick={handleFetchLocation}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Location</span>
              </button>
            </>
          )}

          {!gpsData && status !== 'SEARCHING' && (
            <button
              onClick={handleFetchLocation}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition-all shadow-md shadow-teal-500/20"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Enable Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Coordinates Readout - Only when REAL device coordinates exist */}
      {(status === 'ACTIVE' || status === 'TRACKING') && gpsData ? (
        <div className="space-y-4 animate-in fade-in">
          {/* Coordinates & Accuracy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            {/* Latitude */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Latitude</span>
              <div className="text-base font-bold text-slate-100 truncate">
                {gpsData.latitude.toFixed(6)}°
              </div>
              <div className="text-[10px] text-teal-400">
                WGS-84 Sensor Fix
              </div>
            </div>

            {/* Longitude */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Longitude</span>
              <div className="text-base font-bold text-slate-100 truncate">
                {gpsData.longitude.toFixed(6)}°
              </div>
              <div className="text-[10px] text-cyan-400">
                WGS-84 Sensor Fix
              </div>
            </div>

            {/* Accuracy with strict position.coords.accuracy */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">GPS Accuracy</span>
              <div className="text-base font-bold text-cyan-300">
                GPS accuracy: ±{gpsData.accuracyMeters} meters
              </div>
              <div className={`text-[10px] truncate ${getAccuracyDescription(gpsData.accuracyMeters).color}`}>
                {getAccuracyDescription(gpsData.accuracyMeters).label}
              </div>
            </div>

            {/* Location Status & Last Updated */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Location Status</span>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isTracking ? 'GPS Tracking Active' : 'GPS Location Active'}</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Updated: {lastUpdatedTime || 'Just now'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map with OpenStreetMap - Centers on REAL coordinates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Map className="w-3.5 h-3.5 text-teal-400" />
                <span>OpenStreetMap Live Satellite & Positioning View</span>
              </span>
              <span className="text-[10px] text-cyan-400">
                Circle radius = exactly ±{gpsData.accuracyMeters}m (from device accuracy)
              </span>
            </div>

            <DeviceLocationMap
              deviceLocation={gpsData}
              measurementPoints={historyPoints}
              height="300px"
              zoom={16}
              isTracking={isTracking}
            />
          </div>

          {/* Nearest Campus Match & External Map Link */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Coordinates retained locally in memory.
                {closestMatch && (
                  <span className="ml-1 text-slate-300">
                    Proximity match: <b className="text-white">{closestMatch.location.name}</b> ({closestMatch.distanceMeters}m).
                  </span>
                )}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 underline text-[11px]"
            >
              <span>View On External Map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        /* Permission / Denied / Searching / Unavailable States */
        <div className="space-y-4">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4 font-mono">
            {status === 'SEARCHING' ? (
              <div className="space-y-3">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-200">Acquiring real device location...</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Querying browser GPS/GNSS sensors with high accuracy. Please respond to any browser permission prompts.
                </p>
              </div>
            ) : status === 'PERMISSION_DENIED' ? (
              <div className="space-y-3 text-rose-300">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <p className="text-sm font-bold">Location permission denied. Please allow location access in your browser/device settings.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  To view your physical location and plot network tests on the map, click the site settings/padlock icon in your browser URL bar and allow Location access, then click &apos;Enable Location&apos;.
                </p>
                <button
                  onClick={handleFetchLocation}
                  className="mt-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs inline-flex items-center gap-1.5 transition-colors font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Permission Request</span>
                </button>
              </div>
            ) : status === 'UNAVAILABLE' || status === 'TIMEOUT' ? (
              <div className="space-y-3 text-amber-300">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm font-bold">Unable to obtain your current location.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {errorMessage || 'GPS hardware fix could not be established. Ensure your device has location services enabled in system settings.'}
                </p>
                <button
                  onClick={handleFetchLocation}
                  className="mt-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs inline-flex items-center gap-1.5 transition-colors font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Location</span>
                </button>
              </div>
            ) : (
              /* PERMISSION_REQUIRED */
              <div className="space-y-3 text-slate-300">
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 inline-block">
                  <Navigation className="w-8 h-8 mx-auto" />
                </div>
                <p className="text-base font-bold text-slate-100">Location permission required</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  NetSense requires browser location access to measure real physical network performance and plot local signal telemetry. Zero hard-coded or simulated coordinates are used.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleFetchLocation}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 transition-all shadow-lg shadow-teal-500/20 inline-flex items-center gap-2"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>Enable Location</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standby Map Container while awaiting permission */}
          <DeviceLocationMap
            deviceLocation={null}
            height="260px"
          />
        </div>
      )}

      {/* Security & Privacy Commitment */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-200">Security & Privacy Protocol:</span>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Location is strictly accessed only after explicit user consent via browser prompts. Raw coordinates are kept local in browser memory for telemetry mapping and are never sent to external servers unless attached to a user-submitted diagnostic report.
          </p>
        </div>
      </div>
    </div>
  );
};
