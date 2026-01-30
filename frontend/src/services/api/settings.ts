/**
 * 设置 API 服务
 * 封装系统设置的 CRUD 操作
 */
import { apiClient, ApiClient } from './client';

// DTO 类型定义 (camelCase，与后端保持一致)
export interface EquipmentModelsResponse {
  models: string[];
}

export interface CapacityLevelsResponse {
  levels: string[];
}

export interface TravelLabelsResponse {
  labels: string[];
}

export interface UserAvatarResponse {
  userId: string;
  avatar: string | null;
}

export interface TaskCategoriesResponse {
  categories: Record<string, string[]>;
}

export interface SettingsApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AddEquipmentModelRequest {
  model: string;
}

export interface AddCapacityLevelRequest {
  level: string;
}

export interface AddTravelLabelRequest {
  label: string;
}

export interface SaveUserAvatarRequest {
  avatar: string;
}

export interface UpdateTaskCategoriesRequest {
  categories: string[];
}

// 设置服务类
export class SettingsService {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client || apiClient;
  }

  // ========== 设备型号管理 ==========

  /**
   * 获取设备型号列表
   */
  async getEquipmentModels(): Promise<string[]> {
    try {
      const response = await this.client.get<any>('/api/settings/equipment-models');
      return response.data?.models || response.models || [];
    } catch (error) {
      console.error('获取设备型号失败:', error);
      return [];
    }
  }

  /**
   * 添加设备型号
   */
  async addEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>(
        '/api/settings/equipment-models',
        { model }
      );
      return response.success || false;
    } catch (error) {
      console.error('添加设备型号失败:', error);
      return false;
    }
  }

  /**
   * 删除设备型号
   */
  async deleteEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await this.client.delete<SettingsApiResponse>(
        `/api/settings/equipment-models/${encodeURIComponent(model)}`
      );
      return response.success || false;
    } catch (error) {
      console.error('删除设备型号失败:', error);
      return false;
    }
  }

  // ========== 容量等级管理 ==========

  /**
   * 获取容量等级列表
   */
  async getCapacityLevels(): Promise<string[]> {
    try {
      const response = await this.client.get<any>('/api/settings/capacity-levels');
      return response.data?.levels || response.levels || [];
    } catch (error) {
      console.error('获取容量等级失败:', error);
      return [];
    }
  }

  /**
   * 添加容量等级
   */
  async addCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>(
        '/api/settings/capacity-levels',
        { level }
      );
      return response.success || false;
    } catch (error) {
      console.error('添加容量等级失败:', error);
      return false;
    }
  }

  /**
   * 删除容量等级
   */
  async deleteCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await this.client.delete<SettingsApiResponse>(
        `/api/settings/capacity-levels/${encodeURIComponent(level)}`
      );
      return response.success || false;
    } catch (error) {
      console.error('删除容量等级失败:', error);
      return false;
    }
  }

  // ========== 差旅标签管理 ==========

  /**
   * 获取差旅标签列表
   */
  async getTravelLabels(): Promise<string[]> {
    try {
      const response = await this.client.get<any>('/api/settings/travel-labels');
      return response.data?.labels || response.labels || [];
    } catch (error) {
      console.error('获取差旅标签失败:', error);
      return [];
    }
  }

  /**
   * 添加差旅标签
   */
  async addTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>(
        '/api/settings/travel-labels',
        { label }
      );
      return response.success || false;
    } catch (error) {
      console.error('添加差旅标签失败:', error);
      return false;
    }
  }

  /**
   * 删除差旅标签
   */
  async deleteTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await this.client.delete<SettingsApiResponse>(
        `/api/settings/travel-labels/${encodeURIComponent(label)}`
      );
      return response.success || false;
    } catch (error) {
      console.error('删除差旅标签失败:', error);
      return false;
    }
  }

  // ========== 用户头像管理 ==========

  /**
   * 获取用户头像
   */
  async getUserAvatar(userId: string): Promise<string | null> {
    try {
      const response = await this.client.get<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`);
      return response.data?.avatar || response.avatar || null;
    } catch (error) {
      console.error('获取用户头像失败:', error);
      return null;
    }
  }

  /**
   * 保存用户头像
   */
  async saveUserAvatar(userId: string, avatar: string): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>(
        `/api/settings/avatars/${encodeURIComponent(userId)}`,
        { avatar }
      );
      return response.success || false;
    } catch (error) {
      console.error('保存用户头像失败:', error);
      return false;
    }
  }

  /**
   * 删除用户头像
   */
  async deleteUserAvatar(userId: string): Promise<boolean> {
    try {
      const response = await this.client.delete<SettingsApiResponse>(
        `/api/settings/avatars/${encodeURIComponent(userId)}`
      );
      return response.success || false;
    } catch (error) {
      console.error('删除用户头像失败:', error);
      return false;
    }
  }

  // ========== 任务分类管理 ==========

  /**
   * 获取任务分类
   */
  async getTaskCategories(): Promise<Record<string, string[]>> {
    try {
      const response = await this.client.get<any>('/api/settings/task-categories');
      return response.data?.categories || response.categories || {};
    } catch (error) {
      console.error('获取任务分类失败:', error);
      return {};
    }
  }

  /**
   * 更新任务分类
   */
  async updateTaskCategories(code: string, categories: string[]): Promise<boolean> {
    try {
      const response = await this.client.put<SettingsApiResponse>(
        `/api/settings/task-categories/${code}`,
        { categories }
      );
      return response.success || false;
    } catch (error) {
      console.error('更新任务分类失败:', error);
      return false;
    }
  }

  // ========== 数据管理 ==========

  /**
   * 重置所有数据
   */
  async resetAllData(): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>('/api/settings/reset-all-data');
      return response.success || false;
    } catch (error) {
      console.error('重置数据失败:', error);
      return false;
    }
  }

  /**
   * 刷新任务
   */
  async refreshTasks(): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>('/api/settings/refresh-tasks');
      return response.success || false;
    } catch (error) {
      console.error('刷新任务失败:', error);
      return false;
    }
  }

  /**
   * 迁移数据
   */
  async migrateData(): Promise<boolean> {
    try {
      const response = await this.client.post<SettingsApiResponse>('/api/settings/migrate');
      return response.success || false;
    } catch (error) {
      console.error('数据迁移失败:', error);
      return false;
    }
  }
}

// 导出单例
export const settingsService = new SettingsService();
