/**
 * Users API
 * 
 * Functions for user management endpoints
 * Note: These endpoints need to be created in the backend
 */

import apiClient from '../apiClient';
import { BackendUser } from '@/types';

/**
 * Get all users (ADMIN only)
 * TODO: Create this endpoint in backend
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
