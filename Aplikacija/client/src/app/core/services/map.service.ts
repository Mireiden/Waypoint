import { Injectable } from '@angular/core';
import * as L from 'leaflet';

const DEFAULT_CENTER: L.LatLngTuple = [43.3217, 21.8959];
const DEFAULT_ZOOM = 13;

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Injectable({ providedIn: 'root' })
export class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  init(elementId: string): L.Map {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(elementId, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    return this.map;
  }

  setMarkers(
    items: { id: number; lat: number; lng: number; title: string }[],
    onClick: (id: number) => void,
  ): void {
    this.clearMarkers();
    items.forEach((item) => {
      const marker = L.marker([item.lat, item.lng])
        .bindTooltip(item.title, { direction: 'top' })
        .on('click', () => onClick(item.id));
      marker.addTo(this.map!);
      this.markers.push(marker);
    });
  }

  clearMarkers(): void {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
  }

  flyTo(lat: number, lng: number, zoom = 13): void {
    this.map?.flyTo([lat, lng], zoom, { duration: 1.2 });
  }

  zoomTo(zoom: number): void {
    this.map?.setZoom(zoom, { animate: true });
  }

  getMap(): L.Map | null {
    return this.map;
  }

  getBoundsBbox(): string | null {
    if (!this.map) return null;
    const b = this.map.getBounds();
    return `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
  }

  onMoveEnd(cb: () => void): void {
    this.map?.on('moveend', cb);
  }

  destroy(): void {
    this.map?.remove();
    this.map = null;
  }

  invalidateSize(): void {
    this.map?.invalidateSize();
  }
}
