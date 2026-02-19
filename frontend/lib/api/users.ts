/**
 * Users API
 *
 * Functions for user management endpoints
 */

import apiClient from '../apiClient';
import { BackendUser } from '@/types';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  levelId?: string;
}

/**
 * Create a new user (ADMIN only)
 */
export async function createUser(data: CreateUserRequest): Promise<BackendUser> {
  return apiClient.post<BackendUser>('/api/users', data);
}

/**
 * Get all users (ADMIN only)
 */
export async function getAllUsers(): Promise<BackendUser[]> {
  return apiClient.get<BackendUser[]>('/api/users');
}

/**
 * Get users by role (ADMIN only)
 * TODO: Create this endpoint in backend
 */
export async function getUsersByRole(role: string): Promise<BackendUser[]> {
  return apiClient.get<BackendUser[]>(`/api/users?role=${role}`);
}

/**
 * Get user by ID
 * TODO: Create this endpoint in backend
 */
export async function getUserById(id: string): Promise<BackendUser> {
  return apiClient.get<BackendUser>(`/api/users/${id}`);
}

/**
 * Update user (ADMIN only)
 * TODO: Create this endpoint in backend
 */
export async function updateUser(id: string, data: Partial<BackendUser>): Promise<BackendUser> {
  return apiClient.put<BackendUser>(`/api/users/${id}`, data);
}

/**
 * Delete user (ADMIN only)
 * TODO: Create this endpoint in backend
 */
export async function deleteUser(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/users/${id}`);
}
