export interface Report {
  id: number;
  reason: 'spam' | 'inappropriate' | 'inaccurate' | 'duplicate' | 'other';
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  user: { id: number; name: string; email: string };
  destination: { id: number; title: string; type: string; city: string | null } | null;
  review: { id: number; comment: string | null; rating: number } | null;
}
