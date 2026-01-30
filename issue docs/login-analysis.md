# 登录验证功能实现链条分析报告

## 一、功能实现链条概述

### 1.1 整体架构

本项目采用前后端分离架构：

| 层级 | 技术栈 | 端口 | 职责 |
|------|--------|------|------|
| 前端 | React 19 + TypeScript + Vite | 3000 | 登录表单、Token存储、请求发起 |
| 后端 | .NET 8 Web API | 5000 | 认证控制、用户验证、JWT生成 |

### 1.2 登录流程时序图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              登录验证流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  前端                                                         后端           │
│    │                                                           │             │
│    │  1. 用户输入账号密码                                        │             │
│    │     ├─ userId (工号/姓名)                                  │             │
│    │     └─ password                                           │             │
│    │                                                           │             │
│    │  2. apiDataService.login() ──────────────────────────────>│             │
│    │      ├─ authService.login()                               │             │
│    │      ├─ POST /api/auth/login                              │             │
│    │      └─ 超时控制: 10秒                                     │             │
│    │                                                           │             │
│    │                                              3. AuthController          │
│    │                                              4. UserService              │
│    │                                              ├─ 查询DefaultUsers (内存)  │
│    │                                              ├─ BCrypt密码验证            │
│    │                                              └─ 数据库回退查询            │
│    │                                                           │             │
│    │  5. 返回响应 ←────────────────────────────────────────────│             │
│    │      ├─ Token: "mock-jwt-token" (非真正JWT)               │             │
│    │      └─ UserInfo                                          │             │
│    │                                                           │             │
│    │  6. 保存Token到localStorage                                │             │
│    │      ├─ auth_token (apiClient)                            │             │
│    │      └─ rd_current_user (authService)                     │             │
│    │                                                           │             │
│    │  7. refreshData() 刷新应用数据                             │             │
│    │      ├─ 获取用户列表                                        │             │
│    │      ├─ 获取项目列表                                        │             │
│    │      └─ 获取任务列表                                        │             │
│    │                                                           │             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 关键代码路径

| 层级 | 文件路径 | 行号 | 功能 |
|------|----------|------|------|
| 前端 | `frontend/src/App.tsx` | 222-258 | 登录表单处理 + refreshData |
| 前端 | `frontend/src/services/apiDataService.ts` | 1078-1088 | 登录API调用 |
| 前端 | `frontend/src/services/api/auth.ts` | 45-104 | 认证服务 |
| 前端 | `frontend/src/services/api/client.ts` | 6, 72, 75-81 | 超时控制、Token存储 |
| 后端 | `backend/src/Api/Controllers/AuthController.cs` | 26-48 | 登录接口 |
| 后端 | `backend/src/Application/Services/UserService.cs` | 208-247 | 凭证验证 |
| 后端 | `backend/src/Infrastructure/Repositories/UserRepository.cs` | 83-100 | 用户数据访问 |
| 后端 | `backend/src/Api/Program.cs` | 46-49 | MySQL重试配置 |

---

## 二、登录验证失败原因分析

### 2.1 问题清单

| 问题类型 | 严重程度 | 影响范围 | 状态 |
|----------|----------|----------|------|
| 数据库连接重试导致长时间等待 | 🔴 高 | 所有登录请求 | 待修复 |
| JWT认证未真正实现 | 🔴 高 | 系统安全性 | 待修复 |
| localStorage Key不一致 | 🟡 中 | 用户信息持久化 | **已识别** |
| 认证中间件配置不完整 | 🟡 中 | Token验证 | 待修复 |
| 前端超时配置过短 | 🟡 中 | 网络慢时失败 | 待修复 |
| 无Token刷新机制 | 🟡 中 | 用户体验 | 待修复 |
| 内存用户优先策略 | 🟢 低 | 登录性能 | **已实现** |
| BCrypt密码验证 | 🟢 低 | 密码安全 | **已实现** |
| 健康检查端点 | 🟢 低 | 服务状态检测 | **已实现** |

