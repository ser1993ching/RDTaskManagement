# dataService.ts 功能说明文档

> 本文档详细描述 `dataService.ts` 文件中实现的所有功能模块。

## 1. 文件概述

**文件路径**: `frontend/src/services/dataService.ts`

**状态**: 已废弃（deprecated）- 现由 `apiDataService` 替代
**用途**: 提供本地数据持久化和业务逻辑处理（localStorage 存储）

---

## 2. 存储键定义 (STORAGE_KEYS)

定义了用于 localStorage 数据存储的键名映射：

| 键名 | 存储内容 |
|------|----------|
| `USERS` | 用户数据 |
| `PROJECTS` | 项目数据 |
| `TASKS` | 任务数据 |
| `TASK_CLASSES` | 任务分类定义 |
| `CURRENT_USER` | 当前登录用户会话 |
| `EQUIPMENT_MODELS` | 机型配置 |
| `CAPACITY_LEVELS` | 容量等级配置 |
| `TRAVEL_LABELS` | 差旅标签配置 |
| `USER_AVATARS` | 用户头像映射 |
| `TASK_CATEGORIES` | 任务子分类配置 |
| `TASK_POOL` | 任务库数据 |

---

## 3. 配置常量

### 3.1 默认任务分类 (DEFAULT_TASK_CATEGORIES)

定义了 10 种任务大类及其子分类：

| 大类代码 | 名称 | 子分类 |
|----------|------|--------|
| `MARKET` | 市场配合 | 标书、复询、技术方案、其他 |
| `EXECUTION` | 常规项目 | 搭建生产资料、设计院提资、CT配合与提资、随机资料、项目特殊项处理、用户配合、图纸会签、传真回复、其他 |
| `NUCLEAR` | 核电项目 | 核电设计、核安全审查、设备调试、常规岛配合、核岛接口、技术方案、其他 |
| `PRODUCT_DEV` | 产品研发 | 技术方案、设计流程、方案评审、专利申请、出图、图纸改版、设计总结 |
| `RESEARCH` | 科研项目 | 开题报告、专利申请、结题报告、其他 |
| `RENOVATION` | 改造项目 | 前期项目配合、方案编制、其他 |
| `MEETING_TRAINING` | 会议培训 | 学习与培训、党建会议、班务会、设计评审会、资料讨论会、其他 |
| `ADMIN_PARTY` | 行政与党建 | 报表填报、ppt汇报、总结报告、其他 |
| `TRAVEL` | 差旅任务 | 市场配合出差、常规项目执行出差、核电项目执行出差、科研出差、改造服务出差、其他任务出差 |
| `OTHER` | 其他 | 通用任务 |

### 3.2 任务分类映射 (TASKCLASS_TO_CATEGORY)

将任务分类 ID (TC001-TC010) 映射到分类代码。

---

## 4. 种子数据 (Seed Data)

### 4.1 用户数据 (seedUsers)

预置了 9 个示例用户：

| 用户ID | 名称 | 角色 | 办公地点 | 密码 |
|--------|------|------|----------|------|
| `admin` | 系统管理员 | ADMIN | 成都 | `admin` |
| `LEADER001` | 张组长 | LEADER | 德阳 | `123` |
| `USER001` | 李研发 | MEMBER | 成都 | `123` |
| `USER002` | 王设计 | MEMBER | 成都 | `123` |
| `USER003` | 陈工程师 | MEMBER | 德阳 | `123` |
| `USER004` | 刘技术 | MEMBER | 成都 | `123` |
| `USER005` | 赵项目 | LEADER | 德阳 | `123` |
| `USER006` | 孙质量 | MEMBER | 成都 | `123` |
| `USER007` | 周研发 | MEMBER | 德阳 | `123` |

### 4.2 项目数据 (seedProjects)

预置了 30 个示例项目，涵盖各分类：
- 市场配合项目: 5 个
- 常规项目: 5 个
- 核电项目: 5 个
- 科研项目: 5 个
- 改造项目: 5 个
- 其他项目: 5 个

### 4.3 任务数据 (seedTasks)

