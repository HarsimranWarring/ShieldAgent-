import { AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import { Scenario } from '../App';

interface DemoScenariosProps {
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  onSelect: (scenario: Scenario) => void;
}

const severityColors = {
  CRITICAL: 'bg-red-900/40 border-red-700 text-red-400',
  HIGH: 'bg-orange-900/40 border-orange-700 text-orange-400',
  MEDIUM: 'bg-yellow-900/40 border-yellow-700 text-yellow-400',
  LOW: 'bg-blue-900/40 border-blue-700 text-blue-400',
};

const attackTypeIcons: Record<string, string> = {
  'Instruction Override': '⚡',
  'Role Reassignment': '🎭',
  'Data Exfiltration': '💾',
  'Privilege Escalation': '🔑',
  'Safety Bypass': '🛡️',
  'Indirect Injection': '🕸️',
};

export default function DemoScenarios({ scenarios, selectedScenario, onSelect }: DemoScenariosProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-gray-200">Demo Scenarios</h2>
        <span className="ml-auto text-xs text-gray-500">{scenarios.length} attacks</span>
      </div>

      <div className="space-y-2">
        {scenarios.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 animate-pulse rounded-lg" />
          ))
        ) : (
          scenarios.map((scenario, index) => {
            const isSelected = selectedScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-900/40 border-blue-600 ring-1 ring-blue-500/50'
                    : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {attackTypeIcons[scenario.attackType] || '⚠️'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 flex-shrink-0">#{index + 1}</span>
                        <p className="text-xs font-semibold text-gray-200 truncate">{scenario.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{scenario.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 flex-shrink-0 mt-0.5 transition-transform ${isSelected ? 'text-blue-400 rotate-90' : 'text-gray-600'}`} />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColors[scenario.severity]}`}>
                    {scenario.severity}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    scenario.action === 'BLOCKED' ? 'bg-red-800 text-red-300' :
                    scenario.action === 'SANITIZED' ? 'bg-orange-800 text-orange-300' :
                    'bg-green-800 text-green-300'
                  }`}>
                    {scenario.action}
                  </span>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 mt-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400">{scenario.attackType}</span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
