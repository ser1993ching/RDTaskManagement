## ADDED Requirements

### Requirement: Role-Specific Task Status
The system SHALL provide independent status tracking for each of the four task roles: Assignee (负责人), Checker (校核人), ChiefDesigner (主任设计), and Approver (审查人).

#### Scenario: Role status fields exist on Task
- **WHEN** a task is created or retrieved
- **THEN** it SHALL contain four status fields: `assigneeStatus`, `checkerStatus`, `chiefDesignerStatus`, and `approverStatus`
- **AND** each field SHALL have one of the values: 未开始、进行中、修改中、驳回中、已完成

#### Scenario: Checker status is optional
- **WHEN** a task has no checker assigned (CheckerID is empty)
- **THEN** the `checkerStatus` field SHALL be optional/undefined
- **AND** the task SHALL not require checker status to be completed

#### Scenario: ChiefDesigner status is optional
- **WHEN** a task has no chief designer assigned (ChiefDesignerID is empty)
- **THEN** the `chiefDesignerStatus` field SHALL be optional/undefined
- **AND** the task SHALL not require chief designer status to be completed

#### Scenario: Approver status is optional
- **WHEN** a task has no approver assigned (ApproverID is empty)
- **THEN** the `approverStatus` field SHALL be optional/undefined
- **AND** the task SHALL not require approver status to be completed

### Requirement: Task Status State Machine
The system SHALL use a refined task status workflow with six states to reflect the actual work progress.

#### Scenario: Initial task status
- **WHEN** a new task is created
- **THEN** the task status SHALL be 未开始 (Not Started)
- **AND** `assigneeStatus` SHALL be 未开始 (Not Started)

#### Scenario: Assignee drafting task
- **WHEN** the assignee starts working on a task
- **AND** changes `assigneeStatus` to 进行中 (In Progress)
- **THEN** the task status SHALL automatically update to 编制中 (Drafting)

#### Scenario: Task under checker
- **WHEN** the assignee completes their work
- **AND** changes `assigneeStatus` to 已完成 (Completed)
- **AND** the checker changes `checkerStatus` to 进行中 (In Progress)
- **THEN** the task status SHALL automatically update to 校核中 (Reviewing)

#### Scenario: Task under chief designer
- **WHEN** the checker completes their review
- **AND** changes `checkerStatus` to 已完成 (Completed)
- **AND** the chief designer changes `chiefDesignerStatus` to 进行中 (In Progress)
- **THEN** the task status SHALL automatically update to 审查中 (Reviewing)

#### Scenario: Task under approver
- **WHEN** the chief designer completes their review
- **AND** changes `chiefDesignerStatus` to 已完成 (Completed)
- **AND** the approver changes `approverStatus` to 进行中 (In Progress)
- **THEN** the task status SHALL automatically update to 审查中 (Reviewing 2)

#### Scenario: Task completion
- **WHEN** all assigned roles have completed their work
- **AND** `assigneeStatus` is 已完成 (Completed)
- **AND** `checkerStatus` is 已完成 (Completed) or undefined (no checker)
- **AND** `chiefDesignerStatus` is 已完成 (Completed) or undefined (no chief designer)
- **AND** `approverStatus` is 已完成 (Completed) or undefined (no approver)
- **THEN** the task status SHALL automatically update to 已完成 (Completed)

### Requirement: Rejection Status Handling
The system SHALL handle rejection scenarios where a task is sent back from review stages.

#### Scenario: Rejection from checker
- **WHEN** the checker rejects the task
- **AND** changes `checkerStatus` to 驳回中 (Rejected)
- **THEN** the task status SHALL automatically update to 校核中 (Reviewing) with rejection indicator
- **AND** the assignee SHALL be notified to make revisions

#### Scenario: Rejection from chief designer
- **WHEN** the chief designer rejects the task
- **AND** changes `chiefDesignerStatus` to 驳回中 (Rejected)
- **THEN** the task status SHALL automatically update to 审查中 (Reviewing) with rejection indicator
- **AND** the relevant role SHALL be notified to make revisions

