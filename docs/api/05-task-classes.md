# 任务类别管理模块 API 文档

## 概述

任务类别管理模块提供任务类别（TaskClass）和二级分类的增删改查功能。系统预置10个主要任务类别，每个类别下有多个二级分类。

---

## TypeScript 类型定义

```typescript
// 任务类别代码枚举
export enum TaskClassCode {
  MARKET = 'MARKET',           // 市场配合
  EXECUTION = 'EXECUTION',     // 常规项目执行
  NUCLEAR = 'NUCLEAR',         // 核电项目执行
  PRODUCT_DEV = 'PRODUCT_DEV', // 产品研发
  RESEARCH = 'RESEARCH',       // 科研任务
  RENOVATION = 'RENOVATION',   // 改造服务
  MEETING_TRAINING = 'MEETING_TRAINING', // 内部会议与培训
  ADMIN_PARTY = 'ADMIN_PARTY', // 行政与党建
  TRAVEL = 'TRAVEL',           // 差旅任务
  OTHER = 'OTHER'              // 其他任务
}

// 任务类别对象接口
export interface TaskClass {
  id: string;               // 类别ID (PK)，格式: TC001, TC002...
  name: string;             // 类别名称
  code: TaskClassCode;      // 类别代码
  description?: string;     // 类别描述
  notice?: string;          // 自定义提示文字（显示在任务管理界面）
  is_deleted?: boolean;     // 软删除标记
  created_at?: string;      // 创建时间
  updated_at?: string;      // 更新时间
}

// 二级分类配置对象
export interface TaskCategory {
  id: number;               // 主键
  taskClassCode: TaskClassCode; // 关联任务类别代码
  categoryName: string;     // 二级分类名称
  sortOrder: number;        // 排序顺序
  created_at?: string;      // 创建时间
}

// 任务类别查询参数
export interface TaskClassQueryParams {
  includeDeleted?: boolean;
}

// 任务类别列表响应
export interface TaskClassListResponse {
  taskClasses: TaskClass[];
  categories: Record<TaskClassCode, string[]>; // 各分类的二级分类配置
}

// 任务类别详情响应
export interface TaskClassDetailResponse {
  taskClass: TaskClass;
  categories: string[];     // 该类别的二级分类列表
}

// 创建任务类别请求
export interface CreateTaskClassRequest {
  id: string;               // 类别ID（格式：TCXXX）
  name: string;
  code: TaskClassCode;
  description?: string;
  notice?: string;
  categories?: string[];    // 初始二级分类列表
}

// 更新任务类别请求
export interface UpdateTaskClassRequest {
  name?: string;
  description?: string;
  notice?: string;
}

// 添加二级分类请求
export interface AddCategoryRequest {
  category: string;         // 二级分类名称
}

// 更新二级分类名称请求
export interface UpdateCategoryNameRequest {
  newName: string;          // 新分类名称
}

// 重新排序二级分类请求
export interface ReorderCategoriesRequest {
  order: string[];          // 新的分类顺序数组
}

// 更新二级分类配置请求
export interface UpdateCategoriesRequest {
  categories: string[];     // 新的二级分类列表
}

// 任务类别使用情况响应
export interface TaskClassUsageResponse {
  hasTasks: boolean;        // 是否有任务使用该类别
  taskCount: number;        // 使用该类别的任务数量
  taskClassCode: TaskClassCode; // 类别代码
}

// 任务类别操作响应
export interface TaskClassActionResponse {
  success: boolean;
  taskClass?: TaskClass;
  message: string;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.TaskClasses
{
    /// <summary>
    /// 任务类别代码枚举
    /// </summary>
    public enum TaskClassCode
    {
        [Display(Name = "MARKET")]
        Market = 0,

        [Display(Name = "EXECUTION")]
        Execution = 1,

        [Display(Name = "NUCLEAR")]
        Nuclear = 2,

        [Display(Name = "PRODUCT_DEV")]
        ProductDev = 3,

        [Display(Name = "RESEARCH")]
        Research = 4,

        [Display(Name = "RENOVATION")]
        Renovation = 5,

        [Display(Name = "MEETING_TRAINING")]
        MeetingTraining = 6,

        [Display(Name = "ADMIN_PARTY")]
        AdminParty = 7,

        [Display(Name = "TRAVEL")]
        Travel = 8,

        [Display(Name = "OTHER")]
        Other = 9
    }

    /// <summary>
    /// 任务类别数据传输对象
    /// </summary>
    public class TaskClassDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Notice { get; set; }
    }

    /// <summary>
    /// 创建任务类别请求
    /// </summary>
    public class CreateTaskClassRequest
    {
        [Required]
        [MaxLength(20)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Notice { get; set; }
        public List<string>? Categories { get; set; }
    }

    /// <summary>
    /// 更新任务类别请求
    /// </summary>
    public class UpdateTaskClassRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Notice { get; set; }
    }

    /// <summary>
    /// 添加二级分类请求
    /// </summary>
    public class AddCategoryRequest
    {
        [Required]
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// 更新二级分类名称请求
    /// </summary>
    public class UpdateCategoryNameRequest
    {
        [Required]
        public string NewName { get; set; } = string.Empty;
    }

    /// <summary>
    /// 重新排序二级分类请求
    /// </summary>
    public class ReorderCategoriesRequest
    {
        [Required]
        public List<string> Order { get; set; } = new();
    }

    /// <summary>
    /// 更新二级分类配置请求
    /// </summary>
    public class UpdateCategoriesRequest
    {
        [Required]
        public List<string> Categories { get; set; } = new();
    }

    /// <summary>
    /// 任务类别列表响应
    /// </summary>
    public class TaskClassListResponse
    {
        public List<TaskClassDto> TaskClasses { get; set; } = new();
        public Dictionary<string, List<string>> Categories { get; set; } = new();
    }

    /// <summary>
    /// 任务类别使用情况响应
    /// </summary>
    public class TaskClassUsageResponse
    {
        public bool HasTasks { get; set; }
        public int TaskCount { get; set; }
        public string TaskClassCode { get; set; } = string.Empty;
    }
}
```

