/**
 * API客户端配置
 */
import { API_CONFIG } from './config';

const TIMEOUT = 30000; // 30秒超时（从10秒提升）

// 辅助函数：将PascalCase转换为camelCase
function convertToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertToCamelCase);
  }
  if (typeof obj === 'object') {
    const converted: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        .replace(/^[A-Z]/, letter => letter.toLowerCase());
      converted[camelKey] = convertToCamelCase(obj[key]);
    }
    return converted;
  }
  return obj;
}

// 辅助函数：将camelCase转换为PascalCase（用于POST/PUT请求）
function convertToPascalCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(convertToPascalCase);
  }
  if (typeof obj === 'object') {
    const converted: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      converted[pascalKey] = convertToPascalCase(obj[key]);
    }
    return converted;
  }
  return obj;
}

// 辅助函数：处理API响应（提取Data，处理PascalCase）
function processApiResponse(data: any): any {
  if (!data) return data;

  // 如果有Success属性，说明是包装的响应
  if ('Success' in data || 'success' in data) {
    const success = data.Success || data.success;
    const responseData = data.Data || data.data;

    if (!success || !responseData) {
      throw new Error(data.Error?.Message || data.message || '请求失败');
    }

    // 转换Data中的PascalCase为camelCase
    return convertToCamelCase(responseData);
  }

  // 如果没有Success属性，直接转换整个响应（处理PascalCase）
  return convertToCamelCase(data);
}

export interface ApiResponse<T> {
  Success: boolean;
  Data?: T;
  Message?: string;
  Error?: {
    Code: string;
    Message: string;
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
      console.log(`API [${endpoint}] raw response:`, rawText.substring(0, 500));
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
        throw new Error(errorData.Error?.Message || errorData.Message || `HTTP ${response.status}`);
      }

      // 处理响应：提取Data（如果存在）并转换PascalCase为camelCase
      return processApiResponse(data);
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

  // POST请求
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const pascalData = data ? convertToPascalCase(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: pascalData ? JSON.stringify(pascalData) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const pascalData = data ? convertToPascalCase(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: pascalData ? JSON.stringify(pascalData) : undefined,
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
