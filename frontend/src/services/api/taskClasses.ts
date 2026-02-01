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
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 分类标签数据结构
 */
export interface CategoryLabels {
  taskClassCode: string;   // 任务类别代码（如 TC009）
  categoryName: string;    // 分类名称（如 "市场配合出差"）
  labels: string[];        // 标签列表
}

export interface CategoryLabelsResponse {
  labels: string[];
}

export interface UpdateCategoryLabelsRequest {
  labels: string[];
}

class TaskClassService {
  /**
   * 获取分类标签
   */
  async getCategoryLabels(taskClassCode: string, categoryName: string): Promise<string[]> {
    const encodedCategory = encodeURIComponent(categoryName);
    const response = await apiClient.get<any>(`/api/settings/category-labels/${taskClassCode}/${encodedCategory}`);
    return response.labels || [];
  }

  /**
   * 更新分类标签
   */
  async updateCategoryLabels(taskClassCode: string, categoryName: string, labels: string[]): Promise<boolean> {
    const encodedCategory = encodeURIComponent(categoryName);
    const response = await apiClient.put<any>(`/api/settings/category-labels/${taskClassCode}/${encodedCategory}`, { labels });
    return response.success || false;
  }

  /**
   * 添加分类标签
   */
  async addCategoryLabel(taskClassCode: string, categoryName: string, label: string): Promise<boolean> {
    const encodedCategory = encodeURIComponent(categoryName);
    const response = await apiClient.post<any>(`/api/settings/category-labels/${taskClassCode}/${encodedCategory}`, { label });
    return response.success || false;
  }

  /**
   * 删除分类标签
   */
  async deleteCategoryLabel(taskClassCode: string, categoryName: string, label: string): Promise<boolean> {
    const encodedCategory = encodeURIComponent(categoryName);
    const encodedLabel = encodeURIComponent(label);
    const response = await apiClient.delete<any>(`/api/settings/category-labels/${taskClassCode}/${encodedCategory}/${encodedLabel}`);
    return response.success || false;
  }

  /**
   * 获取任务分类列表
   */
  async getTaskClasses(includeDeleted?: boolean): Promise<TaskClass[]> {
    const params = includeDeleted ? '?includeDeleted=true' : '';
    // 后端返回 { TaskClasses: [...], Categories: {...} }
    // apiClient.get已提取Data并转换为camelCase: { taskClasses: [...], categories: {...} }
    const response = await apiClient.get<any>(`/api/TaskClasses${params}`);
    // 提取 taskClasses 数组
    return response.taskClasses || [];
  }

  /**
   * 获取任务分类（包含子类别）
   */
  async getTaskClassesWithCategories(): Promise<TaskClassesResponse> {
    // 后端返回 { TaskClasses: [...], Categories: {...} }
    // apiClient.get已提取Data并转换为camelCase: { taskClasses: [...], categories: {...} }
    // 注意：categories的key是PascalCase (Market, Execution) 转为 camelCase (market, execution)
    const response = await apiClient.get<any>('/api/TaskClasses');
    return {
      taskClasses: response.taskClasses || [],
      categories: response.categories || {}
    };
  }

  /**
   * 获取单个任务分类
   * 统一使用 /api/TaskClasses（PascalCase，与后端路由一致）
   */
  async getTaskClass(taskClassId: string): Promise<TaskClass> {
    return apiClient.get<TaskClass>(`/api/TaskClasses/${taskClassId}`);
  }

  /**
   * 创建任务分类
   */
  async createTaskClass(data: Partial<TaskClass>): Promise<TaskClass> {
    return apiClient.post<TaskClass>('/api/TaskClasses', data);
  }

  /**
   * 更新任务分类
   */
  async updateTaskClass(taskClassId: string, data: Partial<TaskClass>): Promise<TaskClass> {
    return apiClient.put<TaskClass>(`/api/TaskClasses/${taskClassId}`, data);
  }

  /**
   * 删除任务分类（软删除）
   */
  async deleteTaskClass(taskClassId: string): Promise<void> {
    await apiClient.delete(`/api/TaskClasses/${taskClassId}`);
  }
}

export const taskClassService = new TaskClassService();
export { TaskClassService };
