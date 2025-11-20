/**
 * API client with automatic authentication error handling
 * Redirects to login page on 401/403 responses
 */

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL = '';

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers = new Headers(options.headers);

    // Set content type if not set
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for authentication
        headers,
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear any stored tokens and redirect to login
        this.handleAuthError();
        return {
          error:
            response.status === 401
              ? 'Authentication required'
              : 'Access denied',
          status: response.status,
        };
      }

      let data: T | undefined;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        return {
          error: (data as any)?.error || `HTTP ${response.status}`,
          status: response.status,
          data,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error',
        status: 0,
      };
    }
  }

  async get<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private handleAuthError(): void {
    if (typeof window !== 'undefined') {
      // Redirect to login page (cookies will be cleared by server if needed)
      window.location.href = '/login';
    }
  }
}

export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient.get<T>(endpoint, options),
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.post<T>(endpoint, data, options),
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.put<T>(endpoint, data, options),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient.delete<T>(endpoint, options),
};
