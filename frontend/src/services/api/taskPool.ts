import { apiClient } from './client';

export interface TaskPoolItemDto {
  id: string;
  taskName: string;
  taskClassID: string;
  category: string;
  projectID?: string;
  projectName?: string;
  personInChargeID?: string;
  personInChargeName?: string;
  checkerID?: string;
  checkerName?: string;
  chiefDesignerID?: string;
  chiefDesignerName?: string;
  approverID?: string;
  approverName?: string;
  startDate?: string;
  dueDate?: string;
  createdBy: string;
  createdByName?: string;
  createdDate: string;
  isForceAssessment?: boolean;
  remark?: string;
  is_deleted?: boolean;
}

export interface CreateTaskPoolItemRequest {
  taskName: string;
  taskClassID: string;
  category?: string;
  projectID?: string;
  personInChargeID?: string;
  personInChargeName?: string;
  checkerID?: string;
  checkerName?: string;
  chiefDesignerID?: string;
  chiefDesignerName?: string;
  approverID?: string;
  approverName?: string;
  startDate?: string;
  dueDate?: string;
  isForceAssessment?: boolean;
  remark?: string;
}

export interface AssignTaskRequest {
  taskName: string;
  taskClassID: string;
  category: string;
  projectID?: string;
  assigneeID?: string;
  assigneeName?: string;
  reviewerID?: string;
  reviewerName?: string;
  reviewerID2?: string;
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
  projectID?: string;
  taskClassID?: string;
  assigneeID?: string;
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
    if (params?.projectID) queryParams.append('projectID', params.projectID);
    if (params?.taskClassID) queryParams.append('taskClassID', params.taskClassID);
    if (params?.assigneeID) queryParams.append('assigneeID', params.assigneeID);
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
};

export { taskPoolService };
