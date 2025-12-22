export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

export interface SignupResponse {
  message: string;
}

export interface AuthError {
  message: string;
}
