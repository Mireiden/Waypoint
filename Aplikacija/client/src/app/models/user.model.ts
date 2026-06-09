export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}
