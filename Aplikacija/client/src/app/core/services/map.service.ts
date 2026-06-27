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

  // create mode
  private drawnLayer: L.Layer | null = null;
  private createCb: ((geometry: DestinationGeometry) => void) | null = null;
  private editCb: ((geometry: DestinationGeometry) => void) | null = null;

  // checks if existing destinations react to clicks; disabled if in draw mode
  private overlaysInteractive = true;

  // created for the purpose of having a more natural feel when going into "edit" mode because the preview lines otherwise disappears
  private previewLine: L.Polyline | null = null;

  private readonly handleEdit = (): void => {
    if (!this.drawnLayer) return;
    const feature = (this.drawnLayer as L.Polyline | L.Marker).toGeoJSON();
    this.editCb?.(feature.geometry as DestinationGeometry);
  };

  // While editing a route, a click on empty map extends the polyline with a new vertex at its end.
  // Clicks on Geoman's handles or the line itself are left to edit mode (move / insert / delete).
  private readonly handleMapAppend = (e: L.LeafletMouseEvent): void => {
    if (!(this.drawnLayer instanceof L.Polyline)) return;
    const target = e.originalEvent.target as HTMLElement | null;
    if (target?.closest('.leaflet-marker-icon') || target?.closest('.leaflet-interactive')) return;

    const layer = this.drawnLayer as L.Polyline & { pm: L.PM.PMLayer };
    const latlngs = layer.getLatLngs() as L.LatLng[];
    layer.setLatLngs([...latlngs, e.latlng]);
    // Refresh Geoman's edit handles so the new vertex becomes draggable.
    layer.pm.disable();
    layer.pm.enable({ removeVertexOn: 'click' });
    layer.on('pm:edit', this.handleEdit);
    layer.on('pm:vertexremoved', this.handleEdit);
    layer.on('pm:markerdragend', this.handleEdit);
    this.editCb?.(layer.toGeoJSON().geometry as DestinationGeometry);
  };

  // Track the cursor while editing a route and redraw the preview segment from the line's last vertex to it.
  private readonly handlePreviewMove = (e: L.LeafletMouseEvent): void => {
    if (!(this.drawnLayer instanceof L.Polyline) || !this.map) return;
    const latlngs = this.drawnLayer.getLatLngs() as L.LatLng[];
    if (latlngs.length === 0) return;
    const last = latlngs[latlngs.length - 1];
    const pts: L.LatLngTuple[] = [
      [last.lat, last.lng],
      [e.latlng.lat, e.latlng.lng],
    ];
    if (this.previewLine) {
      this.previewLine.setLatLngs(pts);
    } else {
      this.previewLine = L.polyline(pts, {
        color: ROUTE_COLOR,
        weight: 3,
        opacity: 0.6,
        dashArray: '6 8',
        interactive: false,
        pmIgnore: true,
      }).addTo(this.map);
    }
  };

  private clearPreviewLine(): void {
    this.previewLine?.remove();
    this.previewLine = null;
  }

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
      const marker = L.marker([item.lat, item.lng], { interactive: this.overlaysInteractive })
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

  // Draw route destinations as polylines. `latlngs` are [lat, lng] pairs (Leaflet order).
  setRoutes(
    items: { id: number; latlngs: L.LatLngTuple[]; title: string }[],
    onClick: (id: number) => void,
  ): void {
    this.clearRoutes();
    items.forEach((item) => {
      const line = L.polyline(item.latlngs, {
        color: ROUTE_COLOR,
        weight: 4,
        opacity: 0.85,
        interactive: this.overlaysInteractive,
      })
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

  // Enable Geoman drawing for a point (marker) or route (polyline).
  enableCreate(type: 'point' | 'route', onCreated: (geometry: DestinationGeometry) => void): void {
    if (!this.map) return;
    this.clearDrawn();
    this.setOverlaysInteractive(false);
    this.createCb = onCreated;
    this.map.pm.enableDraw(type === 'point' ? 'Marker' : 'Line', {
      continueDrawing: false,
      snappable: true,
    });
  }

  // Stop drawing and discard the in-progress shape (used on cancel)
  disableCreate(): void {
    if (!this.map) return;
    this.map.pm.disableDraw();
    this.clearDrawn();
    this.setOverlaysInteractive(true);
    this.createCb = null;
  }

  // Toggles the clickable state for destinations so that there are no accidental clicks on adjacent destinations
  // while creating a new destination. This was done because of a bug that pulls the user inside of the destination detail
  // tab and then the route could not be finished.
  setOverlaysInteractive(interactive: boolean): void {
    this.overlaysInteractive = interactive;
    const pe = interactive ? '' : 'none';
    [...this.markers, ...this.routeLayers].forEach((layer) => {
      const el = (layer as { getElement?: () => HTMLElement | SVGElement | null }).getElement?.();
      if (el) (el as HTMLElement).style.pointerEvents = pe;
    });
  }

  clearDrawn(): void {
    if (this.drawnLayer) {
      this.drawnLayer.remove();
      this.drawnLayer = null;
    }
  }

  // Closes the loop by appending the first vertex to the last one (only applicable if there are more than 2 points in the polyline)
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
    // Routes can also be extended: clicking empty map appends a vertex. Borrow
    // Geoman's own draw cursor (crosshair) so it reads as "click to keep drawing".
    // The vertex/middle handles are restored to a grab/grabbing cursor via a global
    // rule in styles.scss (`.geoman-draw-cursor .marker-icon`), since Geoman's
    // crosshair rule would otherwise cover them too.
    if (layer instanceof L.Polyline) {
      this.map?.on('click', this.handleMapAppend);
      this.map?.on('mousemove', this.handlePreviewMove);
      this.map?.getContainer().classList.add('geoman-draw-cursor');
    }
  }

  disableEditDrawn(): void {
    this.map?.off('click', this.handleMapAppend);
    this.map?.off('mousemove', this.handlePreviewMove);
    this.clearPreviewLine();
    this.map?.getContainer().classList.remove('geoman-draw-cursor');
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

  /** Frame a route's full extent, leaving padding for the side panel. */
  fitRoute(latlngs: L.LatLngTuple[]): void {
    if (!this.map || latlngs.length === 0) return;
    this.map.flyToBounds(L.latLngBounds(latlngs), {
      padding: [60, 60],
      maxZoom: 16,
      duration: 1.2,
    });
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
    this.overlaysInteractive = true;
    this.previewLine = null;
  }

  invalidateSize(): void {
    this.map?.invalidateSize();
  }
}
