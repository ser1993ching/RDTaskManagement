# 系统设置模块 API 文档

## 概述

系统设置模块提供系统配置管理功能，包括机型管理、容量等级管理、差旅标签管理、用户头像管理、数据初始化等功能。

---

## 配置项与程序关系说明

### 1. 配置项总览

| 配置项 | 存储Key | 数据类型 | 用途 | 关联前端组件 |
|--------|---------|----------|------|--------------|
| 机型列表 | rd_equipment_models | string[] | 任务创建时下拉选项（市场配合项目） | TaskView, ProjectView |
| 容量等级 | rd_capacity_levels | string[] | 任务创建时下拉选项（市场配合项目） | TaskView, ProjectView |
| 差旅标签 | rd_travel_labels | string[] | 差旅任务分类统计 | TaskView, Statistics |
| 用户头像 | rd_user_avatars | object | 用户头像存储 | PersonnelView, Layout |
| 任务二级分类 | rd_task_categories | object | 任务类别管理 | TaskView, Settings |
| 默认分类提示 | task_class_notices | object | 各任务类别自定义提示 | TaskView |

### 2. 字段与程序逻辑关系

#### 2.1 机型 (Equipment Models)

**存储结构:**
```json
["Francis", "Pelton", "Kaplan", "Nuclear Steam Turbine", "CAP1400", "HTR Steam Turbine", "AP1000", "Pump-Turbine", "Rotary"]
```

**使用场景:**
- `TaskView.tsx`: 创建/编辑市场配合项目(TC001)任务时，选择机型
- `ProjectView.tsx`: 创建/编辑市场配合项目时，选择机型
- `dataService.ts`: getEquipmentModels() 获取机型列表

**业务规则:**
- 机型与容量等级关联，不同机型可能有不同的容量等级选项
- 机型影响后续设计流程的配置

#### 2.2 容量等级 (Capacity Levels)

**存储结构:**
```json
["50MW", "100MW", "170MW", "200MW", "300MW", "400MW", "500MW", "550MW", "600MW", "700MW", "770MW", "800MW", "850MW", "1000MW", "1100MW", "1200MW", "1400MW"]
```

**使用场景:**
- `TaskView.tsx`: 市场配合任务选择容量等级
- `ProjectView.tsx`: 项目选择容量等级
- `Dashboard.tsx`: 按容量等级统计项目分布

**业务规则:**
- 容量等级影响项目分类和统计
- 市场配合项目必须选择容量等级

#### 2.3 差旅标签 (Travel Labels)

**存储结构:**
```json
["市场配合出差", "常规项目执行出差", "核电项目执行出差", "科研出差", "改造服务出差", "其他任务出差"]
```

**使用场景:**
- `TaskView.tsx`: 创建差旅任务(TC009)时选择标签
- `Statistics.tsx`: 差旅任务分类统计
- `Dashboard.tsx`: 差旅统计图表

**业务规则:**
- 差旅标签用于区分不同类型的出差
- 与任务类别(Travel)下的二级分类对应

#### 2.4 任务二级分类 (Task Categories)

**存储结构:**
```json
{
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
```

**使用场景:**
- `TaskView.tsx`: 创建任务时选择二级分类
- `Settings.tsx`: 管理二级分类（增删改排序）
- `dataService.ts`: getTaskCategories() 获取分类

**业务规则:**
- 每个任务类别(TC001-TC010)对应一个二级分类数组
- 二级分类可动态增删，系统自动更新
- 删除二级分类时不影响已有任务的该分类值

#### 2.5 任务类别提示 (Class Notices)

**存储结构:**
```json
{
  "TC001": "提示文字内容...",
  "TC002": "提示文字内容..."
}
```

**使用场景:**
- `TaskView.tsx`: 在对应类别任务区域显示提示
- `Settings.tsx`: 编辑任务类别时可设置提示

**业务规则:**
- 可选配置，不设置则不显示提示
- 用于向用户展示特定类别任务的注意事项

### 3. 数据初始化流程

