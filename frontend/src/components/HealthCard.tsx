import React from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthCardProps {
  score: number;
  totalFiles: number;
  anomalies: number;
}

export const HealthCard: React.FC<HealthCardProps> = ({ score, totalFiles, anomalies }) => {
  let scoreColor = "text-emerald-400";
  let bgGlow = "shadow-[0_0_30px_rgba(16,185,129,0.2)]";
  let scoreLabel = "Healthy";
  let scoreCopy = "The repository looks structurally stable with a lighter anomaly load.";
  
  if (score < 50) {
    scoreColor = "text-red-400";
    bgGlow = "shadow-[0_0_30px_rgba(248,113,113,0.2)]";
    scoreLabel = "Needs Attention";
    scoreCopy = "High-cost patterns are likely concentrated in a few files and worth reviewing first.";
  } else if (score < 80) {
    scoreColor = "text-amber-400";
    bgGlow = "shadow-[0_0_30px_rgba(251,191,36,0.2)]";
    scoreLabel = "Watchlist";
    scoreCopy = "The codebase is workable, but there are enough hotspots to justify a targeted cleanup pass.";
  }

  return (
    <div className={`glass-emerald rounded-[2rem] p-6 md:p-7 relative overflow-hidden ${bgGlow} shadow-[0_28px_70px_rgba(0,0,0,0.18)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_40%)] pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity className="w-32 h-32" />
      </div>
      
      <div className="relative flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-medium text-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Repository Health Score
          </h2>
          <p className="text-sm text-emerald-100/55 mt-2">{scoreCopy}</p>
        </div>
        <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-charcoal-900/45 text-xs uppercase tracking-[0.18em] text-emerald-300/85">
          {scoreLabel}
        </span>
      </div>
      
      <div className="relative flex items-end gap-4 mb-8">
        <div className={`text-6xl font-black tracking-tighter ${scoreColor}`}>
          {score}
        </div>
        <div className="text-emerald-500/50 text-xl mb-1">/ 100</div>
      </div>

      <div className="w-full h-3 rounded-full bg-charcoal-900/60 border border-emerald-900/30 overflow-hidden mb-8">
        <div
          className={`h-full rounded-full ${
            score < 50 ? 'bg-gradient-to-r from-red-500 to-red-300' :
            score < 80 ? 'bg-gradient-to-r from-amber-500 to-yellow-300' :
            'bg-gradient-to-r from-emerald-500 to-emerald-300'
          }`}
          style={{ width: `${Math.max(6, Math.min(score, 100))}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 relative">
        <div className="bg-charcoal-900/50 rounded-2xl py-3 px-4 border border-emerald-900/40">
          <div className="text-sm text-emerald-500/70 mb-1">Files Scanned</div>
          <div className="text-2xl font-semibold text-emerald-100">{totalFiles}</div>
        </div>
        <div className="bg-charcoal-900/50 rounded-2xl py-3 px-4 border border-emerald-900/40">
          <div className="text-sm text-emerald-500/70 mb-1 flex items-center gap-1">
             <AlertTriangle className="w-3 h-3 text-amber-500" />
             Anomalies
          </div>
          <div className="text-2xl font-semibold text-emerald-100">{anomalies}</div>
        </div>
      </div>
    </div>
  );
};