---

## 数据模型

### TaskClass 对象结构

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID（主键），如 TC001 |
| name | string | 是 | 类别名称 |
| code | string | 是 | 类别代码，如 MARKET |
| description | string | 否 | 类别描述 |
| notice | string | 否 | 自定义提示文字 |
| is_deleted | boolean | 否 | 是否已删除（软删除标记） |
| created_at | string | 否 | 创建时间 |
| updated_at | string | 否 | 更新时间 |

---

## API 接口列表

### 1. 获取任务类别列表

**接口路径:** `GET /api/task-classes`

**描述:** 获取所有任务类别列表。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| taskClasses | TaskClass[] | 任务类别列表 |
| categories | Record<string, string[]> | 各分类的二级分类配置 |

**响应示例:**
```json
{
  "taskClasses": [
    {
      "id": "TC001",
      "name": "市场配合",
      "code": "MARKET",
      "description": "市场配合相关任务",
      "notice": "注意：市场配合任务请确保关联正确的投标项目..."
    },
    {
      "id": "TC002",
      "name": "常规项目执行",
      "code": "EXECUTION",
      "description": "常规项目执行相关任务",
      "notice": "注意：任务名称请遵循 '[项目名]-[任务类别]' 格式..."
    }
  ],
  "categories": {
    "MARKET": ["标书", "复询", "技术方案", "其他"],
    "EXECUTION": ["搭建生产资料", "设计院提资", "CT配合与提资", "随机资料", "项目特殊项处理", "用户配合", "图纸会签", "传真回复", "其他"],
    "NUCLEAR": ["核电设计", "核安全审查", "设备调试", "常规岛配合", "核岛接口", "技术方案", "其他"],
    "PRODUCT_DEV": ["技术方案", "设计流程", "方案评审", "专利申请", "出图", "图纸改版", "设计总结"],
    "RESEARCH": ["开题报告", "专利申请", "结题报告", "其他"],
    "RENOVATION": ["前期项目配合", "方案编制", "其他"],
    "MEETING_TRAINING": ["学习与培训", "党建会议", "班务会", "设计评审会", "资料讨论会", "其他"],
    "ADMIN_PARTY": ["报表填报", "ppt汇报", "总结报告", "其他"],
    "TRAVEL": ["市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差"],
    "OTHER": ["通用任务"]
  }
}
```

---

### 2. 获取单个任务类别

**接口路径:** `GET /api/task-classes/{id}`

