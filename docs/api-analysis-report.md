# 前后端API接口分析报告

## 概述

本报告分析了研发任务管理系统的前后端API接口，重点检查：
1. 接口路径匹配性
2. 字段命名规范（camelCase）
3. 请求/响应格式一致性

---

## 分析结果汇总

| 检查项 | 状态 | 问题数量 |
|--------|------|----------|
| 接口路径匹配 | ✅ 良好 | 0 |
| 响应字段camelCase | ⚠️ 部分一致 | 4 |
| 请求字段camelCase | ❌ 不一致 | 3 |
| 响应格式统一性 | ⚠️ 部分一致 | 2 |
| 枚举值命名 | ⚠️ 部分一致 | 1 |

---

## 一、接口路径匹配性分析

### 1.1 认证模块 (Auth)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 登录 | `/api/auth/login` | `/api/auth/login` | ✅ |
| 获取当前用户 | `/api/auth/me` | `/api/auth/me` | ✅ |
| 修改密码 | `/api/auth/change-password` | `/api/auth/change-password` | ✅ |
| 刷新Token | `/api/auth/refresh-token` | `/api/auth/refresh-token` | ✅ |

**结论**: ✅ 匹配

### 1.2 用户模块 (Users)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 获取用户列表 | `/api/users` | `/api/users` | ✅ |
| 获取单个用户 | `/api/users/{userId}` | `/api/users/{userId}` | ✅ |
| 创建用户 | `/api/users` | `/api/users` | ✅ |
| 更新用户 | `/api/users/{userId}` | `/api/users/{userId}` | ✅ |
| 删除用户 | `/api/users/{userId}` | `/api/users/{userId}` | ✅ |
| 恢复用户 | `/api/users/{userId}/restore` | `/api/users/{userId}/restore` | ✅ |
| 获取团队成员 | `/api/users/team/{currentUserId}` | `/api/users/team/{currentUserId}` | ✅ |

**结论**: ✅ 匹配

### 1.3 项目模块 (Projects)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 获取项目列表 | `/api/projects` | `/api/projects` | ✅ |
| 获取单个项目 | `/api/projects/{projectId}` | `/api/projects/{id}` | ⚠️ 路由参数名不一致 |
| 创建项目 | `/api/projects` | `/api/projects` | ✅ |
| 更新项目 | `/api/projects/{projectId}` | `/api/projects/{id}` | ⚠️ 路由参数名不一致 |
| 删除项目 | `/api/projects/{projectId}` | `/api/projects/{id}` | ⚠️ 路由参数名不一致 |
| 项目统计 | `/api/projects/statistics` | `/api/projects/statistics` | ✅ |
| 检查使用中 | `/api/projects/{projectId}/in-use` | `/api/projects/{id}/in-use` | ⚠️ 路由参数名不一致 |

**结论**: ⚠️ 路由参数名不一致（前端用 `projectId`，后端用 `id`），但功能正常

### 1.4 任务模块 (Tasks)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 获取任务列表 | `/api/tasks` | `/api/tasks` | ✅ |
| 获取单个任务 | `/api/tasks/{taskId}` | `/api/tasks/{taskId}` | ✅ |
| 创建任务 | `/api/tasks` | `/api/tasks` | ✅ |
| 更新任务 | `/api/tasks/{taskId}` | `/api/tasks/{taskId}` | ✅ |
| 删除任务 | `/api/tasks/{taskId}` | `/api/tasks/{taskId}` | ✅ |
| 更新状态 | `/api/tasks/{taskId}/status` | `/api/tasks/{taskId}/status` | ✅ |
| 更新角色状态 | `/api/tasks/{taskId}/role-status` | `/api/tasks/{taskId}/role-status` | ✅ |
| 批量操作 | `/api/tasks/batch` | `/api/tasks/batch` | ✅ |
| 个人任务 | `/api/tasks/personal/{userId}` | `/api/tasks/personal/{userId}` | ✅ |
| 差旅任务 | `/api/tasks/travel/{userId}` | `/api/tasks/travel/{userId}` | ✅ |
| 会议任务 | `/api/tasks/meeting/{userId}` | `/api/tasks/meeting/{userId}` | ✅ |
| 回收任务库 | `/api/tasks/{taskId}/retrieve` | `/api/tasks/{taskId}/retrieve` | ✅ |

**结论**: ✅ 匹配

