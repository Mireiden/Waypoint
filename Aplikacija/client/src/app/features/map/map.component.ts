import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ElementRef,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Destination } from '../../models/destination.model';

import { MapService } from '../../core/services/map.service';
import { ApiService, NominatimResult } from '../../core/services/api.service';

@Component({
  selector: 'app-map',
  imports: [FormsModule, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly apiService = inject(ApiService);

  readonly mapContainer = viewChild<ElementRef>('mapContainer');

  searchQuery = signal('');
  suggestions = signal<NominatimResult[]>([]);
  showSuggestions = signal(false);
  isSearching = signal(false);
  sidebarOpen = signal(true);
  selectedDestination = signal<Destination | null>(null);
  destinations = signal<Destination[]>([
    { id: 1, name: 'Kalemegdan', description: 'Historic fortress in Belgrade', type: 'poi' },
    { id: 2, name: 'Fruška Gora', description: 'Mountain range in Vojvodina', type: 'route' },
    { id: 3, name: 'Đavolja Varoš', description: 'Unique rock formations', type: 'poi' },
  ]);

  private readonly search$ = new Subject<string>();

  constructor() {
    afterNextRender(() => {
      this.mapService.init('map');
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

  onClickExpand(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
    setTimeout(() => this.mapService.invalidateSize(), 300);
  }
}
