/**
 * Enrollments API
 * 
 * Functions for enrollment-related endpoints
 */

import apiClient from '../apiClient';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  course?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      name: string;
    };
    instructor?: {
      name: string;
    };
  };
}

export interface CreateEnrollmentRequest {
  courseId: string;
}

/**
 * Get all enrollments (authenticated)
 */
export async function getEnrollments(): Promise<Enrollment[]> {
  return apiClient.get<Enrollment[]>('/api/enrollments');
}

/**
 * Get enrollments for a specific student (authenticated)
 */
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  return apiClient.get<Enrollment[]>(`/api/enrollments?studentId=${studentId}`);
}

/**
 * Enroll in a course (authenticated, STUDENT)
 */
export async function enrollInCourse(data: CreateEnrollmentRequest): Promise<Enrollment> {
  return apiClient.post<Enrollment>('/api/enrollments', data);
}
