/**
 * Subscriptions API
 * 
 * Functions for subscription-related endpoints
 */

import apiClient from '../apiClient';

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number; // months
}

export interface Subscription {
  id: string;
  studentId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  plan?: Plan;
}

export interface SubscribeRequest {
  planId: string;
}

export interface AccessCheckResponse {
  hasAccess: boolean;
  plan?: Plan;
}

/**
 * Get all subscription plans (public)
 */
export async function getPlans(): Promise<Plan[]> {
  return apiClient.get<Plan[]>('/api/subscriptions/plans');
}

/**
 * Subscribe to a plan (authenticated)
 */
export async function subscribe(data: SubscribeRequest): Promise<Subscription> {
  return apiClient.post<Subscription>('/api/subscriptions/subscribe', data);
}

/**
 * Get user's subscriptions (authenticated)
 */
export async function getUserSubscriptions(): Promise<Subscription[]> {
  return apiClient.get<Subscription[]>('/api/subscriptions/my');
}

/**
 * Check user's access status (authenticated)
 */
export async function checkAccess(): Promise<AccessCheckResponse> {
  return apiClient.get<AccessCheckResponse>('/api/subscriptions/access');
}
