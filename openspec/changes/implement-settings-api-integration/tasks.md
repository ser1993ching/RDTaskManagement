# 任务列表：实现设置功能 API 集成

## 阶段 1: 后端 API 完善

### 1.1 添加任务类别实体和 Repository
- [ ] 创建 TaskClass 实体 (id, name, code, description, notice, is_deleted)
- [ ] 创建 ITaskClassRepository 接口
- [ ] 实现 TaskClassRepository (支持软删除)
- [ ] 添加数据库迁移

### 1.2 添加任务类别 Service
- [ ] 更新 ISettingsService 添加任务类别方法
- [ ] 实现 TaskClass CRUD 方法
- [ ] 添加分类关联检查逻辑

### 1.3 添加任务类别 Controller
- [ ] 创建 TaskClassesController
- [ ] 实现 GET, POST, PUT, DELETE 接口
- [ ] 添加角色权限验证 (ADMIN/LEADER)

### 1.4 完善现有 SettingsController
- [ ] 补充批量导入接口
- [ ] 添加数据重置接口
- [ ] 修复内存存储为数据库存储

## 阶段 2: 前端改造

### 2.1 更新 API 配置
- [ ] 在 config.ts 添加 taskClasses 端点
- [ ] 添加头像管理端点
- [ ] 添加数据管理端点

### 2.2 创建 API 服务层
- [ ] 创建 settingsService.ts
- [ ] 实现所有设置 API 调用方法
- [ ] 添加错误处理和提示

### 2.3 改造 Settings.tsx
- [ ] 导入新的 settingsService
- [ ] 将 dataService 调用替换为 API 调用
- [ ] 添加加载状态
- [ ] 优化错误处理
- [ ] 保持原有 UI 交互

## 阶段 3: 测试和验证

### 3.1 后端测试
- [ ] 任务类别 CRUD API 测试
- [ ] 权限验证测试
- [ ] 数据持久化验证

### 3.2 前端测试
- [ ] 页面加载数据测试
- [ ] 添加/编辑/删除操作测试
- [ ] 权限控制测试

## 依赖
- 后端需要先于前端完成
- 数据库迁移需要先执行
