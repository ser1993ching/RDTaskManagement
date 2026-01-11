# 项目管理模块 API 文档

## 概述

项目管理模块提供项目的增删改查功能，支持按项目类型分类管理。

---

## TypeScript 类型定义

```typescript
// 项目类型枚举
export enum ProjectCategory {
  MARKET = '市场配合项目',
  EXECUTION = '常规项目',
  NUCLEAR = '核电项目',
  RESEARCH = '科研项目',
  RENOVATION = '改造项目',
  OTHER = '其他项目'
}

// 项目对象接口
export interface Project {
  id: string;                   // 项目ID (PK)，格式: P-YYYYMMDD-XXXX
  name: string;                 // 项目名称
  category: ProjectCategory;    // 项目类型
  workNo?: string;              // 工作号
  capacity?: string;            // 容量等级 (如 1000MW)
  model?: string;               // 机型 (如 Francis, Kaplan)
  isWon?: boolean;              // 是否中标（市场配合项目）
  isForeign?: boolean;          // 是否外贸（市场配合项目）
  startDate?: string;           // 开始日期 (YYYY-MM-DD)
  endDate?: string;             // 截止/首台投运日期 (YYYY-MM-DD)
  remark?: string;              // 备注
  isCommissioned?: boolean;     // 是否已投运（常规/核电项目）
  isCompleted?: boolean;        // 是否已完成（科研/改造/其他项目）
  isKeyProject?: boolean;       // 是否重点项目
  is_deleted?: boolean;         // 软删除标记
  created_at?: string;          // 创建时间
  updated_at?: string;          // 更新时间
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string;
  category: ProjectCategory;
  workNo?: string;
  capacity?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
  remark?: string;
  isKeyProject?: boolean;

  // 市场配合项目特有
  isWon?: boolean;
  isForeign?: boolean;

  // 常规/核电项目特有
  isCommissioned?: boolean;

  // 科研/改造/其他项目特有
  isCompleted?: boolean;
}

// 更新项目请求
export interface UpdateProjectRequest {
  name?: string;
  category?: ProjectCategory;
  workNo?: string;
  capacity?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
  remark?: string;
  isKeyProject?: boolean;
  isWon?: boolean;
  isForeign?: boolean;
  isCommissioned?: boolean;
  isCompleted?: boolean;
}

// 项目查询参数
export interface ProjectQueryParams {
  category?: ProjectCategory;
  includeDeleted?: boolean;
  search?: string;
  isKeyProject?: boolean;
  sortBy?: 'startDate' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// 项目列表响应
export interface ProjectsListResponse {
  projects: Project[];
  total: number;
}

// 项目详情响应
export interface ProjectDetailResponse {
  project: Project;
  tasks?: import('./04-tasks').Task[]; // 关联的任务列表
}

// 项目使用情况响应
export interface ProjectUsageResponse {
  taskCount: number;   // 关联的任务数量
  canDelete: boolean;  // 是否可以删除
}

// 项目统计响应
export interface ProjectStatisticsResponse {
  total: number;               // 项目总数
  byCategory: Record<string, number>; // 按类型分类的数量
  keyProjects: number;         // 重点项目数量
  completed: number;           // 已完成项目数量
}

// 创建/更新/删除响应
export interface ProjectActionResponse {
  success: boolean;
  project?: Project;
  message: string;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.Projects
{
    /// <summary>
    /// 项目数据传输对象
    /// </summary>
    public class ProjectDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? WorkNo { get; set; }
        public string? Capacity { get; set; }
        public string? Model { get; set; }
        public bool IsWon { get; set; }
        public bool IsForeign { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Remark { get; set; }
        public bool IsCommissioned { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsKeyProject { get; set; }
    }

    /// <summary>
    /// 创建项目请求
    /// </summary>
    public class CreateProjectRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string? WorkNo { get; set; }
        public string? Capacity { get; set; }
        public string? Model { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Remark { get; set; }
        public bool IsKeyProject { get; set; }

        // 市场配合项目特有
        public bool IsWon { get; set; }
        public bool IsForeign { get; set; }

        // 常规/核电项目特有
        public bool IsCommissioned { get; set; }

        // 科研/改造/其他项目特有
        public bool IsCompleted { get; set; }
    }

    /// <summary>
    /// 更新项目请求
    /// </summary>
    public class UpdateProjectRequest
    {
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? WorkNo { get; set; }
        public string? Capacity { get; set; }
        public string? Model { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Remark { get; set; }
        public bool IsKeyProject { get; set; }
        public bool IsWon { get; set; }
        public bool IsForeign { get; set; }
        public bool IsCommissioned { get; set; }
        public bool IsCompleted { get; set; }
    }

    /// <summary>
    /// 项目查询参数
    /// </summary>
    public class ProjectQueryParams : PaginationQuery
    {
        public string? Category { get; set; }
        public bool? IsKeyProject { get; set; }
        public string? SortBy { get; set; }  // startDate, name
        public string? SortOrder { get; set; }  // asc, desc
    }

    /// <summary>
    /// 项目统计响应
    /// </summary>
    public class ProjectStatisticsResponse
    {
        public int Total { get; set; }
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public int KeyProjects { get; set; }
        public int Completed { get; set; }
    }
}
```

