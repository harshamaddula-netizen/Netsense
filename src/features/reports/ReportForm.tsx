import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ReportCategory, SeverityLevel, CampusLocation, DiagnosticResult } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  getExactDeviceCoordinates,
  findClosestCampusLocation,
} from '../../utils/geolocation';
import {
  FileText,
  AlertTriangle,
  MapPin,
  Laptop,
  CheckCircle,
  Activity,
  Send,
  Loader2,
  ShieldCheck,
  Crosshair,
  Wifi,
  Signal,
} from 'lucide-react';

interface ReportFormData {
  category: ReportCategory;
  description: string;
  location_id: string;
  severity: SeverityLevel;
  device_type: 'Laptop' | 'Mobile' | 'Tablet' | 'Desktop' | 'Other';
}

export const ReportForm: React.FC<{ locations: CampusLocation[] }> = ({ locations }) => {
  const { user, selectedLocationId, setSelectedLocationId } = useAuth();
  const navigate = useNavigate();
  const locationState = useLocation().state as { diagnosticResult?: DiagnosticResult } | undefined;

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult | null>(
    locationState?.diagnosticResult || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTracingGps, setIsTracingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ reportId: string; correlation: any } | null>(null);

  // Poll connected hardware Wi-Fi adapter
  const { data: wifiInfo } = useQuery({
    queryKey: ['reportConnectedWifi'],
    queryFn: () => api.getConnectedWifi(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      category: 'SLOW_INTERNET',
      location_id: selectedLocationId || locations[0]?.id,
      severity: 'MEDIUM',
      device_type: 'Laptop',
      description: '',
    },
  });

  const currentLocationId = watch('location_id');

  const handleGpsDetect = async () => {
    setIsTracingGps(true);
    try {
      const res = await getExactDeviceCoordinates();
      if ((res.status === 'ACTIVE' || res.status === 'AVAILABLE') && res.coords) {
        const match = findClosestCampusLocation(res.coords, locations);
        if (match) {
          setValue('location_id', match.location.id);
          setSelectedLocationId(match.location.id);
          setGpsNotice(
            `GPS Lock: ${match.location.name} (${match.distanceMeters}m away, ±${res.coords.accuracyMeters}m accuracy)`
          );
        }
      } else {
        alert(`GPS notice: ${res.error || 'Device coordinates unavailable.'}`);
      }
    } catch (err: any) {
      alert(`GPS Trace notice: ${err.message}`);
    } finally {
      setIsTracingGps(false);
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      // Append connected Wi-Fi info to description if available
      let fullDescription = data.description;
      if (wifiInfo && wifiInfo.connected) {
        fullDescription += `\n[Hardware Telemetry: Connected to ${wifiInfo.ssid} (${wifiInfo.band}, ${wifiInfo.signal_percent}% signal, Ch ${wifiInfo.channel || 'N/A'})]`;
      }

      const response = await api.createReport({
        ...data,
        description: fullDescription,
        user_id: user?.id,
        diagnostic_data: diagnosticData,
      });

      setSuccessInfo({
        reportId: response.report.id,
        correlation: response.correlation,
      });
    } catch (err: any) {
      alert(`Failed to submit report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successInfo) {
    const isCorrelated = successInfo.correlation?.correlated;
    return (
      <div className="rounded-2xl glass-panel border border-teal-500/40 p-8 text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center border border-teal-500/30">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Report Submitted Successfully</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Ticket Reference: #{successInfo.reportId}</p>
        </div>

        {/* Correlation Banner */}
        {isCorrelated ? (
          <div className="p-4 rounded-xl bg-purple-500/15 border border-purple-500/30 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Automated Incident Correlation Active</span>
            </div>
            <p className="text-xs text-slate-300">
              Your report was automatically grouped into an active campus incident (#
              {successInfo.correlation.incidentId?.substring(0, 8)}). Campus network engineers are already investigating this location!
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-300">
            Your report is queued in the NOC operations feed. If multiple students report similar issues in this zone, NetSense will automatically link them into a prioritized incident.
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            onClick={() => navigate('/reports')}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors"
          >
            Track My Reports
          </button>
          <button
            onClick={() => {
              setSuccessInfo(null);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Submit Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Active Connected Wi-Fi Tracker Banner */}
      {wifiInfo && wifiInfo.connected && (
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-teal-300">
            <Wifi className="w-4 h-4 text-teal-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-100">{wifiInfo.ssid}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
                  {wifiInfo.band}
                </span>
                <span className="text-slate-400">Ch {wifiInfo.channel}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Live hardware link: {wifiInfo.signal_percent}% signal • {wifiInfo.radio_type} • {wifiInfo.adapter_name}
              </p>
            </div>
          </div>
          <TelemetryBadge type="REAL" size="xs" />
        </div>
      )}

      {/* Category Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          1. Problem Category <span className="text-rose-400">*</span>
        </label>
        <select
          {...register('category', { required: true })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
        >
          <option value="SLOW_INTERNET">Slow Internet / High Latency</option>
          <option value="BUFFERING">Video Buffering & Stream Freezing</option>
          <option value="NO_INTERNET">Connected but No Internet (Captive Portal)</option>
          <option value="FREQUENT_DISCONNECT">Frequent Disconnections / AP Roaming</option>
          <option value="CANNOT_CONNECT">Cannot Associate with Wi-Fi Network</option>
          <option value="AUTHENTICATION_FAILURE">Authentication / 802.1X Login Failure</option>
          <option value="DNS_FAILURE">DNS Resolution Failure</option>
          <option value="OTHER">Other Campus Network Issue</option>
        </select>
      </div>

      {/* Location Picker with GPS Auto-Trace Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>2. Campus Location <span className="text-rose-400">*</span></span>
          </label>

          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={isTracingGps}
            className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors"
          >
            {isTracingGps ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Crosshair className="w-3 h-3" />
            )}
            <span>{isTracingGps ? 'Locating...' : 'Trace My GPS Location'}</span>
          </button>
        </div>

        <select
          {...register('location_id', { required: true })}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.floor} • {loc.building})
            </option>
          ))}
        </select>

        {gpsNotice && (
          <p className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{gpsNotice}</span>
          </p>
        )}
      </div>

      {/* Severity & Device Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            3. Impact Severity
          </label>
          <select
            {...register('severity')}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="LOW">Low (Slightly noticeable)</option>
            <option value="MEDIUM">Medium (Degrades coursework)</option>
            <option value="HIGH">High (Blocks lecture or exam)</option>
            <option value="CRITICAL">Critical (Total campus blackout)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-teal-400" />
            <span>4. Device Type</span>
          </label>
          <select
            {...register('device_type')}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="Laptop">Laptop (Windows / Mac / Linux)</option>
            <option value="Mobile">Smartphone (iOS / Android)</option>
            <option value="Tablet">Tablet / iPad</option>
            <option value="Desktop">Lab Workstation</option>
            <option value="Other">Other IoT / Connected Device</option>
          </select>
        </div>
      </div>

      {/* Problem Description */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          5. Detailed Symptoms <span className="text-rose-400">*</span>
        </label>
        <textarea
          {...register('description', {
            required: 'Please provide a short description of the issue',
            minLength: { value: 5, message: 'Description must be at least 5 characters' },
          })}
          rows={3}
          placeholder="E.g., Terminal SSH connections keep timing out and ping to campus gateway is over 150ms..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
        ></textarea>
        {errors.description && (
          <p className="text-[11px] text-rose-400">{errors.description.message}</p>
        )}
      </div>

      {/* Attached Client Diagnostic Card */}
      {diagnosticData && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-semibold">Client Diagnostics Attached</span>
              <p className="text-[10px] text-slate-400 font-mono">
                {diagnosticData.latency_ms}ms RTT • {diagnosticData.packet_loss_percent}% packet drop • {diagnosticData.client_assessment.status}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDiagnosticData(null)}
            className="text-xs text-slate-400 hover:text-rose-400 font-mono"
          >
            Remove
          </button>
        </div>
      )}

      {/* Privacy Guarantee Note */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span>
          NetSense will never ask for your Wi-Fi passwords, personal credentials, or OTPs. All telemetry is used exclusively for campus wireless health diagnostics.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-teal-500/20 transition-all uppercase tracking-wider"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Correlating & Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Network Report</span>
          </>
        )}
      </button>
    </form>
  );
};