### 2.2 数据库重试机制导致的长时间等待

**问题代码** (`backend/src/Api/Program.cs:46-49`):

```csharp
mysqlOptions.EnableRetryOnFailure(
    maxRetryCount: 3,              // 最多重试3次
    maxRetryDelay: TimeSpan.FromSeconds(10),  // 每次等待10秒
    errorNumbersToAdd: null);
```

**延迟分析**:
```
单次MySQL连接超时场景:
├─ 第1次尝试: 10秒
├─ 第2次尝试: 10秒
├─ 第3次尝试: 10秒
└─ 总计最大延迟: 30秒 ❌

前端超时: 10秒
└─ 结果: 前端在10秒时超时断开，后端仍在重试中
```

**根本原因**:
- 数据库服务未启动或网络不通时，每次连接尝试都会失败
- 10秒的重试间隔过长
- 前端10秒超时早于后端完成重试

**已缓解措施**:
- `UserService.ValidateCredentialsAsync` 优先检查内存用户
- 数据库查询失败时记录日志并继续使用内存用户

### 2.3 JWT认证未真正实现

**问题代码** (`backend/src/Api/Controllers/AuthController.cs:40-41`):

```csharp
Token = "mock-jwt-token"  // ⚠️ 硬编码模拟Token
```

**影响**:
1. **安全性缺失**: 所有登录都返回相同Token，无法验证用户身份
2. **无Token过期**: 永远不会过期
3. **无claims声明**: 无法存储用户角色等信息

**配置存在但未使用** (`backend/src/Api/appsettings.json`):

```json
"Jwt": {
  "SecretKey": "YourSecretKeyHere12345678901234567890",
  "Issuer": "R&DTaskSystem",
  "Audience": "R&DTaskSystemClient"
}
```

**问题**: 这些配置只是写在那里，实际代码中从未使用！

### 2.4 认证中间件缺失

**当前配置** (`backend/src/Api/Program.cs:87`):

```csharp
app.UseAuthorization();  // ⚠️ 只有UseAuthorization，没有UseAuthentication
```

**正确配置应该包含**:

```csharp
// 需要添加的配置 (当前缺失)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            // ...
        };
    });

app.UseAuthentication();  // 需要在UseAuthorization之前调用
```

### 2.5 前端超时配置矛盾

**配置冲突**:

| 位置 | 超时值 | 说明 |
|------|--------|------|
| `client.ts:6` | 10秒 | API客户端实际使用 |
| `config.ts:4` | 30秒 | API配置但未使用 |

**问题**: `client.ts` 中的 `TIMEOUT = 10000` 硬编码覆盖了 `API_CONFIG.timeout`，导致实际超时只有10秒。

### 2.6 localStorage Key不一致问题

**问题描述**: 前端使用两个不同的localStorage key存储认证信息

| Key | 使用位置 | 存储内容 |
|-----|----------|----------|
| `auth_token` | `client.ts:72, 78` | Token字符串 |
| `rd_current_user` | `auth.ts:68, 102` | 用户信息JSON |

**潜在风险**:
1. `App.tsx:262` 退出时只清除 `auth_token`，依赖 `authService.logout()` 清除 `rd_current_user`
2. 代码分散可能导致维护困难
3. 两个key的生命周期需要保持一致

### 2.7 登出功能分析

**当前实现** (`frontend/src/App.tsx:260-271`):

```typescript
const handleLogout = () => {
  apiDataService.logout();           // 清除token + rd_current_user
  localStorage.removeItem('auth_token');  // 双重保险
  setCurrentUser(null);
  setLoginId('');
  setLoginPwd('');
  setLoginError('');
  setCurrentView('dashboard');
  setUsers([]);
  setProjects([]);
  setTasks([]);
};
```

**问题**: 重复调用 `localStorage.removeItem`，建议统一由 `authService.logout()` 处理。

---

## 三、密码相关功能分析

### 3.1 密码验证流程

