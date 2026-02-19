/**
 * Progress API
 * 
 * Functions for progress tracking endpoints
 */

import apiClient from '../apiClient';

export interface Progress {
  id: string;
  studentId: string;
  courseId: string;
  percent: number;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      name: string;
    };
  };
}

export interface UpdateProgressRequest {
  courseId: string;
  percent: number;
}

/**
 * Update course progress (authenticated)
 */
export async function updateProgress(data: UpdateProgressRequest): Promise<Progress> {
  return apiClient.post<Progress>('/api/progress', data);
}

/**
 * Get progress for a specific course (authenticated)
 */
export async function getCourseProgress(courseId: string): Promise<Progress | { percent: number }> {
  return apiClient.get<Progress | { percent: number }>(`/api/progress/${courseId}`);
}

/**
 * Get all user progress (authenticated)
 */
export async function getUserProgress(): Promise<Progress[]> {
  return apiClient.get<Progress[]>('/api/progress');
}