**描述:** 根据类别ID获取任务类别详情及二级分类。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| taskClass | TaskClass | 任务类别详情 |
| categories | string[] | 该类别的二级分类列表 |

---

### 3. 创建任务类别

**接口路径:** `POST /api/task-classes`

**描述:** 创建新的任务类别。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID（格式：TCXXX） |
| name | string | 是 | 类别名称 |
| code | string | 是 | 类别代码（大写英文） |
| description | string | 否 | 类别描述 |
| notice | string | 否 | 提示文字 |
| categories | string[] | 否 | 初始二级分类列表 |

**请求示例:**
```json
{
  "id": "TC011",
  "name": "新任务类别",
  "code": "NEW_CATEGORY",
  "description": "新任务类别描述",
  "categories": ["分类1", "分类2", "分类3"]
}
```

---

### 4. 更新任务类别

**接口路径:** `PUT /api/task-classes/{id}`

**描述:** 更新任务类别信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

**请求体:** 同创建任务类别，支持部分字段更新。

---

### 5. 删除任务类别（软删除）

**接口路径:** `DELETE /api/task-classes/{id}`

**描述:** 软删除任务类别。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

---

### 6. 检查任务类别使用情况

**接口路径:** `GET /api/task-classes/{id}/usage`

**描述:** 检查任务类别是否被任务引用，用于删除前确认。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| hasTasks | boolean | 是否有任务使用该类别 |
| taskCount | number | 使用该类别的任务数量 |
| taskClassCode | string | 类别代码 |

---

### 7. 添加二级分类

**接口路径:** `POST /api/task-classes/{id}/categories`

**描述:** 为任务类别添加新的二级分类。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| category | string | 是 | 二级分类名称 |

---

### 8. 删除二级分类

**接口路径:** `DELETE /api/task-classes/{id}/categories/{categoryName}`

**描述:** 删除任务类别下的某个二级分类。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |
| categoryName | string | 是 | 二级分类名称 |

---

### 9. 更新二级分类名称

**接口路径:** `PUT /api/task-classes/{id}/categories/{oldName}`

**描述:** 更新二级分类名称。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |
| oldName | string | 是 | 原分类名称 |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| newName | string | 是 | 新分类名称 |

---

### 10. 重新排序二级分类

**接口路径:** `PUT /api/task-classes/{id}/categories/order`

**描述:** 重新排列二级分类顺序。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | string | 是 | 类别ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| order | string[] | 是 | 新的分类顺序数组 |

---

### 11. 获取所有二级分类配置

**接口路径:** `GET /api/task-categories`

**描述:** 获取所有任务类别的二级分类配置。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| categories | Record<string, string[]> | 分类配置映射 |

---

### 12. 更新二级分类配置

**接口路径:** `PUT /api/task-categories/{code}`

**描述:** 更新整个类别的二级分类配置。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| code | string | 是 | 类别代码（如 MARKET） |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| categories | string[] | 是 | 新的二级分类列表 |

---

## 枚举值说明

### 预置任务类别

| ID | 代码 | 名称 | 二级分类数量 |
|----|------|------|-------------|
| TC001 | MARKET | 市场配合 | 4 |
| TC002 | EXECUTION | 常规项目执行 | 9 |
| TC003 | NUCLEAR | 核电项目执行 | 7 |
| TC004 | PRODUCT_DEV | 产品研发 | 7 |
| TC005 | RESEARCH | 科研任务 | 4 |
| TC006 | RENOVATION | 改造服务 | 3 |
| TC007 | MEETING_TRAINING | 内部会议与培训 | 6 |
| TC008 | ADMIN_PARTY | 行政与党建 | 4 |
| TC009 | TRAVEL | 差旅任务 | 6 |
| TC010 | OTHER | 其他任务 | 1 |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看类别列表 | 是 | 是 | 是 |
| 查看类别详情 | 是 | 是 | 是 |
| 创建类别 | 否 | 否 | 是 |
| 更新类别 | 否 | 否 | 是 |
| 删除类别 | 否 | 否 | 是 |
| 管理二级分类 | 否 | 否 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 任务类别不存在 |
| 409 | 类别ID或代码已存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 预置任务类别不可删除，只能软删除后无法使用
- 类别代码用于关联任务类别和二级分类配置
- 二级分类支持动态添加，创建新任务时会自动添加到配置中
- 删除二级分类时会同时从配置中移除
