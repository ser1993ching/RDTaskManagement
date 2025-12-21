<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

R&D Task Management System (研发团队任务管理系统) - A React-based internal task management application for a hydropower R&D team. The UI is in Chinese. This is a full-featured task management system with user management, project tracking, task assignment, and statistical dashboard.

## Development Commands

```bash
npm install         # Install dependencies
npm run dev         # Start development server (port 3000) - uses custom dev-server.js wrapper
npm run build       # Build for production
npm run preview     # Preview production build locally
```

**Important Notes:**
- npm run dev uses a custom cross-platform wrapper (dev-server.js) that ensures Vite starts correctly on Windows
- The app runs on port 3000 (configured in vite.config.ts)
- No test scripts are configured - this is a prototype/development project
- Clear localStorage: node clear_localStorage.js or use browser dev tools

## Architecture & Design Patterns

### Tech Stack
- **React 19** with TypeScript (latest features)
- **Vite 6** for bundling and dev server
- **localStorage** for data persistence (no backend/database)
- **Tailwind CSS** (loaded via CDN in index.html)
- **Recharts** for data visualization and charts
- **Lucide React** for icons

### Project Structure
```
/
├── App.tsx                    # Main application component with routing and auth
├── index.tsx                  # React entry point
├── types.ts                   # All TypeScript interfaces, enums, and type definitions
├── dev-server.js              # Cross-platform dev server wrapper for Vite
├── index.css                  # Global styles with Tailwind
├── index.html                 # HTML entry point
├── vite.config.ts             # Vite configuration with path aliases
├── tsconfig.json              # TypeScript configuration
├── components/                # All view components
│   ├── Layout.tsx             # Sidebar navigation and layout wrapper
│   ├── Dashboard.tsx          # Statistics dashboard with charts
│   ├── TaskView.tsx           # Task management (CRUD operations) - 105KB, most complex
│   ├── TaskClassView.tsx      # Task category and subcategory management
│   ├── ProjectView.tsx        # Project management (CRUD operations)
│   ├── PersonnelView.tsx      # User/personnel management
│   ├── Settings.tsx           # System settings and configuration
│   └── AutocompleteInput.tsx  # Reusable autocomplete component
└── services/
    └── dataService.ts         # Centralized data layer (localStorage + seed data)
```

### Core Architecture Pattern

**State Management:**
- App.tsx manages global state using React useState
- No external state management library (Redux, Zustand, etc.)
- State flows top-down via props

**Data Flow Pattern:**
1. **App.tsx** manages global application state:
   - currentUser - authenticated user session
   - users, projects, tasks - main application data

2. **dataService** (singleton pattern) handles:
   - All CRUD operations for Users, Projects, Tasks, TaskClasses
   - localStorage persistence with automatic initialization
   - Authentication (login/logout/session management)
   - Seed data population on first run
   - Settings management (equipment models, capacity levels, etc.)

3. **Component Pattern**:
   - Each view receives data as props
   - After mutations, components call onRefresh() callback
   - App.tsx reloads data from dataService and passes to children
   - Soft deletes using is_deleted flag (no hard deletes)

### Key Domain Types (types.ts)

**Core Entities:**
- **User** - Personnel records with UserID (工号), SystemRole (组员/班组长/管理员)
  - Fields: OfficeLocation, Status, JoinDate, Title, Education, etc.
  - Password stored in plain text (development only)

- **Project** - Projects with ProjectCategory (市场配合/常规项目/核电项目/科研/改造/其他)
  - Different fields based on category (e.g., isWon, isForeign for Market projects)
  - Can be linked to tasks

- **Task** - Tasks linked to TaskClassID, optionally to ProjectID, with TaskStatus
  - Complex entity with 20+ fields including workload, difficulty, reviewers
  - Special fields for Travel and Meeting tasks
  - Support for external assignees (non-system users)

- **TaskClass** - 10 primary task categories with codes TC001-TC010
  - Each mapped to a category code (MARKET, EXECUTION, NUCLEAR, etc.)
  - Has configurable subcategories

**Enums:** SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus

### Authentication & Authorization

**Login System:**
- Login via dataService.login(userId, password) - matches UserID or Name + Password
- Default credentials: admin/admin or 张组长/123
- Session persisted in localStorage under rd_current_user

**Role Hierarchy:**
- **ADMIN** - Full access to all features
- **LEADER** - Can manage team members and view all data
- **MEMBER** - Limited access, typically only their own tasks

**UI Restrictions:** Components check user roles to show/hide features

### Settings & Configuration System

The system includes configurable settings managed in dataService:
- **Equipment Models** (机型) - Stored in rd_equipment_models
- **Capacity Levels** (容量等级) - Stored in rd_capacity_levels
- **Travel Labels** (差旅类别) - Stored in rd_travel_labels
- **User Avatars** - Stored in rd_user_avatars
- **Task Categories** (task class subcategories) - Stored in rd_task_categories

Settings are initialized from existing data on first run and persisted to localStorage.

### Path Alias Configuration

