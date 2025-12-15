# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**汽发任务管理系统** is a task lifecycle management system for technical R&D teams. It's a React 19 + TypeScript single-page application with Vite, featuring personnel management, project tracking, and task analytics. The app currently uses localStorage for persistence (see `services/dataService.ts`) with a documented RESTful API spec for future backend integration.

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Default Login Credentials:**
- Admin: `admin` / `admin`
- Team Leader: `张组长` / `123`
- Team Member: `李研发` / `123`

## Architecture & Code Structure

### Core Data Model (types.ts:1-102)
Four main entities with relationships:
- **Users** (Personnel): employees with roles (Admin/Leader/Member), office locations, and status
- **Projects**: categorized by type (Market/Execution/Research/Renovation), with capacity, model, and dates
- **TaskClass**: configurable task categories (10 default: Market, Execution, Product Dev, Research, Renovation, Meeting/Training, Admin/Party, Travel, Other) with code and description
- **Tasks**: categorized work items linked to TaskClass and projects, with workload, difficulty, and status tracking

### Component Architecture
- **App.tsx** (main entry): Authentication gate, view routing, and state management
- **Layout.tsx**: Navigation shell with sidebar menu
- **Dashboard.tsx**: Overview with charts and statistics (uses Recharts)
- **PersonnelView.tsx**: User management (CRUD operations)
- **ProjectView.tsx**: Project management and tracking
- **TaskView.tsx**: Task management with filtering and batch operations
- **TaskClassView.tsx**: Task class management (10 default categories: Market, Execution, Product Dev, Research, Renovation, Meeting/Training, Admin/Party, Travel, Other)

### Data Layer (services/dataService.ts:83-283)
Centralized service class wrapping localStorage operations:
- Seed data initialization on first load
- CRUD methods for Users, Projects, Tasks, TaskClasses
- Authentication with session persistence
- Soft-delete support (is_deleted flag)
- ID generation utility
- TaskClass entity with 10 default categories (Market, Execution, Product Dev, Research, Renovation, Meeting/Training, Admin/Party, Travel, Other)

### Build Configuration (vite.config.ts:1-23)
- React plugin for JSX/TSX support
- Port 3000 with 0.0.0.0 host
- Environment variable support for `GEMINI_API_KEY`
- Path alias configured (@ -> project root)

## API Documentation

Complete RESTful API specification exists in `API_DOCUMENTATION.md` covering:
- Authentication endpoints (login/logout/session)
- User management (list/create/update/delete)
- Project management with statistics
- Task management with filtering and batch operations
- Data export capabilities (CSV/XLSX)
- Role-based access control matrix

This is currently **not implemented** - the app uses localStorage. The API docs are for future backend integration.

## Key Implementation Details

### State Management
App-level state in `App.tsx:12-18` manages:
- `currentUser`: authenticated user object
- `users`, `projects`, `tasks`: entity arrays
- `currentView`: active view ('dashboard'|'personnel'|'projects'|'tasks')

### Data Persistence Pattern
All data operations flow through `dataService`:
```typescript
// Reading
const users = dataService.getUsers();
const projects = dataService.getProjects();
const tasks = dataService.getTasks();

// Writing
dataService.saveUser(user);
dataService.saveProject(project);
dataService.saveTask(task);

// Deleting (soft delete)
dataService.deleteUser(userId);
```

### Type Safety
All entities are strongly typed with TypeScript interfaces:
- TaskClass: id, name, code, description
- Task: references TaskClass via TaskClassID, uses Category field (previously L2Category)
- Enums: SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus
- Use TaskClass entities instead of hardcoded TaskL1Category enum (types.ts:1-102)

## Dependencies

**Main:**
- `react@19.2.1` & `react-dom@19.2.1` - UI framework
- `lucide-react@^0.556.0` - icon library
- `recharts@^3.5.1` - charting library

**Dev:**
- `vite@^6.2.0` - build tool
- `typescript@~5.8.2` - type safety
- `@vitejs/plugin-react@^5.0.0` - React support

## Environment Variables

- `GEMINI_API_KEY` - Optional API key for Gemini integration (referenced in vite.config.ts:14-15 but not currently used in the codebase)

## Extending the Application

### Adding New Views
1. Create component in `components/`
2. Add route in `App.tsx:110-113` (switch on `currentView`)
3. Add navigation item in `Layout.tsx`

### Modifying Data Model
1. Update interface in `types.ts`
2. Update seed data in `services/dataService.ts:12-137`
3. Update dataService methods if needed

### Managing Task Classes
1. Access via Layout navigation "任务类管理"
2. Add/edit/delete TaskClass entities in `TaskClassView.tsx`
3. TaskClass has: id, name, code, description
4. Tasks reference TaskClass via `TaskClassID` field
5. Categories are now configured in `TaskView.tsx` via `CATEGORY_CONFIG` mapping

### Implementing Backend API
Replace localStorage calls in `dataService` with HTTP requests matching the spec in `API_DOCUMENTATION.md`. Current methods map directly to REST endpoints.
