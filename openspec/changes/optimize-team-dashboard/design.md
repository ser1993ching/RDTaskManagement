## Context

团队总览看板（Dashboard.tsx）目前功能较为简单，需要根据工作台报表需求进行全面增强。当前看板仅包含基础的任务状态统计和成员负载图表，缺少项目维度、时间趋势等分析能力。

### 约束条件
- 仅修改 Dashboard.tsx，不影响其他模块
- 数据源为 localStorage，在组件层直接计算统计
- 保持现有组件模式（useMemo 缓存计算结果）
- 图表使用 Recharts 库
- 遵循现有代码风格和命名规范

### 利益相关者
- 班组长（LEADER）：需要查看团队整体工作状态
- 管理员（ADMIN）：需要查看全局数据
- 组员（MEMBER）：仅查看个人相关统计

## Goals / Non-Goals

### Goals
- 增强团队总览看板的统计分析能力
- 支持时间周期筛选（本周/本月/本年度）
- 提供项目维度的任务分布统计
- 增强工作量对比可视化

### Non-Goals
- 不修改 dataService 核心逻辑
- 不修改 PersonalWorkspaceView.tsx
- 不修改 TaskView.tsx、ProjectView.tsx、PersonnelView.tsx
- 不修改任务管理核心流程

## Decisions

### 1. 时间筛选架构
- **决策**：在 Dashboard 组件顶部新增 PeriodSelector 组件
- **理由**：与个人工作台保持一致的用户体验
- **实现方式**：在 Dashboard.tsx 内添加 useState 和筛选逻辑

### 2. 统计计算位置
- **决策**：统计计算直接在 Dashboard.tsx 的 useMemo 内完成
- **理由**：避免修改 dataService，确保不影响其他模块
- **替代方案**：组件层过滤 vs 服务层过滤 → 选择组件层过滤

### 3. 图表布局方案
- **决策**：采用多行流式布局（grid）
- **理由**：适应不同屏幕尺寸，便于扩展
- **实现**：使用 Tailwind CSS grid-cols-1 lg:grid-cols-2 布局

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 统计逻辑复杂导致组件过大 | 中 | 拆分子组件，保持主组件简洁 |
| 图表过多影响加载性能 | 低 | 使用 useMemo 缓存计算结果 |

## Migration Plan

1. 新增 PeriodSelector 子组件
2. 新增各统计图表子组件
3. 更新 Dashboard.tsx 主组件逻辑
4. 验证现有功能不受影响
