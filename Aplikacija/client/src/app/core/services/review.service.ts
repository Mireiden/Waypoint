import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type { DestinationReview } from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/destinations`;
  private readonly reviewsBase = `${environment.apiUrl}/reviews`;

  getByDestinationId(destinationId: number) {
    return this.http.get<DestinationReview[]>(`${this.base}/${destinationId}/reviews`, {
      withCredentials: true,
    });
  }

  deleteReview(reviewId: number) {
    return this.http.delete<void>(`${this.reviewsBase}/${reviewId}`, {
      withCredentials: true,
    });
  }
}
