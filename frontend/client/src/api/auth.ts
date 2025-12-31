import axios from "axios";
import type { AuthResponse } from "../types/auth.ts";




// DYNAMIC API HOST DETECTION
const getBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:4000/api";

  if (typeof window !== 'undefined' && envBaseUrl.includes("localhost") && !window.location.hostname.includes("localhost")) {
    // If config says localhost, but provided via IP (e.g. mobile testing), swap to that IP
    return envBaseUrl.replace("localhost", window.location.hostname);
  }
  return envBaseUrl;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
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
