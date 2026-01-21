# 浏览器插件协同使用场景 - 身份认证分析

## 一、场景概述

### 1.1 浏览器插件协同使用需求

开发一个浏览器插件与主应用协同工作，插件需要访问后端API，核心需求：

| 需求 | 说明 |
|------|------|
| 共享登录状态 | 插件能感知用户是否已登录主应用 |
| 持久化Token | 不需要用户频繁重新登录 |
| 安全的Token存储 | 插件环境下的Token安全 |
| 无缝体验 | 用户在主应用登录后，插件自动获得访问权限 |

### 1.2 浏览器插件的特殊性

| 特性 | 影响 |
|------|------|
| 独立运行环境 | 插件有独立的Storage，不共享localStorage |
| Content Script | 运行在页面上下文中，可以访问DOM |
| Background Script | 常驻后台，可管理状态 |
| 跨域请求 | 插件可以绕过同源策略（需正确配置） |
| 扩展API | 可使用chrome.storage替代localStorage |

---

## 二、当前解决方案分析

### 2.1 Token存储机制对比

| 存储方式 | 主应用使用 | 插件可用性 | 持久化时间 |
|----------|-----------|-----------|-----------|
| localStorage | ✅ 使用 | 同域可访问 | 永不过期 |
| sessionStorage | ❌ 未使用 | 同域可访问 | 标签页关闭失效 |
| chrome.storage.local | ❌ 未使用 | 插件专用 | 永不过期 |
| chrome.storage.sync | ❌ 未使用 | 插件专用 | 跨设备同步 |

**当前主应用存储** (`client.ts:72, 78`):
```typescript
// auth_token 存储在 localStorage
this.token = localStorage.getItem('auth_token');

if (token) {
  localStorage.setItem('auth_token', token);
}
```

### 2.2 插件获取Token的可行方案

#### 方案A: 共享localStorage（同域情况）

如果插件运行在与主应用同源的页面中（如注入到主应用页面）：

```typescript
// 插件的content script可以访问
const token = localStorage.getItem('auth_token');

// 发送请求时附加Token
fetch('http://localhost:5000/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**优点**: 实现简单
**缺点**:
- Content Script和页面共享DOM和localStorage，但有隔离
- 某些浏览器限制content script访问localStorage
- 安全性较低

#### 方案B: 消息传递机制

```
┌─────────────────────────────────────────────────────────────────────────┐
│  主应用页面                    Content Script                 Background │
│    │                              │                             │        │
│    │ 1. 登录成功                   │                             │        │
│    │  localStorage.setItem        │                             │        │
│    │  ('rd_auth_token', token)    │                             │        │
│    │                              │                             │        │
│    │  ←────────────────────────────│                             │        │
│    │    window.postMessage        │                             │        │
│    │    {type: 'TOKEN', token}    │                             │        │
│    │                              │                             │        │
│    │                              │ 2. 转发到Background          │        │
│    │                              │ ───────────────────────────>│        │
│    │                              │                             │        │
│    │                              │                             │ 3. 存储  │
│    │                              │                             │ chrome │
│    │                              │                             │ storage│
└─────────────────────────────────────────────────────────────────────────┘
```

#### 方案C: 独立的登录流程

插件维护自己的认证状态，用户在插件中单独登录。

**优点**: 完全独立，不依赖主应用
**缺点**: 用户需要登录两次

### 2.3 当前解决方案的适用性评估

| 修复项 | 状态 | 插件场景适用性 | 说明 |
|--------|------|---------------|------|
| JWT Token生成 | ❌ 未实现 | ✅ 满足 | 需要先实现真实JWT |
| Token刷新机制 | ❌ 未实现 | ⚠️ 部分满足 | 需要实现refresh token接口 |
| Token持久化 | ⚠️ 临时方案 | ⚠️ 需要适配 | 需用chrome.storage替代 |
| 401处理 | ❌ 未实现 | ✅ 满足 | 插件可独立处理 |
| 认证中间件 | ❌ 未实现 | ⚠️ 需等待 | 后端JWT必须先实现 |

---

## 三、Token刷新机制分析

### 3.1 理想的无感刷新流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│  时间线                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  T0: 用户登录              Token有效期: 30分钟                             │
│  ├── 登录成功                                                              │
│  ├── 返回Access Token + Refresh Token                                     │
│  └── 插件存储两个Token                                                     │
│                                                                           │
│  T0+25分钟: 即将过期                                                       │
│  ├── 插件检测到快过期                                                      │
│  ├── 使用Refresh Token请求新Access Token                                  │
│  └── 后端返回新Token（无需用户干预）                                       │
│                                                                           │
│  T1: Token刷新成功                                                         │
│  ├── 更新本地存储的Access Token                                            │
│  └── 继续正常API调用                                                       │
│                                                                           │
│  用户体验: 无感知，不需要重新登录                                           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 当前系统缺失的接口

| 接口 | 需求 | 实现状态 |
|------|------|----------|
| `/api/auth/login` | 返回refresh_token | ❌ 未实现（返回mock token） |
| `/api/auth/refresh-token` | 刷新Token | ❌ 不存在 |
| `/api/auth/logout` | 注销并使Token失效 | ❌ 不存在 |
| `/api/auth/me` | 获取当前用户信息 | ❌ 不存在 |

### 3.3 需要的接口设计

```csharp
// 新增: Token刷新请求
[HttpPost("refresh-token")]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
{
    // 验证refresh token
    // 生成新的access token
    // 返回新token
}