预置了 55 个示例任务，按时间周期分布：
- 本周任务
- 本月任务
- 近三个月任务
- 近半年任务
- 近一年任务

### 4.4 任务池数据 (seedTaskPoolItems)

预置了 20 个任务库条目，用于任务模板管理。

### 4.5 任务分类数据 (seedTaskClasses)

预置了 10 个任务分类定义，包含分类名称、代码、描述和注意事项。

---

## 5. DataService 类方法详解

### 5.1 初始化与数据管理

#### `init()`
- **功能**: 初始化服务
- **说明**: 当前版本不再初始化示例数据，所有数据通过 API 获取

#### `reinitializeData(): void`
- **功能**: 重新初始化所有数据（保留当前用户会话）
- **操作**: 清除所有 localStorage 数据，保留登录状态

#### `refreshTasksData(): void`
- **功能**: 强制刷新任务数据
- **说明**: 清除任务缓存，数据通过 API 刷新

---

### 5.2 用户管理 (Users)

| 方法名 | 功能 | 说明 |
|--------|------|------|
| `getUsers()` | 获取所有用户 | 过滤已删除用户 |
| `saveUser(user: User)` | 保存用户 | 新增或更新 |
| `deleteUser(userId: string)` | 删除用户 | 软删除 (is_deleted=true) |
| `getAllUsersRaw()` | 获取原始用户数据 | 包含已删除用户 |

---

### 5.3 项目管理 (Projects)

| 方法名 | 功能 | 说明 |
|--------|------|------|
| `getProjects()` | 获取所有项目 | 过滤已删除，按开始日期降序排序 |
| `saveProject(project: Project)` | 保存项目 | 新增或更新 |
| `deleteProject(id: string)` | 删除项目 | 软删除 |
| `getAllProjectsRaw()` | 获取原始项目数据 | 包含已删除项目 |

---

### 5.4 任务管理 (Tasks)

| 方法名 | 功能 | 说明 |
|--------|------|------|
| `getTasks()` | 获取所有任务 | 过滤已删除，按创建日期降序排序 |
| `saveTask(task: Task)` | 保存任务 | 市场任务自动获取项目容量等级 |
| `deleteTask(taskId: string)` | 删除任务 | 软删除 |
| `getAllTasksRaw()` | 获取原始任务数据 | 包含已删除任务 |

#### 角色状态管理

| 方法名 | 功能 |
|--------|------|
| `updateTaskRoleStatus(taskId, role, status)` | 更新任务中指定角色的状态 (assignee/checker/chiefDesigner/approver) |
| `updateAllRoleStatusToCompleted(taskId)` | 将任务所有角色状态设为完成 |

---

### 5.5 任务分类管理 (TaskClasses)

| 方法名 | 功能 |
|--------|------|
| `getTaskClasses()` | 获取所有任务分类 |
| `saveTaskClass(taskClass: TaskClass)` | 保存任务分类 |
| `deleteTaskClass(id: string)` | 删除任务分类 (软删除) |
| `checkTaskClassUsage(id)` | 检查分类使用情况，返回是否有任务关联及任务数量 |

---

### 5.6 任务库管理 (Task Pool)

| 方法名 | 功能 |
|--------|------|
| `getTaskPoolItems()` | 获取任务库列表 |
| `getTaskPoolItem(id)` | 获取单个任务库条目 |
| `saveTaskPoolItem(item: TaskPoolItem)` | 保存任务库条目 |
| `deleteTaskPoolItem(id)` | 删除任务库条目 (软删除) |
| `assignPoolItemToTask(poolItemId, taskData)` | 将任务库条目分配为正式任务 |

**`assignPoolItemToTask` 特殊逻辑**:
- 从任务库创建新任务时，自动继承任务库条目的基本信息
- 如果是 TC007 (会议培训) 类型，角色状态默认为完成
- 其他类型角色状态默认为未开始

---

### 5.7 任务分类配置管理

