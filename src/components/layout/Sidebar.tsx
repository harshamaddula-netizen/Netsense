import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Map,
  Activity,
  AlertOctagon,
  FileText,
  PlusCircle,
  Sliders,
  PlayCircle,
  Bot,
  User,
  ShieldAlert,
  BarChart3,
  Network,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitor', label: 'Live Monitor & Scanner', icon: Radio, highlight: true },
    { to: '/network', label: 'Campus Heatmap', icon: Map },
    { to: '/diagnostics', label: 'Run Diagnostics', icon: Activity },
    { to: '/reports/new', label: 'Report Issue', icon: PlusCircle },
    { to: '/reports', label: 'My Reports', icon: FileText },
    { to: '/incidents', label: 'Active Incidents', icon: AlertOctagon },
    { to: '/profile', label: 'My Account', icon: User },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Operations Center', icon: LayoutDashboard },
    { to: '/admin/monitor', label: 'Live RF & Speed Monitor', icon: Radio, highlight: true },
    { to: '/admin/network', label: 'Heatmap & APs', icon: Network },
    { to: '/admin/incidents', label: 'Incident Correlator', icon: AlertOctagon },
    { to: '/admin/reports', label: 'All User Reports', icon: FileText },
    { to: '/admin/analytics', label: 'Historical & Trends', icon: BarChart3 },
    { to: '/admin/thresholds', label: 'SLA Thresholds', icon: Sliders },
    { to: '/admin/simulator', label: 'Demo Simulator', icon: PlayCircle },
    { to: '/admin/ai', label: 'AI Intelligence', icon: Bot },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800/80 bg-slate-950/70 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
              {isAdmin ? 'IT Operations NOC' : 'Student & Faculty Portal'}
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                isAdmin
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              }`}
            >
              {role}
            </span>
          </div>

          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                        : item.highlight
                        ? 'bg-gradient-to-r from-teal-500/10 to-transparent hover:from-teal-500/20 text-slate-200 hover:text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Switch portal shortcut for reviewers */}
        <div className="pt-4 border-t border-slate-800/60 px-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Hackathon Quick Mode</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isAdmin
                ? 'Simulate student complaints or AP congestion in Simulator.'
                : 'Need NOC IT controls? Switch persona to Marcus Vance in top right.'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/60 px-3 text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>NetSense v1.0.0</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Telemetry Live
        </span>
      </div>
    </aside>
  );
};
