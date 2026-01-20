# API 接口参考文档

> 版本: 1.0.0
> 最后更新: 2026-01-19
> 基础URL: `http://localhost:5000` (开发环境)
> 认证: Bearer Token (JWT)

## 目录

- [认证与授权](#认证与授权)
- [用户管理](#用户管理)
- [任务管理](#任务管理)
- [项目管理](#项目管理)
- [任务类别管理](#任务类别管理)
- [任务库管理](#任务库管理)
- [统计接口](#统计接口)
- [系统设置](#系统设置)
- [日志管理](#日志管理)
- [统一响应格式](#统一响应格式)

---

## 认证与授权

### 角色说明

| 角色 | 描述 | 权限 |
|------|------|------|
| ADMIN | 管理员 | 所有权限，包括日志查看 |
| LEADER | 班组长 | 管理团队成员，查看所有数据 |
| MEMBER | 组员 | 受限访问，查看/操作自己的任务 |

### 默认凭证

- 用户名: `admin` / 密码: `admin`
- 用户名: `张组长` / 密码: `123`

---

## 1. 认证控制器 (AuthController)

### 1.1 POST /api/auth/login

用户登录，获取认证令牌。

**认证:** 无需认证

**请求体:**

```json
{
  "userId": "string",     // 必填，用户ID或用户名
  "password": "string"    // 必填，密码
}
```

**响应示例 (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "A001",
      "name": "张组长",
      "systemRole": "LEADER",
      "officeLocation": "成都"
    },
    "token": "mock-jwt-token"
  },
  "message": null,
  "error": null
}
```

---

### 1.2 POST /api/auth/change-password

修改当前用户密码。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "userId": "string",           // 必填，用户ID
  "currentPassword": "string",  // 必填，当前密码
  "newPassword": "string"       // 必填，新密码
}
```

---

### 1.3 POST /api/auth/reset-password

重置用户密码（管理员操作）。

**认证:** 需要 Bearer Token (ADMIN/LEADER)

**请求体:**

```json
{
  "userId": "string",     // 必填，目标用户ID
  "newPassword": "string" // 可选，新密码（默认随机）
}
```

---

## 2. 用户控制器 (UsersController)

### 2.1 GET /api/users

获取用户列表（支持分页、搜索、过滤）。

**认证:** 需要 Bearer Token

**查询参数:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页数量，默认 20 |
| search | string | 否 | 搜索关键词 |
| includeDeleted | bool | 否 | 包含已删除，默认 false |
| sortBy | string | 否 | 排序字段 |
| sortOrder | string | 否 | 排序方向: asc/desc |
| officeLocation | string | 否 | 办公地点过滤 |
| status | string | 否 | 状态过滤 |
| systemRole | string | 否 | 角色过滤 |

**响应示例 (200):**

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "userId": "A001",
        "name": "张三",
        "systemRole": "MEMBER",
        "officeLocation": "成都",
        "status": "ACTIVE",
        "title": "工程师",
        "joinDate": "2024-01-15"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "pages": 3
  },
  "message": null,
  "error": null
}
```

---

### 2.2 GET /api/users/{userId}

获取单个用户详情。

**认证:** 需要 Bearer Token

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| userId | string | 用户ID |

---

### 2.3 POST /api/users

创建新用户。

**认证:** 需要 Bearer Token (ADMIN/LEADER)

**请求体:**

```json
{
  "userId": "A051",
  "name": "新用户",
  "password": "123456",
  "systemRole": "MEMBER",
  "officeLocation": "成都",
  "title": "工程师",
  "education": "本科"
}
```

---

### 2.4 PUT /api/users/{userId}

更新用户信息。

**认证:** 需要 Bearer Token (ADMIN/LEADER)

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| userId | string | 用户ID |

**请求体:** 同 POST /api/users

---

### 2.5 DELETE /api/users/{userId}

软删除用户。

**认证:** 需要 Bearer Token (ADMIN)

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| userId | string | 用户ID |

---

### 2.6 POST /api/users/{userId}/restore

恢复已删除用户。

**认证:** 需要 Bearer Token (ADMIN)

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| userId | string | 用户ID |

---

### 2.7 GET /api/users/team/{currentUserId}

获取团队成员列表。

**认证:** 需要 Bearer Token

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| currentUserId | string | 当前用户ID |

---

## 3. 任务管理

### 3.1 GET /api/tasks

获取任务列表（支持复杂过滤）。

**认证:** 需要 Bearer Token

**查询参数:**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页数量，默认 20 |
| search | string | 否 | 搜索关键词 |
| includeDeleted | bool | 否 | 包含已删除 |
| status | string | 否 | 任务状态 |
| taskClassID | string | 否 | 任务类别ID |
| category | string | 否 | 子类别 |
| projectID | string | 否 | 项目ID |
| assigneeID | string | 否 | 执行人ID |
| checkerID | string | 否 | 检查人ID |
| approverID | string | 否 | 审批人ID |
| userId | string | 否 | 当前用户ID |
| period | string | 否 | 时间周期 |
| startDateFrom | date | 否 | 开始日期范围（起） |
| startDateTo | date | 否 | 开始日期范围（止） |
| dueDateFrom | date | 否 | 截止日期范围（起） |
| dueDateTo | date | 否 | 截止日期范围（止） |

---

### 3.2 GET /api/tasks/{taskId}

获取单个任务详情。

**认证:** 需要 Bearer Token

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

---

### 3.3 POST /api/tasks

创建新任务。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "title": "设计评审",
  "description": "完成系统设计评审工作",
  "taskClassID": "TC001",
  "category": "方案设计",
  "projectID": "P001",
  "assigneeID": "A001",
  "checkerID": "A002",
  "approverID": "A003",
  "startDate": "2024-01-20",
  "dueDate": "2024-01-25",
  "workload": 5,
  "difficulty": 3,
  "isLongRunning": false,
  "isTravel": false,
  "isMeeting": false
}
```

---

### 3.4 PUT /api/tasks/{taskId}

更新任务信息。

**认证:** 需要 Bearer Token

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

**请求体:** 同 POST /api/tasks

---

### 3.5 DELETE /api/tasks/{taskId}

软删除任务。

**认证:** 需要 Bearer Token

---

### 3.6 PATCH /api/tasks/{taskId}/status

更新任务状态。

**认证:** 需要 Bearer Token

**路径参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| taskId | string | 任务ID |

**请求体:**

```json
"IN_PROGRESS"
```

**任务状态枚举:**

| 状态 | 描述 |
|------|------|
| PENDING | 待办 |
| IN_PROGRESS | 进行中 |
| COMPLETED | 已完成 |
| APPROVED | 已审批 |
| ARCHIVED | 已归档 |

---

### 3.7 PATCH /api/tasks/{taskId}/role-status

更新角色状态（个人任务进度）。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "role": "EXECUTOR",
  "status": "COMPLETED",
  "userId": "A001"
}
```

---

### 3.8 POST /api/tasks/{taskId}/complete-all

完成所有角色任务。

**认证:** 需要 Bearer Token

---

### 3.9 POST /api/tasks/{taskId}/retrieve

回收任务到任务库。

**认证:** 需要 Bearer Token

---

### 3.10 GET /api/tasks/personal/{userId}

获取个人任务列表。

**认证:** 需要 Bearer Token

---

### 3.11 GET /api/tasks/travel/{userId}

获取差旅任务列表。

**认证:** 需要 Bearer Token

**查询参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| period | string | 可选，时间周期 |

---

### 3.12 GET /api/tasks/meeting/{userId}

获取会议任务列表。

**认证:** 需要 Bearer Token

---

### 3.13 GET /api/tasks/{taskId}/is-long-running

检查任务是否为长期任务。

**认证:** 需要 Bearer Token

---

### 3.14 POST /api/tasks/batch

批量操作任务。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "taskIds": ["T001", "T002"],
  "operation": "update_status",
  "parameters": { "status": "COMPLETED" }
}
```

---

## 4. 项目管理

### 4.1 GET /api/projects

获取项目列表。

**认证:** 需要 Bearer Token

**查询参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| page | int | 页码 |
| pageSize | int | 每页数量 |
| search | string | 搜索关键词 |
| includeDeleted | bool | 包含已删除 |
| category | string | 项目类别 |

**项目类别枚举:**

| 类别 | 描述 |
|------|------|
| MARKET | 市场配合 |
| EXECUTION | 常规项目 |
| NUCLEAR | 核电项目 |
| RESEARCH | 科研 |
| RENOVATION | 改造 |
| OTHER | 其他 |

---

### 4.2 GET /api/projects/statistics

获取项目统计信息。

**认证:** 需要 Bearer Token

---

### 4.3 GET /api/projects/{id}

获取单个项目详情。

**认证:** 需要 Bearer Token

---

### 4.4 POST /api/projects

创建项目。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "name": "新项目",
  "category": "EXECUTION",
  "description": "项目描述",
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31"
}
```

---

### 4.5 PUT /api/projects/{id}

更新项目信息。

**认证:** 需要 Bearer Token

---

### 4.6 DELETE /api/projects/{id}

软删除项目。

**认证:** 需要 Bearer Token (ADMIN)

---

### 4.7 GET /api/projects/{id}/in-use

检查项目是否被任务使用。

**认证:** 需要 Bearer Token

---

## 5. 任务类别管理

### 5.1 GET /api/taskclasses

获取任务类别列表。

**认证:** 需要 Bearer Token

**任务类别枚举:**

| ID | 类别 | 描述 |
|------|------|------|
| TC001 | MARKET | 市场配合 |
| TC002 | EXECUTION | 常规项目 |
| TC003 | NUCLEAR | 核电项目 |
| TC004 | PRODUCT_DEV | 产品研发 |
| TC005 | RESEARCH | 科研项目 |
| TC006 | RENOVATION | 改造项目 |
| TC007 | MEETING_TRAINING | 会议培训 |
| TC008 | ADMIN_PARTY | 行政与党建 |
| TC009 | TRAVEL | 差旅任务 |
| TC010 | OTHER | 其他 |

---

### 5.2 POST /api/taskclasses

创建任务类别。

**认证:** 需要 Bearer Token (ADMIN)

---

### 5.3 PUT /api/taskclasses/{id}

更新任务类别。

**认证:** 需要 Bearer Token (ADMIN)

---

### 5.4 DELETE /api/taskclasses/{id}

软删除任务类别。

**认证:** 需要 Bearer Token (ADMIN)

---

### 5.5 GET /api/taskclasses/{id}/usage

检查类别使用情况。

**认证:** 需要 Bearer Token

---

### 5.6-5.10 子类别管理

- `POST /api/taskclasses/{id}/categories` - 添加子类别
- `DELETE /api/taskclasses/{id}/categories/{name}` - 移除子类别
- `PUT /api/taskclasses/{id}/categories` - 更新子类别名称
- `PUT /api/taskclasses/{id}/categories/order` - 重新排序子类别

**认证:** 需要 Bearer Token (ADMIN)

---

## 6. 任务库管理

### 6.1 GET /api/taskpool

获取任务库列表（可分配给成员的任务）。

**认证:** 需要 Bearer Token

---

### 6.2 GET /api/taskpool/statistics

获取任务库统计信息。

**认证:** 需要 Bearer Token

---

### 6.3 POST /api/taskpool

创建任务库项。

**认证:** 需要 Bearer Token

---

### 6.4 POST /api/taskpool/{id}/assign

分配任务给成员。

**认证:** 需要 Bearer Token

**请求体:**

```json
{
  "assignToPoolItemId": "TP001",
  "assigneeId": "A001",
  "assigneeName": "张三",
  "startDate": "2024-01-20",
  "dueDate": "2024-01-25"
}
```

---

### 6.5 POST /api/taskpool/batch-assign

批量分配任务。

**认证:** 需要 Bearer Token

---

### 6.6 POST /api/taskpool/{id}/duplicate

复制任务库项。

**认证:** 需要 Bearer Token

---

### 6.7 POST /api/taskpool/retrieve/{taskId}

从任务回收至任务库。

**认证:** 需要 Bearer Token

---

## 7. 统计接口

### 7.1 GET /api/statistics/personal

获取个人统计概览。

**认证:** 需要 Bearer Token

---

### 7.2 GET /api/statistics/personal/tasks

获取个人任务统计（按状态分类）。

**认证:** 需要 Bearer Token

---

### 7.3 GET /api/statistics/team

获取团队统计信息。

**认证:** 需要 Bearer Token (LEADER/ADMIN)

---

### 7.4 GET /api/statistics/workload

获取工作量分布统计。

**认证:** 需要 Bearer Token

---

### 7.5 GET /api/statistics/trend/monthly

获取月度趋势数据。

**认证:** 需要 Bearer Token

---

### 7.6 GET /api/statistics/trend/daily

获取日趋势数据。

**认证:** 需要 Bearer Token

---

### 7.7 GET /api/statistics/delayed

获取拖延任务列表。

**认证:** 需要 Bearer Token

---

### 7.8 GET /api/statistics/overdue

获取逾期任务列表。

**认证:** 需要 Bearer Token

---

### 7.9 GET /api/statistics/travel

获取差旅统计。

**认证:** 需要 Bearer Token

---

### 7.10 GET /api/statistics/meeting

获取会议统计。

**认证:** 需要 Bearer Token

---

### 7.11 GET /api/statistics/workdays

获取工作日信息。

**认证:** 需要 Bearer Token

---

## 8. 系统设置

### 8.1 机型管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/settings/equipment-models | 获取机型列表 |
| POST | /api/settings/equipment-models | 添加机型 |
| DELETE | /api/settings/equipment-models/{model} | 删除机型 |
| POST | /api/settings/equipment-models/batch | 批量添加机型 |

---

### 8.2 容量等级管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/settings/capacity-levels | 获取容量等级列表 |
| POST | /api/settings/capacity-levels | 添加容量等级 |
| DELETE | /api/settings/capacity-levels/{level} | 删除容量等级 |

---

### 8.3 差旅标签管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/settings/travel-labels | 获取差旅标签列表 |
| POST | /api/settings/travel-labels | 添加差旅标签 |
| DELETE | /api/settings/travel-labels/{label} | 删除差旅标签 |

---

### 8.4 用户头像管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/settings/avatars/{userId} | 获取用户头像 |
| POST | /api/settings/avatars/{userId} | 保存用户头像 |
| DELETE | /api/settings/avatars/{userId} | 删除用户头像 |

---

### 8.5 任务分类管理

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/settings/task-categories | 获取任务分类 |
| PUT | /api/settings/task-categories/{code} | 更新任务分类 |

---

### 8.6 数据管理

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | /api/settings/reset-all-data | 重置所有数据 |
| POST | /api/settings/refresh-tasks | 刷新任务 |
| POST | /api/settings/migrate | 迁移数据 |

---

## 9. 日志管理

**认证要求:** 需要 ADMIN 角色

### 9.1 GET /api/logs

获取日志列表（分页）。

**查询参数:**

| 参数 | 类型 | 描述 |
|------|------|------|
| startDate | date | 开始日期 |
| endDate | date | 结束日期 |
| userId | string | 用户ID |
| path | string | 请求路径 |
| isSuccess | bool | 是否成功 |
| page | int | 页码 |
| pageSize | int | 每页数量 |

---

### 9.2 GET /api/logs/statistics

获取日志统计信息。

---

### 9.3 DELETE /api/logs/cleanup

清理过期日志（默认清理30天前的日志）。

---

## 统一响应格式

### 成功响应

```json
{
  "success": true,
  "data": { /* 数据对象或数组 */ },
  "message": "操作成功",
  "error": null
}
```

### 分页响应

```json
{
  "data": [ /* 数据数组 */ ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "pages": 5
}
```

### 错误响应

```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": {
    "code": "AUTH_FAILED",
    "message": "用户名或密码错误"
  }
}
```

### 常见错误码

| 错误码 | 描述 |
|--------|------|
| AUTH_FAILED | 认证失败 |
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 禁止访问 |
| NOT_FOUND | 资源不存在 |
| VALIDATION_ERROR | 参数验证错误 |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 附录

### A. 健康检查

```
GET /api/health
```

无需认证，返回服务健康状态。

### B. Swagger 文档

开发环境可访问: `http://localhost:5000/swagger`

### C. 软删除说明

所有 DELETE 操作均为软删除，通过 `is_deleted` 标志实现，不会真正删除数据。

### D. CORS 配置

开发环境已配置允许所有来源。