---

## 数据模型

### Project 对象结构

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 项目ID（主键） |
| name | string | 是 | 项目名称 |
| category | string | 是 | 项目类型 |
| workNo | string | 否 | 工作号 |
| capacity | string | 否 | 容量等级（如1000MW） |
| model | string | 否 | 机型（如Francis、Kaplan） |
| isWon | boolean | 否 | 是否中标（市场配合项目） |
| isForeign | boolean | 否 | 是否外贸（市场配合项目） |
| startDate | string | 否 | 开始日期（YYYY-MM-DD） |
| endDate | string | 否 | 截止/首台投运日期 |
| remark | string | 否 | 备注 |
| isCommissioned | boolean | 否 | 是否已投运（常规/核电项目） |
| isCompleted | boolean | 否 | 是否已完成（科研/改造/其他项目） |
| isKeyProject | boolean | 否 | 是否重点项目 |
| is_deleted | boolean | 否 | 是否已删除（软删除标记） |

---

## API 接口列表

### 1. 获取项目列表

**接口路径:** `GET /api/projects`

**描述:** 获取所有项目列表，支持多条件过滤和排序。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| category | string | 否 | 按项目类型过滤 |
| includeDeleted | boolean | 否 | 是否包含已删除项目，默认false |
| search | string | 否 | 搜索关键词（匹配项目名称） |
| isKeyProject | boolean | 否 | 是否重点项目 |
| sortBy | string | 否 | 排序字段（startDate/name） |
| sortOrder | string | 否 | 排序方向（asc/desc），默认desc |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| projects | Project[] | 项目列表 |
| total | number | 项目总数 |

**响应示例:**
```json
{
  "projects": [
    {
      "id": "P001",
      "name": "某国外抽水蓄能电站投标项目",
      "category": "市场配合项目",
      "workNo": "MARKET-2025-001",
      "capacity": "1200MW",
      "model": "Francis",
      "isWon": true,
      "isForeign": true,
      "startDate": "2025-01-15",
      "endDate": "2025-06-30",
      "remark": "海外大型抽水蓄能项目"
    },
    {
      "id": "P006",
      "name": "白鹤滩水电站左岸机组制造",
      "category": "常规项目",
      "workNo": "EXECUTION-2025-001",
      "capacity": "1000MW",
      "model": "Francis",
      "isCommissioned": false,
      "startDate": "2025-01-05",
      "endDate": "2025-12-20"
    }
  ],
  "total": 30
}
```

---

### 2. 获取单个项目

**接口路径:** `GET /api/projects/{id}`

**描述:** 根据项目ID获取项目详细信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| project | Project | 项目详细信息 |
| tasks | Task[] | 关联的任务列表（可选） |

