## Context

### 背景
当前任务管理系统中，任务状态由单一的 `Task.status` 字段管理，无法区分：
- 负责人正在编制
- 校核人正在审核
- 驳回后需要修改

这种设计导致：
1. 无法准确追踪每个角色的工作进度
2. 驳回后状态回退逻辑混乱
3. 个人工作台无法展示用户在各任务中的具体环节

### 约束
- 基于 localStorage 的前端数据存储
- 保持向后兼容，需要处理存量数据
- 仅涉及前端代码变更

### 利益相关者
- 组员：需要清晰看到自己的待办任务和状态
- 班组长：需要查看团队工作量（工作量单位为小时）
- 管理员：完整权限

## Goals / Non-Goals

### Goals
1. 实现四个角色的独立状态管理（负责人、校核人、主任设计、审查人）
2. 优化任务主状态流转逻辑
3. 增强个人工作台的信息展示
4. 调整工作量单位为小时
5. 限制工作量信息的可见性（仅班组长以上可查看）

### Non-Goals
- 不改变任务创建/分配的基本流程
- 不涉及后端 API 设计（纯前端 localStorage）
- 不改变用户角色权限体系

## Decisions

### 决策 1：角色状态枚举定义

**选择**：新增 `RoleStatus` 枚举

```typescript
export enum RoleStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  REVISING = '修改中',
  REJECTED = '驳回中',
  COMPLETED = '已完成'
}
```

**理由**：
- 四个角色状态值相同，复用枚举减少重复
- 语义清晰，与主状态 `TaskStatus` 区分
- 便于统一校验和显示
- "修改中"用于区分驳回后正在修改的状态

**替代方案考虑**：
- 使用 `TaskStatus` 枚举 - ❌ 语义混淆，主状态和角色状态含义不同

### 决策 2：任务主状态调整

**选择**：`TaskStatus` 调整为 6 个值

```typescript
export enum TaskStatus {
  NOT_STARTED = '未开始',       // 初始状态
  DRAFTING = '编制中',          // 负责人编制中
  REVISING = '修改中',          // 驳回后修改中
  REVIEWING = '校核中',         // 校核人审核中
  REVIEWING2 = '审查中',        // 审查人审核中
  COMPLETED = '已完成'          // 最终完成
}
```

**理由**：
- 与实际工作流程匹配（编制 -> 校核 -> 审查）
- 驳回状态显式化为"修改中"，便于区分
- 可直接从角色状态推断主状态

**替代方案考虑**：
- 保持原状态 + 子状态 - ❌ 增加复杂度
- 仅使用角色状态 - ❌ 主状态仍需存在用于列表筛选

### 决策 3：状态联动算法

**选择**：基于规则自动计算主状态

```typescript
function calculateTaskStatus(task: Task): TaskStatus {
  // 全部完成
  if (task.assigneeStatus === '已完成' &&
      (!task.CheckerID || task.checkerStatus === '已完成') &&
      (!task.ChiefDesignerID || task.chiefDesignerStatus === '已完成') &&
      (!task.ApproverID || task.approverStatus === '已完成')) {
    return TaskStatus.COMPLETED;
  }

  // 驳回中 - 优先判断（状态流转：主任设计审查 → 校核 → 负责人）
  if (task.approverStatus === '驳回中') return TaskStatus.REVIEWING2;
  if (task.chiefDesignerStatus === '驳回中') return TaskStatus.REVIEWING2;
  if (task.checkerStatus === '驳回中') return TaskStatus.REVIEWING;
  if (task.assigneeStatus === '驳回中' || task.assigneeStatus === '修改中') return TaskStatus.REVISING;

  // 修改中 - 驳回后的修改状态
  if (task.assigneeStatus === '修改中') return TaskStatus.REVISING;

  // 进行中 - 优先级判断（状态流转：负责人 → 校核 → 主任设计 → 审查）
  if (task.approverStatus === '进行中') return TaskStatus.REVIEWING2;
  if (task.chiefDesignerStatus === '进行中') return TaskStatus.REVIEWING2;
  if (task.checkerStatus === '进行中') return TaskStatus.REVIEWING;
  if (task.assigneeStatus === '进行中') return TaskStatus.DRAFTING;

  return TaskStatus.NOT_STARTED;
}
```

**理由**：
- 自动计算确保主状态与实际一致
- 驳回状态优先级高于进行中
- 角色状态为主，主状态为派生
- 状态流转：编制中 → 校核中 → 审查中 → 已完成
- 驳回时：审查中/校核中 → 修改中 → 编制中 → 校核中 → 审查中

### 决策 4：工作量单位调整

**选择**：`Workload` 单位从天改为小时

**理由**：
- 更精确的工作量记录
- 与实际工时统计需求匹配
- 便于后续统计分析

**影响**：
- 存量数据需要乘以 8 转换为小时
- 显示时添加"小时"单位后缀

### 决策 5：工作量可见性控制

**选择**：基于角色控制可见性

```typescript
function canViewWorkload(user: User): boolean {
  return user.SystemRole === 'LEADER' || user.SystemRole === 'ADMIN';
}
```

**理由**：
- 班组长需要查看团队成员工作量
- 组员只需看到自己的任务
- 保护敏感的工作量数据

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 存量数据迁移 | 现有任务缺少角色状态字段 | 初始化时基于 Task.status 推断角色状态 |
| 主状态不一致 | 手动修改主状态可能与计算值冲突 | 隐藏主状态编辑入口，仅展示计算结果 |
| 用户习惯改变 | 主状态从 3 个变为 6 个 | 提供清晰的 UI 标签和帮助提示 |

## Migration Plan

### 数据迁移步骤
1. 备份 localStorage 数据
2. 为存量任务初始化角色状态：
   - `assigneeStatus` = `Task.status === '已完成' ? '已完成' : '未开始'`
   - `checkerStatus` = `Task.status === '已完成' ? '已完成' : '未开始'`（如有校核人）
   - `chiefDesignerStatus` = `Task.status === '已完成' ? '已完成' : '未开始'`（如有主任设计）
   - `approverStatus` = `Task.status === '已完成' ? '已完成' : '未开始'`（如有审查人）
3. 将 `Workload` 乘以 8 转换为小时

### 回滚方案
- 通过 localStorage 备份恢复数据
- 代码层面可通过 feature flag 切换

## Open Questions

1. **角色状态驳回时的驳回人记录**：是否需要记录是谁驳回的？
   - 当前设计暂不记录，仅记录状态
   - 如需记录，可扩展字段

2. **工作量统计周期**：是否需要按周期（周/月/年）统计已完成工时？
   - 当前设计支持在 PersonalStats 中扩展
   - 可在后续迭代实现

3. **是否需要批量操作**：批量更新角色状态？
   - 当前设计为单任务操作
   - 如有需求可后续扩展
