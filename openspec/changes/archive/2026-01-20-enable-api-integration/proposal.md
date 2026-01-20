# Change: 启用前后端API集成测试

## Why

当前前端直接从localStorage读取数据，后端API已实现但未与前端对接。需要创建一个专门的测试分支，验证后端数据库连接、API功能完整性，并生成充足的测试数据用于前端集成测试。

## What Changes

- 创建新分支 `feature/api-integration-testing`
- 临时禁用后端JWT认证中间件，便于API测试
- 验证MySQL数据库连接正常
- 全面测试所有API端点
- 编写测试脚本生成200+条测试数据（15用户 + 50项目 + 135+任务）
- 测试数据时间分布：近12个月均匀分布
- 前端创建API服务层对接后端接口

## Impact

- Affected specs: 无（此为技术验证变更，不影响业务功能）
- Affected code:
  - 后端: `backend/src/Infrastructure/Middleware/` (临时禁用认证)
  - 前端: `frontend/src/services/` (新增API服务)
  - 数据库: MySQL TaskManageSystem库

## Testing Scope

### API端点测试清单
| 控制器 | 端点 | 认证要求 | 状态 |
|--------|------|----------|------|
| AuthController | POST /api/auth/login | 否 | 待测试 |
| UsersController | GET/POST/PUT/DELETE /api/users | 是 | 待测试 |
| TasksController | GET/POST/PUT/DELETE /api/tasks | 是 | 待测试 |
| ProjectsController | GET/POST/PUT/DELETE /api/projects | 是 | 待测试 |
| TaskClassesController | GET /api/taskclasses | 否 | 待测试 |
| TaskPoolController | CRUD /api/taskpool | 是 | 待测试 |
| StatisticsController | GET /api/statistics | 是 | 待测试 |
| SettingsController | CRUD /api/settings | 是 | 待测试 |
| LogsController | GET /api/logs | 是(ADMIN) | 待测试 |

### 测试数据目标
- 用户: 15条（含管理员、组长、组员）
- 项目: 50条（10个类别均匀分布）
- 任务: 135+条（10个类别均匀分布，时间跨度12个月）
