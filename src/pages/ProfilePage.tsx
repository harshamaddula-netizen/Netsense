import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProfileEditModal } from '../components/layout/ProfileEditModal';
import { ConnectedWifiCard } from '../features/network/ConnectedWifiCard';
import { ExactLocationTracer } from '../features/location/ExactLocationTracer';
import {
  User,
  Shield,
  CheckCircle,
  Radio,
  LogOut,
  Edit,
  UserPlus,
  Compass,
  Wifi,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role, profiles, switchPersona, logout, setSelectedLocationId } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'EDIT' | 'CREATE'>('EDIT');

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.getLocations(),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl font-bold text-slate-100">User Account & Device Telemetry</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account identity, trace physical device location, and monitor real-time connected Wi-Fi adapter telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalMode('EDIT');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-md shadow-teal-500/20"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Account</span>
          </button>

          <button
            onClick={() => {
              setModalMode('CREATE');
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-400" />
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="p-6 rounded-2xl glass-panel-glow border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xl font-mono">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{user?.full_name}</h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                    role === 'admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : role === 'faculty'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalMode('EDIT');
                setModalOpen(true);
              }}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Change Account Info</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Department</span>
            <p className="font-semibold text-slate-200 mt-0.5">{user?.department || 'N/A'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Academic Standing</span>
            <p className="font-semibold text-slate-200 mt-0.5">
              {user?.year_of_study ? `Year ${user.year_of_study} Student` : 'Faculty / Staff'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Account Identifier</span>
            <p className="font-semibold text-slate-300 mt-0.5 truncate">{user?.id?.substring(0, 16)}...</p>
          </div>
        </div>
      </div>

      {/* Live Hardware Wi-Fi Link & Physical GPS Location */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Wifi className="w-4 h-4 text-teal-400" />
            <span>Connected Wi-Fi & Device Location Telemetry</span>
          </h2>
          <span className="text-[11px] font-mono text-teal-400">Live Hardware Link</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConnectedWifiCard />
          <ExactLocationTracer
            locations={locations || []}
            onLocationPinned={(locId) => setSelectedLocationId(locId)}
          />
        </div>
      </div>

      {/* Switch Demo Persona */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-semibold text-teal-400 uppercase tracking-wider">
          Switch Demo Persona (Hackathon Evaluation)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const isCurrent = user?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => switchPersona(p.id)}
                className={`p-4 rounded-xl glass-panel border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100">{p.full_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.department || p.email}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500">
                    {p.role === 'admin' ? 'NOC Administrator' : p.role === 'faculty' ? 'Faculty Member' : 'Undergraduate'}
                  </span>
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs text-teal-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200">
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Create Profile Modal */}
      <ProfileEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />
    </div>
  );
};
