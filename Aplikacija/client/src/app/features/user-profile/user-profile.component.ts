import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { AdminService } from '../../core/services/admin.service';
import { ShareService } from '../../core/services/share.service';
import { PublicProfile } from '../../models/user.model';
import { UserDestination } from '../../models/destination.model';
import { categoryIcon } from '../../shared/category-icons';
import { ReportDialogComponent } from '../../shared/components/report-dialog/report-dialog.component';

@Component({
  selector: 'app-user-profile',
  styleUrl: './user-profile.component.scss',
  imports: [RouterLink, ReportDialogComponent],
  template: `
    @if (loading()) {
      <div class="profile-page">
        <div class="profile-hero skeleton-hero"></div>
      </div>
    } @else if (profile(); as user) {
      <div class="profile-page">
        <div class="profile-hero">
          <div class="hero-deco"></div>

          <div class="avatar-wrap">
            @if (user.avatarUrl && !avatarError()) {
              <img class="avatar-img" [src]="user.avatarUrl" [alt]="user.name" (error)="avatarError.set(true)" />
            } @else {
              <svg class="avatar-placeholder" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4.5" fill="currentColor" />
                <path d="M3 21c0-5 4-8.5 9-8.5s9 3.5 9 8.5" fill="currentColor" />
              </svg>
            }
          </div>

          <h1 class="user-name">{{ user.name }}</h1>
          @if (user.role) {
            <span class="role-badge" [class.admin]="user.role === 'admin'">
              {{ user.role === 'admin' ? 'Administrator' : 'Member' }}
            </span>
          }

          <div class="stats-row">
            <span class="stat"><strong>{{ routes().length }}</strong> routes</span>
            <span class="stat-dot">·</span>
            <span class="stat"><strong>{{ points().length }}</strong> points</span>
            <span class="stat-dot">·</span>
            <span class="stat">Since {{ formatDate(user.createdAt) }}</span>
          </div>

          <div class="hero-actions">
            <button class="btn-share" type="button" (click)="share(user)">
              {{ shareLabel() }}
            </button>
            @if (auth.currentUser() && !isSelf() && !isAdminViewer()) {
              <button class="btn-ghost" type="button" (click)="reporting.set(true)">⚑ Report</button>
            }
            @if (isSelf()) {
              <a class="btn-ghost" routerLink="/profile">Edit your profile</a>
            }
          </div>
        </div>

        <div class="profile-container">
          <!-- Admin-only moderation panel -->
          @if (isAdminViewer() && !isSelf()) {
            <div class="admin-panel">
              <div class="admin-panel-head">
                <span class="admin-tag">🛡 Admin</span>
                @if (user.email) {
                  <span class="admin-email">{{ user.email }}</span>
                }
              </div>
              <div class="admin-actions">
                <button class="btn-admin reports" type="button" (click)="goToReports(user.id)">
                  Jump to their reports
                </button>
                @if (!confirmingDelete()) {
                  <button class="btn-admin danger" type="button" (click)="confirmingDelete.set(true)">
                    Delete user
                  </button>
                } @else {
                  <span class="confirm-text">Delete this user and all their content?</span>
                  <button class="btn-admin danger" type="button" [disabled]="deleting()" (click)="deleteUser(user.id)">
                    {{ deleting() ? 'Deleting…' : 'Yes, delete' }}
                  </button>
                  <button class="btn-admin" type="button" (click)="confirmingDelete.set(false)">Cancel</button>
                }
              </div>
              @if (deleteError()) {
                <p class="form-error">{{ deleteError() }}</p>
              }
            </div>
          }

          <!-- Tab bar -->
          <div class="tab-bar">
            <button class="tab" [class.active]="activeTab() === 'routes'" (click)="activeTab.set('routes')">
              Routes
            </button>
            <button class="tab" [class.active]="activeTab() === 'points'" (click)="activeTab.set('points')">
              Points of Interest
            </button>
          </div>

          <!-- Tab content -->
          <div class="tab-content">
            @if (destinationsLoading()) {
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
                    <a class="dest-card" [routerLink]="['/map']" [queryParams]="{ dest: dest.id }">
                      <div class="dest-thumb">
                        @if (dest.media[0]?.type === 'image') {
                          <img [src]="dest.media[0].url" [alt]="dest.title" />
                        } @else if (dest.media[0]?.type === 'video') {
                          <video [src]="dest.media[0].url" muted></video>
                        } @else {
                          <span class="dest-thumb-fallback">{{ dest.type === 'route' ? '🗺' : '📍' }}</span>
                        }
                      </div>
                      <div class="dest-body">
                        <h4 class="dest-title">{{ dest.title }}</h4>
                        <div class="dest-meta">
                          @if (dest.category) {
                            <span class="dest-cat">{{ categoryIcon(dest.category.icon) }} {{ dest.category.name }}</span>
                          }
                          @if (locationLabel(dest)) {
                            <span class="dest-loc">📍 {{ locationLabel(dest) }}</span>
                          }
                        </div>
                        <div class="dest-foot">
                          <span>{{ dest._count.reviews }} {{ dest._count.reviews === 1 ? 'review' : 'reviews' }}</span>
                          <span class="dest-date">{{ formatDate(dest.createdAt) }}</span>
                        </div>
                      </div>
                    </a>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-icon">{{ activeTab() === 'routes' ? '🗺' : '📍' }}</div>
                  <h3>Nothing here yet</h3>
                  <p>{{ user.name }} hasn’t added any {{ activeTab() === 'routes' ? 'routes' : 'points' }} yet.</p>
                </div>
              }
            }
          </div>
        </div>
      </div>

      @if (reporting()) {
        <app-report-dialog
          targetType="user"
          [targetId]="user.id"
          [targetLabel]="user.name"
          (close)="reporting.set(false)"
        />
      }
    } @else {
      <div class="profile-page">
        <div class="not-found">
          <div class="empty-icon">🤷</div>
          <h3>User not found</h3>
          <p>This profile doesn’t exist or was removed.</p>
          <a class="btn-cta" routerLink="/map">Back to map</a>
        </div>
      </div>
    }
  `,
})
export class UserProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly adminService = inject(AdminService);
  private readonly shareService = inject(ShareService);
  protected readonly auth = inject(AuthService);

  readonly categoryIcon = categoryIcon;

  // The :id from the URL, reactive so navigating profile → profile reloads.
  private readonly userId = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: Number(this.route.snapshot.paramMap.get('id')) },
  );

  profile = signal<PublicProfile | null>(null);
  loading = signal(true);
  destinations = signal<UserDestination[]>([]);
  destinationsLoading = signal(true);

  activeTab = signal<'routes' | 'points'>('routes');
  avatarError = signal(false);

  confirmingDelete = signal(false);
  deleting = signal(false);
  deleteError = signal<string | null>(null);

  // Whether the report dialog is open for this profile.
  reporting = signal(false);

  shareLabel = signal('🔗 Share profile');

  readonly routes = computed(() => this.destinations().filter((d) => d.type === 'route'));
  readonly points = computed(() => this.destinations().filter((d) => d.type === 'point'));
  readonly isSelf = computed(() => this.auth.currentUser()?.id === this.userId());
  readonly isAdminViewer = computed(() => this.auth.currentUser()?.role === 'admin');

  constructor() {
    // React to id changes (initial load and navigation between profiles).
    let lastId: number | null = null;
    this.route.paramMap.subscribe((p) => {
      const id = Number(p.get('id'));
      if (!id || id === lastId) return;
      lastId = id;
      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.destinationsLoading.set(true);
    this.avatarError.set(false);
    this.confirmingDelete.set(false);
    this.deleteError.set(null);
    this.profile.set(null);
    this.destinations.set([]);

    this.userService.getProfile(id).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.userService.getUserDestinations(id).subscribe({
      next: (dests) => {
        this.destinations.set(dests);
        this.destinationsLoading.set(false);
      },
      error: () => this.destinationsLoading.set(false),
    });
  }

  async share(user: PublicProfile): Promise<void> {
    const url = `${location.origin}/users/${user.id}`;
    const result = await this.shareService.share(url, `${user.name} on Waypoint`);
    if (result === 'copied') this.flashShareLabel('✓ Link copied!');
    else if (result === 'failed') this.flashShareLabel('Could not share');
  }

  private flashShareLabel(text: string): void {
    this.shareLabel.set(text);
    setTimeout(() => this.shareLabel.set('🔗 Share profile'), 2000);
  }

  goToReports(id: number): void {
    this.router.navigate(['/admin'], {
      queryParams: { tab: 'reports', reportType: 'user', focusUser: id },
    });
  }

  deleteUser(id: number): void {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/admin'], { queryParams: { tab: 'users' } });
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.error ?? 'Could not delete user. Try again.');
      },
    });
  }

  locationLabel(dest: UserDestination): string {
    return [dest.city, dest.country].filter(Boolean).join(', ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }
}