| 方法名 | 功能 |
|--------|------|
| `getTaskCategories()` | 获取所有任务子分类配置 |
| `saveTaskCategory(taskClassCode, categories)` | 保存子分类列表 |
| `addTaskCategory(taskClassCode, categoryName)` | 添加单个子分类 |
| `deleteTaskCategory(taskClassCode, categoryName)` | 删除子分类 |
| `updateTaskCategory(taskClassCode, oldName, newName)` | 更新子分类名称 |
| `reorderTaskCategories(taskClassCode, newOrder)` | 重新排序子分类 |

---

### 5.8 认证与权限 (Authentication)

| 方法名 | 功能 |
|--------|------|
| `login(userId, password)` | 用户登录，支持工号或姓名登录 |
| `getCurrentUser()` | 获取当前登录用户 |
| `logout()` | 退出登录 |

#### 密码管理

| 方法名 | 功能 |
|--------|------|
| `changePassword(userId, currentPassword, newPassword)` | 修改密码 |
| `resetPassword(userId, newPassword)` | 重置密码 (管理员用) |
| `generateTemporaryPassword()` | 生成随机临时密码 (8位) |

---

### 5.9 头像管理 (Avatars)

| 方法名 | 功能 |
|--------|------|
| `saveAvatar(userId, avatarData)` | 保存用户头像 |
| `getAvatar(userId)` | 获取用户头像 |
| `deleteAvatar(userId)` | 删除用户头像 |

---

### 5.10 系统配置管理

#### 机型配置 (Equipment Models)

| 方法名 | 功能 |
|--------|------|
| `getEquipmentModels()` | 获取机型列表 |
| `saveEquipmentModel(model)` | 添加机型 |
| `deleteEquipmentModel(model)` | 删除机型 |

#### 容量等级配置 (Capacity Levels)

| 方法名 | 功能 |
|--------|------|
| `getCapacityLevels()` | 获取容量等级列表 |
| `saveCapacityLevel(level)` | 添加容量等级 |
| `deleteCapacityLevel(level)` | 删除容量等级 |

#### 差旅标签配置 (Travel Labels)

| 方法名 | 功能 |
|--------|------|
| `getTravelLabels()` | 获取差旅标签列表 |
| `saveTravelLabel(label)` | 添加差旅标签 |
| `deleteTravelLabel(label)` | 删除差旅标签 |

#### 初始化设置

| 方法名 | 功能 |
|--------|------|
| `initializeSettings()` | 初始化默认配置，包括机型、容量等级、差旅标签 |

---

### 5.11 个人工作台方法 (Personal Workspace)

#### 任务获取与筛选

| 方法名 | 功能 |
|--------|------|
| `getPersonalTasks(userId)` | 获取用户相关的所有任务（任一角色） |
| `getTravelTasks(userId)` | 获取用户的差旅任务 (TC009) |
| `getMeetingTasks(userId)` | 获取用户的会议任务 (TC007，参与者身份) |
| `separateTasksByStatus(tasks)` | 按任务状态分组（进行中/未开始/已完成） |
| `separateTasksByRoleStatus(tasks, userId)` | 按用户角色状态分组 |

#### 角色状态处理

| 方法名 | 功能 |
|--------|------|
| `getRoleStatusForUser(task, userId)` | 获取用户在任务中的角色状态 |

#### 周期统计

| 方法名 | 功能 |
|--------|------|
| `getWorkDaysInPeriod(period)` | 计算指定周期内的实际工作天数（排除周末） |
| `filterTasksByPeriod(tasks, period)` | 按创建日期筛选任务 |
| `filterTasksByStartDate(tasks, period)` | 按开始日期筛选任务 |
| `isTaskLongRunning(task)` | 判断任务是否长期未完成（超过2个月） |

**支持的周期类型**:
- `week` - 本周
- `month` - 本月
- `quarter` - 近三个月
- `halfYear` - 近半年
- `year` - 本年度
- `yearAndHalf` - 近一年半

#### 统计分析

| 方法名 | 功能 |
|--------|------|
| `calculatePersonalStats(tasks, period, userId?)` | 计算个人统计数据，包括任务数量、完成率、分类分布、差旅/会议统计 |
| `calculateMonthlyTrend(tasks, months, userId)` | 计算月度任务趋势（分配数/完成数） |
| `calculateDailyTrend(tasks, days, userId)` | 计算每日任务趋势 |

