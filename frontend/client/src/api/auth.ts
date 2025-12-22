import axios from "axios";
import type { AuthResponse } from "../types/auth.ts";




const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: false,
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
