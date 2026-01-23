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

// 缓存配置
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<any>> = new Map();
const CACHE_DURATION = 30 * 1000; // 30秒缓存

// 设置API可用性
export const setApiAvailable = (available: boolean, error?: string) => {
  apiAvailable = available;
  lastApiError = error || null;
};

// 获取API可用性
export const isApiAvailable = () => apiAvailable;
export const getLastApiError = () => lastApiError;

// 缓存辅助函数
const getCachedData = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// 注意：后端API已统一返回camelCase，无需额外转换

// API数据服务
class ApiDataService {
  // 用户相关
  async getUsers(forceRefresh = false): Promise<UserDto[]> {
    const cacheKey = 'users';
    if (!forceRefresh) {
      const cached = getCachedData<UserDto[]>(cacheKey);
      if (cached) return cached;
    }
    try {
      const result = await userService.getUsers({ pageSize: 200 });
      setApiAvailable(true);
      setCachedData(cacheKey, result);
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
    let result: UserDto;
    if (user.userId) {
      result = await userService.updateUser(user.userId, user);
    } else {
      result = await userService.createUser(user as any);
    }
    clearCache('users'); // 清除用户缓存
    return result;
  }

  async deleteUser(userId: string): Promise<void> {
    await userService.deleteUser(userId);
    clearCache('users'); // 清除用户缓存
  }

  async restoreUser(userId: string): Promise<boolean> {
    try {
      await userService.restoreUser(userId);
      return true;
    } catch (error) {
      console.error('恢复用户失败:', error);
      return false;
    }
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
  async getProjects(forceRefresh = false): Promise<ProjectDto[]> {
    const cacheKey = 'projects';
    if (!forceRefresh) {
      const cached = getCachedData<ProjectDto[]>(cacheKey);
      if (cached) return cached;
    }
    try {
      const result = await projectService.getProjects({ pageSize: 200 });
      setApiAvailable(true);
      setCachedData(cacheKey, result);
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
    let result: ProjectDto;
    if (project.id) {
      result = await projectService.updateProject(project.id, project as any);
    } else {
      result = await projectService.createProject(project as any);
    }
    clearCache('projects'); // 清除项目缓存
    return result;
  }

  async deleteProject(projectId: string): Promise<void> {
    await projectService.deleteProject(projectId);
    clearCache('projects'); // 清除项目缓存
  }

  async getProjectStatistics(): Promise<any> {
    try {
      return await projectService.getStatistics();
    } catch (error) {
      console.error('获取项目统计失败:', error);
      return null;
    }
  }

  async isProjectInUse(projectId: string): Promise<boolean> {
    try {
      const response = await projectService.checkInUse(projectId);
      return response.inUse || false;
    } catch (error) {
      console.error('检查项目使用状态失败:', error);
      return false;
    }
  }

  // 任务相关
  async getTasks(params?: { taskClassId?: string; assigneeId?: string; projectId?: string }, forceRefresh = false): Promise<TaskDto[]> {
    const cacheKey = `tasks_${params?.taskClassId || ''}_${params?.assigneeId || ''}_${params?.projectId || ''}`;
    if (!forceRefresh && !params?.taskClassId && !params?.assigneeId && !params?.projectId) {
      const cached = getCachedData<TaskDto[]>(cacheKey);
      if (cached) return cached;
    }
    try {
      const result = await taskService.getTasks({
        taskClassId: params?.taskClassId,
        assigneeId: params?.assigneeId,
        projectId: params?.projectId,
        pageSize: 300,
      });
      setApiAvailable(true);
      if (!params?.taskClassId && !params?.assigneeId && !params?.projectId) {
        setCachedData(cacheKey, result);
      }
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
    let result: TaskDto;
    if (task.taskId) {
      result = await taskService.updateTask(task.taskId, task as any);
    } else {
      result = await taskService.createTask(task as any);
    }
    clearCache('tasks__'); // 清除任务缓存（不带参数的主缓存）
    return result;
  }

  async deleteTask(taskId: string): Promise<void> {
    await taskService.deleteTask(taskId);
    clearCache('tasks__'); // 清除任务缓存
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    await taskService.updateTaskStatus(taskId, status);
    clearCache('tasks__'); // 清除任务缓存
  }

  async completeAllRoles(taskId: string): Promise<boolean> {
    try {
      await taskService.completeAllRoles(taskId);
      return true;
    } catch (error) {
      console.error('完成所有角色失败:', error);
      return false;
    }
  }

  async retrieveTaskToPool(taskId: string): Promise<boolean> {
    try {
      await taskService.retrieveToPool(taskId);
      return true;
    } catch (error) {
      console.error('回收任务到任务库失败:', error);
      return false;
    }
  }

  async batchOperation(operation: string, taskIds: string[]): Promise<boolean> {
    try {
      await taskService.batchOperation(operation, taskIds);
      clearCache('tasks__'); // 清除任务缓存
      return true;
    } catch (error) {
      console.error('批量操作任务失败:', error);
      return false;
    }
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

  async saveTaskClass(taskClass: any): Promise<any> {
    try {
      if (taskClass.id) {
        return await taskClassService.updateTaskClass(taskClass.id, taskClass);
      } else {
        return await taskClassService.createTaskClass(taskClass);
      }
    } catch (error) {
      console.error('保存任务分类失败:', error);
      throw error;
    }
  }

  async deleteTaskClass(id: string): Promise<boolean> {
    try {
      await taskClassService.deleteTaskClass(id);
      return true;
    } catch (error) {
      console.error('删除任务分类失败:', error);
      return false;
    }
  }

  // 任务库相关
  async getTaskPoolItems(): Promise<TaskPoolItemDto[]> {
    try {
      const result = await taskPoolService.getPoolItems({ pageSize: 200 });
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

  async getTaskPoolStatistics(): Promise<any> {
    try {
      return await taskPoolService.getStatistics();
    } catch (error) {
      console.error('获取任务库统计失败:', error);
      return null;
    }
  }

  async batchAssignPoolItem(poolItemIds: string[], taskData: any): Promise<any> {
    try {
      return await taskPoolService.batchAssign(poolItemIds, taskData);
    } catch (error) {
      console.error('批量分配任务库项失败:', error);
      return null;
    }
  }

  async duplicatePoolItem(poolItemId: string): Promise<any> {
    try {
      return await taskPoolService.duplicate(poolItemId);
    } catch (error) {
      console.error('复制任务库项失败:', error);
      return null;
    }
  }

  async retrieveFromTask(taskId: string): Promise<boolean> {
    try {
      await taskPoolService.retrieveFromTask(taskId);
      return true;
    } catch (error) {
      console.error('从任务回收失败:', error);
      return false;
    }
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

  async getPersonalStats(userId: string, period?: string): Promise<any> {
    try {
      return await statisticsService.getPersonalStats(userId, period);
    } catch (error) {
      console.error('获取个人统计失败:', error);
      return null;
    }
  }

  async getTeamStats(currentUserId: string): Promise<any> {
    try {
      return await statisticsService.getTeamStats(currentUserId);
    } catch (error) {
      console.error('获取团队统计失败:', error);
      return null;
    }
  }

  async getWorkloadDistribution(userId: string): Promise<any> {
    try {
      return await statisticsService.getWorkloadDistribution(userId);
    } catch (error) {
      console.error('获取工作量分布失败:', error);
      return null;
    }
  }

  async getDelayedTasks(userId: string): Promise<any[]> {
    try {
      return await statisticsService.getDelayedTasks(userId);
    } catch (error) {
      console.error('获取拖延任务失败:', error);
      return [];
    }
  }

  async getOverdueTasks(userId: string): Promise<any[]> {
    try {
      return await statisticsService.getOverdueTasks(userId);
    } catch (error) {
      console.error('获取逾期任务失败:', error);
      return [];
    }
  }

  async getTravelStatistics(userId: string): Promise<any> {
    try {
      return await statisticsService.getTravelStatistics(userId);
    } catch (error) {
      console.error('获取差旅统计失败:', error);
      return null;
    }
  }

  async getMeetingStatistics(userId: string): Promise<any> {
    try {
      return await statisticsService.getMeetingStatistics(userId);
    } catch (error) {
      console.error('获取会议统计失败:', error);
      return null;
    }
  }

  async getWorkDays(year: number, month: number): Promise<any> {
    try {
      return await statisticsService.getWorkDays(year, month);
    } catch (error) {
      console.error('获取工作日信息失败:', error);
      return null;
    }
  }

  // 设置相关
  // ========== 设备型号管理 ==========
  async getEquipmentModels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/equipment-models');
      // apiClient.get已提取Data并转为camelCase，返回 { models: [...] }
      return response.models || response.Models || [];
    } catch (error) {
      console.error('获取设备型号失败:', error);
      return [];
    }
  }

  async saveEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/equipment-models', { model });
      // apiClient.post已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('保存设备型号失败:', error);
      return false;
    }
  }

  async deleteEquipmentModel(model: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/equipment-models/${encodeURIComponent(model)}`);
      // apiClient.delete已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('删除设备型号失败:', error);
      return false;
    }
  }

  // ========== 容量等级管理 ==========
  async getCapacityLevels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/capacity-levels');
      // apiClient.get已提取Data并转为camelCase，返回 { levels: [...] }
      return response.levels || response.Levels || [];
    } catch (error) {
      console.error('获取容量等级失败:', error);
      return [];
    }
  }

  async saveCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/capacity-levels', { level });
      // apiClient.post已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('保存容量等级失败:', error);
      return false;
    }
  }

  async deleteCapacityLevel(level: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/capacity-levels/${encodeURIComponent(level)}`);
      // apiClient.delete已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('删除容量等级失败:', error);
      return false;
    }
  }

  // ========== 差旅标签管理 ==========
  async getTravelLabels(): Promise<string[]> {
    try {
      const response = await apiClient.get<any>('/api/settings/travel-labels');
      // apiClient.get已提取Data并转为camelCase，返回 { labels: [...] }
      return response.labels || response.Labels || [];
    } catch (error) {
      console.error('获取差旅标签失败:', error);
      return [];
    }
  }

  async saveTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>('/api/settings/travel-labels', { label });
      // apiClient.post已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('保存差旅标签失败:', error);
      return false;
    }
  }

