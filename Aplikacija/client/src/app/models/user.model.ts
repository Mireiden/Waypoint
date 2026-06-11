export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserWithCount extends User {
  _count: { destinations: number; reviews: number; reports: number };
}
