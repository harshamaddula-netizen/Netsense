import React, { useState } from 'react';
import {
  getExactDeviceCoordinates,
  findClosestCampusLocation,
  GPSCoordinates,
  LocationMatchResult,
} from '../../utils/geolocation';
import { CampusLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  MapPin,
  Compass,
  Navigation,
  CheckCircle,
  Crosshair,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface ExactLocationTracerProps {
  locations: CampusLocation[];
  onLocationPinned?: (locationId: string) => void;
}

export const ExactLocationTracer: React.FC<ExactLocationTracerProps> = ({
  locations,
  onLocationPinned,
}) => {
  const { setSelectedLocationId } = useAuth();
  const [isTracing, setIsTracing] = useState(false);
  const [gpsData, setGpsData] = useState<GPSCoordinates | null>(null);
  const [matchResult, setMatchResult] = useState<LocationMatchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTraceLocation = async () => {
    setIsTracing(true);
    setErrorMessage(null);
    try {
      const res = await getExactDeviceCoordinates();
      if (res.status === 'ACTIVE' && res.coords) {
        setGpsData(res.coords);
        const match = findClosestCampusLocation(res.coords, locations);
        if (match) {
          setMatchResult(match);
          setSelectedLocationId(match.location.id);
          onLocationPinned?.(match.location.id);
        }
      } else {
        setErrorMessage(res.error || 'Unable to obtain your current location.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to obtain your current location.');
    } finally {
      setIsTracing(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Compass className={`w-5 h-5 ${isTracing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Real Device Hardware Geolocation
              </span>
              <TelemetryBadge type="CLIENT" size="xs" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-tight">
              Detect Real Device Location
            </h3>
          </div>
        </div>

        <button
          onClick={handleTraceLocation}
          disabled={isTracing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md shadow-cyan-500/20 disabled:opacity-50"
        >
          {isTracing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Querying GPS Sensors...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5" />
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Traced Output */}
      {gpsData ? (
        <div className="space-y-3 animate-in fade-in zoom-in-95">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500">LATITUDE / LONGITUDE</span>
              <div className="font-bold text-slate-100 mt-0.5 truncate">
                {gpsData.latitude.toFixed(6)}°, {gpsData.longitude.toFixed(6)}°
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500">REPORTED ACCURACY</span>
              <div className="font-bold text-teal-300 mt-0.5">
                GPS accuracy: ±{gpsData.accuracyMeters} meters
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500">CLOSEST CAMPUS ZONE</span>
              <div className="font-bold text-slate-100 mt-0.5 truncate">
                {matchResult?.location.name || 'Campus Building'}
              </div>
            </div>
          </div>

          {matchResult && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  Auto-mapped to <span className="font-bold">{matchResult.location.name}</span> ({matchResult.distanceMeters}m proximity).
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Verify on Map</span>
                </a>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">
                  Active
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-slate-500" />
            <span>Click &apos;Detect My Location&apos; to query real device GPS coordinates with live accuracy.</span>
          </div>
        </div>
      )}
    </div>
  );
};
