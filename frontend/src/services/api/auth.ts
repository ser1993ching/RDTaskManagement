/**
 * 认证服务
 */
import { apiClient, ApiResponse } from './client';

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    userID: string;
    name: string;
    systemRole: string;
    officeLocation: string;
    title?: string;
    status: string;
  };
  token: string;
}

export interface User {
  userID: string;
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
  /**
   * 用户登录
   */
  async login(userId: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      { UserId: userId, Password: password }
    );

    if (response.success && response.data) {
      apiClient.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.error?.message || '登录失败');
  }

  /**
   * 用户登出
   */
  logout(): void {
    apiClient.setToken(null);
    localStorage.removeItem('rd_current_user');
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
}

export const authService = new AuthService();
export { AuthService };
