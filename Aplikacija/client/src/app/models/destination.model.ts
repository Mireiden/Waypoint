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
}

export interface DestinationReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string };
  media: { id: number; url: string; type: MediaType }[];
}

export interface Destination extends DestinationSummary {
  media: Media[];
  avgRating: number;
  reviewCount: number;
  reviews: DestinationReview[];
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

export interface UpdateDestinationPayload {
  title?: string;
  description?: string | null;
  categoryId?: number;
}
