import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserWithCount } from '../../models/user.model';
import {
  ReportedTarget,
  ReportSort,
  ReportStatus,
  ReportTargetType,
  TargetReport,
} from '../../models/report.model';
import { AdminDestination, Destination } from '../../models/destination.model';
import { ReviewDetail } from '../../models/review.model';
import { CategoryWithCount } from '../../models/category.model';
import { AdminService } from '../../core/services/admin.service';
import { ReportService } from '../../core/services/report.service';
import { DestinationService } from '../../core/services/destination.service';
import { ReviewService } from '../../core/services/review.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { CATEGORY_EMOJIS, categoryIcon } from '../../shared/category-icons';

type AdminTab = 'overview' | 'reports' | 'users' | 'destinations' | 'categories';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  imports: [FormsModule, DatePipe, TitleCasePipe],
})
export class AdminComponent implements OnInit {
  activeTab = signal<AdminTab>('overview');

  // stats = signal<AdminStats | null>(null);

  // ─── Reports (UC-11) ───────────────────────────────
  // Reports are grouped by the target they were filed against.
  reportedTargets = signal<ReportedTarget[]>([]);
  reportStatus = signal<ReportStatus>('pending');
  reportType = signal<ReportTargetType | 'all'>('all');
  reportSort = signal<ReportSort>('mostReports');
  // The target whose individual reports are expanded, plus those reports.
  openTargetKey = signal<string | null>(null);
  targetReports = signal<TargetReport[]>([]);
  loadingTargetReports = signal(false);
  // The reported target's actual content (so the admin can see/visit what was reported).
  targetDestination = signal<Destination | null>(null);
  targetReview = signal<ReviewDetail | null>(null);
  loadingTargetContent = signal(false);

  users = signal<UserWithCount[]>([]);
  destinations = signal<AdminDestination[]>([]);
  categories = signal<CategoryWithCount[]>([]);

  // New-category form
  newCategoryName = signal('');
  newCategoryIcon = signal<string>(CATEGORY_EMOJIS[0]);
  savingCategory = signal(false);
  categoryError = signal<string | null>(null);

  // Inline edit state
  editingId = signal<number | null>(null);
  editName = signal('');
  editIcon = signal<string>(CATEGORY_EMOJIS[0]);

  // Emoji picker open state (one for the add form, one for the row being edited).
  addIconPickerOpen = signal(false);
  editIconPickerOpen = signal(false);

  // Inline "are you sure?" state for destructive actions.
  confirmingDestId = signal<number | null>(null);
  confirmingUserId = signal<number | null>(null);

  // Which mobile cards are expanded to show their full detail (mobile-only).
  expandedRows = signal<Set<number>>(new Set());

  loading = signal(false);
  sidebarOpen = signal(false);

  readonly emojiChoices = CATEGORY_EMOJIS;
  readonly categoryIcon = categoryIcon;

