# 系统权限控制 API 文档

## 概述

本文档描述R&D任务管理系统的权限控制体系，用于指导后端API实现用户身份验证和权限授权。

---

## 角色定义

### 1.1 角色枚举

| 角色值 | 中文名称 | 角色级别 | 描述 |
|--------|----------|----------|------|
| ADMIN | 管理员 | 3（最高） | 系统管理员，拥有所有权限 |
| LEADER | 班组长 | 2 | 团队管理者，可管理团队成员和大部分设置 |
| MEMBER | 组员 | 1（最低） | 普通团队成员，仅能操作自己的任务 |

### 1.2 角色层级关系

```
ADMIN (管理员)
│
├── 完整的系统管理权限
├── 所有数据查看权限
├── 用户管理权限（创建、编辑、删除）
├── 设置管理权限
└── 数据重置权限
│
LEADER (班组长)
│
├── 团队管理权限（查看、编辑团队成员）
├── 项目管理权限（创建、编辑、删除项目）
├── 任务库管理权限（创建、编辑、分配计划任务）
├── 大部分设置权限
├── 团队数据查看权限
└── 团队工作量统计权限
│
MEMBER (组员)
│
├── 个人任务管理权限（创建、编辑自己的任务）
├── 个人统计查看权限
├── 基本查看权限（项目、任务）
└── 个人资料管理权限
```

---

## 权限对照表

### 2.1 菜单访问权限

| 菜单项 | ADMIN | LEADER | MEMBER | 说明 |
|--------|-------|--------|--------|------|
| 工作台（Dashboard） | ✅ | ✅ | ❌ | 班组长和管理员专属 |
| 个人工作台 | ✅ | ✅ | ✅ | 所有角色可见 |
| 任务管理 | ✅ | ✅ | ✅ | 所有角色可见 |
| 任务库 | ✅ | ✅ | ❌ | 仅管理员和班组长 |
| 项目管理 | ✅ | ✅ | ✅ | 所有角色可见 |
| 人员管理 | ✅ | ✅ | ✅ | 所有角色可见（但功能受限） |
| 设置 | ✅ | ✅ | ✅ | 所有角色可见（但功能受限） |

### 2.2 API访问权限矩阵

#### 认证模块 (01-authentication.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/auth/login | POST | ✅ | ✅ | ✅ | 登录（公开） |
| /api/auth/logout | POST | ✅ | ✅ | ✅ | 登出（需认证） |
| /api/auth/me | GET | ✅ | ✅ | ✅ | 获取当前用户 |
| /api/auth/password | PUT | ✅ | ✅ | ✅ | 修改密码（仅自己） |
| /api/auth/reset-password | PUT | ✅ | ❌ | ❌ | 重置他人密码（仅管理员） |

#### 用户管理模块 (02-users.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/users | GET | ✅ | ✅ | ❌ | 查看用户列表（组员只能看自己） |
| /api/users/:userId | GET | ✅ | ✅ | ❌ | 查看用户详情 |
| /api/users | POST | ✅ | ✅ | ❌ | 创建用户 |
| /api/users/:userId | PUT | ✅ | ✅ | ❌ | 更新用户 |
| /api/users/:userId | DELETE | ✅ | ✅ | ❌ | 删除用户（软删除） |
| /api/users/:userId/restore | POST | ✅ | ❌ | ❌ | 恢复用户 |
| /api/users/team-members | GET | ✅ | ✅ | ❌ | 获取团队成员（排除自己） |

#### 项目管理模块 (03-projects.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/projects | GET | ✅ | ✅ | ✅ | 查看项目列表 |
| /api/projects/:id | GET | ✅ | ✅ | ✅ | 查看项目详情 |
| /api/projects | POST | ✅ | ✅ | ❌ | 创建项目 |
| /api/projects/:id | PUT | ✅ | ✅ | ❌ | 更新项目 |
| /api/projects/:id | DELETE | ✅ | ✅ | ❌ | 删除项目（软删除） |
| /api/projects/:id/usage | GET | ✅ | ✅ | ❌ | 检查项目使用情况 |
| /api/projects/statistics | GET | ✅ | ✅ | ✅ | 获取项目统计 |

