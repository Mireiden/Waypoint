import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type { DestinationReview } from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/destinations`;

  getByDestinationId(destinationId: number) {
    return this.http.get<DestinationReview[]>(`${this.base}/${destinationId}/reviews`, {
      withCredentials: true,
    });
  }
}
