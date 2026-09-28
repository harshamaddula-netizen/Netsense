import React from 'react';
import {
  ShieldAlert,
  Smartphone,
  Globe,
  Terminal,
  Check,
  X,
  AlertCircle,
  Cpu,
  Layers,
  Info,
} from 'lucide-react';

export const PlatformLimitationsCard: React.FC = () => {
  return (
    <div className="rounded-2xl glass-panel border border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Architectural & Sandbox Disclosure
          </span>
          <h2 className="text-base font-bold text-slate-100 font-mono tracking-tight">
            Platform Capabilities & OS Security Boundaries
          </h2>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-mono">
        NetSense Campus operates as a <strong>Hybrid Web + Local Node.js Gateway Application</strong>. Under modern operating system security models, what a client can observe depends strictly on the runtime environment:
      </p>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        {/* Browser Sandbox Column */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-teal-300 font-bold border-b border-slate-800 pb-2">
            <Globe className="w-4 h-4 text-teal-400" />
            <span>Pure Web Browser (W3C)</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>HTML5 Geolocation (with prompt)</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>navigator.connection (RTT, Downlink)</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Online/Offline network events</span>
            </li>
            <li className="flex items-start gap-1.5 text-rose-400">
              <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Restricted: Raw 802.11 SSID scan</span>
            </li>
            <li className="flex items-start gap-1.5 text-rose-400">
              <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Restricted: RF Channel & dBm RSSI</span>
            </li>
          </ul>
        </div>

        {/* Local Node Gateway Column (Our Active Architecture) */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/40 space-y-2.5 relative">
          <div className="absolute top-2 right-2 px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 text-[9px] font-bold">
            ACTIVE HERE
          </div>
          <div className="flex items-center gap-2 text-teal-300 font-bold border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4 text-teal-400" />
            <span>NetSense Local OS Host</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Windows netsh wlan interfaces</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Real 802.11 beacon scans (BSSID)</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Channel, Band (2.4/5/6 GHz), Auth</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Negotiated Rx/Tx link rates</span>
            </li>
            <li className="flex items-start gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>High-resolution local socket ping</span>
            </li>
          </ul>
        </div>

        {/* Native Android App Column */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-300 font-bold border-b border-slate-800 pb-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Native Android / Companion</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-start gap-1.5 text-purple-300">
              <Cpu className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Requires: ACCESS_FINE_LOCATION</span>
            </li>
            <li className="flex items-start gap-1.5 text-purple-300">
              <Cpu className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Requires: NEARBY_WIFI_DEVICES</span>
            </li>
            <li className="flex items-start gap-1.5 text-purple-300">
              <Cpu className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>WifiManager.getScanResults()</span>
            </li>
            <li className="flex items-start gap-1.5 text-purple-300">
              <Cpu className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Cellular CID, LAC, & eNodeB IDs</span>
            </li>
            <li className="flex items-start gap-1.5 text-slate-400">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Can bridge via Capacitor Plugin</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Core Integrity Commitment */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <span>
          <strong>NetSense Verification Guarantee:</strong> If hardware beacon scanning is unsupported by a client platform, NetSense transparently presents the platform restriction rather than generating simulated Wi-Fi networks or fabricated signal numbers.
        </span>
      </div>
    </div>
  );
};
