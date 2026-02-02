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
 * Create a new course (authenticated, INSTRUCTOR or ADMIN)
 */
export async function createCourse(data: CreateCourseRequest): Promise<BackendCourse> {
  return apiClient.post<BackendCourse>('/api/courses', data);
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
