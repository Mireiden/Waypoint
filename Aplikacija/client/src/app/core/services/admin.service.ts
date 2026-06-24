import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { AdminDestination, AdminDestinationQueryParams } from '../../models/destination.model';
import { UserWithCount } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  // getStats() {
  //   return this.http.get<AdminStats>(`${this.base}/stats`, { withCredentials: true });
  // }

  getDestinations(query?: AdminDestinationQueryParams) {
    let params = new HttpParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value);
        }
      }
    }
    return this.http.get<AdminDestination[]>(`${this.base}/destinations/admin`, {
      params,
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
