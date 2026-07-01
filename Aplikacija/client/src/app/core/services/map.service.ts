import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';

import type { DestinationGeometry } from '../../models/destination.model';

const DEFAULT_CENTER: L.LatLngTuple = [43.3217, 21.8959];
const DEFAULT_ZOOM = 13;
const ROUTE_COLOR = '#2e7d52';
// Orange casing drawn under the green route line for contrast against the map.
const ROUTE_OUTLINE = '#e8911a';

// Point destinations: an orange teardrop marker with a green core. A divIcon
// (CSS, no image) so it always renders — the default Leaflet marker image 404s
// in the build and shows up as an empty square, including during Geoman drawing.
// The icon anchors at the tip of the teardrop (bottom), not its center.
const waypointIcon = L.divIcon({
  className: 'waypoint-icon',
  html: '<span class="waypoint-pin"><span class="waypoint-core"></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 28],
  popupAnchor: [0, -28],
});

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

const userLocationIcon = L.divIcon({
  className: 'user-location-icon',
  html: '<span class="user-location-pulse"></span><span class="user-location-dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

@Injectable({ providedIn: 'root' })
export class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private routeLayers: L.Polyline[] = [];

  // The user's own position: a marker plus an accuracy circle, and the last
  // known coordinates so the "locate" button can recenter without re-querying.
  private userMarker: L.Marker | null = null;
  private userAccuracy: L.Circle | null = null;
  private userLocation: L.LatLng | null = null;

  // create mode
  private drawnLayer: L.Layer | null = null;
  private createCb: ((geometry: DestinationGeometry) => void) | null = null;
  private editCb: ((geometry: DestinationGeometry) => void) | null = null;

  // checks if existing destinations react to clicks; disabled if in draw mode
  private overlaysInteractive = true;

  // created for the purpose of having a more natural feel when going into "edit" mode because the preview lines otherwise disappears
  private previewLine: L.Polyline | null = null;

  // Edit mode
  private readonly handleEdit = (): void => {
    if (!this.drawnLayer) return;
    const feature = (this.drawnLayer as L.Polyline | L.Marker).toGeoJSON();
    this.editCb?.(feature.geometry as DestinationGeometry);
  };

  // While editing a route, clicking on an empty space on the map extends the current route (polyline) and adds the new vertex at the end
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

    // pm:create is called whenever a user finishes drawing a destination; disables drawing after finishing
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
      const marker = L.marker([item.lat, item.lng], {
        icon: waypointIcon,
        interactive: this.overlaysInteractive,
      })
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
      const casing = L.polyline(item.latlngs, {
        color: ROUTE_OUTLINE,
        weight: 4.5,
        opacity: 0.9,
        interactive: false,
      });
      casing.addTo(this.map!);
      this.routeLayers.push(casing);

      const line = L.polyline(item.latlngs, {
        color: ROUTE_COLOR,
        weight: 3,
        opacity: 0.95,
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
      markerStyle: { icon: waypointIcon },
    });
  }

  // Stop drawing and discard what is in progress (on cancel)
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
   * Enable Geoman edit mode on the drawn shape; drag vertices, add via middle
   * handles, and tap a vertex to delete it (removeVertexOn: 'click' so it works
   * on touch, where there is no right click). `onChange` is called after each edit.
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
    // Routes can be extended in the edit mode; extending a route is the same as drawing one
    // We are using Geoman's crosshair cursor for drawing and moving vertices now activates the
    // grabbing hand cursor for better user experience (otherwise, the crosshair would have been used for everything)
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

  // Place (or move) the marker showing the user's current position, along with a
  // translucent circle for the reading's accuracy. Coordinates are remembered so
  // flyToUser() can recenter when the location button is clicked.
  setUserLocation(lat: number, lng: number, accuracy = 0): void {
    this.userLocation = L.latLng(lat, lng);
    if (!this.map) return;

    if (this.userMarker) {
      this.userMarker.setLatLng(this.userLocation);
    } else {
      this.userMarker = L.marker(this.userLocation, {
        icon: userLocationIcon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
        pmIgnore: true,
      }).addTo(this.map);
    }

    if (accuracy > 0) {
      if (this.userAccuracy) {
        this.userAccuracy.setLatLng(this.userLocation).setRadius(accuracy);
      } else {
        this.userAccuracy = L.circle(this.userLocation, {
          radius: accuracy,
          color: '#1a73e8',
          weight: 1,
          opacity: 0.4,
          fillColor: '#1a73e8',
          fillOpacity: 0.1,
          interactive: false,
          pmIgnore: true,
        }).addTo(this.map);
      }
    }
  }

  hasUserLocation(): boolean {
    return this.userLocation !== null;
  }

  //Recenter on the user's last known position
  flyToUser(zoom = 16): void {
    if (this.userLocation) this.map?.flyTo(this.userLocation, zoom, { duration: 1.2 });
  }

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

  getZoom(): number | null {
    return this.map?.getZoom() ?? null;
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
    this.userMarker = null;
    this.userAccuracy = null;
    this.userLocation = null;
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