#### 任务管理模块 (04-tasks.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/tasks | GET | ✅ | ✅ | ✅ | 查看任务列表 |
| /api/tasks/:taskId | GET | ✅ | ✅ | ✅ | 查看任务详情 |
| /api/tasks | POST | ✅ | ✅ | ✅ | 创建任务 |
| /api/tasks/:taskId | PUT | ✅ | ✅ | ✅ | 更新任务 |
| /api/tasks/:taskId | DELETE | ✅ | ✅ | ❌ | 删除任务（软删除） |
| /api/tasks/:taskId/role-status | PATCH | ✅ | ✅ | ✅ | 更新角色状态 |
| /api/tasks/batch | POST | ✅ | ✅ | ❌ | 批量操作 |
| /api/tasks/personal | GET | ✅ | ✅ | ✅ | 获取个人任务 |
| /api/tasks/travel | GET | ✅ | ✅ | ✅ | 获取差旅任务 |
| /api/tasks/meeting | GET | ✅ | ✅ | ✅ | 获取会议任务 |
| /api/tasks/long-running | GET | ✅ | ✅ | ✅ | 获取长期任务 |
| /api/tasks/delayed | GET | ✅ | ✅ | ✅ | 获取拖延任务 |

#### 任务类别模块 (05-task-classes.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/task-classes | GET | ✅ | ✅ | ✅ | 获取任务类别列表 |
| /api/task-classes/:id | GET | ✅ | ✅ | ✅ | 获取任务类别详情 |
| /api/task-classes | POST | ✅ | ✅ | ❌ | 创建任务类别 |
| /api/task-classes/:id | PUT | ✅ | ✅ | ❌ | 更新任务类别 |
| /api/task-classes/:id | DELETE | ✅ | ✅ | ❌ | 删除任务类别 |
| /api/task-classes/:id/usage | GET | ✅ | ✅ | ❌ | 检查使用情况 |
| /api/task-classes/:code/categories | GET | ✅ | ✅ | ✅ | 获取二级分类 |
| /api/task-classes/:code/categories | POST | ✅ | ✅ | ❌ | 添加二级分类 |
| /api/task-classes/:code/categories/:name | PUT | ✅ | ✅ | ❌ | 更新二级分类 |
| /api/task-classes/:code/categories/:name | DELETE | ✅ | ✅ | ❌ | 删除二级分类 |
| /api/task-classes/:code/categories/reorder | PUT | ✅ | ✅ | ❌ | 重新排序 |
| /api/task-classes/:code/categories | PUT | ✅ | ✅ | ❌ | 更新全部二级分类 |

#### 任务库模块 (06-task-pool.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/task-pool | GET | ✅ | ✅ | ❌ | 获取任务库列表 |
| /api/task-pool/:id | GET | ✅ | ✅ | ❌ | 获取任务库详情 |
| /api/task-pool | POST | ✅ | ✅ | ❌ | 创建计划任务 |
| /api/task-pool/:id | PUT | ✅ | ✅ | ❌ | 更新计划任务 |
| /api/task-pool/:id | DELETE | ✅ | ✅ | ❌ | 删除计划任务（软删除） |
| /api/task-pool/:id/assign | POST | ✅ | ✅ | ❌ | 分配任务给成员 |
| /api/task-pool/batch-assign | POST | ✅ | ✅ | ❌ | 批量分配任务 |
| /api/task-pool/:id/retrieve | POST | ✅ | ✅ | ❌ | 回收任务到任务库 |
| /api/task-pool/statistics | GET | ✅ | ✅ | ❌ | 任务库统计 |
| /api/task-pool/my-pool | GET | ✅ | ✅ | ❌ | 获取我的任务库 |

#### 统计模块 (07-statistics.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/statistics/personal | GET | ✅ | ✅ | ✅ | 个人统计（自己） |
| /api/statistics/personal/:userId | GET | ✅ | ✅ | ❌ | 个人统计（他人，仅管理员/班组长） |
| /api/statistics/team | GET | ✅ | ✅ | ❌ | 团队统计 |
| /api/statistics/workload | GET | ✅ | ✅ | ❌ | 工作量分布 |
| /api/statistics/trend | GET | ✅ | ✅ | ✅ | 任务趋势 |
| /api/statistics/travel | GET | ✅ | ✅ | ✅ | 差旅统计 |
| /api/statistics/meeting | GET | ✅ | ✅ | ✅ | 会议统计 |
| /api/statistics/overdue | GET | ✅ | ✅ | ✅ | 逾期任务 |
| /api/statistics/long-running | GET | ✅ | ✅ | ✅ | 长期任务 |
| /api/statistics/export | POST | ✅ | ✅ | ✅ | 导出统计 |
| /api/statistics/work-days | GET | ✅ | ✅ | ✅ | 工作日信息 |
| /api/statistics/team-members | GET | ✅ | ✅ | ❌ | 团队成员工作量 |

#### 系统设置模块 (08-settings.md)

