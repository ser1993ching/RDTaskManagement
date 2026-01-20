/**
 * 任务服务
 */
import { apiClient, ApiResponse, PaginatedResponse } from './client';

export interface Task {
  taskID: string;
  taskName: string;
  taskClassID: string;
  category: string;
  projectID?: string;
  assigneeID?: string;
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
  checkerID?: string;
  checkerName?: string;
  checkerWorkload?: number;
  checkerStatus?: string;
  chiefDesignerID?: string;
  chiefDesignerName?: string;
  chiefDesignerWorkload?: number;
  chiefDesignerStatus?: string;
  approverID?: string;
  approverName?: string;
  approverWorkload?: number;
  approverStatus?: string;
  assigneeStatus?: string;
  isForceAssessment?: boolean;
  isInPool?: boolean;
}

export interface CreateTaskRequest {
  taskName: string;
  taskClassID: string;
  category: string;
  projectID?: string;
  assigneeID?: string;
  assigneeName?: string;
  startDate?: string;
  dueDate?: string;
  workload?: number;
  difficulty?: number;
  remark?: string;
  isForceAssessment?: boolean;
  // 角色分配
  checkerID?: string;
  chiefDesignerID?: string;
  approverID?: string;
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
  taskClassID?: string;
  projectID?: string;
  assigneeID?: string;
  checkerID?: string;
  approverID?: string;
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
    if (params?.taskClassID) searchParams.set('taskClassID', params.taskClassID);
    if (params?.projectID) searchParams.set('projectID', params.projectID);
    if (params?.assigneeID) searchParams.set('assigneeID', params.assigneeID);
    if (params?.checkerID) searchParams.set('checkerID', params.checkerID);
    if (params?.approverID) searchParams.set('approverID', params.approverID);
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
    const response = await apiClient.post<ApiResponse<Task>>('/api/tasks', data);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '创建任务失败');
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.put<ApiResponse<Task>>(`/api/tasks/${taskId}`, data);
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '更新任务失败');
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
    const response = await apiClient.put<ApiResponse<Task>>(`/api/tasks/${taskId}/status`, { status });
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '更新任务状态失败');
  }

  /**
   * 更新角色状态
   */
  async updateRoleStatus(
    taskId: string,
    role: 'assignee' | 'checker' | 'chiefdesigner' | 'approver',
    status: string
  ): Promise<Task> {
    const response = await apiClient.put<ApiResponse<Task>>(
      `/api/tasks/${taskId}/role-status`,
      { role, status }
    );
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '更新角色状态失败');
  }

  /**
   * 完成所有角色
   */
  async completeAllRoles(taskId: string): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(`/api/tasks/${taskId}/complete-all`, {});
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '完成所有角色失败');
  }

  /**
   * 回收任务到任务库
   */
  async retrieveToPool(taskId: string): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(`/api/tasks/${taskId}/retrieve-to-pool`, {});
    if (response.Success && response.Data) {
      return response.Data;
    }
    throw new Error(response.Error?.Message || '回收任务到任务库失败');
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
}

export const taskService = new TaskService();
export { TaskService };
