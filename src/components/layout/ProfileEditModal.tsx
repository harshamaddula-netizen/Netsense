import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import {
  X,
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Shield,
  Save,
  PlusCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'EDIT' | 'CREATE';
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  mode = 'EDIT',
}) => {
  const { user, updateProfile, createAccount } = useAuth();
  const [modalMode, setModalMode] = useState<'EDIT' | 'CREATE'>(mode);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study?.toString() || '3');
  const [role, setRole] = useState<UserRole>(user?.role || 'student');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'EDIT') {
        await updateProfile({
          full_name: fullName,
          email,
          department,
          year_of_study: role === 'student' ? parseInt(yearOfStudy, 10) : null,
          role,
        });
      } else {
        await createAccount({
          full_name: fullName,
          email,
          department,
          year_of_study: role === 'student' ? parseInt(yearOfStudy, 10) : null,
          role,
        });
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Profile update error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl glass-panel-glow border border-teal-500/40 p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {modalMode === 'EDIT' ? 'Edit User Account' : 'Create New Account'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {modalMode === 'EDIT' ? 'Update active profile details' : 'Register a custom campus identity'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setModalMode('EDIT')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              modalMode === 'EDIT'
                ? 'bg-teal-500/20 text-teal-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modify Current Account
          </button>
          <button
            type="button"
            onClick={() => {
              setModalMode('CREATE');
              setFullName('');
              setEmail('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              modalMode === 'CREATE'
                ? 'bg-teal-500/20 text-teal-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Create New
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>Campus Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@netsense.edu"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
            />
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-teal-400" />
              <span>Department / Faculty Wing</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Mechanical Eng"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Role & Year Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Account Role</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono uppercase"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin (NOC)</option>
              </select>
            </div>

            {role === 'student' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Year of Study</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all uppercase tracking-wider"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Account...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-950" />
                  <span>Account Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{modalMode === 'EDIT' ? 'Save Profile Changes' : 'Create & Activate Account'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