---

### 5.12 任务回收与导出

| 方法名 | 功能 |
|--------|------|
| `retrieveTaskToPool(taskId)` | 回收任务到任务库，清空所有角色信息，重置状态 |
| `getTeamMembers(currentUserId)` | 获取团队成员列表（排除当前用户） |
| `generateStatsCSV(stats, separatedTasks, userName)` | 生成统计报表 CSV 内容 |
| `downloadStatsCSV(csvContent, fileName)` | 下载 CSV 文件 |

---

### 5.13 任务状态计算与迁移

#### 状态计算

| 方法名 | 功能 |
|--------|------|
| `calculateTaskStatus(task)` | 根据各角色状态自动计算任务整体状态 |

**状态优先级**:
1. 已完成 - 所有角色都完成
2. 驳回状态优先级: 审批人 > 主任设计 > 校核人 > 执行人
3. 进行中状态优先级: 审批人 > 主任设计 > 校核人 > 执行人
4. 未开始

#### 权限判断

| 方法名 | 功能 |
|--------|------|
| `canViewWorkload(user)` | 判断用户是否有权限查看工作量（LEADER 或 ADMIN） |

#### 数据迁移

| 方法名 | 功能 |
|--------|------|
| `migrateTaskStatusFields()` | 迁移旧字段名到新字段名（如 ReviewerID → CheckerID） |

---

### 5.14 工具方法

| 方法名 | 功能 |
|--------|------|
| `generateId(prefix)` | 生成唯一ID，格式: `{prefix}-{时间戳}` |

---

## 6. 软删除机制

所有实体（用户、项目、任务等）均采用**软删除**机制：
- 删除操作设置 `is_deleted = true`
- 查询方法自动过滤 `is_deleted = true` 的记录
- 原始数据方法 (`getAllXxxRaw`) 可获取包括已删除的数据

---

## 7. 输出实例

```typescript
// 导出单例
export const dataService = new DataService();

// 使用示例
const users = dataService.getUsers();
const currentUser = dataService.getCurrentUser();
const tasks = dataService.getTasks();
const stats = dataService.calculatePersonalStats(tasks, 'month', 'USER001');
```

---

## 8. 实现状态对比分析

### 8.1 分工说明

| 层级 | 职责 | 技术栈 |
|------|------|--------|
| **后端 (.NET8)** | 数据持久化、业务逻辑、API接口、数据库操作 | ASP.NET Core 8.0, Entity Framework Core |
| **前端服务 (apiDataService.ts)** | API调用、数据转换、前端业务逻辑、状态管理 | TypeScript, Axios |

### 8.2 功能实现状态总览