**已实现**: BCrypt密码散列验证 (`UserService.cs:214`)

```csharp
if (BCrypt.Net.BCrypt.Verify(password, defaultUser.PasswordHash))
{
    return _mapper.Map<UserDto>(defaultUser);
}
```

### 3.2 密码修改功能

**接口**: `POST /api/auth/change-password`

**请求体**:
```json
{
  "userId": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

**实现逻辑** (`UserService.cs:249-269`):
1. 验证当前密码
2. 使用BCrypt加密新密码
3. 更新到数据库或内存用户

### 3.3 密码重置功能

**接口**: `POST /api/auth/reset-password`

**请求体**:
```json
{
  "userId": "string",
  "newPassword": "string"  // 可选，默认为 "123456"
}
```

**注意**: 密码重置无需验证当前密码，应仅限管理员使用。

---

## 四、已实现功能清单

以下功能已在代码中实现，文档需要同步更新：

| 功能 | 实现位置 | 状态 |
|------|----------|------|
| 内存用户优先验证 | `UserService.cs:210-219` | ✅ 已实现 |
| BCrypt密码验证 | `UserService.cs:214` | ✅ 已实现 |
| 数据库连接失败回退 | `UserService.cs:232-237` | ✅ 已实现 |
| 健康检查端点 | `Program.cs:90` | ✅ 已实现 |
| 登录后数据刷新 | `App.tsx:247` `refreshData()` | ✅ 已实现 |
| 前后端数据转换(PascalCase→camelCase) | `client.ts:9-24` | ✅ 已实现 |
| 请求超时处理 | `client.ts:105-134` | ✅ 已实现 |
| 错误信息传递 | `client.ts:123` | ✅ 已实现 |

---

## 五、优化建议

### 5.1 短期优化 (立即可行)

#### 5.1.1 减少数据库重试延迟

```csharp
// 修改后 (建议)
mysqlOptions.EnableRetryOnFailure(
    maxRetryCount: 3,
    maxRetryDelay: TimeSpan.FromSeconds(2),  // 减少到2秒
    errorNumbersToAdd: null);
```

**预期效果**: 最大延迟从30秒降到6秒

#### 5.1.2 统一前端超时配置

```typescript
// frontend/src/services/api/client.ts
const TIMEOUT = 30000;  // 从10秒增加到30秒
```

#### 5.1.3 统一localStorage Key管理

建议在 `authService` 中统一管理所有认证相关的localStorage操作：

```typescript
class AuthService {
  // 清除所有认证相关数据
  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('rd_current_user');
  }
}
```

### 5.2 中期优化 (1-2周)

#### 5.2.1 实现真正的JWT认证

```csharp
// Program.cs 中添加
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

