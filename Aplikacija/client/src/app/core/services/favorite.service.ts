import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type { FavoriteDestination } from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/me/favorites`;

  // The signed-in user's saved destinations, newest first.
  getMine() {
    return this.http.get<FavoriteDestination[]>(this.base, { withCredentials: true });
  }

  // Save a destination. Idempotent server-side (upsert). The created favorite
  // row is returned by the API but we don't need it, so it's typed as void.
  add(destId: number) {
    return this.http.post<void>(`${this.base}/${destId}`, null, { withCredentials: true });
  }

  // Remove a destination from the user's saved list.
  remove(destId: number) {
    return this.http.delete<void>(`${this.base}/${destId}`, { withCredentials: true });
  }
}
