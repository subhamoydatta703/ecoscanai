export interface MatchedPattern {
  id: string;
  title: string;
  icon: string;
  description: string;
  impact: string;
  category: string;
  match_notes?: string[];
  times_recommended?: number;
}

export interface ScanResultFile {
  file_path: string;
  original_code?: string;
  optimized_code?: string;
  anomaly_reasons?: string[];
  ai_explanation?: string;
  carbon_saving_ratio?: string;
  matched_patterns?: MatchedPattern[];
}

export interface ScanResult {
  status: "success" | "error";
  repository?: string;
  health_score?: number;
  total_files_scanned?: number;
  anomalies_found?: number;
  flagged_files?: ScanResultFile[];
  timings?: {
    scan_seconds?: number;
    ml_seconds?: number;
    ai_seconds?: number;
  };
  message?: string;
}

export interface ReportsResponse {
  total_scans: number;
  repositories_scanned: number;
  average_health_score: number;
  latest_health_score: number;
  health_delta: string;
  total_files_scanned: number;
  total_anomalies_found: number;
  critical_patterns_detected: number;
  chart_status: string;
  history: ReportHistoryPoint[];
  recent_scans: RecentScan[];
  pattern_usage: Pattern[];
}

export interface ReportHistoryPoint {
  label: string;
  health_score: number;
  anomalies_found: number;
  total_files_scanned: number;
  scanned_at: string;
}

export interface RecentScan {
  repository: string;
  repository_label: string;
  health_score: number;
  total_files_scanned: number;
  anomalies_found: number;
  critical_patterns_detected?: number;
  pattern_counts: Record<string, number>;
  scanned_at: string;
}

export interface Pattern {
  id: string;
  title: string;
  icon: string;
  description: string;
  impact: string;
  category: string;
  match_notes?: string[];
  times_recommended?: number;
  repositories_seen?: number;
  last_seen_at?: string;
}

export interface PatternsResponse {
  patterns: Pattern[];
}