```
┌─────────────────────────────────────────────────────────────┐
│                    系统首次启动                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ dataService.initializeData()                                │
│ - 检查 localStorage 是否存在数据                            │
│ - 不存在则调用 seedInitialData()                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ seedInitialData() 执行以下初始化:                           │
│ 1. 初始化用户 (rd_users) - 3个种子用户                      │
│ 2. 初始化项目 (rd_projects) - 示例项目                      │
│ 3. 初始化任务 (rd_tasks) - 示例任务                         │
│ 4. 初始化任务类别 (rd_task_classes) - 10个预置类别          │
│ 5. 初始化机型 (rd_equipment_models)                         │
│ 6. 初始化容量等级 (rd_capacity_levels)                      │
│ 7. 初始化差旅标签 (rd_travel_labels)                        │
│ 8. 初始化任务分类 (rd_task_categories)                      │
│ 9. 初始化任务库 (rd_task_pool)                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. 配置项API对照表

| API端点 | 关联配置项 | dataService方法 | 前端使用位置 |
|---------|------------|-----------------|--------------|
| GET /api/settings/equipment-models | rd_equipment_models | getEquipmentModels() | TaskView, ProjectView |
| POST /api/settings/equipment-models | rd_equipment_models | addEquipmentModel() | Settings |
| DELETE /api/settings/equipment-models | rd_equipment_models | removeEquipmentModel() | Settings |
| GET /api/settings/capacity-levels | rd_capacity_levels | getCapacityLevels() | TaskView, ProjectView |
| POST /api/settings/capacity-levels | rd_capacity_levels | addCapacityLevel() | Settings |
| DELETE /api/settings/capacity-levels | rd_capacity_levels | removeCapacityLevel() | Settings |
| GET /api/settings/travel-labels | rd_travel_labels | getTravelLabels() | TaskView, Statistics |
| POST /api/settings/travel-labels | rd_travel_labels | addTravelLabel() | Settings |
| DELETE /api/settings/travel-labels | rd_travel_labels | removeTravelLabel() | Settings |
| GET /api/settings/avatars/{userId} | rd_user_avatars | getUserAvatar() | PersonnelView, Layout |
| POST /api/settings/avatars/{userId} | rd_user_avatars | saveUserAvatar() | Settings |
| DELETE /api/settings/avatars/{userId} | rd_user_avatars | deleteUserAvatar() | Settings |
| GET /api/task-categories | rd_task_categories | getTaskCategories() | TaskView, Settings |
| PUT /api/task-categories/{code} | rd_task_categories | updateTaskCategories() | Settings |

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.Settings
{
    /// <summary>
    /// 机型管理
    /// </summary>
    public class EquipmentModelsResponse
    {
        public List<string> Models { get; set; } = new();
    }

    public class AddEquipmentModelRequest
    {
        [Required]
        public string Model { get; set; } = string.Empty;
    }

    public class BatchAddEquipmentModelsRequest
    {
        [Required]
        public List<string> Models { get; set; } = new();
    }

    /// <summary>
    /// 容量等级管理
    /// </summary>
    public class CapacityLevelsResponse
    {
        public List<string> Levels { get; set; } = new();
    }

    public class AddCapacityLevelRequest
    {
        [Required]
        public string Level { get; set; } = string.Empty;
    }

    public class BatchAddCapacityLevelsRequest
    {
        [Required]
        public List<string> Levels { get; set; } = new();
    }

    /// <summary>
    /// 差旅标签管理
    /// </summary>
    public class TravelLabelsResponse
    {
        public List<string> Labels { get; set; } = new();
    }

    public class AddTravelLabelRequest
    {
        [Required]
        public string Label { get; set; } = string.Empty;
    }

    /// <summary>
    /// 用户头像管理
    /// </summary>
    public class UserAvatarResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string? Avatar { get; set; }  // Base64编码
    }

    public class SaveUserAvatarRequest
    {
        [Required]
        public string Avatar { get; set; } = string.Empty;  // Base64编码
    }

    /// <summary>
    /// 任务分类管理
    /// </summary>
    public class TaskCategoriesResponse
    {
        public Dictionary<string, List<string>> Categories { get; set; } = new();
    }

    public class UpdateTaskCategoriesRequest
    {
        [Required]
        public List<string> Categories { get; set; } = new();
    }

    public class TaskCategoryItem
    {
        public string TaskClassCode { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = new();
    }

    /// <summary>
    /// 任务类别提示管理
    /// </summary>
    public class TaskClassNoticesResponse
    {
        public Dictionary<string, string> Notices { get; set; } = new();
    }

    public class UpdateTaskClassNoticeRequest
    {
        public string? Notice { get; set; }
    }

    /// <summary>
    /// 系统配置
    /// </summary>
    public class SystemConfigResponse
    {
        public string Version { get; set; } = string.Empty;
        public SystemFeatures Features { get; set; } = new();
        public SystemLimits Limits { get; set; } = new();
    }

    public class SystemFeatures
    {
        public bool EnableTravelManagement { get; set; } = true;
        public bool EnableProjectManagement { get; set; } = true;
        public bool EnableTaskPool { get; set; } = true;
        public bool EnableStatistics { get; set; } = true;
    }

    public class SystemLimits
    {
        public int MaxTasksPerPage { get; set; } = 100;
        public int MaxFileUploadSize { get; set; } = 5242880;  // 5MB
        public int AvatarMaxSize { get; set; } = 1048576;  // 1MB
    }

    public class UpdateSystemConfigRequest
    {
        public SystemFeatures? Features { get; set; }
        public SystemLimits? Limits { get; set; }
    }

    /// <summary>
    /// 数据管理
    /// </summary>
    public class ResetDataResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class RefreshTasksResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class DataMigrationResponse
    {
        public bool Success { get; set; }
        public int Migrated { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// 导入导出
    /// </summary>
    public class ImportConfigRequest
    {
        [Required]
        public Dictionary<string, object> Config { get; set; } = new();
        public bool Overwrite { get; set; } = false;
    }

    public class ImportConfigResponse
    {
        public bool Success { get; set; }
        public int Imported { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// 统一响应
    /// </summary>
    public class SettingsApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public string? Error { get; set; }
    }
}
```

