export type DestinationType = 'point' | 'route';
export type MediaType = 'image' | 'video';

export interface DestinationCategory {
  id: number;
  name: string;
  icon: string | null;
}

export interface Media {
  id: number;
  url: string;
  type: MediaType;
  position: number;
}

export interface PointGeometry {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export type DestinationGeometry = PointGeometry | LineStringGeometry;

export interface DestinationSummary {
  id: number;
  title: string;
  description: string | null;
  type: DestinationType;
  city: string | null;
  country: string | null;
  geometry: DestinationGeometry;
  category: DestinationCategory | null;
  avgRating: number;
  reviewCount: number;
}

export interface DestinationReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string };
  media: { id: number; url: string; type: MediaType }[];
}

// A point destination linked to a route (route_points junction).
export interface RoutePoint {
  id: number;
  title: string;
  description: string | null;
  geometry: PointGeometry;
}

export interface Destination extends DestinationSummary {
  media: Media[];
  reviews: DestinationReview[];
  // Present for routes; empty for points. Ordered point destinations along the route.
  points: RoutePoint[];
}

// A user's own destination as listed on their profile (no geometry — list only).
export interface UserDestination {
  id: number;
  title: string;
  description: string | null;
  type: DestinationType;
  city: string | null;
  country: string | null;
  createdAt: string;
  category: DestinationCategory | null;
  media: Media[];
  _count: { reviews: number };
}

export interface AdminDestination {
  id: number;
  title: string;
  type: DestinationType;
  city: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
  category: { id: number; name: string } | null;
  _count: { reviews: number; reports: number };
}

export interface CreatePointPayload {
  type: 'point';
  title: string;
  description?: string;
  categoryId: number;
  geometry: PointGeometry;
}

export interface CreateRoutePayload {
  type: 'route';
  title: string;
  description?: string;
  categoryId: number;
  geometry: LineStringGeometry;
}

export type CreateDestinationPayload = CreatePointPayload | CreateRoutePayload;

export type DestinationSort = 'recent' | 'rating' | 'popular';

export interface DestinationQueryParams {
  type?: DestinationType;
  category?: number;
  q?: string;
  bbox?: string; // "minLng,minLat,maxLng,maxLat"
  sort?: DestinationSort;
  limit?: number;
}

export interface UpdateDestinationPayload {
  title?: string;
  description?: string | null;
  categoryId?: number;
}
