export interface TrafficData {
  month: string;
  visits: number;
}

export interface DeviceData {
  name: string;
  value: number;
  fill: string;
}

export interface SeoIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  fix: string;
}

export interface KeywordData {
  keyword: string;
  volume: number;
  position: number;
  difficulty: number;
}

export interface EngagementMetrics {
  bounceRate: string;
  pagesPerVisit: string;
  avgVisitDuration: string;
}

export interface AuditReport {
  url: string;
  overallScore: number;
  globalRank?: number;
  engagement?: EngagementMetrics;
  trafficHistory: TrafficData[];
  deviceDistribution: DeviceData[];
  marketingChannels: { name: string; value: number }[];
  seoIssues: SeoIssue[];
  topKeywords: KeywordData[];
  topCountries: { country: string; share: number; change: number }[];
  summary: string;
  sources?: { title: string; uri: string }[];
}

export enum ViewState {
  LANDING,
  LOADING,
  DASHBOARD,
  PRO_MODAL
}