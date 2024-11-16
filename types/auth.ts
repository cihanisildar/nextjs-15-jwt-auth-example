// types/auth.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tokenVersion: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface DecodedAuthToken {
  id: string;
  iat?: number;
  exp?: number;
}

export interface DecodedRefreshToken {
  id: string;
  version: number;
}