  private readonly adminService = inject(AdminService);
  private readonly reportService = inject(ReportService);
  private readonly destinationService = inject(DestinationService);
  private readonly reviewService = inject(ReviewService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  ngOnInit() {
    // this.loadStats();
  }

  // loadStats() {
  //   this.loading.set(true);
  //   this.adminService.getStats().subscribe({
  //     next: (data) => {
  //       this.stats.set(data);
  //       this.loading.set(false);
  //     },
  //     error: () => this.loading.set(false),
  //   });
  // }

  targetKey(t: ReportedTarget): string {
    return `${t.type}:${t.id}`;
  }

  loadReports() {
    this.loading.set(true);
    this.openTargetKey.set(null);
    const type = this.reportType();
    this.reportService
      .getReportedTargets({
        status: this.reportStatus(),
        targetType: type === 'all' ? undefined : type,
        sort: this.reportSort(),
      })
      .subscribe({
        next: (data) => {
          this.reportedTargets.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  setReportStatus(status: ReportStatus) {
    this.reportStatus.set(status);
    this.loadReports();
  }

  setReportType(type: ReportTargetType | 'all') {
    this.reportType.set(type);
    this.loadReports();
  }

  setReportSort(sort: ReportSort) {
    this.reportSort.set(sort);
    this.loadReports();
  }

  toggleTarget(target: ReportedTarget) {
    const key = this.targetKey(target);
    if (this.openTargetKey() === key) {
      this.openTargetKey.set(null);
      return;
    }
    this.openTargetKey.set(key);
    this.targetReports.set([]);
    this.targetDestination.set(null);
    this.targetReview.set(null);

    // The individual reports (who reported it and why).
    this.loadingTargetReports.set(true);
    this.reportService.getReportsForTarget(target.type, target.id).subscribe({
      next: (data) => {
        this.targetReports.set(data);
        this.loadingTargetReports.set(false);
      },
      error: () => this.loadingTargetReports.set(false),
    });

    // The reported content itself, reusing the existing detail endpoints.
    this.loadingTargetContent.set(true);
    if (target.type === 'destination') {
      this.destinationService.getById(target.id).subscribe({
        next: (d) => {
          this.targetDestination.set(d);
          this.loadingTargetContent.set(false);
        },
        error: () => this.loadingTargetContent.set(false),
      });
    } else if (target.type === 'review') {
      this.reviewService.getById(target.id).subscribe({
        next: (r) => {
          this.targetReview.set(r);
          this.loadingTargetContent.set(false);
        },
        error: () => this.loadingTargetContent.set(false),
      });
    } else {
      this.loadingTargetContent.set(false); // user targets have no destination to visit
    }
  }

  // Open the reported destination on the map. For a review, open its parent
  // destination and highlight the review via query params.
  goToDestination(target: ReportedTarget) {
    if (target.type === 'destination') {
      this.router.navigate(['/map'], { queryParams: { dest: target.id } });
    } else if (target.type === 'review') {
      const review = this.targetReview();
      if (review?.destination) {
        this.router.navigate(['/map'], {
          queryParams: { dest: review.destination.id, review: review.id },
        });
      }
    }
  }

  stars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }

  resolveTarget(target: ReportedTarget, status: 'resolved' | 'dismissed') {
    const key = this.targetKey(target);
    this.reportService.setStatus(target.type, target.id, status).subscribe({
      next: () => {
        this.reportedTargets.update((list) => list.filter((t) => this.targetKey(t) !== key));
        if (this.openTargetKey() === key) this.openTargetKey.set(null);
      },
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadDestinations() {
    this.loading.set(true);
    this.adminService.getDestinations().subscribe({
      next: (data) => {
        this.destinations.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCategories() {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
    this.confirmingDestId.set(null);
    this.confirmingUserId.set(null);
    this.expandedRows.set(new Set());
    this.openTargetKey.set(null);
    if (tab === 'reports') this.loadReports();
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
    if (tab === 'destinations' && this.destinations().length === 0) this.loadDestinations();
    if (tab === 'categories' && this.categories().length === 0) this.loadCategories();
  }

  isExpanded(id: number): boolean {
    return this.expandedRows().has(id);
  }

  toggleRow(id: number): void {
    this.expandedRows.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  deleteDestination(id: number) {
    this.adminService.deleteDestination(id).subscribe({
      next: () => {
        this.destinations.update((list) => list.filter((d) => d.id !== id));
        this.confirmingDestId.set(null);
      },
    });
  }

  deleteUser(id: number) {
    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== id));
        this.confirmingUserId.set(null);
      },
    });
  }

  createCategory() {
    const name = this.newCategoryName().trim();
    if (!name || this.savingCategory()) return;

    this.savingCategory.set(true);
    this.categoryError.set(null);
    this.categoryService.create({ name, icon: this.newCategoryIcon() }).subscribe({
      next: (cat) => {
        this.categories.update((list) => [...list, { ...cat, _count: { destinations: 0 } }]);
        this.newCategoryName.set('');
        this.newCategoryIcon.set(this.emojiChoices[0]);
        this.addIconPickerOpen.set(false);
        this.savingCategory.set(false);
      },
      error: (err) => {
        this.categoryError.set(this.errorMessage(err, 'Failed to add category'));
        this.savingCategory.set(false);
      },
    });
  }

  startEdit(cat: CategoryWithCount) {
    this.editingId.set(cat.id);
    this.editName.set(cat.name);
    this.editIcon.set(cat.icon ?? this.emojiChoices[0]);
    this.editIconPickerOpen.set(false);
    this.categoryError.set(null);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editIconPickerOpen.set(false);
  }

  pickNewIcon(emoji: string) {
    this.newCategoryIcon.set(emoji);
    this.addIconPickerOpen.set(false);
  }

  pickEditIcon(emoji: string) {
    this.editIcon.set(emoji);
    this.editIconPickerOpen.set(false);
  }

  saveEdit(id: number) {
    const name = this.editName().trim();
    if (!name) return;

    this.categoryService.update(id, { name, icon: this.editIcon() }).subscribe({
      next: (cat) => {
        this.categories.update((list) =>
          list.map((c) => (c.id === id ? { ...c, name: cat.name, icon: cat.icon } : c)),
        );
        this.editingId.set(null);
      },
      error: (err) => this.categoryError.set(this.errorMessage(err, 'Failed to update category')),
    });
  }

  deleteCategory(id: number) {
    this.categoryError.set(null);
    this.categoryService.remove(id).subscribe({
      next: () => this.categories.update((list) => list.filter((c) => c.id !== id)),
      error: (err) => this.categoryError.set(this.errorMessage(err, 'Failed to delete category')),
    });
  }

  private errorMessage(err: unknown, fallback: string): string {
    const apiError = (err as { error?: { error?: string } })?.error?.error;
    return typeof apiError === 'string' ? apiError : fallback;
  }
}
