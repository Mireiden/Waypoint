import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { AdminDestination } from '../../models/destination.model';
import { UserWithCount } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  // getStats() {
  //   return this.http.get<AdminStats>(`${this.base}/stats`, { withCredentials: true });
  // }

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
