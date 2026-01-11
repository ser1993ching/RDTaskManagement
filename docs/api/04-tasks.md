# 任务管理模块 API 文档

## 概述

任务管理模块提供任务的完整生命周期管理，包括创建、编辑、删除、状态更新、角色分配等功能。支持软删除机制和多种任务类型。

---

## TypeScript 类型定义

```typescript
// 任务状态枚举
export enum TaskStatus {
  NOT_STARTED = '未开始',
  DRAFTING = '编制中',
  REVISING = '修改中',
  REVIEWING = '校核中',
  REVIEWING2 = '审查中',
  COMPLETED = '已完成'
}

// 角色状态枚举（负责人、校核人、主任设计、审查人共用）
export enum RoleStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  REVISING = '修改中',
  REJECTED = '驳回中',
  COMPLETED = '已完成'
}

// 任务类别ID枚举
export const TaskClassIds = {
  TC001: 'TC001', // 市场配合
  TC002: 'TC002', // 常规项目执行
  TC003: 'TC003', // 核电项目执行
  TC004: 'TC004', // 产品研发
  TC005: 'TC005', // 科研任务
  TC006: 'TC006', // 改造服务
  TC007: 'TC007', // 内部会议与培训
  TC008: 'TC008', // 行政与党建
  TC009: 'TC009', // 差旅任务
  TC010: 'TC010'  // 其他任务
} as const;

// 角色类型
export type RoleType = 'assignee' | 'checker' | 'chiefDesigner' | 'approver';

// 任务对象接口
export interface Task {
  // === 核心字段 ===
  TaskID: string;           // 任务ID (PK)，格式: T-YYYYMMDD-XXX
  TaskName: string;         // 任务名称
  TaskClassID: string;      // 任务类别ID (关联task_classes.id)
  Category: string;         // 二级分类
  ProjectID?: string;       // 关联项目ID (关联projects.id)
  AssigneeID?: string;      // 负责人ID (关联users.UserID)
  StartDate?: string;       // 开始日期 (YYYY-MM-DD)
  DueDate?: string;         // 截止日期 (YYYY-MM-DD)
  CompletedDate?: string;   // 完成日期 (YYYY-MM-DD HH:mm:ss)
  Status: TaskStatus;       // 任务状态
  Workload?: number;        // 预估工作量（小时）
  Difficulty?: number;      // 难度系数（0.5-3.0）
  Remark?: string;          // 备注
  CreatedDate: string;      // 创建日期 (YYYY-MM-DD)
  CreatedBy: string;        // 创建人ID (关联users.UserID)

  // === 差旅任务字段 (TC009) ===
  TravelLocation?: string;  // 出差地点
  TravelDuration?: number;  // 出差天数
  TravelLabel?: string;     // 差旅标签

  // === 会议任务字段 (TC007) ===
  MeetingDuration?: number; // 会议时长（小时）
  Participants?: string[];  // 参会人员ID列表
  ParticipantNames?: string[]; // 参会人员姓名列表

  // === 市场任务字段 (TC001) ===
  CapacityLevel?: string;   // 容量等级

  // === 校核人 (Checker) ===
  CheckerID?: string;       // 校核人ID
  CheckerName?: string;     // 校核人姓名
  CheckerWorkload?: number; // 校核工作量（小时）
  checkerStatus?: RoleStatus; // 校核人状态

  // === 主任设计 (ChiefDesigner) ===
  ChiefDesignerID?: string; // 主任设计ID
  ChiefDesignerName?: string; // 主任设计姓名
  ChiefDesignerWorkload?: number; // 主任设计工作量（小时）
  chiefDesignerStatus?: RoleStatus; // 主任设计状态

  // === 审查人 (Approver) ===
  ApproverID?: string;      // 审查人ID
  ApproverName?: string;    // 审查人姓名
  ApproverWorkload?: number; // 审查工作量（小时）
  approverStatus?: RoleStatus; // 审查人状态

  // === 负责人状态 ===
  assigneeStatus?: RoleStatus; // 负责人状态

  // === 非系统用户负责人 ===
  AssigneeName?: string;    // 负责人姓名（非系统用户时使用）

  // === 其他字段 ===
  isForceAssessment?: boolean; // 是否强制考核
  is_in_pool?: boolean;     // 是否在任务库中（计划任务转化）
  is_deleted?: boolean;     // 软删除标记

  // === 废弃字段（兼容旧数据）===
  /** @deprecated 已废弃，使用 CheckerID */
  ReviewerID?: string;
  /** @deprecated 已废弃，使用 ApproverID */
  ReviewerID2?: string;
  /** @deprecated 已废弃，使用 CheckerName */
  ReviewerName?: string;
  /** @deprecated 已废弃，使用 ApproverName */
  Reviewer2Name?: string;
  /** @deprecated 已废弃，使用 CheckerWorkload */
  ReviewerWorkload?: number;
  /** @deprecated 已废弃，使用 ApproverWorkload */
  Reviewer2Workload?: number;
}

// 创建任务请求
export interface CreateTaskRequest {
  TaskName: string;
  TaskClassID: string;
  Category: string;
  ProjectID?: string;
  AssigneeID?: string;
  AssigneeName?: string;
  StartDate?: string;
  DueDate?: string;
  Workload?: number;
  Difficulty?: number;
  Remark?: string;
  CheckerID?: string;
  CheckerName?: string;
  CheckerWorkload?: number;
  ChiefDesignerID?: string;
  ChiefDesignerName?: string;
  ChiefDesignerWorkload?: number;
  ApproverID?: string;
  ApproverName?: string;
  ApproverWorkload?: number;
  isForceAssessment?: boolean;

  // 差旅任务特有
  TravelLocation?: string;
  TravelDuration?: number;
  TravelLabel?: string;

  // 会议任务特有
  MeetingDuration?: number;
  Participants?: string[];
  ParticipantNames?: string[];

  // 市场任务特有
  CapacityLevel?: string;
}

// 更新角色状态请求
export interface UpdateRoleStatusRequest {
  role: RoleType;
  status: RoleStatus;
}

// 任务列表查询参数
export interface TaskQueryParams {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  TaskClassID?: string;
  category?: string;
  ProjectID?: string;
  AssigneeID?: string;
  CheckerID?: string;
  ApproverID?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  includeDeleted?: boolean;
  userId?: string;
  period?: 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'yearAndHalf';
}

// 分页响应
export interface PaginatedTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// 个人任务响应
export interface PersonalTasksResponse {
  inProgress: Task[];
  pending: Task[];
  completed: Task[];
}

// 差旅任务响应
export interface TravelTasksResponse {
  tasks: Task[];
  totalDays: number;
}

// 会议任务响应
export interface MeetingTasksResponse {
  tasks: Task[];
  totalHours: number;
}

// 长期任务响应
export interface LongRunningTasksResponse {
  tasks: Task[];
  count: number;
}

// 批量操作请求
export interface BatchOperationRequest {
  taskIds: string[];
  action: 'delete' | 'status' | 'assignee';
  value: any;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.Tasks
{
    /// <summary>
    /// 任务状态枚举
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
    /// 角色状态枚举
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
    /// 角色类型
    /// </summary>
    public enum RoleType
    {
        Assignee = 0,
        Checker = 1,
        ChiefDesigner = 2,
        Approver = 3
    }

    /// <summary>
    /// 任务数据传输对象
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
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? Workload { get; set; }
        public decimal? Difficulty { get; set; }
        public string? Remark { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;

        // 差旅任务字段
        public string? TravelLocation { get; set; }
        public decimal? TravelDuration { get; set; }
        public string? TravelLabel { get; set; }

        // 会议任务字段
        public decimal? MeetingDuration { get; set; }
        public List<string>? Participants { get; set; }
        public List<string>? ParticipantNames { get; set; }

        // 市场任务字段
        public string? CapacityLevel { get; set; }

        // 角色字段
        public string? CheckerID { get; set; }
        public string? CheckerName { get; set; }
        public decimal? CheckerWorkload { get; set; }
        public string? CheckerStatus { get; set; }

        public string? ChiefDesignerID { get; set; }
        public string? ChiefDesignerName { get; set; }
        public decimal? ChiefDesignerWorkload { get; set; }
        public string? ChiefDesignerStatus { get; set; }

        public string? ApproverID { get; set; }
        public string? ApproverName { get; set; }
        public decimal? ApproverWorkload { get; set; }
        public string? ApproverStatus { get; set; }

        public string? AssigneeStatus { get; set; }
        public bool IsForceAssessment { get; set; }
        public bool IsInPool { get; set; }
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

        // 市场任务
        public string? CapacityLevel { get; set; }
    }

    /// <summary>
    /// 更新角色状态请求
    /// </summary>
    public class UpdateRoleStatusRequest
    {
        [Required]
        public string Role { get; set; } = string.Empty;  // assignee, checker, chiefDesigner, approver

        [Required]
        public string Status { get; set; } = string.Empty;
    }

    /// <summary>
    /// 任务查询参数
    /// </summary>
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

    /// <summary>
    /// 个人任务响应
    /// </summary>
    public class PersonalTasksResponse
    {
        public List<TaskDto> InProgress { get; set; } = new();
        public List<TaskDto> Pending { get; set; } = new();
        public List<TaskDto> Completed { get; set; } = new();
    }

    /// <summary>
    /// 差旅任务响应
    /// </summary>
    public class TravelTasksResponse
    {
        public List<TaskDto> Tasks { get; set; } = new();
        public decimal TotalDays { get; set; }
    }

    /// <summary>
    /// 会议任务响应
    /// </summary>
    public class MeetingTasksResponse
    {
        public List<TaskDto> Tasks { get; set; } = new();
        public decimal TotalHours { get; set; }
    }

    /// <summary>
    /// 批量操作请求
    /// </summary>
    public class BatchOperationRequest
    {
        public List<string> TaskIds { get; set; } = new();
        public string Action { get; set; } = string.Empty;  // delete, status, assignee
        public object? Value { get; set; }
    }
}
```

