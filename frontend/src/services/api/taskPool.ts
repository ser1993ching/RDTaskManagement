import { apiClient } from './client';

export interface TaskPoolItemDto {
  id: string;
  taskName: string;
  taskClassId: string;
  category: string;
  projectId?: string;
  projectName?: string;
  personInChargeId?: string;
  personInChargeName?: string;
  checkerId?: string;
  checkerName?: string;
  chiefDesignerId?: string;
  chiefDesignerName?: string;
  approverId?: string;
  approverName?: string;
  startDate?: string;
  dueDate?: string;
  createdBy: string;
  createdByName?: string;
  createdDate: string;
  isForceAssessment?: boolean;
  remark?: string;
  isDeleted?: boolean;
}

export interface CreateTaskPoolItemRequest {
  taskName: string;
  taskClassId: string;
  category?: string;
  projectId?: string;
  personInChargeId?: string;
  personInChargeName?: string;
  checkerId?: string;
  checkerName?: string;
  chiefDesignerId?: string;
  chiefDesignerName?: string;
  approverId?: string;
  approverName?: string;
  startDate?: string;
  dueDate?: string;
  isForceAssessment?: boolean;
  remark?: string;
}

export interface AssignTaskRequest {
  taskName: string;
  taskClassId: string;
  category: string;
  projectId?: string;
  assigneeId?: string;
  assigneeName?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerId2?: string;
  reviewer2Name?: string;
  reviewerWorkload?: number;
  reviewer2Workload?: number;
  startDate?: string;
  dueDate?: string;
  workload?: number;
  isForceAssessment?: boolean;
  remark?: string;
}

export interface TaskPoolQueryParams {
  taskName?: string;
  projectId?: string;
  taskClassId?: string;
  assigneeId?: string;
  page?: number;
  pageSize?: number;
}

export interface TaskPoolListResponse {
  data: TaskPoolItemDto[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

const taskPoolService = {
  // 获取任务库列表
  async getPoolItems(params?: TaskPoolQueryParams): Promise<TaskPoolListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.taskName) queryParams.append('taskName', params.taskName);
    if (params?.projectId) queryParams.append('projectId', params.projectId);
    if (params?.taskClassId) queryParams.append('taskClassId', params.taskClassId);
    if (params?.assigneeId) queryParams.append('assigneeId', params.assigneeId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    const url = `/api/taskpool${query ? `?${query}` : ''}`;

    const response = await apiClient.get<TaskPoolListResponse>(url);
    return response.data;
  },

  // 获取单个任务库项
  async getPoolItem(id: string): Promise<TaskPoolItemDto | null> {
    try {
      const response = await apiClient.get<TaskPoolItemDto>(`/api/taskpool/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // 创建任务库项
  async createPoolItem(data: CreateTaskPoolItemRequest): Promise<TaskPoolItemDto> {
    const response = await apiClient.post<TaskPoolItemDto>('/api/taskpool', data);
    return response.data;
  },

  // 更新任务库项
  async updatePoolItem(id: string, data: CreateTaskPoolItemRequest): Promise<TaskPoolItemDto> {
    const response = await apiClient.put<TaskPoolItemDto>(`/api/taskpool/${id}`, data);
    return response.data;
  },

  // 删除任务库项
  async deletePoolItem(id: string): Promise<void> {
    await apiClient.delete(`/api/taskpool/${id}`);
  },

  // 分配任务
  async assignTask(poolItemId: string, data: AssignTaskRequest): Promise<any> {
    const response = await apiClient.post<any>(`/api/taskpool/${poolItemId}/assign`, data);
    return response.data;
  },

  // 复制任务库项
  async duplicate(poolItemId: string, newTaskName?: string, newDueDate?: string): Promise<TaskPoolItemDto> {
    const params = new URLSearchParams();
    if (newTaskName) params.append('newTaskName', newTaskName);
    if (newDueDate) params.append('newDueDate', newDueDate);

    const query = params.toString();
    const url = `/api/taskpool/${poolItemId}/duplicate${query ? `?${query}` : ''}`;

    const response = await apiClient.post<TaskPoolItemDto>(url, {});
    return response.data;
  },

  // 获取任务库统计
  async getStatistics(): Promise<{
    totalItems: number;
    byTaskClass: Record<string, number>;
    recentlyUsed: number;
  }> {
    const response = await apiClient.get<{
      totalItems: number;
      byTaskClass: Record<string, number>;
      recentlyUsed: number;
    }>('/api/taskpool/statistics');
    return response;
  },

  // 批量分配任务
  async batchAssign(poolItemIds: string[], data: AssignTaskRequest): Promise<any> {
    const response = await apiClient.post<any>('/api/taskpool/batch-assign', {
      poolItemIds,
      taskData: data,
    });
    return response;
  },

  // 从任务回收
  async retrieveFromTask(taskId: string): Promise<TaskPoolItemDto> {
    const response = await apiClient.post<TaskPoolItemDto>(`/api/taskpool/retrieve/${taskId}`, {});
    return response.data;
  },
};

export { taskPoolService };
