/**
 * API Client Utility
 * 
 * Centralized API client for making requests to the backend Express server.
 * Handles:
 * - JWT token management
 * - Role normalization (INSTRUCTOR → instructor)
 * - Automatic token injection
 * - Error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Normalize role from backend format to frontend format
 * - INSTRUCTOR → instructor (lowercase)
 * - Converts to lowercase
 */
export function normalizeRole(role: string): 'student' | 'instructor' | 'admin' {
  const normalized = role.toLowerCase();
  if (normalized === 'student' || normalized === 'instructor' || normalized === 'admin') {
    return normalized as 'student' | 'instructor' | 'admin';
  }
  // Fallback: return as-is if unknown
  return normalized as 'student' | 'instructor' | 'admin';
}

/**
 * Token Management
 */
export const tokenManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  hasToken(): boolean {
    return this.getToken() !== null;
  },
};

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: any;
  if (isJson) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { error: text } : {};
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || `HTTP ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * API Client
 */
const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'GET',
        headers,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'DELETE',
        headers,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenManager.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: 'POST',
        headers,
        body: formData,
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  },
};

export default apiClient;
