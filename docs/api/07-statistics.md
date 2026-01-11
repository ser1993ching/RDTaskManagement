# 统计与个人工作台模块 API 文档

## 概述

统计与个人工作台模块提供个人任务统计、团队统计、数据导出等功能。支持按时间段（本周/本月/近三个月/近半年/本年度/近一年半）统计任务数据。

---

## TypeScript 类型定义

```typescript
// 时间周期类型
export type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'yearAndHalf';

// 类别分布项
export interface CategoryDistributionItem {
  name: string;                 // 类别名称
  count: number;                // 任务数量
  percentage: number;           // 占比（百分比）
}

// 差旅统计
export interface TravelStats {
  totalDays: number;            // 总出差天数
  workHoursInPeriod: number;    // 周期内工作时长
  percentage: number;           // 占工作时长比例
}

// 会议统计
export interface MeetingStats {
  totalHours: number;           // 总会议时长
  workHoursInPeriod: number;    // 周期内工作时长
  percentage: number;           // 占工作时长比例
}

// 月度趋势项
export interface MonthlyTrendItem {
  month: string;                // 月份 (YYYY-MM)
  assigned: number;             // 指派任务数
  completed: number;            // 完成任务数
}

// 每日趋势项
export interface DailyTrendItem {
  day: string;                  // 日期 (MM/DD)
  assigned: number;             // 指派任务数
  completed: number;            // 完成任务数
}

// 团队成员统计项
export interface TeamMemberStats {
  userId: string;               // 用户ID
  userName: string;             // 用户姓名
  totalCount: number;           // 任务总数
  completedCount: number;       // 已完成数量
  completionRate: number;       // 完成率
  workload: number;             // 工作量（小时）
}

// 个人统计数据
export interface PersonalStats {
  inProgressCount: number;      // 进行中任务数量
  pendingCount: number;         // 未开始任务数量
  completedCount: number;       // 已完成任务数量
  totalCount: number;           // 任务总数
  completionRate: number;       // 完成率（百分比）
  categoryDistribution: CategoryDistributionItem[]; // 类别分布
  travelStats: TravelStats;     // 差旅统计
  meetingStats: MeetingStats;   // 会议统计
  monthlyTrend: MonthlyTrendItem[]; // 月度趋势
}

// 按状态分离的任务
export interface SeparatedTasks {
  inProgress: import('./04-tasks').Task[];
  pending: import('./04-tasks').Task[];
  completed: import('./04-tasks').Task[];
}

// 团队统计
export interface TeamStats {
  totalTasks: number;           // 团队任务总数
  completedTasks: number;       // 已完成任务数
  completionRate: number;       // 完成率
  byUser: TeamMemberStats[];    // 按成员分类的统计
  byCategory: CategoryDistributionItem[]; // 按类别分类的统计
  overdueTasks: import('./04-tasks').Task[]; // 逾期任务列表
  longRunningTasks: import('./04-tasks').Task[]; // 长期任务列表
}

// 工作量分布
export interface WorkloadDistribution {
  byUser: TeamMemberStats[];    // 按成员分类的工作量
  byCategory: CategoryDistributionItem[]; // 按类别分类的工作量
  totalWorkload: number;        // 总工作量（小时）
}

// 工作日信息
export interface WorkDayInfo {
  workDays: number;             // 工作日数量
  workHours: number;            // 工作时长（小时）
}

// 差旅统计响应
export interface TravelStatisticsResponse {
  totalDays: number;            // 总出差天数
  totalTasks: number;           // 差旅任务数量
  byCategory: Record<string, number>; // 按出差类型分类
  byProject: Record<string, number>; // 按项目分类
  trend: MonthlyTrendItem[];    // 月度趋势
}

// 会议统计响应
export interface MeetingStatisticsResponse {
  totalHours: number;           // 总会议时长
  totalTasks: number;           // 会议任务数量
  byCategory: Record<string, number>; // 按会议类型分类
  trend: MonthlyTrendItem[];    // 月度趋势
}

// 趋势响应
export interface TrendResponse {
  trend: MonthlyTrendItem[] | DailyTrendItem[];
}

// 拖延/长期任务响应
export interface DelayedTasksResponse {
  tasks: import('./04-tasks').Task[];
  count: number;                // 任务数量
}

// 导出请求
export interface ExportStatisticsRequest {
  userId: string;               // 用户ID
  period: Period;               // 时间周期
  format?: 'csv';               // 导出格式，默认csv
}

// 个人统计查询参数
export interface PersonalStatsQueryParams {
  userId: string;
  period?: Period;
}

// 团队统计查询参数
export interface TeamStatsQueryParams {
  period?: Period;
  officeLocation?: string;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.Statistics
{
    /// <summary>
    /// 时间周期枚举
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

    /// <summary>
    /// 类别分布项
    /// </summary>
    public class CategoryDistributionItem
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// 差旅统计
    /// </summary>
    public class TravelStats
    {
        public decimal TotalDays { get; set; }
        public decimal WorkHoursInPeriod { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// 会议统计
    /// </summary>
    public class MeetingStats
    {
        public decimal TotalHours { get; set; }
        public decimal WorkHoursInPeriod { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// 月度趋势项
    /// </summary>
    public class MonthlyTrendItem
    {
        public string Month { get; set; } = string.Empty;  // YYYY-MM
        public int Assigned { get; set; }
        public int Completed { get; set; }
    }

    /// <summary>
    /// 每日趋势项
    /// </summary>
    public class DailyTrendItem
    {
        public string Day { get; set; } = string.Empty;  // MM/DD
        public int Assigned { get; set; }
        public int Completed { get; set; }
    }

    /// <summary>
    /// 团队成员统计项
    /// </summary>
    public class TeamMemberStats
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public int TotalCount { get; set; }
        public int CompletedCount { get; set; }
        public double CompletionRate { get; set; }
        public decimal Workload { get; set; }
    }

    /// <summary>
    /// 个人统计数据
    /// </summary>
    public class PersonalStats
    {
        public int InProgressCount { get; set; }
        public int PendingCount { get; set; }
        public int CompletedCount { get; set; }
        public int TotalCount { get; set; }
        public double CompletionRate { get; set; }
        public List<CategoryDistributionItem> CategoryDistribution { get; set; } = new();
        public TravelStats TravelStats { get; set; } = new();
        public MeetingStats MeetingStats { get; set; } = new();
        public List<MonthlyTrendItem> MonthlyTrend { get; set; } = new();
    }

    /// <summary>
    /// 团队统计
    /// </summary>
    public class TeamStats
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public double CompletionRate { get; set; }
        public List<TeamMemberStats> ByUser { get; set; } = new();
        public List<CategoryDistributionItem> ByCategory { get; set; } = new();
        public List<TaskDto> OverdueTasks { get; set; } = new();
        public List<TaskDto> LongRunningTasks { get; set; } = new();
    }

    /// <summary>
    /// 工作量分布
    /// </summary>
    public class WorkloadDistribution
    {
        public List<TeamMemberStats> ByUser { get; set; } = new();
        public List<CategoryDistributionItem> ByCategory { get; set; } = new();
        public decimal TotalWorkload { get; set; }
    }

    /// <summary>
    /// 工作日信息
    /// </summary>
    public class WorkDayInfo
    {
        public int WorkDays { get; set; }
        public int WorkHours { get; set; }
    }

    /// <summary>
    /// 差旅统计响应
    /// </summary>
    public class TravelStatisticsResponse
    {
        public decimal TotalDays { get; set; }
        public int TotalTasks { get; set; }
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public Dictionary<string, int> ByProject { get; set; } = new();
        public List<MonthlyTrendItem> Trend { get; set; } = new();
    }

    /// <summary>
    /// 会议统计响应
    /// </summary>
    public class MeetingStatisticsResponse
    {
        public decimal TotalHours { get; set; }
        public int TotalTasks { get; set; }
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public List<MonthlyTrendItem> Trend { get; set; } = new();
    }

    /// <summary>
    /// 拖延任务响应
    /// </summary>
    public class DelayedTasksResponse
    {
        public List<TaskDto> Tasks { get; set; } = new();
        public int Count { get; set; }
    }

    /// <summary>
    /// 导出统计请求
    /// </summary>
    public class ExportStatisticsRequest
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public Period Period { get; set; }

        public string? Format { get; set; }  // csv
    }
}
```

