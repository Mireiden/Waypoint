import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type {
  CreateReportPayload,
  ReportedTarget,
  ReportedTargetsQuery,
  ReportStatus,
  ReportTargetType,
  TargetReport,
} from '../../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  create(payload: CreateReportPayload) {
    return this.http.post<{ id: number }>(this.base, payload, { withCredentials: true });
  }

  getReportedTargets(query: ReportedTargetsQuery = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) params = params.set(key, value);
    }
    return this.http.get<ReportedTarget[]>(this.base, { params, withCredentials: true });
  }

  getReportsForTarget(type: ReportTargetType, id: number) {
    return this.http.get<TargetReport[]>(`${this.base}/${type}/${id}`, { withCredentials: true });
  }

  setStatus(type: ReportTargetType, id: number, status: Exclude<ReportStatus, 'pending'>) {
    return this.http.patch(`${this.base}/${type}/${id}`, { status }, { withCredentials: true });
  }
}
