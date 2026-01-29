# API接口问题解决方案

本文档提供前后端API接口问题的具体修复方案。

---

## 一、严重问题修复

### 1.1 请求DTO字段命名修复

#### 问题描述
后端请求DTO使用PascalCase + ID后缀，与前端camelCase不匹配。

#### 解决方案

**文件: `backend/src/Application/DTOs/Tasks/CreateTaskRequest.cs`**

```csharp
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Tasks;

/// <summary>
/// 创建任务请求
/// </summary>
public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;  // 改为 TaskClassId

    [Required]
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    [JsonPropertyName("projectId")]
    public string? ProjectId { get; set; }  // 改为 ProjectId

    [JsonPropertyName("assigneeId")]
    public string? AssigneeId { get; set; }  // 改为 AssigneeId

    [JsonPropertyName("assigneeName")]
    public string? AssigneeName { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [JsonPropertyName("difficulty")]
    [Range(0.5, 3.0)]
    public decimal? Difficulty { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("isForceAssessment")]
    public bool? IsForceAssessment { get; set; }

    // 角色分配
    [JsonPropertyName("checkerId")]
    public string? CheckerId { get; set; }  // 改为 CheckerId

    [JsonPropertyName("chiefDesignerId")]
    public string? ChiefDesignerId { get; set; }  // 改为 ChiefDesignerId

    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }  // 改为 ApproverId

    // 差旅任务
    [JsonPropertyName("travelLocation")]
    public string? TravelLocation { get; set; }

    [JsonPropertyName("travelDuration")]
    public decimal? TravelDuration { get; set; }

    [JsonPropertyName("travelLabel")]
    public string? TravelLabel { get; set; }

    // 会议任务
    [JsonPropertyName("meetingDuration")]
    public decimal? MeetingDuration { get; set; }

    [JsonPropertyName("participants")]
    public List<string>? Participants { get; set; }

    // 市场任务
    [JsonPropertyName("capacityLevel")]
    public string? CapacityLevel { get; set; }

    [JsonPropertyName("relatedProject")]
    public string? RelatedProject { get; set; }

    [JsonPropertyName("isIndependentBusinessUnit")]
    public bool IsIndependentBusinessUnit { get; set; }

    // 工作量
    [JsonPropertyName("workload")]
    public decimal? Workload { get; set; }
}
```

**文件: `backend/src/Application/DTOs/TaskPool/CreateTaskPoolItemRequest.cs`**

```csharp
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskPool;

/// <summary>
/// 创建任务库项请求
/// </summary>
public class CreateTaskPoolItemRequest
{
    [Required]
    [MaxLength(200)]
    [JsonPropertyName("taskName")]
    public string TaskName { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("taskClassId")]
    public string TaskClassId { get; set; } = string.Empty;  // 改为 TaskClassId

    [MaxLength(100)]
    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("projectId")]
    public string? ProjectId { get; set; }  // 改为 ProjectId

    [JsonPropertyName("projectName")]
    public string? ProjectName { get; set; }

    [JsonPropertyName("personInChargeId")]
    public string? PersonInChargeId { get; set; }  // 改为 PersonInChargeId

    [JsonPropertyName("personInChargeName")]
    public string? PersonInChargeName { get; set; }

    [JsonPropertyName("checkerId")]
    public string? CheckerId { get; set; }  // 改为 CheckerId

    [JsonPropertyName("checkerName")]
    public string? CheckerName { get; set; }

    [JsonPropertyName("chiefDesignerId")]
    public string? ChiefDesignerId { get; set; }  // 改为 ChiefDesignerId

    [JsonPropertyName("chiefDesignerName")]
    public string? ChiefDesignerName { get; set; }

    [JsonPropertyName("approverId")]
    public string? ApproverId { get; set; }  // 改为 ApproverId

    [JsonPropertyName("approverName")]
    public string? ApproverName { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("dueDate")]
    public DateTime? DueDate { get; set; }

    [JsonPropertyName("isForceAssessment")]
    public bool IsForceAssessment { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    // 创建人信息（来自前端）
    [JsonPropertyName("createdBy")]
    public string? CreatedBy { get; set; }

    [JsonPropertyName("createdByName")]
    public string? CreatedByName { get; set; }

    [JsonPropertyName("createdDate")]
    public DateTime? CreatedDate { get; set; }
}
```

**文件: `backend/src/Application/DTOs/Users/CreateUserRequest.cs`**

