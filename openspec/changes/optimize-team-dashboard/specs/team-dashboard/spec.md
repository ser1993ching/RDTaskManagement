## ADDED Requirements

### Requirement: Access Control for Team Dashboard

The system SHALL restrict access to the team dashboard to only LEADER and ADMIN roles.

#### Scenario: ADMIN accesses team dashboard
- **WHEN** a user with ADMIN role attempts to view the team dashboard
- **THEN** the dashboard SHALL be displayed with full functionality
- **AND** all statistics charts SHALL be visible

#### Scenario: LEADER accesses team dashboard
- **WHEN** a user with LEADER role attempts to view the team dashboard
- **THEN** the dashboard SHALL be displayed with full functionality
- **AND** all statistics charts SHALL be visible

#### Scenario: MEMBER redirected from team dashboard
- **WHEN** a user with MEMBER role attempts to view the team dashboard
- **THEN** the user SHALL be redirected to the personal workspace
- **AND** the team dashboard SHALL NOT be displayed
- **AND** no team statistics SHALL be visible

### Requirement: Time Period Filtering

The system SHALL provide time period filtering for team dashboard statistics.

#### Scenario: Week period filter selected
- **WHEN** the user selects "本周" (this week) from the period selector
- **THEN** all dashboard statistics SHALL filter tasks by creation date within the current week
- **AND** KPI cards SHALL show counts for the current week only
- **AND** all charts SHALL update to reflect week-based data

#### Scenario: Month period filter selected
- **WHEN** the user selects "本月" (this month) from the period selector
- **THEN** all dashboard statistics SHALL filter tasks by creation date within the current month
- **AND** KPI cards SHALL show counts for the current month only
- **AND** all charts SHALL update to reflect month-based data

#### Scenario: Year period filter selected
- **WHEN** the user selects "本年度" (this year) from the period selector
- **THEN** all dashboard statistics SHALL filter tasks by creation date within the current year
- **AND** KPI cards SHALL show counts for the current year only
- **AND** all charts SHALL update to reflect year-based data

### Requirement: Completed Workload Comparison

The system SHALL display completed workload comparison for team members.

#### Scenario: Completed workload chart displayed
- **WHEN** a LEADER or ADMIN views the team dashboard
- **THEN** a bar chart SHALL show completed workload for each team member
- **AND** the chart SHALL display workload in hours
- **AND** members SHALL be sorted by completed workload in descending order

#### Scenario: Workload comparison with pending
- **WHEN** the completed workload chart is displayed
- **AND** the pending workload chart is displayed side by side
- **THEN** users CAN compare completed vs pending workload
- **AND** both charts SHALL use the same y-axis scale

### Requirement: Task Trend Analysis

The system SHALL display task assignment and completion trends over time.

#### Scenario: Task trend chart displayed
- **WHEN** the user views the team dashboard
- **THEN** a line chart SHALL display task trends over time
- **AND** the chart SHALL show two lines: "任务分配" (assigned) and "任务完成" (completed)
- **AND** data points SHALL represent monthly intervals

#### Scenario: Trend chart with time range selection
- **WHEN** the user selects a time range (3, 6, or 12 months)
- **THEN** the trend chart SHALL update to show data for the selected range
- **AND** the x-axis SHALL adjust to reflect the selected months

#### Scenario: Hover tooltip shows detailed data
- **WHEN** the user hovers over a data point on the trend chart
- **THEN** a tooltip SHALL display the assigned count and completed count for that period
- **AND** the completion rate for that period SHALL be calculated and shown

### Requirement: Project Category Distribution

The system SHALL display task distribution by project category.

#### Scenario: Project category pie chart
- **WHEN** the user views the project statistics section
- **THEN** a pie chart SHALL show task distribution by project category
- **AND** categories SHALL include: 市场配合, 常规项目, 核电项目, 科研项目, 改造项目, 其他
- **AND** each slice SHALL display the task count and percentage

#### Scenario: Project attribute statistics
- **WHEN** the user views project statistics
- **THEN** summary cards SHALL show:
  - Number of won market projects (isWon=true)
  - Number of commissioned execution projects (isCommissioned=true)
  - Number of key projects (isKeyProject=true)

### Requirement: Category Completion Rate

The system SHALL display task completion rates by category.

#### Scenario: Category completion bar chart
- **WHEN** the user views the category statistics
- **THEN** a bar chart SHALL display completion rate for each task category
- **AND** categories TC001-TC010 SHALL be included
- **AND** completion rate SHALL be calculated as: (completed tasks / total tasks) × 100%
- **AND** bars SHALL be sorted by completion rate in descending order

#### Scenario: Category statistics in list mode
- **WHEN** the user switches to list view for category statistics
- **THEN** a table SHALL display category name, total tasks, completed tasks, and completion rate
- **AND** each row SHALL include a progress bar showing completion percentage

### Requirement: Special Task Statistics

The system SHALL display statistics for special task types (travel and meeting).

#### Scenario: Travel task summary
- **WHEN** travel task statistics are displayed
- **THEN** a summary card SHALL show:
  - Total travel days (sum of TravelDuration for TC009 tasks)
  - Number of travel tasks

#### Scenario: Meeting task summary
- **WHEN** meeting task statistics are displayed
- **THEN** a summary card SHALL show:
  - Total meeting hours (sum of MeetingDuration for TC007 tasks)
  - Number of meeting tasks

#### Scenario: Special tasks excluded from main charts
- **WHEN** main task statistics charts are rendered
- **THEN** TC009 (travel) and TC007 (meeting) tasks SHALL be excluded from the main completion rate
- **AND** TC009/TC007 tasks SHALL have separate statistics sections

### Requirement: Overdue Task Alert

The system SHALL display an alert for overdue tasks.

#### Scenario: Overdue tasks count displayed
- **WHEN** the dashboard loads
- **THEN** a warning card SHALL show the count of overdue tasks
- **AND** overdue tasks ARE DEFINED AS: DueDate < current date AND Status ≠ COMPLETED

#### Scenario: Overdue tasks detail available
- **WHEN** the user clicks on the overdue tasks card
- **THEN** a modal or expanded section SHALL show details of overdue tasks
- **AND** details SHALL include: task name, assignee, due date, and days overdue
