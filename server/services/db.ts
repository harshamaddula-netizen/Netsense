// ==============================================================================
// NETSENSE CAMPUS - DATA PERSISTENCE LAYER (DUAL-MODE: SUPABASE + IN-MEMORY STORE)
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './authService';
import {
  UserProfile,
  CampusLocation,
  NetworkMeasurement,
  NetworkReport,
  Incident,
  IncidentEvent,
  NetworkThreshold,
  ChatSession,
  ChatMessage,
  TelemetrySource,
} from '../../src/types';

export interface StoredAuthAccount {
  user_id: string;
  email: string;
  phone_number?: string | null;
  password_hash: string;
  password_salt: string;
  created_at: string;
}

// Initial Campus Locations Seed
const SEED_LOCATIONS: CampusLocation[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    name: 'Engineering Block - 2nd Floor Labs',
    building: 'Engineering Block',
    floor: '2nd Floor',
    latitude: 12.9716,
    longitude: 77.5946,
    description: 'High-density computer science labs & lecture halls with dual AP clusters.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    name: 'Engineering Block - 1st Floor Classrooms',
    building: 'Engineering Block',
    floor: '1st Floor',
    latitude: 12.9715,
    longitude: 77.5945,
    description: 'Mechanical & Civil engineering classrooms and lecture theatre.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    name: 'Central Library & Learning Commons',
    building: 'Library Tower',
    floor: '3rd Floor',
    latitude: 12.972,
    longitude: 77.595,
    description: 'Silent study zones, digital repository, and multi-user study carrels.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    name: 'Science & Innovation Complex',
    building: 'Science Center',
    floor: 'Ground Floor',
    latitude: 12.9725,
    longitude: 77.5938,
    description: 'Physics & Chemistry research wings, IoT testbed zone.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222205',
    name: 'Student Hostels - Block A',
    building: 'Hostel Block A',
    floor: 'All Floors',
    latitude: 12.9708,
    longitude: 77.596,
    description: 'Residential student quarters, evening peak recreational traffic.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    name: 'Student Hostels - Block B',
    building: 'Hostel Block B',
    floor: 'All Floors',
    latitude: 12.9705,
    longitude: 77.5965,
    description: 'Residential student quarters with outdoor common study lounge.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    name: 'Campus Cafeteria & Student Center',
    building: 'Dining & Social Hall',
    floor: '1st Floor',
    latitude: 12.9712,
    longitude: 77.5935,
    description: 'Peak lunchtime concurrency hotspot with mobile devices.',
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222208',
    name: 'Administrative Center & Auditorium',
    building: 'Admin Complex',
    floor: 'Ground Floor',
    latitude: 12.973,
    longitude: 77.5955,
    description: 'Executive offices, conference room, university gateway uplink.',
    is_active: true,
  },
];

const SEED_THRESHOLDS: NetworkThreshold[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    metric_name: 'LATENCY',
    warning_value: 70,
    critical_value: 150,
    unit: 'ms',
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    metric_name: 'PACKET_LOSS',
    warning_value: 2.0,
    critical_value: 5.0,
    unit: '%',
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    metric_name: 'DEVICE_COUNT',
    warning_value: 250,
    critical_value: 400,
    unit: 'devices',
    is_active: true,
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    metric_name: 'AVAILABILITY',
    warning_value: 98.0,
    critical_value: 90.0,
    unit: '%',
    is_active: true,
  },
];

