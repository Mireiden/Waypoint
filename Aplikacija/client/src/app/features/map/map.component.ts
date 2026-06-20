import {
  Component,
  OnDestroy,
  inject,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MapService } from '../../core/services/map.service';
import { ApiService, NominatimResult } from '../../core/services/api.service';
import { DestinationService } from '../../core/services/destination.service';
import { CategoryService } from '../../core/services/category.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import {
  CreateDestinationPayload,
  Destination,
  DestinationGeometry,
  DestinationReview,
  DestinationSort,
  DestinationSummary,
} from '../../models/destination.model';
import { Category } from '../../models/category.model';
import { categoryIcon } from '../../shared/category-icons';


@Component({
  selector: 'app-map',
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly apiService = inject(ApiService);
  private readonly destinationService = inject(DestinationService);
  private readonly categoryService = inject(CategoryService);
  private readonly reviewService = inject(ReviewService);
  readonly auth = inject(AuthService);

  // Search state
  searchQuery = signal('');
  suggestions = signal<NominatimResult[]>([]);
  showSuggestions = signal(false);
  isSearching = signal(false);
  private readonly search$ = new Subject<string>();

  // Panel state
  panelCollapsed = signal(false);
  panelExpanded = signal(false);
  panelView = signal<'list' | 'detail' | 'create'>('list');
  selectedDest = signal<Destination | null>(null);
  selectedReviews = signal<DestinationReview[]>([]);

  // Admins can moderate (delete) any review straight from the detail panel.
  readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');
  // Which review is showing an inline "delete?" confirmation.
  confirmingReviewId = signal<number | null>(null);

  // Create-destination state
  createType = signal<'point' | 'route' | null>(null);
  drawnGeometry = signal<DestinationGeometry | null>(null);
  newTitle = '';
  newDescription = '';
  newCategoryId: number | null = null;
  newFiles: File[] = [];
  publishing = signal(false);
  createError = signal<string | null>(null);
  editing = signal(false);

  // Destination filters — drive the findMany query on the backend
  activeFilter = signal<'all' | 'point' | 'route'>('all');
  selectedCategory = signal<number | null>(null);
  sortBy = signal<DestinationSort>('recent');
  categories = signal<Category[]>([]);

  readonly destinations = signal<DestinationSummary[]>([]);

  private readonly reload$ = new Subject<void>();

  constructor() {
    afterNextRender(() => {
      if (window.innerWidth <= 768) this.panelCollapsed.set(true);
      this.mapService.init('map');
      this.mapService.onMoveEnd(() => this.reload$.next());

      this.categoryService.getAll().subscribe({
        next: (cats) => this.categories.set(cats),
        error: (err) => console.error('Failed to load categories:', err),
      });

      this.reload$.next();
    });

    this.reload$
      .pipe(
        debounceTime(300),
        switchMap(() => this.destinationService.getAll(this.buildQuery())),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (dests) => {
          this.destinations.set(dests);
          // Points (and the marker for routes) as markers; routes also get a polyline.
          this.mapService.setMarkers(
            dests.map((d) => {
              const [lng, lat] = this.centerCoords(d);
              return { id: d.id, lat, lng, title: d.title };
            }),
            (id) => this.selectById(id),
          );
          this.mapService.setRoutes(
            dests
              .filter((d) => d.geometry.type === 'LineString')
              .map((d) => ({
                id: d.id,
                title: d.title,
                latlngs: (d.geometry as { coordinates: [number, number][] }).coordinates.map(
                  ([lng, lat]) => [lat, lng] as [number, number],
                ),
              })),
            (id) => this.selectById(id),
          );
        },
        error: (err) => console.error('Failed to load destinations:', err),
      });

    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < 2) {
            this.suggestions.set([]);
            this.isSearching.set(false);
            return of([]);
          }
          this.isSearching.set(true);
          return this.apiService.geocode(q);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (results) => {
          this.suggestions.set(results);
          this.showSuggestions.set(results.length > 0);
          this.isSearching.set(false);
        },
        error: () => this.isSearching.set(false),
      });
  }

  togglePanel(): void {
    const next = !this.panelCollapsed();
    this.panelCollapsed.set(next);
    if (next) this.panelExpanded.set(false);
    setTimeout(() => this.mapService.invalidateSize(), 300);
  }

  toggleExpanded(): void {
    const next = !this.panelExpanded();
    this.panelExpanded.set(next);
    if (next && this.panelCollapsed()) this.panelCollapsed.set(false);
    setTimeout(() => this.mapService.invalidateSize(), 300);
  }

  setFilter(filter: 'all' | 'point' | 'route'): void {
    this.activeFilter.set(filter);
    this.reload$.next();
  }

  setCategory(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.reload$.next();
  }

  setSort(sort: DestinationSort): void {
    this.sortBy.set(sort);
    this.reload$.next();
  }

  private buildQuery() {
    const filter = this.activeFilter();
    return {
      type: filter === 'all' ? undefined : filter,
      category: this.selectedCategory() ?? undefined,
      sort: this.sortBy(),
      bbox: this.mapService.getBoundsBbox() ?? undefined,
    };
  }

  selectDestination(summary: DestinationSummary): void {
    this.panelView.set('detail');
    if (this.panelCollapsed()) this.panelCollapsed.set(false);
    if (summary.geometry.type === 'LineString') {
      const latlngs = summary.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng] as [number, number],
      );
      this.mapService.fitRoute(latlngs);
    } else {
      const [lng, lat] = this.centerCoords(summary);
      this.mapService.flyTo(lat, lng, 17);
    }

    this.destinationService.getById(summary.id).subscribe((dest) => {
      this.selectedDest.set(dest);
    });

    this.confirmingReviewId.set(null);
    this.reviewService.getByDestinationId(summary.id).subscribe({
      next: (reviews) => this.selectedReviews.set(reviews),
      error: (err) => console.error('Failed to load reviews:', err),
    });
  }

  selectById(id: number): void {
    const summary = this.destinations().find((d) => d.id === id);
    if (summary) this.selectDestination(summary);
  }

  backToList(): void {
    this.panelView.set('list');
    this.selectedDest.set(null);
    this.selectedReviews.set([]);
    this.confirmingReviewId.set(null);
    this.mapService.zoomTo(13);
  }

  deleteReview(reviewId: number): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.confirmingReviewId.set(null);
        this.selectedReviews.update((list) => list.filter((r) => r.id !== reviewId));
        // Keep the detail header's rating summary in sync with what's left.
        const dest = this.selectedDest();
        if (!dest) return;
        const remaining = this.selectedReviews();
        const reviewCount = remaining.length;
        const avgRating = reviewCount
          ? Math.round((remaining.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : 0;
        this.selectedDest.set({ ...dest, reviewCount, avgRating });
      },
      error: (err) => console.error('Failed to delete review:', err),
    });
  }

  // ─── Create destination ──────────────────────────────
  startCreate(): void {
    this.resetCreateForm();
    this.createType.set(null);
    this.drawnGeometry.set(null);
    this.panelView.set('create');
    if (this.panelCollapsed()) this.panelCollapsed.set(false);
  }

  chooseCreateType(type: 'point' | 'route'): void {
    this.mapService.disableEditDrawn();
    this.editing.set(false);
    this.createType.set(type);
    this.drawnGeometry.set(null);
    this.createError.set(null);
    this.mapService.enableCreate(type, (geometry) => this.drawnGeometry.set(geometry));
  }

  redraw(): void {
    const type = this.createType();
    if (type) this.chooseCreateType(type);
  }

  isLoopClosed(): boolean {
    const g = this.drawnGeometry();
    if (!g || g.type !== 'LineString' || g.coordinates.length < 2) return false;
    const [first, last] = [g.coordinates[0], g.coordinates[g.coordinates.length - 1]];
    return first[0] === last[0] && first[1] === last[1];
  }

  canCloseLoop(): boolean {
    const g = this.drawnGeometry();
    return !!g && g.type === 'LineString' && g.coordinates.length >= 3 && !this.isLoopClosed();
  }

  closeLoop(): void {
    const geometry = this.mapService.closeDrawnLoop();
    if (geometry) this.drawnGeometry.set(geometry);
  }

  canUndo(): boolean {
    const g = this.drawnGeometry();
    return !!g && g.type === 'LineString' && g.coordinates.length > 2;
  }

  undoLastPoint(): void {
    const geometry = this.mapService.undoLastDrawnPoint();
    if (geometry) this.drawnGeometry.set(geometry);
  }

  toggleEdit(): void {
    if (this.editing()) {
      this.mapService.disableEditDrawn();
      this.editing.set(false);
    } else {
      this.mapService.enableEditDrawn((geometry) => this.drawnGeometry.set(geometry));
      this.editing.set(true);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newFiles = input.files ? Array.from(input.files) : [];
  }

  canPublish(): boolean {
    const g = this.drawnGeometry();
    const geometryValid =
      !!g && (g.type !== 'LineString' || g.coordinates.length >= 2);
    return (
      this.newTitle.trim().length > 0 &&
      this.newCategoryId !== null &&
      geometryValid &&
      !this.publishing()
    );
  }

  publish(): void {
    const geometry = this.drawnGeometry();
    const type = this.createType();
    if (!geometry || !type || this.newCategoryId === null || !this.newTitle.trim()) return;

    const payload = {
      type,
      title: this.newTitle.trim(),
      description: this.newDescription.trim() || undefined,
      categoryId: this.newCategoryId,
      geometry,
    } as CreateDestinationPayload;

    this.publishing.set(true);
    this.createError.set(null);
    this.destinationService.create(payload, this.newFiles).subscribe({
      next: (dest) => {
        this.publishing.set(false);
        this.mapService.disableEditDrawn();
        this.editing.set(false);
        this.mapService.disableCreate();
        this.resetCreateForm();
        this.createType.set(null);
        this.drawnGeometry.set(null);
        this.reload$.next();
        // Jump straight to the new destination's detail view.
        this.selectedDest.set(dest);
        this.selectedReviews.set([]);
        this.panelView.set('detail');
        const [lng, lat] = this.centerCoords(dest);
        this.mapService.flyTo(lat, lng, 15);
      },
      error: (err) => {
        this.publishing.set(false);
        // The API returns errors as { error: "message" }.
        this.createError.set(err?.error?.error ?? 'Failed to publish destination.');
      },
    });
  }

  cancelCreate(): void {
    this.mapService.disableEditDrawn();
    this.editing.set(false);
    this.mapService.disableCreate();
    this.resetCreateForm();
    this.createType.set(null);
    this.drawnGeometry.set(null);
    this.panelView.set('list');
  }

  private resetCreateForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newCategoryId = null;
    this.newFiles = [];
    this.createError.set(null);
    this.publishing.set(false);
  }

  stars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }

  locationLabel(dest: DestinationSummary): string {
    return [dest.city, dest.country].filter(Boolean).join(', ');
  }

  readonly categoryIcon = categoryIcon;

  private centerCoords(dest: DestinationSummary): [number, number] {
    if (dest.geometry.type === 'Point') return dest.geometry.coordinates;
    const coords = dest.geometry.coordinates;
    return coords[Math.floor(coords.length / 2)];
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  selectLocation(result: NominatimResult): void {
    this.searchQuery.set(result.display_name.split(',')[0]);
    this.showSuggestions.set(false);
    this.suggestions.set([]);
    this.mapService.flyTo(parseFloat(result.lat), parseFloat(result.lon));
  }

  closeSuggestions(): void {
    setTimeout(() => this.showSuggestions.set(false), 150);
  }

  ngOnDestroy(): void {
    this.mapService.destroy();
  }
}
