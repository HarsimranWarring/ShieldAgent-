import { Shield } from 'lucide-react';
import { Scenario, ScanResult, Stats, LogEntry } from '../App';
import DemoScenarios from './DemoScenarios';
import AttackVisualization from './AttackVisualization';
import BeforeAfterComparison from './BeforeAfterComparison';
import StatisticsPanel from './StatisticsPanel';
import DetectionLog from './DetectionLog';

interface DashboardProps {
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  scanResult: ScanResult | null;
  logs: LogEntry[];
  stats: Stats;
  isScanning: boolean;
  onScenarioSelect: (scenario: Scenario) => void;
  onCustomScan: (content: string) => void;
}

export default function Dashboard({
  scenarios,
  selectedScenario,
  scanResult,
  logs,
  stats,
  isScanning,
  onScenarioSelect,
  onCustomScan,
}: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">ShieldAgent</h1>
              <p className="text-xs text-gray-400">AI Security Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Protection Active</span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Detection Accuracy</p>
              <p className="text-sm font-bold text-blue-400">{stats.detectionAccuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-screen-2xl mx-auto p-4 grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-4">
        {/* Left Sidebar - Demo Scenarios */}
        <aside className="xl:h-[calc(100vh-100px)] xl:overflow-y-auto">
          <DemoScenarios
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            onSelect={onScenarioSelect}
          />
        </aside>

        {/* Main Content */}
        <main className="space-y-4 min-w-0">
          <AttackVisualization
            selectedScenario={selectedScenario}
            scanResult={scanResult}
            isScanning={isScanning}
            onCustomScan={onCustomScan}
          />
          <BeforeAfterComparison scanResult={scanResult} />
        </main>

        {/* Right Panel */}
        <aside className="space-y-4 xl:h-[calc(100vh-100px)] xl:overflow-y-auto">
          <StatisticsPanel stats={stats} />
          <DetectionLog logs={logs} />
        </aside>
      </div>
    </div>
  );
}