```csharp
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 创建用户请求
/// </summary>
public class CreateUserRequest
{
    [Required]
    [MaxLength(50)]
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;  // 改为 UserId

    [Required]
    [MaxLength(100)]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;  // 添加 JsonPropertyName

    [Required]
    [JsonPropertyName("systemRole")]
    public string SystemRole { get; set; } = string.Empty;  // 添加 JsonPropertyName

    [Required]
    [JsonPropertyName("officeLocation")]
    public string OfficeLocation { get; set; } = string.Empty;  // 添加 JsonPropertyName

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("joinDate")]
    public DateTime? JoinDate { get; set; }

    [Required]
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;  // 添加 JsonPropertyName

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("school")]
    public string? School { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }
}
```

---

### 1.2 响应DTO字段命名修复

#### 问题描述
后端响应DTO缺少`[JsonPropertyName]`特性，导致JSON输出为PascalCase。

#### 解决方案

**文件: `backend/src/Application/DTOs/Users/UserDto.cs`**

```csharp
using System.Text.Json.Serialization;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Users;

/// <summary>
/// 用户DTO
/// </summary>
public class UserDto
{
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;  // 添加 JsonPropertyName

    [JsonPropertyName("systemRole")]
    public SystemRole SystemRole { get; set; }  // 添加 JsonPropertyName

    [JsonPropertyName("officeLocation")]
    public OfficeLocation OfficeLocation { get; set; }  // 添加 JsonPropertyName

    [JsonPropertyName("title")]
    public string? Title { get; set; }

    [JsonPropertyName("joinDate")]
    public string? JoinDate { get; set; }  // 添加 JsonPropertyName

    [JsonPropertyName("status")]
    public PersonnelStatus Status { get; set; }  // 添加 JsonPropertyName

    [JsonPropertyName("education")]
    public string? Education { get; set; }

    [JsonPropertyName("school")]
    public string? School { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }
}
```

**文件: `backend/src/Application/DTOs/Projects/ProjectDto.cs`**

```csharp
using System.Text.Json.Serialization;
using TaskManageSystem.Domain.Enums;

namespace TaskManageSystem.Application.DTOs.Projects;

/// <summary>
/// 项目DTO
/// </summary>
public class ProjectDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("category")]
    public ProjectCategory Category { get; set; }

    [JsonPropertyName("workNo")]
    public string? WorkNo { get; set; }

    [JsonPropertyName("capacity")]
    public string? Capacity { get; set; }

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("isWon")]
    public bool IsWon { get; set; }

    [JsonPropertyName("isForeign")]
    public bool IsForeign { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime? StartDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime? EndDate { get; set; }

    [JsonPropertyName("remark")]
    public string? Remark { get; set; }

    [JsonPropertyName("isCommissioned")]
    public bool IsCommissioned { get; set; }

    [JsonPropertyName("isCompleted")]
    public bool IsCompleted { get; set; }

    [JsonPropertyName("isKeyProject")]
    public bool IsKeyProject { get; set; }
}
```

**文件: `backend/src/Application/DTOs/TaskClasses/TaskClassDto.cs`**

```csharp
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别DTO
/// </summary>
public class TaskClassDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("notice")]
    public string? Notice { get; set; }
}
```

**文件: `backend/src/Application/DTOs/TaskClasses/TaskClassListResponse.cs`**

```csharp
using System.Text.Json.Serialization;

namespace TaskManageSystem.Application.DTOs.TaskClasses;

/// <summary>
/// 任务类别列表响应
/// </summary>
public class TaskClassListResponse
{
    [JsonPropertyName("taskClasses")]
    public List<TaskClassDto> TaskClasses { get; set; } = new();

    [JsonPropertyName("categories")]
    public Dictionary<string, List<string>> Categories { get; set; } = new();
}
```

---

## 二、一般问题修复

### 2.1 API路由大小写统一

#### 问题描述
前端使用小写 `/api/taskclasses`，后端使用 PascalCase `/api/TaskClasses`。

#### 解决方案

**方案A: 修改后端路由为小写（推荐）**

修改控制器中的路由属性：

```csharp
// TasksController.cs
[ApiController]
[Route("api/[controller]")]  // 自动转为小写
public class TasksController : ControllerBase
```

或者显式指定小写路由：

```csharp
[ApiController]
[Route("api/tasks")]  // 显式小写
public class TasksController : ControllerBase
```

**方案B: 修改前端路由为PascalCase**

修改前端API配置文件中的端点路径。

**推荐方案A**，符合RESTful最佳实践。

### 2.2 路由参数名统一

#### 问题描述
前端使用 `projectId`，后端使用 `{id}`。

#### 解决方案

**文件: `backend/src/Api/Controllers/ProjectsController.cs`**

