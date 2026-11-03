import { Component, HostListener, OnInit, computed, input, output, signal } from '@angular/core';

import type { MediaType } from '../../../models/destination.model';

// Minimal shape shared by destination media and review media.
export interface LightboxMedia {
  url: string;
  type: MediaType;
}

@Component({
  selector: 'app-media-lightbox',
  template: `
    @let item = current();
    @if (item) {
      <div class="lb-backdrop" (click)="close.emit()">
        <button type="button" class="lb-close" aria-label="Close" (click)="close.emit()">✕</button>

        @if (items().length > 1) {
          <button
            type="button"
            class="lb-nav lb-prev"
            aria-label="Previous"
            (click)="prev($event)"
          >‹</button>
        }

        <!-- Stop propagation so clicking the media itself doesn't close the lightbox. -->
        <div class="lb-stage" (click)="$event.stopPropagation()">
          @if (item.type === 'image') {
            <img class="lb-media" [src]="item.url" alt="" />
          } @else {
            <video class="lb-media" [src]="item.url" controls autoplay></video>
          }
        </div>

        @if (items().length > 1) {
          <button
            type="button"
            class="lb-nav lb-next"
            aria-label="Next"
            (click)="next($event)"
          >›</button>
          <span class="lb-counter">{{ index() + 1 }} / {{ items().length }}</span>
        }
      </div>
    }
  `,
  styleUrl: './media-lightbox.component.scss',
})
export class MediaLightboxComponent implements OnInit {
  readonly items = input.required<LightboxMedia[]>();
  readonly startIndex = input<number>(0);

  readonly close = output<void>();

  readonly index = signal(0);
  readonly current = computed<LightboxMedia | undefined>(() => this.items()[this.index()]);

  ngOnInit(): void {
    // The lightbox is re-created on each open (via @if), so seed the index here.
    this.index.set(this.startIndex());
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    const len = this.items().length;
    this.index.update((i) => (i - 1 + len) % len);
  }

  next(event?: Event): void {
    event?.stopPropagation();
    const len = this.items().length;
    this.index.update((i) => (i + 1) % len);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close.emit();
    else if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'ArrowRight') this.next();
  }
}
