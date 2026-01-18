/**
 * 统计服务
 */
import { apiClient } from './client';

export interface StatisticsResponse {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  totalWorkload: number;
  completedWorkload: number;
  tasksByCategory: Record<string, number>;
  tasksByStatus: Record<string, number>;
  recentTasks: Array<{
    taskID: string;
    taskName: string;
    status: string;
    assigneeName: string;
    dueDate: string;
  }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  workloadDistribution: Array<{
    name: string;
    value: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
}

class StatisticsService {
  /**
   * 获取任务统计
   */
  async getStatistics(userId?: string, startDate?: string, endDate?: string): Promise<StatisticsResponse> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const query = params.toString();
    return apiClient.get<StatisticsResponse>(`/api/statistics${query ? `?${query}` : ''}`);
  }

  /**
   * 获取仪表盘统计
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/api/statistics/dashboard');
  }

  /**
   * 获取用户工作量统计
   */
  async getUserWorkload(userId: string): Promise<{
    userId: string;
    totalTasks: number;
    completedTasks: number;
    totalWorkload: number;
    averageDifficulty: number;
  }> {
    return apiClient.get(`/api/statistics/user/${userId}`);
  }
}

export const statisticsService = new StatisticsService();
export { StatisticsService };