---

## 数据模型

### Task 对象结构

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| TaskID | string | 是 | 任务ID（主键） |
| TaskName | string | 是 | 任务名称 |
| TaskClassID | string | 是 | 任务类别ID |
| Category | string | 是 | 二级分类 |
| ProjectID | string | 否 | 关联项目ID |
| AssigneeID | string | 否 | 负责人ID |
| StartDate | string | 否 | 开始日期（YYYY-MM-DD） |
| DueDate | string | 否 | 截止日期（YYYY-MM-DD） |
| CompletedDate | string | 否 | 完成日期 |
| Status | string | 是 | 任务状态 |
| Workload | number | 否 | 预估工作量（小时） |
| Difficulty | number | 否 | 难度系数（0.5-3.0） |
| Remark | string | 否 | 备注 |
| CreatedDate | string | 是 | 创建日期 |
| CreatedBy | string | 是 | 创建人ID |
| TravelLocation | string | 否 | 出差地点（差旅任务） |
| TravelDuration | number | 否 | 出差天数（差旅任务） |
| MeetingDuration | number | 否 | 会议时长（会议任务） |
| CapacityLevel | string | 否 | 容量等级 |
| TravelLabel | string | 否 | 差旅标签 |
| CheckerID | string | 否 | 校核人ID |
| CheckerName | string | 否 | 校核人姓名 |
| CheckerWorkload | number | 否 | 校核工作量 |
| checkerStatus | string | 否 | 校核人状态 |
| ChiefDesignerID | string | 否 | 主任设计ID |
| ChiefDesignerName | string | 否 | 主任设计姓名 |
| ChiefDesignerWorkload | number | 否 | 主任设计工作量 |
| chiefDesignerStatus | string | 否 | 主任设计状态 |
| ApproverID | string | 否 | 审查人ID |
| ApproverName | string | 否 | 审查人姓名 |
| ApproverWorkload | number | 否 | 审查工作量 |
| approverStatus | string | 否 | 审查人状态 |
| AssigneeName | string | 否 | 负责人姓名（非系统用户） |
| assigneeStatus | string | 否 | 负责人状态 |
| isForceAssessment | boolean | 否 | 是否强制考核 |
| is_deleted | boolean | 否 | 是否已删除 |
| Participants | string[] | 否 | 参会人员ID列表（会议任务） |
| ParticipantNames | string[] | 否 | 参会人员姓名列表（会议任务） |
| is_in_pool | boolean | 否 | 是否在任务库中 |

