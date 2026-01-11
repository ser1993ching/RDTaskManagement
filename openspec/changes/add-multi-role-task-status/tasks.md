## 1. 类型定义更新
- [ ] 1.1 在 types.ts 中新增 `RoleStatus` 枚举（未开始、进行中、驳回中、已完成）
- [ ] 1.2 修改 `TaskStatus` 枚举值（未开始、编制中、修改中、校核中、审查中、已完成）
- [ ] 1.3 在 Task 接口中新增 `assigneeStatus`、`reviewerStatus`、`reviewer2Status` 字段
- [ ] 1.4 更新 `PersonalStats` 接口以支持小时统计
- [ ] 1.5 更新 `WorkDayInfo` 接口为 `WorkHourInfo`

## 2. 数据服务层更新
- [ ] 2.1 在 dataService.ts 中新增 `migrateTaskStatusFields()` 数据迁移函数
- [ ] 2.2 新增 `calculateTaskStatus()` 自动计算主状态函数
- [ ] 2.3 新增 `canViewWorkload()` 权限检查函数
- [ ] 2.4 更新 `createTask()` 初始化角色状态
- [ ] 2.5 更新 `updateTask()` 重新计算主状态
- [ ] 2.6 更新 `getPersonalTasks()` 过滤逻辑
- [ ] 2.7 更新 `separateTasksByStatus()` 分离任务逻辑
- [ ] 2.8 更新 `calculatePersonalStats()` 支持小时统计
- [ ] 2.9 更新 `generateStatsCSV()` 导出格式

## 3. 任务视图更新（TaskView.tsx）
- [ ] 3.1 任务详情/编辑表单中新增角色状态下拉选择
- [ ] 3.2 根据当前登录用户显示对应的状态编辑权限
- [ ] 3.3 更新任务列表显示列，增加状态列
- [ ] 3.4 状态列显示优先级：驳回中 > 进行中 > 未开始 > 已完成
- [ ] 3.5 任务创建表单增加角色状态初始化
- [ ] 3.6 工作量输入字段添加小时单位显示

## 4. 个人工作台更新（PersonalWorkspaceView.tsx）
- [ ] 4.1 新增"我的环节"列，显示用户是负责人/校核人/审查人
- [ ] 4.2 新增"环节状态"列，显示对应的角色状态
- [ ] 4.3 工作量列添加权限控制（仅班组长可见）
- [ ] 4.4 更新统计计算逻辑，适配新的状态体系
- [ ] 4.5 更新 CSV 导出内容
- [ ] 4.6 更新打印模板

## 5. 仪表盘更新（Dashboard.tsx）
- [ ] 5.1 检查并更新统计图表的筛选逻辑
- [ ] 5.2 验证工作量统计显示（单位为小时）

## 6. 任务库更新（TaskPoolView.tsx）
- [ ] 6.1 检查任务分配时是否正确初始化角色状态
- [ ] 6.2 验证任务库列表的筛选和排序

## 7. 验证与测试
- [ ] 7.1 运行 `npm run build` 验证无编译错误
- [ ] 7.2 手动测试完整工作流程
- [ ] 7.3 验证数据迁移正确性
- [ ] 7.4 验证权限控制生效
