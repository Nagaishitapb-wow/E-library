import axios from "axios";
import type { AuthResponse } from "../types/auth.ts";




export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://e-library-jtx2.onrender.com/api",
  withCredentials: true,
});

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/signup", data);
  return res.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<any> {
  const res = await api.get("/auth/me");
  return res.data;
}
