/**
 * API数据服务 - 替代localStorage数据服务
 * 使用后端API获取数据
 */
import { apiClient } from './api/client';
import {
  userService,
  projectService,
  taskService,
  taskClassService,
  statisticsService,
  authService,
  taskPoolService,
} from './api';
import type {
  User as UserDto,
  Project as ProjectDto,
  Task as TaskDto,
  TaskPoolItem as TaskPoolItemDto,
} from './api';

// API可用性状态
let apiAvailable = true;
let lastApiError: string | null = null;

// 设置API可用性
export const setApiAvailable = (available: boolean, error?: string) => {
  apiAvailable = available;
  lastApiError = error || null;
};

// 获取API可用性
export const isApiAvailable = () => apiAvailable;
export const getLastApiError = () => lastApiError;

// 类型转换函数 - 将API返回类型转换为前端类型
const convertUser = (apiUser: UserDto) => ({
  UserID: apiUser.userID,
  Name: apiUser.name,
  SystemRole: apiUser.systemRole as any,
  OfficeLocation: apiUser.officeLocation as any,
  Title: apiUser.title,
  JoinDate: apiUser.joinDate,
  Status: apiUser.status as any,
  Education: apiUser.education,
  School: apiUser.school,
  Remark: apiUser.remark,
});

const convertProject = (apiProject: ProjectDto) => ({
  id: apiProject.id,
  name: apiProject.name,
  category: apiProject.category as any,
  workNo: apiProject.workNo,
  capacity: apiProject.capacity,
  model: apiProject.model,
  isWon: apiProject.isWon,
  isForeign: apiProject.isForeign,
  startDate: apiProject.startDate,
  endDate: apiProject.endDate,
  remark: apiProject.remark,
  isCommissioned: apiProject.isCommissioned,
  isCompleted: apiProject.isCompleted,
  isKeyProject: apiProject.isKeyProject,
  is_deleted: false,
});

const convertTask = (apiTask: TaskDto) => ({
  TaskID: apiTask.taskID,
  TaskName: apiTask.taskName,
  TaskClassID: apiTask.taskClassID,
  Category: apiTask.category,
  ProjectID: apiTask.projectID,
  AssigneeID: apiTask.assigneeID,
  AssigneeName: apiTask.assigneeName,
  StartDate: apiTask.startDate,
  DueDate: apiTask.dueDate,
  CompletedDate: apiTask.completedDate,
  Status: apiTask.status as any,
  Workload: apiTask.workload,
  Difficulty: apiTask.difficulty,
  Remark: apiTask.remark,
  CreatedDate: apiTask.createdDate,
  CreatedBy: apiTask.createdBy,
  TravelLocation: apiTask.travelLocation,
  TravelDuration: apiTask.travelDuration,
  TravelLabel: apiTask.travelLabel,
  MeetingDuration: apiTask.meetingDuration,
  Participants: apiTask.participants,
  ParticipantNames: apiTask.participantNames,
  CapacityLevel: apiTask.capacityLevel,
  CheckerID: apiTask.checkerID,
  CheckerName: apiTask.checkerName,
  CheckerWorkload: apiTask.checkerWorkload,
  checkerStatus: apiTask.checkerStatus as any,
  ChiefDesignerID: apiTask.chiefDesignerID,
  ChiefDesignerName: apiTask.chiefDesignerName,
  ChiefDesignerWorkload: apiTask.chiefDesignerWorkload,
  chiefDesignerStatus: apiTask.chiefDesignerStatus as any,
  ApproverID: apiTask.approverID,
  ApproverName: apiTask.approverName,
  ApproverWorkload: apiTask.approverWorkload,
  approverStatus: apiTask.approverStatus as any,
  assigneeStatus: apiTask.assigneeStatus as any,
  isForceAssessment: apiTask.isForceAssessment,
  is_in_pool: apiTask.isInPool,
  is_deleted: false,
});

// API数据服务
class ApiDataService {
  // 用户相关
  async getUsers(): Promise<UserDto[]> {
    try {
      const result = await userService.getUsers({ pageSize: 1000 });
      setApiAvailable(true);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('获取用户列表失败:', error);
      setApiAvailable(false, `无法连接到后端服务: ${errorMsg}`);
      return [];
    }
  }

