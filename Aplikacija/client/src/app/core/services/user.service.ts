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
  private readonly base = `${environment.apiUrl}`;

  getMe() {
    return this.http.get<User>(`${this.base}/me`, { withCredentials: true });
  }

  updateProfile(payload: UpdateProfilePayload) {
    return this.http.patch<User>(`${this.base}/me`, payload, { withCredentials: true });
  }

  deleteProfile() {
    return this.http.delete<User>(`${this.base}/me`, { withCredentials: true });
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.patch<void>(`${this.base}/me/password`, payload, { withCredentials: true });
  }
}
