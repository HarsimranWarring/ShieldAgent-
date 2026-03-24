import { Clock, Activity } from 'lucide-react';
import { LogEntry } from '../App';

interface DetectionLogProps {
  logs: LogEntry[];
}

const severityBadge: Record<string, string> = {
  CRITICAL: 'bg-red-900/50 text-red-400 border-red-800',
  HIGH: 'bg-orange-900/50 text-orange-400 border-orange-800',
  MEDIUM: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  LOW: 'bg-blue-900/50 text-blue-400 border-blue-800',
  NONE: 'bg-gray-700 text-gray-400 border-gray-600',
};

const actionBadge: Record<string, string> = {
  BLOCKED: 'text-red-400',
  SANITIZED: 'text-orange-400',
  ALLOWED: 'text-green-400',
};

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

export default function DetectionLog({ logs }: DetectionLogProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-green-400" />
        <h2 className="text-sm font-semibold text-gray-200">Detection Log</h2>
        <span className="ml-auto text-xs text-gray-500">{logs.length} events</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No detection events yet</p>
          <p className="text-xs text-gray-600 mt-1">Run a scan to see events here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`rounded-lg p-2.5 border ${
                log.severity === 'CRITICAL' ? 'bg-red-950/20 border-red-900/50' :
                log.severity === 'HIGH' ? 'bg-orange-950/20 border-orange-900/50' :
                'bg-gray-800 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-medium ${actionBadge[log.action] || 'text-gray-400'}`}>
                  {log.action}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${severityBadge[log.severity] || severityBadge.NONE}`}>
                  {log.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{log.attack_type}</p>
              <p className="text-xs text-gray-600 mt-1 truncate">{log.original_snippet}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-600">{formatTimestamp(log.timestamp)}</span>
                <span className="text-xs text-gray-500">{log.confidence}% conf.</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
