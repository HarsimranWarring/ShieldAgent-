import { ArrowRight, ShieldOff, ShieldCheck } from 'lucide-react';
import { ScanResult } from '../App';

interface BeforeAfterComparisonProps {
  scanResult: ScanResult | null;
}

function renderWithStrikethrough(original: string, sanitized: string): React.ReactNode {
  if (!original || original === sanitized) {
    return <span className="text-gray-400 text-xs">{sanitized || 'No content'}</span>;
  }

  const lines = original.split('\n');
  const sanitizedLines = sanitized.split('\n');

  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const sanitizedLine = sanitizedLines[i] ?? '';
        const isAttack = sanitizedLine.includes('[INJECTION');

        if (isAttack) {
          return (
            <div key={i}>
              <span className="line-through text-red-500/70 text-xs font-mono">{line}</span>
              <br />
              <span className="text-orange-400 text-xs font-mono bg-orange-900/20 px-1 rounded">{sanitizedLine}</span>
            </div>
          );
        }
        return <span key={i} className="text-gray-400 text-xs font-mono">{line}{i < lines.length - 1 ? '\n' : ''}</span>;
      })}
    </div>
  );
}

export default function BeforeAfterComparison({ scanResult }: BeforeAfterComparisonProps) {
  if (!scanResult) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200">Before / After Comparison</h2>
        </div>
        <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
          Select a scenario to see the before/after comparison
        </div>
      </div>
    );
  }

  const hasInjection = scanResult.detected;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-200">Before / After Comparison</h2>
        {hasInjection && (
          <span className="ml-auto text-xs text-gray-500">
            {scanResult.action === 'BLOCKED' ? 'Request blocked entirely' : 'Malicious content removed'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
        {/* BEFORE */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldOff className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Before (Untrusted Input)</span>
          </div>
          <div className="bg-gray-900 border border-red-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="whitespace-pre-wrap text-xs font-mono text-gray-300 leading-relaxed">
              {hasInjection && scanResult.flaggedText ? (
                <>
                  {scanResult.originalContent.split(scanResult.flaggedText).map((part, i, arr) => (
                    <span key={i}>
                      <span className="text-gray-400">{part}</span>
                      {i < arr.length - 1 && (
                        <mark className="bg-red-900/50 border-b-2 border-red-500 text-red-300 not-italic px-0.5 rounded">
                          {scanResult.flaggedText}
                        </mark>
                      )}
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-gray-400">{scanResult.originalContent}</span>
              )}
            </div>
          </div>
          {hasInjection && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
              Injection detected in red
            </p>
          )}
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center justify-center pt-6">
          <div className="flex flex-col items-center gap-1">
            <div className="h-8 border-l-2 border-dashed border-gray-600" />
            <div className={`p-2 rounded-full ${hasInjection ? 'bg-orange-900/50 border border-orange-700' : 'bg-green-900/50 border border-green-700'}`}>
              <ArrowRight className={`w-4 h-4 ${hasInjection ? 'text-orange-400' : 'text-green-400'}`} />
            </div>
            <div className="h-8 border-l-2 border-dashed border-gray-600" />
          </div>
        </div>

        {/* AFTER */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">After (Sanitized Output)</span>
          </div>
          <div className="bg-gray-900 border border-green-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
            {hasInjection ? (
              renderWithStrikethrough(scanResult.originalContent, scanResult.sanitizedContent)
            ) : (
              <span className="text-gray-400 text-xs font-mono whitespace-pre-wrap">{scanResult.sanitizedContent}</span>
            )}
          </div>
          {hasInjection && (
            <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
              {scanResult.action === 'BLOCKED' ? 'Request blocked' : 'Injection removed'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
