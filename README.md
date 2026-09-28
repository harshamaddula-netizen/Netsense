# NetSense Campus 🌐

> **"Know the congestion before the complaints."**  
> *AI Assistant Tagline: "Try fixing it before you report it."*

NetSense Campus is an AI-powered campus network intelligence and support platform designed to solve the perennial college networking crisis: **network congestion caused by massive simultaneous device load, coupled with the lack of real-time visibility, automated incident correlation, and student self-service diagnostics.**

---

## 🌟 The Core Problem

College networks serve thousands of devices simultaneously (laptops, phones, lab workstations, IoT sensors, smart boards). During peak periods, congestion leads to:
- High latency, jitter, and packet loss
- Video buffering and disconnects during lectures/exams
- "Connected but no internet" captive portal states
- Asymmetric congestion where one floor's AP is saturated while another is idle

Students often don't know whether the problem is on their own machine, the local Wi-Fi, or the wider campus backbone. Meanwhile, IT administrators (NOC) receive dozens of vague *"Wi-Fi is slow"* complaints without location context or correlated telemetry.

---

## 🚀 The NetSense Campus Solution

NetSense transforms this problem into a structured engineering workflow:

$$\text{Detect} \longrightarrow \text{Diagnose} \longrightarrow \text{Understand} \longrightarrow \text{Report} \longrightarrow \text{Correlate} \longrightarrow \text{Assist} \longrightarrow \text{Resolve} \longrightarrow \text{Analyze} \longrightarrow \text{Predict}$$

### Key Pillars

1. **In-Browser Safe Client Diagnostics**: Measures client-to-gateway RTT latency, packet jitter, and request drop rates without installing native agents.
2. **Strict Telemetry Distinction**: All data displayed throughout the system is explicitly categorized:
   - `REAL TELEMETRY`: Hardware metrics from campus controller nodes.
   - `CLIENT MEASUREMENT`: In-browser latency & throughput probes.
   - `USER REPORT`: Crowd-sourced qualitative tickets submitted by students/faculty.
   - `DEMO DATA`: Clearly labeled synthetic stress scenarios for hackathon evaluation.
   - `AI-GENERATED ANALYSIS`: Insights synthesized by Google Gemini models.
   - `TREND-BASED INSIGHT`: Historical moving-average predictions.
3. **Automated Incident Correlation**: Groups reports submitted from the same building/floor within a 15-minute sliding window into prioritized actionable incidents with corroborating AP metrics.
4. **Campus Radio Heatmap**: Interactive 2D campus floor plan visualizing AP load, latency, and active outages across Engineering, Science, Library, Hostels, and Cafeteria.
5. **NetSense AI Assistant (Gemini)**: Conversational troubleshooting assistant that guides students step-by-step, checks for active local incidents, triggers safe diagnostics, and converts tickets directly to NOC engineers.
6. **Hackathon Simulation Engine**: Allows judges to test acute device concurrency surges (485 devices), upstream bottlenecks (265ms RTT), RF packet loss (16.5%), AP hardware blackout, and crowd complaint waves.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, TanStack Query, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript (`tsx`), CORS.
- **Database**: PostgreSQL / Supabase with Row Level Security (RLS) policies and seed data (`supabase/migrations/`).
  - *Zero Setup Friction*: Includes an intelligent local persistence engine so judges can evaluate the full system immediately without configuring external databases.
- **AI**: Official `@google/genai` SDK with strict JSON schema validation, safety bounds, and deterministic rule heuristics fallback.

---

## 📁 Project Structure

```
d:/Hackathon 1/
│
├── src/
│   ├── components/
│   │   ├── common/           # TelemetryBadge, UI components
│   │   └── layout/           # Navbar, Sidebar, AppLayout, ProtectedRoute
│   ├── context/              # AuthContext (Demo Personas & Location tracking)
│   ├── features/
│   │   ├── admin/            # AdminSimulatorPanel, ThresholdsManager
│   │   ├── ai/               # NetSenseAssistantModal, Chatbot
│   │   ├── analytics/        # AnalyticsDashboard (Recharts time-series)
│   │   ├── diagnostics/      # DiagnosticRunner, diagnosticSuite
│   │   ├── incidents/        # IncidentList, IncidentDetailModal
│   │   ├── network/          # CampusHeatmap, NetworkEngine
│   │   └── reports/          # ReportForm, ReportList
│   ├── lib/                  # Typed api client
│   ├── pages/                # All route views
│   ├── types/                # Core TypeScript interfaces
│   ├── utils/                # Pure network health calculation engine
│   ├── App.tsx               # Master route configuration
│   └── main.tsx              # React entry point
│
├── server/
│   ├── routes/               # Express REST APIs (auth, network, reports, incidents, etc.)
│   ├── services/
│   │   ├── db.ts             # Dual-mode persistence layer (Supabase + InMemory)
│   │   ├── geminiService.ts  # Google GenAI integration & schemas
│   │   ├── correlationService.ts # Sliding time-window report clusterer
│   │   └── simulationService.ts  # Demo scenario injector (DEMO DATA)
│   ├── validators/           # Zod input schemas
│   └── app.ts                # Express server entry point
│
├── supabase/
│   ├── migrations/           # 10 PostgreSQL tables, indexes & RLS rules
│   └── seed.sql              # Seed campus locations, baseline metrics & personas
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚡ Quick Start (Zero Setup Friction)

### 1. Prerequisites
- Node.js v18+ or v22+
- npm v10+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (optional):
```bash
cp .env.example .env
```
*(If `GEMINI_API_KEY` is omitted, the built-in heuristic intelligence engine automatically steps in to provide realistic responses).*

### 4. Run Development Server
```bash
# Starts both Express API server (port 5000) and Vite frontend (port 5173)
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🎭 Verified Demo Personas (One-Click Switcher)

