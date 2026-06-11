import { MockReview } from './review.model';

export interface Destination {
  id: number;
  title: string;
  type: 'point' | 'route';
  category: string;
  categoryIcon: string;
  categoryColor: string;
  rating: number;
  reviewCount: number;
  description: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  duration?: string;
  distance?: string;
  waypoints?: { title: string; lat: number; lng: number }[];
  reviews: MockReview[];
}

export interface AdminDestination {
  id: number;
  title: string;
  type: 'point' | 'route';
  city: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
  category: { id: number; name: string } | null;
  _count: { reviews: number; reports: number };
}
