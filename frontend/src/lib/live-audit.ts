import type { Pattern, ReportsResponse, ScanResult } from './types';

type LiveAuditSnapshot = {
  result: ScanResult;
  scannedAt: string;
  repositoryLabel: string;
};

let latestSnapshot: LiveAuditSnapshot | null = null;

function getRepositoryLabel(repository?: string) {
  if (!repository) {
    return 'Latest Audit';
  }

  const trimmed = repository.replace(/[\\/]+$/, '');
  const parts = trimmed.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || repository;
}

function collectPatternUsage(result: ScanResult): Pattern[] {
  const patternMap = new Map<string, Pattern>();

  for (const file of result.flagged_files || []) {
    for (const pattern of file.matched_patterns || []) {
      const existing = patternMap.get(pattern.id);
      if (existing) {
        existing.times_recommended = (existing.times_recommended || 0) + 1;
        existing.repositories_seen = 1;
      } else {
        patternMap.set(pattern.id, {
          ...pattern,
          times_recommended: 1,
          repositories_seen: 1,
          last_seen_at: new Date().toISOString(),
        });
      }
    }
  }

  return [...patternMap.values()].sort((a, b) => (b.times_recommended || 0) - (a.times_recommended || 0));
}

export function getLiveAuditResult(): ScanResult | null {
  return latestSnapshot?.result ?? null;
}

export function setLiveAuditSnapshot(result: ScanResult) {
  latestSnapshot = {
    result,
    scannedAt: new Date().toISOString(),
    repositoryLabel: getRepositoryLabel(result.repository),
  };
}

export function buildLiveReportsSummary(): ReportsResponse | null {
  if (!latestSnapshot) {
    return null;
  }

  const { result, scannedAt, repositoryLabel } = latestSnapshot;
  const patternUsage = collectPatternUsage(result);
  const criticalPatternsDetected = patternUsage
    .filter((pattern) => pattern.impact === 'Critical')
    .reduce((sum, pattern) => sum + (pattern.times_recommended || 0), 0);

  return {
    history_enabled: false,
    total_scans: 1,
    repositories_scanned: result.repository ? 1 : 0,
    average_health_score: result.health_score || 0,
    latest_health_score: result.health_score || 0,
    health_delta: '0',
    total_files_scanned: result.total_files_scanned || 0,
    total_anomalies_found: result.anomalies_found || 0,
    critical_patterns_detected: criticalPatternsDetected,
    chart_status: 'Current tab audit snapshot',
    history: [
      {
        label: repositoryLabel,
        health_score: result.health_score || 0,
        anomalies_found: result.anomalies_found || 0,
        total_files_scanned: result.total_files_scanned || 0,
        scanned_at: scannedAt,
      },
    ],
    recent_scans: [
      {
        repository: result.repository || '',
        repository_label: repositoryLabel,
        health_score: result.health_score || 0,
        total_files_scanned: result.total_files_scanned || 0,
        anomalies_found: result.anomalies_found || 0,
        critical_patterns_detected: criticalPatternsDetected,
        pattern_counts: Object.fromEntries(
          patternUsage.map((pattern) => [pattern.id, pattern.times_recommended || 0]),
        ),
        scanned_at: scannedAt,
      },
    ],
    pattern_usage: patternUsage,
  };
}

export function mergePatternsWithLiveSnapshot(patterns: Pattern[]): Pattern[] {
  if (!latestSnapshot) {
    return patterns;
  }

  const usageMap = new Map(collectPatternUsage(latestSnapshot.result).map((pattern) => [pattern.id, pattern]));

  return patterns.map((pattern) => {
    const livePattern = usageMap.get(pattern.id);
    if (!livePattern) {
      return pattern;
    }

    return {
      ...pattern,
      times_recommended: livePattern.times_recommended,
      repositories_seen: livePattern.repositories_seen,
      last_seen_at: livePattern.last_seen_at,
    };
  });
}
