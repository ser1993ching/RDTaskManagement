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
npm install    # Install dependencies
npm run dev    # Start development server (port 3000)
npm run build  # Build for production
```

## Architecture

### Tech Stack
- React 19 with TypeScript
- Vite for bundling
- localStorage for data persistence (no backend)
- Tailwind CSS (via CDN in index.html)
- Recharts for data visualization
- Lucide React for icons

### Project Structure
```
/
├── App.tsx              # Main app with routing and auth state
├── index.tsx            # React entry point
├── types.ts             # All TypeScript interfaces and enums
├── components/          # View components
│   ├── Layout.tsx       # Sidebar navigation layout
│   ├── Dashboard.tsx    # Statistics and charts
│   ├── TaskView.tsx     # Task CRUD
│   ├── TaskClassView.tsx # Task category management
│   ├── ProjectView.tsx  # Project CRUD
│   └── PersonnelView.tsx # User management
└── services/
    └── dataService.ts   # Data layer (localStorage + seed data)
```

### Data Flow
- `App.tsx` manages global state: `currentUser`, `users`, `projects`, `tasks`
- `dataService` singleton handles all CRUD operations and localStorage persistence
- Views receive data as props and call `onRefresh()` to reload after mutations

### Key Domain Types (types.ts)
- `User` - Personnel with `UserID` (工号), `SystemRole` (组员/班组长/管理员)
- `Project` - Projects categorized by `ProjectCategory` (市场配合/项目执行/科研/改造/其他)
- `Task` - Tasks linked to `TaskClass` and optionally to `Project`, with `TaskStatus`
- `TaskClass` - Task categories (9 types: 市场配合, 项目执行, 产品研发, etc.)

### Authentication
Simple login via `dataService.login()` matching UserID/Name + Password. Session stored in localStorage. Role-based access: ADMIN > LEADER > MEMBER.

### Path Alias
`@/*` maps to project root (configured in tsconfig.json and vite.config.ts)
