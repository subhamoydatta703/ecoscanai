'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Gauge, Leaf, ScanSearch, Sparkles } from 'lucide-react';
import { RepoInput } from '@/components/RepoInput';
import { HealthCard } from '@/components/HealthCard';
import { CodeDiff } from '@/components/CodeDiff';
import { scanRepository } from '@/lib/api';
import { getLiveAuditResult, setLiveAuditSnapshot } from '@/lib/live-audit';
import type { ScanResult } from '@/lib/types';

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(getLiveAuditResult);
  const [error, setError] = useState<string | null>(null);
  const formatSeconds = (value?: number) => `${(value || 0).toFixed(2)}s`;

  const handleScan = async (url: string, isLocal: boolean) => {
    setIsScanning(true);
    setError(null);
    try {
      const result = await scanRepository(url, isLocal);
      if (result.status === "error") {
        setError(result.message || "Failed to scan repository.");
      } else {
         setScanResult(result);
         setLiveAuditSnapshot(result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[980px] h-[420px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-24 right-0 w-[420px] h-[420px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[580px] left-24 w-[360px] h-[360px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-16 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-6">
          <header className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_350px] gap-5 items-stretch pt-5">
            <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-[linear-gradient(145deg,rgba(12,32,49,0.92),rgba(10,21,39,0.98))] p-6 md:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%)] pointer-events-none" />
              <div className="absolute right-[-60px] top-[-40px] h-48 w-48 rounded-full bg-emerald-400/5 blur-3xl pointer-events-none" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                    <Leaf className="w-4 h-4" />
                    Sustainable Audit Studio
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-900/45 border border-emerald-500/10 text-emerald-100/70 text-sm">
                    Advanced anomaly triage
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-4xl text-[2.7rem] md:text-[3.4rem] xl:text-[4.25rem] font-black tracking-[-0.045em] text-emerald-50 leading-[0.92]">
                    Audit code with a cleaner signal-to-noise ratio.
                  </h1>
                  <p className="text-emerald-100/60 max-w-2xl text-sm md:text-base leading-relaxed">
                    Surface structural hotspots, prioritize the strongest anomaly candidates, and review AI-backed optimization ideas in one place without wading through the whole repository.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-900/35 p-3.5">
                    <div className="flex items-center gap-3 text-emerald-300">
                      <ScanSearch className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">Structural Scan</span>
                    </div>
                    <p className="mt-2.5 text-sm font-medium text-emerald-50">Find suspicious files quickly</p>
                    <p className="mt-1.5 text-sm text-emerald-100/50">Complexity, sync-heavy paths, and repeat hotspots rise to the top first.</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-900/35 p-3.5">
                    <div className="flex items-center gap-3 text-emerald-300">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">AI Guidance</span>
                    </div>
                    <p className="mt-2.5 text-sm font-medium text-emerald-50">Review targeted optimizations</p>
                    <p className="mt-1.5 text-sm text-emerald-100/50">Suggestions stay grounded in the most meaningful anomaly candidates.</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-900/35 p-3.5">
                    <div className="flex items-center gap-3 text-emerald-300">
                      <Gauge className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-[0.2em]">Trend Memory</span>
                    </div>
                    <p className="mt-2.5 text-sm font-medium text-emerald-50">Carry the latest audit forward</p>
                    <p className="mt-1.5 text-sm text-emerald-100/50">Reports and Green Patterns can reflect the current scan while you stay in this tab.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full rounded-[2rem] border border-emerald-500/20 bg-[linear-gradient(145deg,rgba(6,24,20,0.94),rgba(7,15,30,0.96))] p-4.5 md:p-5 shadow-[0_30px_80px_rgba(0,0,0,0.2)] overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_42%)] pointer-events-none" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70">Audit Workflow</p>
                    <h2 className="text-[1.35rem] font-semibold text-emerald-50 mt-2 leading-tight">What happens after you hit scan</h2>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-emerald-300/70" />
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="rounded-[1.7rem] border border-emerald-900/30 bg-charcoal-900/45 p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-900/15 text-sm font-semibold text-emerald-300">
                        1
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-sm uppercase tracking-[0.18em] text-emerald-300">Scan structure</span>
                        <p className="text-sm text-emerald-100/60">Map suspicious hotspots fast, then rank the strongest anomaly candidates.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.7rem] border border-emerald-900/30 bg-charcoal-900/45 p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-900/15 text-sm font-semibold text-emerald-300">
                        2
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-sm uppercase tracking-[0.18em] text-emerald-300">Review AI output</span>
                        <p className="text-sm text-emerald-100/60">Compare original and optimized code with explanations tied to each file.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.7rem] border border-emerald-900/30 bg-charcoal-900/45 p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-900/15 text-sm font-semibold text-emerald-300">
                        3
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-sm uppercase tracking-[0.18em] text-emerald-300">Track recurring patterns</span>
                        <p className="text-sm text-emerald-100/60">Persist history so the same energy-hungry patterns keep surfacing across audits.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="-mt-2 md:-mt-4">
            <RepoInput onScan={handleScan} isLoading={isScanning} />
          </div>

          {error && (
            <div className="p-5 bg-red-900/35 border border-red-500/40 text-red-200 rounded-3xl mt-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
              <p className="font-semibold text-lg">Error Scanning Repository</p>
              <p className="text-sm opacity-80 mt-2">{error}</p>
            </div>
          )}

          {!scanResult && !error && (
            <section className="rounded-[2rem] border border-emerald-900/25 bg-[linear-gradient(145deg,rgba(8,18,32,0.8),rgba(8,17,30,0.55))] p-6 md:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/60">Why This Works</p>
                  <h2 className="text-2xl font-semibold text-emerald-50 mt-2">A cleaner review loop for sustainability-focused audits</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-charcoal-900/40 px-3 py-1.5 text-sm text-emerald-200/70">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Built for fast signal
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/35 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/60">Best for</p>
                  <h3 className="text-xl font-semibold text-emerald-50 mt-3">Repository triage</h3>
                  <p className="text-sm text-emerald-100/55 mt-3">Use the dashboard to quickly identify which files deserve a deeper performance or sustainability pass first.</p>
                </div>
                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/35 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/60">Result quality</p>
                  <h3 className="text-xl font-semibold text-emerald-50 mt-3">Focused, not noisy</h3>
                  <p className="text-sm text-emerald-100/55 mt-3">EcoScan prioritizes the strongest anomaly candidates so the review output stays usable even on larger repos.</p>
                </div>
                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/35 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-400/60">After the scan</p>
                  <h3 className="text-xl font-semibold text-emerald-50 mt-3">The latest scan stays portable</h3>
                  <p className="text-sm text-emerald-100/55 mt-3">Move to Reports and Green Patterns in the same tab to inspect the current audit without storing shared history.</p>
                </div>
              </div>
            </section>
          )}

          {scanResult && !error && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="rounded-[2rem] border border-emerald-500/15 bg-[linear-gradient(145deg,rgba(10,23,35,0.88),rgba(7,17,29,0.94))] p-6 md:p-7 shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
                 <div className="flex items-start justify-between gap-4 flex-wrap">
                   <div>
                     <p className="text-xs uppercase tracking-[0.22em] text-emerald-400/60">Latest Audit Result</p>
                     <h2 className="text-3xl font-semibold text-emerald-50 mt-2">Repository findings at a glance</h2>
                     <p className="text-sm text-emerald-100/55 mt-3 max-w-2xl">
                       Review the health score, timing breakdown, and the highest-priority anomaly candidates from the most recent audit run.
                     </p>
                   </div>
                   <div className="rounded-full border border-emerald-500/20 bg-emerald-900/20 px-4 py-2 text-sm text-emerald-200/85">
                     {scanResult.repository}
                   </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <HealthCard 
                   score={scanResult.health_score || 0}
                   totalFiles={scanResult.total_files_scanned || 0}
                   anomalies={scanResult.anomalies_found || 0}
                 />
                 
                 <div className="glass-emerald rounded-[2rem] p-6 md:p-7 relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_42%)] pointer-events-none" />
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/70">Audit Summary</p>
                        <h3 className="text-2xl font-semibold text-emerald-50 mt-2">Latest Repository Pass</h3>
                        <p className="text-sm text-emerald-100/55 mt-2">A compact snapshot of what happened after clone, scan, anomaly detection, and AI review.</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-500/10 bg-charcoal-900/45 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wide text-emerald-400/70">Anomalies reviewed</p>
                        <p className="text-2xl font-black text-emerald-300 mt-1">{scanResult.flagged_files?.length || 0}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                       <p className="text-sm text-gray-300">
                         <strong>Target:</strong> <span className="text-emerald-400">{scanResult.repository}</span>
                       </p>
                       <p className="text-sm text-gray-300 border-t border-emerald-900/50 pt-3">
                         Scanned {scanResult.total_files_scanned} files. 
                         Isolation Forest detected {scanResult.anomalies_found} anomalies based on structural complexity.
                       </p>
                       {scanResult.timings && (
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-900/50">
                           <div className="rounded-2xl bg-charcoal-900/50 border border-emerald-900/30 p-3">
                             <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Scan</p>
                             <p className="text-lg font-semibold text-emerald-100 mt-1">{formatSeconds(scanResult.timings.scan_seconds)}</p>
                           </div>
                           <div className="rounded-2xl bg-charcoal-900/50 border border-emerald-900/30 p-3">
                             <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">ML</p>
                             <p className="text-lg font-semibold text-emerald-100 mt-1">{formatSeconds(scanResult.timings.ml_seconds)}</p>
                           </div>
                           <div className="rounded-2xl bg-charcoal-900/50 border border-emerald-900/30 p-3">
                             <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">AI</p>
                             <p className="text-lg font-semibold text-emerald-100 mt-1">{formatSeconds(scanResult.timings.ai_seconds)}</p>
                           </div>
                         </div>
                       )}
                    </div>
                 </div>
               </div>

               {scanResult.flagged_files && scanResult.flagged_files.length > 0 && (
                 <div className="mt-12 space-y-8 pb-20">
                    <div className="flex items-end justify-between gap-4 border-b border-emerald-900/50 pb-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-emerald-50">
                          Top Energy-Hungry Files
                        </h2>
                        <p className="text-sm text-emerald-100/50 mt-2">
                          The most suspicious files are expanded below with original code, proposed optimization, and reasoning.
                        </p>
                      </div>
                    </div>
                    
                    {scanResult.flagged_files.map((file, index: number) => (
                      <CodeDiff 
                        key={index}
                        fileName={file.file_path}
                        originalCode={file.original_code || ""}
                        optimizedCode={file.optimized_code || ""}
                        reasons={file.anomaly_reasons || ["Complex code pattern detected"]}
                        explanation={file.ai_explanation || "No AI explanation available."}
                        savingRatio={file.carbon_saving_ratio || "Unknown"}
                        matchedPatterns={file.matched_patterns || []}
                      />
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </>
  );
}
