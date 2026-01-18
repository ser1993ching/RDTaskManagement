/**
 * API服务模块导出
 */

// 基础客户端
export { apiClient, ApiClient } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

// 认证服务
export { authService, AuthService } from './auth';
export type { LoginRequest, LoginResponse, User } from './auth';

// 用户服务
export { userService, UserService } from './users';
export type { User as UserDto, CreateUserRequest, UpdateUserRequest, UserQueryParams } from './users';

// 项目服务
export { projectService, ProjectService } from './projects';
export type { Project as ProjectDto, CreateProjectRequest, UpdateProjectRequest, ProjectQueryParams } from './projects';

// 任务服务
export { taskService, TaskService } from './tasks';
export type {
  Task as TaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskQueryParams,
  PersonalTasksResponse,
  TravelTasksResponse,
  MeetingTasksResponse
} from './tasks';

// 任务分类服务
export { taskClassService, TaskClassService } from './taskClasses';
export type { TaskClass, TaskClassWithCategories, TaskClassesResponse } from './taskClasses';

// 统计服务
export { statisticsService, StatisticsService } from './statistics';
export type { StatisticsResponse, DashboardStats } from './statistics';

// 任务库服务
export { taskPoolService } from './taskPool';
export type {
  TaskPoolItem as TaskPoolItemDto,
  CreateTaskPoolItemRequest,
  AssignTaskRequest,
  TaskPoolQueryParams,
  TaskPoolListResponse
} from './taskPool';

// API配置
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  timeout: 10000,
};
