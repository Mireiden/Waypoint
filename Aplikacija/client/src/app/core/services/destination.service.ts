import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import type {
  CreateDestinationPayload,
  Destination,
  DestinationQueryParams,
  DestinationSummary,
  Media,
  UpdateDestinationPayload,
  UserDestination,
} from '../../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/destinations`;
  private readonly mediaBase = `${environment.apiUrl}/media`;

  getAll(query?: DestinationQueryParams) {
    let params = new HttpParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) params = params.set(key, value);
      }
    }
    return this.http.get<DestinationSummary[]>(this.base, { params, withCredentials: true });
  }

  getById(id: number) {
    return this.http.get<Destination>(`${this.base}/${id}`, { withCredentials: true });
  }

  getMine() {
    return this.http.get<UserDestination[]>(`${this.base}/mine`, { withCredentials: true });
  }

  create(payload: CreateDestinationPayload, files: File[] = []) {
    // The backend create route is multipart (upload.array("files")) and expects
    // `geometry` as a JSON string; the server parses it back via its jsonString() preprocessor.
    const form = new FormData();
    form.append('type', payload.type);
    form.append('title', payload.title);
    if (payload.description) form.append('description', payload.description);
    form.append('categoryId', String(payload.categoryId));
    form.append('geometry', JSON.stringify(payload.geometry));
    files.forEach((f) => form.append('files', f));
    return this.http.post<Destination>(this.base, form, { withCredentials: true });
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
