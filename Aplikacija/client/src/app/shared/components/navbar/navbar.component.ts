import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
        <a routerLink="/map" routerLinkActive="active">Map</a>
        @if (auth.currentUser()) {
          <button class="avatar-btn" type="button" aria-label="Account" routerLink="/profile">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
            </svg>
          </button>
        } @else {
          <a routerLink="/auth" routerLinkActive="active">Sign in</a>
        }
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
        background: var(--primary-dark);
        color: white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        position: relative;
        z-index: 1000;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: white;
        text-decoration: none;
      }

      .brand-icon {
        font-size: 1.4rem;
        color: var(--accent);
      }

      .nav-links {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .nav-links a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        padding: 6px 14px;
        border-radius: var(--radius);
        font-size: 0.9rem;
        transition: all 0.2s;
      }

      .nav-links a:hover,
      .nav-links a.active {
        color: white;
        background: rgba(255, 255, 255, 0.15);
      }

      .avatar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.12);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        padding: 0;
      }

      .avatar-btn:hover {
        background: rgba(255, 255, 255, 0.22);
        border-color: rgba(255, 255, 255, 0.6);
      }

      .avatar-icon {
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
}
