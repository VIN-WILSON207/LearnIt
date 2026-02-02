/**
 * Authentication API
 * 
 * Functions for authentication-related endpoints
 */

import apiClient from '../apiClient';
import { LoginResponse, RegisterResponse } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  levelId?: string;
}

/**
 * Login user
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', data);
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>('/api/auth/register', data);
}