  async deleteTravelLabel(label: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/travel-labels/${encodeURIComponent(label)}`);
      // apiClient.delete已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('删除差旅标签失败:', error);
      return false;
    }
  }

  // ========== 用户头像管理 ==========
  async getUserAvatar(userId: string): Promise<string | null> {
    try {
      const response = await apiClient.get<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`);
      // apiClient.get已提取Data并转为camelCase，返回 { avatar: "..." }
      return response.avatar || response.Avatar || null;
    } catch (error) {
      console.error('获取用户头像失败:', error);
      return null;
    }
  }

  async saveUserAvatar(userId: string, avatar: string): Promise<boolean> {
    try {
      const response = await apiClient.post<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`, { avatar });
      // apiClient.post已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('保存用户头像失败:', error);
      return false;
    }
  }

  async deleteUserAvatar(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<any>(`/api/settings/avatars/${encodeURIComponent(userId)}`);
      // apiClient.delete已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('删除用户头像失败:', error);
      return false;
    }
  }

  // ========== 任务分类管理 ==========
  async getTaskCategories(): Promise<Record<string, string[]>> {
    try {
      const response = await apiClient.get<any>('/api/settings/task-categories');
      // apiClient.get已提取Data并转为camelCase，返回 { categories: {...} }
      return response.categories || response.Categories || {};
    } catch (error) {
      console.error('获取任务分类失败:', error);
      return {};
    }
  }

  async saveTaskCategories(code: string, categories: string[]): Promise<boolean> {
    try {
      const response = await apiClient.put<any>(`/api/settings/task-categories/${code}`, { categories });
      // apiClient.put已提取Data，返回 { success: true/false }
      return response.success || response.Success || false;
    } catch (error) {
      console.error('保存任务分类失败:', error);
      return false;
    }
  }

  // ========== 个人工作台辅助方法 ==========
  // 获取团队成员（同办公地点的非管理员用户）
  async getTeamMembers(currentUserId: string): Promise<UserDto[]> {
    try {
      const users = await this.getUsers();
      const currentUser = users.find(u => u.userId === currentUserId);
      if (!currentUser) return [];

      const officeLocation = currentUser.officeLocation;
      return users.filter(u =>
        u.userId !== 'admin' &&
        u.userId !== currentUserId &&
        u.officeLocation === officeLocation
      );
    } catch (error) {
      console.error('获取团队成员失败:', error);
      return [];
    }
  }

  // 根据开始日期筛选任务
  filterTasksByStartDate(tasks: TaskDto[], period: string): TaskDto[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'halfYear':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'yearAndHalf':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
    }

    return tasks.filter(task => {
      const taskStartDate = task.startDate;
      if (!taskStartDate) return false;
      const taskDate = new Date(taskStartDate);
      return taskDate >= startDate && taskDate <= now;
    });
  }

  // 按角色状态分离任务
  separateTasksByRoleStatus(tasks: TaskDto[], userId: string): { inProgress: TaskDto[]; pending: TaskDto[]; completed: TaskDto[] } {
    const result = {
      inProgress: [] as TaskDto[],
      pending: [] as TaskDto[],
      completed: [] as TaskDto[],
    };

    const inProgressStatuses = ['IN_PROGRESS', 'REVISING', 'REJECTED'];
    const completedStatuses = ['COMPLETED'];

    for (const task of tasks) {
      // 确定用户在任务中的角色状态
      const taskStatus = task.status || '';
      let roleStatus = '';
      const assigneeId = task.assigneeId;
      const checkerId = task.checkerId;
      const chiefDesignerId = task.chiefDesignerId;
      const approverId = task.approverId;

      if (assigneeId === userId) roleStatus = task.assigneeStatus || '';
      else if (checkerId === userId) roleStatus = task.checkerStatus || '';
      else if (chiefDesignerId === userId) roleStatus = task.chiefDesignerStatus || '';
      else if (approverId === userId) roleStatus = task.approverStatus || '';

      // 综合判断任务状态
      const finalStatus = roleStatus || taskStatus;

      if (completedStatuses.includes(finalStatus)) {
        result.completed.push(task);
      } else if (inProgressStatuses.includes(finalStatus)) {
        result.inProgress.push(task);
      } else {
        // NOT_STARTED 或其他状态都放入 pending
        result.pending.push(task);
      }
    }

    return result;
  }

  // 计算个人统计数据
  calculatePersonalStats(tasks: TaskDto[], period: string, userId: string): any {
    const allTasks = this.getPersonalTasksSync(tasks);
    const periodTasks = this.filterTasksByStartDate(allTasks, period);
    const separated = this.separateTasksByRoleStatus(allTasks, userId);
    const periodSeparated = this.separateTasksByRoleStatus(periodTasks, userId);

    const totalCount = allTasks.length;
    const completedCount = separated.completed.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // 类别分布
    const categoryMap = new Map<string, number>();
    for (const task of allTasks) {
      const category = task.category || '未分类';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    }));

    // 差旅统计
    const travelTasks = allTasks.filter(t => t.taskClassId === 'TC009');
    const totalTravelDays = travelTasks.reduce((sum, t) => sum + (t.travelDuration || 0), 0);
    const travelPercentage = Math.round((totalTravelDays / 22) * 100); // 假设每月22个工作日

    // 会议统计
    const meetingTasks = allTasks.filter(t => t.taskClassId === 'TC007');
    const totalMeetingHours = meetingTasks.reduce((sum, t) => sum + (t.meetingDuration || 0), 0);
    const meetingPercentage = Math.round((totalMeetingHours / 160) * 100); // 假设每月160工作小时

    return {
      totalCount,
      completedCount,
      inProgressCount: separated.inProgress.length,
      pendingCount: separated.pending.length,
      completionRate,
      categoryDistribution,
      travelStats: {
        totalDays: totalTravelDays,
        percentage: Math.min(travelPercentage, 100),
      },
      meetingStats: {
        totalHours: totalMeetingHours,
        percentage: Math.min(meetingPercentage, 100),
      },
      monthlyTrend: [],
    };
  }

  // 同步获取个人任务（内部使用）
  private getPersonalTasksSync(tasks: TaskDto[]): TaskDto[] {
    return tasks;
  }

  // 计算每日趋势
  calculateDailyTrend(tasks: TaskDto[], days: number, userId: string): any[] {
    const now = new Date();
    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = tasks.filter(t => t.startDate === dateStr);
      const separated = this.separateTasksByRoleStatus(dayTasks, userId);

      trend.push({
        month: dateStr,
        assigned: dayTasks.length,
        completed: separated.completed.length,
      });
    }

    return trend;
  }

  // 计算每月趋势
  calculateMonthlyTrend(tasks: TaskDto[], months: number, userId: string): any[] {
    const now = new Date();
    const trend = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const monthTasks = tasks.filter(t => {
        if (!t.startDate) return false;
        const taskDate = new Date(t.startDate);
        return taskDate >= date && taskDate < nextMonth;
      });
      const separated = this.separateTasksByRoleStatus(monthTasks, userId);

      trend.push({
        month: monthStr,
        assigned: monthTasks.length,
        completed: separated.completed.length,
      });
    }

    return trend;
  }

  // 更新任务角色状态
  async updateTaskRoleStatus(taskId: string, role: string, status: string): Promise<boolean> {
    try {
      // 将角色名称转换为后端期望的格式
      const roleMap: Record<string, 'assignee' | 'checker' | 'chiefdesigner' | 'approver'> = {
        'assignee': 'assignee',
        'checker': 'checker',
        'chiefDesigner': 'chiefdesigner',
        'approver': 'approver',
      };
      const apiRole = roleMap[role] || 'assignee';
      await taskService.updateRoleStatus(taskId, apiRole, status);
      return true;
    } catch (error) {
      console.error('更新任务角色状态失败:', error);
      return false;
    }
  }

  // 检查任务类别使用情况
  checkTaskClassUsage(taskClassId: string): { hasTasks: boolean; taskCount: number } {
    // 由于后端没有直接的检查API，返回默认结果
    // 实际使用时应该调用后端API
    return { hasTasks: false, taskCount: 0 };
  }

  // 生成统计CSV
  generateStatsCSV(stats: any, separatedTasks: any, userName: string): string {
    const headers = ['任务名称', '任务类别', '项目', '开始日期', '截止日期', '我的角色', '状态', '工作量'];
    const rows: string[][] = [];

    for (const task of separatedTasks.inProgress) {
      rows.push([
        task.taskName || '',
        task.category || '',
        task.projectName || '',
        task.startDate || '',
        task.dueDate || '',
        '进行中',
        task.status || '',
        String(task.workload || ''),
      ]);
    }

    for (const task of separatedTasks.pending) {
      rows.push([
        task.taskName || '',
        task.category || '',
        task.projectName || '',
        task.startDate || '',
        task.dueDate || '',
        '未开始',
        task.status || '',
        String(task.workload || ''),
      ]);
    }

    for (const task of separatedTasks.completed) {
      rows.push([
        task.taskName || '',
        task.category || '',
        task.projectName || '',
        task.startDate || '',
        task.dueDate || '',
        '已完成',
        task.status || '',
        String(task.workload || ''),
      ]);
    }

    const csvContent = [
      `个人工作统计 - ${userName}`,
      `导出时间：${new Date().toLocaleString()}`,
      '',
      `总任务数：${stats.totalCount}`,
      `已完成：${stats.completedCount}`,
      `进行中：${stats.inProgressCount}`,
      `未开始：${stats.pendingCount}`,
      `完成率：${stats.completionRate}%`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  // 下载CSV
  downloadStatsCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 判断任务是否为长期任务（超过30天）
  isTaskLongRunning(task: any): boolean {
    if (!task.startDate || !task.dueDate) return false;
    const startDate = new Date(task.startDate);
    const dueDate = new Date(task.dueDate);
    const diffDays = Math.ceil((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  }

  // 生成ID
  generateId(prefix: string): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
  }

  // 添加任务分类
  async addTaskCategory(taskClassCode: string, categoryName: string): Promise<boolean> {
    try {
      const categories = await this.getTaskCategories();
      const currentCategories = categories[taskClassCode] || [];
      if (!currentCategories.includes(categoryName)) {
        const newCategories = [...currentCategories, categoryName];
        return await this.saveTaskCategories(taskClassCode, newCategories);
      }
      return true;
    } catch (error) {
      console.error('添加任务分类失败:', error);
      return false;
    }
  }

  // 删除任务分类
  async deleteTaskCategory(taskClassCode: string, categoryName: string): Promise<boolean> {
    try {
      const categories = await this.getTaskCategories();
      const currentCategories = categories[taskClassCode] || [];
      const newCategories = currentCategories.filter(c => c !== categoryName);
      return await this.saveTaskCategories(taskClassCode, newCategories);
    } catch (error) {
      console.error('删除任务分类失败:', error);
      return false;
    }
  }

  // 更新任务分类
  async updateTaskCategory(taskClassCode: string, oldCategoryName: string, newCategoryName: string): Promise<boolean> {
    try {
      const categories = await this.getTaskCategories();
      const currentCategories = categories[taskClassCode] || [];
      const newCategories = currentCategories.map(c => c === oldCategoryName ? newCategoryName : c);
      return await this.saveTaskCategories(taskClassCode, newCategories);
    } catch (error) {
      console.error('更新任务分类失败:', error);
      return false;
    }
  }

  // 重新排序任务分类
  async reorderTaskCategories(taskClassCode: string, newOrder: string[]): Promise<boolean> {
    try {
      return await this.saveTaskCategories(taskClassCode, newOrder);
    } catch (error) {
      console.error('重新排序任务分类失败:', error);
      return false;
    }
  }

  // 修改密码
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await authService.changePassword(userId, currentPassword, newPassword);
      return true;
    } catch (error) {
      console.error('修改密码失败:', error);
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
  async login(userId: string, password: string): Promise<{ user: any; token: string } | null> {
    try {
      const response = await authService.login(userId, password);
      // console.log('apiDataService.login response:', response);
      return response;
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

  // 清除缓存
  clearCache(key?: string): void {
    clearCache(key);
  }

  // 数据变更时刷新缓存
  async refreshData(): Promise<void> {
    clearCache();
    await this.getUsers(true);
    await this.getProjects(true);
    await this.getTasks(undefined, true);
  }
}

export const apiDataService = new ApiDataService();
