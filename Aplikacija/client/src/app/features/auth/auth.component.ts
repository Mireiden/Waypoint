import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">

      <!-- Left brand panel -->
      <div class="brand-panel">
        <div class="brand-panel-inner">
          <a class="brand" routerLink="/map">
            <span class="brand-icon">◈</span>
            Waypoint
          </a>
          <h1>Discover the world<br/>off the beaten path</h1>
          <p>
            A community-driven map where travelers share hidden gems,
            scenic routes, and unforgettable destinations — far from
            the tourist crowds.
          </p>
          <ul class="feature-list">
            <li>
              <span class="feat-icon">🗺</span>
              Interactive routes &amp; destinations
            </li>
            <li>
              <span class="feat-icon">⭐</span>
              Community ratings &amp; reviews
            </li>
            <li>
              <span class="feat-icon">🔍</span>
              Filter by experience type
            </li>
          </ul>
        </div>
        <div class="panel-deco"></div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="form-card">

          <!-- Tab toggle -->
          <div class="tabs">
            <button
              class="tab"
              [class.active]="mode() === 'login'"
              (click)="mode.set('login')"
            >Sign in</button>
            <button
              class="tab"
              [class.active]="mode() === 'register'"
              (click)="mode.set('register')"
            >Create account</button>
          </div>

          <!-- Login form -->
          @if (mode() === 'login') {
            <form class="auth-form" (ngSubmit)="onLogin()">
              <h2>Welcome back</h2>
              <p class="form-sub">Sign in to continue your journey.</p>

              <div class="field">
                <label for="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  [(ngModel)]="loginEmail"
                  name="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="field">
                <label for="login-password">
                  Password
                  <a class="forgot" href="#">Forgot?</a>
                </label>
                <div class="input-wrap">
                  <input
                    id="login-password"
                    [type]="showLoginPw() ? 'text' : 'password'"
                    [(ngModel)]="loginPassword"
                    name="password"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    required
                  />
                  <button type="button" class="eye-btn" (click)="showLoginPw.set(!showLoginPw())">
                    {{ showLoginPw() ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-primary">Sign in</button>

              <p class="switch-hint">
                No account?
                <button type="button" class="link-btn" (click)="mode.set('register')">Create one</button>
              </p>
            </form>
          }

          <!-- Register form -->
          @if (mode() === 'register') {
            <form class="auth-form" (ngSubmit)="onRegister()">
              <h2>Join Waypoint</h2>
              <p class="form-sub">Start discovering and sharing hidden places.</p>

              <div class="field-row">
                <div class="field">
                  <label for="reg-first">First name</label>
                  <input
                    id="reg-first"
                    type="text"
                    [(ngModel)]="regFirst"
                    name="firstName"
                    placeholder="Ana"
                    required
                  />
                </div>
                <div class="field">
                  <label for="reg-last">Last name</label>
                  <input
                    id="reg-last"
                    type="text"
                    [(ngModel)]="regLast"
                    name="lastName"
                    placeholder="Marković"
                    required
                  />
                </div>
              </div>

              <div class="field">
                <label for="reg-username">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  [(ngModel)]="regUsername"
                  name="username"
                  placeholder="explorer_ana"
                  required
                />
              </div>

              <div class="field">
                <label for="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  [(ngModel)]="regEmail"
                  name="email"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="field">
                <label for="reg-password">Password</label>
                <div class="input-wrap">
                  <input
                    id="reg-password"
                    [type]="showRegPw() ? 'text' : 'password'"
                    [(ngModel)]="regPassword"
                    name="password"
                    placeholder="Min. 8 characters"
                    autocomplete="new-password"
                    required
                  />
                  <button type="button" class="eye-btn" (click)="showRegPw.set(!showRegPw())">
                    {{ showRegPw() ? '🙈' : '👁' }}
                  </button>
                </div>
              </div>

              <div class="field">
                <label for="reg-confirm">Confirm password</label>
                <div class="input-wrap">
                  <input
                    id="reg-confirm"
                    [type]="showRegPw() ? 'text' : 'password'"
                    [(ngModel)]="regConfirm"
                    name="confirm"
                    placeholder="Repeat password"
                    autocomplete="new-password"
                    required
                  />
                </div>
              </div>

              <p class="terms">
                By creating an account you agree to our
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>

              <button type="submit" class="btn-primary">Create account</button>

              <p class="switch-hint">
                Already have an account?
                <button type="button" class="link-btn" (click)="mode.set('login')">Sign in</button>
              </p>
            </form>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: flex;
      height: calc(100vh - 60px);
      overflow: hidden;
    }

    /* ── Brand panel ──────────────────────────── */
    .brand-panel {
      flex: 1 0 42%;
      background: linear-gradient(145deg, var(--primary-dark) 0%, var(--primary) 60%, var(--primary-mid) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 56px;
      position: relative;
      overflow: hidden;
    }

    .panel-deco {
      position: absolute;
      bottom: -120px;
      right: -120px;
      width: 420px;
      height: 420px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(232,145,26,0.18) 0%, transparent 70%);
      pointer-events: none;
    }

    .brand-panel-inner {
      position: relative;
      z-index: 1;
      max-width: 380px;
      color: white;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 1.35rem;
      font-weight: 700;
      color: white;
      text-decoration: none;
      margin-bottom: 48px;
    }

    .brand-icon {
      font-size: 1.5rem;
      color: var(--accent);
    }

    .brand-panel-inner h1 {
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 16px;
      color: white;
    }

    .brand-panel-inner p {
      font-size: 1rem;
      line-height: 1.65;
      color: rgba(255,255,255,0.75);
      margin-bottom: 36px;
    }

    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      color: rgba(255,255,255,0.85);
    }

    .feat-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    /* ── Form panel ───────────────────────────── */
    .form-panel {
      flex: 0 0 58%;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      overflow-y: auto;
    }

    .form-card {
      width: 100%;
      max-width: 420px;
    }

    /* ── Tabs ─────────────────────────────────── */
    .tabs {
      display: flex;
      background: var(--surface-alt);
      border-radius: var(--radius-lg);
      padding: 4px;
      margin-bottom: 32px;
      border: 1px solid var(--border);
    }

    .tab {
      flex: 1;
      padding: 10px;
      border: none;
      background: transparent;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab.active {
      background: white;
      color: var(--primary);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0,0,0,0.10);
    }

    /* ── Auth form ────────────────────────────── */
    .auth-form h2 {
      font-size: 1.55rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 6px;
    }

    .form-sub {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 28px;
    }

    .field {
      display: flex;
      flex-direction: column;
      margin-bottom: 18px;
    }

    .field label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .forgot {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--primary);
      text-decoration: none;
      text-transform: none;
      letter-spacing: 0;
    }

    .forgot:hover { text-decoration: underline; }

    .field input {
      height: 44px;
      padding: 0 12px;
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      background: white;
      font-size: 0.95rem;
      color: var(--text);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      width: 100%;
    }

    .field input::placeholder { color: var(--text-muted); opacity: 0.6; }

    .field input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(45,141,181,0.15);
    }

    .input-wrap {
      position: relative;
    }

    .input-wrap input { padding-right: 44px; }

    .eye-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 4px;
      color: var(--text-muted);
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-primary {
      width: 100%;
      height: 48px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--radius);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      margin-top: 4px;
      letter-spacing: 0.3px;
    }

    .btn-primary:hover { background: var(--accent-dark); }
    .btn-primary:active { transform: scale(0.98); }

    .terms {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .terms a { color: var(--primary); text-decoration: none; }
    .terms a:hover { text-decoration: underline; }

    .switch-hint {
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 20px;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .link-btn:hover { text-decoration: underline; }

    @media (max-width: 820px) {
      .brand-panel { display: none; }
      .form-panel { flex: 1; }
    }
  `],
})
export class AuthComponent {
  mode = signal<'login' | 'register'>('login');
  showLoginPw = signal(false);
  showRegPw = signal(false);

  loginEmail = '';
  loginPassword = '';

  regFirst = '';
  regLast = '';
  regUsername = '';
  regEmail = '';
  regPassword = '';
  regConfirm = '';

  onLogin(): void {
    console.log('login', { email: this.loginEmail });
  }

  onRegister(): void {
    console.log('register', { email: this.regEmail, username: this.regUsername });
  }
}
