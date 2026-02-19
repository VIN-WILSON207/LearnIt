/**
 * Courses API
 * 
 * Functions for interacting with course-related endpoints
 */

import apiClient from '../apiClient';
import { BackendCourse } from '@/types';

export interface CreateCourseRequest {
  title: string;
  description?: string;
  subjectId: string;
  instructorId: string;
  thumbnail?: File;
}

export interface UploadLessonRequest {
  courseId: string;
  title: string;
  content?: string;
  orderNumber: number;
  isFree?: boolean;
  video?: File;
}

/**
 * Get all courses (public)
 */
export async function getAllCourses(): Promise<BackendCourse[]> {
  return apiClient.get<BackendCourse[]>('/api/courses');
}

/**
 * Get course by ID (public)
 */
export async function getCourseById(id: string): Promise<BackendCourse> {
  return apiClient.get<BackendCourse>(`/api/courses/${id}`);
}

/**
 * Get courses by instructor ID (authenticated)
 */
export async function getInstructorCourses(instructorId: string): Promise<BackendCourse[]> {
  return apiClient.get<BackendCourse[]>(`/api/courses/instructor/${instructorId}`);
}

/**
 * Create a new course (authenticated, INSTRUCTOR or ADMIN).
 * If thumbnail is provided, sends FormData and image is stored in Cloudinary.
 */
export async function createCourse(data: CreateCourseRequest): Promise<BackendCourse> {
  if (data.thumbnail) {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('subjectId', data.subjectId);
    formData.append('instructorId', data.instructorId);
    formData.append('thumbnail', data.thumbnail);
    return apiClient.postFormData<BackendCourse>('/api/courses', formData);
  }
  return apiClient.post<BackendCourse>('/api/courses', {
    title: data.title,
    description: data.description,
    subjectId: data.subjectId,
    instructorId: data.instructorId,
  });
}

/**
 * Upload a lesson with optional video file (authenticated, INSTRUCTOR or ADMIN)
 */
export async function uploadLesson(data: UploadLessonRequest): Promise<any> {
  const formData = new FormData();
  formData.append('courseId', data.courseId);
  formData.append('title', data.title);
  if (data.content) {
    formData.append('content', data.content);
  }
  formData.append('orderNumber', data.orderNumber.toString());
  formData.append('isFree', (data.isFree ?? false).toString());

  if (data.video) {
    formData.append('video', data.video);
  }

  return apiClient.postFormData('/api/courses/lesson', formData);
}

/**
 * Publish a course (ADMIN only)
 */
export async function publishCourse(courseId: string): Promise<BackendCourse> {
  return apiClient.patch<BackendCourse>(`/api/courses/${courseId}/publish`, {});
}

/**
 * Unpublish a course (ADMIN only)
 */
export async function unpublishCourse(courseId: string): Promise<BackendCourse> {
  return apiClient.patch<BackendCourse>(`/api/courses/${courseId}/unpublish`, {});
}

/**
 * Update an existing course (authenticated, INSTRUCTOR or ADMIN).
 */
export async function updateCourse(id: string, data: Partial<CreateCourseRequest>): Promise<BackendCourse> {
  if (data.thumbnail) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.subjectId) formData.append('subjectId', data.subjectId);
    formData.append('thumbnail', data.thumbnail);
    return apiClient.patchFormData<BackendCourse>(`/api/courses/${id}`, formData);
  }
  return apiClient.patch<BackendCourse>(`/api/courses/${id}`, data);
}

/**
 * Delete a course (ADMIN only)
 */
export async function deleteCourse(courseId: string): Promise<void> {
  return apiClient.delete(`/api/courses/${courseId}`);
}