---

## 数据模型

### PersonalStats 对象结构

| 字段名 | 类型 | 描述 |
|--------|------|------|
| inProgressCount | number | 进行中任务数量 |
| pendingCount | number | 未开始任务数量 |
| completedCount | number | 已完成任务数量 |
| totalCount | number | 任务总数 |
| completionRate | number | 完成率（百分比） |
| categoryDistribution | object[] | 类别分布数据 |
| travelStats | object | 差旅统计 |
| meetingStats | object | 会议统计 |
| monthlyTrend | object[] | 月度趋势数据 |

### CategoryDistribution 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| name | string | 类别名称 |
| count | number | 任务数量 |
| percentage | number | 占比（百分比） |

### TravelStats 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| totalDays | number | 总出差天数 |
| workHoursInPeriod | number | 周期内工作时长 |
| percentage | number | 占工作时长比例 |

### MeetingStats 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| totalHours | number | 总会议时长 |
| workHoursInPeriod | number | 周期内工作时长 |
| percentage | number | 占工作时长比例 |

### MonthlyTrend 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| month | string | 月份（YYYY-MM） |
| assigned | number | 指派任务数 |
| completed | number | 完成任务数 |

### SeparatedTasks 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| inProgress | Task[] | 进行中任务列表 |
| pending | Task[] | 未开始任务列表 |
| completed | Task[] | 已完成任务列表 |

