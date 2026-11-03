export type ReportTargetType = 'destination' | 'review' | 'user';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ReportSort = 'newest' | 'oldest' | 'mostReports';
export type ReportReason = 'spam' | 'inappropriate' | 'inaccurate' | 'duplicate' | 'other';

// A group of reports filed against a single target (admin list view).
export interface ReportedTarget {
  type: ReportTargetType;
  id: number;
  count: number;
  latest: string;
}

// One individual report against a target
export interface TargetReport {
  id: number;
  reason: ReportReason;
  note: string | null;
  createdAt: string;
  user: { id: number; name: string };
}

export interface CreateReportPayload {
  reason: ReportReason;
  note?: string;
  targetType: ReportTargetType;
  targetId: number;
}

export interface ReportedTargetsQuery {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  sort?: ReportSort;
}
