# Project Context

## Purpose
R&D Task Management System (研发团队任务管理系统) - A React-based internal task management application for a hydropower R&D team (水电研发团队). The UI is in Chinese. This is a full-featured task management system with user management, project tracking, task assignment, and statistical dashboard.

## Tech Stack
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS (loaded via CDN in index.html)
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Data Persistence:** localStorage (no backend/database)
- **Path Alias:** @/* maps to project root

## Project Conventions

### Code Style
- TypeScript for all components and services
- Functional components with hooks (useState, useEffect, useCallback)
- Prop drilling for state management (no Redux/Zustand)
- Soft deletes using `is_deleted` flag (no hard deletes anywhere)
- Consistent naming: camelCase for variables, PascalCase for components, UPPER_SCASE for constants

### Architecture Patterns
- **Top-down state management:** App.tsx manages global state (currentUser, users, projects, tasks)
- **Singleton data layer:** dataService.ts handles all CRUD operations and localStorage persistence
- **Component pattern:** Views receive data as props, call onRefresh() callback after mutations
- **Settings system:** Configurable items (equipment models, capacity levels, travel labels) stored in localStorage
- **Path aliases:** Configured in tsconfig.json and vite.config.ts for clean imports

### Testing Strategy
- **No testing infrastructure** - No Jest, Vitest, or testing libraries configured
- **No test scripts** in package.json
- This is a prototype/development project

### Git Workflow
- Feature branches for new changes
- Commit messages follow conventional format
- OpenSpec integration for feature proposals (see openspec/AGENTS.md)

## Domain Context
**Core Entities:**
- **User** - Personnel records with UserID (工号), SystemRole (组员/班组长/管理员), OfficeLocation, Status, etc.
- **Project** - Projects with ProjectCategory (市场配合/常规项目/核电项目/科研/改造/其他)
- **Task** - Tasks linked to TaskClassID and optionally ProjectID, with 20+ fields including workload, difficulty, reviewers
- **TaskClass** - 10 primary task categories (TC001-TC010) with configurable subcategories

**Task Categories:**
1. TC001 - MARKET (市场配合)
2. TC002 - EXECUTION (常规项目)
3. TC003 - NUCLEAR (核电项目)
4. TC004 - PRODUCT_DEV (产品研发)
5. TC005 - RESEARCH (科研项目)
6. TC006 - RENOVATION (改造项目)
7. TC007 - MEETING_TRAINING (会议培训)
8. TC008 - ADMIN_PARTY (行政与党建)
9. TC009 - TRAVEL (差旅任务)
10. TC010 - OTHER (其他)

**User Roles:** ADMIN (full access), LEADER (team management), MEMBER (limited access)

## Important Constraints
- **No backend/database** - All data stored in localStorage only
- **Plain text passwords** - Development only, not for production
- **Soft deletes only** - No hard deletes, use is_deleted flag
- **Port 3000** - Development server configured for this port
- **Cross-platform dev server** - Uses dev-server.js wrapper for Vite on Windows

## External Dependencies
- **Tailwind CSS** - Loaded via CDN (no npm package)
- **Browser localStorage** - Primary data persistence layer
- **Recharts** - For statistical charts and data visualization
- **Lucide React** - For icon components
