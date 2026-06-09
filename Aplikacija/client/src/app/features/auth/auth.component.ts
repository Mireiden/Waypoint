import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  styleUrl: './auth.component.scss',
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
          <h1>Discover the world<br />off the beaten path</h1>
          <p>
            A community-driven map where travelers share hidden gems, scenic routes, and
            unforgettable destinations — far from the tourist crowds.
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
          <a class="explore-link" routerLink="/map">
            Explore without an account
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
        <div class="panel-deco"></div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="form-card">
          <!-- Tab toggle -->
          <div class="tabs">
            <button class="tab" [class.active]="mode() === 'login'" (click)="mode.set('login')">
              Sign in
            </button>
            <button
              class="tab"
              [class.active]="mode() === 'register'"
              (click)="mode.set('register')"
            >
              Create account
            </button>
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

              @if (loginError()) {
                <p class="form-error">{{ loginError() }}</p>
              }

              <button type="submit" class="btn-primary">Sign in</button>

              <p class="switch-hint">
                No account?
                <button type="button" class="link-btn" (click)="mode.set('register')">
                  Create one
                </button>
              </p>
            </form>
          }

          <!-- Register form -->
          @if (mode() === 'register') {
            <form class="auth-form" (ngSubmit)="onRegister()">
              <h2>Join Waypoint</h2>
              <p class="form-sub">Start discovering and sharing hidden places.</p>

              <div class="field">
                <label for="reg-name">Name</label>
                <input
                  id="reg-name"
                  type="text"
                  [(ngModel)]="regName"
                  name="name"
                  placeholder="Full name"
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

              <div class="field pw-field">
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
                    (focus)="pwFocused.set(true)"
                    (blur)="pwFocused.set(false)"
                  />
                  <button type="button" class="eye-btn" (click)="showRegPw.set(!showRegPw())">
                    {{ showRegPw() ? '🙈' : '👁' }}
                  </button>
                </div>
                @if (showPwHints) {
                  <div class="pw-popup">
                    <div class="pw-rule" [class.met]="pwHasLength">
                      <span class="rule-icon">{{ pwHasLength ? '✓' : '○' }}</span>
                      At least 8 characters
                    </div>
                    <div class="pw-rule" [class.met]="pwHasLetter">
                      <span class="rule-icon">{{ pwHasLetter ? '✓' : '○' }}</span>
                      At least one letter
                    </div>
                    <div class="pw-rule" [class.met]="pwHasNumber">
                      <span class="rule-icon">{{ pwHasNumber ? '✓' : '○' }}</span>
                      At least one number
                    </div>
                  </div>
                }
              </div>

              <div class="field">
                <label for="reg-confirm">Confirm password</label>
                <div class="input-wrap">
                  <input
                    id="reg-confirm"
                    [type]="showRegPw() ? 'text' : 'password'"
                    [(ngModel)]="regConfirm"
                    name="confirm"
                    placeholder="Confirm password"
                    autocomplete="new-password"
                    required
                  />
                </div>
              </div>

              <p class="terms">
                By creating an account you agree to our
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
              @if (regError()) {
                <p class="form-error">{{ regError() }}</p>
              }
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
  styles: [``],
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  showLoginPw = signal(false);
  showRegPw = signal(false);
  loginError = signal<string | null>(null);
  regError = signal<string | null>(null);
  pwFocused = signal(false);

  loginEmail = '';
  loginPassword = '';

  regName = '';
  regEmail = '';
  regPassword = '';
  regConfirm = '';

  get pwHasLength() {
    return this.regPassword.length >= 8;
  }
  get pwHasLetter() {
    return /[A-Za-z]/.test(this.regPassword);
  }
  get pwHasNumber() {
    return /\d/.test(this.regPassword);
  }
  get showPwHints() {
    return this.pwFocused();
  }

  onLogin(): void {
    this.loginError.set(null);

    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: () => this.router.navigate(['/map']),
      error: (err) => {
        const message = err?.error?.error ?? 'Invalid email or password.';
        this.loginError.set(message);
      },
    });
  }

  onRegister(): void {
    this.regError.set(null);

    if (this.regPassword !== this.regConfirm) {
      this.regError.set('Passwords do not match');
      return;
    }
    this.authService
      .register({
        name: this.regName,
        email: this.regEmail,
        password: this.regPassword,
      })
      .subscribe({
        next: () => this.router.navigate(['/map']),
        error: (err) => {
          const raw = err?.error?.error;
          const message =
            typeof raw === 'string'
              ? raw
              : 'Invalid input. Password must be 8-64 characters long and contain at least one letter and one number.';
          this.regError.set(message);
        },
      });
  }
}