### 1.5 任务库模块 (TaskPool)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 获取任务库列表 | `/api/taskpool` | `/api/taskpool` | ✅ |
| 获取单个项 | `/api/taskpool/{id}` | `/api/taskpool/{id}` | ✅ |
| 创建 | `/api/taskpool` | `/api/taskpool` | ✅ |
| 更新 | `/api/taskpool/{id}` | `/api/taskpool/{id}` | ✅ |
| 删除 | `/api/taskpool/{id}` | `/api/taskpool/{id}` | ✅ |
| 分配任务 | `/api/taskpool/{poolItemId}/assign` | `/api/taskpool/{id}/assign` | ⚠️ 路由参数名不一致 |
| 批量分配 | `/api/taskpool/batch-assign` | `/api/taskpool/batch-assign` | ✅ |
| 复制 | `/api/taskpool/{poolItemId}/duplicate` | `/api/taskpool/{id}/duplicate` | ⚠️ 路由参数名不一致 |
| 从任务回收 | `/api/taskpool/retrieve/{taskId}` | `/api/taskpool/retrieve/{taskId}` | ✅ |
| 统计 | `/api/taskpool/statistics` | `/api/taskpool/statistics` | ✅ |

**结论**: ⚠️ 部分路由参数名不一致

### 1.6 任务分类模块 (TaskClasses)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 获取分类列表 | `/api/taskclasses` | `/api/TaskClasses` | ⚠️ 大小写不一致 |
| 获取单个分类 | `/api/taskclasses/{taskClassId}` | `/api/TaskClasses/{id}` | ⚠️ 大小写和参数名都不一致 |
| 创建分类 | `/api/taskclasses` | `/api/TaskClasses` | ⚠️ 大小写不一致 |
| 更新分类 | `/api/taskclasses/{taskClassId}` | `/api/TaskClasses/{id}` | ⚠️ 两者都不一致 |
| 删除分类 | `/api/taskclasses/{taskClassId}` | `/api/TaskClasses/{id}` | ⚠️ 两者都不一致 |

**结论**: ❌ 大小写和参数名都不一致

### 1.7 统计模块 (Statistics)

| 功能 | 前端路径 | 后端路径 | 状态 |
|------|----------|----------|------|
| 个人统计 | `/api/statistics/personal` | `/api/statistics/personal` | ✅ |
| 个人任务 | `/api/statistics/personal/tasks` | `/api/statistics/personal/tasks` | ✅ |
| 团队统计 | `/api/statistics/team` | `/api/statistics/team` | ✅ |
| 工作量分布 | `/api/statistics/workload` | `/api/statistics/workload` | ✅ |
| 月度趋势 | `/api/statistics/trend/monthly` | `/api/statistics/trend/monthly` | ✅ |
| 逾期任务 | `/api/statistics/overdue` | `/api/statistics/overdue` | ✅ |
| 拖延任务 | `/api/statistics/delayed` | `/api/statistics/delayed` | ✅ |
| 差旅统计 | `/api/statistics/travel` | `/api/statistics/travel` | ✅ |
| 会议统计 | `/api/statistics/meeting` | `/api/statistics/meeting` | ✅ |
| 工作日 | `/api/statistics/workdays` | `/api/statistics/workdays` | ✅ |

**结论**: ✅ 匹配

---

## 二、字段命名规范分析 (camelCase)

### 2.1 响应DTO字段命名

#### TaskDto (任务响应) ✅ 正确

| 字段名 (后端) | JSON输出 | 前端类型 | 状态 |
|---------------|----------|----------|------|
| TaskId | taskId | taskId: string | ✅ |
| TaskClassId | taskClassId | taskClassId: string | ✅ |
| ProjectId | projectId | projectId?: string | ✅ |
| AssigneeId | assigneeId | assigneeId?: string | ✅ |
| StartDate | startDate | startDate?: string | ✅ |
| DueDate | dueDate | dueDate?: string | ✅ |
| IsForceAssessment | isForceAssessment | isForceAssessment?: boolean | ✅ |

**结论**: TaskDto 使用 `[JsonPropertyName]` 正确实现了 camelCase

#### TaskPoolItemDto (任务库项响应) ✅ 正确

| 字段名 (后端) | JSON输出 | 前端类型 | 状态 |
|---------------|----------|----------|------|
| TaskClassId | taskClassId | taskClassId: string | ✅ |
| ProjectId | projectId | projectId?: string | ✅ |
| PersonInChargeId | personInChargeId | personInChargeId?: string | ✅ |
| ChiefDesignerId | chiefDesignerId | chiefDesignerId?: string | ✅ |

**结论**: TaskPoolItemDto 使用 `[JsonPropertyName]` 正确实现了 camelCase

#### UserDto (用户响应) ⚠️ 部分正确

| 字段名 (后端) | JSON输出 | 前端期望 | 状态 |
|---------------|----------|----------|------|
| UserId | userId | userId: string | ✅ |
| Name | Name | name: string | ❌ 应为 name |
| SystemRole | SystemRole | systemRole: string | ❌ 应为 systemRole |
| OfficeLocation | OfficeLocation | officeLocation: string | ❌ 应为 officeLocation |
| JoinDate | JoinDate | joinDate?: string | ❌ 应为 joinDate |