Switch personas instantly using the profile dropdown in the top-right navbar:

| Persona | Role | Department | Viewpoint |
|---|---|---|---|
| **Alex Chen** | `student` | Computer Science (Year 3) | Diagnostics, Issue Reporting, Ticket Tracking |
| **Dr. Sarah Mitchell** | `faculty` | Information Technology | Faculty Diagnostics, Department Outage Awareness |
| **Marcus Vance** | `admin` | Network Operations Center (NOC) | Full Command Center, Incident Correlator, Simulator, SLA Thresholds, AI Hub |

---

## 🧪 Hackathon Demonstration Walkthrough Script

Follow these steps to demonstrate the end-to-end intelligence loop to judges:

### Step 1: Student Diagnostics & Self-Service
1. Log in as **Alex Chen (Student)**.
2. Select campus zone: **"Engineering Block - 2nd Floor Labs"**.
3. Navigate to **"Run Diagnostics"** (`/diagnostics`) and click **"Start Diagnostic Probe"**.
4. Observe the live multi-sample ping, RTT latency (ms), packet loss estimation, and jitter metrics.
5. Notice the clear `CLIENT MEASUREMENT` badge.

### Step 2: NetSense AI Assistant
1. Click the floating **"Ask NetSense AI"** button in the bottom right.
2. Ask: *"My internet is very slow and video is buffering."*
3. NetSense Assistant analyzes your current location and diagnostic telemetry.
4. It provides structured step-by-step guidance and offers a one-click button to **"Create Network Report"**.

### Step 3: Automated Incident Correlation
1. Click **"Report Issue"** (`/reports/new`).
2. Notice your diagnostic metrics (`latency RTT` & `packet loss`) are automatically attached.
3. Submit the report.
4. The backend **Incident Correlation Engine** evaluates reports in that location within the 15-minute sliding window and links it directly to the active incident with an `ATTACHED_TO_EXISTING` status!

### Step 4: Admin Command Center & AI Root Cause
1. Switch demo persona to **Marcus Vance (Admin)**.
2. Open the **"Operations Center"** (`/admin`).
3. View the **Interactive Campus Radio Heatmap** with color status rings (Green, Yellow, Red).
4. Click on the active incident in Engineering Block.
5. Switch to the **"AI Root Cause Analysis"** tab and click **"Generate Root Cause Report"**.
6. Google Gemini returns a synthesized executive summary, evidence list, root causes, and recommended engineering investigations.

### Step 5: Simulation Engine Stress Testing
1. Navigate to **"Demo Simulator"** (`/admin/simulator`).
2. Select target location and click **"2. High Device Concurrency Surge"** or **"5. Access Point Blackout"**.
3. Click **"Trigger Scenario"**.
4. Return to `/network` or `/admin`: Notice the zone updates to **CRITICAL (Red)** with prominent `DEMO DATA` badges, proving zero deception.
5. Click **"Reset to Normal Baseline"** to restore nominal campus state.

---

## 🔒 Security & Privacy Guarantees

- **No Credential Harvesting**: The platform never asks for Wi-Fi passwords, personal portal credentials, or OTPs.
- **Server-Side AI Secrets**: The `GEMINI_API_KEY` is strictly confined to the Express server environment and is never bundled into frontend assets.
- **Row Level Security (RLS)**: Enforced across all 10 PostgreSQL tables to prevent unauthorized users from viewing private tickets or modifying infrastructure thresholds.
- **Non-Invasive Diagnostics**: Probes use standard browser HTTP fetch timing against designated gateway ping endpoints; no unauthorized port scanning or packet sniffing is performed.

---

## 📄 License
MIT License. Built for the NetSense Campus collegiate hackathon initiative.