---

## API 接口列表

### 1. 获取个人统计

**接口路径:** `GET /api/statistics/personal`

**描述:** 获取指定用户的个人任务统计数据。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| period | string | 否 | 时间周期（week/month/quarter/halfYear/year/yearAndHalf），默认month |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| stats | PersonalStats | 个人统计数据 |

**响应示例:**
```json
{
  "stats": {
    "inProgressCount": 8,
    "pendingCount": 5,
    "completedCount": 12,
    "totalCount": 25,
    "completionRate": 48,
    "categoryDistribution": [
      { "name": "市场配合", "count": 5, "percentage": 20 },
      { "name": "常规项目执行", "count": 8, "percentage": 32 },
      { "name": "核电项目执行", "count": 4, "percentage": 16 },
      { "name": "科研任务", "count": 3, "percentage": 12 },
      { "name": "改造服务", "count": 2, "percentage": 8 },
      { "name": "其他", "count": 3, "percentage": 12 }
    ],
    "travelStats": {
      "totalDays": 5,
      "workHoursInPeriod": 176,
      "percentage": 3
    },
    "meetingStats": {
      "totalHours": 12,
      "workHoursInPeriod": 176,
      "percentage": 7
    },
    "monthlyTrend": [
      { "month": "2025-08", "assigned": 4, "completed": 3 },
      { "month": "2025-09", "assigned": 5, "completed": 4 },
      { "month": "2025-10", "assigned": 6, "completed": 5 },
      { "month": "2025-11", "assigned": 4, "completed": 3 },
      { "month": "2025-12", "assigned": 7, "completed": 4 },
      { "month": "2026-01", "assigned": 3, "completed": 2 }
    ]
  }
}
```

---

### 2. 获取个人任务列表（按状态分离）

**接口路径:** `GET /api/statistics/personal/tasks`

**描述:** 获取个人任务列表，按状态分类。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| period | string | 否 | 时间周期 |
| status | string | 否 | 状态过滤（inProgress/pending/completed） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | SeparatedTasks | 按状态分离的任务列表 |

---

### 3. 获取差旅统计

**接口路径:** `GET /api/statistics/travel`

**描述:** 获取差旅任务统计信息。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 否 | 用户ID，不提供则获取全部 |
| period | string | 否 | 时间周期 |
| ProjectID | string | 否 | 按项目过滤 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| totalDays | number | 总出差天数 |
| totalTasks | number | 差旅任务数量 |
| byCategory | object | 按出差类型分类 |
| byProject | object | 按项目分类 |
| trend | object[] | 月度趋势 |

---

### 4. 获取会议统计

**接口路径:** `GET /api/statistics/meetings`

**描述:** 获取会议任务统计信息。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 否 | 用户ID |
| period | string | 否 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| totalHours | number | 总会议时长 |
| totalTasks | number | 会议任务数量 |
| byCategory | object | 按会议类型分类 |
| trend | object[] | 月度趋势 |

---

### 5. 获取团队统计

**接口路径:** `GET /api/statistics/team`

