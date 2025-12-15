# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**汽发任务管理系统** (Qifa Task Management System) is a task lifecycle management system for technical R&D teams. It's a React 19 + TypeScript single-page application with Vite, featuring personnel management, project tracking, and task analytics. The app currently uses localStorage for persistence (see `services/dataService.ts`) with seed data initialization.

## Quick Start

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
# Note: Uses custom dev-server.js wrapper for Windows compatibility
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clear localStorage and reset to seed data
# Run in browser console: copy contents of clear_localStorage.js
```

### Default Login Credentials

- **Admin**: `admin` / `admin`
- **Team Leader**: `LEADER001` / `123` (张组长)
- **Team Member**: `USER001` / `123` (李研发)

## Architecture & Code Structure

### Technology Stack

- **Frontend Framework**: React 19.2.1 with TypeScript
- **Build Tool**: Vite 6.2.0 with custom dev-server wrapper
- **UI Components**: Custom components (no UI library)
- **Icons**: Lucide React
- **Charts**: Recharts 3.5.1
- **Styling**: Tailwind CSS (via className)
- **Persistence**: localStorage (see dataService.ts)

### Core Data Model (types.ts)

**Four main entities with relationships:**

1. **User** (Personnel Management)
   - Fields: UserID (PK), Name, SystemRole, OfficeLocation, Status, etc.
   - Enums: SystemRole (ADMIN/LEADER/MEMBER), OfficeLocation, PersonnelStatus
   - Used in: PersonnelView, Task assignment

2. **Project** (Project Tracking)
   - Fields: id (PK), name, category, capacity, model, dates, etc.
   - Enums: ProjectCategory (MARKET/EXECUTION/RESEARCH/RENOVATION/OTHER)
   - Used in: ProjectView, Task linking

3. **TaskClass** (Configurable Categories)
   - Fields: id (PK), name, code, description
   - Default 10 categories: Market, Execution, Product Dev, Research, Renovation, Meeting/Training, Admin/Party, Travel, Other
   - Used in: TaskClassView, Task categorization

4. **Task** (Work Items)
   - Fields: TaskID (PK), TaskName, TaskClassID (FK), Category, ProjectID (FK), AssigneeID (FK), dates, workload, difficulty, status
   - Enums: TaskStatus (NOT_STARTED/IN_PROGRESS/COMPLETED)
   - Used in: TaskView, Dashboard analytics

### Component Architecture

```
App.tsx (Main Entry)
├── Authentication Gate (Lock screen if not logged in)
├── State Management (currentUser, users, projects, tasks, currentView)
└── View Routing (switch on currentView)
    ├── Dashboard.tsx (Overview with charts/statistics)
    ├── PersonnelView.tsx (User CRUD operations)
    ├── ProjectView.tsx (Project CRUD operations)
    ├── TaskView.tsx (Task CRUD with filtering/batch operations)
    ├── TaskClassView.tsx (Task class CRUD operations)
    └── Layout.tsx (Navigation shell with sidebar)
```

**Key Components:**

- **App.tsx**: Main entry, authentication gate, state management, view routing
- **Layout.tsx**: Sidebar navigation, user info, logout
- **Dashboard.tsx**: Statistics, charts (Recharts), project/task overview
- **PersonnelView.tsx**: User management (add/edit/delete users)
- **ProjectView.tsx**: Project management with category-specific fields
- **TaskView.tsx**: Task management, filtering by assignee/status/class, batch operations
- **TaskClassView.tsx**: Task category management (10 default categories)

### Data Layer (services/dataService.ts)

**Centralized service class wrapping localStorage:**

- Storage keys: `rd_users`, `rd_projects`, `rd_tasks`, `rd_task_classes`, `rd_current_user`
- **Seed Data Initialization**: 9 default users, 5 projects, 10 task classes, sample tasks
- **CRUD Operations**: get/create/update/delete methods for all entities
- **Authentication**: login/logout/session persistence
- **Soft Delete**: `is_deleted` flag instead of hard deletion
- **ID Generation**: Utility functions for generating unique IDs
- **Data Refresh**: Methods to reload data from localStorage

**Key Methods:**
```typescript
// Reading
getUsers(), getProjects(), getTasks(), getTaskClasses(), getCurrentUser()

// Writing
saveUser(user), saveProject(project), saveTask(task), saveTaskClass(taskClass)

// Deleting (soft delete)
deleteUser(userId), deleteProject(projectId), deleteTask(taskId)

