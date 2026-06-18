import {
  Component,
  OnDestroy,
  inject,
  signal,
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
import {
  Destination,
  DestinationReview,
  DestinationSort,
  DestinationSummary,
} from '../../models/destination.model';
import { Category } from '../../models/category.model';


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

  // Search state
  searchQuery = signal('');
  suggestions = signal<NominatimResult[]>([]);
  showSuggestions = signal(false);
  isSearching = signal(false);
  private readonly search$ = new Subject<string>();

  // Panel state
  panelCollapsed = signal(false);
  panelExpanded = signal(false);
  panelView = signal<'list' | 'detail'>('list');
  selectedDest = signal<Destination | null>(null);
  selectedReviews = signal<DestinationReview[]>([]);

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
          this.mapService.setMarkers(
            dests.map((d) => {
              const [lng, lat] = this.centerCoords(d);
              return { id: d.id, lat, lng, title: d.title };
            }),
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
    const [lng, lat] = this.centerCoords(summary);
    this.mapService.flyTo(lat, lng, 15);

    this.destinationService.getById(summary.id).subscribe((dest) => {
      this.selectedDest.set(dest);
    });

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
    this.mapService.zoomTo(13);
  }

  stars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  }

  locationLabel(dest: DestinationSummary): string {
    return [dest.city, dest.country].filter(Boolean).join(', ');
  }

  private readonly iconMap: Record<string, string> = {
    gem: '💎', mountain: '⛰', utensils: '🍽', zap: '⚡', fish: '🎣',
    tree: '🌲', camera: '📷', coffee: '☕', map: '🗺', star: '⭐',
  };

  categoryIcon(icon: string | null): string {
    return icon ? (this.iconMap[icon] ?? '📍') : '📍';
  }

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
