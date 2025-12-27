## ADDED Requirements

### Requirement: Task Pool Visibility
The system SHALL provide a Task Pool module for task planning that is ONLY visible to users with ADMIN or LEADER system roles.

#### Scenario: MEMBER cannot see Task Pool
- **WHEN** a user with MEMBER role logs in
- **THEN** the Task Pool navigation item SHALL NOT appear in the sidebar
- **AND** direct access to Task Pool URL SHALL redirect to dashboard

#### Scenario: LEADER can see Task Pool
- **WHEN** a user with LEADER role logs in
- **THEN** the Task Pool navigation item SHALL appear in the sidebar

#### Scenario: ADMIN can see Task Pool
- **WHEN** a user with ADMIN role logs in
- **THEN** the Task Pool navigation item SHALL appear in the sidebar

### Requirement: Task Plan Types
The system SHALL restrict task plan creation to specific task types.

#### Scenario: Allowed task types available for planning
- **WHEN** user opens the create task plan form
- **THEN** the task type dropdown SHALL show: 市场配合、常规项目执行、核电项目执行、产品研发、科研、改造服务、行政与党建、其他
- **AND** these options SHALL be selectable

#### Scenario: Excluded task types not available for planning
- **WHEN** user opens the create task plan form
- **THEN** the task type dropdown SHALL NOT show: 内部会议与培训、差旅服务
- **AND** these task types SHALL only be created in the regular Task Management module

### Requirement: Task Plan Creation
The system SHALL allow ADMIN and LEADER users to create task plans with basic attributes.

#### Scenario: Create task plan with required fields
- **WHEN** user fills in task name, selects a project, chooses person in charge, sets start time and deadline
- **AND** clicks the create button
- **THEN** a new task plan SHALL be created with status "未分配" (Unassigned)
- **AND** the plan creator SHALL be recorded automatically

#### Scenario: Create task plan with optional fields
- **WHEN** user provides additional information in optional fields
- **THEN** the information SHALL be stored and displayed in the task plan list

#### Scenario: Create task plan without required fields
- **WHEN** user attempts to create a task plan without filling required fields
- **THEN** validation errors SHALL be displayed
- **AND** the plan SHALL NOT be created

### Requirement: Task Plan Display
The system SHALL display task plans in a dedicated list with basic attributes.

#### Scenario: Display task plan list
- **WHEN** user navigates to Task Pool
- **THEN** a table SHALL show all task plans with columns: 任务名称, 关联项目, 负责人, 开始时间, 截止时间, 创建人, 操作
- **AND** the list SHALL be sortable by any column
- **AND** the list SHALL be filterable by project and status

#### Scenario: Task plan does not appear in Task Management
- **WHEN** a task is in the pool (is_in_pool = true)
- **THEN** it SHALL NOT appear in the regular Task Management view
- **AND** it SHALL only be visible in the Task Pool module

### Requirement: Task Plan Assignment
The system SHALL allow ADMIN and LEADER users to assign task plans to convert them into full tasks.

#### Scenario: Open assignment modal
- **WHEN** user clicks the "分配任务" (Assign Task) button on a task plan
- **THEN** an assignment modal SHALL open
- **AND** the modal SHALL display all task fields from the task plan
- **AND** the modal SHALL allow selecting an executor (actual assignee)
- **AND** the modal SHALL allow editing additional task fields: reviewers, workload, difficulty, priority, etc.

#### Scenario: Confirm assignment
- **WHEN** user selects an executor and fills in required assignment fields
- **AND** clicks confirm
- **THEN** a new task SHALL be created in the main tasks collection
- **AND** the task plan SHALL be marked as assigned (is_in_pool = false) or deleted
- **AND** the user SHALL be redirected to the Task Management view showing the new task

#### Scenario: Cancel assignment
- **WHEN** user clicks cancel in the assignment modal
- **THEN** all changes SHALL be discarded
- **AND** the task plan SHALL remain unchanged

### Requirement: Task Plan Management
The system SHALL allow ADMIN and LEADER users to manage task plans.

#### Scenario: Edit task plan
- **WHEN** user clicks the edit button on a task plan
- **THEN** an edit form SHALL open with current plan data
- **AND** changes SHALL be saved when confirmed

#### Scenario: Delete task plan
- **WHEN** user clicks the delete button on a task plan
- **THEN** a confirmation dialog SHALL appear
- **AND** on confirmation, the task plan SHALL be deleted (soft delete)
