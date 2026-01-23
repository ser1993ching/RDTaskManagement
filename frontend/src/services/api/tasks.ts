/**
 * 任务服务
 */
import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Task {
  taskId: string;
  taskName: string;
  taskClassId: string;
  category: string;
  projectId?: string;
  assigneeId?: string;
  assigneeName?: string;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  status: string;
  workload?: number;
  difficulty?: number;
  remark?: string;
  createdDate: string;
  createdBy: string;
  // 差旅任务字段
  travelLocation?: string;
  travelDuration?: number;
  travelLabel?: string;
  // 会议任务字段
  meetingDuration?: number;
  participants?: string[];
  participantNames?: string[];
  // 市场任务字段
  capacityLevel?: string;
  // 角色字段
  checkerId?: string;
  checkerName?: string;
  checkerWorkload?: number;
  checkerStatus?: string;
  chiefDesignerId?: string;
  chiefDesignerName?: string;
  chiefDesignerWorkload?: number;
  chiefDesignerStatus?: string;
  approverId?: string;
  approverName?: string;
  approverWorkload?: number;
  approverStatus?: string;
  assigneeStatus?: string;
  isForceAssessment?: boolean;
  isInPool?: boolean;
}

export interface CreateTaskRequest {
  taskName: string;
  taskClassId: string;
  category: string;
  projectId?: string;
  assigneeId?: string;
  assigneeName?: string;
  startDate?: string;
  dueDate?: string;
  workload?: number;
  difficulty?: number;
  remark?: string;
  isForceAssessment?: boolean;
  // 角色分配
  checkerId?: string;
  chiefDesignerId?: string;
  approverId?: string;
  // 差旅任务
  travelLocation?: string;
  travelDuration?: number;
  travelLabel?: string;
  // 会议任务
  meetingDuration?: number;
  participants?: string[];
  // 市场任务
  capacityLevel?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: string;
}

export interface TaskQueryParams {
  status?: string;
  taskClassId?: string;
  projectId?: string;
  assigneeId?: string;
  checkerId?: string;
  approverId?: string;
  page?: number;
  pageSize?: number;
}

export interface PersonalTasksResponse {
  inProgress: Task[];
  pending: Task[];
  completed: Task[];
}

export interface TravelTasksResponse {
  tasks: Task[];
  totalDays: number;
}

export interface MeetingTasksResponse {
  tasks: Task[];
  totalHours: number;
}

class TaskService {
  /**
   * 获取任务列表
   */
  async getTasks(params?: TaskQueryParams): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.taskClassId) searchParams.set('taskClassId', params.taskClassId);
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
    if (params?.checkerId) searchParams.set('checkerId', params.checkerId);
    if (params?.approverId) searchParams.set('approverId', params.approverId);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());

    const query = searchParams.toString();
    const endpoint = `/api/tasks${query ? `?${query}` : ''}`;

    const response = await apiClient.get<{data: Task[]}>(endpoint);
    return response.data || [];
  }

  /**
   * 获取单个任务
   */
  async getTask(taskId: string): Promise<Task> {
    return apiClient.get<Task>(`/api/tasks/${taskId}`);
  }

  /**
   * 创建任务
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<any>('/api/tasks', data);
    // 后端直接返回TaskDto或包装格式ApiResponse<Task>
    if (response.success !== undefined && response.data) {
      // 包装格式
      return response.data;
    } else if (response.taskId) {
      // 直接返回TaskDto格式
      return response;
    }
    throw new Error(response.error?.message || response.message || '创建任务失败');
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<any>(`/api/tasks/${taskId}`, data);
    // 后端直接返回TaskDto或包装格式ApiResponse<Task>
    if (response.success !== undefined && response.data) {
      // 包装格式
      return response.data;
    } else if (response.taskId) {
      // 直接返回TaskDto格式
      return response;
    }
    throw new Error(response.error?.message || response.message || '更新任务失败');
  }

  /**
   * 删除任务（软删除）
   */
  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${taskId}`);
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    const response = await apiClient.put<any>(`/api/tasks/${taskId}/status`, { status });
    if (response.success !== undefined && response.data) {
      return response.data;
    } else if (response.taskId) {
      return response;
    }
    throw new Error(response.error?.message || response.message || '更新任务状态失败');
  }

  /**
   * 更新角色状态
   */
  async updateRoleStatus(
    taskId: string,
    role: 'assignee' | 'checker' | 'chiefdesigner' | 'approver',
    status: string
  ): Promise<Task> {
    const response = await apiClient.put<any>(
      `/api/tasks/${taskId}/role-status`,
      { role, status }
    );
    if (response.success !== undefined && response.data) {
      return response.data;
    } else if (response.taskId) {
      return response;
    }
    throw new Error(response.error?.message || response.message || '更新角色状态失败');
  }

  /**
   * 完成所有角色
   */
  async completeAllRoles(taskId: string): Promise<Task> {
    const response = await apiClient.post<any>(`/api/tasks/${taskId}/complete-all`, {});
    if (response.success !== undefined && response.data) {
      return response.data;
    } else if (response.taskId) {
      return response;
    }
    throw new Error(response.error?.message || response.message || '完成所有角色失败');
  }

  /**
   * 回收任务到任务库
   */
  async retrieveToPool(taskId: string): Promise<Task> {
    const response = await apiClient.post<any>(`/api/tasks/${taskId}/retrieve`, {});
    if (response.success !== undefined && response.data) {
      return response.data;
    } else if (response.taskId) {
      return response;
    }
    throw new Error(response.error?.message || response.message || '回收任务到任务库失败');
  }

  /**
   * 批量操作任务
   */
  async batchOperation(operation: string, taskIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/api/tasks/batch', { operation, taskIds });
  }

  /**
   * 获取个人任务
   */
  async getPersonalTasks(userId: string): Promise<PersonalTasksResponse> {
    return apiClient.get<PersonalTasksResponse>(`/api/tasks/personal/${userId}`);
  }

  /**
   * 获取差旅任务
   */
  async getTravelTasks(userId: string, period?: string): Promise<TravelTasksResponse> {
    const params = period ? `?period=${period}` : '';
    return apiClient.get<TravelTasksResponse>(`/api/tasks/travel/${userId}${params}`);
  }

  /**
   * 获取会议任务
   */
  async getMeetingTasks(userId: string, period?: string): Promise<MeetingTasksResponse> {
    const params = period ? `?period=${period}` : '';
    return apiClient.get<MeetingTasksResponse>(`/api/tasks/meeting/${userId}${params}`);
  }

  /**
   * 检查任务是否为长期任务
   */
  async checkIsLongRunning(taskId: string): Promise<boolean> {
    const response = await apiClient.get<{ isLongRunning: boolean }>(`/api/tasks/${taskId}/is-long-running`);
    return response.isLongRunning || false;
  }
}

export const taskService = new TaskService();
export { TaskService };
