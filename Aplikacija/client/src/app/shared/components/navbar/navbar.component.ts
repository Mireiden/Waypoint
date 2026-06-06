import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
        <a routerLink="/auth" routerLinkActive="active">Sign in</a>
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
    `,
  ],
})
export class NavbarComponent {}
