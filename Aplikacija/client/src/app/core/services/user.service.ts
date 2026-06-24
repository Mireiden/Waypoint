import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { PublicProfile, User } from '../../models/user.model';
import type { UserDestination } from '../../models/destination.model';

export interface UpdateProfilePayload {
  // The backend's updateProfileSchema only accepts `name`; the avatar is managed
  // separately via the dedicated upload/delete endpoints below.
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  getMe() {
    return this.http.get<User>(`${this.base}/me`, { withCredentials: true });
  }

  // Public profile of any user. Admin viewers get email + role too (server-side).
  getProfile(id: number) {
    return this.http.get<PublicProfile>(`${this.base}/users/${id}`, { withCredentials: true });
  }

  // The destinations created by a given user (for their profile page).
  getUserDestinations(id: number) {
    return this.http.get<UserDestination[]>(`${this.base}/users/${id}/destinations`, {
      withCredentials: true,
    });
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

  // Upload a new avatar image (multipart, field "avatar"). The backend stores it
  // on Cloudinary and returns the updated { id, avatarUrl }.
  uploadAvatar(file: File) {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.put<{ id: number; avatarUrl: string }>(`${this.base}/me/avatar`, form, {
      withCredentials: true,
    });
  }

  // Remove the current avatar (and its Cloudinary asset). Returns 204.
  deleteAvatar() {
    return this.http.delete<void>(`${this.base}/me/avatar`, { withCredentials: true });
  }
}
