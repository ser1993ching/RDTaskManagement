# R&D Task Management System - API 文档

> 研发团队任务管理系统 - 后端 API 接口文档

## 文档概述

本文档为研发团队任务管理系统的后端 API 接口说明文档，旨在帮助后端开发人员快速理解和实现各个模块的接口。

## API 版本

- **当前版本**: v1.0
- **基础路径**: `/api`
- **数据格式**: JSON
- **字符编码**: UTF-8

## 快速开始

### 基础请求示例

```bash
# 获取用户列表
GET /api/users

# 用户登录
POST /api/auth/login
Content-Type: application/json

{
  "userId": "admin",
  "password": "admin"
}

# 获取任务列表（带分页）
GET /api/tasks?page=1&pageSize=20&status=进行中
```

### 响应格式

所有 API 响应均采用统一格式：

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

---

## 模块概览

| 模块 | 文档 | 描述 |
|------|------|------|
| 认证模块 | [01-authentication.md](./01-authentication.md) | 用户登录、登出、会话管理、密码管理 |
| 用户管理 | [02-users.md](./02-users.md) | 团队成员的增删改查 |
| 项目管理 | [03-projects.md](./03-projects.md) | 项目信息的增删改查及统计 |
| 任务管理 | [04-tasks.md](./04-tasks.md) | 任务的完整生命周期管理 |
| 任务类别 | [05-task-classes.md](./05-task-classes.md) | 任务类别和二级分类管理 |
| 任务库 | [06-task-pool.md](./06-task-pool.md) | 计划任务管理和任务分配 |
| 统计与工作台 | [07-statistics.md](./07-statistics.md) | 个人/团队统计、数据导出 |
| 系统设置 | [08-settings.md](./08-settings.md) | 机型、容量等级、差旅标签等配置 |

---

## HTTP 状态码

| 状态码 | 描述 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容） |
| 400 | 请求参数错误 |
| 401 | 未授权（登录失效） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如ID已存在） |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

---

## 通用查询参数

以下参数在列表查询接口中通用：

| 参数名 | 类型 | 描述 |
|--------|------|------|
| page | number | 页码，从1开始 |
| pageSize | number | 每页数量，默认20 |
| search | string | 搜索关键词 |
| includeDeleted | boolean | 是否包含已删除数据，默认false |
| sortBy | string | 排序字段 |
| sortOrder | string | 排序方向（asc/desc） |

---

## 认证与授权

### 登录状态

系统使用 session/cookie 机制管理用户登录状态。登录成功后，后续请求会自动携带登录信息。

### 权限角色

| 角色 | 描述 | 权限级别 |
|------|------|----------|
| 组员 | 普通团队成员 | 仅能访问自己的数据 |
| 班组长 | 班组负责人 | 可访问本班组数据 |
| 管理员 | 系统管理员 | 可访问全部数据 |

### 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin | 管理员 |
| LEADER001 | 123 | 班组长（张组长） |
| USER001 | 123 | 组员（李研发） |

---

## 枚举值参考

### SystemRole (系统角色)

```json
["组员", "班组长", "管理员"]
```

### OfficeLocation (工作地点)

```json
["成都", "德阳"]
```

### PersonnelStatus (在岗状态)

```json
["在岗", "借调", "外借", "实习", "离岗"]
```

### ProjectCategory (项目类型)

```json
["市场配合项目", "常规项目", "核电项目", "科研项目", "改造项目", "其他项目"]
```

### TaskStatus (任务状态)

```json
["未开始", "编制中", "修改中", "校核中", "审查中", "已完成"]
```

### RoleStatus (角色状态)

```json
["未开始", "进行中", "修改中", "驳回中", "已完成"]
```

### Period (时间周期)

```json
["week", "month", "quarter", "halfYear", "year", "yearAndHalf"]
```

---

## 数据模型关联图

```
User (用户)
  ├── 创建 Project (项目)
  ├── 创建 Task (任务)
  └── 被分配为 Task 的角色 (负责人/校核人/主任设计/审查人)

Project (项目)
  └── 关联多个 Task (任务)

Task (任务)
  ├── 属于一个 TaskClass (任务类别)
  ├── 可关联一个 Project (项目)
  └── 有多个角色 (负责人、校核人、主任设计、审查人)

TaskClass (任务类别)
  └── 包含多个 TaskCategory (二级分类)

TaskPoolItem (计划任务)
  └── 分配后转化为 Task (任务)
```

---

## 数据库Schema设计

以下是后端数据库表结构设计建议（SQL标准格式）：

### 1. 用户表 (users)

```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY COMMENT '工号，主键',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    system_role ENUM('组员', '班组长', '管理员') NOT NULL DEFAULT '组员' COMMENT '系统角色',
    office_location ENUM('成都', '德阳') NOT NULL COMMENT '工作地点',
    title VARCHAR(100) COMMENT '职称',
    join_date DATE COMMENT '参加工作时间',
    status ENUM('在岗', '借调', '外借', '实习', '离岗') NOT NULL DEFAULT '在岗' COMMENT '在岗状态',
    education VARCHAR(50) COMMENT '学历',
    school VARCHAR(200) COMMENT '毕业院校',
    password_hash VARCHAR(255) COMMENT '密码哈希（生产环境）',
    remark TEXT COMMENT '备注',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (system_role),
    INDEX idx_location (office_location),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2. 项目表 (projects)

```sql
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY COMMENT '项目ID，主键',
    name VARCHAR(200) NOT NULL COMMENT '项目名称',
    category ENUM('市场配合项目', '常规项目', '核电项目', '科研项目', '改造项目', '其他项目') NOT NULL COMMENT '项目类型',
    work_no VARCHAR(100) COMMENT '工作号',
    capacity VARCHAR(50) COMMENT '容量等级',
    model VARCHAR(100) COMMENT '机型',
    is_won BOOLEAN DEFAULT FALSE COMMENT '是否中标（市场配合项目）',
    is_foreign BOOLEAN DEFAULT FALSE COMMENT '是否外贸（市场配合项目）',
    start_date DATE COMMENT '开始日期',
    end_date DATE COMMENT '截止/首台投运日期',
    is_commissioned BOOLEAN DEFAULT FALSE COMMENT '是否已投运（常规/核电项目）',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否已完成（科研/改造/其他项目）',
    is_key_project BOOLEAN DEFAULT FALSE COMMENT '是否重点项目',
    remark TEXT COMMENT '备注',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';
