import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="brand" routerLink="/map">
        <span class="brand-icon">◈</span>
        Waypoint
      </a>
      <div class="nav-links">
        @if (auth.currentUser()) {
          @if (auth.currentUser()!.role === 'admin') {
            <a class="admin-link" routerLink="/admin" routerLinkActive="active">Admin</a>
          }
          <button class="profile-btn" type="button" routerLink="/profile">
            @if (auth.currentUser()!.avatarUrl && !avatarError()) {
              <img
                class="avatar-img"
                [src]="auth.currentUser()!.avatarUrl"
                [alt]="auth.currentUser()!.name"
                (error)="avatarError.set(true)"
              />
            } @else {
              <svg
                class="avatar-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="8" r="4" fill="currentColor" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
              </svg>
            }
            <span class="user-name">{{ auth.currentUser()!.name }}</span>
          </button>

          <div class="logout-wrap">
            <button
              class="icon-btn"
              type="button"
              aria-label="Sign out"
              (click)="confirmingLogout.set(!confirmingLogout())"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 17l5-5-5-5M21 12H9M13 5H5a2 2 0 00-2 2v10a2 2 0 002 2h8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            @if (confirmingLogout()) {
              <div class="logout-popup">
                <span class="confirm-label">Sign out?</span>
                <div class="confirm-actions">
                  <button class="confirm-btn yes" type="button" (click)="logout()">Yes</button>
                  <button
                    class="confirm-btn no"
                    type="button"
                    (click)="confirmingLogout.set(false)"
                  >
                    No
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <a routerLink="/auth" routerLinkActive="active">Sign in</a>
        }
      </div>
    </nav>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  confirmingLogout = signal(false);
  // Falls back to the silhouette SVG if the avatar URL fails to load.
  avatarError = signal(false);

  logout(): void {
    this.confirmingLogout.set(false);
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth']),
      error: () => this.router.navigate(['/auth']),
    });
  }
}
