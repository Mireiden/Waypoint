import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../../models/auth.model';

const TOKEN_KEY = 'waypoint_token';
const USER_KEY = 'waypoint_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000/api/auth';

  readonly currentUser = signal<User | null>(this.readStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  login(payload: LoginPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/login`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/register`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.token.set(null);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.token.set(response.token);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
