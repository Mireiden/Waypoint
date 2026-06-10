import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';

export interface AdminStats {
  users: number;
  destinations: number;
  reviews: number;
  pendingReports: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  _count: { destinations: number; reviews: number; reports: number };
}

export interface AdminDestination {
  id: number;
  title: string;
  type: 'point' | 'route';
  city: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
  category: { id: number; name: string } | null;
  _count: { reviews: number; reports: number };
}

export interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string };
  destination: { id: number; title: string; city: string | null };
  _count: { reports: number };
}

export interface AdminReport {
  id: number;
  reason: string | null;
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  user: { id: number; name: string; email: string };
  destination: { id: number; title: string; type: string; city: string | null } | null;
  review: { id: number; comment: string | null; rating: number } | null;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;

  getStats() {
    return this.http.get<AdminStats>(`${this.base}/stats`, { withCredentials: true });
  }

  getReports(status?: 'pending' | 'approved' | 'declined') {
    const url = status ? `${this.base}/reports?status=${status}` : `${this.base}/reports`;
    return this.http.get<AdminReport[]>(url, { withCredentials: true });
  }

  approveReport(id: number) {
    return this.http.patch(
      `${this.base}/reports/${id}`,
      { action: 'approve' },
      {
        withCredentials: true,
      },
    );
  }

  declineReport(id: number) {
    return this.http.patch(
      `${this.base}/reports/${id}`,
      { action: 'decline' },
      {
        withCredentials: true,
      },
    );
  }

  getDestinations() {
    return this.http.get<AdminDestination[]>(`${this.base}/destinations`, {
      withCredentials: true,
    });
  }

  deleteDestination(id: number) {
    return this.http.delete(`${this.base}/destinations/${id}`, { withCredentials: true });
  }

  getUsers() {
    return this.http.get<AdminUser[]>(`${this.base}/users`, { withCredentials: true });
  }

  getReviews() {
    return this.http.get<AdminReview[]>(`${this.base}/reviews`, { withCredentials: true });
  }

  deleteReview(id: number) {
    return this.http.delete(`${this.base}/reviews/${id}`, { withCredentials: true });
  }
}
