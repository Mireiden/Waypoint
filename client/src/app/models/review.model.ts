import type { DestinationReview } from './destination.model';

export type { DestinationReview } from './destination.model';

// Shape returned by GET /reviews/:id; a review plus the destination it belongs to,
// so callers (for example admins) can navigate to it.
export interface ReviewDetail extends DestinationReview {
  destination: { id: number; title: string } | null;
}

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