### .NET 后端实现建议

```csharp
namespace R&DTaskSystem.Infrastructure.Repositories
{
    /// <summary>
    /// 系统配置仓储接口
    /// </summary>
    public interface ISystemConfigRepository
    {
        Task<List<string>> GetEquipmentModelsAsync();
        Task AddEquipmentModelAsync(string model);
        Task RemoveEquipmentModelAsync(string model);
        Task BatchAddEquipmentModelsAsync(IEnumerable<string> models);

        Task<List<string>> GetCapacityLevelsAsync();
        Task AddCapacityLevelAsync(string level);
        Task RemoveCapacityLevelAsync(string level);

        Task<List<string>> GetTravelLabelsAsync();
        Task AddTravelLabelAsync(string label);
        Task RemoveTravelLabelAsync(string label);

        Task<string?> GetUserAvatarAsync(string userId);
        Task SaveUserAvatarAsync(string userId, string avatarBase64);
        Task DeleteUserAvatarAsync(string userId);

        Task<Dictionary<string, List<string>>> GetTaskCategoriesAsync();
        Task UpdateTaskCategoriesAsync(string taskClassCode, List<string> categories);

        Task<Dictionary<string, string>> GetTaskClassNoticesAsync();
        Task UpdateTaskClassNoticeAsync(string taskClassId, string? notice);
    }

    /// <summary>
    /// 系统配置服务
    /// </summary>
    public interface ISystemConfigService
    {
        Task<EquipmentModelsResponse> GetEquipmentModelsAsync();
        Task<SettingsApiResponse<object>> AddEquipmentModelAsync(AddEquipmentModelRequest request);
        Task<SettingsApiResponse<object>> DeleteEquipmentModelAsync(string model);

        Task<CapacityLevelsResponse> GetCapacityLevelsAsync();
        Task<SettingsApiResponse<object>> AddCapacityLevelAsync(AddCapacityLevelRequest request);
        Task<SettingsApiResponse<object>> DeleteCapacityLevelAsync(string level);

        Task<TravelLabelsResponse> GetTravelLabelsAsync();
        Task<SettingsApiResponse<object>> AddTravelLabelAsync(AddTravelLabelRequest request);
        Task<SettingsApiResponse<object>> DeleteTravelLabelAsync(string label);

        Task<UserAvatarResponse?> GetUserAvatarAsync(string userId);
        Task<SettingsApiResponse<object>> SaveUserAvatarAsync(string userId, SaveUserAvatarRequest request);
        Task<SettingsApiResponse<object>> DeleteUserAvatarAsync(string userId);

        Task<TaskCategoriesResponse> GetTaskCategoriesAsync();
        Task<SettingsApiResponse<object>> UpdateTaskCategoriesAsync(string code, UpdateTaskCategoriesRequest request);

        Task<SystemConfigResponse> GetSystemConfigAsync();
        Task<SettingsApiResponse<object>> UpdateSystemConfigAsync(UpdateSystemConfigRequest request);
    }
}
```

---

## API 接口列表

### 1. 机型管理

#### 获取机型列表

**接口路径:** `GET /api/settings/equipment-models`

**描述:** 获取所有机型配置。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| models | string[] | 机型列表 |

**响应示例:**
```json
{
  "models": [
    "Francis",
    "Pelton",
    "Kaplan",
    "Nuclear Steam Turbine",
    "CAP1400",
    "HTR Steam Turbine",
    "AP1000",
    "Pump-Turbine",
    "Rotary"
  ]
}
```

#### 添加机型

**接口路径:** `POST /api/settings/equipment-models`

**描述:** 添加新机型。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| model | string | 是 | 机型名称 |

**请求示例:**
```json
{
  "model": "New Model"
}
```

#### 删除机型

**接口路径:** `DELETE /api/settings/equipment-models/{model}`

**描述:** 删除机型。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| model | string | 是 | 机型名称 |

---

### 2. 容量等级管理

#### 获取容量等级列表