@/* maps to project root directory:
- Configured in tsconfig.json (compiler options)
- Configured in vite.config.ts (resolve.alias)
- Used throughout the codebase for clean imports

### Key Components Overview

**TaskView.tsx** (105KB, most complex):
- Main task management interface
- Task creation, editing, deletion
- Filtering and search
- Status updates
- Workload tracking
- Reviewer assignment
- Handles all task types (regular, travel, meeting)

**Dashboard.tsx**:
- Statistical overview
- Charts using Recharts
- Task completion metrics
- Workload distribution
- Team performance metrics

**ProjectView.tsx**:
- Project CRUD operations
- Category-specific fields
- Project-task relationships
- Timeline management

**Settings.tsx** (52KB):
- System configuration
- User management
- Equipment model management
- Category configuration
- Data export/import

**Layout.tsx**:
- Sidebar navigation
- User info display
- Role-based menu visibility
- Responsive design

### Task Categories & Types

**10 Primary Task Classes (TaskClass):**
1. **TC001 - MARKET** (市场配合) - Market support projects
2. **TC002 - EXECUTION** (常规项目) - Regular execution projects
3. **TC003 - NUCLEAR** (核电项目) - Nuclear power projects
4. **TC004 - PRODUCT_DEV** (产品研发) - Product development
5. **TC005 - RESEARCH** (科研项目) - Research projects
6. **TC006 - RENOVATION** (改造项目) - Renovation projects
7. **TC007 - MEETING_TRAINING** (会议培训) - Meetings and training
8. **TC008 - ADMIN_PARTY** (行政与党建) - Administration and party activities
9. **TC009 - TRAVEL** (差旅任务) - Travel tasks
10. **TC010 - OTHER** (其他) - Other tasks

Each category has configurable subcategories (2nd-level categories).

### Special Task Types

**Travel Tasks (TC009):**
- TravelLocation - Destination
- TravelDuration - Duration in days
- TravelLabel - Travel category label

**Meeting Tasks (TC007):**
- MeetingDuration - Duration in hours
- Participants - Array of participant user IDs
- ParticipantNames - Array of participant names

**Market Tasks:**
- CapacityLevel - Project capacity level
- model - Equipment model

### Development Guidelines

**Data Persistence:**
- All data stored in localStorage (browser storage)
- No backend or database
- Data persists across browser sessions
- Can be cleared via browser dev tools or clear_localStorage.js

**Soft Deletes:**
- All entities have is_deleted flag
- No hard deletes anywhere in the system
- UI filters out deleted items by default
- Can be restored by setting flag back to false

**No Testing Infrastructure:**
- No Jest, Vitest, or testing libraries configured
- No test scripts in package.json
- This is a prototype/development project

**Vite Configuration:**
- Server runs on port 3000, host 0.0.0.0
- React plugin enabled
- Path aliases configured
- Environment variables supported (GEMINI_API_KEY)

### OpenSpec Integration

This project uses OpenSpec for specification-driven development:

**When to Use OpenSpec:**
- Creating new features or capabilities
- Making breaking changes (API, schema)
- Architecture changes or pattern updates
- Performance optimizations
- Security pattern updates

**Key Files:**
- openspec/AGENTS.md - OpenSpec workflow and guidelines
- openspec/specs/ - Current implemented specifications
- openspec/changes/ - Pending change proposals

**Common Commands:**
```bash
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item]       # Validate changes or specs
openspec archive <change-id>    # Archive after deployment
```

See openspec/AGENTS.md for detailed OpenSpec workflow instructions.

### Common Development Tasks

**Adding a New Task Type:**
1. Update DEFAULT_TASK_CATEGORIES in dataService.ts
2. Add TaskClass entry if new primary category
3. Update Task interface in types.ts if new fields needed
4. Update TaskView.tsx to handle new fields
5. Update Settings.tsx if configurable options needed

**Adding a New User Role:**
1. Add to SystemRole enum in types.ts
2. Update role checks in components
3. Add seed user with new role in dataService.ts
4. Update authentication logic if needed

**Modifying Task Workflow:**
1. Update TaskStatus enum in types.ts if new statuses
2. Update TaskView.tsx status handling
3. Update Dashboard.tsx metrics if needed
4. Update dataService.ts if new operations

### Data Storage Keys (localStorage)

**Core Data:**
- rd_users - User records
- rd_projects - Project records
- rd_tasks - Task records
- rd_task_classes - Task class definitions
- rd_current_user - Current session

**Settings:**
- rd_equipment_models - Equipment model list
- rd_capacity_levels - Capacity level list
- rd_travel_labels - Travel label list
- rd_user_avatars - User avatar mappings
- rd_task_categories - Category configurations

### Important Files Reference

**dataService.ts** - Central data operations, authentication, seed data
**types.ts** - All TypeScript definitions and enums
**vite.config.ts** - Vite and path alias configuration
**tsconfig.json** - TypeScript compiler settings
**dev-server.js** - Cross-platform dev server wrapper
