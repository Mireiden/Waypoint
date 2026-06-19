import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

import type { DestinationGeometry } from '../../models/destination.model';

const DEFAULT_CENTER: L.LatLngTuple = [43.3217, 21.8959];
const DEFAULT_ZOOM = 13;
const ROUTE_COLOR = '#2e7d52';

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
  private routeLayers: L.Polyline[] = [];

  // Create-mode state
  private drawnLayer: L.Layer | null = null;
  private createCb: ((geometry: DestinationGeometry) => void) | null = null;
  private editCb: ((geometry: DestinationGeometry) => void) | null = null;

  // Re-read the drawn shape's geometry after any edit (drag / add / remove vertex).
  private readonly handleEdit = (): void => {
    if (!this.drawnLayer) return;
    const feature = (this.drawnLayer as L.Polyline | L.Marker).toGeoJSON();
    this.editCb?.(feature.geometry as DestinationGeometry);
  };

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

    // Geoman fires pm:create when a shape is finished while drawing is enabled.
    this.map.on('pm:create', (e: { layer: L.Layer }) => {
      this.drawnLayer = e.layer;
      const feature = (e.layer as L.Polyline | L.Marker).toGeoJSON();
      const geometry = feature.geometry as DestinationGeometry;
      this.map?.pm.disableDraw();
      this.createCb?.(geometry);
    });

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

  /** Draw route destinations as polylines. `latlngs` are [lat, lng] pairs (Leaflet order). */
  setRoutes(
    items: { id: number; latlngs: L.LatLngTuple[]; title: string }[],
    onClick: (id: number) => void,
  ): void {
    this.clearRoutes();
    items.forEach((item) => {
      const line = L.polyline(item.latlngs, { color: ROUTE_COLOR, weight: 4, opacity: 0.85 })
        .bindTooltip(item.title, { direction: 'top', sticky: true })
        .on('click', () => onClick(item.id));
      line.addTo(this.map!);
      this.routeLayers.push(line);
    });
  }

  clearRoutes(): void {
    this.routeLayers.forEach((l) => l.remove());
    this.routeLayers = [];
  }

  /** Enable Geoman drawing for a point (marker) or route (line). */
  enableCreate(type: 'point' | 'route', onCreated: (geometry: DestinationGeometry) => void): void {
    if (!this.map) return;
    this.clearDrawn();
    this.createCb = onCreated;
    this.map.pm.enableDraw(type === 'point' ? 'Marker' : 'Line', {
      continueDrawing: false,
      snappable: true,
    });
  }

  /** Stop drawing and discard the in-progress shape (used on cancel). */
  disableCreate(): void {
    if (!this.map) return;
    this.map.pm.disableDraw();
    this.clearDrawn();
    this.createCb = null;
  }

  /** Remove the temporary drawn shape from the map. */
  clearDrawn(): void {
    if (this.drawnLayer) {
      this.drawnLayer.remove();
      this.drawnLayer = null;
    }
  }

  /**
   * Close the drawn route into a loop by appending the first vertex to the end.
   * Returns the updated geometry, or null if it can't be closed (not a polyline,
   * fewer than 3 points, or already closed).
   */
  closeDrawnLoop(): DestinationGeometry | null {
    if (!(this.drawnLayer instanceof L.Polyline)) return null;
    const latlngs = this.drawnLayer.getLatLngs() as L.LatLng[];
    if (latlngs.length < 3) return null;

    const first = latlngs[0];
    const last = latlngs[latlngs.length - 1];
    if (first.lat !== last.lat || first.lng !== last.lng) {
      this.drawnLayer.setLatLngs([...latlngs, first]);
    }
    const feature = this.drawnLayer.toGeoJSON();
    return feature.geometry as DestinationGeometry;
  }

  /**
   * Remove the last vertex of the drawn route. Returns the updated geometry,
   * or null if it can't (not a polyline, or already at the 2-point minimum).
   */
  undoLastDrawnPoint(): DestinationGeometry | null {
    if (!(this.drawnLayer instanceof L.Polyline)) return null;
    const latlngs = this.drawnLayer.getLatLngs() as L.LatLng[];
    if (latlngs.length <= 2) return null; // keep a valid LineString (min 2)
    latlngs.pop();
    this.drawnLayer.setLatLngs(latlngs);
    return this.drawnLayer.toGeoJSON().geometry as DestinationGeometry;
  }

  /**
   * Enable Geoman edit mode on the drawn shape: drag vertices, add via middle
   * handles, and tap a vertex to delete it (removeVertexOn: 'click' so it works
   * on touch, where there is no right-click). `onChange` fires after each edit.
   */
  enableEditDrawn(onChange: (geometry: DestinationGeometry) => void): void {
    const layer = this.drawnLayer as (L.Polyline | L.Marker) & { pm?: L.PM.PMLayer };
    if (!layer?.pm) return;
    this.editCb = onChange;
    this.map?.pm.setGlobalOptions({ removeVertexOn: 'click' });
    layer.pm.enable({ removeVertexOn: 'click' });
    layer.on('pm:edit', this.handleEdit);
    layer.on('pm:vertexremoved', this.handleEdit);
    layer.on('pm:markerdragend', this.handleEdit);
  }

  disableEditDrawn(): void {
    const layer = this.drawnLayer as (L.Polyline | L.Marker) & { pm?: L.PM.PMLayer };
    if (!layer?.pm) return;
    layer.pm.disable();
    layer.off('pm:edit', this.handleEdit);
    layer.off('pm:vertexremoved', this.handleEdit);
    layer.off('pm:markerdragend', this.handleEdit);
    this.editCb = null;
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
    this.markers = [];
    this.routeLayers = [];
    this.drawnLayer = null;
    this.createCb = null;
    this.editCb = null;
  }

  invalidateSize(): void {
    this.map?.invalidateSize();
  }
}
