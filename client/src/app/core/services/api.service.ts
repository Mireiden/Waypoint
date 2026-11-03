import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly nominatimBase = 'https://nominatim.openstreetmap.org';

  geocode(query: string): Observable<NominatimResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '5')
      .set('addressdetails', '1');

    return this.http.get<NominatimResult[]>(`${this.nominatimBase}/search`, {
      params,
      headers: { 'Accept-Language': 'en' },
    });
  }
}
