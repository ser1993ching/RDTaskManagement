# 设置板块(Settings)前后端API数据匹配修复方案

## 问题1: 任务类别管理API

### 现状
- 前端: 使用 `taskClassService` 调用 `/api/TaskClasses`
- 后端: 有独立的 `TaskClassesController`
- 结论: ✅ 设计正确，无需修改

前端代码 (`taskClasses.ts`):
```typescript
async getTaskClasses(): Promise<TaskClass[]> {
  const response = await apiClient.get<any>('/api/TaskClasses');
  return response.taskClasses || [];
}
```

---

## 问题2: 密码修改功能 (Bug修复)

### 问题描述
`authService.changePassword` 方法不存在，但 `apiDataService.ts` 第1054行调用了它。

### 修复方案

#### 步骤1: 在 auth.ts 中添加 changePassword 方法

**文件**: `frontend/src/services/api/auth.ts`

```typescript
/**
 * 修改密码请求
 */
export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // ... 现有代码 ...

  /**
   * 修改密码
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<object>>(
        '/api/auth/change-password',
        { userId, currentPassword, newPassword }
      );
      return response.success || false;
    } catch (error) {
      console.error('修改密码失败:', error);
      return false;
    }
  }
}
```

#### 步骤2: 更新 auth.ts 导出的类型定义

在 `auth.ts` 中添加 ChangePasswordRequest 接口（或者从 config.ts 导入）。

#### 步骤3: 验证后端ChangePasswordRequest DTO

**文件**: `backend/src/Application/DTOs/Users/ChangePasswordRequest.cs` (确认存在)

```csharp
public class ChangePasswordRequest
{
    public string UserId { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
```

---

## 修复优先级

| 优先级 | 问题 | 修复内容 | 工作量 |
|--------|------|---------|--------|
| P0 | 密码修改功能Bug | auth.ts中添加changePassword方法 | 15分钟 |
| P1 | settings.ts类型定义 | 更新为camelCase | 10分钟 |
| - | 任务类别API | 无需修改（设计正确） | - |

---

## 修复验证步骤

1. **密码修改功能**:
   - 前端调用 `apiDataService.changePassword()`
   - 发送请求到 `/api/auth/change-password`
   - 后端验证当前密码，成功返回success

2. **Settings API响应**:
   - GET `/api/settings/equipment-models` 返回 `{ "models": [...] }`
   - GET `/api/settings/capacity-levels` 返回 `{ "levels": [...] }`
   - GET `/api/settings/travel-labels` 返回 `{ "labels": [...] }`

---

**方案制定日期**: 2026-01-24
**作者**: Claude Code
