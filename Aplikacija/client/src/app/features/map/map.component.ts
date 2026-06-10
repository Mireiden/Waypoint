import {
  Component,
  OnDestroy,
  inject,
  signal,
  computed,
  afterNextRender,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MapService } from '../../core/services/map.service';
import { ApiService, NominatimResult } from '../../core/services/api.service';
import { Destination } from '../../models/destination.model';

const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 1,
    title: 'Kalemegdan Fortress Perimeter Walk',
    type: 'route',
    category: 'Scenic',
    categoryIcon: '🌄',
    categoryColor: '#2e7d52',
    rating: 4.8,
    reviewCount: 124,
    description:
      'A stunning walk along the ancient fortress walls overlooking the confluence of the Sava and Danube rivers. Best experienced at sunset when the golden light illuminates the old stone ramparts and the rivers shimmer far below.',
    city: 'Belgrade',
    country: 'Serbia',
    lat: 44.8225,
    lng: 20.4507,
    duration: '45 min',
    distance: '2.1 km',
    waypoints: [
      { title: 'Upper Fortress Main Gate', lat: 44.8234, lng: 20.4499 },
      { title: 'Roman Well & Inner Fortifications', lat: 44.8228, lng: 20.4511 },
      { title: 'Sava–Danube Confluence Overlook', lat: 44.8217, lng: 20.4496 },
    ],
    reviews: [
      {
        author: 'Mia K.',
        rating: 5,
        comment:
          'Absolutely breathtaking at sunset! The views over the river confluence are unlike anything else in the city.',
        date: 'May 2026',
      },
      {
        author: 'Luca R.',
        rating: 5,
        comment:
          "One of the best walks I've done in the Balkans. The fortress ruins add so much character to every step.",
        date: 'Apr 2026',
      },
    ],
  },
  {
    id: 2,
    title: 'Skadarlija Bohemian Quarter',
    type: 'point',
    category: 'Cultural',
    categoryIcon: '🏛',
    categoryColor: '#1b4d33',
    rating: 4.6,
    reviewCount: 89,
    description:
      "Belgrade's bohemian district — a cobblestone street lined with 19th-century taverns, street musicians, and antique shops. The soul of old Belgrade, often overlooked by tourists rushing straight to the fortress.",
    city: 'Belgrade',
    country: 'Serbia',
    lat: 44.8171,
    lng: 20.4631,
    reviews: [
      {
        author: 'Anna S.',
        rating: 5,
        comment:
          'Felt like stepping back in time. The live music pouring out of the kafanas in the evening is truly magical.',
        date: 'May 2026',
      },
      {
        author: 'Thomas B.',
        rating: 4,
        comment:
          'Charming street with a lot of character. A bit touristy at night but wonderful and quiet in the morning.',
        date: 'Mar 2026',
      },
    ],
  },
  {
    id: 3,
    title: 'Ada Ciganlija Lakeside Loop',
    type: 'route',
    category: 'Outdoor',
    categoryIcon: '🏃',
    categoryColor: '#3a9c68',
    rating: 4.7,
    reviewCount: 201,
    description:
      "Belgrade's beloved river-island escape — a full loop around the peninsula turned beach destination. Popular with joggers, cyclists, and swimmers. The shaded forest paths offer welcome relief from city heat.",
    city: 'Belgrade',
    country: 'Serbia',
    lat: 44.7869,
    lng: 20.4239,
    duration: '1h 20min',
    distance: '5.4 km',
    waypoints: [
      { title: 'Šljivovica Beach Entrance', lat: 44.7893, lng: 20.4217 },
      { title: 'Central Forest Trail Section', lat: 44.7862, lng: 20.4198 },
      { title: 'Lake Ada Peninsula Viewpoint', lat: 44.7848, lng: 20.4261 },
    ],
    reviews: [
      {
        author: 'Jana P.',
        rating: 5,
        comment: 'Perfect morning run — flat, scenic, and the lake views are gorgeous the entire way around.',
        date: 'May 2026',
      },
      {
        author: 'Nikola D.',
        rating: 5,
        comment: 'Great any time of year, but spring is something special when everything is in full bloom.',
        date: 'Apr 2026',
      },
    ],
  },
  {
    id: 4,
    title: 'Savamala Street Art District',
    type: 'point',
    category: 'Hidden Gem',
    categoryIcon: '💎',
    categoryColor: '#e8911a',
    rating: 4.4,
    reviewCount: 56,
    description:
      "Belgrade's creative quarter on the Sava riverfront — old warehouses transformed into galleries, studios, and bars. The murals change seasonally and the area comes alive on weekend nights with live music and pop-up events.",
    city: 'Belgrade',
    country: 'Serbia',
    lat: 44.8123,
    lng: 20.4467,
    reviews: [
      {
        author: 'Sara M.',
        rating: 5,
        comment:
          "Such a vibrant area! Found a tiny gallery with incredible local art. Don't miss the murals on Karađorđeva street.",
        date: 'Jun 2026',
      },
      {
        author: 'Filip J.',
        rating: 4,
        comment: 'Very cool neighbourhood, especially the floating clubs along the river at night. A real hidden gem.',
        date: 'May 2026',
      },
    ],
  },
  {
    id: 5,
    title: 'Zemun Old Town Riverside Walk',
    type: 'route',
    category: 'Scenic',
    categoryIcon: '🌄',
    categoryColor: '#2e7d52',
    rating: 4.5,
    reviewCount: 73,
    description:
      "A peaceful walk through Zemun's Austro-Hungarian old town down to the Danube quayside. The pastel-coloured facades and catfish restaurants lining the river make this one of Belgrade's finest hidden walks.",
    city: 'Zemun',
    country: 'Serbia',
    lat: 44.8435,
    lng: 20.4119,
    duration: '1h',
    distance: '3.2 km',
    waypoints: [
      { title: 'Zemun Clock Tower (Gardoš)', lat: 44.845, lng: 20.408 },
      { title: 'St. Nicholas Orthodox Church', lat: 44.8443, lng: 20.4098 },
      { title: 'Zemun Quay (Kej)', lat: 44.842, lng: 20.4131 },
    ],
    reviews: [
      {
        author: 'Ivana C.',
        rating: 5,
        comment:
          'Zemun feels like a completely different city — so charming and peaceful compared to central Belgrade.',
        date: 'Apr 2026',
      },
      {
        author: 'Marco F.',
        rating: 4,
        comment: 'Beautiful walk, especially along the quayside in the evening. Great catfish restaurants too!',
        date: 'Mar 2026',
      },
    ],
  },
];

