import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type { DestinationReview } from '../../models/destination.model';
import type { ReviewDetail } from '../../models/review.model';

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

  // Single review, including the destination it belongs to (for moderation links).
  getById(reviewId: number) {
    return this.http.get<ReviewDetail>(`${this.reviewsBase}/${reviewId}`, {
      withCredentials: true,
    });
  }

  createReview(
    destinationId: number,
    payload: { rating: number; comment: string | null },
    files: File[] = [],
  ) {
    // Backend create route is multipart (upload.array("files")).
    const form = new FormData();
    form.append('rating', String(payload.rating));
    if (payload.comment) form.append('comment', payload.comment);
    files.forEach((f) => form.append('files', f));
    return this.http.post<DestinationReview>(`${this.base}/${destinationId}/reviews`, form, {
      withCredentials: true,
    });
  }

  updateReview(reviewId: number, payload: { rating?: number; comment?: string | null }) {
    return this.http.patch<DestinationReview>(`${this.reviewsBase}/${reviewId}`, payload, {
      withCredentials: true,
    });
  }

  deleteReview(reviewId: number) {
    return this.http.delete<void>(`${this.reviewsBase}/${reviewId}`, {
      withCredentials: true,
    });
  }
}
