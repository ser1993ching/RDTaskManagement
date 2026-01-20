## Context

本变更是从localStorage数据源迁移到数据库+API数据源的关键变更。当前状态：

- 前端使用`dataService`直接从localStorage读写数据
- 已存在`apiDataService.ts`框架代码
- 后端已完成RESTful API实现（Users, Tasks, Projects等）
- 用户期望删除内存用户，使用数据库用户登录

### 约束条件
- 直接使用apiDataService，不再使用unifiedDataService回退层
- 管理员账号需要能首次登录（数据库为空时）
- 登录流程需要处理加载状态和错误提示

## Goals / Non-Goals

### Goals
- 用户从数据库users表登录验证
- 前端通过API获取所有业务数据
- 直接使用apiDataService，简化架构
- 提供测试数据生成脚本

### Non-Goals
- 不实现完整的JWT刷新机制（后续优化）
- 不修改现有UI组件样式
- 不实现用户注册功能（仅管理员添加）

## Decisions

### 1. 登录流程变更

**决策**: 修改App.tsx的handleLogin，优先使用API登录

```typescript
// App.tsx 修改
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError('');
  setIsLoading(true);

  try {
    const result = await apiDataService.login(loginId, loginPwd);
    if (result) {
      setCurrentUser(result.user);
      await refreshData();  // 改为异步
      setLoginError('');
    } else {
      setLoginError('用户名或密码错误');
    }
  } catch (error) {
    setLoginError('登录失败，请稍后重试');
  } finally {
    setIsLoading(false);
  }
};
```

**替代方案考虑**:
- 创建独立的登录页面组件 - 被否决，保持现有登录表单简单性
- 使用React Context管理认证状态 - 被否决，当前prop drilling已足够

### 2. 数据获取方式

**决策**: App.tsx使用`apiDataService`异步获取数据

```typescript
// App.tsx 修改
const refreshData = async () => {
  const [users, projects, tasks] = await Promise.all([
    apiDataService.getUsers(),
    apiDataService.getProjects(),
    apiDataService.getTasks()
  ]);
  setUsers(users);
  setProjects(projects);
  setTasks(tasks);
};
```

### 3. 测试数据生成

**决策**: 创建Bash脚本通过API生成测试数据

```bash
#!/bin/bash
# scripts/generate-test-data.sh

# 1. 创建管理员
curl -X POST "$API_BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"userID":"admin","name":"管理员","password":"admin123","systemRole":"ADMIN",...}'

# 2. 创建普通用户
# 3. 创建项目
# 4. 创建任务
```

### 4. 管理员首次登录

**决策**: 后端AuthController处理数据库为空的情况

```csharp
// AuthController.cs
if (!_userService.Any(u => !u.IsDeleted))
{
    // 数据库为空，创建默认管理员
    var admin = new User {
        UserID = "admin",
        Name = "管理员",
        Password = "admin123",  // 实际应加密
        SystemRole = SystemRole.ADMIN
    };
    _userService.Add(admin);
}
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 后端未启动时无法使用 | 用户无法登录和使用系统 | 开发环境需确保后端已启动 |
| JWT Token过期 | 用户被登出 | 添加错误处理和重新登录提示 |
| 数据库连接失败 | 无法登录 | 开发环境提示检查数据库 |

## Migration Plan

### 步骤1: 修改登录逻辑
1. App.tsx添加loading状态
2. handleLogin改为async，调用apiDataService.login
3. 处理登录错误和异常

### 步骤2: 修改数据获取
1. refreshData改为async
2. 使用Promise.all并行获取数据
3. 添加错误处理

### 步骤3: 创建测试数据脚本
1. 编写users生成脚本
2. 编写projects生成脚本
3. 编写tasks生成脚本

### 步骤4: 验证集成
1. 启动后端服务
2. 执行测试数据脚本
3. 启动前端，验证登录和数据展示

## Open Questions

- [ ] Q1: 是否需要保留管理员默认密码admin123？
- [ ] Q2: 测试数据脚本是否需要支持重置数据？
- [ ] Q3: 后端是否需要自动创建默认管理员账号？
