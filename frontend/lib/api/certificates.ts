/**
 * Certificates API
 * 
 * Functions for certificate-related endpoints
 */

import apiClient from '../apiClient';

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  issueDate: string;
  fileUrl: string;
  course?: {
    id: string;
    title: string;
  };
}

/**
 * Get user's certificates (authenticated)
 */
export async function getCertificates(): Promise<Certificate[]> {
  return apiClient.get<Certificate[]>('/api/certificates');
}

/**
 * Generate certificate for a course (authenticated)
 */
export async function generateCertificate(courseId: string): Promise<Certificate> {
  return apiClient.post<Certificate>('/api/certificates/generate', { courseId });
}
