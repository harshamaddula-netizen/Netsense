import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api, AUTH_TOKEN_KEY } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  profiles: UserProfile[];
  isLoading: boolean;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: {
    full_name: string;
    email: string;
    phone_number?: string;
    password: string;
    confirm_password: string;
    role?: string;
  }) => Promise<UserProfile>;
  switchPersona: (profileId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createAccount: (data: any) => Promise<void>;
  loginAs: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    '22222222-2222-2222-2222-222222222201' // Default: Eng Block 2nd Floor
  );

  useEffect(() => {
    async function initAuth() {
      try {
        const [me, allProfiles] = await Promise.all([
          api.getCurrentUser(),
          api.getProfiles(),
        ]);
        setUser(me);
        setProfiles(allProfiles);
      } catch (err) {
        console.warn('Initial session lookup note:', err);
        // Fallback demo user
        const fallback: UserProfile = {
          id: '33333333-3333-3333-3333-333333333301',
          full_name: 'Alex Chen',
          email: 'alex.chen@student.netsense.edu',
          role: 'student',
          department: 'Computer Science & Engineering',
          year_of_study: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallback);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const authRes = await api.login({ email, password });
      if (authRes.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, authRes.token);
      }
      setUser(authRes.user);
      return authRes.user;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    full_name: string;
    email: string;
    phone_number?: string;
    password: string;
    confirm_password: string;
    role?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const authRes = await api.register(data);
      if (authRes.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, authRes.token);
      }
      setUser(authRes.user);
      setProfiles((prev) => [...prev, authRes.user]);
      return authRes.user;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchPersona = async (profileId: string) => {
    setIsLoading(true);
    try {
      const updated = await api.switchPersona(profileId);
      setUser(updated);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const updated = await api.updateProfile(updates);
      setUser(updated);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (data: any) => {
    await register(data);
  };

  const loginAs = async (targetRole: UserRole) => {
    const target = profiles.find((p) => p.role === targetRole);
    if (target) {
      await switchPersona(target.id);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // safe fallback
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      // Reset to first demo student or unauthenticated
      const student = profiles.find((p) => p.role === 'student');
      if (student) {
        setUser(student);
      }
    }
  };

  const role = user?.role || 'student';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        profiles,
        isLoading,
        selectedLocationId,
        setSelectedLocationId,
        login,
        register,
        switchPersona,
        updateProfile,
        createAccount,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
