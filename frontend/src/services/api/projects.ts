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
  startDate?: string;
  endDate?: string;
  remark?: string;
  isKeyProject?: boolean;
  isWon?: boolean;
  isForeign?: boolean;
  isCommissioned?: boolean;
  isCompleted?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  category?: string;
  workNo?: string;
  capacity?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
  remark?: string;
  isKeyProject?: boolean;
  isWon?: boolean;
  isForeign?: boolean;
  isCommissioned?: boolean;
  isCompleted?: boolean;
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
    // 后端直接返回Project对象，未包装为ApiResponse格式
    const project = await apiClient.post<Project>('/api/projects', data);
    return project;
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    // 后端直接返回Project对象，未包装为ApiResponse格式
    const project = await apiClient.put<Project>(`/api/projects/${projectId}`, data);
    return project;
  }

  /**
   * 删除项目（软删除）
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/api/projects/${projectId}`);
  }

  /**
   * 获取项目统计
   */
  async getStatistics(): Promise<{
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    byCategory: Record<string, number>;
  }> {
    return apiClient.get('/api/projects/statistics');
  }

  /**
   * 检查项目是否在使用中
   */
  async checkInUse(projectId: string): Promise<{ inUse: boolean; taskCount: number }> {
    return apiClient.get(`/api/projects/${projectId}/in-use`);
  }
}

export const projectService = new ProjectService();
export { ProjectService };
