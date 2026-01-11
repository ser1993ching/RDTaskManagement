# 任务库管理模块 API 文档

## 概述

任务库（Task Pool）用于管理计划任务，是任务的预定义池。班组长和管理员可以提前创建计划任务（TaskPoolItem），然后分配给团队成员转化为正式任务。

---

## TypeScript 类型定义

```typescript
// 任务库对象接口
export interface TaskPoolItem {
  id: string;                   // 计划任务ID (PK)，格式: TP-YYYYMMDD-XXX
  TaskName: string;             // 任务名称
  TaskClassID: string;          // 任务类别ID
  Category: string;             // 二级分类
  ProjectID?: string;           // 关联项目ID
  ProjectName?: string;         // 关联项目名称（冗余存储，便于显示）
  PersonInChargeID?: string;    // 计划负责人ID
  PersonInChargeName?: string;  // 计划负责人姓名
  CheckerID?: string;           // 计划校核人ID
  CheckerName?: string;         // 计划校核人姓名
  ChiefDesignerID?: string;     // 计划主任设计ID
  ChiefDesignerName?: string;   // 计划主任设计姓名
  ApproverID?: string;          // 计划审查人ID
  ApproverName?: string;        // 计划审查人姓名
  StartDate?: string;           // 计划开始日期 (YYYY-MM-DD)
  DueDate?: string;             // 计划截止日期 (YYYY-MM-DD)
  CreatedBy: string;            // 创建人ID
  CreatedByName?: string;       // 创建人姓名
  CreatedDate: string;          // 创建日期 (YYYY-MM-DD)
  isForceAssessment?: boolean;  // 是否强制考核
  Remark?: string;              // 备注
  is_deleted?: boolean;         // 软删除标记
  created_at?: string;          // 创建时间
  updated_at?: string;          // 更新时间

  // 已废弃字段（兼容旧数据）
  /** @deprecated 已废弃，使用 CheckerID */
  ReviewerID?: string;
  /** @deprecated 已废弃，使用 ApproverID */
  ReviewerID2?: string;
  /** @deprecated 已废弃，使用 CheckerName */
  ReviewerName?: string;
  /** @deprecated 已废弃，使用 ApproverName */
  Reviewer2Name?: string;
}

// 创建任务库项请求
export interface CreateTaskPoolItemRequest {
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
  isForceAssessment?: boolean;
  Remark?: string;
}

// 更新任务库项请求
export interface UpdateTaskPoolItemRequest {
  TaskName?: string;
  TaskClassID?: string;
  Category?: string;
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
  isForceAssessment?: boolean;
  Remark?: string;
}

// 任务库项查询参数
export interface TaskPoolQueryParams {
  page?: number;
  pageSize?: number;
  TaskClassID?: string;
  category?: string;
  ProjectID?: string;
  PersonInChargeID?: string;
  search?: string;
  includeDeleted?: boolean;
  sortBy?: 'CreatedDate' | 'DueDate';
  sortOrder?: 'asc' | 'desc';
}

// 分配任务请求
export interface AssignTaskRequest {
  assignToPoolItemId: string;   // 要分配的任务库项ID
  assigneeId: string;           // 负责人ID
  assigneeName?: string;        // 负责人姓名（非系统用户）
  startDate?: string;           // 实际开始日期
  dueDate?: string;             // 实际截止日期
}

// 批量分配请求
export interface BatchAssignRequest {
  poolItemIds: string[];        // 要分配的任务库项ID列表
  assigneeId: string;           // 负责人ID
  startDate?: string;
  dueDate?: string;
}

// 任务库项列表响应
export interface TaskPoolListResponse {
  items: TaskPoolItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// 分配任务响应
export interface AssignTaskResponse {
  success: boolean;
  taskId: string;               // 创建的任务ID
  taskPoolItemId: string;       // 分配的任务库项ID
  message: string;
}

// 批量分配响应
export interface BatchAssignResponse {
  success: boolean;
  assignedCount: number;        // 成功分配的数量
  failedCount: number;          // 失败的数量
  taskIds: string[];            // 创建的任务ID列表
  message: string;
}

// 回收任务响应
export interface RetrieveToPoolResponse {
  success: boolean;
  poolItemId: string;           // 回收后的任务库项ID
  message: string;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.TaskPool
{
    /// <summary>
    /// 任务库项数据传输对象
    /// </summary>
    public class TaskPoolItemDto
    {
        public string Id { get; set; } = string.Empty;
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
    }

    /// <summary>
    /// 创建任务库项请求
    /// </summary>
    public class CreateTaskPoolItemRequest
    {
        [Required]
        [MaxLength(200)]
        public string TaskName { get; set; } = string.Empty;

        [Required]
        public string TaskClassID { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string? ProjectID { get; set; }
        public string? ProjectName { get; set; }
        public string? PersonInChargeID { get; set; }
        public string? PersonInChargeName { get; set; }
        public string? CheckerID { get; set; }
        public string? ChiefDesignerID { get; set; }
        public string? ApproverID { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsForceAssessment { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 更新任务库项请求
    /// </summary>
    public class UpdateTaskPoolItemRequest
    {
        public string? TaskName { get; set; }
        public string? TaskClassID { get; set; }
        public string? Category { get; set; }
        public string? ProjectID { get; set; }
        public string? PersonInChargeID { get; set; }
        public string? CheckerID { get; set; }
        public string? ChiefDesignerID { get; set; }
        public string? ApproverID { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsForceAssessment { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 任务库项查询参数
    /// </summary>
    public class TaskPoolQueryParams : PaginationQuery
    {
        public string? TaskClassID { get; set; }
        public string? Category { get; set; }
        public string? ProjectID { get; set; }
        public string? PersonInChargeID { get; set; }
        public string? SortBy { get; set; }  // CreatedDate, DueDate
        public string? SortOrder { get; set; }  // asc, desc
    }

    /// <summary>
    /// 分配任务请求
    /// </summary>
    public class AssignTaskRequest
    {
        [Required]
        public string AssignToPoolItemId { get; set; } = string.Empty;

        [Required]
        public string AssigneeId { get; set; } = string.Empty;

        public string? AssigneeName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
    }

    /// <summary>
    /// 批量分配请求
    /// </summary>
    public class BatchAssignRequest
    {
        [Required]
        public List<string> PoolItemIds { get; set; } = new();

        [Required]
        public string AssigneeId { get; set; } = string.Empty;

        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
    }

    /// <summary>
    /// 任务库项列表响应
    /// </summary>
    public class TaskPoolListResponse
    {
        public List<TaskPoolItemDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Pages { get; set; }
    }

    /// <summary>
    /// 分配任务响应
    /// </summary>
    public class AssignTaskResponse
    {
        public bool Success { get; set; }
        public string TaskId { get; set; } = string.Empty;
        public string TaskPoolItemId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// 批量分配响应
    /// </summary>
    public class BatchAssignResponse
    {
        public bool Success { get; set; }
        public int AssignedCount { get; set; }
        public int FailedCount { get; set; }
        public List<string> TaskIds { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }
}
```