**描述:** 获取团队整体统计信息（班组长/管理员可用）。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| period | string | 否 | 时间周期 |
| officeLocation | string | 否 | 工作地点过滤 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| totalTasks | number | 团队任务总数 |
| completedTasks | number | 已完成任务数 |
| completionRate | number | 完成率 |
| byUser | object[] | 按成员分类的统计 |
| byCategory | object[] | 按类别分类的统计 |
| overdueTasks | Task[] | 逾期任务列表 |
| longRunningTasks | Task[] | 长期任务列表 |

**byUser 数组项:**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| userId | string | 用户ID |
| userName | string | 用户姓名 |
| totalCount | number | 任务总数 |
| completedCount | number | 已完成数量 |
| completionRate | number | 完成率 |
| workload | number | 工作量 |

---

### 6. 获取工作量分布

**接口路径:** `GET /api/statistics/workload`

**描述:** 获取团队成员工作量分布（班组长/管理员可用）。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| period | string | 否 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| byUser | object[] | 按成员分类的工作量 |
| byCategory | object[] | 按类别分类的工作量 |
| totalWorkload | number | 总工作量 |

---

### 7. 获取月度趋势

**接口路径:** `GET /api/statistics/trend/monthly`

**描述:** 获取任务月度趋势数据。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 否 | 用户ID，不提供则获取团队数据 |
| months | number | 否 | 月数，默认6 |
| period | string | 否 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| trend | MonthlyTrend[] | 月度趋势数据 |

---

### 8. 获取每日趋势

**接口路径:** `GET /api/statistics/trend/daily`

**描述:** 获取每日任务趋势（适用于周/月视图）。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| days | number | 否 | 天数，默认7 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| trend | DailyTrend[] | 每日趋势数据 |

### DailyTrend 对象

| 字段名 | 类型 | 描述 |
|--------|------|------|
| day | string | 日期（MM/DD） |
| assigned | number | 指派任务数 |
| completed | number | 完成任务数 |

---

### 9. 获取工作日信息

**接口路径:** `GET /api/statistics/workdays`

**描述:** 获取指定周期内的工作日信息。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| period | string | 是 | 时间周期 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| workDays | number | 工作日数量 |
| workHours | number | 工作时长（小时） |

---

### 10. 导出统计数据

**接口路径:** `POST /api/statistics/export`

**描述:** 导出个人统计数据为CSV文件。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| period | string | 是 | 时间周期 |
| format | string | 否 | 导出格式（csv），默认csv |

**响应:** 文件下载

---

### 11. 获取拖延任务清单

**接口路径:** `GET /api/statistics/delayed-tasks`

**描述:** 获取长期未完成的任务清单。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 否 | 用户ID，不提供则获取团队数据 |
| daysThreshold | number | 否 | 拖延天数阈值，默认60天 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | Task[] | 拖延任务列表 |
| count | number | 任务数量 |

---

### 12. 获取逾期任务

**接口路径:** `GET /api/statistics/overdue-tasks`

**描述:** 获取已逾期的任务列表。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 否 | 用户ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| tasks | Task[] | 逾期任务列表 |
| count | number | 任务数量 |

---

## 枚举值说明

### Period (时间周期)

| 值 | 描述 | 计算方式 |
|----|------|----------|
| week | 本周 | 从本周一开始 |
| month | 本月 | 从本月第一天开始 |
| quarter | 近三个月 | 当前日期往前3个月 |
| halfYear | 近半年 | 当前日期往前6个月 |
| year | 本年度 | 从今年1月1日开始 |
| yearAndHalf | 近一年半 | 当前日期往前18个月 |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 个人统计 | 仅自己 | 仅自己 | 仅自己 |
| 团队统计 | 否 | 本班组 | 全部 |
| 工作量分布 | 否 | 本班组 | 全部 |
| 导出统计数据 | 仅自己 | 本班组 | 全部 |
| 查看拖延任务 | 仅自己 | 本班组 | 全部 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问他人数据 |
| 403 | 无权限访问（组员访问团队统计） |
| 500 | 服务器内部错误 |

---

## 备注

- 差旅统计排除会议培训任务（TC007/TC009）
- 完成率 = 已完成任务数 / 任务总数 * 100%
- 工作日计算：周一至周五，节假日按工作日计算
- 长期任务定义：创建时间超过2个月且未完成，或开始时间超过2个月且开始
- 导出功能状态为未支持CSV格式，包含任务概览、差旅统计、会议统计、类别分布和任务列表
