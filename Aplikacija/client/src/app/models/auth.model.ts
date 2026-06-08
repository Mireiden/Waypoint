export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
