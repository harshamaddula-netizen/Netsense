import React, { useState } from 'react';
import { api } from '../../lib/api';
import { CampusLocation, SimulatorScenario } from '../../types';
import { TelemetryBadge } from '../../components/common/TelemetryBadge';
import {
  Play,
  RotateCcw,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  Zap,
  Radio,
  CheckCircle,
  HelpCircle,
  FileText,
  Loader2,
} from 'lucide-react';

interface AdminSimulatorPanelProps {
  locations: CampusLocation[];
  onScenarioTriggered?: () => void;
}

export const AdminSimulatorPanel: React.FC<AdminSimulatorPanelProps> = ({
  locations,
  onScenarioTriggered,
}) => {
  const [selectedLocId, setSelectedLocId] = useState(locations[0]?.id || '');
  const [activeScenario, setActiveScenario] = useState<SimulatorScenario | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [simulationOutput, setSimulationOutput] = useState<any | null>(null);

  const scenarios: Array<{
    id: SimulatorScenario;
    title: string;
    description: string;
    icon: any;
    color: string;
    border: string;
  }> = [
    {
      id: 'NORMAL',
      title: '1. Nominal Campus Baseline',
      description: 'Restores all APs to optimal throughput (<25ms RTT, 0.1% loss, balanced devices).',
      icon: CheckCircle,
      color: 'text-emerald-400 bg-emerald-500/10',
      border: 'border-emerald-500/30 hover:border-emerald-400',
    },
    {
      id: 'HIGH_LOAD',
      title: '2. High Device Concurrency Surge',
      description: 'Simulates 485 devices flooding a single lecture AP, saturating wireless airtime.',
      icon: Users,
      color: 'text-amber-400 bg-amber-500/10',
      border: 'border-amber-500/30 hover:border-amber-400',
    },
    {
      id: 'HIGH_LATENCY',
      title: '3. Upstream Gateway Congestion',
      description: 'Injects 265ms average round-trip time and bufferbloat to simulate an ISP bottleneck.',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10',
      border: 'border-amber-500/30 hover:border-amber-400',
    },
    {
      id: 'PACKET_LOSS',
      title: '4. Severe RF Radio Interference',
      description: 'Simulates 16.5% packet drop from microwave / physical shielding obstruction.',
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10',
      border: 'border-rose-500/30 hover:border-rose-400',
    },
    {
      id: 'OUTAGE',
      title: '5. Access Point Blackout',
      description: 'Simulates complete AP hardware failure / severed PoE uplink (0% availability).',
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10',
      border: 'border-rose-500/30 hover:border-rose-400',
    },
    {
      id: 'CROWD_BURST',
      title: '6. Crowd Complaint Wave (Auto-Correlate)',
      description: 'Generates 4 simultaneous student reports to trigger the Incident Correlation Engine.',
      icon: FileText,
      color: 'text-purple-400 bg-purple-500/10',
      border: 'border-purple-500/30 hover:border-purple-400',
    },
  ];

  const handleTrigger = async (scenario: SimulatorScenario) => {
    setIsTriggering(true);
    setActiveScenario(scenario);
    try {
      const res = await api.triggerSimulation(scenario, selectedLocId);
      setSimulationOutput(res);
      onScenarioTriggered?.();
    } catch (err: any) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 rounded-2xl glass-panel-glow border border-amber-500/40 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base font-bold text-slate-100">Hackathon Simulation Engine</h2>
            <TelemetryBadge type="DEMO" size="sm" />
          </div>
          <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            DEMO MODE
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Because real college router controllers are often proprietary or offline during judging, this engine injects authentic synthetic stress scenarios. Every simulated metric is strictly stamped with <span className="font-mono text-amber-300 font-semibold">DEMO DATA</span> tags throughout all dashboards.
        </p>
      </div>

      {/* Target Location Picker */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <span>Target Campus AP Zone:</span>
          <select
            value={selectedLocId}
            onChange={(e) => setSelectedLocId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-teal-300 focus:outline-none focus:border-teal-500 font-sans"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleTrigger('NORMAL')}
          disabled={isTriggering}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Normal Baseline</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = activeScenario === sc.id;

          return (
            <div
              key={sc.id}
              className={`p-4 rounded-xl glass-panel border transition-all duration-200 flex flex-col justify-between space-y-3 ${sc.border} ${
                isSelected ? 'ring-2 ring-teal-400' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${sc.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-slate-100">{sc.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.description}</p>
              </div>

              <button
                onClick={() => handleTrigger(sc.id)}
                disabled={isTriggering}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 text-slate-200 transition-colors"
              >
                {isTriggering && isSelected ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Injecting Scenario...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current text-teal-400" />
                    <span>Trigger Scenario</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Output Log */}
      {simulationOutput && (
        <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-teal-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-teal-400" />
              <span>Simulation Execution Acknowledged</span>
            </span>
            <TelemetryBadge type="DEMO" size="xs" />
          </div>
          <p className="text-xs text-slate-200">{simulationOutput.message}</p>
          <pre className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded-lg overflow-x-auto">
            {JSON.stringify(simulationOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
