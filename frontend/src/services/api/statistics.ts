/**
 * 统计服务
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export interface PersonalStats {
  inProgressCount: number;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  categoryDistribution: Array<{ name: string; count: number; percentage: number }>;
  travelStats: { totalDays: number; workHoursInPeriod: number; percentage: number };
  meetingStats: { totalHours: number; workHoursInPeriod: number; percentage: number };
  monthlyTrend: Array<{ month: string; assigned: number; completed: number }>;
}

export interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  byUser: Array<{ userId: string; name: string; taskCount: number; completedCount: number }>;
  byCategory: Array<{ name: string; count: number; percentage: number }>;
  overdueTasks: any[];
  longRunningTasks: any[];
}

export interface WorkloadDistribution {
  byUser: Array<{ userId: string; name: string; workload: number }>;
  byCategory: Array<{ name: string; count: number; percentage: number }>;
  totalWorkload: number;
}

export interface PersonalTasksResponse {
  inProgress: any[];
  pending: any[];
  completed: any[];
}

class StatisticsService {
  /**
   * 获取个人统计
   */
  async getPersonalStats(userId: string, period: string = 'month'): Promise<PersonalStats> {
    return apiClient.get<PersonalStats>(API_ENDPOINTS.statistics.personal(userId) + `&period=${period}`);
  }

  /**
   * 获取个人任务（按状态分类）
   */
  async getPersonalTasks(userId: string, period: string = 'month'): Promise<PersonalTasksResponse> {
    return apiClient.get<PersonalTasksResponse>(API_ENDPOINTS.statistics.personalTasks(userId) + `&period=${period}`);
  }

  /**
   * 获取团队统计
   */
  async getTeamStats(period: string = 'month', officeLocation?: string): Promise<TeamStats> {
    let url = API_ENDPOINTS.statistics.team + `?period=${period}`;
    if (officeLocation) {
      url += `&officeLocation=${officeLocation}`;
    }
    return apiClient.get<TeamStats>(url);
  }

  /**
   * 获取工作量分布
   */
  async getWorkloadDistribution(period: string = 'month'): Promise<WorkloadDistribution> {
    return apiClient.get<WorkloadDistribution>(API_ENDPOINTS.statistics.workload + `?period=${period}`);
  }

  /**
   * 获取月度趋势
   */
  async getMonthlyTrend(userId?: string, months: number = 12): Promise<Array<{ month: string; assigned: number; completed: number }>> {
    let url = API_ENDPOINTS.statistics.monthlyTrend + `?months=${months}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return apiClient.get(url);
  }

  /**
   * 获取拖延任务
   */
  async getDelayedTasks(userId?: string, daysThreshold: number = 60): Promise<{ tasks: any[]; count: number }> {
    let url = API_ENDPOINTS.statistics.delayed + `?daysThreshold=${daysThreshold}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return apiClient.get(url);
  }

  /**
   * 获取逾期任务
   */
  async getOverdueTasks(userId?: string): Promise<{ tasks: any[]; count: number }> {
    let url = API_ENDPOINTS.statistics.overdue;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return apiClient.get(url);
  }

  /**
   * 获取差旅统计
   */
  async getTravelStatistics(userId?: string, period: string = 'month'): Promise<{
    totalDays: number;
    totalTasks: number;
    byCategory: Record<string, number>;
    byProject: Record<string, number>;
    trend: Array<{ month: string; assigned: number; completed: number }>;
  }> {
    let url = API_ENDPOINTS.statistics.travel + `?period=${period}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return apiClient.get(url);
  }

  /**
   * 获取会议统计
   */
  async getMeetingStatistics(userId?: string, period: string = 'month'): Promise<{
    totalHours: number;
    totalTasks: number;
    byCategory: Record<string, number>;
    trend: Array<{ month: string; assigned: number; completed: number }>;
  }> {
    let url = API_ENDPOINTS.statistics.meeting + `?period=${period}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return apiClient.get(url);
  }

  /**
   * 获取工作日信息
   */
  async getWorkDays(year?: number, month?: number): Promise<{
    year: number;
    month: number;
    totalDays: number;
    workDays: number;
    holidays: number[];
    workDateList: string[];
  }> {
    let url = API_ENDPOINTS.statistics.workdays;
    if (year && month) {
      url += `?year=${year}&month=${month}`;
    }
    return apiClient.get(url);
  }
}

export const statisticsService = new StatisticsService();
export { StatisticsService };
