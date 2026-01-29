/**
 * Analytics API
 * 
 * Functions for analytics endpoints
 * Note: These endpoints need to be created in the backend
 */

import apiClient from '../apiClient';
import { PlatformAnalytics } from '@/types';

/**
 * Get platform analytics (ADMIN only)
 * TODO: Create this endpoint in backend
 */
export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  return apiClient.get<PlatformAnalytics>('/api/analytics');
}
