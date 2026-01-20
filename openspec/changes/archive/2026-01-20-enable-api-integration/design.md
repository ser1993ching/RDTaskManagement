## Context

本变更旨在验证后端API功能完整性，并为前端集成测试提供充足的测试数据。当前状态：

- 后端已实现完整的RESTful API，使用JWT认证
- 前端目前使用localStorage作为数据源
- MySQL 8.0数据库已通过docker-compose启动
- 需要验证端到端的数据流

### 约束条件
- 测试期间临时禁用JWT认证，便于使用脚本测试
- 测试完成后必须恢复认证功能
- 不修改现有业务逻辑，仅做技术验证

## Goals / Non-Goals

### Goals
- [x] 验证后端数据库连接正常
- [x] 全面测试所有API端点功能
- [x] 生成200+条均匀分布的测试数据
- [x] 实现前端API服务层基础框架

### Non-Goals
- 不实现完整的用户注册/登录页面UI
- 不修改现有业务逻辑
- 不进行性能压力测试
- 不部署到生产环境

## Decisions

### 1. 认证临时禁用方案

**决策**: 使用环境变量控制认证中间件

```csharp
// 在ApiLoggingMiddleware.cs或认证相关中间件中
var skipAuth = Environment.GetEnvironmentVariable("SKIP_AUTH") == "true";
if (skipAuth)
{
    // 跳过认证检查
}
```

**替代方案考虑**:
- 创建测试专用控制器 - 被否决，增加代码复杂度
- 使用测试JWT token - 被否决，需要额外生成逻辑

### 2. 测试数据生成方式

**决策**: 编写Bash脚本调用API生成测试数据

```bash
#!/bin/bash
# 测试脚本结构
generate_users() { ... }
generate_projects() { ... }
generate_tasks() { ... }
```

**优势**:
- 可重复执行，便于调试
- 记录生成的数据ID，便于追踪
- 可在CI/CD中复用

### 3. 前端API客户端方案

**决策**: 创建简化的axios封装

```typescript
// apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  timeout: 10000,
});
```

**替代方案考虑**:
- 直接使用fetch API - 被否决，axios更易用
- 使用React Query - 被否决，保持简单

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 忘记恢复认证 | 生产环境安全风险 | 设置环境变量默认值，任务清单检查 |
| 测试数据不符合实际业务 | 测试结果不准确 | 参考现有seed数据分布 |
| 前端API层代码冗余 | 维护成本增加 | 保持简单，必要时再抽取公共逻辑 |

## Migration Plan

### 步骤1: 认证临时禁用
```csharp
// Program.cs 或认证中间件
var skipAuth = Environment.GetEnvironmentVariable("SKIP_AUTH") == "true";
if (!skipAuth)
{
    app.UseAuthentication();
    app.UseAuthorization();
}
```

### 步骤2: API测试
使用curl或Postman测试每个端点，记录结果到测试报告。

### 步骤3: 数据生成
```bash
# 生成测试数据
bash scripts/generate-test-data.sh
```

### 步骤4: 认证恢复
移除或注释掉SKIP_AUTH相关代码。

## Open Questions

- [x] Q1: 测试数据量是否足够？ -> 确认：15用户 + 50项目 + 135任务
- [x] Q2: 认证如何处理？ -> 确认：环境变量SKIP_AUTH控制
- [ ] Q3: 前端API服务放在哪个目录？ -> 建议: frontend/src/services/api/