---

## API 接口列表

### 1. 获取任务列表

**接口路径:** `GET /api/tasks`

**描述:** 获取任务列表，支持多条件过滤、分页和排序。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，从1开始，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| status | string | 否 | 按任务状态过滤 |
| TaskClassID | string | 否 | 按任务类别过滤 |
| category | string | 否 | 按二级分类过滤 |
| ProjectID | string | 否 | 按项目ID过滤 |
| AssigneeID | string | 否 | 按负责人ID过滤 |
| CheckerID | string | 否 | 按校核人ID过滤 |
| ApproverID | string | 否 | 按审查人ID过滤 |
| startDateFrom | string | 否 | 开始日期起（YYYY-MM-DD） |
| startDateTo | string | 否 | 开始日期止（YYYY-MM-DD） |
| dueDateFrom | string | 否 | 截止日期起 |
| dueDateTo | string | 否 | 截止日期止 |
| search | string | 否 | 搜索关键词（匹配任务名称） |
| includeDeleted | boolean | 否 | 是否包含已删除任务，默认false |
| userId | string | 否 | 用户ID（获取与该用户相关的任务） |
| period | string | 否 | 时间周期（week/month/quarter/halfYear/year/yearAndHalf） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | Task[] | 任务列表 |
| total | number | 任务总数 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |
| pages | number | 总页数 |