| API端点 | 方法 | ADMIN | LEADER | MEMBER | 说明 |
|---------|------|-------|--------|--------|------|
| /api/settings/equipment-models | GET | ✅ | ✅ | ✅ | 获取机型列表 |
| /api/settings/equipment-models | POST | ✅ | ✅ | ❌ | 添加机型 |
| /api/settings/equipment-models | DELETE | ✅ | ✅ | ❌ | 删除机型 |
| /api/settings/capacity-levels | GET | ✅ | ✅ | ✅ | 获取容量等级 |
| /api/settings/capacity-levels | POST | ✅ | ✅ | ❌ | 添加容量等级 |
| /api/settings/capacity-levels | DELETE | ✅ | ✅ | ❌ | 删除容量等级 |
| /api/settings/travel-labels | GET | ✅ | ✅ | ✅ | 获取差旅标签 |
| /api/settings/travel-labels | POST | ✅ | ✅ | ❌ | 添加差旅标签 |
| /api/settings/travel-labels | DELETE | ✅ | ✅ | ❌ | 删除差旅标签 |
| /api/settings/avatars/:userId | GET | ✅ | ✅ | ✅ | 获取用户头像 |
| /api/settings/avatars/:userId | POST | ✅ | ✅ | ✅ | 上传用户头像（仅自己） |
| /api/settings/avatars/:userId | DELETE | ✅ | ✅ | ✅ | 删除用户头像（仅自己） |
| /api/settings/system | GET | ✅ | ✅ | ✅ | 获取系统配置 |
| /api/settings/system | PUT | ✅ | ❌ | ❌ | 更新系统配置 |
| /api/settings/reset-all-data | POST | ✅ | ❌ | ❌ | 重置所有数据 |
| /api/settings/refresh-tasks | POST | ✅ | ✅ | ❌ | 刷新任务数据 |
| /api/settings/migrate | POST | ✅ | ❌ | ❌ | 数据迁移 |

---

## 后端鉴权实现指南

### 3.1 鉴权中间件

```csharp
namespace R&DTaskSystem.Api.Middleware
{
    /// <summary>
    /// 权限检查中间件
    /// </summary>
    public class PermissionCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public PermissionCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // 从Token获取当前用户角色
            var currentUserRole = context.User.FindFirst("role")?.Value;
            var currentUserId = context.User.FindFirst("sub")?.Value;

            // 获取请求的API端点
            var endpoint = context.GetEndpoint();
            var permissionAttribute = endpoint?.Metadata.GetMetadata<PermissionAttribute>();

            if (permissionAttribute != null)
            {
                if (!HasPermission(currentUserRole, permissionAttribute.RequiredRoles))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        success = false,
                        error = new { code = "FORBIDDEN", message = "无权访问此资源" }
                    });
                    return;
                }
            }

            await _next(context);
        }

        private bool HasPermission(string? currentRole, string[] requiredRoles)
        {
            if (requiredRoles.Length == 0) return true;
            return requiredRoles.Contains(currentRole);
        }
    }

    /// <summary>
    /// 权限特性
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class PermissionAttribute : Attribute
    {
        public string[] RequiredRoles { get; }

        public PermissionAttribute(params string[] roles)
        {
            RequiredRoles = roles;
        }
    }
}
```

### 3.2 控制器鉴权示例

```csharp
namespace R&DTaskSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        // 只有管理员和班组长可以访问用户列表
        [HttpGet]
        [Permission("ADMIN", "LEADER")]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<UserDto>>>> GetUsers(
            [FromQuery] UserQueryParams query)
        {
            var currentUserId = User.FindFirst("sub")?.Value;
            var currentUserRole = User.FindFirst("role")?.Value;

            // 组员只能查看自己
            if (currentUserRole == "MEMBER")
            {
                query.UserID = currentUserId;
            }

            var result = await _userService.GetUsersAsync(query);
            return Ok(new ApiResponse<PaginatedResponse<UserDto>> { Success = true, Data = result });
        }

        // 只有管理员可以创建用户
        [HttpPost]
        [Permission("ADMIN")]
        public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
        {
            var user = await _userService.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetUser), new { userId = user.UserID },
                new ApiResponse<UserDto> { Success = true, Data = user, Message = "创建成功" });
        }

        // 所有人都可以修改自己的头像
        [HttpPost("avatars/{userId}")]
        [Permission("ADMIN", "LEADER", "MEMBER")]
        public async Task<ActionResult<ApiResponse<object>>> SaveAvatar(
            string userId, [FromBody] SaveUserAvatarRequest request)
        {
            var currentUserId = User.FindFirst("sub")?.Value;
            var currentUserRole = User.FindFirst("role")?.Value;

            // 非管理员只能操作自己的头像
            if (currentUserRole != "ADMIN" && currentUserId != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new ApiResponse<object>
                {
                    Success = false,
                    Error = new ApiError { Code = "FORBIDDEN", Message = "只能修改自己的头像" }
                });
            }

            await _userService.SaveAvatarAsync(userId, request.Avatar);
            return Ok(new ApiResponse<object> { Success = true, Message = "头像保存成功" });
        }
    }
}
```

