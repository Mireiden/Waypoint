import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../../models/auth.model';
import type { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
const USER_KEY = 'waypoint_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<User | null>(this.readStoredUser());
  login(payload: LoginPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/login`, payload, { withCredentials: true })
      .pipe(tap((response) => this.setSession(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/register`, payload, { withCredentials: true })
      .pipe(tap((response) => this.setSession(response)));
  }

  updateStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    return this.http.post<void>(`${this.apiBase}/logout`, null, { withCredentials: true }).pipe(
      tap(() => {
        localStorage.removeItem(USER_KEY);
        this.currentUser.set(null);
      }),
    );
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
