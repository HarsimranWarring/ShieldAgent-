import { Shield, Target, TrendingDown, BarChart3 } from 'lucide-react';
import { Stats } from '../App';

interface StatisticsPanelProps {
  stats: Stats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, subtext, icon, color, bgColor }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 border ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPanel({ stats }: StatisticsPanelProps) {
  const total = stats.blockedCount + stats.sanitizedCount;
  const blockedPct = total > 0 ? Math.round((stats.blockedCount / total) * 100) : 0;
  const sanitizedPct = total > 0 ? 100 - blockedPct : 0;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-gray-200">Statistics</h2>
      </div>

      <div className="space-y-3">
        <StatCard
          label="Total Attacks Detected"
          value={stats.totalDetected}
          subtext={`${stats.totalScanned} total scanned`}
          icon={<Shield className="w-4 h-4 text-blue-400" />}
          color="text-blue-400"
          bgColor="bg-blue-900/20 border-blue-900/50"
        />
        <StatCard
          label="Detection Accuracy"
          value={`${stats.detectionAccuracy.toFixed(1)}%`}
          subtext="Industry-leading precision"
          icon={<Target className="w-4 h-4 text-green-400" />}
          color="text-green-400"
          bgColor="bg-green-900/20 border-green-900/50"
        />
        <StatCard
          label="False Positive Rate"
          value={`${stats.falsePositiveRate.toFixed(1)}%`}
          subtext="Minimal operational disruption"
          icon={<TrendingDown className="w-4 h-4 text-purple-400" />}
          color="text-purple-400"
          bgColor="bg-purple-900/20 border-purple-900/50"
        />

        {/* Blocked vs Sanitized bar */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-3">Response Actions</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">Blocked</span>
                <span className="text-red-400">{stats.blockedCount} ({blockedPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${blockedPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400">Sanitized</span>
                <span className="text-orange-400">{stats.sanitizedCount} ({sanitizedPct}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sanitizedPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400">Allowed</span>
                <span className="text-green-400">{stats.allowedCount}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: stats.totalScanned > 0 ? `${Math.round((stats.allowedCount / stats.totalScanned) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
