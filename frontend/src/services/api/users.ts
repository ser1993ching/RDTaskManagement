/**
 * 用户服务
 */
import { apiClient, ApiResponse, PaginatedResponse } from './client';

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

export interface CreateUserRequest {
  userId: string;
  name: string;
  systemRole: string;
  officeLocation: string;
  status: string;
  title?: string;
  joinDate?: string;
  education?: string;
  school?: string;
  password?: string;
  remark?: string;
}

export interface UpdateUserRequest {
  name?: string;
  systemRole?: string;
  officeLocation?: string;
  status?: string;
  title?: string;
  joinDate?: string;
  education?: string;
  school?: string;
  remark?: string;
}

export interface UserQueryParams {
  officeLocation?: string;
  status?: string;
  systemRole?: string;
  page?: number;
  pageSize?: number;
}

class UserService {
  /**
   * 获取用户列表
   */
  async getUsers(params?: UserQueryParams): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.officeLocation) searchParams.set('officeLocation', params.officeLocation);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.systemRole) searchParams.set('systemRole', params.systemRole);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    const endpoint = `/api/users${query ? `?${query}` : ''}`;

    const response = await apiClient.get<{data: User[]}>(endpoint);
    return response.data || [];
  }

  /**
   * 获取单个用户
   */
  async getUser(userId: string): Promise<User> {
    return apiClient.get<User>(`/api/users/${userId}`);
  }

  /**
   * 创建用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    // 后端直接返回User对象，未包装为ApiResponse格式
    const user = await apiClient.post<User>('/api/users', data);
    return user;
  }

  /**
   * 更新用户
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    // 后端直接返回User对象，未包装为ApiResponse格式
    const user = await apiClient.put<User>(`/api/users/${userId}`, data);
    return user;
  }

  /**
   * 删除用户（软删除）
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/users/${userId}`);
  }

  /**
   * 恢复用户
   */
  async restoreUser(userId: string): Promise<void> {
    await apiClient.post(`/api/users/${userId}/restore`, {});
  }

  /**
   * 获取团队成员
   */
  async getTeamMembers(currentUserId: string): Promise<User[]> {
    return apiClient.get<User[]>(`/api/users/team/${currentUserId}`);
  }
}

export const userService = new UserService();
export { UserService };
