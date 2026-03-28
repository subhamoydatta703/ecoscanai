'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  TreePine,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { getPatterns, resetAuditHistory } from '@/lib/api';
import type { Pattern } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  TreePine,
  RefreshCw,
};

const IMPACT_STYLES: Record<string, string> = {
  Critical: 'bg-red-950/60 text-red-300 border-red-500/20',
  High: 'bg-orange-950/60 text-orange-300 border-orange-500/20',
  Medium: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20',
};

const IMPACT_ORDER: Record<string, number> = {
  Critical: 3,
  High: 2,
  Medium: 1,
};

export default function GreenPatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  async function fetchPatterns() {
    try {
      const result = await getPatterns();
      setPatterns(result.patterns || []);
      setHistoryEnabled(result.history_enabled !== false);
    } catch (err) {
      console.error('Failed to fetch patterns:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatterns();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-charcoal-950">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const activePatterns = patterns.filter((pattern) => (pattern.times_recommended || 0) > 0);
  const sortedPatterns = [...patterns].sort((a, b) => {
    const usageDelta = (b.times_recommended || 0) - (a.times_recommended || 0);
    if (usageDelta !== 0) return usageDelta;
    return (IMPACT_ORDER[b.impact] || 0) - (IMPACT_ORDER[a.impact] || 0);
  });
  const featuredPattern = activePatterns.length > 0 ? sortedPatterns[0] : null;
  const maxRecommendations = Math.max(...sortedPatterns.map((pattern) => pattern.times_recommended || 0), 1);
  const totalRecommendations = patterns.reduce((sum, pattern) => sum + (pattern.times_recommended || 0), 0);
  const featuredUsageShare = featuredPattern
    ? Math.round(((featuredPattern.times_recommended || 0) / Math.max(totalRecommendations, 1)) * 100)
    : 0;

  async function handleReset() {
    if (!window.confirm('Reset all stored audit history? This will clear Reports and Green Patterns usage data.')) {
      return;
    }

    setResetting(true);
    try {
      await resetAuditHistory();
      await fetchPatterns();
    } catch (err) {
      console.error('Failed to reset audit history:', err);
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <div className="absolute top-0 left-0 w-[520px] h-[520px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-28 right-12 w-[440px] h-[440px] bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-10 pt-8 pb-16">
        <header className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-300 text-sm font-medium border border-emerald-500/20">
                <BookOpen className="w-4 h-4" />
                Pattern Library
              </div>
              {historyEnabled && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reset stored audit history"
                >
                  <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                  {resetting ? 'Resetting...' : 'Reset History'}
                </button>
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-emerald-50 max-w-4xl">
                Green Coding Patterns
              </h1>
              <p className="text-emerald-100/60 text-lg md:text-xl max-w-4xl leading-relaxed">
                {historyEnabled
                  ? 'A living catalog of the optimization patterns your audits can actually surface, ranked by observed usage across your scan history.'
                  : 'A curated library of the optimization patterns EcoScan can surface. This build keeps the catalog visible without storing shared usage history.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                Real usage ranking
              </span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                Repository reach
              </span>
              <span className="px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-900/20 text-sm text-emerald-200/80">
                {historyEnabled ? 'Match-note history' : 'Curated pattern library'}
              </span>
            </div>
          </div>

          {featuredPattern ? (
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[linear-gradient(145deg,rgba(6,24,20,0.95),rgba(7,15,30,0.92))] p-6 md:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%)] pointer-events-none" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                    <Sparkles className="w-4 h-4" />
                    Most Observed Pattern
                  </div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${IMPACT_STYLES[featuredPattern.impact] || IMPACT_STYLES.Medium}`}>
                    {featuredPattern.impact}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-50">{featuredPattern.title}</h2>
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/60 mt-2">{featuredPattern.category}</p>
                </div>
                <p className="text-sm text-emerald-100/70 leading-relaxed">{featuredPattern.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Hits</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">{featuredPattern.times_recommended || 0}</p>
                    <p className="text-xs text-emerald-100/45 mt-2">How often it was recommended</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Repos</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">{featuredPattern.repositories_seen || 0}</p>
                    <p className="text-xs text-emerald-100/45 mt-2">Unique repositories reached</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Usage Share</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">{featuredUsageShare}%</p>
                    <p className="text-xs text-emerald-100/45 mt-2">Share of all recorded recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[linear-gradient(145deg,rgba(6,24,20,0.95),rgba(7,15,30,0.92))] p-6 md:p-7 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_45%)] pointer-events-none" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                  <Sparkles className="w-4 h-4" />
                  Pattern Activity
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-50">No observed patterns yet</h2>
                  <p className="text-sm text-emerald-100/65 mt-3 leading-relaxed">
                    {historyEnabled
                      ? 'The library is ready, but no audits are currently contributing usage data. This is the expected state right after a reset or before the first scan.'
                      : 'The library is ready. This experience currently focuses on the reusable pattern catalog rather than saved usage activity.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Hits</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">0</p>
                    <p className="text-xs text-emerald-100/45 mt-2">No recommendations recorded</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Repos</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">0</p>
                    <p className="text-xs text-emerald-100/45 mt-2">No repositories reached yet</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 min-h-24 flex flex-col justify-between">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500/60">Usage Share</p>
                    <p className="text-3xl font-black text-emerald-300 mt-3">0%</p>
                    <p className="text-xs text-emerald-100/45 mt-2">No active pattern share yet</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BookOpen className="w-24 h-24" />
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/70">Patterns In Library</p>
            <p className="text-5xl font-black text-emerald-300 mt-4">{patterns.length}</p>
            <p className="text-sm text-emerald-100/50 mt-3">Optimization ideas available to match against anomalies.</p>
          </div>

          <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/70">Observed In Audits</p>
            <p className="text-5xl font-black text-emerald-300 mt-4">{activePatterns.length}</p>
            <p className="text-sm text-emerald-100/50 mt-3">{historyEnabled ? 'Patterns that have already shown up in your repositories.' : 'Usage-based ranking is currently inactive in this history-free build.'}</p>
          </div>

            <div className="glass-emerald rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24" />
              </div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-400/70">Total Recommendations</p>
              <p className="text-5xl font-black text-emerald-300 mt-4">{totalRecommendations}</p>
              <p className="text-sm text-emerald-100/50 mt-3">{historyEnabled ? 'How often the library has been matched across audits.' : 'Recommendation totals stay at zero while the app is running without shared history.'}</p>
            </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-50">Catalog</h2>
              <p className="text-sm text-emerald-100/50 mt-1">Patterns are sorted by how often your audits have surfaced them.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-emerald-400/70">
              <ArrowUpRight className="w-4 h-4" />
              {historyEnabled ? 'Highest usage first' : 'Catalog-first view'}
            </div>
          </div>

          <div className="grid gap-5">
            {sortedPatterns.map((pattern, idx) => {
              const IconComponent = ICON_MAP[pattern.icon] || BookOpen;
              const usageRatio = Math.max(8, Math.round(((pattern.times_recommended || 0) / maxRecommendations) * 100));

              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-3xl border border-emerald-900/30 bg-[linear-gradient(180deg,rgba(10,18,34,0.94),rgba(9,17,30,0.88))] p-6 md:p-7 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_24px_60px_rgba(0,0,0,0.2)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                  <div className="relative grid grid-cols-1 lg:grid-cols-[92px_1fr_220px] gap-6 items-start">
                    <div className="w-[92px] h-[92px] rounded-3xl border border-emerald-500/10 bg-[linear-gradient(180deg,rgba(6,40,31,0.9),rgba(8,25,38,0.7))] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <IconComponent className="w-10 h-10 text-emerald-300" />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-semibold text-emerald-50">{pattern.title}</h3>
                          <span className="px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] border border-emerald-500/10 bg-charcoal-950/50 text-emerald-300/75">
                            {pattern.category}
                          </span>
                        </div>
                        <p className="text-emerald-100/65 leading-relaxed text-lg max-w-3xl">
                          {pattern.description}
                        </p>
                      </div>

                      {pattern.last_seen_at && (
                        <div className="inline-flex items-center gap-2 text-sm text-emerald-400/75">
                          <Clock3 className="w-4 h-4" />
                          Last observed {new Date(pattern.last_seen_at).toLocaleString()}
                        </div>
                      )}

                      {pattern.match_notes && pattern.match_notes.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {pattern.match_notes.map((note) => (
                            <span key={note} className="px-3 py-1.5 rounded-xl bg-charcoal-950/70 border border-emerald-900/30 text-sm text-emerald-200/80">
                              {note}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:pl-4 space-y-4">
                      <div className="flex lg:flex-col lg:items-end gap-3 justify-between">
                        <span className={`px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${IMPACT_STYLES[pattern.impact] || IMPACT_STYLES.Medium}`}>
                          {pattern.impact} Impact
                        </span>
                        <p className="text-sm text-emerald-400/75">
                          Recommended <span className="text-emerald-200 font-semibold">{pattern.times_recommended || 0}</span> times
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-900/30 bg-charcoal-950/45 p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-100/60">Repository reach</span>
                          <span className="text-emerald-200 font-medium">{pattern.repositories_seen || 0} repos</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 rounded-full bg-charcoal-900 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(16,185,129,0.9),rgba(110,231,183,0.95))]"
                              style={{ width: `${usageRatio}%` }}
                            />
                          </div>
                          <p className="text-xs text-emerald-500/60">
                            Relative usage compared with the most frequently matched pattern.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
