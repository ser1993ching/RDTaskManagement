/**
 * 任务分类服务
 */
import { apiClient } from './client';

export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  notice?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaskClassWithCategories extends TaskClass {
  categories: string[];
}

export interface TaskClassesResponse {
  taskClasses: TaskClass[];
  categories: Record<string, string[]>;
}

class TaskClassService {
  /**
   * 获取任务分类列表
   */
  async getTaskClasses(includeDeleted?: boolean): Promise<TaskClass[]> {
    const params = includeDeleted ? '?includeDeleted=true' : '';
    // 后端返回 { taskClasses: [...], categories: {...} }
    const response = await apiClient.get<any>(`/api/taskclasses${params}`);
    // 提取 taskClasses 数组
    return response.taskClasses || response.data?.taskClasses || [];
  }

  /**
   * 获取任务分类（包含子类别）
   */
  async getTaskClassesWithCategories(): Promise<TaskClassesResponse> {
    // 后端返回 { taskClasses: [...], categories: {...} }
    const response = await apiClient.get<any>('/api/taskclasses/with-categories');
    return {
      taskClasses: response.taskClasses || response.data?.taskClasses || [],
      categories: response.categories || response.data?.categories || {}
    };
  }

  /**
   * 获取单个任务分类
   */
  async getTaskClass(taskClassId: string): Promise<TaskClass> {
    return apiClient.get<TaskClass>(`/api/taskclasses/${taskClassId}`);
  }

  /**
   * 创建任务分类
   */
  async createTaskClass(data: Partial<TaskClass>): Promise<TaskClass> {
    return apiClient.post<TaskClass>('/api/taskclasses', data);
  }

  /**
   * 更新任务分类
   */
  async updateTaskClass(taskClassId: string, data: Partial<TaskClass>): Promise<TaskClass> {
    return apiClient.put<TaskClass>(`/api/taskclasses/${taskClassId}`, data);
  }

  /**
   * 删除任务分类（软删除）
   */
  async deleteTaskClass(taskClassId: string): Promise<void> {
    await apiClient.delete(`/api/taskclasses/${taskClassId}`);
  }
}

export const taskClassService = new TaskClassService();
export { TaskClassService };
