import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { AdminDestination } from '../../models/destination.model';
import { UserWithCount } from '../../models/user.model';
import { Report } from '../../models/report.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  // getStats() {
  //   return this.http.get<AdminStats>(`${this.base}/stats`, { withCredentials: true });
  // }

  getReports(status?: 'pending' | 'approved' | 'declined') {
    const url = status ? `${this.base}/reports?status=${status}` : `${this.base}/reports`;
    return this.http.get<Report[]>(url, { withCredentials: true });
  }

  approveReport(id: number) {
    return this.http.patch<Report>(
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
    return this.http.get<AdminDestination[]>(`${this.base}/destinations/admin`, {
      withCredentials: true,
    });
  }

  deleteDestination(id: number) {
    return this.http.delete(`${this.base}/destinations/${id}`, { withCredentials: true });
  }

  getUsers() {
    return this.http.get<UserWithCount[]>(`${this.base}/users`, { withCredentials: true });
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.base}/users/${id}`, { withCredentials: true });
  }
}
