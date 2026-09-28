// ==============================================================================
// NETSENSE CAMPUS - TYPED FRONTEND API CLIENT
// ==============================================================================

import {
  UserProfile,
  AuthResponse,
  CampusLocation,
  NetworkMeasurement,
  NetworkReport,
  Incident,
  IncidentEvent,
  NetworkThreshold,
  DiagnosticResult,
  ApiResponse,
  AITroubleshootResponse,
  AIIncidentSummary,
  AINetworkAnalysis,
  SimulatorScenario,
} from '../types';

const API_BASE = '/api';

export const AUTH_TOKEN_KEY = 'netsense_auth_token';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `HTTP ${res.status}: Failed to fetch ${url}`);
  }
  return json.data as T;
}

export const api = {
  // Auth & Account Management
  getCurrentUser: () => fetchJson<UserProfile>('/auth/me'),
  getProfiles: () => fetchJson<UserProfile[]>('/auth/profiles'),
  login: (credentials: { email: string; password: string }) =>
    fetchJson<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (data: {
    full_name: string;
    email: string;
    phone_number?: string;
    password: string;
    confirm_password: string;
    role?: string;
  }) =>
    fetchJson<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () =>
    fetchJson<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  switchPersona: (profileId: string) =>
    fetchJson<UserProfile>('/auth/switch-persona', {
      method: 'POST',
      body: JSON.stringify({ profileId }),
    }),
  updateProfile: (updates: Partial<UserProfile>) =>
    fetchJson<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  registerAccount: (data: any) =>
    fetchJson<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Live Wi-Fi Interface Telemetry
  getConnectedWifi: () => fetchJson<any>('/network/wifi-interface'),
  getAvailableNetworks: () => fetchJson<import('../types').NetworkScanReport>('/network/wifi-available'),
  getIpInfo: () => fetchJson<any>('/network/ip-info'),
  pingSpeedProbe: () => fetchJson<{ status: string; timestamp: number }>('/network/speed/ping'),
  downloadSpeedChunk: async (): Promise<{ bytes: number; durationMs: number }> => {
    const start = performance.now();
    const res = await fetch('/api/network/speed/download?t=' + Date.now(), {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Download probe failed');
    const buffer = await res.arrayBuffer();
    const end = performance.now();
    return { bytes: buffer.byteLength, durationMs: Math.max(1, end - start) };
  },
  uploadSpeedChunk: async (bytes: number = 256 * 1024): Promise<{ bytes: number; durationMs: number }> => {
    const payload = new Uint8Array(bytes);
    payload.fill(0xaa);
    const start = performance.now();
    const res = await fetch('/api/network/speed/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: payload,
    });
    if (!res.ok) throw new Error('Upload probe failed');
    const end = performance.now();
    return { bytes, durationMs: Math.max(1, end - start) };
  },

  // Network & Locations
  getNetworkStatus: () => fetchJson<any>('/network/status'),
  getLocations: () => fetchJson<CampusLocation[]>('/network/locations'),
  getLocation: (id: string) => fetchJson<{ location: CampusLocation; measurements: NetworkMeasurement[]; reports: NetworkReport[]; incidents: Incident[] }>(`/network/locations/${id}`),
  getMeasurements: (locationId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (locationId) params.append('locationId', locationId);
    if (limit) params.append('limit', limit.toString());
    return fetchJson<NetworkMeasurement[]>(`/network/measurements?${params.toString()}`);
  },
  postDiagnostics: (data: DiagnosticResult, locationId?: string) =>
    fetchJson<{ message: string; result: DiagnosticResult }>('/network/diagnostics', {
      method: 'POST',
      body: JSON.stringify({ ...data, location_id: locationId }),
    }),
  getThresholds: () => fetchJson<NetworkThreshold[]>('/network/thresholds'),
  updateThreshold: (metricName: string, updates: Partial<NetworkThreshold>) =>
    fetchJson<NetworkThreshold>(`/network/thresholds/${metricName}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Reports
  getReports: (filters?: { userId?: string; locationId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.status) params.append('status', filters.status);
    return fetchJson<NetworkReport[]>(`/reports?${params.toString()}`);
  },
  getReport: (id: string) => fetchJson<NetworkReport>(`/reports/${id}`),
  createReport: (data: any) =>
    fetchJson<{ report: NetworkReport; correlation: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReport: (id: string, updates: Partial<NetworkReport>) =>
    fetchJson<NetworkReport>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Incidents
  getIncidents: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetchJson<Incident[]>(`/incidents${query}`);
  },
  getIncident: (id: string) => fetchJson<Incident>(`/incidents/${id}`),
  createIncident: (data: any) =>
    fetchJson<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIncident: (id: string, updates: Partial<Incident>) =>
    fetchJson<Incident>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  addIncidentEvent: (id: string, eventData: any) =>
    fetchJson<IncidentEvent>(`/incidents/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Analytics
  getAnalyticsOverview: () => fetchJson<any>('/analytics/overview'),
  getAnalyticsNetwork: (locationId?: string) => {
    const query = locationId ? `?locationId=${locationId}` : '';
    return fetchJson<any[]>(`/analytics/network${query}`);
  },
  getAnalyticsReports: () => fetchJson<any>('/analytics/reports'),
  getAnalyticsIncidents: () => fetchJson<any>('/analytics/incidents'),
  getPredictiveInsights: () => fetchJson<any>('/analytics/predictive'),

  // AI Integration
  chatAI: (data: { message: string; location_id?: string | null; diagnostics?: DiagnosticResult | null; session_id?: string }) =>
    fetchJson<{ session_id: string; message: any; action_prompt?: any }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  troubleshootAI: (data: { problem: string; location_id?: string; deviceType?: string; diagnostics?: DiagnosticResult | null }) =>
    fetchJson<AITroubleshootResponse>('/ai/troubleshoot', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  incidentSummaryAI: (incidentId: string) =>
    fetchJson<AIIncidentSummary>('/ai/incident-summary', {
      method: 'POST',
      body: JSON.stringify({ incidentId }),
    }),
  analyzeCampusNetworkAI: () => fetchJson<AINetworkAnalysis>('/ai/analyze-network', { method: 'POST' }),

  // Simulator
  triggerSimulation: (scenario: SimulatorScenario, locationId?: string, durationMinutes?: number) =>
    fetchJson<any>('/simulator/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_location_id: locationId, duration_minutes: durationMinutes }),
    }),
};
