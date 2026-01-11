# Proposal: Personal Workspace Feature

## Why

Currently, users lack a dedicated space to view their personal task status and statistics. The existing Dashboard provides team-wide metrics, but individual team members need:

1. **Personalized task view** - See only tasks assigned to them, organized by status panels
2. **Visual statistics** - Chart-based statistics for better data visualization
3. **Travel/Meeting tracking** - Dedicated tracking for business travel days and meeting hours with work day percentage
4. **View mode switching** - Toggle between chart view and list view
5. **Long-running task alerts** - Tasks exceeding 2 months need visibility to prevent stagnation
6. **Team leader oversight** - Leaders need ability to view team members' workspaces and retrieve stalled tasks back to the task pool

## What Changes

### New Personal Workspace Module
- **PersonalWorkspaceView.tsx** - New component for personal task management
- Accessible to all authenticated users (MEMBER, LEADER, ADMIN)
- Role-based features:
  - **MEMBER**: View only their own tasks and statistics
  - **LEADER/ADMIN**: Can switch between personal view and any team member's view

### Task Display Layout
- **Three Status Panels** (stacked vertically):
  - **进行中 (In Progress)** - Top panel, shows tasks with status "进行中"
  - **未开始 (Pending)** - Middle panel, shows tasks with status "未开始"
  - **已完成 (Completed)** - Bottom panel, shows tasks with status "已完成"
- Each panel has:
  - Header with task count
  - Collapsible section
  - Task list with same columns

### Statistics Panel
- **View Mode Toggle**: Switch between:
  - **图表模式 (Chart View)**: Visual charts and graphs
  - **清单模式 (List View)**: Detailed data table

- **Chart View includes**:
  - Period tabs: 本周/本月/本年度
  - Completion rate donut chart
  - Category distribution pie chart
  - Travel/Meeting stats cards

- **List View includes**:
  - Detailed statistics table
  - Category breakdown rows
  - Travel/Meeting summary rows

### Travel & Meeting Statistics
- **Travel Tasks (TC009)**:
  - Total travel days (sum of TravelDuration)
  - Percentage of work days
  - Individual travel entries with dates

- **Meeting/Training Tasks (TC007)**:
  - Total meeting hours (sum of MeetingDuration)
  - Percentage of work hours
  - Individual meeting entries with duration

- **Work Day Calculation**: Based on standard 8-hour work day

### Long-Running Task Reminder
- **Trigger**: Tasks where:
  - Created date > 2 months ago AND status is NOT completed, OR
  - Start date > 2 months ago AND status is NOT started
- **UI**: Alert badge/icon on affected tasks
- **Filtering**: Can filter view to show only long-running tasks

### Task Pool Retrieval
- **Role**: LEADER and ADMIN only
- **Scope**: Any incomplete task assigned to any team member
- **Action**: Move task from regular task list back to task pool
- **No confirmation required** per requirements

### Report Export
- **CSV Export**: Download statistics and task list as CSV
- **Print/HTML**: Browser print-friendly view for PDF export

## Impact

### Affected Specs
- `task-management` - New personal view with filtering
- `task-pool` - Task retrieval from task pool capability
- `user-management` - Team member viewing capability

### Affected Code
- `types.ts` - Add PersonalWorkspaceStats interface
- `dataService.ts` - Add personal statistics queries, task retrieval operations, travel/meeting calculations
- `App.tsx` - Add PersonalWorkspaceView routing
- `PersonalWorkspaceView.tsx` - New component (~100KB)
- `Layout.tsx` - Add navigation item for Personal Workspace

## Dependencies
- `task-pool` - Must be implemented first (task retrieval references pool)
- `recharts` - Already in use for charts, will add new chart types
