import { useState } from 'react';
import { Search, Mail, AlertOctagon, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Scenario, ScanResult } from '../App';

interface AttackVisualizationProps {
  selectedScenario: Scenario | null;
  scanResult: ScanResult | null;
  isScanning: boolean;
  onCustomScan: (content: string) => void;
}

function highlightAttackText(content: string, flaggedText: string): React.ReactNode {
  if (!flaggedText || !content.includes(flaggedText)) {
    return <span>{content}</span>;
  }
  const parts = content.split(flaggedText);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="highlight-attack">{flaggedText}</mark>
          )}
        </span>
      ))}
    </>
  );
}

export default function AttackVisualization({
  selectedScenario,
  scanResult,
  isScanning,
  onCustomScan,
}: AttackVisualizationProps) {
  const [customInput, setCustomInput] = useState('');

  const actionColor = {
    BLOCKED: 'text-red-400 bg-red-900/30 border-red-700',
    SANITIZED: 'text-orange-400 bg-orange-900/30 border-orange-700',
    ALLOWED: 'text-green-400 bg-green-900/30 border-green-700',
  };

  const ActionIcon = scanResult?.action === 'BLOCKED' ? AlertOctagon :
    scanResult?.action === 'SANITIZED' ? AlertTriangle : CheckCircle;

  return (
    <div className="space-y-4">
      {/* Current Analysis Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-200">Attack Visualization</h2>
          </div>
          {isScanning && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}
          {scanResult && !isScanning && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${actionColor[scanResult.action]}`}>
              <ActionIcon className="w-3.5 h-3.5" />
              {scanResult.action}
            </div>
          )}
        </div>

        {/* Email Header */}
        {selectedScenario && (
          <div className="bg-gray-900 rounded-lg p-3 mb-3 space-y-1.5 border border-gray-700">
            <div className="flex gap-2 text-xs">
              <span className="text-gray-500 w-14 flex-shrink-0">FROM:</span>
              <span className="text-blue-300">{selectedScenario.from}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-gray-500 w-14 flex-shrink-0">TO:</span>
              <span className="text-gray-300">{selectedScenario.to}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-gray-500 w-14 flex-shrink-0">SUBJECT:</span>
              <span className="text-gray-300 font-medium">{selectedScenario.subject}</span>
            </div>
          </div>
        )}

        {/* Email Body with Highlighted Attack */}
        {scanResult ? (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-mono text-xs">
            {highlightAttackText(scanResult.originalContent, scanResult.flaggedText)}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Select a scenario from the left panel</p>
          </div>
        )}

        {/* Detection Metadata */}
        {scanResult && scanResult.detected && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-gray-900 rounded-lg p-2 text-center border border-gray-700">
              <p className="text-xs text-gray-500">Attack Type</p>
              <p className="text-xs font-semibold text-orange-400 mt-1">{scanResult.attackType}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center border border-gray-700">
              <p className="text-xs text-gray-500">Severity</p>
              <p className={`text-xs font-semibold mt-1 ${
                scanResult.severity === 'CRITICAL' ? 'text-red-400' :
                scanResult.severity === 'HIGH' ? 'text-orange-400' :
                scanResult.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-blue-400'
              }`}>{scanResult.severity}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-2 text-center border border-gray-700">
              <p className="text-xs text-gray-500">Confidence</p>
              <p className="text-xs font-semibold text-green-400 mt-1">{scanResult.confidence}%</p>
            </div>
          </div>
        )}

        {/* Reasoning */}
        {scanResult?.reasoning && (
          <div className="mt-3 bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1 font-medium">Detection Reasoning</p>
            <p className="text-xs text-gray-400 leading-relaxed">{scanResult.reasoning}</p>
          </div>
        )}
      </div>

      {/* Custom Scanner */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-gray-200">Custom Prompt Scanner</h2>
        </div>
        <textarea
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          placeholder="Paste any prompt or email content to scan for injection attacks..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          rows={4}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">{customInput.length} characters</p>
          <button
            onClick={() => { if (customInput.trim()) onCustomScan(customInput.trim()); }}
            disabled={!customInput.trim() || isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scan Content
          </button>
        </div>
      </div>
    </div>
  );
}