@Component({
  selector: 'app-map',
  imports: [FormsModule, CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnDestroy {
  private readonly mapService = inject(MapService);
  private readonly apiService = inject(ApiService);

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
  activeFilter = signal<'all' | 'point' | 'route'>('all');

  readonly destinations = signal<Destination[]>(MOCK_DESTINATIONS);

  readonly filteredDestinations = computed(() => {
    const filter = this.activeFilter();
    const all = this.destinations();
    return filter === 'all' ? all : all.filter((d) => d.type === filter);
  });

  constructor() {
    afterNextRender(() => {
      if (window.innerWidth <= 768) this.panelCollapsed.set(true);
      this.mapService.init('map');
      this.mapService.setMarkers(
        MOCK_DESTINATIONS.map((d) => ({ id: d.id, lat: d.lat, lng: d.lng, title: d.title })),
        (id) => this.selectById(id),
      );
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
  }

  selectDestination(dest: Destination): void {
    this.selectedDest.set(dest);
    this.panelView.set('detail');
    if (this.panelCollapsed()) this.panelCollapsed.set(false);
    this.mapService.flyTo(dest.lat, dest.lng, 15);
  }

  selectById(id: number): void {
    const dest = MOCK_DESTINATIONS.find((d) => d.id === id);
    if (dest) this.selectDestination(dest);
  }

  backToList(): void {
    this.panelView.set('list');
    this.selectedDest.set(null);
    this.mapService.zoomTo(13);
  }

  stars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
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
