import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { User } from '../../models/user.model';

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getMe() {
    return this.http.get<User>(`${this.base}/me`, { withCredentials: true });
  }

  updateProfile(id: number, payload: UpdateProfilePayload) {
    return this.http.put<User>(`${this.base}/${id}`, payload, { withCredentials: true });
  }
}
