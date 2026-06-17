import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  styleUrl: './profile.component.scss',
  imports: [FormsModule, RouterLink],
  template: `
    @if (auth.currentUser(); as user) {
      <div class="profile-page">
        <!-- Green hero: avatar + identity all inside -->
        <div class="profile-hero">
          <div class="hero-deco"></div>

          <div class="avatar-wrap">
            @if (user.avatarUrl && !avatarError()) {
              <img
                class="avatar-img"
                [src]="user.avatarUrl"
                [alt]="user.name"
                (error)="avatarError.set(true)"
              />
            } @else {
              <svg class="avatar-placeholder" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4.5" fill="currentColor" />
                <path d="M3 21c0-5 4-8.5 9-8.5s9 3.5 9 8.5" fill="currentColor" />
              </svg>
            }
          </div>

          <h1 class="user-name">{{ user.name }}</h1>
          <p class="user-email">{{ user.email }}</p>
          <span class="role-badge" [class.admin]="user.role === 'admin'">
            {{ user.role === 'admin' ? 'Administrator' : 'Member' }}
          </span>

          <div class="stats-row">
            <span class="stat"><strong>0</strong> routes</span>
            <span class="stat-dot">·</span>
            <span class="stat"><strong>0</strong> points</span>
            <span class="stat-dot">·</span>
            <span class="stat">Since {{ formatDate(user.createdAt) }}</span>
          </div>

          <button class="btn-edit" type="button" (click)="editOpen.set(!editOpen())">
            {{ editOpen() ? 'Cancel' : 'Edit Profile' }}
          </button>
        </div>

        <div class="profile-container">
          <!-- Inline edit form -->
          @if (editOpen()) {
            <div class="edit-section">
              <form class="edit-form" (ngSubmit)="onSave()">
                <div class="edit-fields">
                  <div class="field">
                    <label for="edit-name">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      [(ngModel)]="nameInput"
                      name="name"
                      minlength="2"
                      maxlength="255"
                      required
                    />
                  </div>
                  <div class="field avatar-field">
                    <label for="edit-avatar">Avatar URL</label>
                    <div class="avatar-input-row">
                      <input
                        id="edit-avatar"
                        type="url"
                        [(ngModel)]="avatarInput"
                        name="avatarUrl"
                        placeholder="https://..."
                        (input)="previewError.set(false)"
                      />
                      @if (avatarInput.trim()) {
                        <div class="avatar-thumb">
                          @if (!previewError()) {
                            <img
                              [src]="avatarInput.trim()"
                              alt="Preview"
                              (error)="previewError.set(true)"
                            />
                          } @else {
                            <svg viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="4.5" fill="currentColor" />
                              <path d="M3 21c0-5 4-8.5 9-8.5s9 3.5 9 8.5" fill="currentColor" />
                            </svg>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  <button type="submit" class="btn-save" [disabled]="isSaving()">
                    {{ isSaving() ? 'Saving…' : 'Save' }}
                  </button>
                </div>
                @if (saveError()) {
                  <p class="form-error">{{ saveError() }}</p>
                }
                @if (saveSuccess()) {
                  <p class="form-success">Profile updated!</p>
                }
              </form>

              <div class="pw-section">
                <button class="btn-pw-toggle" type="button" (click)="pwOpen.set(!pwOpen())">
                  {{ pwOpen() ? 'Cancel' : 'Change Password' }}
                </button>
                @if (pwOpen()) {
                  <form class="edit-form pw-form" (ngSubmit)="onChangePassword()">
                    <div class="edit-fields">
                      <div class="field">
                        <label for="pw-current">Current password</label>
                        <input id="pw-current" type="password" [(ngModel)]="pwCurrent" name="pwCurrent" required />
                      </div>
                      <div class="field">
                        <label for="pw-new">New password</label>
                        <input id="pw-new" type="password" [(ngModel)]="pwNew" name="pwNew" minlength="8" required />
                      </div>
                      <div class="field">
                        <label for="pw-confirm">Confirm new password</label>
                        <input id="pw-confirm" type="password" [(ngModel)]="pwConfirm" name="pwConfirm" required />
                      </div>
                      <button type="submit" class="btn-save" [disabled]="isPwSaving()">
                        {{ isPwSaving() ? 'Saving…' : 'Update Password' }}
                      </button>
                    </div>
                    @if (pwError()) {
                      <p class="form-error">{{ pwError() }}</p>
                    }
                    @if (pwSuccess()) {
                      <p class="form-success">Password updated!</p>
                    }
                  </form>
                }
              </div>
            </div>
          }

          <!-- Tab bar -->
          <div class="tab-bar">
            <button
              class="tab"
              [class.active]="activeTab() === 'routes'"
              (click)="activeTab.set('routes')"
            >
              Routes
            </button>
            <button
              class="tab"
              [class.active]="activeTab() === 'points'"
              (click)="activeTab.set('points')"
            >
              Points of Interest
            </button>
          </div>

          <!-- Tab content -->
          <div class="tab-content">
            @if (activeTab() === 'routes') {
              <div class="empty-state">
                <div class="empty-icon">🗺</div>
                <h3>No routes yet</h3>
                <p>Create a route on the map and it will appear here.</p>
                <a class="btn-cta" routerLink="/map">Go to map</a>
              </div>
            }
            @if (activeTab() === 'points') {
              <div class="empty-state">
                <div class="empty-icon">📍</div>
                <h3>No points of interest yet</h3>
                <p>Pin your favorite hidden spots and they will show up here.</p>
                <a class="btn-cta" routerLink="/map">Go to map</a>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  editOpen = signal(false);
  activeTab = signal<'routes' | 'points'>('routes');

  avatarError = signal(false);
  previewError = signal(false);
  isSaving = signal(false);
  saveError = signal<string | null>(null);
  saveSuccess = signal(false);

  pwOpen = signal(false);
  isPwSaving = signal(false);
  pwError = signal<string | null>(null);
  pwSuccess = signal(false);
  pwCurrent = '';
  pwNew = '';
  pwConfirm = '';

  nameInput = this.auth.currentUser()?.name ?? '';
  avatarInput = this.auth.currentUser()?.avatarUrl ?? '';

  constructor() {
    if (!this.auth.currentUser()) {
      this.router.navigate(['/auth']);
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  onChangePassword(): void {
    this.pwError.set(null);
    this.pwSuccess.set(false);

    if (this.pwNew !== this.pwConfirm) {
      this.pwError.set('New passwords do not match.');
      return;
    }

    this.isPwSaving.set(true);
    this.userService.changePassword({ currentPassword: this.pwCurrent, newPassword: this.pwNew }).subscribe({
      next: () => {
        this.isPwSaving.set(false);
        this.pwSuccess.set(true);
        this.pwCurrent = '';
        this.pwNew = '';
        this.pwConfirm = '';
        setTimeout(() => {
          this.pwSuccess.set(false);
          this.pwOpen.set(false);
        }, 1500);
      },
      error: (err) => {
        this.isPwSaving.set(false);
        this.pwError.set(err?.error?.error ?? 'Could not update password. Try again.');
      },
    });
  }

  onSave(): void {
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.isSaving.set(true);

    const user = this.auth.currentUser()!;

    this.userService
      .updateProfile({
        name: this.nameInput,
        avatarUrl: this.avatarInput.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.auth.updateStoredUser(updated);
          this.avatarError.set(false);
          this.nameInput = updated.name;
          this.avatarInput = updated.avatarUrl ?? '';
          this.isSaving.set(false);
          this.saveSuccess.set(true);
          setTimeout(() => {
            this.saveSuccess.set(false);
            this.editOpen.set(false);
          }, 1500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.saveError.set(err?.error?.error ?? 'Could not save profile. Try again.');
        },
      });
  }
}
