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

R&D Task Management System (研发团队任务管理系统) - A React-based internal task management application for a hydropower R&D team. The UI is in Chinese.

## Commands

```bash
npm install         # Install dependencies
npm run dev         # Start development server (port 3000) - uses custom dev-server.js wrapper
npm run build       # Build for production
npm run preview     # Preview production build locally
```

**Note:** `npm run dev` uses a custom cross-platform wrapper (`dev-server.js`) that ensures Vite starts correctly on Windows by directly invoking the node_modules/vite binary.

## Architecture

### Tech Stack
- React 19 with TypeScript
- Vite for bundling and dev server
- localStorage for data persistence (no backend/database)
- Tailwind CSS (loaded via CDN in index.html)
- Recharts for data visualization and charts
- Lucide React for icons

### Project Structure
```
/
├── App.tsx                    # Main application component with routing and auth
├── index.tsx                  # React entry point
├── types.ts                   # All TypeScript interfaces, enums, and type definitions
├── dev-server.js              # Cross-platform dev server wrapper for Vite
├── components/                # All view components
│   ├── Layout.tsx             # Sidebar navigation and layout wrapper
│   ├── Dashboard.tsx          # Statistics dashboard with charts
│   ├── TaskView.tsx           # Task management (CRUD operations)
│   ├── TaskClassView.tsx      # Task category and subcategory management
│   ├── ProjectView.tsx        # Project management (CRUD operations)
│   ├── PersonnelView.tsx      # User/personnel management
│   └── Settings.tsx           # System settings and configuration
└── services/
    └── dataService.ts         # Centralized data layer (localStorage + seed data)
```

### Data Flow Pattern
1. **App.tsx** manages global application state using `useState`:
   - `currentUser` - authenticated user session
   - `users`, `projects`, `tasks` - main application data

2. **dataService** (singleton pattern) handles:
   - All CRUD operations for Users, Projects, Tasks, TaskClasses
   - localStorage persistence with automatic initialization
   - Authentication (login/logout/session management)
   - Seed data population on first run

3. **Component Pattern**:
   - Each view receives data as props
   - After mutations, components call `onRefresh()` callback
   - `App.tsx` reloads data from `dataService` and passes to children
   - Soft deletes using `is_deleted` flag (no hard deletes)

### Key Domain Types (types.ts)
- **User** - Personnel records with `UserID` (工号), `SystemRole` (组员/班组长/管理员)
- **Project** - Projects with `ProjectCategory` (市场配合/项目执行/科研/改造/其他)
- **Task** - Tasks linked to `TaskClassID`, optionally to `ProjectID`, with `TaskStatus`
- **TaskClass** - 9 primary task categories (市场配合, 项目执行, 产品研发, etc.)
- **Enums**: `SystemRole`, `ProjectCategory`, `TaskStatus`, `PersonnelStatus`, `OfficeLocation`

### Authentication & Authorization
- Login via `dataService.login(userId, password)` - matches UserID or Name + Password
- Default credentials: `admin/admin` or `张组长/123`
- Session persisted in localStorage under `rd_current_user`
- Role hierarchy: ADMIN > LEADER > MEMBER (role-based UI restrictions)

### Settings & Configuration
The system includes configurable settings managed in `dataService`:
- Equipment Models (机型)
- Capacity Levels (容量等级)
- Travel Labels (差旅类别)
- Task Categories (task class subcategories)
- User Avatars

Settings are initialized from existing data on first run and persisted to localStorage.

### Path Alias
`@/*` maps to project root directory (configured in both tsconfig.json and vite.config.ts)