---

## 数据模型

### TaskPoolItem 对象结构

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 计划任务ID（主键） |
| TaskName | string | 是 | 任务名称 |
| TaskClassID | string | 是 | 任务类别ID |
| Category | string | 是 | 二级分类 |
| ProjectID | string | 否 | 关联项目ID |
| ProjectName | string | 否 | 关联项目名称（冗余存储） |
| PersonInChargeID | string | 否 | 计划负责人ID |
| PersonInChargeName | string | 否 | 计划负责人姓名 |
| CheckerID | string | 否 | 计划校核人ID |
| CheckerName | string | 否 | 计划校核人姓名 |
| ChiefDesignerID | string | 否 | 计划主任设计ID |
| ChiefDesignerName | string | 否 | 计划主任设计姓名 |
| ApproverID | string | 否 | 计划审查人ID |
| ApproverName | string | 否 | 计划审查人姓名 |
| StartDate | string | 否 | 计划开始日期 |
| DueDate | string | 否 | 计划截止日期 |
| CreatedBy | string | 是 | 创建人ID |
| CreatedByName | string | 否 | 创建人姓名 |
| CreatedDate | string | 是 | 创建日期 |
| isForceAssessment | boolean | 否 | 是否强制考核 |
| Remark | string | 否 | 备注 |
| is_deleted | boolean | 否 | 是否已删除（软删除标记） |

---

## API 接口列表

### 1. 获取任务库列表

**接口路径:** `GET /api/task-pool`

**描述:** 获取所有任务库中的计划任务。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| page | number | 否 | 页码，从1开始 |
| pageSize | number | 否 | 每页数量 |
| TaskClassID | string | 否 | 按任务类别过滤 |
| category | string | 否 | 按二级分类过滤 |
| ProjectID | string | 否 | 按项目ID过滤 |
| search | string | 否 | 搜索关键词 |
| includeDeleted | boolean | 否 | 是否包含已删除项 |
| sortBy | string | 否 | 排序字段（CreatedDate/DueDate） |
| sortOrder | string | 否 | 排序方向（asc/desc） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| items | TaskPoolItem[] | 计划任务列表 |
| total | number | 总数量 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

---

### 2. 获取单个计划任务

**接口路径:** `GET /api/task-pool/{id}`

**描述:** 根据计划任务ID获取详细信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 计划任务ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| item | TaskPoolItem | 计划任务详情 |
| project | Project | 关联项目信息（可选） |

---

### 3. 创建计划任务

**接口路径:** `POST /api/task-pool`