#### Scenario: Rejection from approver
- **WHEN** the approver rejects the task
- **AND** changes `approverStatus` to 驳回中 (Rejected)
- **THEN** the task status SHALL automatically update to 审查中 (Reviewing 2) with rejection indicator
- **AND** the relevant role SHALL be notified to make revisions

#### Scenario: Assignee revising after rejection
- **WHEN** the assignee starts revising after rejection
- **AND** changes `assigneeStatus` to 进行中 (In Progress)
- **THEN** the task status SHALL automatically update to 修改中 (Revising)

### Requirement: Role Status Display in Personal Workspace
The personal workspace SHALL display the user's role and corresponding status for each task.

#### Scenario: Display user role in task list
- **WHEN** a user views their personal workspace
- **THEN** each task SHALL show which role the user plays: 负责人 (Assignee), 校核人 (Checker), 主任设计 (ChiefDesigner), or 审查人 (Approver)
- **AND** the role SHALL be determined by matching the user's ID with AssigneeID, CheckerID, ChiefDesignerID, or ApproverID

#### Scenario: Display role-specific status
- **WHEN** a user views their personal workspace
- **THEN** each task SHALL show the status for the user's specific role
- **AND** the status SHALL be one of: 未开始、进行中、修改中、驳回中、已完成

#### Scenario: Task with multiple roles
- **WHEN** a user is both assignee and checker on different tasks
- **THEN** each task SHALL show only the role relevant to that specific task
- **AND** the status SHALL correspond to that role's state

### Requirement: Workload Visibility Control
The system SHALL restrict workload visibility to authorized roles only.

#### Scenario: Workload visible to leaders
- **WHEN** a user with LEADER or ADMIN role views task details or list
- **THEN** the workload field SHALL be visible
- **AND** the workload value SHALL be displayed with the unit "小时" (hours)

#### Scenario: Workload hidden from regular members
- **WHEN** a user with MEMBER role views task details or list
- **THEN** the workload field SHALL be hidden or masked
- **AND** the workload value SHALL not be displayed

#### Scenario: Own workload visibility
- **WHEN** a MEMBER views their own completed tasks
- **THEN** they MAY see their own workload for reference
- **AND** this is only for informational purposes, not for comparison

### Requirement: Workload Unit Conversion
The system SHALL use hours as the standard unit for workload tracking.

#### Scenario: Workload input in hours
- **WHEN** a user enters workload value
- **THEN** the value SHALL be interpreted and stored as hours
- **AND** displayed with the "小时" suffix in all views

#### Scenario: Existing data migration
- **WHEN** migrating existing data with day-based workload
- **THEN** the system SHALL convert values by multiplying by 8
- **AND** the converted value SHALL be stored as hours

#### Scenario: Workload statistics display
- **WHEN** displaying workload statistics
- **THEN** all values SHALL be shown in hours
- **AND** total workload SHALL be calculated as sum of hours

## MODIFIED Requirements

### Requirement: Task Status Display
The system SHALL display task status using a six-state workflow to reflect the actual work progress through different review stages.

**Previous**: Task status displayed simple three-state values: 未开始、进行中、已完成

**Current**: Task status displays six-state workflow: 未开始、编制中、修改中、校核中、审查中、已完成

#### Scenario: Status column in task list
- **WHEN** viewing task list
- **THEN** the status column SHALL show the six-state values
- **AND** each status SHALL have distinct visual styling

#### Scenario: Status filter options
- **WHEN** filtering tasks by status
- **THEN** the filter dropdown SHALL include all six status options
- **AND** users SHALL be able to filter by any specific status

### Requirement: Task Creation Form
The system SHALL initialize role-specific status fields when creating a new task to ensure proper state tracking from the beginning.

**Previous**: Task creation form did not include role status fields

**Current**: Task creation form initializes role status fields automatically

#### Scenario: New task with default status
- **WHEN** creating a new task
- **THEN** `assigneeStatus` SHALL be initialized to 未开始
- **AND** `checkerStatus`, `chiefDesignerStatus`, and `approverStatus` SHALL be undefined if no corresponding role assigned

#### Scenario: Task creation with all reviewers
- **WHEN** creating a task with checker, chief designer, and approver assigned
- **THEN** `checkerStatus`, `chiefDesignerStatus`, and `approverStatus` SHALL be initialized to 未开始