// 请求体
{
  "refreshToken": "string"
}

// 响应
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 1800  // 秒
  }
}
```

---

## 四、浏览器插件认证架构建议

### 4.1 推荐架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          浏览器插件架构                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        主应用 (localhost:3000)                      │  │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │  │
│  │  │ 登录页面      │    │  API调用      │    │ localStorage        │  │  │
│  │  │              │    │              │    │ - auth_token         │  │  │
│  │  └──────────────┘    └──────────────┘    │ - rd_current_user    │  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│           │                        │                                     │
│           │    postMessage          │                                     │
│           └────────────────────────┘                                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     插件 (Content Script)                           │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ 监听 window.postMessage 获取Token                             │  │  │
│  │  │ 转发到 Background Script                                       │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                  插件 (Background Script)                           │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ chrome.storage.local                                         │  │  │
│  │  │ - access_token                                               │  │  │
│  │  │ - refresh_token                                              │  │  │
│  │  │ - user_info                                                  │  │  │
│  │  │ - token_expires_at                                           │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ Token管理模块                                                 │  │  │
│  │  │ - 自动刷新即将过期的Token                                     │  │  │
│  │  │ - 检查Token有效性                                             │  │  │
│  │  │ - 处理401错误                                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                    │                                      │
│                                    ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                     后端API (localhost:5000)                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ 认证中间件                                                    │  │  │
│  │  │ - Validate JWT Token                                         │  │  │
│  │  │ - 检查Claims (Role, UserId)                                  │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 插件实现要点

#### 4.2.1 manifest.json 配置

```json
{
  "manifest_version": 3,
  "name": "R&D Task Manager Plugin",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "http://localhost:3000/*",
    "http://localhost:5000/*"
  ],
  "content_scripts": [
    {
      "matches": ["http://localhost:3000/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

#### 4.2.2 Content Script (content.js)

```javascript
// 监听主应用发出的Token消息
window.addEventListener('message', (event) => {
  if (event.data.type === 'RDM_AUTH_TOKEN') {
    // 转发到Background Script
    chrome.runtime.sendMessage({
      type: 'TOKEN_UPDATE',
      token: event.data.token,
      user: event.data.user
    });
  }
});

// 或者定期检查localStorage（不推荐，可能有延迟）
```

#### 4.2.3 Background Script (background.js)

```javascript
// Token管理
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.expiresAt = null;
    this.init();
  }

  async init() {
    const storage = await chrome.storage.local.get([
      'accessToken',
      'refreshToken',
      'user',
      'expiresAt'
    ]);
    this.accessToken = storage.accessToken;
    this.refreshToken = storage.refreshToken;
    this.user = storage.user;
    this.expiresAt = storage.expiresAt;

    // 启动刷新检查定时器
    this.startRefreshTimer();
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      this.clearTokens();
      return false;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token刷新失败');
      }

      const data = await response.json();
      await this.setTokens(data.accessToken, this.refreshToken, this.user);
      return true;
    } catch (error) {
      console.error('Token刷新失败:', error);
      this.clearTokens();
      return false;
    }
  }

  startRefreshTimer() {
    // 每分钟检查一次
    setInterval(async () => {
      if (this.expiresAt && Date.now() > this.expiresAt - 5 * 60 * 1000) {
        // 5分钟前开始刷新
        await this.refreshAccessToken();
      }
    }, 60000);
  }

  async setTokens(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;

    // 解析JWT获取过期时间
    const payload = this.parseJwt(accessToken);
    this.expiresAt = payload.exp * 1000;

    await chrome.storage.local.set({
      accessToken,
      refreshToken,
      user,
      expiresAt: this.expiresAt
    });
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.expiresAt = null;
    chrome.storage.local.remove(['accessToken', 'refreshToken', 'user', 'expiresAt']);
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  getToken() {
    return this.accessToken;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('未登录');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // 尝试刷新Token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // 重试请求
        return this.makeAuthenticatedRequest(url, options);
      }
      this.clearTokens();
      throw new Error('登录已过期');
    }

    return response;
  }
}

const tokenManager = new TokenManager();

// 消息处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOKEN_UPDATE') {
    tokenManager.setTokens(message.token, null, message.user);
    sendResponse({ success: true });
  } else if (message.type === 'GET_TOKEN') {
    sendResponse({ token: tokenManager.getToken() });
  } else if (message.type === 'API_REQUEST') {
    tokenManager.makeAuthenticatedRequest(message.url, message.options)
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 异步响应
  }
});
```

#### 4.2.4 主应用集成 (App.tsx)

```typescript
// 在登录成功后广播Token
const handleLogin = async (e: React.FormEvent) => {
  // ... 登录逻辑 ...

  if (result) {
    // ... 现有逻辑 ...

    // 广播Token给插件
    window.postMessage({
      type: 'RDM_AUTH_TOKEN',
      token: result.token,
      user: result.user
    }, '*');
  }
};

// 或者提供插件可访问的全局变量
window.__RDM_AUTH_TOKEN__ = result?.token;
```

---

## 五、结论与建议

### 5.1 当前解决方案评估

| 需求 | 当前状态 | 是否满足 | 改进建议 |
|------|----------|----------|----------|
| Token持久化 | localStorage | ⚠️ 部分 | 插件需适配chrome.storage |
| Token刷新 | 无 | ❌ 不满足 | 必须实现refresh token |
| JWT认证 | 未实现 | ❌ 不满足 | 必须先实现真实JWT |
| 多端共享 | 无机制 | ❌ 不满足 | 需要额外的状态同步 |
| 401处理 | 无 | ⚠️ 部分 | 插件可独立实现 |

### 5.2 核心依赖

要满足浏览器插件协同使用且不需要频繁重新登录，**必须先实现以下功能**：

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 真实JWT Token生成 | 当前返回mock token，无法验证 |
| P0 | 后端JWT认证中间件 | 当前[Authorize]无效 |
| P1 | Refresh Token接口 | 支持Token无感刷新 |
| P1 | Token过期时间 | JWT需设置合理的exp claim |
| P2 | Logout接口 | 支持服务端Token失效 |

### 5.3 最小可行方案

如果暂时无法实现完整的JWT认证系统，可以采用以下临时方案：

#### 方案1: 共享localStorage（同域简化版）

```javascript
// 插件content script
const token = localStorage.getItem('auth_token');
// 直接使用token发请求
```

**条件**: 插件必须作为主应用页面的注入脚本运行
**风险**: 安全性低，无法防止Token泄露

#### 方案2: 主应用API代理

```javascript
// 插件请求先发给主应用页面
window.postMessage({
  type: 'RDM_API_REQUEST',
  url: '/api/tasks',
  method: 'GET'
}, '*');

// 主应用页面监听并代理请求
window.addEventListener('message', async (event) => {
  if (event.data.type === 'RDM_API_REQUEST') {
    const response = await fetch(event.data.url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    event.source.postMessage({
      type: 'RDM_API_RESPONSE',
      data: await response.json()
    }, '*');
  }
});
```

**优点**: 不需要后端修改
**缺点**: 依赖主应用页面保持打开

### 5.4 推荐实现路径

```
阶段1: 基础认证 (1-2天)
├── 实现真实JWT Token生成
├── 配置JWT认证中间件
└── 添加[Authorize]属性保护

阶段2: Token刷新 (1天)
├── 实现refresh token接口
├── 前端实现自动刷新机制
└── 插件适配chrome.storage

阶段3: 插件集成 (1-2天)
├── 配置manifest.json
├── 实现content script
└── 实现background script

阶段4: 优化 (持续)
├── 添加Token加密存储
├── 实现多设备同步
└── 添加安全审计日志
```

### 5.5 最终结论

**login-analysis.md中的解决方案是否满足插件需求？**

| 方面 | 评估 | 说明 |
|------|------|------|
| JWT认证 | ⚠️ 部分满足 | 方案正确但未实现，需先完成 |
| Token刷新 | ❌ 不满足 | 需要新增refresh token接口 |
| 持久化存储 | ⚠️ 需适配 | localStorage不直接适用于插件 |
| 401处理 | ⚠️ 需实现 | 插件需独立实现 |

**建议**: 在实现login-analysis.md中的所有修复项后，再进行插件开发，可以获得最佳体验和安全性。

---

*文档创建时间: 2026-01-21*
*场景: 浏览器插件协同使用*
*版本: 1.0*