**描述:** 在任务库中创建新的计划任务。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| TaskName | string | 是 | 任务名称 |
| TaskClassID | string | 是 | 任务类别ID |
| Category | string | 是 | 二级分类 |
| ProjectID | string | 否 | 关联项目ID |
| PersonInChargeID | string | 否 | 计划负责人ID |
| PersonInChargeName | string | 否 | 计划负责人姓名 |
| CheckerID | string | 否 | 计划校核人ID |
| CheckerName | string | 否 | 计划校核人姓名 |
| ChiefDesignerID | string | 否 | 计划主任设计ID |
| ChiefDesignerName | string | 否 | 计划主任设计姓名 |
| ApproverID | string | 否 | 计划审查人ID |
| ApproverName | string | 否 | 计划审查人姓名 |
| StartDate | string | 否 | 计划开始日期 |
| DueDate | string | 否 | 计划截止日期 |
| isForceAssessment | boolean | 否 | 是否强制考核 |
| Remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "TaskName": "白鹤滩项目-施工图设计",
  "TaskClassID": "TC002",
  "Category": "施工图设计",
  "ProjectID": "P006",
  "PersonInChargeID": "USER001",
  "PersonInChargeName": "李研发",
  "CheckerID": "USER002",
  "CheckerName": "王设计",
  "ApproverID": "LEADER001",
  "ApproverName": "张组长",
  "StartDate": "2025-12-01",
  "DueDate": "2025-12-31",
  "isForceAssessment": true,
  "Remark": "关键节点，按期完成"
}
```

---

### 4. 更新计划任务

**接口路径:** `PUT /api/task-pool/{id}`

**描述:** 更新任务库中的计划任务。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 计划任务ID |

**请求体:** 同创建计划任务，支持部分字段更新。

---

### 5. 删除计划任务（软删除）

**接口路径:** `DELETE /api/task-pool/{id}`

**描述:** 软删除任务库中的计划任务。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 计划任务ID |

---

### 6. 分配任务（转化为正式任务）

**接口路径:** `POST /api/task-pool/{id}/assign`

**描述:** 将任务库中的计划任务分配给具体负责人，转化为正式任务。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 计划任务ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| AssigneeID | string | 是 | 负责人ID |
| AssigneeName | string | 否 | 负责人姓名（非系统用户） |
| Workload | number | 否 | 预估工作量 |
| Difficulty | number | 否 | 难度系数 |
| CheckerID | string | 否 | 校核人ID |
| ApproverID | string | 否 | 审查人ID |
| CheckerWorkload | number | 否 | 校核工作量 |
| ApproverWorkload | number | 否 | 审查工作量 |
| Remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "AssigneeID": "USER001",
  "Workload": 24,
  "Difficulty": 1.8,
  "CheckerID": "LEADER001",
  "ApproverID": "USER007",
  "CheckerWorkload": 6,
  "ApproverWorkload": 4,
  "Remark": "开始执行"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 操作是否成功 |
| task | Task | 转化后的正式任务 |
| message | string | 响应消息 |

---

### 7. 批量分配任务

**接口路径:** `POST /api/task-pool/batch-assign`

**描述:** 批量将多个计划任务转化为正式任务。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| items | object[] | 是 | 分配配置列表 |

**items 数组项:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| poolItemId | string | 是 | 计划任务ID |
| AssigneeID | string | 是 | 负责人ID |
| Workload | number | 否 | 预估工作量 |
| Difficulty | number | 否 | 难度系数 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 操作是否成功 |
| tasks | Task[] | 转化后的任务列表 |
| failed | object[] | 失败项列表 |

---

### 8. 获取任务库统计

**接口路径:** `GET /api/task-pool/statistics`

**描述:** 获取任务库统计信息。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| total | number | 计划任务总数 |
| byCategory | object | 按类别分类的数量 |
| byProject | object | 按项目分类的数量 |
| pending | number | 待分配数量 |
| assigned | number | 已分配数量 |

**响应示例:**
```json
{
  "total": 20,
  "byCategory": {
    "TC001": 3,
    "TC002": 4,
    "TC003": 3,
    "TC006": 3,
    "TC008": 2,
    "TC010": 1
  },
  "byProject": {
    "P001": 1,
    "P006": 2,
    "P011": 1,
    ...
  },
  "pending": 12,
  "assigned": 8
}
```

---

### 9. 复制计划任务

**接口路径:** `POST /api/task-pool/{id}/duplicate`

**描述:** 复制任务库中的计划任务创建新条目。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 原计划任务ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| TaskName | string | 否 | 新任务名称，不提供则自动生成 |
| DueDate | string | 否 | 新的截止日期 |

---

### 10. 从任务回收

**接口路径:** `POST /api/task-pool/recover-from-task`

**描述:** 将已有的任务回收为任务库中的计划任务。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| taskId | string | 是 | 要回收的任务ID |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看任务库列表 | 否 | 是（本班组） | 全部 |
| 查看计划任务详情 | 否 | 是（本班组） | 全部 |
| 创建计划任务 | 否 | 是 | 是 |
| 更新计划任务 | 否 | 是 | 是 |
| 删除计划任务 | 否 | 是 | 是 |
| 分配任务 | 否 | 是 | 是 |
| 批量分配 | 否 | 是 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 计划任务不存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 任务库用于提前规划工作，分配后原计划任务会被软删除
- 分配时会从关联项目获取容量等级
- 会议培训任务（TC007）分配后角色状态默认为已完成
- 任务库支持按类别、项目、日期范围等多维度筛选
- 建议定期检查任务库，及时分配待处理任务
