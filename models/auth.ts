export interface User {
  id: string;
  name: string;
  email: string;
  code: string;
  description: string;
  teams?: any[];
  createdAgents?: any[];
  createdAt?: string;
  updatedAt?: string;
  permission: "owner" | "maintainer" | "developer" | "guest";
}

export interface RegisterData {
  name: string;
  email: string;
  code: string;
  password: string;
  description?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
}