---

### 2. 获取单个任务

**接口路径:** `GET /api/tasks/{taskId}`

**描述:** 根据任务ID获取任务详细信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| task | Task | 任务详细信息 |
| project | Project | 关联项目信息（可选） |
| taskClass | TaskClass | 任务类别信息（可选） |

---

### 3. 创建任务

**接口路径:** `POST /api/tasks`

**描述:** 创建新任务。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| TaskName | string | 是 | 任务名称 |
| TaskClassID | string | 是 | 任务类别ID |
| Category | string | 是 | 二级分类 |
| ProjectID | string | 否 | 关联项目ID |
| AssigneeID | string | 否 | 负责人ID |
| AssigneeName | string | 否 | 负责人姓名（非系统用户） |
| StartDate | string | 否 | 开始日期 |
| DueDate | string | 否 | 截止日期 |
| Workload | number | 否 | 预估工作量 |
| Difficulty | number | 否 | 难度系数（0.5-3.0） |
| Remark | string | 否 | 备注 |
| CheckerID | string | 否 | 校核人ID |
| CheckerName | string | 否 | 校核人姓名 |
| CheckerWorkload | number | 否 | 校核工作量 |
| ChiefDesignerID | string | 否 | 主任设计ID |
| ChiefDesignerName | string | 否 | 主任设计姓名 |
| ChiefDesignerWorkload | number | 否 | 主任设计工作量 |
| ApproverID | string | 否 | 审查人ID |
| ApproverName | string | 否 | 审查人姓名 |
| ApproverWorkload | number | 否 | 审查工作量 |
| isForceAssessment | boolean | 否 | 是否强制考核 |

**差旅任务特有字段:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| TravelLocation | string | 出差地点 |
| TravelDuration | number | 出差天数 |
| TravelLabel | string | 差旅标签 |

**会议任务特有字段:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| MeetingDuration | number | 会议时长（小时） |
| Participants | string[] | 参会人员ID列表 |
| ParticipantNames | string[] | 参会人员姓名列表 |

**请求示例:**
```json
{
  "TaskName": "白鹤滩项目技术方案编制",
  "TaskClassID": "TC001",
  "Category": "技术方案",
  "ProjectID": "P001",
  "AssigneeID": "USER001",
  "StartDate": "2025-01-15",
  "DueDate": "2025-02-15",
  "Workload": 16,
  "Difficulty": 1.5,
  "CheckerID": "LEADER001",
  "CheckerWorkload": 4,
  "isForceAssessment": true,
  "Remark": "重点投标项目"
}
```

---

### 4. 更新任务

**接口路径:** `PUT /api/tasks/{taskId}`

**描述:** 更新任务信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求体:** 同创建任务，支持部分字段更新。

---

### 5. 删除任务（软删除）

**接口路径:** `DELETE /api/tasks/{taskId}`

**描述:** 软删除任务。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

---

### 6. 更新任务状态

**接口路径:** `PATCH /api/tasks/{taskId}/status`

**描述:** 更新任务整体状态。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| status | string | 是 | 新任务状态 |

**请求示例:**
```json
{
  "status": "已完成"
}
```

---

### 7. 更新角色状态

**接口路径:** `PATCH /api/tasks/{taskId}/role-status`