  async getUser(userId: string): Promise<UserDto | null> {
    try {
      return await userService.getUser(userId);
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  async saveUser(user: Partial<UserDto>): Promise<UserDto> {
    if ((user as any).UserID) {
      return await userService.updateUser((user as any).UserID, user);
    } else {
      return await userService.createUser(user as any);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await userService.deleteUser(userId);
  }

  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      await authService.resetPassword(userId, newPassword);
      return true;
    } catch (error) {
      console.error('重置密码失败:', error);
      return false;
    }
  }

  async generateTemporaryPassword(): Promise<string> {
    return Math.random().toString(36).slice(-8);
  }

  // 项目相关
  async getProjects(): Promise<ProjectDto[]> {
    try {
      const result = await projectService.getProjects({ pageSize: 1000 });
      setApiAvailable(true);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('获取项目列表失败:', error);
      setApiAvailable(false, `无法连接到后端服务: ${errorMsg}`);
      return [];
    }
  }

  async getProject(projectId: string): Promise<ProjectDto | null> {
    try {
      return await projectService.getProject(projectId);
    } catch (error) {
      console.error('获取项目失败:', error);
      return null;
    }
  }

  async saveProject(project: Partial<ProjectDto>): Promise<ProjectDto> {
    if (project.id) {
      return await projectService.updateProject(project.id, project as any);
    } else {
      return await projectService.createProject(project as any);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    await projectService.deleteProject(projectId);
  }

  // 任务相关
  async getTasks(params?: { taskClassID?: string; assigneeID?: string; projectID?: string }): Promise<TaskDto[]> {
    try {
      const result = await taskService.getTasks({
        taskClassID: params?.taskClassID,
        assigneeID: params?.assigneeID,
        projectID: params?.projectID,
        pageSize: 1000,
      });
      setApiAvailable(true);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('获取任务列表失败:', error);
      setApiAvailable(false, `无法连接到后端服务: ${errorMsg}`);
      return [];
    }
  }

  async getTask(taskId: string): Promise<TaskDto | null> {
    try {
      return await taskService.getTask(taskId);
    } catch (error) {
      console.error('获取任务失败:', error);
      return null;
    }
  }

  async getPersonalTasks(userId: string): Promise<{ inProgress: TaskDto[]; pending: TaskDto[]; completed: TaskDto[] }> {
    try {
      return await taskService.getPersonalTasks(userId);
    } catch (error) {
      console.error('获取个人任务失败:', error);
      return { inProgress: [], pending: [], completed: [] };
    }
  }

  async getTravelTasks(userId: string): Promise<TaskDto[]> {
    try {
      const response = await taskService.getTravelTasks(userId);
      return response.tasks || [];
    } catch (error) {
      console.error('获取差旅任务失败:', error);
      return [];
    }
  }

  async getMeetingTasks(userId: string): Promise<TaskDto[]> {
    try {
      const response = await taskService.getMeetingTasks(userId);
      return response.tasks || [];
    } catch (error) {
      console.error('获取会议任务失败:', error);
      return [];
    }
  }

  async saveTask(task: Partial<TaskDto>): Promise<TaskDto> {
    if (task.taskID) {
      return await taskService.updateTask(task.taskID, task as any);
    } else {
      return await taskService.createTask(task as any);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    await taskService.deleteTask(taskId);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    await taskService.updateTaskStatus(taskId, status);
  }

  // 任务分类
  async getTaskClasses(): Promise<any[]> {
    try {
      return await taskClassService.getTaskClasses();
    } catch (error) {
      console.error('获取任务分类失败:', error);
      return [];
    }
  }

  // 任务库相关
  async getTaskPoolItems(): Promise<TaskPoolItemDto[]> {
    try {
      const result = await taskPoolService.getPoolItems({ pageSize: 1000 });
      setApiAvailable(true);
      return result.data || [];
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('获取任务库列表失败:', error);
      setApiAvailable(false, `无法连接到后端服务: ${errorMsg}`);
      return [];
    }
  }

  async getTaskPoolItem(id: string): Promise<TaskPoolItemDto | null> {
    try {
      return await taskPoolService.getPoolItem(id);
    } catch (error) {
      console.error('获取任务库项失败:', error);
      return null;
    }
  }

  async createTaskPoolItem(data: any): Promise<TaskPoolItemDto> {
    return await taskPoolService.createPoolItem(data);
  }

  async updateTaskPoolItem(id: string, data: any): Promise<TaskPoolItemDto> {
    return await taskPoolService.updatePoolItem(id, data);
  }

  async deleteTaskPoolItem(id: string): Promise<void> {
    await taskPoolService.deletePoolItem(id);
  }

  async assignPoolItemToTask(poolItemId: string, taskData: any): Promise<any> {
    return await taskPoolService.assignTask(poolItemId, taskData);
  }

  // 统计
  async getDashboardStatistics(): Promise<any> {
    try {
      return await statisticsService.getDashboardStats();
    } catch (error) {
      console.error('获取统计失败:', error);
      return null;
    }
  }

  // 设置相关
  // ========== 设备型号管理 ==========
  async getEquipmentModels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/equipment-models');
      // 后端返回 { success: true, data: { models: [...] } }
      return response.data?.models || response.data?.Models || [];
    } catch (error) {
      console.error('获取设备型号失败:', error);
      return [];
    }
  }

  async saveEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/equipment-models', { model });
      return response.data?.success || false;
    } catch (error) {
      console.error('保存设备型号失败:', error);
      return false;
    }
  }

  async deleteEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/equipment-models/${encodeURIComponent(model)}`);
      return response.data?.success || false;
    } catch (error) {
      console.error('删除设备型号失败:', error);
      return false;
    }
  }

  // ========== 容量等级管理 ==========
  async getCapacityLevels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/capacity-levels');
      // 后端返回 { success: true, data: { levels: [...] } }
      return response.data?.levels || response.data?.Levels || [];
    } catch (error) {
      console.error('获取容量等级失败:', error);
      return [];
    }
  }

  async saveCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/capacity-levels', { level });
      return response.data?.success || false;
    } catch (error) {
      console.error('保存容量等级失败:', error);
      return false;
    }
  }

  async deleteCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/capacity-levels/${encodeURIComponent(level)}`);
      return response.data?.success || false;
    } catch (error) {
      console.error('删除容量等级失败:', error);
      return false;
    }
  }

  // ========== 差旅标签管理 ==========
  async getTravelLabels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/travel-labels');
      // 后端返回 { success: true, data: { labels: [...] } }
      return response.data?.labels || response.data?.Labels || [];
    } catch (error) {
      console.error('获取差旅标签失败:', error);
      return [];
    }
  }

  async saveTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/travel-labels', { label });
      return response.data?.success || false;
    } catch (error) {
      console.error('保存差旅标签失败:', error);
      return false;
    }
  }

  async deleteTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/travel-labels/${encodeURIComponent(label)}`);
      return response.data?.success || false;
    } catch (error) {
      console.error('删除差旅标签失败:', error);
      return false;
    }
  }

  // ========== 用户头像管理 ==========
  async getUserAvatar(userId: string): Promise<string | null> {
    try {
      const response = await apiClient.get<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`);
      // 后端返回 { success: true, data: { avatar: "..." } }
      return response.data?.avatar || response.data?.Avatar || null;
    } catch (error) {
      console.error('获取用户头像失败:', error);
      return null;
    }
  }

  async saveUserAvatar(userId: string, avatar: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`, { avatar });
      return response.data?.success || false;
    } catch (error) {
      console.error('保存用户头像失败:', error);
      return false;
    }
  }

  async deleteUserAvatar(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`);
      return response.data?.success || false;
    } catch (error) {
      console.error('删除用户头像失败:', error);
      return false;
    }
  }

  // ========== 任务分类管理 ==========
  async getTaskCategories(): Promise<Record<string, string[]>> {
    try {
      const response = await apiClient.get<any>('/api/settings/task-categories');
      console.log('【调试】task-categories API响应:', response);
      // 后端返回 { success: true, data: { categories: {...} } }
      // apiClient.get 返回解析后的JSON对象
      const result = response.data?.categories || response.data?.Categories || {};
      console.log('【调试】task-categories 返回值:', result);
      return result;
    } catch (error) {
      console.error('获取任务分类失败:', error);
      return {};
    }
  }

  async saveTaskCategories(code: string, categories: string[]): Promise<boolean> {
    try {
      const response = await apiClient.put<any>(`/api/settings/task-categories/${code}`, { categories });
      return response.data?.success || false;
    } catch (error) {
      console.error('保存任务分类失败:', error);
      return false;
    }
  }

  // 健康检查 - 专门用于检测后端是否可用
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/api/health');
      const isHealthy = response.status === 'ok';
      setApiAvailable(isHealthy, isHealthy ? null : '后端服务返回异常状态');
      return isHealthy;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('健康检查失败:', error);
      setApiAvailable(false, `无法连接到后端服务: ${errorMsg}`);
      return false;
    }
  }

  // 认证相关
  async login(userId: string, password: string): Promise<{ user: UserDto; token: string } | null> {
    try {
      const response = await authService.login(userId, password);
      return { user: response.user as UserDto, token: response.token };
    } catch (error) {
      console.error('登录失败:', error);
      return null;
    }
  }

  logout(): void {
    authService.logout();
  }

  getCurrentUser(): UserDto | null {
    return authService.getStoredUser?.() || null;
  }

  isLoggedIn(): boolean {
    return authService.isLoggedIn();
  }
}

export const apiDataService = new ApiDataService();
