/**
 * API客户端核心模块 (client.ts)
 *
 * 概述:
 * - 封装所有HTTP请求逻辑
 * - 处理认证token、请求超时、错误处理等通用逻辑
 * - 支持GET、POST、PUT、PATCH、DELETE请求方法
 *
 * 设计特点:
 * 1. 单例模式：全局共享一个ApiClient实例
 * 2. 自动认证：自动在请求头中添加Bearer Token
 * 3. 统一响应处理：自动提取后端包装的data字段
 * 4. 超时控制：30秒超时，自动取消长时间请求
 * 5. 401处理：自动清除认证信息并跳转到登录页
 *
 * 数据格式约定:
 * - 后端API统一使用camelCase命名
 * - 前端直接使用camelCase，无需转换
 * - 后端响应包装格式：{ success: boolean, data: T, message?: string, error?: object }
 */

import { API_CONFIG } from './config';

// 请求超时时间（毫秒）
// 设置为30秒，避免长时间等待
const TIMEOUT = 30000;

/**
 * 通用API响应接口
 * 后端统一使用此包装格式返回数据
 */
export interface ApiResponse<T> {
  success: boolean;       // 请求是否成功
  data?: T;               // 响应数据（成功时存在）
  message?: string;       // 提示信息
  error?: {               // 错误信息（失败时存在）
    code: string;
    message: string;
  };
}

/**
 * 分页响应接口
 * 用于列表数据的分页查询
 */
export interface PaginatedResponse<T> {
  data: T[];              // 当前页数据
  total: number;          // 总记录数
  page: number;           // 当前页码
  pageSize: number;       // 每页大小
  pages: number;          // 总页数
}

/**
 * API客户端类
 * 提供基础HTTP请求功能
 */
class ApiClient {
  private baseUrl: string;      // API基础URL
  private token: string | null; // 认证令牌

  /**
   * 构造函数
   * @param baseUrl API基础URL
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // 初始化时从localStorage读取保存的token
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * 设置认证令牌
   * 同时保存到localStorage实现持久化
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * 核心请求方法
   * 处理所有HTTP请求的通用逻辑
   *
   * 处理流程:
   * 1. 构建完整URL和请求头
   * 2. 添加Authorization Bearer Token
   * 3. 设置请求超时（30秒）
   * 4. 发送请求并处理响应
   * 5. 处理401未授权（自动跳转登录）
   * 6. 提取响应数据（自动处理包装格式）
   * 7. 错误处理和超时处理
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // 构建完整请求URL
    const url = `${this.baseUrl}${endpoint}`;

    // 构建请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',  // JSON内容类型
      ...options.headers,                  // 合并自定义头
    };

    // 添加认证token到Authorization头
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      // 发送请求
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // 读取响应文本
      const rawText = await response.text();
      // 解析JSON（如果响应体不为空）
      const data = rawText ? JSON.parse(rawText) : null;

      // 处理401未授权：Token过期或无效
      if (response.status === 401) {
        this.setToken(null);  // 清除本地token
        localStorage.removeItem('rd_current_user');
        localStorage.removeItem('auth_token');
        // 跳转到登录页（如果当前不在登录页）
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?unauthorized=true';
        }
        throw new Error('登录已过期，请重新登录');
      }

      // 检查HTTP状态码
      if (!response.ok) {
        const errorData = data || ({});
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}`);
      }

      // 无响应数据时返回null
      if (!data) return null as T;

      // 检查是否是包装的响应格式
      // 后端统一返回 { success, data, message, error } 格式
      if ('success' in data || 'Success' in data) {
        const success = data.success || data.Success;
        const responseData = data.data || data.Data;

        // 如果请求失败，抛出错误
        if (!success || !responseData) {
          throw new Error(data.error?.message || data.message || '请求失败');
        }

        // 返回包装的data部分
        return responseData as T;
      }

      // 如果没有包装格式，直接返回原始数据
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Error [${endpoint}]:`, error);
      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      // 重新抛出错误，由调用方处理
      throw error;
    }
  }

  /**
   * GET请求 - 获取资源
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST请求 - 创建资源
   * 直接发送camelCase格式数据（与后端约定一致）
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT请求 - 完全更新资源
   * 直接发送camelCase格式数据
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH请求 - 部分更新资源
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE请求 - 删除资源
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 导出单例实例（全局共享）
export const apiClient = new ApiClient(API_CONFIG.baseUrl);

// 导出类以便需要创建多个实例时使用
export { ApiClient };