---

### 3. 创建项目

**接口路径:** `POST /api/projects`

**描述:** 创建新项目。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| name | string | 是 | 项目名称 |
| category | string | 是 | 项目类型 |
| workNo | string | 否 | 工作号 |
| capacity | string | 否 | 容量等级 |
| model | string | 否 | 机型 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 截止日期 |
| remark | string | 否 | 备注 |
| isKeyProject | boolean | 否 | 是否重点项目 |

**类型特定字段（根据category提供）:**

| category | 字段名 | 类型 | 描述 |
|----------|--------|------|------|
| 市场配合项目 | isWon | boolean | 是否中标 |
| 市场配合项目 | isForeign | boolean | 是否外贸 |
| 常规项目 | isCommissioned | boolean | 是否已投运 |
| 核电项目 | isCommissioned | boolean | 是否已投运 |
| 科研项目 | isCompleted | boolean | 是否已完成 |
| 改造项目 | isCompleted | boolean | 是否已完成 |
| 其他项目 | isCompleted | boolean | 是否已完成 |

**请求示例:**
```json
{
  "name": "新投标项目",
  "category": "市场配合项目",
  "workNo": "MARKET-2025-006",
  "capacity": "800MW",
  "model": "Kaplan",
  "isWon": false,
  "isForeign": true,
  "startDate": "2025-06-01",
  "endDate": "2025-12-31",
  "remark": "测试项目"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 创建是否成功 |
| project | Project | 创建的项目信息 |
| message | string | 响应消息 |

---

### 4. 更新项目

**接口路径:** `PUT /api/projects/{id}`

**描述:** 更新项目信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**请求体:** 同创建项目，支持部分字段更新。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 更新是否成功 |
| project | Project | 更新后的项目信息 |
| message | string | 响应消息 |

---

### 5. 删除项目（软删除）

**接口路径:** `DELETE /api/projects/{id}`

**描述:** 软删除项目。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 删除是否成功 |
| message | string | 响应消息 |

---

### 6. 检查项目使用情况

**接口路径:** `GET /api/projects/{id}/usage`

**描述:** 检查项目是否被任务引用，用于删除前确认。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 项目ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| taskCount | number | 关联的任务数量 |
| canDelete | boolean | 是否可以删除 |

---

### 7. 获取项目统计信息

**接口路径:** `GET /api/projects/statistics`

**描述:** 获取项目统计信息。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| category | string | 否 | 按项目类型过滤 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| total | number | 项目总数 |
| byCategory | object | 按类型分类的数量 |
| keyProjects | number | 重点项目数量 |
| completed | number | 已完成项目数量 |

**响应示例:**
```json
{
  "total": 30,
  "byCategory": {
    "市场配合项目": 5,
    "常规项目": 5,
    "核电项目": 5,
    "科研项目": 5,
    "改造项目": 5,
    "其他项目": 5
  },
  "keyProjects": 8,
  "completed": 12
}
```

---

## 枚举值说明

### ProjectCategory (项目类型)

| 值 | 描述 |
|----|------|
| 市场配合项目 | 市场投标相关项目 |
| 常规项目 | 常规项目执行 |
| 核电项目 | 核电相关项目 |
| 科研项目 | 科研课题项目 |
| 改造项目 | 改造服务项目 |
| 其他项目 | 其他类型项目 |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看项目列表 | 仅关联项目 | 本班组 | 全部 |
| 查看项目详情 | 仅关联项目 | 本班组 | 全部 |
| 创建项目 | 否 | 是 | 是 |
| 更新项目 | 否 | 是 | 是 |
| 删除项目 | 否 | 是 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 项目不存在 |
| 409 | 项目ID已存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 项目ID自动生成，格式为 `P-YYYYMMDD-XXXX`
- 软删除机制：所有删除操作均为软删除
- 市场配合项目关联任务时会自动继承项目的容量等级
- 按开始日期降序排列（最新在前）
