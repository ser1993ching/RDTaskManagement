# Tasks: Personal Workspace Feature

## Phase 1: Data Layer

- [x] **1.1** Add `PersonalStats` interface to `types.ts`
  - Add `periodStats` object with week/month/year counts by status
  - Add `inProgress`, `pending`, `completed` arrays for tasks
  - Add `categoryDistribution` array
  - Add `travelStats` object (totalDays, percentage)
  - Add `meetingStats` object (totalHours, percentage)
  - Add `isLongRunning` computed type helper

- [x] **1.2** Add dataService methods to `dataService.ts`
  - `getPersonalTasks(userId: string)` - Get all tasks for a user
  - `separateTasksByStatus(tasks: Task[])` - Split into 3 status arrays
  - `calculatePeriodStats(tasks: Task[], period: Period)` - Calculate period stats
  - `calculateTravelStats(tasks: Task[], period: Period)` - TC009 days and percentage
  - `calculateMeetingStats(tasks: Task[], period: Period)` - TC007 hours and percentage
  - `getCategoryDistribution(tasks: Task[])` - Group by category
  - `isTaskLongRunning(task: Task)` - Check 2-month condition
  - `retrieveTaskToPool(taskId: string)` - Move task back to pool (LEADER/ADMIN)
  - `exportStatsToCSV(stats: PersonalStats, tasks: Task[])` - CSV export
  - `getTeamMembers(managerId?: string)` - Get team members for switcher

- [x] **1.3** Add work day calculation utility
  - Calculate work days in a period (weekday count × 8 hours)
  - Used for travel/meeting percentage calculation

## Phase 2: Component - PersonalWorkspaceView

- [x] **2.1** Create `PersonalWorkspaceView.tsx` skeleton
  - Add state for `selectedUserId` (default: currentUser.id)
  - Add state for `currentPeriod` (default: week)
  - Add state for `viewMode` (default: 'chart')
  - Add state for `expandedPanels` (all true by default)
  - Add `handleRefresh` callback

- [x] **2.2** Add navigation item to `Layout.tsx`
  - Add "个人工作台" menu item for all authenticated users
  - Position after Dashboard in sidebar

- [x] **2.3** Add routing in `App.tsx`
  - Add route `/workspace` for PersonalWorkspaceView
  - Protect route (require authentication)

## Phase 3: Statistics Panel - Chart Mode

- [x] **3.1** Create Header with controls
  - Period selector: [本周] [本月] [本年度]
  - View mode toggle: [图表模式] / [清单模式]

- [x] **3.2** Create ChartView component
  - Completion Donut Chart (completed/total for period)
  - Category Pie Chart (distribution excluding TC009/TC007)
  - Travel Stats Card:
    - Total travel days
    - Percentage of work days
  - Meeting Stats Card:
    - Total meeting hours
    - Percentage of work hours

- [x] **3.3** Implement period filtering
  - Filter tasks by created_date within period
  - Update all charts/stats when period changes

## Phase 4: Statistics Panel - List Mode

- [x] **4.1** Create ListView component
  - Stats summary table (inProgress/pending/completed counts)
  - Completion rate calculation
  - Category breakdown rows with percentages
  - Travel summary row
  - Meeting summary row

- [x] **4.2** Style list view for readability
  - Clean table layout
  - Expandable category details
  - Clear section headers

## Phase 5: Task Panels (Three Stacked)

- [x] **5.1** Create shared TaskPanel component
  - Collapsible header with task count
  - Expand/collapse toggle button
  - Task table with consistent columns

- [x] **5.2** Implement InProgressPanel (Top)
  - Filter tasks with status === '进行中'
  - Render at top position

- [x] **5.3** Implement PendingPanel (Middle)
  - Filter tasks with status === '未开始'
  - Render at middle position

- [x] **5.4** Implement CompletedPanel (Bottom)
  - Filter tasks with status === '已完成'
  - Render at bottom position

- [x] **5.5** Add long-running task indicators
  - Check `isTaskLongRunning` for each task
  - Show warning icon for qualifying tasks
  - Highlight row background

## Phase 6: Team Leader Features

- [x] **6.1** Create UserSwitcher component
  - Dropdown with team members (excluding self)
  - Show current viewing user name
  - Only visible for LEADER/ADMIN roles

- [x] **6.2** Implement user switching logic
  - Update `selectedUserId` state on selection
  - Refresh all stats and task lists

- [x] **6.3** Add task retrieval to pool button
  - "收回任务库" button in task row actions
  - Only visible for LEADER/ADMIN
  - Call `retrieveTaskToPool(taskId)` on click
  - No confirmation dialog (per requirements)

## Phase 7: Report Export

- [x] **7.1** Implement CSV export
  - Generate CSV with all visible tasks
  - Include status category breakdowns
  - Include travel/meeting statistics
  - Trigger browser download

- [x] **7.2** Add print-friendly view
  - `@media print` stylesheet
  - Hide navigation, buttons during print
  - Expand all panels for printing

- [x] **7.3** Add export buttons to UI
  - "导出CSV" button in stats panel
  - "打印报表" button in task list header

## Dependencies

- Must complete `task-pool` feature first (for retrieval target)
- Uses existing `recharts` library for charts
- Uses existing `dataService` patterns

## Parallelizable Work

- Phase 1 (Data Layer) independent
- Phase 2 (Component skeleton) independent
- Phase 3 (Chart View) and Phase 4 (List View) can be parallel
- Phase 5 (Task Panels) depends on Phase 1
- Phase 6 (Leader Features) depends on Phase 2
- Phase 7 (Export) can be parallel with Phase 6