**描述:** 更新任务中特定角色的状态。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| role | string | 是 | 角色类型（assignee/checker/chiefDesigner/approver） |
| status | string | 是 | 新状态 |

**请求示例:**
```json
{
  "role": "assignee",
  "status": "进行中"
}
```

---

### 8. 批量更新角色状态为完成

**接口路径:** `POST /api/tasks/{taskId}/complete-all-roles`

**描述:** 将任务所有角色状态更新为完成，同时设置任务状态为完成。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

---

### 9. 回收任务到任务库

**接口路径:** `POST /api/tasks/{taskId}/retrieve-to-pool`

**描述:** 将任务回收为任务库中的计划任务，清空所有角色信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

---

### 10. 获取个人任务

**接口路径:** `GET /api/tasks/personal`

**描述:** 获取与指定用户相关的所有任务（作为负责人、校核人、主任设计或审查人）。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| inProgress | Task[] | 进行中的任务 |
| pending | Task[] | 未开始的任务 |
| completed | Task[] | 已完成的任务 |

---

### 11. 获取差旅任务

**接口路径:** `GET /api/tasks/travel`

**描述:** 获取指定用户的差旅任务。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| period | string | 否 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | Task[] | 差旅任务列表 |
| totalDays | number | 总出差天数 |

---

### 12. 获取会议任务

**接口路径:** `GET /api/tasks/meetings`

**描述:** 获取指定用户参与的会议任务（用户在Participants中）。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| period | string | 否 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | Task[] | 会议任务列表 |
| totalHours | number | 总会议时长 |

---

### 13. 检查任务是否长期未完成

**接口路径:** `GET /api/tasks/{taskId}/is-long-running`

**描述:** 检查任务是否超过2个月未完成。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 任务ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| isLongRunning | boolean | 是否为长期任务 |

---

### 14. 批量操作

**接口路径:** `POST /api/tasks/batch`

**描述:** 批量更新任务状态或其他属性。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskIds | string[] | 是 | 任务ID列表 |
| action | string | 是 | 操作类型（delete/status/assignee） |
| value | any | 是 | 操作值 |

---

## 枚举值说明

### TaskStatus (任务状态)

| 值 | 描述 |
|----|------|
| 未开始 | 任务尚未开始 |
| 编制中 | 任务正在进行中（负责人） |
| 修改中 | 任务被驳回修改中 |
| 校核中 | 校核人审核中 |
| 审查中 | 审查人审核中 |
| 已完成 | 任务已完成 |

### RoleStatus (角色状态)

| 值 | 描述 |
|----|------|
| 未开始 | 角色工作尚未开始 |
| 进行中 | 角色工作进行中 |
| 修改中 | 角色工作被驳回修改中 |
| 驳回中 | 角色工作被驳回 |
| 已完成 | 角色工作已完成 |

### TaskClassID (任务类别)

| 值 | 名称 | 描述 |
|----|------|------|
| TC001 | 市场配合 | 市场投标相关任务 |
| TC002 | 常规项目执行 | 常规项目任务 |
| TC003 | 核电项目执行 | 核电项目任务 |
| TC004 | 产品研发 | 产品研发任务 |
| TC005 | 科研任务 | 科研项目任务 |
| TC006 | 改造服务 | 改造服务任务 |
| TC007 | 内部会议与培训 | 会议和培训任务 |
| TC008 | 行政与党建 | 行政和党建任务 |
| TC009 | 差旅任务 | 出差任务 |
| TC010 | 其他任务 | 其他类型任务 |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看任务列表 | 仅自己的任务 | 本班组 | 全部 |
| 查看任务详情 | 仅自己的任务 | 本班组 | 全部 |
| 创建任务 | 是 | 是 | 是 |
| 更新任务 | 仅自己的任务 | 本班组 | 全部 |
| 删除任务 | 仅自己的任务 | 本班组 | 全部 |
| 更新角色状态 | 是（对应角色） | 是 | 是 |
| 回收任务到库 | 否 | 是 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 任务不存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 任务ID自动生成，格式为 `T-YYYYMMDD-XXX`
- 软删除机制：所有删除操作均为软删除
- 角色状态与任务状态联动更新
- 市场配合任务会自动从关联项目继承容量等级
- 会议任务（TC007）和差旅任务（TC009）在个人工作台中单独展示
- 超过2个月未完成的任务会被标记为长期任务
