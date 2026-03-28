import React, { useState } from 'react';
import { Search, FolderOpen, Loader2 } from 'lucide-react';

interface RepoInputProps {
  onScan: (url: string, isLocal: boolean) => void;
  isLoading: boolean;
}

export const RepoInput: React.FC<RepoInputProps> = ({ onScan, isLoading }) => {
  const [url, setUrl] = useState('');
  const trimmedValue = url.trim();

  const looksLikeLocalPath = (value: string) => {
    return /^(?:[A-Za-z]:[\\/]|\\\\|\/|\.{1,2}[\\/])/.test(value);
  };

  const inputMode = !trimmedValue
    ? 'Awaiting input'
    : looksLikeLocalPath(trimmedValue)
      ? 'Local path detected'
      : 'Remote repository detected';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      const isLocal = looksLikeLocalPath(url.trim());
      onScan(url, isLocal);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-[2.25rem] border border-emerald-500/15 bg-[linear-gradient(145deg,rgba(7,26,22,0.94),rgba(9,25,40,0.9))] p-5 md:p-6 shadow-[0_35px_90px_rgba(0,0,0,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_34%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-12 h-24 w-24 rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 xl:grid-cols-[0.78fr_1.22fr] gap-6 items-start">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-900/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-300/80">
              Launch Audit
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-charcoal-950/35 px-3 py-1 text-xs text-emerald-200/70">
              Quick repository triage
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-emerald-50">Scan a repository or local project</h2>
            <p className="text-sm md:text-base text-emerald-100/55 max-w-xl leading-relaxed">
              Start with a GitHub repo or local folder. EcoScan will inspect structural hotspots first, then generate targeted optimization guidance for the strongest anomaly candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/25 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Step 1</p>
              <p className="text-sm font-medium text-emerald-100 mt-2">Paste repo URL or local path</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/25 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Step 2</p>
              <p className="text-sm font-medium text-emerald-100 mt-2">Review top anomalies</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/25 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Step 3</p>
              <p className="text-sm font-medium text-emerald-100 mt-2">Track patterns over time</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(7,18,30,0.82),rgba(6,18,26,0.58))] p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/60">Repository Target</p>
                <p className="text-sm text-emerald-100/55 mt-2">Paste a remote repo or local folder and launch the audit from here.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-xs text-emerald-200/85">
                {inputMode}
              </span>
            </div>

            <div className="rounded-[1.6rem] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(7,19,31,0.88),rgba(6,20,26,0.68))] p-3 md:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FolderOpen className="h-5 w-5 text-emerald-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-4 md:py-5 bg-transparent rounded-2xl text-base md:text-lg text-emerald-50 placeholder-emerald-700/50 focus:outline-none"
                  placeholder="Enter GitHub URL or local path"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/35 px-4 py-3 min-w-[280px] flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-500/60">Examples</p>
                <p className="text-sm text-emerald-100/55 mt-3 leading-relaxed">
                  Examples: <span className="text-emerald-200/80">https://github.com/org/repo.git</span> or <span className="text-emerald-200/80">C:/projects/my-app</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={!url || isLoading}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 text-sm text-white font-semibold transition-all hover:from-emerald-500 hover:to-teal-400 focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_16px_28px_rgba(16,185,129,0.18)] min-w-[160px]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>{isLoading ? 'Scanning...' : 'Run Audit'}</span>
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-charcoal-900/55 border border-emerald-900/40 text-[11px] text-emerald-200/75">
              Fast structural scan
            </span>
            <span className="px-2.5 py-1 rounded-full bg-charcoal-900/55 border border-emerald-900/40 text-[11px] text-emerald-200/75">
              Top anomaly explanations
            </span>
            <span className="px-2.5 py-1 rounded-full bg-charcoal-900/55 border border-emerald-900/40 text-[11px] text-emerald-200/75">
              Pattern matching
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
