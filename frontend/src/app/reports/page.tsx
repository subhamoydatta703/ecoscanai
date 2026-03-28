'use client';

import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, FolderGit2, Loader2, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import { getReports, resetAuditHistory } from '@/lib/api';
import type { ReportsResponse } from '@/lib/types';

export default function ReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  async function fetchReports() {
    try {
      const result = await getReports();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch reports data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleReset() {
    if (!window.confirm('Reset all stored audit history? This will clear Reports and Green Patterns usage data.')) {
      return;
    }

    setResetting(true);
    try {
      await resetAuditHistory();
      await fetchReports();
    } catch (err) {
      console.error('Failed to reset audit history:', err);
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center bg-charcoal-950">
           <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
     );
  }

  const history = data?.history || [];
  const hasSingleEntry = history.length === 1;
  const latestScan = data?.recent_scans?.[0];
  const chartColumns =
    history.length === 2
      ? "grid-cols-2"
      : "grid-cols-2 md:grid-cols-4";

  return (
    <>
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 left-12 w-[360px] h-[360px] bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-10 pt-8 pb-16">
          <header className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
            <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                <Activity className="w-4 h-4" />
                Audit Intelligence
              </div>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/60 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Resetting...' : 'Reset History'}
              </button>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-50">
              Audit Reports
            </h1>
            <p className="text-emerald-100/60 text-lg max-w-3xl leading-relaxed">
              Real scan history across your repositories: health score movement, anomaly volume, files scanned, and the patterns your audits are surfacing most often.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                Trend visibility
              </span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                Pattern activity
              </span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                Resettable history
              </span>
            </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[linear-gradient(145deg,rgba(6,24,20,0.9),rgba(7,15,30,0.92))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_42%)] pointer-events-none" />
              <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                <Sparkles className="w-4 h-4" />
                Snapshot
              </div>
              <div className="flex items-end justify-between gap-4 mt-4">
                <div>
                  <h2 className="text-3xl font-black text-emerald-50">Latest signal</h2>
                  <p className="text-sm text-emerald-100/55 mt-2">
                    {latestScan ? `${latestScan.repository_label} was your most recent recorded audit.` : 'Run a scan to start building a history timeline.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-charcoal-950/40 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Latest Score</p>
                  <p className="text-3xl font-black text-emerald-300 mt-1">{data?.latest_health_score || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Latest Health</p>
                  <p className="text-3xl font-black text-emerald-300 mt-2">{data?.latest_health_score || 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Delta</p>
                  <p className="text-3xl font-black text-emerald-300 mt-2">{data?.health_delta || '0'}</p>
                </div>
                <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Pattern Hits</p>
                  <p className="text-3xl font-black text-emerald-300 mt-2">{data?.pattern_usage.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/40 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500/60">Recent Audits</p>
                  <p className="text-3xl font-black text-emerald-300 mt-2">{data?.recent_scans.length || 0}</p>
                </div>
              </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-24 h-24"/></div>
               <h3 className="text-emerald-300 mb-2 font-medium">Average Health Score</h3>
               <div className="text-4xl font-black text-emerald-500">{data?.average_health_score || 0}</div>
               <p className="text-sm text-emerald-200/50 mt-2">Latest scan {data?.latest_health_score || 0} | {data?.health_delta || "0"} vs previous</p>
               <div className="mt-5 h-1.5 rounded-full bg-charcoal-950/60 overflow-hidden">
                 <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-300" style={{ width: `${Math.max(10, Math.min(data?.average_health_score || 0, 100))}%` }} />
               </div>
            </div>

            <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="w-24 h-24"/></div>
               <h3 className="text-emerald-300 mb-2 font-medium">Anomalies Detected</h3>
               <div className="text-4xl font-black text-emerald-400">{data?.total_anomalies_found || 0}</div>
               <p className="text-sm text-emerald-200/50 mt-2">{data?.critical_patterns_detected || 0} critical complexity matches</p>
               <div className="mt-5 flex items-center gap-2 text-xs text-emerald-300/70">
                 <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-charcoal-950/40">Observed across history</span>
               </div>
            </div>

            <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><FolderGit2 className="w-24 h-24"/></div>
               <h3 className="text-emerald-300 mb-2 font-medium">Repositories Audited</h3>
               <div className="text-4xl font-black text-emerald-300">{data?.repositories_scanned || 0}</div>
               <p className="text-sm text-emerald-200/50 mt-2">{data?.total_scans || 0} total scans | {data?.total_files_scanned || 0} files inspected</p>
               <div className="mt-5 flex items-center gap-2 text-xs text-emerald-300/70">
                 <span className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-charcoal-950/40">Persistent history</span>
               </div>
            </div>

          </div>

          <div className="glass bg-charcoal-900/60 rounded-3xl p-8 border border-emerald-900/30 space-y-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium text-emerald-100">{data?.chart_status || "Initializing..."}</h2>
                <p className="text-emerald-500/50 text-sm mt-2">
                  Each bar represents a recent repository audit. Higher bars mean healthier repositories.
                </p>
              </div>
              <BarChart2 className="w-10 h-10 text-emerald-500/30" />
            </div>

            {data && history.length > 1 ? (
              <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-8 items-start">
                <div className="space-y-8">
                <div className={`grid gap-4 items-end min-h-[220px] ${chartColumns}`}>
                  {history.map((entry) => {
                    const barHeight = Math.max(16, Math.min(100, entry.health_score));
                    return (
                    <div key={`${entry.label}-${entry.scanned_at}`} className="space-y-3">
                      <div className="h-40 rounded-2xl bg-charcoal-900/60 border border-emerald-900/30 p-3 flex items-end">
                        <div className="relative h-full w-full rounded-xl bg-charcoal-950/60 border border-emerald-900/20 overflow-hidden">
                          <div
                            className="absolute inset-x-0 bottom-0 rounded-b-xl shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                            style={{
                              height: `${barHeight}%`,
                              minHeight: "24px",
                              background: "linear-gradient(to top, rgba(16,185,129,0.95), rgba(110,231,183,0.9))",
                            }}
                          />
                          <div className="absolute top-3 right-3 text-xs font-semibold text-emerald-100 bg-charcoal-950/70 border border-emerald-900/30 rounded-md px-2 py-1">
                            {entry.health_score}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-100 truncate">{entry.label}</p>
                        <p className="text-xs text-emerald-500/60">
                          Score {entry.health_score} | {entry.anomalies_found} anomalies
                        </p>
                      </div>
                    </div>
                  )})}
                </div>

                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-medium text-emerald-100">Health Trend Notes</h3>
                    <span className="text-xs uppercase tracking-[0.18em] text-emerald-500/60">Recent history</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="rounded-2xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-500/60">Latest score</p>
                      <p className="text-2xl font-semibold text-emerald-100 mt-2">{data.latest_health_score}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-500/60">Average</p>
                      <p className="text-2xl font-semibold text-emerald-100 mt-2">{data.average_health_score}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-500/60">Delta</p>
                      <p className="text-2xl font-semibold text-emerald-100 mt-2">{data.health_delta}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/50 p-5">
                  <h3 className="text-lg font-medium text-emerald-100 mb-4">Recent Audits</h3>
                  <div className="space-y-3">
                    {data.recent_scans.map((scan) => (
                      <div key={`${scan.repository}-${scan.scanned_at}`} className="rounded-xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                        <p className="text-sm font-semibold text-emerald-50">{scan.repository_label}</p>
                        <p className="text-xs text-emerald-500/60 mt-1">{new Date(scan.scanned_at).toLocaleString()}</p>
                        <p className="text-sm text-emerald-100/70 mt-2">
                          Score {scan.health_score} | {scan.total_files_scanned} files | {scan.anomalies_found} anomalies
                        </p>
                        <p className="text-xs text-emerald-400/70 mt-2">
                          Critical matches: {scan.critical_patterns_detected || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-900/30 bg-charcoal-900/50 p-5">
                  <h3 className="text-lg font-medium text-emerald-100 mb-4">Pattern Usage</h3>
                  <div className="space-y-3">
                    {data.pattern_usage.length > 0 ? (
                      data.pattern_usage.map((pattern) => (
                        <div key={pattern.id} className="rounded-xl border border-emerald-900/20 bg-charcoal-950/40 p-4 space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-emerald-100">{pattern.title}</span>
                            <span className="text-sm font-semibold text-emerald-300">{pattern.times_recommended || 0}</span>
                          </div>
                          <p className="text-xs text-emerald-500/60">
                            Seen in {pattern.repositories_seen || 0} repositories
                            {pattern.last_seen_at ? ` | Last seen ${new Date(pattern.last_seen_at).toLocaleString()}` : ""}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-emerald-500/60">Pattern usage will appear after scans produce anomaly matches.</p>
                    )}
                  </div>
                </div>
              </div>
              </div>
            ) : hasSingleEntry ? (
              <div className="max-w-lg rounded-3xl border border-emerald-900/30 bg-charcoal-900/50 p-6 md:p-8 space-y-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-emerald-500/60 uppercase tracking-wide">Latest Audit Snapshot</p>
                    <h3 className="text-2xl md:text-3xl font-semibold text-emerald-50 mt-3">{history[0].label}</h3>
                    <p className="text-sm text-emerald-100/60 mt-3">
                      One scan has been recorded so far. Trend views unlock automatically as soon as you audit another repository.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/20 px-4 py-3 text-center min-w-24">
                    <p className="text-xs text-emerald-300/70 uppercase tracking-wide">Health</p>
                    <p className="text-3xl font-black text-emerald-300 mt-1">{history[0].health_score}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                    <p className="text-xs text-emerald-500/60 uppercase tracking-wide">Files Scanned</p>
                    <p className="text-xl font-semibold text-emerald-100 mt-2">{history[0].total_files_scanned}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-900/20 bg-charcoal-950/40 p-4">
                    <p className="text-xs text-emerald-500/60 uppercase tracking-wide">Anomalies</p>
                    <p className="text-xl font-semibold text-emerald-100 mt-2">{history[0].anomalies_found}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-900/20 bg-charcoal-950/40 p-4 col-span-2 md:col-span-1">
                    <p className="text-xs text-emerald-500/60 uppercase tracking-wide">Captured At</p>
                    <p className="text-sm font-semibold text-emerald-100 mt-2">{new Date(history[0].scanned_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-16">
                <BarChart2 className="w-16 h-16 text-emerald-500/30 mx-auto" />
                <h2 className="text-xl font-medium text-emerald-100">{data?.chart_status || "Initializing..."}</h2>
                <p className="text-emerald-500/50 text-sm max-w-sm mx-auto">
                  Run an audit from the Dashboard to build your scan history and trend chart.
                </p>
              </div>
            )}
          </div>

        </div>
      </>
  );
}