### 3.3 角色扩展方法

```csharp
namespace R&DTaskSystem.Infrastructure.Extensions
{
    /// <summary>
    /// 角色权限扩展方法
    /// </summary>
    public static class RoleExtensions
    {
        public static bool IsAdmin(this string role) => role == "ADMIN";
        public static bool IsLeader(this string role) => role == "LEADER";
        public static bool IsMember(this string role) => role == "MEMBER";
        public static bool IsAdminOrLeader(this string role) => role == "ADMIN" || role == "LEADER";

        /// <summary>
        /// 检查角色是否有权限管理设置
        /// </summary>
        public static bool CanManageSettings(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否有权限管理任务库
        /// </summary>
        public static bool CanManageTaskPool(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否可以查看团队工作量
        /// </summary>
        public static bool CanViewTeamWorkload(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否可以管理用户
        /// </summary>
        public static bool CanManageUsers(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否可以创建项目
        /// </summary>
        public static bool CanCreateProject(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否可以删除任务
        /// </summary>
        public static bool CanDeleteTask(this string role) => role.IsAdminOrLeader();

        /// <summary>
        /// 检查角色是否可以访问系统配置
        /// </summary>
        public static bool CanManageSystemConfig(this string role) => role.IsAdmin();
    }
}
```

### 3.4 数据过滤服务

```csharp
namespace R&DTaskSystem.Infrastructure.Services
{
    /// <summary>
    /// 数据过滤服务 - 根据用户角色过滤数据
    /// </summary>
    public interface IDataFilterService
    {
        IQueryable<Task> FilterTasksByRole(IQueryable<Task> tasks, string userId, string role);
        IQueryable<Project> FilterProjectsByRole(IQueryable<Project> projects, string userId, string role);
        IQueryable<User> FilterUsersByRole(IQueryable<User> users, string userId, string role);
    }

    public class DataFilterService : IDataFilterService
    {
        public IQueryable<Task> FilterTasksByRole(IQueryable<Task> tasks, string userId, string role)
        {
            // 管理员和班组长可以查看所有任务
            if (role == "ADMIN" || role == "LEADER")
            {
                return tasks.Where(t => !t.IsDeleted);
            }

            // 组员只能查看与自己相关的任务
            return tasks.Where(t => !t.IsDeleted && (
                t.AssigneeID == userId ||
                t.CheckerID == userId ||
                t.ChiefDesignerID == userId ||
                t.ApproverID == userId ||
                t.CreatedBy == userId
            ));
        }

        public IQueryable<Project> FilterProjectsByRole(IQueryable<Project> projects, string userId, string role)
        {
            // 所有角色都可以查看所有项目（根据业务需求调整）
            return projects.Where(p => !p.IsDeleted);
        }

        public IQueryable<User> FilterUsersByRole(IQueryable<User> users, string userId, string role)
        {
            // 过滤掉admin用户
            users = users.Where(u => u.UserID != "admin");

            if (role == "ADMIN" || role == "LEADER")
            {
                return users.Where(u => !u.IsDeleted);
            }

            // 组员只能查看自己
            return users.Where(u => u.UserID == userId && !u.IsDeleted);
        }
    }
}
```

---

## 敏感操作安全说明

### 4.1 需要特殊验证的操作

| 操作 | 验证方式 | 说明 |
|------|----------|------|
| 删除TC001-TC009任务类别 | 需要密码验证 | 前端使用硬编码密码验证 |
| 重置所有数据 | 仅管理员 | 后端需验证角色为ADMIN |
| 数据迁移 | 仅管理员 | 后端需验证角色为ADMIN |
| 系统配置更新 | 仅管理员 | 后端需验证角色为ADMIN |

### 4.2 密码验证API建议

```csharp
/// <summary>
/// 敏感操作密码验证请求
/// </summary>
public class SensitiveOperationRequest
{
    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Operation { get; set; } = string.Empty;  // 操作类型
}

/// <summary>
/// 敏感操作验证结果
/// </summary>
public class SensitiveOperationResponse
{
    public bool Verified { get; set; }
    public string Message { get; set; } = string.Empty;
}
```

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-01-10 | 初始版本发布 |
| v1.1 | 2026-01-10 | 添加C#模型类定义、EF Core配置、API控制器示例 |
| v1.2 | 2026-01-10 | 添加权限控制文档，包含完整权限矩阵和后端鉴权实现指南 |
