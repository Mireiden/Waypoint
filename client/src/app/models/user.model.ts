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

// What GET /users/:id returns. A normal viewer gets only the public fields;
// an admin viewer additionally gets email and role
export interface PublicProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  email?: string;
  role?: 'user' | 'admin';
}