```csharp
[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    // 统一使用 projectId 作为路由参数名
    [HttpGet("{projectId}")]
    public async Task<ActionResult<ProjectDto>> GetProject(string projectId)
    {
        // ...
    }

    [HttpPut("{projectId}")]
    public async Task<IActionResult> UpdateProject(string projectId, UpdateProjectRequest request)
    {
        // ...
    }

    [HttpDelete("{projectId}")]
    public async Task<IActionResult> DeleteProject(string projectId)
    {
        // ...
    }

    [HttpGet("{projectId}/in-use")]
    public async Task<ActionResult<ProjectInUseResponse>> CheckProjectInUse(string projectId)
    {
        // ...
    }
}
```

同理修改 TaskPoolController 和 TaskClassesController。

### 2.3 前端TaskClass类型修复

#### 问题描述
前端TaskClass接口使用snake_case。

#### 解决方案

**文件: `frontend/src/services/api/taskClasses.ts`**

```typescript
export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  notice?: string;
  isDeleted?: boolean;      // 改为 isDeleted
  createdAt?: string;       // 改为 createdAt
  updatedAt?: string;       // 改为 updatedAt
}
```

**文件: `frontend/src/types.ts`**

```typescript
export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  notice?: string;
  isDeleted?: boolean;      // 改为 isDeleted
  createdAt?: string;       // 改为 createdAt
  updatedAt?: string;       // 改为 updatedAt
}
```

---

## 三、响应格式统一方案

### 3.1 统一使用包装格式

建议所有API统一使用 `{ success, data, message }` 包装格式。

**修改后端统一响应处理：**

在 `Program.cs` 中配置全局响应包装：

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// 使用自定义全局异常处理和响应包装
builder.Services.AddScoped<IApiResponseFactory, ApiResponseFactory>();
```

**前端统一处理：**

`frontend/src/services/api/client.ts` 已实现自动提取 `data` 字段，无需修改。

### 3.2 分页响应统一格式

建议所有列表查询统一使用以下格式：

```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "pages": 5
}
```

---

## 四、修复优先级

| 优先级 | 问题 | 影响范围 | 预计工时 |
|--------|------|----------|----------|
| P0 | CreateTaskRequest 字段命名 | 任务创建功能 | 10分钟 |
| P0 | CreateTaskPoolItemRequest 字段命名 | 任务库创建功能 | 10分钟 |
| P0 | CreateUserRequest 字段命名 | 用户创建功能 | 5分钟 |
| P0 | ProjectDto JsonPropertyName | 项目显示功能 | 10分钟 |
| P0 | TaskClassDto JsonPropertyName | 任务分类显示功能 | 5分钟 |
| P1 | UserDto 剩余字段 | 用户显示功能 | 5分钟 |
| P1 | TaskClassListResponse | 分类列表显示 | 5分钟 |
| P2 | API路由大小写 | 所有功能 | 15分钟 |
| P2 | 路由参数名统一 | 所有功能 | 10分钟 |
| P3 | 前端TaskClass类型 | 分类管理功能 | 5分钟 |
| P3 | 响应格式统一 | 所有功能 | 30分钟 |

---

## 五、验证清单

修复完成后，验证以下场景：

### 5.1 任务管理
- [ ] 创建任务成功，字段正确保存
- [ ] 获取任务列表，字段正确显示
- [ ] 编辑任务，字段更新正确
- [ ] 删除任务正常

### 5.2 用户管理
- [ ] 创建用户成功
- [ ] 用户列表显示正确
- [ ] 用户信息编辑正确

### 5.3 项目管理
- [ ] 项目创建成功
- [ ] 项目列表显示正确
- [ ] 项目编辑正确

### 5.4 任务库管理
- [ ] 创建任务库项成功
- [ ] 任务库列表显示正确
- [ ] 分配任务功能正常

### 5.5 任务分类管理
- [ ] 分类列表显示正确
- [ ] 分类创建/编辑/删除正常

---

## 六、自动化测试建议

建议添加API接口测试，确保前后端字段匹配：

```csharp
// 示例：CreateTaskRequest 字段映射测试
[Fact]
public void CreateTaskRequest_ShouldHaveCamelCaseJsonProperties()
{
    var request = new CreateTaskRequest
    {
        TaskClassId = "TC001",
        ProjectId = "P001",
        // ...
    };

    var json = JsonSerializer.Serialize(request);
    var parsed = JsonDocument.Parse(json);

    Assert.True(parsed.RootElement.TryGetProperty("taskClassId", out _));
    Assert.True(parsed.RootElement.TryGetProperty("projectId", out _));
    Assert.False(parsed.RootElement.TryGetProperty("TaskClassID", out _));
}
```

---

*文档生成时间: 2026-01-26*
