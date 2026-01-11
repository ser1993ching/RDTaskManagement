# Change: Add Task Pool Feature

## Why
Currently, tasks can only be created directly in the Task Management module, which requires assigning them immediately with complete information. Managers need a way to plan tasks in advance with basic information (name, project, person in charge, timeline), and assign them to team members when ready. The task pool serves as a task planning tool where administrators and team leaders can pre-create task plans that are not visible in the regular task list until formally assigned.

## What Changes
- Added new "Task Pool" (任务库) module accessible only to ADMIN and LEADER roles
- Task Pool has independent management interface separate from Task Management
- Task Pool serves as a task planning tool for creating task plans with basic attributes: name, project, person in charge, start time, deadline, creator
- Task plans in the pool do not appear in the main Task Management view
- Task plans can be assigned to team members, converting them into full tasks with complete information
- Added new `TaskPoolItem` entity to store task plan data
- Added `is_in_pool` flag to Task entity to distinguish planned tasks from regular tasks
- **Supported task types in pool:** 市场配合、常规项目执行、核电项目执行、产品研发、科研、改造服务、行政与党建、其他
- **Excluded from pool:** 内部会议与培训、差旅服务任务 (must be created directly in Task Management)

## Impact
- Affected specs: task-management, user-management
- Affected code:
  - `types.ts` - Add TaskPoolItem interface and Task.is_in_pool field
  - `dataService.ts` - Add TaskPool CRUD operations
  - `App.tsx` - Add TaskPoolView component and routing
  - `TaskPoolView.tsx` - New component for pool management
  - `Layout.tsx` - Add navigation item for ADMIN/LEADER
