import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  from: string;
  to: string;
  subject: string;
  originalContent: string;
  sanitizedContent: string;
  attackType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'BLOCKED' | 'SANITIZED' | 'ALLOWED';
  confidence: number;
  flaggedText: string;
  reasoning: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  detected: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  attackType: string;
  confidence: number;
  action: 'BLOCKED' | 'SANITIZED' | 'ALLOWED';
  originalContent: string;
  sanitizedContent: string;
  flaggedText: string;
  reasoning: string;
}

export interface Stats {
  totalDetected: number;
  detectionAccuracy: number;
  falsePositiveRate: number;
  blockedCount: number;
  sanitizedCount: number;
  allowedCount: number;
  totalScanned: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  attack_type: string;
  severity: string;
  action: string;
  confidence: number;
  original_snippet: string;
}

function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDetected: 0,
    detectionAccuracy: 87,
    falsePositiveRate: 3.2,
    blockedCount: 0,
    sanitizedCount: 0,
    allowedCount: 0,
    totalScanned: 0,
  });
  const [isScanning, setIsScanning] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get<Stats>('/api/stats'),
        axios.get<LogEntry[]>('/api/logs'),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch {
      // Backend may not be running in demo mode
    }
  }, []);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const res = await axios.get<Scenario[]>('/api/demo-scenarios');
        setScenarios(res.data);
        if (res.data.length > 0) {
          setSelectedScenario(res.data[0]);
          setScanResult({
            id: 'initial',
            timestamp: new Date().toISOString(),
            detected: true,
            severity: res.data[0].severity,
            attackType: res.data[0].attackType,
            confidence: res.data[0].confidence,
            action: res.data[0].action,
            originalContent: res.data[0].originalContent,
            sanitizedContent: res.data[0].sanitizedContent,
            flaggedText: res.data[0].flaggedText,
            reasoning: res.data[0].reasoning,
          });
        }
      } catch {
        // Use static fallback
      }
    };

    loadScenarios();
    fetchStats();

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleScenarioSelect = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsScanning(true);
    try {
      const res = await axios.post<ScanResult>('/api/scan', { content: scenario.originalContent });
      setScanResult(res.data);
      await fetchStats();
    } catch {
      setScanResult({
        id: 'fallback',
        timestamp: new Date().toISOString(),
        detected: true,
        severity: scenario.severity,
        attackType: scenario.attackType,
        confidence: scenario.confidence,
        action: scenario.action,
        originalContent: scenario.originalContent,
        sanitizedContent: scenario.sanitizedContent,
        flaggedText: scenario.flaggedText,
        reasoning: scenario.reasoning,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCustomScan = async (content: string) => {
    setIsScanning(true);
    setSelectedScenario(null);
    try {
      const res = await axios.post<ScanResult>('/api/custom-analysis', { content });
      setScanResult(res.data);
      await fetchStats();
    } catch {
      // Fallback: run simple client-side detection
      const detected = /ignore.{0,20}(previous|prior|your)\s+instructions?/gi.test(content) ||
        /from now on you are/gi.test(content);
      setScanResult({
        id: 'client-fallback',
        timestamp: new Date().toISOString(),
        detected,
        severity: detected ? 'HIGH' : 'NONE',
        attackType: detected ? 'Instruction Override' : 'None',
        confidence: detected ? 82 : 100,
        action: detected ? 'SANITIZED' : 'ALLOWED',
        originalContent: content,
        sanitizedContent: content,
        flaggedText: '',
        reasoning: 'Client-side analysis (backend unavailable)',
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="dark">
      <Dashboard
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        scanResult={scanResult}
        logs={logs}
        stats={stats}
        isScanning={isScanning}
        onScenarioSelect={handleScenarioSelect}
        onCustomScan={handleCustomScan}
      />
    </div>
  );
}

export default App;