// Authentication
login(username, password), logout()
```

### Build Configuration (vite.config.ts)

- **Port**: 3000
- **Host**: 0.0.0.0 (accessible from network)
- **React Plugin**: JSX/TSX support
- **Environment Variables**: `GEMINI_API_KEY` (referenced but not used)
- **Path Alias**: `@/` maps to project root

## Development Workflow

### Development Server

The project uses a **custom dev-server.js wrapper** instead of calling Vite directly. This solves module resolution issues on Windows where npm scripts may fail to resolve `node_modules/.bin/vite`.

The dev-server.js:
- Spawns Vite with proper path resolution
- Passes through all command-line arguments
- Handles errors gracefully

### Data Management

**localStorage Pattern:**
- All data persisted to browser localStorage
- No backend API (future consideration)
- Run `clear_localStorage.js` in browser console to reset to seed data
- Data auto-initializes on first load

**State Management:**
- App-level state in App.tsx manages:
  - `currentUser`: authenticated user object
  - `users`, `projects`, `tasks`: entity arrays
  - `currentView`: active view name
- Components receive data via props
- Updates flow through dataService then refresh state

### Adding New Features

**Adding a New View:**
1. Create component in `components/`
2. Import in App.tsx
3. Add route in App.tsx switch statement (lines ~110-113)
4. Add navigation item in Layout.tsx menuItems array

**Modifying Data Model:**
1. Update interface in `types.ts`
2. Update seed data in `services/dataService.ts` (lines ~13-137)
3. Update dataService CRUD methods if needed
4. Update related components

**Managing Task Classes:**
1. Access via Layout navigation "任务类管理"
2. Add/edit/delete TaskClass entities in TaskClassView.tsx
3. Tasks reference TaskClass via `TaskClassID` field
4. Categories configured in TaskView.tsx via CATEGORY_CONFIG mapping

## Dependencies

### Production
- `react@19.2.1` & `react-dom@19.2.1`: UI framework
- `lucide-react@^0.556.0`: Icon library
- `recharts@^3.5.1`: Charting library

### Development
- `vite@^6.2.0`: Build tool
- `typescript@~5.8.2`: Type safety
- `@vitejs/plugin-react@^5.0.0`: React support
- `@types/node@^22.14.0`: Node.js types

## Environment Configuration

### .env.local
```bash
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```
- Referenced in vite.config.ts (lines ~14-15)
- **Not currently used** in codebase
- Available for future Gemini integration

### TypeScript Configuration (tsconfig.json)
- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Path mapping: `@/*` → `./*`
- NoEmit: true (Vite handles compilation)

## Configuration Files

### .claude/settings.local.json
- Permissions configuration for Claude Code
- Allows: `Bash(npm install)`, `Bash(node:*)`

### .vscode/settings.json
- VS Code workspace settings

### .gitignore
- Excludes: `node_modules/`, `dist/`, `*.local`, logs, IDE files
- Keeps: source code, configs, package files

### metadata.json
- Project metadata (not fully reviewed in analysis)

## Key Implementation Details

### Type Safety
- All entities strongly typed with TypeScript interfaces
- Enums for: SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus
- Task references TaskClass via `TaskClassID` field
- Projects and Tasks support soft deletes via `is_deleted` flag

### Authentication Flow
1. User enters credentials on login screen
2. dataService.login() validates against seed data
3. Success: set currentUser, persist to localStorage
4. Failure: show error message
5. On app reload: check localStorage for existing session

### Data Flow Pattern
```
User Action → Component → dataService Method → localStorage → refreshData() → State Update → Re-render
```

### View Routing
- No React Router - simple state-based routing
- currentView state determines which component to render
- Navigation buttons update currentView state
- All views rendered within Layout component

## Testing & Quality

**No testing framework configured** (no Jest, Vitest, or testing library)
- No test files found (no *.test.ts or *.spec.ts)
- No linting configured (no ESLint, Prettier configs)

**Code Quality Tools:**
- TypeScript for type checking
- Vite for fast development and building

## Common Development Tasks

### Reset Application Data
```javascript
// In browser console
localStorage.clear();
location.reload();
```
Or copy contents of `clear_localStorage.js` to console.

### Add New User Role
1. Update SystemRole enum in types.ts
2. Update seedUsers in dataService.ts
3. Update UI components that display roles

### Modify Task Categories
1. Access TaskClassView
2. Add/edit TaskClass entities
3. Tasks automatically reference via TaskClassID

### Change Build Output
- Modify vite.config.ts
- Default port: 3000
- Default host: 0.0.0.0

## Performance Considerations

- Uses React 19 with concurrent features
- Vite for fast HMR and builds
- No state management library (React useState only)
- LocalStorage for persistence (sufficient for small datasets)
- Recharts for efficient chart rendering

## Future Enhancements

- **Backend API Integration**: Replace localStorage with REST API
- **Real-time Updates**: WebSocket support for multi-user sync
- **Advanced Analytics**: More detailed reporting and dashboards
- **File Uploads**: Support for task attachments
- **Notifications**: Task reminders and updates
- **API Documentation**: Currently mentioned in existing CLAUDE.md but file not found

## Troubleshooting

**Dev server won't start:**
- Ensure Node.js is installed
- Try `npm install` if dependencies missing
- Use `npm run dev` (not `npx vite` directly)

**Data not persisting:**
- Check localStorage isn't full
- Run clear_localStorage.js to reset
- Verify no console errors

**Type errors:**
- Check types.ts for interface definitions
- Ensure all required fields are provided
- Review tsconfig.json for path mapping

**Build fails:**
- Run `npm install` to ensure all dependencies
- Check for TypeScript errors
- Verify vite.config.ts configuration