const SEED_PROFILES: UserProfile[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    full_name: 'Alex Chen',
    email: 'alex.chen@student.netsense.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    year_of_study: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    full_name: 'Dr. Sarah Mitchell',
    email: 'sarah.mitchell@faculty.netsense.edu',
    role: 'faculty',
    department: 'Information Technology',
    year_of_study: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    full_name: 'Marcus Vance',
    email: 'marcus.vance@admin.netsense.edu',
    role: 'admin',
    department: 'Network Operations Center (NOC)',
    year_of_study: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class NetworkDatabaseService {
  private locations: Map<string, CampusLocation> = new Map();
  private measurements: NetworkMeasurement[] = [];
  private reports: Map<string, NetworkReport> = new Map();
  private incidents: Map<string, Incident> = new Map();
  private incidentEvents: IncidentEvent[] = [];
  private thresholds: Map<string, NetworkThreshold> = new Map();
  private profiles: Map<string, UserProfile> = new Map();
  private authAccounts: Map<string, StoredAuthAccount> = new Map();
  private sessionTokens: Map<string, { user_id: string; expires_at: number }> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Populate locations
    for (const loc of SEED_LOCATIONS) {
      this.locations.set(loc.id, { ...loc });
    }

    // Populate thresholds
    for (const t of SEED_THRESHOLDS) {
      this.thresholds.set(t.metric_name, { ...t });
    }

    // Populate profiles and pre-seed credentials with secure PBKDF2 hash (default: password123)
    const demoHashed = AuthService.hashPassword('password123');
    for (const p of SEED_PROFILES) {
      this.profiles.set(p.id, { ...p });
      this.authAccounts.set(p.email.toLowerCase(), {
        user_id: p.id,
        email: p.email.toLowerCase(),
        password_hash: demoHashed.hash,
        password_salt: demoHashed.salt,
        created_at: p.created_at,
      });
    }

    // Generate baseline historical and latest measurements
    const now = Date.now();
    for (const loc of SEED_LOCATIONS) {
      // Historical trend points (last 12 hours)
      for (let h = 12; h >= 1; h--) {
        const measuredAt = new Date(now - h * 3600 * 1000).toISOString();
        const baseLatency = loc.name.includes('Eng') ? 65 : 22;
        const latency = baseLatency + Math.sin(h) * 15 + Math.random() * 8;
        const deviceCount = loc.name.includes('Eng') ? 290 : 120 + Math.floor(Math.random() * 50);
        const loss = latency > 80 ? 2.5 : 0.1;
        const status = latency > 90 || deviceCount > 300 ? 'WARNING' : 'NORMAL';

        this.measurements.push({
          id: uuidv4(),
          location_id: loc.id,
          location_name: loc.name,
          device_count: deviceCount,
          latency_ms: Number(latency.toFixed(1)),
          packet_loss_percent: Number(loss.toFixed(1)),
          availability_percent: 99.8,
          status,
          source: 'REAL',
          measured_at: measuredAt,
        });
      }

      // Latest measurement
      const isEng = loc.id === '22222222-2222-2222-2222-222222222201';
      this.measurements.push({
        id: uuidv4(),
        location_id: loc.id,
        location_name: loc.name,
        device_count: isEng ? 320 : 135,
        latency_ms: isEng ? 98.4 : 24.5,
        packet_loss_percent: isEng ? 3.2 : 0.2,
        availability_percent: 99.5,
        status: isEng ? 'WARNING' : 'NORMAL',
        source: 'REAL',
        measured_at: new Date().toISOString(),
      });
    }

    // Pre-seed an incident in Engineering Block Floor 2
    const initialIncidentId = '44444444-4444-4444-4444-444444444401';
    this.incidents.set(initialIncidentId, {
      id: initialIncidentId,
      location_id: '22222222-2222-2222-2222-222222222201',
      location_name: 'Engineering Block - 2nd Floor Labs',
      title: 'High Device Concurrency in Eng Block 2nd Floor',
      description:
        'Elevated congestion caused by simultaneous laboratory sessions. 320 connected devices saturating local AP channels with 98ms average RTT.',
      severity: 'MEDIUM',
      status: 'INVESTIGATING',
      detected_at: new Date(now - 25 * 60 * 1000).toISOString(),
      source: 'AUTOMATED_CORRELATION',
      correlated_report_ids: [],
      created_at: new Date(now - 25 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      events: [
        {
          id: uuidv4(),
          incident_id: initialIncidentId,
          event_type: 'CORRELATION_TRIGGERED',
          description: 'Automated correlation grouped 3 student reports within 15 minutes window.',
          metadata: { report_count: 3, avg_latency: 98.4 },
          created_at: new Date(now - 24 * 60 * 1000).toISOString(),
        },
        {
          id: uuidv4(),
          incident_id: initialIncidentId,
          event_type: 'STATUS_UPDATED',
          description: 'Admin Marcus Vance acknowledged incident and initiated band steering.',
          created_at: new Date(now - 12 * 60 * 1000).toISOString(),
        },
      ],
    });

    // Seed 2 reports attached to this incident
    const report1: NetworkReport = {
      id: uuidv4(),
      user_id: '33333333-3333-3333-3333-333333333301',
      user_name: 'Alex Chen',
      user_role: 'student',
      location_id: '22222222-2222-2222-2222-222222222201',
      location_name: 'Engineering Block - 2nd Floor Labs',
      category: 'SLOW_INTERNET',
      description: 'Lab terminals are buffering heavily during the distributed systems practical.',
      severity: 'MEDIUM',
      device_type: 'Laptop',
      status: 'CORRELATED',
      incident_id: initialIncidentId,
      created_at: new Date(now - 28 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 24 * 60 * 1000).toISOString(),
    };
    this.reports.set(report1.id, report1);
  }

  // --- Locations ---
  public getLocations(): CampusLocation[] {
    return Array.from(this.locations.values()).map((loc) => {
      // Find latest measurement
      const locMeasurements = this.measurements
        .filter((m) => m.location_id === loc.id)
        .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());

      const activeIncidents = Array.from(this.incidents.values()).filter(
        (i) => i.location_id === loc.id && i.status !== 'RESOLVED'
      );

      const recentReports = Array.from(this.reports.values()).filter(
        (r) => r.location_id === loc.id && r.status !== 'RESOLVED'
      );

      return {
        ...loc,
        latest_measurement: locMeasurements[0],
        active_incident_count: activeIncidents.length,
        recent_report_count: recentReports.length,
      };
    });
  }

  public getLocationById(id: string): CampusLocation | undefined {
    return this.getLocations().find((l) => l.id === id);
  }

  // --- Measurements ---
  public getMeasurements(locationId?: string, limit: number = 100): NetworkMeasurement[] {
    let list = this.measurements;
    if (locationId) {
      list = list.filter((m) => m.location_id === locationId);
    }
    return list
      .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
      .slice(0, limit);
  }

  public recordMeasurement(measurement: Omit<NetworkMeasurement, 'id' | 'created_at'>): NetworkMeasurement {
    const loc = this.locations.get(measurement.location_id);
    const newRecord: NetworkMeasurement = {
      ...measurement,
      id: uuidv4(),
      location_name: loc?.name || 'Unknown Location',
      created_at: new Date().toISOString(),
    };
    this.measurements.unshift(newRecord);
    // Keep max 2000 measurements in memory
    if (this.measurements.length > 2000) {
      this.measurements.pop();
    }
    return newRecord;
  }

  // --- Reports ---
  public getReports(userId?: string, locationId?: string, status?: string): NetworkReport[] {
    let list = Array.from(this.reports.values());
    if (userId) list = list.filter((r) => r.user_id === userId);
    if (locationId) list = list.filter((r) => r.location_id === locationId);
    if (status) list = list.filter((r) => r.status === status);
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getReportById(id: string): NetworkReport | undefined {
    return this.reports.get(id);
  }

  public createReport(reportData: Omit<NetworkReport, 'id' | 'created_at' | 'updated_at'>): NetworkReport {
    const loc = this.locations.get(reportData.location_id);
    const user = reportData.user_id ? this.profiles.get(reportData.user_id) : undefined;
    const now = new Date().toISOString();

    const newReport: NetworkReport = {
      ...reportData,
      id: uuidv4(),
      location_name: loc?.name || 'Unknown Location',
      user_name: user?.full_name || 'Anonymous User',
      user_role: user?.role || 'student',
      status: 'SUBMITTED',
      created_at: now,
      updated_at: now,
    };

    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  public updateReport(id: string, updates: Partial<NetworkReport>): NetworkReport | undefined {
    const existing = this.reports.get(id);
    if (!existing) return undefined;
    const updated: NetworkReport = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.reports.set(id, updated);
    return updated;
  }

  // --- Incidents ---
  public getIncidents(status?: string): Incident[] {
    let list = Array.from(this.incidents.values());
    if (status) {
      list = list.filter((i) => i.status === status);
    }
    return list
      .map((inc) => {
        const correlatedReports = Array.from(this.reports.values()).filter(
          (r) => r.incident_id === inc.id
        );
        return {
          ...inc,
          correlated_reports: correlatedReports,
        };
      })
      .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  }

  public getIncidentById(id: string): Incident | undefined {
    const inc = this.incidents.get(id);
    if (!inc) return undefined;
    const correlatedReports = Array.from(this.reports.values()).filter(
      (r) => r.incident_id === inc.id
    );
    return {
      ...inc,
      correlated_reports: correlatedReports,
    };
  }

  public createIncident(data: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'events'>): Incident {
    const loc = this.locations.get(data.location_id);
    const now = new Date().toISOString();
    const newIncident: Incident = {
      ...data,
      id: uuidv4(),
      location_name: loc?.name || 'Unknown Location',
      detected_at: data.detected_at || now,
      status: data.status || 'OPEN',
      events: [
        {
          id: uuidv4(),
          incident_id: '',
          event_type: 'INCIDENT_CREATED',
          description: `Incident detected and logged (${data.title})`,
          created_at: now,
        },
      ],
      created_at: now,
      updated_at: now,
    };
    newIncident.events![0].incident_id = newIncident.id;
    this.incidents.set(newIncident.id, newIncident);
    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | undefined {
    const existing = this.incidents.get(id);
    if (!existing) return undefined;
    const updated: Incident = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (updates.status === 'RESOLVED' && !updated.resolved_at) {
      updated.resolved_at = new Date().toISOString();
    }
    this.incidents.set(id, updated);
    return updated;
  }

  public addIncidentEvent(incidentId: string, eventData: Omit<IncidentEvent, 'id' | 'incident_id' | 'created_at'>): IncidentEvent | undefined {
    const inc = this.incidents.get(incidentId);
    if (!inc) return undefined;
    const event: IncidentEvent = {
      ...eventData,
      id: uuidv4(),
      incident_id: incidentId,
      created_at: new Date().toISOString(),
    };
    if (!inc.events) inc.events = [];
    inc.events.push(event);
    return event;
  }

  // --- Thresholds ---
  public getThresholds(): NetworkThreshold[] {
    return Array.from(this.thresholds.values());
  }

  public updateThreshold(metricName: string, updates: Partial<NetworkThreshold>): NetworkThreshold | undefined {
    const existing = this.thresholds.get(metricName);
    if (!existing) return undefined;
    const updated: NetworkThreshold = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.thresholds.set(metricName, updated);
    return updated;
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return Array.from(this.profiles.values());
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.profiles.get(id);
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const existing = this.profiles.get(id);
    if (!existing) return undefined;
    const updated: UserProfile = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(id, updated);
    return updated;
  }

  public createProfile(data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): UserProfile {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      ...data,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };
    this.profiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  public getAccountByEmail(email: string): StoredAuthAccount | undefined {
    return this.authAccounts.get(email.toLowerCase().trim());
  }

  public getProfileByEmail(email: string): UserProfile | undefined {
    const account = this.authAccounts.get(email.toLowerCase().trim());
    if (account) {
      return this.profiles.get(account.user_id);
    }
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === email.toLowerCase().trim()) {
        return p;
      }
    }
    return undefined;
  }

  public registerUser(data: {
    full_name: string;
    email: string;
    phone_number?: string | null;
    password_hash: string;
    password_salt: string;
    role?: import('../../src/types').UserRole;
    department?: string | null;
    year_of_study?: number | null;
  }): UserProfile {
    const now = new Date().toISOString();
    const id = uuidv4();
    const profile: UserProfile = {
      id,
      full_name: data.full_name.trim(),
      email: data.email.toLowerCase().trim(),
      phone_number: data.phone_number?.trim() || null,
      role: data.role || 'student',
      department: data.department || 'Campus Network User',
      year_of_study: data.year_of_study ?? null,
      created_at: now,
      updated_at: now,
    };

    this.profiles.set(id, profile);
    this.authAccounts.set(profile.email.toLowerCase(), {
      user_id: id,
      email: profile.email.toLowerCase(),
      phone_number: profile.phone_number,
      password_hash: data.password_hash,
      password_salt: data.password_salt,
      created_at: now,
    });

    return profile;
  }

  public createSession(userId: string): string {
    const token = AuthService.generateSessionToken();
    const expires_at = Date.now() + 7 * 24 * 3600 * 1000; // 7 days
    this.sessionTokens.set(token, { user_id: userId, expires_at });
    return token;
  }

  public getUserIdBySessionToken(token: string): string | null {
    if (!token) return null;
    const session = this.sessionTokens.get(token);
    if (!session) return null;
    if (Date.now() > session.expires_at) {
      this.sessionTokens.delete(token);
      return null;
    }
    return session.user_id;
  }

  public deleteSession(token: string): void {
    if (token) this.sessionTokens.delete(token);
  }

  // --- Chat Sessions ---
  public getChatSession(sessionId: string): ChatSession | undefined {
    return this.chatSessions.get(sessionId);
  }

  public createChatSession(userId: string, title?: string): ChatSession {
    const now = new Date().toISOString();
    const session: ChatSession = {
      id: uuidv4(),
      user_id: userId,
      title: title || 'NetSense Troubleshooting Assistant',
      messages: [],
      created_at: now,
      updated_at: now,
    };
    this.chatSessions.set(session.id, session);
    return session;
  }

  public addChatMessage(sessionId: string, sender: 'user' | 'assistant' | 'system', message: string, metadata?: any): ChatMessage | undefined {
    let session = this.chatSessions.get(sessionId);
    if (!session) {
      session = this.createChatSession('33333333-3333-3333-3333-333333333301');
      session.id = sessionId;
      this.chatSessions.set(sessionId, session);
    }
    const chatMsg: ChatMessage = {
      id: uuidv4(),
      session_id: sessionId,
      sender,
      message,
      metadata,
      created_at: new Date().toISOString(),
    };
    if (!session.messages) session.messages = [];
    session.messages.push(chatMsg);
    session.updated_at = new Date().toISOString();
    return chatMsg;
  }
}

// Export singleton database service
export const db = new NetworkDatabaseService();