**接口路径:** `GET /api/settings/capacity-levels`

**描述:** 获取所有容量等级配置。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| levels | string[] | 容量等级列表 |

**响应示例:**
```json
{
  "levels": [
    "50MW",
    "100MW",
    "170MW",
    "200MW",
    "300MW",
    "400MW",
    "500MW",
    "550MW",
    "600MW",
    "700MW",
    "770MW",
    "800MW",
    "850MW",
    "1000MW",
    "1100MW",
    "1200MW",
    "1400MW"
  ]
}
```

#### 添加容量等级

**接口路径:** `POST /api/settings/capacity-levels`

**描述:** 添加新容量等级。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| level | string | 是 | 容量等级 |

#### 删除容量等级

**接口路径:** `DELETE /api/settings/capacity-levels/{level}`

**描述:** 删除容量等级。

---

### 3. 差旅标签管理

#### 获取差旅标签列表

**接口路径:** `GET /api/settings/travel-labels`

**描述:** 获取所有差旅标签配置。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| labels | string[] | 差旅标签列表 |

#### 添加差旅标签

**接口路径:** `POST /api/settings/travel-labels`

**描述:** 添加差旅标签。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| label | string | 是 | 标签名称 |

#### 删除差旅标签

**接口路径:** `DELETE /api/settings/travel-labels/{label}`

**描述:** 删除差旅标签。

---

### 4. 用户头像管理

#### 获取用户头像

**接口路径:** `GET /api/settings/avatars/{userId}`

**描述:** 获取用户头像数据。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

**响应:** 头像图片文件或base64编码

#### 上传用户头像

**接口路径:** `POST /api/settings/avatars/{userId}`

**描述:** 上传用户头像。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| avatar | string | 是 | base64编码的图片数据 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 是否成功 |

#### 删除用户头像

**接口路径:** `DELETE /api/settings/avatars/{userId}`

**描述:** 删除用户头像。

---

### 5. 数据管理

#### 重新初始化所有数据

**接口路径:** `POST /api/settings/reset-all-data`

**描述:** 将所有数据重置为初始种子数据（保留当前用户会话）。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 是否成功 |
| message | string | 响应消息 |

---

#### 刷新任务数据

**接口路径:** `POST /api/settings/refresh-tasks`

**描述:** 强制刷新任务数据（从种子数据重新加载）。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 是否成功 |
| message | string | 响应消息 |

---

#### 数据迁移

**接口路径:** `POST /api/settings/migrate`

**描述:** 执行数据字段迁移（如旧字段名到新字段名的迁移）。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 是否成功 |
| migrated | number | 迁移的记录数 |
| message | string | 响应消息 |

---

### 6. 系统配置

#### 获取系统配置

**接口路径:** `GET /api/settings/system`

**描述:** 获取系统基本配置。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| version | string | 系统版本 |
| features | object | 功能开关 |
| limits | object | 限制配置 |

---

#### 更新系统配置

**接口路径:** `PUT /api/settings/system`

**描述:** 更新系统基本配置（仅管理员）。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| features | object | 否 | 功能开关 |
| limits | object | 否 | 限制配置 |

---

### 7. 批量操作

#### 批量添加机型

**接口路径:** `POST /api/settings/equipment-models/batch`

**描述:** 批量添加机型。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| models | string[] | 是 | 机型名称列表 |

#### 批量添加容量等级

**接口路径:** `POST /api/settings/capacity-levels/batch`

**描述:** 批量添加容量等级。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| levels | string[] | 是 | 容量等级列表 |

---

### 8. 导入导出

#### 导出所有配置

**接口路径:** `GET /api/settings/export`

**描述:** 导出所有系统配置。

**响应:** JSON文件下载

---

#### 导入配置

**接口路径:** `POST /api/settings/import`

**描述:** 导入系统配置。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| config | object | 是 | 配置数据 |
| overwrite | boolean | 否 | 是否覆盖现有配置，默认false |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看机型列表 | 是 | 是 | 是 |
| 管理机型 | 否 | 否 | 是 |
| 查看容量等级 | 是 | 是 | 是 |
| 管理容量等级 | 否 | 否 | 是 |
| 查看差旅标签 | 是 | 是 | 是 |
| 管理差旅标签 | 否 | 否 | 是 |
| 管理个人头像 | 仅自己 | 仅自己 | 仅自己 |
| 重置数据 | 否 | 否 | 是 |
| 系统配置 | 否 | 否 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 配置项不存在 |
| 409 | 配置项已存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 机型、容量等级、差旅标签用于任务创建时的下拉选项
- 用户头像支持base64编码上传
- 数据重置功能会保留当前登录用户会话
- 数据迁移用于兼容旧版本数据格式
- 建议定期备份系统配置