| 功能模块 | 后端API | 前端实现 | 状态 |
|----------|---------|----------|------|
| **用户管理** | | | |
| 获取用户列表 | ✅ `GET /api/users` | ✅ `getUsers()` | 已完成 |
| 获取单个用户 | ✅ `GET /api/users/{id}` | ✅ `getUser()` | 已完成 |
| 创建用户 | ✅ `POST /api/users` | ✅ `saveUser()` | 已完成 |
| 更新用户 | ✅ `PUT /api/users/{id}` | ✅ `saveUser()` | 已完成 |
| 删除用户(软删除) | ✅ `DELETE /api/users/{id}` | ✅ `deleteUser()` | 已完成 |
| 恢复用户 | ✅ `POST /api/users/{id}/restore` | ❌ 未实现 | 待实现 |
| 获取团队成员 | ✅ `GET /api/users/team/{id}` | ✅ `getTeamMembers()` | 已完成 |
| **认证授权** | | | |
| 用户登录 | ✅ `POST /api/auth/login` | ✅ `login()` | 已完成 |
| 修改密码 | ✅ `POST /api/auth/change-password` | ✅ `changePassword()` | 已完成 |
| 重置密码 | ✅ `POST /api/auth/reset-password` | ✅ `resetPassword()` | 已完成 |
| 退出登录 | - | ✅ `logout()` | 已完成 |
| 获取当前用户 | - | ✅ `getCurrentUser()` | 已完成 |
| **项目管理** | | | |
| 获取项目列表 | ✅ `GET /api/projects` | ✅ `getProjects()` | 已完成 |
| 获取单个项目 | ✅ `GET /api/projects/{id}` | ✅ `getProject()` | 已完成 |
| 创建项目 | ✅ `POST /api/projects` | ✅ `saveProject()` | 已完成 |
| 更新项目 | ✅ `PUT /api/projects/{id}` | ✅ `saveProject()` | 已完成 |
| 删除项目(软删除) | ✅ `DELETE /api/projects/{id}` | ✅ `deleteProject()` | 已完成 |
| 项目统计 | ✅ `GET /api/projects/statistics` | ❌ 未调用 | 待实现 |
| 检查项目使用中 | ✅ `GET /api/projects/{id}/in-use` | ❌ 未调用 | 待实现 |
| **任务管理** | | | |
| 获取任务列表 | ✅ `GET /api/tasks` | ✅ `getTasks()` | 已完成 |
| 获取单个任务 | ✅ `GET /api/tasks/{id}` | ✅ `getTask()` | 已完成 |
| 创建任务 | ✅ `POST /api/tasks` | ✅ `saveTask()` | 已完成 |
| 更新任务 | ✅ `PUT /api/tasks/{id}` | ✅ `saveTask()` | 已完成 |
| 删除任务(软删除) | ✅ `DELETE /api/tasks/{id}` | ✅ `deleteTask()` | 已完成 |
| 更新任务状态 | ✅ `PATCH /api/tasks/{id}/status` | ✅ `updateTaskStatus()` | 已完成 |
| 更新角色状态 | ✅ `PATCH /api/tasks/{id}/role-status` | ✅ `updateTaskRoleStatus()` | 已完成 |
| 完成所有角色 | ✅ `POST /api/tasks/{id}/complete-all` | ❌ 未实现 | 待实现 |
| 回收任务到任务库 | ✅ `POST /api/tasks/{id}/retrieve` | ❌ 未实现 | 待实现 |
| 获取个人任务 | ✅ `GET /api/tasks/personal/{id}` | ✅ `getPersonalTasks()` | 已完成 |
| 获取差旅任务 | ✅ `GET /api/tasks/travel/{id}` | ✅ `getTravelTasks()` | 已完成 |
| 获取会议任务 | ✅ `GET /api/tasks/meeting/{id}` | ✅ `getMeetingTasks()` | 已完成 |
| 检查长期任务 | ✅ `GET /api/tasks/{id}/is-long-running` | ✅ `isTaskLongRunning()` | 已完成 |
| 批量操作 | ✅ `POST /api/tasks/batch` | ❌ 未实现 | 待实现 |
| **任务分类管理** | | | |
| 获取分类列表 | ✅ `GET /api/taskclasses` | ✅ `getTaskClasses()` | 已完成 |
| 获取单个分类 | ✅ `GET /api/taskclasses/{id}` | ❌ 未实现 | 待实现 |
| 创建分类 | ✅ `POST /api/taskclasses` | ✅ `saveTaskClass()` | 已完成 |
| 更新分类 | ✅ `PUT /api/taskclasses/{id}` | ✅ `saveTaskClass()` | 已完成 |
| 删除分类(软删除) | ✅ `DELETE /api/taskclasses/{id}` | ✅ `deleteTaskClass()` | 已完成 |
| 检查分类使用 | ✅ `GET /api/taskclasses/{id}/usage` | ✅ `checkTaskClassUsage()` | 已完成 |
| 添加子分类 | ✅ `POST /api/taskclasses/{id}/categories` | ✅ `addTaskCategory()` | 已完成 |
| 删除子分类 | ✅ `DELETE /api/taskclasses/{id}/categories/{name}` | ✅ `deleteTaskCategory()` | 已完成 |
| 更新子分类名 | ✅ `PUT /api/taskclasses/{id}/categories` | ✅ `updateTaskCategory()` | 已完成 |
| 排序子分类 | ✅ `PUT /api/taskclasses/{id}/categories/order` | ✅ `reorderTaskCategories()` | 已完成 |
| **任务库管理** | | | |
| 获取任务库列表 | ✅ `GET /api/taskpool` | ✅ `getTaskPoolItems()` | 已完成 |
| 获取任务库统计 | ✅ `GET /api/taskpool/statistics` | ❌ 未调用 | 待实现 |
| 获取单个任务库项 | ✅ `GET /api/taskpool/{id}` | ✅ `getTaskPoolItem()` | 已完成 |
| 创建任务库项 | ✅ `POST /api/taskpool` | ✅ `createTaskPoolItem()` | 已完成 |
| 更新任务库项 | ✅ `PUT /api/taskpool/{id}` | ✅ `updateTaskPoolItem()` | 已完成 |
| 删除任务库项(软删除) | ✅ `DELETE /api/taskpool/{id}` | ✅ `deleteTaskPoolItem()` | 已完成 |
| 分配任务 | ✅ `POST /api/taskpool/{id}/assign` | ✅ `assignPoolItemToTask()` | 已完成 |
| 批量分配 | ✅ `POST /api/taskpool/batch-assign` | ❌ 未实现 | 待实现 |
| 复制任务库项 | ✅ `POST /api/taskpool/{id}/duplicate` | ❌ 未实现 | 待实现 |
| 从任务回收 | ✅ `POST /api/taskpool/retrieve/{taskId}` | ❌ 未实现 | 待实现 |
| **系统设置** | | | |
| 机型管理(CRUD) | ✅ `/api/settings/equipment-models` | ✅ | 已完成 |
| 容量等级管理(CRUD) | ✅ `/api/settings/capacity-levels` | ✅ | 已完成 |
| 差旅标签管理(CRUD) | ✅ `/api/settings/travel-labels` | ✅ | 已完成 |
| 用户头像管理(CRUD) | ✅ `/api/settings/avatars/{id}` | ✅ | 已完成 |
| 任务分类配置 | ✅ `/api/settings/task-categories` | ✅ | 已完成 |
| 重置所有数据 | ✅ `POST /api/settings/reset-all-data` | ❌ 未实现 | 待实现 |
| 刷新任务数据 | ✅ `POST /api/settings/refresh-tasks` | ❌ 未实现 | 待实现 |
| 数据迁移 | ✅ `POST /api/settings/migrate` | ❌ 未实现 | 待实现 |
| **统计报表** | | | |
| 获取仪表板统计 | ✅ `GET /api/statistics/dashboard` | ✅ `getDashboardStatistics()` | 已完成 |
| 获取个人统计 | ✅ `GET /api/statistics/personal` | ❌ 未调用 | 待实现 |
| 获取团队统计 | ✅ `GET /api/statistics/team` | ❌ 未调用 | 待实现 |
| 获取工作量分布 | ✅ `GET /api/statistics/workload` | ❌ 未调用 | 待实现 |
| 获取月度趋势 | ✅ `GET /api/statistics/trend/monthly` | ✅ `calculateMonthlyTrend()` | 已完成 |
| 获取日趋势 | ✅ `GET /api/statistics/trend/daily` | ✅ `calculateDailyTrend()` | 已完成 |
| 获取拖延任务 | ✅ `GET /api/statistics/delayed` | ❌ 未调用 | 待实现 |
| 获取逾期任务 | ✅ `GET /api/statistics/overdue` | ❌ 未调用 | 待实现 |
| 获取差旅统计 | ✅ `GET /api/statistics/travel` | ❌ 未调用 | 待实现 |
| 获取会议统计 | ✅ `GET /api/statistics/meeting` | ❌ 未调用 | 待实现 |
| 获取工作日信息 | ✅ `GET /api/statistics/workdays` | ❌ 未调用 | 待实现 |
| **前端辅助功能** | | | |
| 生成统计CSV | - | ✅ `generateStatsCSV()` | 前端实现 |
| 下载CSV文件 | - | ✅ `downloadStatsCSV()` | 前端实现 |
| 计算个人统计 | - | ✅ `calculatePersonalStats()` | 前端实现 |
| 按角色状态分离任务 | - | ✅ `separateTasksByRoleStatus()` | 前端实现 |
| 按周期筛选任务 | - | ✅ `filterTasksByStartDate()` | 前端实现 |
| 生成唯一ID | - | ✅ `generateId()` | 前端实现 |
| 健康检查 | ✅ `GET /api/health` | ✅ `healthCheck()` | 已完成 |