app.UseAuthentication();  // 添加这一行
```

```csharp
// AuthController.cs 中生成真实Token
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userService.ValidateCredentialsAsync(request.UserId, request.Password);
    if (user == null)
    {
        return BadRequest(new ApiResponse<object> {
            Success = false,
            Error = new ApiError { Code = "AUTH_FAILED", Message = "用户名或密码错误" }
        });
    }

    // 生成真实JWT
    var token = GenerateJwtToken(user);  // 新增方法

    return Ok(new ApiResponse<LoginResponse> {
        Success = true,
        Data = new LoginResponse {
            User = user,
            Token = token
        }
    });
}
```

#### 5.2.2 添加Health Check缓存

减少健康检查对登录的影响:

```csharp
// 使用缓存的健康检查
var healthCache = new MemoryCache<string, bool>();
app.MapGet("/api/health", () => {
    var cached = healthCache.Get("status");
    if (cached) return Results.Ok(new { status = "ok", cached = true });

    // 实际检查逻辑...
    healthCache.Set("status", true, TimeSpan.FromSeconds(30));
    return Results.Ok(new { status = "ok", cached = false });
});
```

### 5.3 长期优化 (架构改进)

| 优化项 | 预期收益 | 复杂度 |
|--------|----------|--------|
| 添加Redis会话存储 | 支持集群部署、强制登出 | 中 |
| 实现Token刷新机制 | 提高安全性、用户体验 | 中 |
| 添加登录失败限流 | 防止暴力破解 | 低 |
| 服务端会话管理 | 更好的安全控制 | 高 |

---

## 六、结论

### 6.1 当前问题总结

登录验证功能存在以下核心问题:

1. **性能问题**: 数据库重试机制导致最长30秒延迟
2. **安全问题**: JWT认证未真正实现，使用模拟Token
3. **可靠性问题**: 前后端超时配置不匹配
4. **完整性问题**: 缺少认证中间件和服务端会话管理
5. **一致性问题**: localStorage Key管理分散

### 6.2 已实现功能确认

以下功能已在代码中正确实现:
- ✅ 内存用户优先策略 (避免不必要的数据库连接)
- ✅ BCrypt密码验证
- ✅ 数据库连接失败时的优雅回退
- ✅ 健康检查端点
- ✅ 登录后的数据刷新机制
- ✅ PascalCase到camelCase的数据转换

### 6.3 优化优先级

| 优先级 | 优化项 | 预期改善 |
|--------|--------|----------|
| P0 | 数据库重试间隔改为2秒 | 延迟从30秒降至6秒 |
| P0 | 统一localStorage Key管理 | 避免数据不一致 |
| P1 | 统一前端超时为30秒 | 适应网络波动 |
| P1 | 实现真正的JWT认证 | 提升系统安全性 |
| P2 | 添加认证中间件 | 完整的Token验证链 |

### 6.4 预期效果

按照上述优化后:
- **登录响应时间**: 从最长30秒降至 1-2秒 (正常情况)
- **登录成功率**: 提升至99%+
- **安全性**: 符合基本安全标准

---

*文档更新时间: 2026-01-21*
*分析范围: 登录验证功能从前端到后端的完整链条*
*版本: 1.2 - 补充API调用身份认证分析*

---

# 附录：API调用身份认证问题分析

## 七、API调用身份认证问题

### 7.1 问题概述

经过深入分析，系统在API调用时的身份认证存在**严重安全漏洞**。以下是详细问题清单：

| 问题类型 | 严重程度 | 影响范围 |
|----------|----------|----------|
| 后端未配置JWT认证中间件 | 🔴 严重 | 所有API端点 |
| 大部分Controller无[Authorize]属性 | 🔴 严重 | 数据泄露风险 |
| LogsController的[Authorize]无效 | 🔴 严重 | 无法限制管理员访问 |
| 前端无401未授权处理 | 🟡 中 | 用户体验问题 |
| Token验证链断裂 | 🔴 严重 | 认证形同虚设 |

### 7.2 后端认证配置缺失

**当前Program.cs配置** (`backend/src/Api/Program.cs`):

```csharp
// 问题1: 缺少认证服务注册
// 下面这些都不存在：
// builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
// builder.Services.AddJwtBearer(options => { ... })

// 问题2: 缺少认证中间件
app.UseAuthorization();  // 只有授权，没有认证！
// app.UseAuthentication();  ← 不存在
```

**对比需要配置的内容**:

```csharp
// 正确的配置应该是：
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