```

### 3. 任务表 (tasks)

```sql
CREATE TABLE tasks (
    task_id VARCHAR(50) PRIMARY KEY COMMENT '任务ID，主键',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    task_class_id VARCHAR(20) NOT NULL COMMENT '任务类别ID（关联task_classes.id）',
    category VARCHAR(50) NOT NULL COMMENT '二级分类',
    project_id VARCHAR(50) COMMENT '关联项目ID（关联projects.id）',
    assignee_id VARCHAR(50) COMMENT '负责人ID（关联users.user_id）',
    assignee_name VARCHAR(100) COMMENT '负责人姓名（非系统用户时使用）',
    start_date DATE COMMENT '开始日期',
    due_date DATE COMMENT '截止日期',
    completed_date DATETIME COMMENT '完成日期',
    status ENUM('未开始', '编制中', '修改中', '校核中', '审查中', '已完成') NOT NULL DEFAULT '未开始' COMMENT '任务状态',
    workload DECIMAL(10,2) COMMENT '预估工作量（小时）',
    difficulty DECIMAL(3,2) DEFAULT 1.0 COMMENT '难度系数（0.5-3.0）',
    remark TEXT COMMENT '备注',
    created_date DATETIME NOT NULL COMMENT '创建日期',
    created_by VARCHAR(50) NOT NULL COMMENT '创建人ID（关联users.user_id）',
    -- 差旅任务字段
    travel_location VARCHAR(200) COMMENT '出差地点（差旅任务）',
    travel_duration DECIMAL(5,1) COMMENT '出差天数（差旅任务）',
    travel_label VARCHAR(50) COMMENT '差旅标签（差旅任务）',
    -- 会议任务字段
    meeting_duration DECIMAL(5,1) COMMENT '会议时长（小时，会议任务）',
    participants JSON COMMENT '参会人员ID列表（会议任务）',
    participant_names JSON COMMENT '参会人员姓名列表（会议任务）',
    -- 市场任务字段
    capacity_level VARCHAR(50) COMMENT '容量等级（市场配合任务）',
    -- 校核人
    checker_id VARCHAR(50) COMMENT '校核人ID',
    checker_name VARCHAR(100) COMMENT '校核人姓名',
    checker_workload DECIMAL(10,2) COMMENT '校核工作量',
    checker_status ENUM('未开始', '进行中', '修改中', '驳回中', '已完成') COMMENT '校核人状态',
    -- 主任设计
    chief_designer_id VARCHAR(50) COMMENT '主任设计ID',
    chief_designer_name VARCHAR(100) COMMENT '主任设计姓名',
    chief_designer_workload DECIMAL(10,2) COMMENT '主任设计工作量',
    chief_designer_status ENUM('未开始', '进行中', '修改中', '驳回中', '已完成') COMMENT '主任设计状态',
    -- 审查人
    approver_id VARCHAR(50) COMMENT '审查人ID',
    approver_name VARCHAR(100) COMMENT '审查人姓名',
    approver_workload DECIMAL(10,2) COMMENT '审查工作量',
    approver_status ENUM('未开始', '进行中', '修改中', '驳回中', '已完成') COMMENT '审查人状态',
    -- 负责人状态
    assignee_status ENUM('未开始', '进行中', '修改中', '驳回中', '已完成') COMMENT '负责人状态',
    -- 其他字段
    is_force_assessment BOOLEAN DEFAULT FALSE COMMENT '是否强制考核',
    is_in_pool BOOLEAN DEFAULT FALSE COMMENT '是否在任务库中',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_class (task_class_id),
    INDEX idx_project (project_id),
    INDEX idx_assignee (assignee_id),
    INDEX idx_checker (checker_id),
    INDEX idx_approver (approver_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, due_date, completed_date),
    INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';
```

### 4. 任务类别表 (task_classes)

```sql
CREATE TABLE task_classes (
    id VARCHAR(20) PRIMARY KEY COMMENT '类别ID，主键（如TC001）',
    name VARCHAR(100) NOT NULL COMMENT '类别名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '类别代码（如MARKET）',
    description TEXT COMMENT '类别描述',
    notice TEXT COMMENT '自定义提示文字',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务类别表';
```

### 5. 二级分类配置表 (task_categories)

```sql
CREATE TABLE task_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_class_code VARCHAR(50) NOT NULL COMMENT '任务类别代码（关联task_classes.code）',
    category_name VARCHAR(100) NOT NULL COMMENT '二级分类名称',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_class_name (task_class_code, category_name),
    INDEX idx_class_code (task_class_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二级分类配置表';
```

### 6. 任务库表 (task_pool)

```sql
CREATE TABLE task_pool (
    id VARCHAR(50) PRIMARY KEY COMMENT '计划任务ID，主键',
    task_name VARCHAR(200) NOT NULL COMMENT '任务名称',
    task_class_id VARCHAR(20) NOT NULL COMMENT '任务类别ID',
    category VARCHAR(50) NOT NULL COMMENT '二级分类',
    project_id VARCHAR(50) COMMENT '关联项目ID',
    project_name VARCHAR(200) COMMENT '关联项目名称（冗余存储）',
    person_in_charge_id VARCHAR(50) COMMENT '计划负责人ID',
    person_in_charge_name VARCHAR(100) COMMENT '计划负责人姓名',
    checker_id VARCHAR(50) COMMENT '计划校核人ID',
    checker_name VARCHAR(100) COMMENT '计划校核人姓名',
    chief_designer_id VARCHAR(50) COMMENT '计划主任设计ID',
    chief_designer_name VARCHAR(100) COMMENT '计划主任设计姓名',
    approver_id VARCHAR(50) COMMENT '计划审查人ID',
    approver_name VARCHAR(100) COMMENT '计划审查人姓名',
    start_date DATE COMMENT '计划开始日期',
    due_date DATE COMMENT '计划截止日期',
    created_by VARCHAR(50) NOT NULL COMMENT '创建人ID',
    created_by_name VARCHAR(100) COMMENT '创建人姓名',
    created_date DATE NOT NULL COMMENT '创建日期',
    is_force_assessment BOOLEAN DEFAULT FALSE COMMENT '是否强制考核',
    remark TEXT COMMENT '备注',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '软删除标记',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_class (task_class_id),
    INDEX idx_project (project_id),
    INDEX idx_person_in_charge (person_in_charge_id),
    INDEX idx_dates (start_date, due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务库表';
```

### 7. 系统配置表 (settings)

```sql
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    setting_value TEXT COMMENT '配置值（JSON格式）',
    setting_type VARCHAR(50) DEFAULT 'string' COMMENT '配置类型（string/json/array）',
    description VARCHAR(200) COMMENT '配置描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';
```

### ER图关系

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │──────▶│  projects   │◀──────│    tasks    │
│─────────────│       │─────────────│       │─────────────│
│ user_id (PK)│       │ id (PK)     │       │ task_id (PK)│
│             │       │             │       │             │
└─────────────┘       └─────────────┘       │ project_id  │──┐
      │                                        assignee_id │  │
      │                                        checker_id  │  │
      │                                        approver_id │  │
      │                                        created_by  │  │
      │                                              ▲     │  │
      │                                              │     │  │
      │                                        ┌─────┴─────┴─────┐
      │                                        │  task_classes   │
      │                                        │─────────────────│
      │                                        │ id (PK)         │
      │                                        │ code (UNIQUE)   │
      │                                        └─────────────────┘
      │                                              │
      │                                        ┌─────┴─────┐
      │                                        │task_categories
      │                                        │─────────────│
      │                                        │ id (PK)    │
      │                                        │ task_class_│
      │                                        │    code    │
      │                                        └─────────────┘
      │
      │◀────────────────────────────────────────┐
      │                                         │
      │                                    ┌────┴─────┐
      │                                    │task_pool │
      │                                    │──────────│
      │                                    │id (PK)   │
      │                                    │created_by│
      │                                    └──────────┘
```

---

## TypeScript接口定义（完整）

### 核心数据模型

```typescript
// === 枚举定义 ===

export enum SystemRole {
  MEMBER = '组员',
  LEADER = '班组长',
  ADMIN = '管理员'
}

export enum OfficeLocation {
  CHENGDU = '成都',
  DEYANG = '德阳'
}

export enum PersonnelStatus {
  ACTIVE = '在岗',
  BORROWED_IN = '借调',
  BORROWED_OUT = '外借',
  INTERN = '实习',
  LEAVE = '离岗'
}

export enum ProjectCategory {
  MARKET = '市场配合项目',
  EXECUTION = '常规项目',
  NUCLEAR = '核电项目',
  RESEARCH = '科研项目',
  RENOVATION = '改造项目',
  OTHER = '其他项目'
}

export enum TaskStatus {
  NOT_STARTED = '未开始',
  DRAFTING = '编制中',
  REVISING = '修改中',
  REVIEWING = '校核中',
  REVIEWING2 = '审查中',
  COMPLETED = '已完成'
}

export enum RoleStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  REVISING = '修改中',
  REJECTED = '驳回中',
  COMPLETED = '已完成'
}

export type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'yearAndHalf';

// === 接口定义 ===

export interface User {
  UserID: string;           // 工号 (PK)
  Name: string;
  SystemRole: SystemRole;
  OfficeLocation: OfficeLocation;
  Title?: string;
  JoinDate?: string;        // 参加工作时间 (YYYY-MM-DD)
  Status: PersonnelStatus;
  Education?: string;
  School?: string;
  Password?: string;        // 生产环境应加密存储
  Remark?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;               // 项目ID (PK)
  name: string;
  category: ProjectCategory;
  workNo?: string;          // 工作号
  capacity?: string;        // 容量等级
  model?: string;           // 机型
  isWon?: boolean;          // 是否中标 (市场配合项目)
  isForeign?: boolean;      // 是否外贸 (市场配合项目)
  startDate?: string;       // 开始日期
  endDate?: string;         // 截止/首台投运日期
  remark?: string;
  isCommissioned?: boolean; // 是否已投运 (常规/核电项目)
  isCompleted?: boolean;    // 是否已完成 (科研/改造/其他)
  isKeyProject?: boolean;   // 是否重点项目
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  // 核心字段
  TaskID: string;           // 任务ID (PK)
  TaskName: string;
  TaskClassID: string;      // 关联任务类别ID
  Category: string;         // 二级分类
  ProjectID?: string;       // 关联项目ID
  AssigneeID?: string;      // 负责人ID
  AssigneeName?: string;    // 负责人姓名（非系统用户）
  StartDate?: string;       // 开始日期
  DueDate?: string;         // 截止日期
  CompletedDate?: string;   // 完成日期
  Status: TaskStatus;
  Workload?: number;        // 预估工作量（小时）
  Difficulty?: number;      // 难度系数（0.5-3.0）
  Remark?: string;
  CreatedDate: string;      // 创建日期
  CreatedBy: string;        // 创建人ID

  // 差旅任务字段 (TC009)
  TravelLocation?: string;  // 出差地点
  TravelDuration?: number;  // 出差天数
  TravelLabel?: string;     // 差旅标签

  // 会议任务字段 (TC007)
  MeetingDuration?: number; // 会议时长（小时）
  Participants?: string[];  // 参会人员ID列表
  ParticipantNames?: string[]; // 参会人员姓名列表

  // 市场任务字段
  CapacityLevel?: string;   // 容量等级

  // 校核人（Checker）
  CheckerID?: string;
  CheckerName?: string;
  CheckerWorkload?: number;
  checkerStatus?: RoleStatus;

  // 主任设计（ChiefDesigner）
  ChiefDesignerID?: string;
  ChiefDesignerName?: string;
  ChiefDesignerWorkload?: number;
  chiefDesignerStatus?: RoleStatus;

  // 审查人（Approver）
  ApproverID?: string;
  ApproverName?: string;
  ApproverWorkload?: number;
  approverStatus?: RoleStatus;

  // 负责人状态
  assigneeStatus?: RoleStatus;

  // 其他字段
  isForceAssessment?: boolean; // 是否强制考核
  is_in_pool?: boolean;      // 是否在任务库中
  is_deleted?: boolean;

  // 已废弃字段（兼容旧数据）
  ReviewerID?: string;       // @deprecated
  ReviewerID2?: string;      // @deprecated
  ReviewerName?: string;     // @deprecated
  Reviewer2Name?: string;    // @deprecated
  ReviewerWorkload?: number; // @deprecated
  Reviewer2Workload?: number; // @deprecated
}

export interface TaskClass {
  id: string;               // 类别ID (PK)，如 TC001
  name: string;             // 类别名称
  code: string;             // 类别代码，如 MARKET
  description?: string;
  notice?: string;          // 自定义提示文字
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TaskCategory {
  id: number;               // 主键
  taskClassCode: string;    // 关联任务类别代码
  categoryName: string;     // 二级分类名称
  sortOrder: number;        // 排序顺序
  created_at?: string;
}

export interface TaskPoolItem {
  id: string;               // 计划任务ID (PK)
  TaskName: string;
  TaskClassID: string;
  Category: string;
  ProjectID?: string;
  ProjectName?: string;
  PersonInChargeID?: string;
  PersonInChargeName?: string;
  CheckerID?: string;
  CheckerName?: string;
  ChiefDesignerID?: string;
  ChiefDesignerName?: string;
  ApproverID?: string;
  ApproverName?: string;
  StartDate?: string;
  DueDate?: string;
  CreatedBy: string;
  CreatedByName?: string;
  CreatedDate: string;
  isForceAssessment?: boolean;
  Remark?: string;
  is_deleted?: boolean;
}

// === 统计相关接口 ===

export interface PersonalStats {
  inProgressCount: number;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  completionRate: number;
  categoryDistribution: { name: string; count: number; percentage: number }[];
  travelStats: { totalDays: number; workHoursInPeriod: number; percentage: number };
  meetingStats: { totalHours: number; workHoursInPeriod: number; percentage: number };
  monthlyTrend: { month: string; assigned: number; completed: number }[];
}

export interface SeparatedTasks {
  inProgress: Task[];
  pending: Task[];
  completed: Task[];
}

export interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  byUser: { userId: string; userName: string; totalCount: number; completedCount: number; completionRate: number; workload: number }[];
  byCategory: { name: string; count: number; percentage: number }[];
  overdueTasks: Task[];
  longRunningTasks: Task[];
}

// === 请求/响应类型 ===

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
```

---

## C# 模型类定义（.NET）

### 核心枚举定义

```csharp
namespace R&DTaskSystem.Domain.Enums
{
    /// <summary>
    /// 系统角色
    /// </summary>
    public enum SystemRole
    {
        [Display(Name = "组员")]
        Member = 0,

        [Display(Name = "班组长")]
        Leader = 1,

        [Display(Name = "管理员")]
        Admin = 2
    }

    /// <summary>
    /// 工作地点
    /// </summary>
    public enum OfficeLocation
    {
        [Display(Name = "成都")]
        Chengdu = 0,

        [Display(Name = "德阳")]
        Deyang = 1
    }

    /// <summary>
    /// 在岗状态
    /// </summary>
    public enum PersonnelStatus
    {
        [Display(Name = "在岗")]
        Active = 0,

        [Display(Name = "借调")]
        BorrowedIn = 1,

        [Display(Name = "外借")]
        BorrowedOut = 2,

        [Display(Name = "实习")]
        Intern = 3,

        [Display(Name = "离岗")]
        Leave = 4
    }

    /// <summary>
    /// 项目类型
    /// </summary>
    public enum ProjectCategory
    {
        [Display(Name = "市场配合项目")]
        Market = 0,

        [Display(Name = "常规项目")]
        Execution = 1,

        [Display(Name = "核电项目")]
        Nuclear = 2,

        [Display(Name = "科研项目")]
        Research = 3,

        [Display(Name = "改造项目")]
        Renovation = 4,

        [Display(Name = "其他项目")]
        Other = 5
    }

    /// <summary>
    /// 任务状态
    /// </summary>
    public enum TaskStatus
    {
        [Display(Name = "未开始")]
        NotStarted = 0,

        [Display(Name = "编制中")]
        Drafting = 1,

        [Display(Name = "修改中")]
        Revising = 2,

        [Display(Name = "校核中")]
        Reviewing = 3,

        [Display(Name = "审查中")]
        Reviewing2 = 4,

        [Display(Name = "已完成")]
        Completed = 5
    }

    /// <summary>
    /// 角色状态（负责人、校核人、主任设计、审查人共用）
    /// </summary>
    public enum RoleStatus
    {
        [Display(Name = "未开始")]
        NotStarted = 0,

        [Display(Name = "进行中")]
        InProgress = 1,

        [Display(Name = "修改中")]
        Revising = 2,

        [Display(Name = "驳回中")]
        Rejected = 3,

        [Display(Name = "已完成")]
        Completed = 4
    }

    /// <summary>
    /// 时间周期
    /// </summary>
    public enum Period
    {
        Week = 0,
        Month = 1,
        Quarter = 2,
        HalfYear = 3,
        Year = 4,
        YearAndHalf = 5
    }
}
```

### 实体类定义

```csharp
namespace R&DTaskSystem.Domain.Entities
{
    /// <summary>
    /// 用户实体
    /// </summary>
    public class User : BaseEntity<string>
    {
        public string UserID { get; set; } = string.Empty;  // 工号 (PK)
        public string Name { get; set; } = string.Empty;
        public SystemRole SystemRole { get; set; }
        public OfficeLocation OfficeLocation { get; set; }
        public string? Title { get; set; }                   // 职称
        public DateTime? JoinDate { get; set; }              // 参加工作时间
        public PersonnelStatus Status { get; set; }
        public string? Education { get; set; }
        public string? School { get; set; }
        public string? PasswordHash { get; set; }            // 密码哈希
        public string? Remark { get; set; }

        // 导航属性
        public virtual ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
        public virtual ICollection<Task> AssignedTasks { get; set; } = new List<Task>();
        public virtual ICollection<Task> CheckerTasks { get; set; } = new List<Task>();
        public virtual ICollection<Task> ChiefDesignerTasks { get; set; } = new List<Task>();
        public virtual ICollection<Task> ApproverTasks { get; set; } = new List<Task>();
    }

    /// <summary>
    /// 项目实体
    /// </summary>
    public class Project : BaseEntity<string>
    {
        public string Id { get; set; } = string.Empty;  // 项目ID (PK)
        public string Name { get; set; } = string.Empty;
        public ProjectCategory Category { get; set; }
        public string? WorkNo { get; set; }             // 工作号
        public string? Capacity { get; set; }           // 容量等级
        public string? Model { get; set; }              // 机型
        public bool IsWon { get; set; }                 // 是否中标（市场配合项目）
        public bool IsForeign { get; set; }             // 是否外贸（市场配合项目）
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }          // 截止/首台投运日期
        public bool IsCommissioned { get; set; }        // 是否已投运（常规/核电项目）
        public bool IsCompleted { get; set; }           // 是否已完成（科研/改造/其他）
        public bool IsKeyProject { get; set; }          // 是否重点项目
        public string? Remark { get; set; }

        // 导航属性
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }

    /// <summary>
    /// 任务实体
    /// </summary>
    public class Task : BaseEntity<string>
    {
        public string TaskID { get; set; } = string.Empty;  // 任务ID (PK)
        public string TaskName { get; set; } = string.Empty;
        public string TaskClassID { get; set; }             // 关联任务类别ID
        public string Category { get; set; }                // 二级分类
        public string? ProjectID { get; set; }              // 关联项目ID
        public string? AssigneeID { get; set; }             // 负责人ID
        public string? AssigneeName { get; set; }           // 负责人姓名（非系统用户）
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public TaskStatus Status { get; set; }
        public decimal? Workload { get; set; }              // 预估工作量（小时）
        public decimal? Difficulty { get; set; }            // 难度系数（0.5-3.0）
        public string? Remark { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;

        // 差旅任务字段 (TC009)
        public string? TravelLocation { get; set; }         // 出差地点
        public decimal? TravelDuration { get; set; }        // 出差天数
        public string? TravelLabel { get; set; }            // 差旅标签

        // 会议任务字段 (TC007)
        public decimal? MeetingDuration { get; set; }       // 会议时长（小时）
        public string? Participants { get; set; }           // JSON: 参会人员ID列表
        public string? ParticipantNames { get; set; }       // JSON: 参会人员姓名列表

        // 市场任务字段
        public string? CapacityLevel { get; set; }          // 容量等级

        // 校核人（Checker）
        public string? CheckerID { get; set; }
        public string? CheckerName { get; set; }
        public decimal? CheckerWorkload { get; set; }
        public RoleStatus? CheckerStatus { get; set; }

        // 主任设计（ChiefDesigner）
        public string? ChiefDesignerID { get; set; }
        public string? ChiefDesignerName { get; set; }
        public decimal? ChiefDesignerWorkload { get; set; }
        public RoleStatus? ChiefDesignerStatus { get; set; }

        // 审查人（Approver）
        public string? ApproverID { get; set; }
        public string? ApproverName { get; set; }
        public decimal? ApproverWorkload { get; set; }
        public RoleStatus? ApproverStatus { get; set; }

        // 负责人状态
        public RoleStatus? AssigneeStatus { get; set; }

        // 其他字段
        public bool IsForceAssessment { get; set; }        // 是否强制考核
        public bool IsInPool { get; set; }                 // 是否在任务库中

        // 导航属性
        public virtual User? Assignee { get; set; }
        public virtual User? Checker { get; set; }
        public virtual User? ChiefDesigner { get; set; }
        public virtual User? Approver { get; set; }
        public virtual User? Creator { get; set; }
        public virtual Project? Project { get; set; }
        public virtual TaskClass? TaskClass { get; set; }
    }

    /// <summary>
    /// 任务类别实体
    /// </summary>
    public class TaskClass : BaseEntity<string>
    {
        public string Id { get; set; } = string.Empty;    // 类别ID (PK)，如 TC001
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;  // 类别代码，如 MARKET
        public string? Description { get; set; }
        public string? Notice { get; set; }               // 自定义提示文字

        // 导航属性
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }

    /// <summary>
    /// 任务库实体
    /// </summary>
    public class TaskPoolItem : BaseEntity<string>
    {
        public string Id { get; set; } = string.Empty;    // 计划任务ID (PK)
        public string TaskName { get; set; } = string.Empty;
        public string TaskClassID { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ProjectID { get; set; }
        public string? ProjectName { get; set; }
        public string? PersonInChargeID { get; set; }
        public string? PersonInChargeName { get; set; }
        public string? CheckerID { get; set; }
        public string? CheckerName { get; set; }
        public string? ChiefDesignerID { get; set; }
        public string? ChiefDesignerName { get; set; }
        public string? ApproverID { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string? CreatedByName { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsForceAssessment { get; set; }
        public string? Remark { get; set; }

        // 导航属性
        public virtual User? PersonInCharge { get; set; }
        public virtual User? Creator { get; set; }
    }

    /// <summary>
    /// 基础实体类
    /// </summary>
    public abstract class BaseEntity<TKey>
    {
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
```

### Entity Framework Core 配置

```csharp
namespace R&DTaskSystem.Infrastructure.Data.Configurations
{
    /// <summary>
    /// 用户实体配置
    /// </summary>
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("users");
            builder.HasKey(u => u.UserID);
            builder.Property(u => u.UserID).HasMaxLength(50).IsRequired();
            builder.Property(u => u.Name).HasMaxLength(100).IsRequired();
            builder.Property(u => u.PasswordHash).HasMaxLength(255);
            builder.Property(u => u.Title).HasMaxLength(100);
            builder.Property(u => u.Education).HasMaxLength(50);
            builder.Property(u => u.School).HasMaxLength(200);
            builder.Property(u => u.Remark).HasColumnType("TEXT");

            builder.HasIndex(u => u.SystemRole);
            builder.HasIndex(u => u.OfficeLocation);
            builder.HasIndex(u => u.Status);
        }
    }

    /// <summary>
    /// 项目实体配置
    /// </summary>
    public class ProjectConfiguration : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            builder.ToTable("projects");
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).HasMaxLength(50).IsRequired();
            builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
            builder.Property(p => p.WorkNo).HasMaxLength(100);
            builder.Property(p => p.Capacity).HasMaxLength(50);
            builder.Property(p => p.Model).HasMaxLength(100);
            builder.Property(p => p.Remark).HasColumnType("TEXT");

            builder.HasIndex(p => p.Category);
            builder.HasIndex(p => new { p.StartDate, p.EndDate });
        }
    }

    /// <summary>
    /// 任务实体配置
    /// </summary>
    public class TaskConfiguration : IEntityTypeConfiguration<Task>
    {
        public void Configure(EntityTypeBuilder<Task> builder)
        {
            builder.ToTable("tasks");
            builder.HasKey(t => t.TaskID);
            builder.Property(t => t.TaskID).HasMaxLength(50).IsRequired();
            builder.Property(t => t.TaskName).HasMaxLength(200).IsRequired();
            builder.Property(t => t.TaskClassID).HasMaxLength(20).IsRequired();
            builder.Property(t => t.Category).HasMaxLength(50).IsRequired();
            builder.Property(t => t.AssigneeID).HasMaxLength(50);
            builder.Property(t => t.AssigneeName).HasMaxLength(100);
            builder.Property(t => t.TravelLocation).HasMaxLength(200);
            builder.Property(t => t.TravelLabel).HasMaxLength(50);
            builder.Property(t => t.CapacityLevel).HasMaxLength(50);
            builder.Property(t => t.Remark).HasColumnType("TEXT");
            builder.Property(t => t.Participants).HasColumnType("TEXT");  // JSON
            builder.Property(t => t.ParticipantNames).HasColumnType("TEXT");  // JSON

            // 索引
            builder.HasIndex(t => t.TaskClassID);
            builder.HasIndex(t => t.ProjectID);
            builder.HasIndex(t => t.AssigneeID);
            builder.HasIndex(t => t.CheckerID);
            builder.HasIndex(t => t.ApproverID);
            builder.HasIndex(t => t.Status);
            builder.HasIndex(t => new { t.StartDate, t.DueDate, t.CompletedDate });
            builder.HasIndex(t => t.CreatedDate);

            // 关系
            builder.HasOne(t => t.Assignee).WithMany().HasForeignKey(t => t.AssigneeID);
            builder.HasOne(t => t.Checker).WithMany().HasForeignKey(t => t.CheckerID);
            builder.HasOne(t => t.Approver).WithMany().HasForeignKey(t => t.ApproverID);
            builder.HasOne(t => t.Creator).WithMany().HasForeignKey(t => t.CreatedBy);
            builder.HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectID);
            builder.HasOne(t => t.TaskClass).WithMany().HasForeignKey(t => t.TaskClassID);
        }
    }
}
```

### DbContext 配置

```csharp
namespace R&DTaskSystem.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<Task> Tasks => Set<Task>();
        public DbSet<TaskClass> TaskClasses => Set<TaskClass>();
        public DbSet<TaskPoolItem> TaskPoolItems => Set<TaskPoolItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 应用配置
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ProjectConfiguration());
            modelBuilder.ApplyConfiguration(new TaskConfiguration());

            // 种子数据
            modelBuilder.Entity<TaskClass>().HasData(
                new TaskClass { Id = "TC001", Name = "市场配合", Code = "MARKET", Description = "市场配合相关任务" },
                new TaskClass { Id = "TC002", Name = "常规项目执行", Code = "EXECUTION", Description = "常规项目执行相关任务" },
                new TaskClass { Id = "TC003", Name = "核电项目执行", Code = "NUCLEAR", Description = "核电项目执行相关任务" },
                new TaskClass { Id = "TC004", Name = "产品研发", Code = "PRODUCT_DEV", Description = "产品研发相关任务" },
                new TaskClass { Id = "TC005", Name = "科研任务", Code = "RESEARCH", Description = "科研项目相关任务" },
                new TaskClass { Id = "TC006", Name = "改造服务", Code = "RENOVATION", Description = "改造服务相关任务" },
                new TaskClass { Id = "TC007", Name = "内部会议与培训", Code = "MEETING_TRAINING", Description = "会议和培训任务" },
                new TaskClass { Id = "TC008", Name = "行政与党建", Code = "ADMIN_PARTY", Description = "行政和党建任务" },
                new TaskClass { Id = "TC009", Name = "差旅任务", Code = "TRAVEL", Description = "出差任务" },
                new TaskClass { Id = "TC010", Name = "其他任务", Code = "OTHER", Description = "其他类型任务" }
            );
        }
    }
}
```

### DTO 定义

```csharp
namespace R&DTaskSystem.Application.DTOs
{
    /// <summary>
    /// 用户DTO
    /// </summary>
    public class UserDto
    {
        public string UserID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string SystemRole { get; set; } = string.Empty;
        public string OfficeLocation { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? JoinDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Education { get; set; }
        public string? School { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 任务DTO
    /// </summary>
    public class TaskDto
    {
        public string TaskID { get; set; } = string.Empty;
        public string TaskName { get; set; } = string.Empty;
        public string TaskClassID { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? ProjectID { get; set; }
        public string? AssigneeID { get; set; }
        public string? AssigneeName { get; set; }
        public string? StartDate { get; set; }
        public string? DueDate { get; set; }
        public string? CompletedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? Workload { get; set; }
        public decimal? Difficulty { get; set; }
        public string? Remark { get; set; }
        public string CreatedDate { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;

        // 差旅任务字段
        public string? TravelLocation { get; set; }
        public decimal? TravelDuration { get; set; }
        public string? TravelLabel { get; set; }

        // 会议任务字段
        public decimal? MeetingDuration { get; set; }
        public List<string>? Participants { get; set; }
        public List<string>? ParticipantNames { get; set; }

        // 角色字段
        public string? CheckerID { get; set; }
        public string? CheckerName { get; set; }
        public string? ChiefDesignerID { get; set; }
        public string? ChiefDesignerName { get; set; }
        public string? ApproverID { get; set; }
        public string? ApproverName { get; set; }
        public string? CheckerStatus { get; set; }
        public string? ChiefDesignerStatus { get; set; }
        public string? ApproverStatus { get; set; }
        public string? AssigneeStatus { get; set; }
    }

    /// <summary>
    /// 创建任务请求
    /// </summary>
    public class CreateTaskRequest
    {
        [Required]
        [MaxLength(200)]
        public string TaskName { get; set; } = string.Empty;

        [Required]
        public string TaskClassID { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string? ProjectID { get; set; }
        public string? AssigneeID { get; set; }
        public string? AssigneeName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        [Range(0.5, 3.0)]
        public decimal? Difficulty { get; set; }
        public string? Remark { get; set; }
        public bool IsForceAssessment { get; set; }

        // 角色分配
        public string? CheckerID { get; set; }
        public string? ChiefDesignerID { get; set; }
        public string? ApproverID { get; set; }

        // 差旅任务
        public string? TravelLocation { get; set; }
        public decimal? TravelDuration { get; set; }
        public string? TravelLabel { get; set; }

        // 会议任务
        public decimal? MeetingDuration { get; set; }
        public List<string>? Participants { get; set; }
    }

    /// <summary>
    /// 分页查询参数
    /// </summary>
    public class PaginationQuery
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? Search { get; set; }
        public bool IncludeDeleted { get; set; }
    }

    /// <summary>
    /// 统一API响应
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public ApiError? Error { get; set; }
    }

    public class ApiError
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// 分页响应
    /// </summary>
    public class PaginatedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Pages { get; set; }
    }
}
```

### API Controller 示例

```csharp
namespace R&DTaskSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;
        private readonly IMapper _mapper;

        public TasksController(ITaskService taskService, IMapper mapper)
        {
            _taskService = taskService;
            _mapper = mapper;
        }

        /// <summary>
        /// 获取任务列表
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<TaskDto>>>> GetTasks(
            [FromQuery] TaskQueryParams query)
        {
            var result = await _taskService.GetTasksAsync(query);
            return Ok(new ApiResponse<PaginatedResponse<TaskDto>>
            {
                Success = true,
                Data = result
            });
        }

        /// <summary>
        /// 获取单个任务
        /// </summary>
        [HttpGet("{taskId}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> GetTask(string taskId)
        {
            var task = await _taskService.GetTaskByIdAsync(taskId);
            if (task == null)
            {
                return NotFound(new ApiResponse<TaskDto>
                {
                    Success = false,
                    Error = new ApiError { Code = "NOT_FOUND", Message = "任务不存在" }
                });
            }
            return Ok(new ApiResponse<TaskDto> { Success = true, Data = task });
        }

        /// <summary>
        /// 创建任务
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<TaskDto>
                {
                    Success = false,
                    Error = new ApiError { Code = "VALIDATION_ERROR", Message = "请求参数验证失败" }
                });
            }

            var task = await _taskService.CreateTaskAsync(request);
            return CreatedAtAction(nameof(GetTask), new { taskId = task.TaskID },
                new ApiResponse<TaskDto> { Success = true, Data = task, Message = "创建成功" });
        }

        /// <summary>
        /// 更新任务
        /// </summary>
        [HttpPut("{taskId}")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateTask(string taskId, [FromBody] CreateTaskRequest request)
        {
            var task = await _taskService.UpdateTaskAsync(taskId, request);
            return Ok(new ApiResponse<TaskDto> { Success = true, Data = task, Message = "更新成功" });
        }

        /// <summary>
        /// 删除任务（软删除）
        /// </summary>
        [HttpDelete("{taskId}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteTask(string taskId)
        {
            await _taskService.SoftDeleteTaskAsync(taskId);
            return Ok(new ApiResponse<object> { Success = true, Message = "删除成功" });
        }

        /// <summary>
        /// 更新角色状态
        /// </summary>
        [HttpPatch("{taskId}/role-status")]
        public async Task<ActionResult<ApiResponse<TaskDto>>> UpdateRoleStatus(
            string taskId, [FromBody] UpdateRoleStatusRequest request)
        {
            var task = await _taskService.UpdateRoleStatusAsync(taskId, request.Role, request.Status);
            return Ok(new ApiResponse<TaskDto> { Success = true, Data = task });
        }

        /// <summary>
        /// 获取个人任务
        /// </summary>
        [HttpGet("personal")]
        public async Task<ActionResult<ApiResponse<PersonalTasksResponse>>> GetPersonalTasks(
            [FromQuery] string userId)
        {
            var result = await _taskService.GetPersonalTasksAsync(userId);
            return Ok(new ApiResponse<PersonalTasksResponse> { Success = true, Data = result });
        }
    }
}
```

### Service 接口示例

```csharp
namespace R&DTaskSystem.Application.Interfaces
{
    public interface ITaskService
    {
        Task<PaginatedResponse<TaskDto>> GetTasksAsync(TaskQueryParams query);
        Task<TaskDto?> GetTaskByIdAsync(string taskId);
        Task<TaskDto> CreateTaskAsync(CreateTaskRequest request);
        Task<TaskDto> UpdateTaskAsync(string taskId, CreateTaskRequest request);
        Task SoftDeleteTaskAsync(string taskId);
        Task<TaskDto> UpdateRoleStatusAsync(string taskId, string role, string status);
        Task<PersonalTasksResponse> GetPersonalTasksAsync(string userId);
        Task<TravelTasksResponse> GetTravelTasksAsync(string userId, Period period);
        Task<MeetingTasksResponse> GetMeetingTasksAsync(string userId, Period period);
    }

    public class TaskQueryParams : PaginationQuery
    {
        public string? Status { get; set; }
        public string? TaskClassID { get; set; }
        public string? Category { get; set; }
        public string? ProjectID { get; set; }
        public string? AssigneeID { get; set; }
        public string? CheckerID { get; set; }
        public string? ApproverID { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        public DateTime? DueDateFrom { get; set; }
        public DateTime? DueDateTo { get; set; }
        public string? UserId { get; set; }
        public Period? Period { get; set; }
    }
}
```

### Program.cs 配置示例

```csharp
using R&DTaskSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 配置
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Services
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProjectService, ProjectService>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## Python 类型定义（FastAPI/Pydantic）

```python
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ============ 枚举定义 ============

class SystemRole(str, Enum):
    MEMBER = "组员"
    LEADER = "班组长"
    ADMIN = "管理员"

class OfficeLocation(str, Enum):
    CHENGDU = "成都"
    DEYANG = "德阳"

class PersonnelStatus(str, Enum):
    ACTIVE = "在岗"
    BORROWED_IN = "借调"
    BORROWED_OUT = "外借"
    INTERN = "实习"
    LEAVE = "离岗"

class ProjectCategory(str, Enum):
    MARKET = "市场配合项目"
    EXECUTION = "常规项目"
    NUCLEAR = "核电项目"
    RESEARCH = "科研项目"
    RENOVATION = "改造项目"
    OTHER = "其他项目"

class TaskStatus(str, Enum):
    NOT_STARTED = "未开始"
    DRAFTING = "编制中"
    REVISING = "修改中"
    REVIEWING = "校核中"
    REVIEWING2 = "审查中"
    COMPLETED = "已完成"

class RoleStatus(str, Enum):
    NOT_STARTED = "未开始"
    IN_PROGRESS = "进行中"
    REVISING = "修改中"
    REJECTED = "驳回中"
    COMPLETED = "已完成"

class Period(str, Enum):
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    HALF_YEAR = "halfYear"
    YEAR = "year"
    YEAR_AND_HALF = "yearAndHalf"

# ============ 基础模型 ============

class BaseModel(BaseModel):
    """基础模型"""
    is_deleted: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# ============ 实体模型 ============

class User(BaseModel):
    """用户实体"""
    user_id: str = Field(..., description="工号 (PK)")
    name: str
    system_role: SystemRole
    office_location: OfficeLocation
    title: Optional[str] = None
    join_date: Optional[str] = None
    status: PersonnelStatus
    education: Optional[str] = None
    school: Optional[str] = None
    password_hash: Optional[str] = None
    remark: Optional[str] = None

class Project(BaseModel):
    """项目实体"""
    id: str = Field(..., description="项目ID (PK)")
    name: str
    category: ProjectCategory
    work_no: Optional[str] = None
    capacity: Optional[str] = None
    model: Optional[str] = None
    is_won: bool = False
    is_foreign: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    remark: Optional[str] = None
    is_commissioned: bool = False
    is_completed: bool = False
    is_key_project: bool = False

class Task(BaseModel):
    """任务实体"""
    task_id: str = Field(..., description="任务ID (PK)")
    task_name: str
    task_class_id: str
    category: str
    project_id: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    completed_date: Optional[str] = None
    status: TaskStatus
    workload: Optional[Decimal] = None
    difficulty: Optional[Decimal] = None
    remark: Optional[str] = None
    created_date: str
    created_by: str

    # 差旅任务字段 (TC009)
    travel_location: Optional[str] = None
    travel_duration: Optional[Decimal] = None
    travel_label: Optional[str] = None

    # 会议任务字段 (TC007)
    meeting_duration: Optional[Decimal] = None
    participants: Optional[List[str]] = None
    participant_names: Optional[List[str]] = None

    # 市场任务字段
    capacity_level: Optional[str] = None

    # 校核人
    checker_id: Optional[str] = None
    checker_name: Optional[str] = None
    checker_workload: Optional[Decimal] = None
    checker_status: Optional[RoleStatus] = None

    # 主任设计
    chief_designer_id: Optional[str] = None
    chief_designer_name: Optional[str] = None
    chief_designer_workload: Optional[Decimal] = None
    chief_designer_status: Optional[RoleStatus] = None

    # 审查人
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    approver_workload: Optional[Decimal] = None
    approver_status: Optional[RoleStatus] = None

    # 负责人状态
    assignee_status: Optional[RoleStatus] = None

    # 其他字段
    is_force_assessment: bool = False
    is_in_pool: bool = False

class TaskClass(BaseModel):
    """任务类别实体"""
    id: str = Field(..., description="类别ID (PK)，如 TC001")
    name: str
    code: str  # 如 MARKET
    description: Optional[str] = None
    notice: Optional[str] = None

class TaskPoolItem(BaseModel):
    """任务库实体"""
    id: str = Field(..., description="计划任务ID (PK)")
    task_name: str
    task_class_id: str
    category: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    person_in_charge_id: Optional[str] = None
    person_in_charge_name: Optional[str] = None
    checker_id: Optional[str] = None
    checker_name: Optional[str] = None
    chief_designer_id: Optional[str] = None
    chief_designer_name: Optional[str] = None
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    created_by: str
    created_by_name: Optional[str] = None
    created_date: str
    is_force_assessment: bool = False
    remark: Optional[str] = None

# ============ 请求/响应模型 ============

class LoginRequest(BaseModel):
    """登录请求"""
    user_id: str
    password: str

class LoginResponse(BaseModel):
    """登录响应"""
    user: User
    token: str

class CreateUserRequest(BaseModel):
    """创建用户请求"""
    user_id: str
    name: str
    system_role: SystemRole
    office_location: OfficeLocation
    title: Optional[str] = None
    join_date: Optional[str] = None
    status: PersonnelStatus
    education: Optional[str] = None
    school: Optional[str] = None
    password: Optional[str] = None
    remark: Optional[str] = None

class CreateTaskRequest(BaseModel):
    """创建任务请求"""
    task_name: str
    task_class_id: str
    category: str
    project_id: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    workload: Optional[Decimal] = None
    difficulty: Optional[Decimal] = Field(None, ge=0.5, le=3.0)
    remark: Optional[str] = None
    is_force_assessment: bool = False

    # 角色分配
    checker_id: Optional[str] = None
    checker_name: Optional[str] = None
    checker_workload: Optional[Decimal] = None
    chief_designer_id: Optional[str] = None
    chief_designer_name: Optional[str] = None
    chief_designer_workload: Optional[Decimal] = None
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    approver_workload: Optional[Decimal] = None

    # 差旅任务
    travel_location: Optional[str] = None
    travel_duration: Optional[Decimal] = None
    travel_label: Optional[str] = None

    # 会议任务
    meeting_duration: Optional[Decimal] = None
    participants: Optional[List[str]] = None
    participant_names: Optional[List[str]] = None

    # 市场任务
    capacity_level: Optional[str] = None

class UpdateRoleStatusRequest(BaseModel):
    """更新角色状态请求"""
    role: str  # assignee, checker, chiefDesigner, approver
    status: RoleStatus

class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20
    search: Optional[str] = None
    include_deleted: bool = False

class TaskQueryParams(PaginationParams):
    """任务查询参数"""
    status: Optional[TaskStatus] = None
    task_class_id: Optional[str] = None
    category: Optional[str] = None
    project_id: Optional[str] = None
    assignee_id: Optional[str] = None
    checker_id: Optional[str] = None
    approver_id: Optional[str] = None
    start_date_from: Optional[str] = None
    start_date_to: Optional[str] = None
    due_date_from: Optional[str] = None
    due_date_to: Optional[str] = None
    user_id: Optional[str] = None
    period: Optional[Period] = None

class PaginatedResponse(BaseModel):
    """分页响应"""
    data: List[Any]
    total: int
    page: int
    page_size: int
    pages: int

class ApiResponse(BaseModel):
    """统一API响应"""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[Dict[str, str]] = None

# ============ 统计相关模型 ============

class CategoryDistributionItem(BaseModel):
    """类别分布项"""
    name: str
    count: int
    percentage: float

class TravelStats(BaseModel):
    """差旅统计"""
    total_days: Decimal
    work_hours_in_period: Decimal
    percentage: float

class MeetingStats(BaseModel):
    """会议统计"""
    total_hours: Decimal
    work_hours_in_period: Decimal
    percentage: float

class MonthlyTrendItem(BaseModel):
    """月度趋势项"""
    month: str  # YYYY-MM
    assigned: int
    completed: int

class TeamMemberStats(BaseModel):
    """团队成员统计"""
    user_id: str
    user_name: str
    total_count: int
    completed_count: int
    completion_rate: float
    workload: Decimal

class PersonalStats(BaseModel):
    """个人统计"""
    in_progress_count: int
    pending_count: int
    completed_count: int
    total_count: int
    completion_rate: float
    category_distribution: List[CategoryDistributionItem]
    travel_stats: TravelStats
    meeting_stats: MeetingStats
    monthly_trend: List[MonthlyTrendItem]

class TeamStats(BaseModel):
    """团队统计"""
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    by_user: List[TeamMemberStats]
    by_category: List[CategoryDistributionItem]
```

### FastAPI 路由示例

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

router = APIRouter(prefix="/api/tasks", tags=["任务管理"])

@router.get("", response_model=PaginatedResponse)
async def get_tasks(
    params: TaskQueryParams = Depends(),
    current_user: User = Depends(get_current_user)
) -> PaginatedResponse:
    """获取任务列表"""
    # 根据角色过滤数据
    if current_user.system_role == SystemRole.MEMBER:
        params.user_id = current_user.user_id

    tasks = await task_service.get_tasks_async(params)
    return PaginatedResponse(
        data=tasks,
        total=total,
        page=params.page,
        page_size=params.page_size,
        pages=pages
    )

@router.post("", response_model=ApiResponse)
async def create_task(
    request: CreateTaskRequest,
    current_user: User = Depends(get_current_user)
) -> ApiResponse:
    """创建任务"""
    task = await task_service.create_task_async(request, current_user)
    return ApiResponse(
        success=True,
        data=task,
        message="创建成功"
    )

@router.delete("/{task_id}", response_model=ApiResponse)
async def delete_task(
    task_id: str,
    current_user: User = Depends(require_role([SystemRole.ADMIN, SystemRole.LEADER]))
) -> ApiResponse:
    """删除任务（软删除）"""
    await task_service.soft_delete_async(task_id)
    return ApiResponse(success=True, message="删除成功")

@router.patch("/{task_id}/role-status", response_model=ApiResponse)
async def update_role_status(
    task_id: str,
    request: UpdateRoleStatusRequest,
    current_user: User = Depends(get_current_user)
) -> ApiResponse:
    """更新角色状态"""
    task = await task_service.update_role_status_async(
        task_id, request.role, request.status, current_user
    )
    return ApiResponse(success=True, data=task)
```

### 认证依赖示例

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """获取当前登录用户"""
    token = credentials.credentials
    payload = decode_token(token)

    user_id = payload.get("sub")
    user = await user_service.get_by_id(user_id)

    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")

    return user

def require_role(allowed_roles: List[SystemRole]):
    """角色检查依赖"""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.system_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问此资源"
            )
        return current_user
    return role_checker
```

### 数据库模型（SQLAlchemy）

```python
from sqlalchemy import Column, String, Boolean, DateTime, Text, Numeric, Integer, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from database import Base
import enum

class SystemRoleEnum(enum.Enum):
    MEMBER = "组员"
    LEADER = "班组长"
    ADMIN = "管理员"

class User(Base):
    """用户表"""
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    system_role = Column(SQLEnum(SystemRoleEnum), nullable=False)
    office_location = Column(SQLEnum(OfficeLocationEnum), nullable=False)
    title = Column(String(100))
    join_date = Column(Date)
    status = Column(SQLEnum(PersonnelStatusEnum), nullable=False)
    education = Column(String(50))
    school = Column(String(200))
    password_hash = Column(String(255))
    remark = Column(Text)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_users_role", "system_role"),
        Index("idx_users_location", "office_location"),
        Index("idx_users_status", "status"),
    )

class Task(Base):
    """任务表"""
    __tablename__ = "tasks"

    task_id = Column(String(50), primary_key=True)
    task_name = Column(String(200), nullable=False)
    task_class_id = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    project_id = Column(String(50))
    assignee_id = Column(String(50))
    assignee_name = Column(String(100))
    start_date = Column(Date)
    due_date = Column(Date)
    completed_date = Column(DateTime)
    status = Column(SQLEnum(TaskStatusEnum), nullable=False)
    workload = Column(Numeric(10, 2))
    difficulty = Column(Numeric(3, 2), default=1.0)
    remark = Column(Text)
    created_date = Column(Date, nullable=False)
    created_by = Column(String(50), nullable=False)

    # 差旅任务字段
    travel_location = Column(String(200))
    travel_duration = Column(Numeric(5, 1))
    travel_label = Column(String(50))

    # 会议任务字段
    meeting_duration = Column(Numeric(5, 1))
    participants = Column(Text)  # JSON
    participant_names = Column(Text)  # JSON

    # 市场任务字段
    capacity_level = Column(String(50))

    # 校核人
    checker_id = Column(String(50))
    checker_name = Column(String(100))
    checker_workload = Column(Numeric(10, 2))
    checker_status = Column(SQLEnum(RoleStatusEnum))

    # 主任设计
    chief_designer_id = Column(String(50))
    chief_designer_name = Column(String(100))
    chief_designer_workload = Column(Numeric(10, 2))
    chief_designer_status = Column(SQLEnum(RoleStatusEnum))

    # 审查人
    approver_id = Column(String(50))
    approver_name = Column(String(100))
    approver_workload = Column(Numeric(10, 2))
    approver_status = Column(SQLEnum(RoleStatusEnum))

    # 负责人状态
    assignee_status = Column(SQLEnum(RoleStatusEnum))

    # 其他字段
    is_force_assessment = Column(Boolean, default=False)
    is_in_pool = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_tasks_class", "task_class_id"),
        Index("idx_tasks_project", "project_id"),
        Index("idx_tasks_assignee", "assignee_id"),
        Index("idx_tasks_checker", "checker_id"),
        Index("idx_tasks_approver", "approver_id"),
        Index("idx_tasks_status", "status"),
        Index("idx_tasks_dates", "start_date", "due_date", "completed_date"),
        Index("idx_tasks_created_date", "created_date"),
    )
```

---

## 接口数量统计

| 模块 | 接口数量 |
|------|----------|
| 认证模块 | 5 |
| 用户管理 | 7 |
| 项目管理 | 7 |
| 任务管理 | 14 |
| 任务类别 | 12 |
| 任务库 | 10 |
| 统计与工作台 | 12 |
| 系统设置 | 18 |
| **总计** | **85** |

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-01-10 | 初始版本发布 |
| v1.1 | 2026-01-10 | 添加C#模型类定义、EF Core配置、API控制器示例，完善设置模块C#类型定义 |
| v1.2 | 2026-01-10 | 添加Python/Pydantic类型定义、FastAPI路由示例、SQLAlchemy模型 |

---

## 注意事项

1. **密码安全**: 生产环境请使用 bcrypt 等加密算法存储密码
2. **API 安全**: 建议添加 JWT Token 认证机制
3. **数据验证**: 后端需对所有输入进行严格验证
4. **分页限制**: 建议单页最大数量不超过100
5. **日志记录**: 建议记录关键操作的审计日志
6. **错误处理**: 避免向客户端暴露敏感错误信息

---

## 文档维护

本文档随系统迭代同步更新。如有疑问或建议，请联系系统开发团队。