### 8.3 后端API清单

#### 用户控制器 (UsersController)
- `GET /api/users` - 获取用户列表
- `GET /api/users/{userId}` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/{userId}` - 更新用户
- `DELETE /api/users/{userId}` - 软删除用户
- `POST /api/users/{userId}/restore` - 恢复用户
- `GET /api/users/team/{currentUserId}` - 获取团队成员

#### 认证控制器 (AuthController)
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/change-password` - 修改密码
- `POST /api/auth/reset-password` - 重置密码

#### 项目控制器 (ProjectsController)
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/statistics` - 获取项目统计
- `GET /api/projects/{id}` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/{id}` - 更新项目
- `DELETE /api/projects/{id}` - 软删除项目
- `GET /api/projects/{id}/in-use` - 检查项目使用中

#### 任务控制器 (TasksController)
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/{taskId}` - 获取单个任务
- `POST /api/tasks` - 创建任务
- `PUT /api/tasks/{taskId}` - 更新任务
- `DELETE /api/tasks/{taskId}` - 软删除任务
- `PATCH /api/tasks/{taskId}/status` - 更新任务状态
- `PATCH /api/tasks/{taskId}/role-status` - 更新角色状态
- `POST /api/tasks/{taskId}/complete-all` - 完成所有角色
- `POST /api/tasks/{taskId}/retrieve` - 回收任务到任务库
- `GET /api/tasks/personal/{userId}` - 获取个人任务
- `GET /api/tasks/travel/{userId}` - 获取差旅任务
- `GET /api/tasks/meeting/{userId}` - 获取会议任务
- `GET /api/tasks/{taskId}/is-long-running` - 检查长期任务
- `POST /api/tasks/batch` - 批量操作

#### 任务分类控制器 (TaskClassesController)
- `GET /api/taskclasses` - 获取分类列表
- `GET /api/taskclasses/{id}` - 获取单个分类
- `POST /api/taskclasses` - 创建分类
- `PUT /api/taskclasses/{id}` - 更新分类
- `DELETE /api/taskclasses/{id}` - 软删除分类
- `GET /api/taskclasses/{id}/usage` - 检查使用情况
- `POST /api/taskclasses/{id}/categories` - 添加子分类
- `DELETE /api/taskclasses/{id}/categories/{name}` - 删除子分类
- `PUT /api/taskclasses/{id}/categories` - 更新子分类名
- `PUT /api/taskclasses/{id}/categories/order` - 排序子分类

#### 任务库控制器 (TaskPoolController)
- `GET /api/taskpool` - 获取任务库列表
- `GET /api/taskpool/statistics` - 获取统计
- `GET /api/taskpool/{id}` - 获取单个任务库项
- `POST /api/taskpool` - 创建任务库项
- `PUT /api/taskpool/{id}` - 更新任务库项
- `DELETE /api/taskpool/{id}` - 软删除任务库项
- `POST /api/taskpool/{id}/assign` - 分配任务
- `POST /api/taskpool/batch-assign` - 批量分配
- `POST /api/taskpool/{id}/duplicate` - 复制任务库项
- `POST /api/taskpool/retrieve/{taskId}` - 从任务回收

#### 设置控制器 (SettingsController)
- `GET/POST/DELETE /api/settings/equipment-models` - 机型管理
- `GET/POST/DELETE /api/settings/capacity-levels` - 容量等级管理
- `GET/POST/DELETE /api/settings/travel-labels` - 差旅标签管理
- `GET/POST/DELETE /api/settings/avatars/{userId}` - 用户头像管理
- `GET/PUT /api/settings/task-categories` - 任务分类配置
- `POST /api/settings/reset-all-data` - 重置所有数据
- `POST /api/settings/refresh-tasks` - 刷新任务数据
- `POST /api/settings/migrate` - 数据迁移

#### 统计控制器 (StatisticsController)
- `GET /api/statistics/personal` - 获取个人统计
- `GET /api/statistics/personal/tasks` - 获取个人任务
- `GET /api/statistics/team` - 获取团队统计
- `GET /api/statistics/workload` - 获取工作量分布
- `GET /api/statistics/trend/monthly` - 获取月度趋势
- `GET /api/statistics/trend/daily` - 获取日趋势
- `GET /api/statistics/delayed` - 获取拖延任务
- `GET /api/statistics/overdue` - 获取逾期任务
- `GET /api/statistics/travel` - 获取差旅统计
- `GET /api/statistics/meeting` - 获取会议统计
- `GET /api/statistics/workdays` - 获取工作日信息

### 8.4 待实现功能清单

#### 前端待实现
1. 恢复用户功能 (`restoreUser`)
2. 项目统计调用 (`getProjectStatistics`)
3. 检查项目使用中 (`isProjectInUse`)
4. 完成所有角色功能 (`completeAllRoles`)
5. 回收任务到任务库 (`retrieveTaskToPool`)
6. 批量操作任务 (`batchOperation`)
7. 任务库统计调用 (`getTaskPoolStatistics`)
8. 批量分配任务 (`batchAssignPoolItem`)
9. 复制任务库项 (`duplicatePoolItem`)
10. 从任务回收 (`retrieveFromTask`)
11. 重置所有数据 (`resetAllData`)
12. 刷新任务数据 (`refreshTasks`)
13. 数据迁移 (`migrateData`)
14. 个人统计API调用 (`getPersonalStats`)
15. 团队统计调用 (`getTeamStats`)
16. 工作量分布调用 (`getWorkloadDistribution`)
17. 拖延任务调用 (`getDelayedTasks`)
18. 逾期任务调用 (`getOverdueTasks`)
19. 差旅统计调用 (`getTravelStatistics`)
20. 会议统计调用 (`getMeetingStatistics`)
21. 工作日信息调用 (`getWorkDays`)

### 8.5 技术架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React + TypeScript)              │
├─────────────────────────────────────────────────────────────┤
│  apiDataService.ts         │  dataService.ts (已废弃)        │
│  - API调用封装              │  - localStorage存储             │
│  - 数据转换                 │  - 本地业务逻辑                 │
│  - 前端业务逻辑             │  - 种子数据                     │
└────────────────────────────┴─────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    后端 (.NET8 ASP.NET Core)                 │
├─────────────────────────────────────────────────────────────┤
│  Controllers                 │  Services                      │
│  - UsersController           │  - UserService                 │
│  - AuthController            │  - ProjectService              │
│  - ProjectsController        │  - TaskService                 │
│  - TasksController           │  - TaskClassService            │
│  - TaskClassesController     │  - TaskPoolService             │
│  - TaskPoolController        │  - StatisticsService           │
│  - SettingsController        │  - SettingsService             │
│  - StatisticsController      │                                │
└────────────────────────────┴─────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据库 (Entity Framework Core)            │
│  - Users (用户)                                             │
│  - Projects (项目)                                          │
│  - TaskItems (任务)                                         │
│  - TaskClasses (任务分类)                                   │
│  - TaskPoolItems (任务库)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. 注意事项

1. **已废弃**: `dataService.ts` 已标记为 `@deprecated`，新功能应使用 `apiDataService`
2. **数据持久化**: 所有数据通过后端 API 存储到数据库，不再使用 localStorage
3. **API可用性检测**: `apiDataService` 包含 `healthCheck()` 方法检测后端连通性
4. **软删除机制**: 后端和前端均采用软删除 (`is_deleted` 字段)
5. **角色状态**: 任务支持四种角色状态 (assignee/checker/chiefDesigner/approver)