**问题**: UserDto 只有 `UserId` 字段使用了 `[JsonPropertyName]`，其他字段直接使用属性名（PascalCase）

#### ProjectDto (项目响应) ❌ 错误

| 字段名 (后端) | JSON输出 | 前端期望 | 状态 |
|---------------|----------|----------|------|
| Id | Id | id: string | ❌ 应为 id |
| WorkNo | WorkNo | workNo?: string | ❌ 应为 workNo |
| IsWon | IsWon | isWon?: boolean | ❌ 应为 isWon |
| IsKeyProject | IsKeyProject | isKeyProject?: boolean | ❌ 应为 isKeyProject |

**问题**: ProjectDto 完全没有使用 `[JsonPropertyName]`

#### TaskClassDto (任务分类响应) ❌ 错误

| 字段名 (后端) | JSON输出 | 前端期望 | 状态 |
|---------------|----------|----------|------|
| Id | Id | id: string | ❌ 应为 id |
| Description | Description | description?: string | ❌ 应为 description |

**问题**: TaskClassDto 完全没有使用 `[JsonPropertyName]`

#### TaskClassListResponse (任务分类列表响应) ❌ 错误

| 字段名 (后端) | JSON输出 | 前端期望 | 状态 |
|---------------|----------|----------|------|
| TaskClasses | TaskClasses | taskClasses: TaskClass[] | ❌ 应为 taskClasses |
| Categories | Categories | categories: Record<string, string[]> | ❌ 应为 categories |

**问题**: 完全没有使用 `[JsonPropertyName]`

### 2.2 请求DTO字段命名

#### CreateTaskRequest (创建任务请求) ❌ 错误

| C#属性名 | JSON输出 | 前端发送 | 状态 |
|----------|----------|----------|------|
| TaskClassID | TaskClassID | taskClassId: string | ❌ 不匹配 |
| ProjectID | ProjectID | projectId?: string | ❌ 不匹配 |
| AssigneeID | AssigneeID | assigneeId?: string | ❌ 不匹配 |
| CheckerID | CheckerID | checkerId?: string | ❌ 不匹配 |
| ChiefDesignerID | ChiefDesignerID | chiefDesignerId?: string | ❌ 不匹配 |
| ApproverID | ApproverID | approverId?: string | ❌ 不匹配 |

**问题**: 请求DTO使用 PascalCase + ID 后缀，没有 `[JsonPropertyName]`

#### CreateTaskPoolItemRequest (创建任务库项请求) ❌ 错误

| C#属性名 | JSON输出 | 前端发送 | 状态 |
|----------|----------|----------|------|
| TaskClassID | TaskClassID | taskClassId: string | ❌ 不匹配 |
| ProjectID | ProjectID | projectId?: string | ❌ 不匹配 |
| PersonInChargeID | PersonInChargeID | personInChargeId?: string | ❌ 不匹配 |
| CheckerID | CheckerID | checkerId?: string | ❌ 不匹配 |
| ChiefDesignerID | ChiefDesignerID | chiefDesignerId?: string | ❌ 不匹配 |
| ApproverID | ApproverID | approverId?: string | ❌ 不匹配 |

**问题**: 同上

#### CreateUserRequest (创建用户请求) ❌ 错误

| C#属性名 | JSON输出 | 前端发送 | 状态 |
|----------|----------|----------|------|
| UserID | UserID | userId: string | ❌ 不匹配 |

**问题**: 使用 `UserID` 而不是 `userId`

#### AssignTaskRequest (分配任务请求) ✅ 正确

| C#属性名 | JSON输出 | 前端发送 | 状态 |
|----------|----------|----------|------|
| TaskClassId | taskClassId | taskClassId: string | ✅ |
| ProjectId | projectId | projectId?: string | ✅ |
| AssigneeId | assigneeId | assigneeId?: string | ✅ |
| ReviewerId | reviewerId | reviewerId?: string | ✅ |

**结论**: AssignTaskRequest 正确使用了 camelCase

#### CreateProjectRequest (创建项目请求) ✅ 正确

| C#属性名 | JSON输出 | 前端发送 | 状态 |
|----------|----------|----------|------|
| Name | Name | name: string | ✅ |
| WorkNo | WorkNo | workNo?: string | ⚠️ 匹配但非camelCase |
| IsKeyProject | IsKeyProject | isKeyProject?: boolean | ⚠️ 匹配但非camelCase |

**结论**: CreateProjectRequest 没有使用 `[JsonPropertyName]`，但字段名本身是简单的 PascalCase，前端也发送同样的格式

### 2.3 前端类型定义问题

#### TaskClass 前端接口 ⚠️ 问题

