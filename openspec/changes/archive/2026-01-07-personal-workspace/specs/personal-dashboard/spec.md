# Personal Dashboard Specification

## ADDED Requirements

### Requirement: Task Panel Layout

The system SHALL display tasks in three vertically stacked panels organized by status.

#### Scenario: Three panels displayed
- **WHEN** the user views the personal workspace
- **THEN** three task panels SHALL be visible
- **AND** they SHALL be ordered: 进行中 → 未开始 → 已完成

#### Scenario: In Progress panel at top
- **WHEN** the user views the personal workspace
- **THEN** the "进行中" (In Progress) panel SHALL appear at the top
- **AND** it SHALL contain tasks with status "进行中"

#### Scenario: Pending panel in middle
- **WHEN** the user views the personal workspace
- **THEN** the "未开始" (Pending) panel SHALL appear in the middle
- **AND** it SHALL contain tasks with status "未开始"

#### Scenario: Completed panel at bottom
- **WHEN** the user views the personal workspace
- **THEN** the "已完成" (Completed) panel SHALL appear at the bottom
- **AND** it SHALL contain tasks with status "已完成"

#### Scenario: Panel headers show task count
- **WHEN** a task panel is rendered
- **THEN** the panel header SHALL display the task count in parentheses
- **AND** the count SHALL update when tasks change status

#### Scenario: Panels are collapsible
- **WHEN** the user clicks the expand/collapse toggle on a panel
- **THEN** the panel SHALL expand or collapse
- **AND** the expanded state SHALL be remembered for the session

### Requirement: Chart-Based Statistics

The system SHALL display statistics using visual charts for better data visualization.

#### Scenario: Completion rate displayed as donut chart
- **WHEN** the user views statistics in chart mode
- **THEN** a donut chart SHALL show completion rate
- **AND** the chart SHALL display "已完成 / 总数" and percentage

#### Scenario: Category distribution displayed as pie chart
- **WHEN** the user views statistics in chart mode
- **THEN** a pie chart SHALL show task distribution by category
- **AND** categories TC001-TC008 and TC010 SHALL be included
- **AND** hovering SHALL show category name and count

#### Scenario: Statistics update with period selection
- **WHEN** the user selects a different period (本周/本月/本年度)
- **THEN** all charts and statistics SHALL update to reflect the selected period
- **AND** the data SHALL be filtered by tasks created within the period

### Requirement: Travel Statistics

The system SHALL provide dedicated statistics for travel tasks (TC009).

#### Scenario: Total travel days calculated
- **WHEN** travel task statistics are displayed
- **THEN** the system SHALL sum TravelDuration from all TC009 tasks
- **AND** display the total as "出差天数: X天"

#### Scenario: Travel work day percentage calculated
- **WHEN** travel task statistics are displayed
- **THEN** the system SHALL calculate: (TravelDuration / WorkHoursInPeriod) × 100%
- **AND** display as "占工作日时长: X%"

#### Scenario: Travel tasks excluded from completion charts
- **WHEN** task completion charts are rendered
- **THEN** TC009 travel tasks SHALL NOT be included in the main completion rate
- **AND** TC009 tasks SHALL have separate travel statistics

### Requirement: Meeting Statistics

The system SHALL provide dedicated statistics for meeting/training tasks (TC007).

#### Scenario: Total meeting hours calculated
- **WHEN** meeting task statistics are displayed
- **THEN** the system SHALL sum MeetingDuration from all TC007 tasks
- **AND** display the total as "会议时长: X小时"

#### Scenario: Meeting work hours percentage calculated
- **WHEN** meeting task statistics are displayed
- **THEN** the system SHALL calculate: (MeetingDuration / WorkHoursInPeriod) × 100%
- **AND** display as "占工作时长: X%"

#### Scenario: Meeting tasks excluded from completion charts
- **WHEN** task completion charts are rendered
- **THEN** TC007 meeting tasks SHALL NOT be included in the main completion rate
- **AND** TC007 tasks SHALL have separate meeting statistics

### Requirement: View Mode Toggle

The system SHALL allow users to switch between chart view and list view for statistics.

#### Scenario: Toggle between chart and list modes
- **WHEN** the user clicks "图表模式" (Chart Mode)
- **THEN** statistics SHALL be displayed as visual charts
- **AND** the toggle SHALL indicate "清单模式" (List Mode) is available

