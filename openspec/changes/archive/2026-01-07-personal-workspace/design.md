# Design: Personal Workspace Feature

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PersonalWorkspaceView.tsx                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Header: User info + Period selector + View mode toggle  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │ Statistics Panel    │  │ Task Panels (3 stacked)       │ │
│  │ (chart/list toggle) │  │                               │ │
│  │ - Donut chart       │  │ ┌─────────────────────────┐   │ │
│  │ - Category pie      │  │ │ 进行中 (In Progress)    │   │ │
│  │ - Travel stats      │  │ │ - Top position         │   │ │
│  │ - Meeting stats     │  │ │ - Task list            │   │ │
│  │                     │  │ └─────────────────────────┘   │ │
│  │ List View Mode:     │  │                               │ │
│  │ - Stats table       │  │ ┌─────────────────────────┐   │ │
│  │ - Category rows     │  │ │ 未开始 (Pending)       │   │ │
│  │ - Summary rows      │  │ │ - Middle position      │   │ │
│  │                     │  │ │ - Task list            │   │ │
│  └─────────────────────┘  │ └─────────────────────────┘   │ │
│                           │                               │ │
│                           │ ┌─────────────────────────┐   │ │
│                           │ │ 已完成 (Completed)      │   │ │
│                           │ │ - Bottom position       │   │ │
│                           │ │ - Task list             │   │ │
│                           │ └─────────────────────────┘   │ │
│                           └───────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ UserSwitcher (LEADER/ADMIN only)                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## UI Layout Design

### Top Section: Statistics Panel
- **Left side**: Statistics visualization
  - View mode toggle: [图表模式] / [清单模式]
  - Period tabs: [本周] [本月] [本年度]
  - Chart/List content area

- **Right side**: Task Status Panels
  - Three vertically stacked panels
  - Each panel collapsible
  - Panels ordered: 进行中 → 未开始 → 已完成

### Statistics View Modes

#### Chart Mode
```
┌─────────────────────────────────────────┐
│  任务完成率          类别分布             │
│  ┌─────┐           ┌─────┐              │
│  │     │           │     │              │
│  │环形图│           │饼图  │              │
│  │     │           │     │              │
│  └─────┘           └─────┘              │
│  12/15 (80%)       市场配合 5            │
│                    常规项目 3            │
├─────────────────────────────────────────┤
│  差旅统计            会议统计             │
│  出差天数: 12天      会议时长: 24小时     │
│  占比: 15%          占比: 8%             │
└─────────────────────────────────────────┘
```

#### List Mode
```
┌─────────────────────────────────────────┐
│  统计清单                               │
├─────────────────────────────────────────┤
│  本周任务统计                           │
│  ├─ 进行中: 5个                         │
│  ├─ 未开始: 3个                         │
│  ├─ 已完成: 8个                         │
│  └─ 完成率: 50%                        │
├─────────────────────────────────────────┤
│  类别分布                               │
│  ├─ 市场配合: 5个 (28%)                 │
│  ├─ 常规项目: 4个 (22%)                 │
│  ├─ 核电项目: 3个 (17%)                 │
│  └─ 其他: 6个 (33%)                     │
├─────────────────────────────────────────┤
│  差旅统计                               │
│  ├─ 本周出差天数: 3天                   │
│  └─ 占工作日时长: 37.5%                │
├─────────────────────────────────────────┤
│  会议统计                               │
│  ├─ 本周会议时长: 8小时                 │
│  └─ 占工作时长: 16.7%                   │
└─────────────────────────────────────────┘
```

## Task Panel Design

```
┌─────────────────────────────────────────────────────┐
│  进行中 (3) [−]  ← Collapsible header with count   │
├─────────────────────────────────────────────────────┤
│ 任务名称    │ 类别     │ 开始时间 │ 截止时间 │ 操作 │
│─────────────┼──────────┼──────────┼──────────┼──────│
│ 任务A       │ 市场配合 │ 01-01    │ 01-15    │ ...  │
│ 任务B       │ 常规项目 │ 01-05    │ 01-20    │ ...  │
│ 任务C       │ 核电项目 │ 01-10    │ 01-25    │ ...  │
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Statistics Calculation

**Work Day Calculation:**
- Standard work day: 8 hours
- For period percentage:
  - Travel days / (work days in period) × 100%
  - Meeting hours / (work hours in period) × 100%
- Work days in period = weekdays × 8 hours

**Category Distribution:**
- Group tasks by TaskClassID
- Calculate count and percentage for each category
- Exclude TC009/TC007 from pie chart (separate stats)

### 2. Three Panel Layout

**Ordering Rationale:**
- 进行中 (In Progress) - Top: Most important, requires immediate attention
- 未开始 (Pending) - Middle: Needs planning, upcoming
- 已完成 (Completed) - Bottom: Historical record, reference

**Panel Features:**
- Each panel has its own task count in header
- Each panel is independently collapsible
- Panels maintain their scroll position

### 3. View Mode Toggle

**State Management:**
```typescript
interface WorkspaceState {
  viewMode: 'chart' | 'list';
  period: 'week' | 'month' | 'year';
  expandedPanels: {
    inProgress: boolean;
    pending: boolean;
    completed: boolean;
  };
}
```

**Persisted in localStorage** for user preference.

### 4. Long-Running Task Detection

Same logic as original proposal, with visual indicator in each panel.

### 5. User Switching (LEADER/ADMIN)

Same as original, affects all panels and statistics.

## Data Flow

```
User logs in
    │
    ▼
PersonalWorkspaceView mounts
    │
    ▼
dataService.getPersonalTasks(userId)
    │
    ▼
Separate tasks by status:
├── inProgress: tasks.filter(s => s.status === '进行中')
├── pending: tasks.filter(s => s.status === '未开始')
└── completed: tasks.filter(s => s.status === '已完成')
    │
    ▼
Calculate statistics:
├── periodStats: by period (week/month/year)
├── travelStats: TC009 sum and percentage
├── meetingStats: TC007 sum and percentage
└── categoryDist: by TaskClassID
    │
    ▼
Render based on viewMode:
├── chart mode: Render charts and stats cards
└── list mode: Render stats table
```

## Component Hierarchy

```
App.tsx
└── Layout.tsx
    └── MainContent
        └── PersonalWorkspaceView.tsx
            ├── Header
            │   ├── UserDisplay
            │   ├── PeriodSelector (本周/本月/本年度)
            │   └── ViewModeToggle (图表/清单)
            ├── StatisticsPanel
            │   ├── ChartView
            │   │   ├── CompletionDonutChart
            │   │   ├── CategoryPieChart
            │   │   ├── TravelStatsCard
            │   │   └── MeetingStatsCard
            │   └── ListView
            │       ├── StatsTable
            │       ├── CategoryRows
            │       ├── TravelSummaryRow
            │       └── MeetingSummaryRow
            ├── TaskPanels
            │   ├── InProgressPanel (Top)
            │   ├── PendingPanel (Middle)
            │   └── CompletedPanel (Bottom)
            └── UserSwitcher (LEADER/ADMIN only)
```

## Extensibility Points

1. **New work day calculation**: Update workDayCalculator function
2. **New chart types**: Add to ChartView component
3. **New list sections**: Add to ListView component
4. **New period types**: Add to Period enum and selector