```typescript
// 当前定义
export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  notice?: string;
  is_deleted?: boolean;      // ❌ 应为 isDeleted
  created_at?: string;       // ❌ 应为 createdAt
  updated_at?: string;       // ❌ 应为 updatedAt
}
```

**问题**: 使用了 snake_case 而非 camelCase

---

## 三、响应格式统一性分析

### 3.1 统一包装格式

部分API使用 `{ success, data, message }` 格式：

```
POST /api/tasks          → 返回包装格式
POST /api/taskpool       → 返回包装格式
POST /api/users          → 返回直接对象
POST /api/projects       → 返回直接对象
GET  /api/tasks          → 返回 { data: [...] }
GET  /api/taskpool       → 返回 { data: [...], total, page, ... }
```

**问题**: 响应格式不统一，前端需要处理多种格式

### 3.2 分页响应格式

| 模块 | 格式 | 状态 |
|------|------|------|
| 任务列表 | `{ data: Task[], total, page, pageSize, pages }` | ✅ |
| 任务库列表 | `{ data: TaskPoolItemDto[], total, page, pageSize, pages }` | ✅ |
| 用户列表 | `{ data: User[] }` | ⚠️ 无分页信息 |
| 项目列表 | `{ data: Project[] }` | ⚠️ 无分页信息 |

**问题**: 分页格式不统一

---

## 四、问题总结

### 严重问题 (需立即修复)

1. **请求DTO字段命名不一致**
   - `CreateTaskRequest` 使用 `TaskClassID` 而非 `taskClassId`
   - `CreateTaskPoolItemRequest` 使用 `TaskClassID` 而非 `taskClassId`
   - `CreateUserRequest` 使用 `UserID` 而非 `userId`

2. **响应DTO缺少JsonPropertyName**
   - `ProjectDto` 完全没有 `[JsonPropertyName]`
   - `TaskClassDto` 完全没有 `[JsonPropertyName]`
   - `TaskClassListResponse` 完全没有 `[JsonPropertyName]`
   - `UserDto` 部分字段缺少 `[JsonPropertyName]`

### 一般问题 (建议修复)

3. **API路由大小写不一致**
   - 前端使用小写 `/api/taskclasses`
   - 后端使用 PascalCase `/api/TaskClasses`

4. **路由参数名不一致**
   - 前端使用 `projectId`，后端使用 `{id}`
   - 前端使用 `taskClassId`，后端使用 `{id}`

5. **前端TaskClass类型使用snake_case**
   - `is_deleted`, `created_at`, `updated_at` 应改为 `isDeleted`, `createdAt`, `updatedAt`

6. **响应格式不统一**
   - 部分API使用包装格式，部分返回直接对象

---

## 附录：各模块字段对照表

### 任务模块 (Tasks)

| 功能 | 方向 | 字段数 | 匹配数 | 不匹配数 | 匹配率 |
|------|------|--------|--------|----------|--------|
| 创建任务 | 前端→后端 | 18 | 12 | 6 | 67% |
| 任务响应 | 后端→前端 | 32 | 32 | 0 | 100% |
| 任务查询 | 前端→后端 | 8 | 8 | 0 | 100% |

### 用户模块 (Users)

| 功能 | 方向 | 字段数 | 匹配数 | 不匹配数 | 匹配率 |
|------|------|--------|--------|----------|--------|
| 创建用户 | 前端→后端 | 12 | 11 | 1 | 92% |
| 用户响应 | 后端→前端 | 10 | 6 | 4 | 60% |

### 项目模块 (Projects)

| 功能 | 方向 | 字段数 | 匹配数 | 不匹配数 | 匹配率 |
|------|------|--------|--------|----------|--------|
| 创建项目 | 前端→后端 | 13 | 13 | 0 | 100% |
| 项目响应 | 后端→前端 | 13 | 0 | 13 | 0% |

### 任务库模块 (TaskPool)

| 功能 | 方向 | 字段数 | 匹配数 | 不匹配数 | 匹配率 |
|------|------|--------|--------|----------|--------|
| 创建任务库项 | 前端→后端 | 18 | 12 | 6 | 67% |
| 任务库项响应 | 后端→前端 | 20 | 20 | 0 | 100% |

### 任务分类模块 (TaskClasses)

| 功能 | 方向 | 字段数 | 匹配数 | 不匹配数 | 匹配率 |
|------|------|--------|--------|----------|--------|
| 创建分类 | 前端→后端 | 6 | 6 | 0 | 100% |
| 分类响应 | 后端→前端 | 5 | 0 | 5 | 0% |
| 分类列表响应 | 后端→前端 | 2 | 0 | 2 | 0% |

---

*报告生成时间: 2026-01-26*
*分析工具: Claude Code*
