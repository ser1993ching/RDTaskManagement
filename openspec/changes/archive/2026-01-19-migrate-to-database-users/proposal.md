# Change: 从内存用户迁移到数据库用户登录，前端数据通过API获取

## Why

当前系统存在以下问题：
1. 用户数据存储在localStorage内存中，无法持久化到数据库
2. 登录验证仅在本地进行，存在安全风险
3. 前端直接操作localStorage，数据一致性难以保证
4. 后端API已实现但前端未真正对接

需要迁移到：
- 用户数据存储在MySQL数据库users表中
- 登录通过后端API验证，返回JWT Token
- 前端所有数据通过REST API从后端获取（直接使用apiDataService）
- 简化架构，不使用unifiedDataService回退层

## What Changes

### 认证迁移
- **删除** localStorage中的内存用户数据（rd_users）
- **修改** 登录逻辑：`dataService.login()` → `apiDataService.login()`
- **使用** 后端Auth API验证用户凭据
- **存储** JWT Token到localStorage（而非用户密码）
- **保留** 管理员初始账号创建逻辑

### 数据获取迁移
- **修改** App.tsx直接使用`apiDataService`替代`dataService`
- **移除** unifiedDataService回退层，简化架构
- **修改** 各视图组件的数据刷新逻辑（同步→异步）
- **保持** soft delete行为一致

### 测试数据
- **创建** 测试数据生成脚本（用户、项目、任务）
- **验证** API端点正常工作
- **验证** 前端登录和数据展示功能

## Impact

- **Affected specs**: api-auth, data-fetching
- **Affected code**:
  - `frontend/src/App.tsx` - 登录和数据获取逻辑
  - `frontend/src/services/apiDataService.ts` - API数据服务
  - `frontend/src/services/dataService.ts` - 保留作为参考，标记@deprecated
  - `backend/src/Api/Controllers/AuthController.cs` - 认证API
  - `backend/src/Api/Controllers/UsersController.cs` - 用户API
- **数据库**: MySQL TaskManageSystem库users表、projects表、tasks表
