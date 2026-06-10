import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminDestination,
  AdminReport,
  AdminReview,
  AdminService,
  AdminStats,
  AdminUser,
} from '../../core/services/admin.service';

type AdminTab = 'overview' | 'reports' | 'users' | 'destinations' | 'reviews';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  imports: [FormsModule, DatePipe, TitleCasePipe],
})
export class AdminComponent implements OnInit {
  activeTab = signal<AdminTab>('overview');

  stats = signal<AdminStats | null>(null);
  reports = signal<AdminReport[]>([]);
  users = signal<AdminUser[]>([]);
  destinations = signal<AdminDestination[]>([]);
  reviews = signal<AdminReview[]>([]);

  loading = signal(false);
  sidebarOpen = signal(false);

  private readonly adminService = inject(AdminService);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

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

  loadReviews() {
    this.loading.set(true);
    this.adminService.getReviews().subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setTab(tab: AdminTab) {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
    if (tab === 'reports' && this.reports().length === 0) this.loadReports();
    if (tab === 'users' && this.users().length === 0) this.loadUsers();
    if (tab === 'destinations' && this.destinations().length === 0) this.loadDestinations();
    if (tab === 'reviews' && this.reviews().length === 0) this.loadReviews();
  }

  approveReport(id: number) {
    this.adminService.approveReport(id).subscribe({
      next: () => this.reports.update(list => list.filter(r => r.id !== id)),
    });
  }

  declineReport(id: number) {
    this.adminService.declineReport(id).subscribe({
      next: () => this.reports.update(list => list.filter(r => r.id !== id)),
    });
  }

  deleteDestination(id: number) {
    this.adminService.deleteDestination(id).subscribe({
      next: () => this.destinations.update(list => list.filter(d => d.id !== id)),
    });
  }

  deleteReview(id: number) {
    this.adminService.deleteReview(id).subscribe({
      next: () => this.reviews.update(list => list.filter(r => r.id !== id)),
    });
  }
}
