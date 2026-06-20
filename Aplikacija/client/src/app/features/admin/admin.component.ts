import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserWithCount } from '../../models/user.model';
import { Report } from '../../models/report.model';
import { AdminDestination } from '../../models/destination.model';
import { CategoryWithCount } from '../../models/category.model';
import { AdminService } from '../../core/services/admin.service';
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
  reports = signal<Report[]>([]);
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
  private readonly categoryService = inject(CategoryService);
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

  loadReports() {
    this.loading.set(true);
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
    if (tab === 'reports' && this.reports().length === 0) this.loadReports();
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

  approveReport(id: number) {
    this.adminService.approveReport(id).subscribe({
      next: () => this.reports.update((list) => list.filter((r) => r.id !== id)),
    });
  }

  declineReport(id: number) {
    this.adminService.declineReport(id).subscribe({
      next: () => this.reports.update((list) => list.filter((r) => r.id !== id)),
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
