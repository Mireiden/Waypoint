export { DestinationReview } from './destination.model';

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string };
  destination: { id: number; title: string; city: string | null };
}

export interface ReviewWithCount extends Review {
  _count: { reports: number };
}
