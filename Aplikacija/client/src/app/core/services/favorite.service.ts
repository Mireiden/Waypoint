import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type { FavoriteDestination } from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/me/favorites`;

  getMine() {
    return this.http.get<FavoriteDestination[]>(this.base, { withCredentials: true });
  }

  add(destId: number) {
    return this.http.post<void>(`${this.base}/${destId}`, null, { withCredentials: true });
  }

  remove(destId: number) {
    return this.http.delete<void>(`${this.base}/${destId}`, { withCredentials: true });
  }
}
