import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type {
  CreateDestinationPayload,
  Destination,
  DestinationSummary,
  Media,
  UpdateDestinationPayload,
} from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/destinations`;
  private readonly mediaBase = `${environment.apiUrl}/media`;

  getAll() {
    return this.http.get<DestinationSummary[]>(this.base, { withCredentials: true });
  }

  getById(id: number) {
    return this.http.get<Destination>(`${this.base}/${id}`, { withCredentials: true });
  }

  create(payload: CreateDestinationPayload) {
    return this.http.post<Destination>(this.base, payload, { withCredentials: true });
  }

  update(id: number, payload: UpdateDestinationPayload) {
    return this.http.patch<Destination>(`${this.base}/${id}`, payload, { withCredentials: true });
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`, { withCredentials: true });
  }

  uploadMedia(destinationId: number, files: File[]) {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return this.http.post<Media[]>(`${this.base}/${destinationId}/media`, form, {
      withCredentials: true,
    });
  }

  deleteMedia(mediaId: number) {
    return this.http.delete<void>(`${this.mediaBase}/${mediaId}`, { withCredentials: true });
  }

  deleteAllMedia(destinationId: number) {
    return this.http.delete<void>(`${this.base}/${destinationId}/media`, {
      withCredentials: true,
    });
  }
}
