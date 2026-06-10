export interface MockReview {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

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
