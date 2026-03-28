import React from 'react';
import { Zap, Code2 } from 'lucide-react';
import type { MatchedPattern } from '@/lib/types';

interface CodeDiffProps {
  fileName: string;
  originalCode: string;
  optimizedCode: string;
  reasons: string[];
  explanation: string;
  savingRatio: string;
  matchedPatterns?: MatchedPattern[];
}

export const CodeDiff: React.FC<CodeDiffProps> = ({ 
  fileName, originalCode, optimizedCode, reasons, explanation, savingRatio, matchedPatterns
}) => {
  return (
    <div className="glass-emerald rounded-[2rem] overflow-hidden mt-6 animate-in slide-in-from-bottom-4 duration-500 shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
      <div className="border-b border-emerald-500/20 bg-charcoal-900/50 p-4 md:p-5 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Code2 className="text-emerald-500 w-5 h-5" />
          <h3 className="font-mono text-sm text-emerald-100">{fileName}</h3>
        </div>
        <span className="px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-medium rounded-full border border-emerald-500/30 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {savingRatio} Optimization Signal
        </span>
      </div>
      
      <div className="p-4 md:p-5 bg-red-900/10 border-b border-emerald-500/10">
        <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Anomalies Detected</h4>
        <ul className="list-disc pl-5 text-sm text-red-200/80 space-y-1">
          {reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        {matchedPatterns && matchedPatterns.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2">Matched Green Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {matchedPatterns.map((pattern) => (
                <span
                  key={pattern.id}
                  className="px-2 py-1 rounded-md border border-emerald-500/20 bg-emerald-900/20 text-emerald-200 text-xs"
                >
                  {pattern.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-emerald-500/20">
        <div className="p-0 bg-charcoal-900/80">
          <div className="px-4 py-3 bg-charcoal-900 text-xs text-gray-500 border-b border-emerald-500/10 flex justify-between">
             <span>Original (Energy Hungry)</span>
          </div>
          <pre className="p-4 md:p-5 overflow-auto max-h-[420px] text-xs font-mono text-gray-300">
            <code>{originalCode}</code>
          </pre>
        </div>
        
        <div className="p-0 bg-[#061510]">
          <div className="px-4 py-3 bg-emerald-900/20 text-xs text-emerald-400 border-b border-emerald-500/10 font-medium">
             Green Code (Optimized)
          </div>
          <pre className="p-4 md:p-5 overflow-auto max-h-[420px] text-xs font-mono text-emerald-200">
            <code>{optimizedCode}</code>
          </pre>
        </div>
      </div>
      
      <div className="p-4 md:p-5 bg-emerald-900/10 border-t border-emerald-500/20">
        <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">AI Explanation</h4>
        <p className="text-sm text-emerald-100/70 leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
};
