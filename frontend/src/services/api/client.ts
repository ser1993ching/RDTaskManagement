/**
 * API客户端配置
 * 注意：后端API统一使用camelCase命名，此客户端直接使用camelCase，无需转换
 */
import { API_CONFIG } from './config';

const TIMEOUT = 30000; // 30秒超时

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // 从localStorage读取token
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 添加认证token
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Log raw response for debugging
      const rawText = await response.text();
      // console.log(`API [${endpoint}] raw response:`, rawText.substring(0, 500));
      const data = rawText ? JSON.parse(rawText) : null;

      // 处理401未授权
      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('rd_current_user');
        localStorage.removeItem('auth_token');
        // 跳转到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?unauthorized=true';
        }
        throw new Error('登录已过期，请重新登录');
      }

      if (!response.ok) {
        const errorData = data || ({});
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}`);
      }

      // 处理响应：提取Data（如果存在）
      // 后端已返回camelCase，无需转换
      if (!data) return null as T;

      // 检查是否是包装的响应格式
      if ('success' in data || 'Success' in data) {
        const success = data.success || data.Success;
        const responseData = data.data || data.Data;

        if (!success || !responseData) {
          throw new Error(data.error?.message || data.message || '请求失败');
        }

        return responseData as T;
      }

      // 如果没有包装格式，直接返回
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Error [${endpoint}]:`, error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求 - 直接发送camelCase数据
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求 - 直接发送camelCase数据
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH请求
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 导出单例实例
export const apiClient = new ApiClient(API_CONFIG.baseUrl);

// 导出类以便自定义使用
export { ApiClient };
