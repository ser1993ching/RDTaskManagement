/**
 * 认证服务
 */
import { apiClient, ApiResponse } from './client';

export interface LoginRequest {
  userId: string;
  password: string;
}

// 登录响应（客户端处理后的格式，camelCase）
export interface LoginResponse {
  user: {
    userId: string;
    name: string;
    systemRole: string;
    officeLocation: string;
    title?: string;
    status: string;
    joinDate?: string;
    education?: string;
    school?: string;
    remark?: string;
  };
  token: string;
}

export interface TokenResponse {
  token: string;
}

export interface User {
  userId: string;
  name: string;
  systemRole: string;
  officeLocation: string;
  title?: string;
  joinDate?: string;
  status: string;
  education?: string;
  school?: string;
  remark?: string;
}

class AuthService {
  private refreshTokenTimeout: number | null = null;

  /**
   * 用户登录
   */
  async login(userId: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      { userId, password }
    );
    console.log('authService.login response:', response);

    // 客户端已提取Data并转换为camelCase，response直接是{ user, token }
    if (response.user && response.token) {
      apiClient.setToken(response.token);
      // 保存用户信息到localStorage
      this.setStoredUser(response.user);
      // 启动Token刷新定时器
      this.startRefreshTokenTimer(response.token);
      return response;
    }

    throw new Error('登录失败');
  }

  /**
   * 用户登出
   */
  logout(): void {
    this.stopRefreshTokenTimer();
    apiClient.setToken(null);
    this.clearAuthData();
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * 获取存储的用户信息
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('rd_current_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * 存储用户信息
   */
  setStoredUser(user: User): void {
    localStorage.setItem('rd_current_user', JSON.stringify(user));
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<TokenResponse>>(
        '/api/auth/refresh-token',
        {}
      );
      if (response.token) {
        apiClient.setToken(response.token);
        this.startRefreshTokenTimer(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token刷新失败:', error);
      this.logout();
      return false;
    }
  }

  /**
   * 启动Token刷新定时器（在过期前5分钟刷新）
   */
  private startRefreshTokenTimer(token: string): void {
    this.stopRefreshTokenTimer();
    const expires = this.getTokenExpiry(token);
    if (!expires) return;

    const timeout = expires - Date.now() - 5 * 60 * 1000; // 过期前5分钟
    if (timeout > 0) {
      console.log(`Token刷新定时器已启动，${Math.round(timeout / 60000)}分钟后刷新`);
      this.refreshTokenTimeout = window.setTimeout(() => {
        this.refreshToken();
      }, timeout);
    } else {
      // Token即将过期，立即刷新
      this.refreshToken();
    }
  }

  /**
   * 停止Token刷新定时器
   */
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  /**
   * 解析Token获取过期时间
   */
  private getTokenExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const decoded = JSON.parse(atob(payload));
      if (decoded.exp) {
        return decoded.exp * 1000; // 转换为毫秒
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 清除所有认证数据
   */
  private clearAuthData(): void {
    localStorage.removeItem('rd_current_user');
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
export { AuthService };
