import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { DestinationService } from '../../core/services/destination.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { ShareService } from '../../core/services/share.service';
import { FavoriteDestination, UserDestination } from '../../models/destination.model';
import { categoryIcon } from '../../shared/category-icons';

@Component({
  selector: 'app-profile',
  styleUrl: './profile.component.scss',
  imports: [FormsModule, RouterLink],
  template: `
    @if (auth.currentUser(); as user) {
      <div class="profile-page">
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
            <span class="stat"
              ><strong>{{ routes().length }}</strong> routes</span
            >
            <span class="stat-dot">·</span>
            <span class="stat"
              ><strong>{{ points().length }}</strong> points</span
            >
            <span class="stat-dot">·</span>
            <span class="stat">Since {{ formatDate(user.createdAt) }}</span>
          </div>

          <div class="hero-actions">
            <button class="btn-edit" type="button" (click)="editOpen.set(!editOpen())">
              {{ editOpen() ? 'Cancel' : 'Edit Profile' }}
            </button>
            <button class="btn-edit" type="button" (click)="shareProfile(user.id)">
              {{ shareLabel() }}
            </button>
          </div>
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
                    <label>Profile photo</label>
                    <div class="avatar-input-row">
                      <div class="avatar-thumb">
                        @if (user.avatarUrl) {
                          <img [src]="user.avatarUrl" alt="Current avatar" />
                        } @else {
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4.5" fill="currentColor" />
                            <path d="M3 21c0-5 4-8.5 9-8.5s9 3.5 9 8.5" fill="currentColor" />
                          </svg>
                        }
                      </div>
                      <div class="avatar-actions">
                        <input
                          #avatarFile
                          type="file"
                          accept="image/*"
                          hidden
                          (change)="onAvatarSelected($event)"
                        />
                        <button
                          type="button"
                          class="btn-avatar"
                          [disabled]="isUploadingAvatar()"
                          (click)="avatarFile.click()"
                        >
                          {{
                            isUploadingAvatar()
                              ? 'Uploading…'
                              : user.avatarUrl
                                ? 'Change photo'
                                : 'Upload photo'
                          }}
                        </button>
                        @if (user.avatarUrl) {
                          <button
                            type="button"
                            class="btn-avatar btn-avatar-remove"
                            [disabled]="isUploadingAvatar()"
                            (click)="removeAvatar()"
                          >
                            Remove
                          </button>
                        }
                      </div>
                    </div>
                    @if (avatarUploadError()) {
                      <p class="form-error">{{ avatarUploadError() }}</p>
                    }
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
                        <input
                          id="pw-current"
                          type="password"
                          [(ngModel)]="pwCurrent"
                          name="pwCurrent"
                          required
                        />
                      </div>
                      <div class="field">
                        <label for="pw-new">New password</label>
                        <input
                          id="pw-new"
                          type="password"
                          [(ngModel)]="pwNew"
                          name="pwNew"
                          minlength="8"
                          required
                        />
                      </div>
                      <div class="field">
                        <label for="pw-confirm">Confirm new password</label>
                        <input
                          id="pw-confirm"
                          type="password"
                          [(ngModel)]="pwConfirm"
                          name="pwConfirm"
                          required
                        />
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
            <button
              class="tab"
              [class.active]="activeTab() === 'saved'"
              (click)="selectTab('saved')"
            >
              Saved
            </button>
          </div>

          <div class="tab-content">
            @if (activeTab() === 'saved') {
              @if (favoritesLoading()) {
                <div class="dest-skeleton-grid">
                  @for (i of [1, 2, 3]; track i) {
                    <div class="dest-skeleton"></div>
                  }
                </div>
              } @else if (favorites().length > 0) {
                <div class="dest-grid">
                  @for (dest of favorites(); track dest.id) {
                    <a
                      class="dest-card dest-card-link"
                      [routerLink]="['/map']"
                      [queryParams]="{ dest: dest.id }"
                    >
                      <div class="dest-thumb">
                        <span class="dest-thumb-fallback">
                          {{ dest.type === 'route' ? '🗺' : '📍' }}
                        </span>
                      </div>
                      <div class="dest-body">
                        <h4 class="dest-title">{{ dest.title }}</h4>
                        <div class="dest-meta">
                          @if (dest.category) {
                            <span class="dest-cat">{{ dest.category.name }}</span>
                          }
                          @if (dest.city) {
                            <span class="dest-loc">📍 {{ dest.city }}</span>
                          }
                        </div>
                        <div class="dest-foot">
                          <span
                            >{{ dest._count.reviews }}
                            {{ dest._count.reviews === 1 ? 'review' : 'reviews' }}</span
                          >
                          @if (dest.user) {
                            <span class="dest-date">by {{ dest.user.name }}</span>
                          }
                        </div>
                      </div>
                    </a>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-icon">♡</div>
                  <h3>No saved destinations yet</h3>
                  <p>Tap “Save” on any point or route and it will show up here.</p>
                  <a class="btn-cta" routerLink="/map">Go to map</a>
                </div>
              }
            } @else if (destinationsLoading()) {
              <div class="dest-skeleton-grid">
                @for (i of [1, 2, 3]; track i) {
                  <div class="dest-skeleton"></div>
                }
              </div>
            } @else {
              @let items = activeTab() === 'routes' ? routes() : points();
              @if (items.length > 0) {
                <div class="dest-grid">
                  @for (dest of items; track dest.id) {
                    <a
                      class="dest-card dest-card-link"
                      [routerLink]="['/map']"
                      [queryParams]="{ dest: dest.id }"
                    >
                      <div class="dest-thumb">
                        @if (dest.media[0]?.type === 'image') {
                          <img [src]="dest.media[0].url" [alt]="dest.title" />
                        } @else if (dest.media[0]?.type === 'video') {
                          <video [src]="dest.media[0].url" muted></video>
                        } @else {
                          <span class="dest-thumb-fallback">
                            {{ dest.type === 'route' ? '🗺' : '📍' }}
                          </span>
                        }
                      </div>
                      <div class="dest-body">
                        <h4 class="dest-title">{{ dest.title }}</h4>
                        <div class="dest-meta">
                          @if (dest.category) {
                            <span class="dest-cat">
                              {{ categoryIcon(dest.category.icon) }} {{ dest.category.name }}
                            </span>
                          }
                          @if (locationLabel(dest)) {
                            <span class="dest-loc">📍 {{ locationLabel(dest) }}</span>
                          }
                        </div>
                        <div class="dest-foot">
                          <span
                            >{{ dest._count.reviews }}
                            {{ dest._count.reviews === 1 ? 'review' : 'reviews' }}</span
                          >
                          <span class="dest-date">{{ formatDate(dest.createdAt) }}</span>
                        </div>
                      </div>
                    </a>
                  }
                </div>
              } @else if (activeTab() === 'routes') {
                <div class="empty-state">
                  <div class="empty-icon">🗺</div>
                  <h3>No routes yet</h3>
                  <p>Create a route on the map and it will appear here.</p>
                  <a class="btn-cta" routerLink="/map">Go to map</a>
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-icon">📍</div>
                  <h3>No points of interest yet</h3>
                  <p>Pin your favorite hidden spots and they will show up here.</p>
                  <a class="btn-cta" routerLink="/map">Go to map</a>
                </div>
              }
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
  private readonly destinationService = inject(DestinationService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly shareService = inject(ShareService);
  private readonly router = inject(Router);

  readonly categoryIcon = categoryIcon;

  editOpen = signal(false);
  activeTab = signal<'routes' | 'points' | 'saved'>('routes');

  // The user's own destinations, fetched from GET /destinations/mine.
  myDestinations = signal<UserDestination[]>([]);
  destinationsLoading = signal(true);
  readonly routes = computed(() => this.myDestinations().filter((d) => d.type === 'route'));
  readonly points = computed(() => this.myDestinations().filter((d) => d.type === 'point'));

  // The user's saved destinations, fetched lazily from GET /me/favorites.
  favorites = signal<FavoriteDestination[]>([]);
  favoritesLoading = signal(false);
  private favoritesLoaded = false;

  shareLabel = signal('🔗 Share');
  avatarError = signal(false);
  isUploadingAvatar = signal(false);
  avatarUploadError = signal<string | null>(null);
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

  constructor() {
    if (!this.auth.currentUser()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadMyDestinations();
  }

  private loadMyDestinations(): void {
    this.destinationsLoading.set(true);
    this.destinationService.getMine().subscribe({
      next: (dests) => {
        this.myDestinations.set(dests);
        this.destinationsLoading.set(false);
      },
      error: () => this.destinationsLoading.set(false),
    });
  }

  // Switch tabs; the Saved tab loads its data the first time it's opened.
  selectTab(tab: 'routes' | 'points' | 'saved'): void {
    this.activeTab.set(tab);
    if (tab === 'saved' && !this.favoritesLoaded) this.loadFavorites();
  }

  private loadFavorites(): void {
    this.favoritesLoaded = true;
    this.favoritesLoading.set(true);
    this.favoriteService.getMine().subscribe({
      next: (favs) => {
        this.favorites.set(favs);
        this.favoritesLoading.set(false);
      },
      error: () => this.favoritesLoading.set(false),
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.avatarUploadError.set('Please choose an image file.');
      return;
    }

    this.avatarUploadError.set(null);
    this.isUploadingAvatar.set(true);
    this.userService.uploadAvatar(file).subscribe({
      next: ({ avatarUrl }) => {
        const user = this.auth.currentUser()!;
        this.auth.updateStoredUser({ ...user, avatarUrl });
        this.avatarError.set(false);
        this.isUploadingAvatar.set(false);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarUploadError.set(err?.error?.error ?? 'Could not upload image. Try again.');
      },
    });
  }

  removeAvatar(): void {
    this.avatarUploadError.set(null);
    this.isUploadingAvatar.set(true);
    this.userService.deleteAvatar().subscribe({
      next: () => {
        const user = this.auth.currentUser()!;
        this.auth.updateStoredUser({ ...user, avatarUrl: null });
        this.isUploadingAvatar.set(false);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarUploadError.set(err?.error?.error ?? 'Could not remove image. Try again.');
      },
    });
  }

  locationLabel(dest: UserDestination): string {
    return [dest.city, dest.country].filter(Boolean).join(', ');
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
    this.userService
      .changePassword({ currentPassword: this.pwCurrent, newPassword: this.pwNew })
      .subscribe({
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

  async shareProfile(id: number): Promise<void> {
    const url = `${location.origin}/users/${id}`;
    const result = await this.shareService.share(
      url,
      `${this.auth.currentUser()?.name} on Waypoint`,
    );
    if (result === 'copied') this.flashShareLabel('✓ Link copied!');
    else if (result === 'failed') this.flashShareLabel('Could not share');
  }

  private flashShareLabel(text: string): void {
    this.shareLabel.set(text);
    setTimeout(() => this.shareLabel.set('🔗 Share'), 2000);
  }

  onSave(): void {
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.isSaving.set(true);

    this.userService.updateProfile({ name: this.nameInput }).subscribe({
      next: (updated) => {
        this.auth.updateStoredUser(updated);
        this.nameInput = updated.name;
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