- **WHEN** the user clicks "清单模式" (List Mode)
- **THEN** statistics SHALL be displayed as detailed tables
- **AND** the toggle SHALL indicate "图表模式" (Chart Mode) is available

#### Scenario: List mode shows statistical table
- **WHEN** the user switches to list mode
- **THEN** a detailed statistical table SHALL be displayed
- **AND** the table SHALL include: status counts, category breakdown, travel summary, meeting summary

#### Scenario: View mode preference persisted
- **WHEN** the user switches view mode
- **THEN** the preference SHALL be saved to localStorage
- **AND** the saved mode SHALL be restored on next visit

### Requirement: Team Member View (LEADER/ADMIN)

The system SHALL allow LEADER and ADMIN roles to view personal workspaces of any team member.

#### Scenario: LEADER sees member switcher
- **WHEN** a user with LEADER role views the personal workspace
- **THEN** they SHALL see a dropdown to select team members
- **AND** the dropdown SHALL show all team members except themselves

#### Scenario: ADMIN sees all users in switcher
- **WHEN** a user with ADMIN role views the personal workspace
- **THEN** they SHALL see a dropdown with all users in the system

#### Scenario: Switch updates all views
- **WHEN** a LEADER or ADMIN selects a team member
- **THEN** all task panels and statistics SHALL update to show the selected member's data
- **AND** the workspace header SHALL show whose workspace is being viewed

### Requirement: Long-Running Task Reminder

The system SHALL display a reminder indicator for tasks that have been pending or incomplete for over 2 months.

#### Scenario: Task created 2+ months ago shows alert
- **WHEN** a task was created more than 60 days ago
- **AND** task status is not "已完成"
- **THEN** a warning indicator SHALL be shown in the task list
- **AND** the task row SHALL be highlighted

#### Scenario: Task not started for 2+ months shows alert
- **WHEN** a task has start_date more than 60 days ago
- **AND** task status is "未开始"
- **THEN** a warning indicator SHALL be shown in the task list
- **AND** the task row SHALL be highlighted

#### Scenario: Alert appears in appropriate panel
- **WHEN** a long-running task is identified
- **THEN** the warning indicator SHALL appear in the correct status panel
- **AND** the task SHALL remain in its original panel (进行中/未开始)

### Requirement: Task Pool Retrieval (LEADER/ADMIN)

The system SHALL allow LEADER and ADMIN roles to retrieve any incomplete task back to the task pool.

#### Scenario: Retrieve button visible for LEADER
- **WHEN** a user with LEADER role views an incomplete task
- **THEN** they SHALL see a "收回任务库" button in the task row

#### Scenario: Retrieve button visible for ADMIN
- **WHEN** a user with ADMIN role views an incomplete task
- **THEN** they SHALL see a "收回任务库" button in the task row

#### Scenario: Task moved to pool immediately
- **WHEN** a LEADER or ADMIN clicks "收回任务库"
- **THEN** the task SHALL be immediately moved to the task pool
- **AND** task's is_in_pool SHALL be set to true
- **AND** task's assignee_id SHALL be cleared
- **AND** task's project_id SHALL be cleared

#### Scenario: Task removed from all panels
- **WHEN** a task is retrieved to the pool
- **THEN** the task SHALL be removed from all three status panels
- **AND** the task SHALL NOT appear in any personal workspace

### Requirement: Report Export

The system SHALL provide CSV export and print functionality for statistics and task data.

#### Scenario: CSV export includes all data
- **WHEN** the user clicks "导出CSV"
- **AND** the file downloads
- **THEN** the CSV SHALL contain all currently visible tasks
- **AND** the CSV SHALL include statistics summary
- **AND** the CSV SHALL include travel/meeting breakdowns

#### Scenario: Print view is formatted
- **WHEN** the user clicks "打印报表"
- **AND** the print dialog opens
- **THEN** the view SHALL be formatted for printing
- **AND** all panels SHALL be expanded for printing

#### Scenario: Navigation hidden during print
- **WHEN** the user prints the page
- **THEN** the sidebar navigation SHALL be hidden
- **AND** buttons SHALL NOT be visible in the print output