app.UseAuthentication();  // 必须在UseAuthorization之前
```

### 7.3 Controller认证属性分析

| Controller | [Authorize] | 认证状态 |
|------------|-------------|----------|
| AuthController | ❌ 无 | 登录接口可公开访问（合理） |
| TasksController | ❌ 无 | **危险：任何人都可访问** |
| UsersController | ❌ 无 | **危险：任何人都可访问** |
| ProjectsController | ❌ 无 | **危险：任何人都可访问** |
| StatisticsController | ❌ 无 | **危险：任何人都可访问** |
| SettingsController | ❌ 无 | **危险：任何人都可访问** |
| TaskClassesController | ❌ 无 | **危险：任何人都可访问** |
| TaskPoolController | ❌ 无 | **危险：任何人都可访问** |
| LogsController | ✅ 有 | **[Authorize]但不会生效** |

**LogsController的[Authorize]问题**:

```csharp
// LogsController.cs:14
[Authorize(Roles = "ADMIN")]
public class LogsController : ControllerBase { ... }
```

**问题**: 由于`AddAuthentication`和`UseAuthentication`都没有配置，这个`[Authorize]`属性：
- 不会验证任何token
- 不会检查用户角色
- 相当于摆设

### 7.4 前端Token附加机制

**前端正确实现了Token附加** (`client.ts:99-102`):

```typescript
// 添加认证token
if (this.token) {
  (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
}
```

**前端初始化时读取Token** (`client.ts:71-73`):

```typescript
constructor(baseUrl: string) {
  this.baseUrl = baseUrl;
  this.token = localStorage.getItem('auth_token');  // 从localStorage读取
}
```

**问题分析**:
- ✅ 前端确实在请求时附加了`Authorization: Bearer <token>`头
- ❌ 但后端没有配置JWT Bearer Token验证
- ❌ 所以这个token头被完全忽略

### 7.5 前端401错误处理缺失

**当前client.ts的错误处理** (`client.ts:121-134`):

```typescript
if (!response.ok) {
  const errorData = data || ({});
  throw new Error(errorData.Error?.Message || errorData.Message || `HTTP ${response.status}`);
}
```

**问题**:
- 没有区分401未授权和其他错误
- 没有自动登出或跳转到登录页
- 用户可能看到错误信息但无法恢复

### 7.6 认证流程断裂分析

```
正常认证流程:
┌─────────────────────────────────────────────────────────────────────────┐
│  前端                            后端                                    │
│    │                              │                                     │
│    │  1. 登录请求                  │                                     │
│    │  POST /api/auth/login        │                                     │
│    │  ───────────────────────────>│                                     │
│    │                              │ 2. 验证用户名密码                     │
│    │                              │ 3. 生成JWT Token                     │
│    │                              │ 4. 返回Token                        │
│    │  5. 收到Token                │                                     │
│    │  <───────────────────────────│                                     │
│    │                              │                                     │
│    │  6. 后续请求附加Token         │                                     │
│    │  Authorization: Bearer xxx   │                                     │
│    │  ───────────────────────────>│                                     │
│    │                              │ 7. 验证Token ← 缺失！                │
│    │                              │ 8. 检查用户角色 ← 缺失！              │
│    │                              │ 9. 返回数据                          │
│    │  10. 收到数据                 │                                     │
│    │  <───────────────────────────│                                     │
└─────────────────────────────────────────────────────────────────────────┘

当前实际流程 (不安全):
┌─────────────────────────────────────────────────────────────────────────┐
│  前端                            后端                                    │
│    │                              │                                     │
│    │  1. 登录请求                  │                                     │
│    │  POST /api/auth/login        │                                     │
│    │  ───────────────────────────>│                                     │
│    │                              │ 2. 验证用户名密码                     │
│    │                              │ 3. 返回 "mock-jwt-token"             │
│    │  4. 收到Token                │                                     │
│    │  <───────────────────────────│                                     │
│    │                              │                                     │
│    │  5. 后续请求附加Token         │                                     │
│    │  Authorization: Bearer xxx   │                                     │
│    │  ───────────────────────────>│                                     │
│    │                              │ ⚠️ Token验证完全缺失！               │
│    │                              │ ⚠️ 直接返回数据！                    │
│    │  6. 收到数据                 │                                     │
│    │  <───────────────────────────│                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.7 安全风险评估

| 风险场景 | 可能影响 | 风险等级 |
|----------|----------|----------|
| 未登录用户访问数据API | 数据泄露 | 🔴 高 |
| 越权访问其他用户数据 | 隐私泄露 | 🔴 高 |
| 管理员操作无验证 | 系统篡改 | 🔴 高 |
| 暴力破解无限制 | 账号安全 | 🟡 中 |
| Token永不过期 | 会话劫持 | 🟡 中 |

### 7.8 修复方案

#### 7.8.1 后端修复 - 配置JWT认证

**步骤1: 添加NuGet包**
```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

**步骤2: Program.cs中添加认证配置**

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// 在AddControllers之前添加
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
    };
});

// 在UseCors之后添加
app.UseAuthentication();  // 必须在UseAuthorization之前
app.UseAuthorization();
```

#### 7.8.2 后端修复 - 添加[Authorize]属性

**建议的Controller授权策略**:

| Controller | 建议授权级别 | 说明 |
|------------|--------------|------|
| AuthController | 公开 | 登录接口 |
| TasksController | 认证用户 | 所有登录用户可访问 |
| UsersController | LEADER/ADMIN | 仅团队领导和管理员 |
| ProjectsController | 认证用户 | 所有登录用户可访问 |
| StatisticsController | 认证用户 | 所有登录用户可访问 |
| SettingsController | LEADER/ADMIN | 仅管理员 |
| LogsController | LEADER/ADMIN | 仅管理员（已有） |
| TaskClassesController | LEADER/ADMIN | 仅管理员 |
| TaskPoolController | LEADER/ADMIN | 所有登录用户可访问 |

#### 7.8.3 前端修复 - 401处理

```typescript
// client.ts 中改进错误处理
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ... 现有代码 ...

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // 处理401未授权
    if (response.status === 401) {
      // 清除本地认证数据
      this.setToken(null);
      localStorage.removeItem('rd_current_user');
      // 跳转到登录页
      window.location.href = '/login?unauthorized=true';
      throw new Error('登录已过期，请重新登录');
    }

    // ... 其余错误处理 ...
  }
  // ...
}
```

#### 7.8.4 前端修复 - Token刷新机制

```typescript
// auth.ts 中添加Token刷新
class AuthService {
  private refreshTokenTimeout: number | null = null;

  async login(userId: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/api/auth/login',
      { UserId: userId, Password: password }
    );

    if (response.user && response.token) {
      apiClient.setToken(response.token);
      this.setStoredUser(response.user);
      this.startRefreshTokenTimer(response.token);
      return response;
    }

    throw new Error('登录失败');
  }

  private startRefreshTokenTimer(token: string) {
    // 在token过期前5分钟刷新
    const expires = this.getTokenExpiry(token);
    const timeout = expires - Date.now() - 5 * 60 * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  private async refreshToken() {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string }>>(
        '/api/auth/refresh-token',
        {}
      );
      if (response.token) {
        apiClient.setToken(response.token);
        this.startRefreshTokenTimer(response.token);
      }
    } catch {
      this.logout();
      window.location.href = '/login?sessionExpired=true';
    }
  }

  logout(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
    apiClient.setToken(null);
    localStorage.removeItem('rd_current_user');
  }
}
```

---

## 八、完整修复清单

### 8.1 后端修复清单

| 序号 | 修复项 | 文件 | 优先级 |
|------|--------|------|--------|
| 1 | 添加JwtBearer包引用 | 项目文件 | P0 |
| 2 | 配置AddAuthentication | Program.cs | P0 |
| 3 | 配置AddJwtBearer | Program.cs | P0 |
| 4 | 添加UseAuthentication | Program.cs | P0 |
| 5 | 生成真实JWT Token | AuthController.cs | P0 |
| 6 | 添加[Authorize]到Controller | 各Controller.cs | P1 |
| 7 | 实现Token刷新接口 | AuthController.cs | P2 |
| 8 | 添加请求限流 | Program.cs | P2 |

### 8.2 前端修复清单

| 序号 | 修复项 | 文件 | 优先级 |
|------|--------|------|--------|
| 1 | 改进401错误处理 | client.ts | P1 |
| 2 | 实现Token刷新机制 | auth.ts | P2 |
| 3 | 添加请求拦截器 | client.ts | P2 |
| 4 | 统一localStorage Key | auth.ts/client.ts | P2 |
