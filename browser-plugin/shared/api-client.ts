import {
  ExtractedTaskInfo,
  TaskStage,
  TaskRole,
  RoleStatus,
  STAGE_TO_ROLE
} from './types';

/**
 * API客户端 - 遵循现有后端API
 * 不创建新端点，只调用现有API
 */
export class ApiClient {
  private baseUrl: string;
  private token: string = '';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * 更新任务状态
   * PUT /api/tasks/{taskId}/status
   */
  async updateTaskStatus(taskId: string, status: TaskStage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 更新任务状态失败:', error);
      return false;
    }
  }

  /**
   * 更新角色状态
   * PUT /api/tasks/{taskId}/role-status
   */
  async updateRoleStatus(
    taskId: string,
    role: TaskRole,
    roleStatus: RoleStatus
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/role-status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ role, status: roleStatus })
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 更新角色状态失败:', error);
      return false;
    }
  }

  /**
   * 完成任务所有角色
   * POST /api/tasks/{taskId}/complete-all
   */
  async completeAllRoles(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/complete-all`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 完成任务失败:', error);
      return false;
    }
  }

  /**
   * 获取个人任务列表
   * GET /api/tasks/personal/{userId}
   */
  async getPersonalTasks(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/personal/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('[API] 获取个人任务失败:', error);
      return [];
    }
  }

  /**
   * 获取任务列表
   * GET /api/tasks
   */
  async getTasks(params?: Record<string, string>): Promise<any[]> {
    try {
      let url = `${this.baseUrl}/api/tasks`;
      if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('[API] 获取任务列表失败:', error);
      return [];
    }
  }

  /**
   * 从PLM/TS任务同步到本地任务
   * 根据提取的任务信息调用对应的API
   */
  async syncFromExternal(taskInfo: ExtractedTaskInfo): Promise<{ success: boolean; taskId?: string; message?: string }> {
    try {
      // 根据来源构建外部任务ID
      const externalId = taskInfo.source === 'PLM'
        ? `plm-${taskInfo.taskId}`
        : `ts-${taskInfo.taskId}`;

      // 确定角色和状态
      const role = STAGE_TO_ROLE[taskInfo.currentStage] || 'assignee';
      const roleStatus: RoleStatus = taskInfo.decision === '通过' ? 'Completed' : 'InProgress';

      // 如果是通过，调用更新角色状态API
      if (taskInfo.decision === '通过') {
        const success = await this.updateRoleStatus(externalId, role, roleStatus);
        if (!success) {
          return { success: false, message: '更新角色状态失败' };
        }
      }

      return { success: true, taskId: externalId };
    } catch (error) {
      console.error('[API] 同步失败:', error);
      return { success: false, message: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 健康检查
   * GET /api/tasks
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'HEAD',
        headers: this.getHeaders()
      });
      return response.ok || response.status === 405; // 405 = Method Not Allowed 但服务器可达
    } catch {
      return false;
    }
  }
}

// 导出单例，默认使用localhost:3000
export const apiClient = new ApiClient('http://localhost:3000');
