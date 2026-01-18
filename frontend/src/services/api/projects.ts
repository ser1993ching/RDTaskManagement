/**
 * 项目服务
 */
import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Project {
  id: string;
  name: string;
  category: string;
  workNo?: string;
  capacity?: string;
  model?: string;
  isWon?: boolean;
  isForeign?: boolean;
  startDate?: string;
  endDate?: string;
  remark?: string;
  isCommissioned?: boolean;
  isCompleted?: boolean;
  isKeyProject?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  category: string;
  workNo?: string;
  capacity?: string;
  model?: string;
  isWon?: boolean;
  isForeign?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  category?: string;
  workNo?: string;
  capacity?: string;
  model?: string;
  isWon?: boolean;
  isForeign?: boolean;
  startDate?: string;
  endDate?: string;
  remark?: string;
  isCommissioned?: boolean;
  isCompleted?: boolean;
  isKeyProject?: boolean;
}

export interface ProjectQueryParams {
  category?: string;
  page?: number;
  pageSize?: number;
}

class ProjectService {
  /**
   * 获取项目列表
   */
  async getProjects(params?: ProjectQueryParams): Promise<Project[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    const endpoint = `/api/projects${query ? `?${query}` : ''}`;

    const response = await apiClient.get<{data: Project[]}>(endpoint);
    return response.data || [];
  }

  /**
   * 获取单个项目
   */
  async getProject(projectId: string): Promise<Project> {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  }

  /**
   * 创建项目
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/api/projects', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || '创建项目失败');
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put<ApiResponse<Project>>(`/api/projects/${projectId}`, data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || '更新项目失败');
  }

  /**
   * 删除项目（软删除）
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}`);
  }
}

export const projectService = new ProjectService();
export { ProjectService };
