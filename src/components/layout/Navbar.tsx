import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wifi,
  Activity,
  AlertTriangle,
  User,
  MapPin,
  ChevronDown,
  Shield,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle,
  Crosshair,
  Edit,
  UserPlus,
  Compass,
  Signal,
  Loader2,
  Radio,
  LogOut,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { getExactDeviceCoordinates, findClosestCampusLocation } from '../../utils/geolocation';
import { ProfileEditModal } from './ProfileEditModal';

export const Navbar: React.FC<{ onOpenAssistant: () => void }> = ({ onOpenAssistant }) => {
  const { user, role, profiles, switchPersona, selectedLocationId, setSelectedLocationId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [personaOpen, setPersonaOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalMode, setEditModalMode] = useState<'EDIT' | 'CREATE'>('EDIT');
  const [isTracingGps, setIsTracingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  // Poll campus network health every 15s
  const { data: statusData } = useQuery({
    queryKey: ['campusStatus'],
    queryFn: () => api.getNetworkStatus(),
    refetchInterval: 15000,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  // Poll connected Wi-Fi adapter telemetry
  const { data: wifiInfo } = useQuery({
    queryKey: ['navbarWifi'],
    queryFn: () => api.getConnectedWifi(),
    refetchInterval: 8000,
  });

  const currentLoc = locations?.find((l) => l.id === selectedLocationId) || locations?.[0];
  const overallStatus = statusData?.overall_status || 'NORMAL';

  const statusColorMap: Record<string, string> = {
    NORMAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    UNKNOWN: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
  const statusColors = statusColorMap[overallStatus] || statusColorMap.NORMAL;

  // Handle GPS location tracing
  const handleGpsTrace = async () => {
    if (!locations || isTracingGps) return;
    setIsTracingGps(true);
    try {
      const res = await getExactDeviceCoordinates();
      if ((res.status === 'ACTIVE' || res.status === 'AVAILABLE') && res.coords) {
        const match = findClosestCampusLocation(res.coords, locations);
        if (match) {
          setSelectedLocationId(match.location.id);
          setGpsNotification(`Traced: ${match.location.name} (${match.distanceMeters}m away)`);
          setTimeout(() => setGpsNotification(null), 3500);
        }
      } else {
        setGpsNotification(res.error || 'Location unavailable');
        setTimeout(() => setGpsNotification(null), 3500);
      }
    } catch (err: any) {
      console.warn('GPS trace notice:', err.message);
    } finally {
      setIsTracingGps(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:border-teal-400 transition-colors">
                <Wifi className="w-5 h-5 animate-pulse" />
                <div className="absolute inset-0 rounded-lg bg-teal-500/20 blur-sm -z-10 group-hover:bg-teal-500/30"></div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white font-mono">NetSense</span>
                  <span className="text-xs px-1.5 py-0.2 rounded font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    CAMPUS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                  Know congestion before complaints
                </p>
              </div>
            </Link>

            {/* Campus Health Pill */}
            <div className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono font-medium ${statusColors}`}>
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    overallStatus === 'NORMAL'
                      ? 'bg-emerald-400'
                      : overallStatus === 'WARNING'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    overallStatus === 'NORMAL'
                      ? 'bg-emerald-500'
                      : overallStatus === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span>Campus: {overallStatus}</span>
              {statusData?.total_connected_devices && (
                <span className="text-[11px] text-slate-400 border-l border-slate-700 pl-2">
                  {statusData.total_connected_devices} dev
                </span>
              )}
            </div>

            {/* Real-time Connected Wi-Fi Pill */}
            {wifiInfo && wifiInfo.connected && (
              <Link
                to="/monitor"
                className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-teal-500/30 hover:border-teal-500/60 text-xs font-mono text-teal-300 shadow-sm transition-colors"
                title={`Connected to ${wifiInfo.ssid} on ${wifiInfo.band} (${wifiInfo.signal_percent}% signal quality, channel ${wifiInfo.channel}) - Click to open Live Monitor`}
              >
                <Signal className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-semibold text-slate-100">{wifiInfo.ssid}</span>
                <span className="text-[10px] text-slate-400">({wifiInfo.band})</span>
                <span className="text-[10px] px-1 rounded bg-teal-500/20 text-teal-200">
                  {wifiInfo.signal_percent}%
                </span>
              </Link>
            )}
          </div>

          {/* Middle / Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Monitor Link */}
            <Link
              to="/monitor"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-xs text-teal-300 transition-colors font-mono font-semibold"
              title="Open Live Network Telemetry & Monitor"
            >
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Live Monitor</span>
            </Link>

            {/* GPS Trace Button */}
            <button
              onClick={handleGpsTrace}
              disabled={isTracingGps}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-xs text-cyan-300 transition-colors"
              title="Trace physical device location via GPS satellites"
            >
              {isTracingGps ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline font-mono">
                {isTracingGps ? 'Tracing GPS...' : 'Trace GPS'}
              </span>
            </button>

            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLocationOpen(!locationOpen);
                  setPersonaOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 px-2.5 py-1.5 rounded-lg transition-all"
                title="Select your current physical campus location"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span className="max-w-[100px] sm:max-w-[150px] truncate font-medium">
                  {currentLoc ? currentLoc.name.split('-')[0].trim() : 'Location'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {locationOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl glass-panel border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1.5 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Select Your Campus Zone
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                    {locations?.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocationId(loc.id);
                          setLocationOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          selectedLocationId === loc.id
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <p className="font-medium text-slate-200 truncate">{loc.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {loc.floor} • {loc.building}
                          </p>
                        </div>
                        {selectedLocationId === loc.id && (
                          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick AI Assistant Button */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-500/20 to-purple-500/20 hover:from-teal-500/30 hover:to-purple-500/30 border border-teal-500/40 text-teal-200 transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)] group"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">NetSense AI</span>
            </button>

            {/* Persona Switcher & Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setPersonaOpen(!personaOpen);
                  setLocationOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-teal-400 border border-slate-700">
                  {role === 'admin' ? 'A' : role === 'faculty' ? 'F' : 'S'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-200 leading-tight truncate max-w-[100px]">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-[10px] font-mono text-teal-400 uppercase leading-none">{role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {personaOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl glass-panel border border-slate-700 shadow-2xl p-2 z-50">
                  {/* Account Actions Bar */}
                  <div className="p-2 border-b border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-200">{user?.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{user?.email}</p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase font-semibold">
                        {role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setEditModalMode('EDIT');
                          setEditModalOpen(true);
                          setPersonaOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 transition-colors"
                      >
                        <Edit className="w-3 h-3 text-teal-400" />
                        <span>Edit Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditModalMode('CREATE');
                          setEditModalOpen(true);
                          setPersonaOpen(false);
                        }}
                        className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-[11px] text-teal-300 transition-colors"
                        title="Create new custom account"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>New</span>
                      </button>
                    </div>
                  </div>

                  <div className="px-2 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Demo Persona
                  </div>

                  <div className="mt-1 space-y-1">
                    {profiles.map((p) => {
                      const isCurrent = user?.id === p.id;
                      const roleBadge =
                        p.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : p.role === 'faculty'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchPersona(p.id);
                            setPersonaOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-teal-500/20 border border-teal-500/30'
                              : 'hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-100">{p.full_name}</span>
                              <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${roleBadge}`}>
                                {p.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{p.department || p.email}</p>
                          </div>
                          {isCurrent && <CheckCircle className="w-4 h-4 text-teal-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Auth Actions Footer */}
                  <div className="pt-2 mt-2 border-t border-slate-800/90 flex items-center justify-between text-[11px] font-mono">
                    <Link
                      to="/login"
                      onClick={() => setPersonaOpen(false)}
                      className="text-teal-400 hover:text-teal-300 hover:underline"
                    >
                      Login / Register
                    </Link>

                    <button
                      onClick={async () => {
                        await logout();
                        setPersonaOpen(false);
                        navigate('/login');
                      }}
                      className="flex items-center gap-1 text-rose-400 hover:text-rose-300 py-1 px-2 rounded hover:bg-rose-500/10 transition-colors"
                      title="Log out of current account"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GPS Notification Banner */}
        {gpsNotification && (
          <div className="bg-cyan-500/20 border-b border-cyan-500/30 px-4 py-1.5 text-center text-xs font-mono text-cyan-200 animate-in slide-in-from-top-2">
            📍 {gpsNotification}
          </div>
        )}
      </header>

      {/* Profile Edit / Create Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode={editModalMode}
      />
    </>
  );
};
