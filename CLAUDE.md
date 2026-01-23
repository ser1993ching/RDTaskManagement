# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

R&D Task Management System (研发团队任务管理系统) - A React-based internal task management application for a hydropower R&D team. The UI is in Chinese. Features user management, project tracking, task assignment, and statistical dashboard.

## Development Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm install         # Install dependencies
npm run dev         # Start development server (port 3000) - uses custom dev-server.js wrapper
npm run build       # Build for production
npm run preview     # Preview production build locally
```

**Important Notes:**
- `npm run dev` uses a custom cross-platform wrapper (dev-server.js) that ensures Vite starts correctly on Windows
- The app runs on port 3000 (configured in vite.config.ts via VITE_DEV_PORT env var)
- No test scripts are configured
- Clear localStorage: `node frontend/clear_localStorage.js` or use browser dev tools
- Backend API available at `/api` (proxies to localhost:5000)

## Tech Stack

- **React 19** with TypeScript
- **Vite 6** for bundling and dev server
- **localStorage** for data persistence (no backend in current prototype)
- **Tailwind CSS** (loaded via CDN in index.html)
- **Recharts** for data visualization
- **Lucide React** for icons
- **Redux Toolkit + React-Redux** for state management
- Path alias: `@` maps to `frontend/src`

## Backend (.NET 8.0)

### Tech Stack
- **ASP.NET Core 8.0** Web API
- **Entity Framework Core 8.0** for ORM
- **MySQL 8.0** (Docker container: `rd-task-mysql`)
- **JWT** authentication
- **AutoMapper** for object mapping
- **Swashbuckle** for Swagger/OpenAPI

### Project Structure (backend/src/)

```
├── Api/                  # ASP.NET Core Web API entry point
├── Application/          # Use cases, DTOs, services
├── Domain/               # Entities, interfaces, domain logic
└── Infrastructure/       # Data access, EF Core DbContext
```

### Database Configuration (appsettings.json)

**MySQL Connection String:**
```
Server=localhost;Port=3306;Database=TaskManageSystem;User=root;Password=123456;CharSet=utf8mb4;SslMode=Preferred;
```

**Docker MySQL Container:**
- Container name: `rd-task-mysql`
- Image: `mysql:8.0`
- Port: `3306` (mapped to localhost:3306)
- Root password: `123456`
- Database: `TaskManageSystem`

**Manage MySQL:**

```bash
docker ps                    # Check container status
```

### Backend Development Commands

```bash
cd backend/src/Api
dotnet restore               # Restore NuGet packages
dotnet run                   # Start API server (port 5000)
dotnet build                 # Build the solution
dotnet watch run             # Hot reload during development
```

### API Endpoints

- Base URL: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`
- Frontend proxies `/api` requests to backend

## Architecture

### Frontend Project Structure (frontend/src/)

```
├── App.tsx              # Main app with routing, auth, Redux store setup
├── index.tsx            # React entry point
├── main.tsx             # Redux Provider wrapper
├── types.ts             # All TypeScript interfaces and enums
├── components/
│   ├── Layout.tsx       # Sidebar navigation, role-based menu
│   ├── Dashboard.tsx    # Statistics with Recharts
│   ├── TaskView.tsx     # Task CRUD (most complex component)
│   ├── TaskClassView.tsx # Task category management
│   ├── ProjectView.tsx  # Project CRUD
│   ├── PersonnelView.tsx # User management
│   ├── Settings.tsx     # System configuration
│   └── AutocompleteInput.tsx
├── services/
│   ├── dataService.ts   # localStorage CRUD, auth, seed data
│   └── apiService.ts    # API calls (future backend integration)
├── store/
│   ├── index.ts         # Redux store configuration
│   └── slices/          # Redux slices (users, projects, tasks, etc.)
└── openspec/
    └── AGENTS.md        # OpenSpec workflow guidelines
```

### State Management

- **Redux Toolkit** manages global state with slices for users, projects, tasks, etc.
- **App.tsx** initializes the store and provides auth context
- **dataService.ts** handles localStorage persistence; Redux slices sync with it

### Data Flow

1. **Redux slices** manage state and call `dataService` for persistence
2. **Components** connect to Redux via hooks (`useAppDispatch`, `useAppSelector`)
3. **Soft deletes** use `is_deleted` flag - no hard deletes anywhere

### Path Alias

`@/*` in imports resolves to `frontend/src/*` (configured in vite.config.ts and tsconfig.json)

## Key Domain Types (types.ts)

- **User** - Personnel with UserID (工号), SystemRole (ADMIN/LEADER/MEMBER)
- **Project** - Projects with ProjectCategory (市场配合/常规项目/核电项目/科研/改造/其他)
- **Task** - Tasks linked to TaskClassID, optionally ProjectID, with TaskStatus
- **TaskClass** - 10 primary categories (TC001-TC010) with configurable subcategories

**Enums:** SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus

## API JSON字段命名规范

- **JSON字段统一使用 camelCase**（如 `taskId`, `userId`, `startDate`）
- **后端配置**：`PropertyNamingPolicy = JsonNamingPolicy.CamelCase`
- **前端类型**：使用camelCase，与API响应一致
- **禁止**：前后端各自转换，统一在后端处理

**关键文件：**
- 后端配置：`backend/src/Api/Program.cs`
- 前端API客户端：`frontend/src/services/api/client.ts`

## Authentication

- **Login:** `dataService.login(userId, password)` - matches UserID or Name + Password
- **Default credentials:** admin/admin or 张组长/123
- **Session:** Stored in localStorage as `rd_current_user`
- **Role hierarchy:** ADMIN > LEADER > MEMBER

## Task Categories (TC001-TC010)

1. MARKET (市场配合) - Market support
2. EXECUTION (常规项目) - Regular execution
3. NUCLEAR (核电项目) - Nuclear power
4. PRODUCT_DEV (产品研发) - Product development
5. RESEARCH (科研项目) - Research
6. RENOVATION (改造项目) - Renovation
7. MEETING_TRAINING (会议培训) - Meetings/training
8. ADMIN_PARTY (行政与党建) - Administration
9. TRAVEL (差旅任务) - Travel tasks
10. OTHER (其他) - Other

## Data Storage Keys (localStorage)

- `rd_users`, `rd_projects`, `rd_tasks`, `rd_task_classes`
- `rd_current_user` - current session
- `rd_equipment_models`, `rd_capacity_levels`, `rd_travel_labels`
- `rd_user_avatars`, `rd_task_categories`

## OpenSpec Integration

This project uses OpenSpec for specification-driven development. See `frontend/src/openspec/AGENTS.md` for workflow details.

**When to use OpenSpec:**
- New features or capabilities
- Breaking changes (API, schema)
- Architecture or pattern updates
- Performance/security work

## Adding New Features

**New Task Type:**
1. Update `DEFAULT_TASK_CATEGORIES` in dataService.ts
2. Add TaskClass entry if new primary category
3. Update Task interface in types.ts
4. Update TaskView.tsx for new fields
5. Update Settings.tsx if configurable options needed

**New User Role:**
1. Add to SystemRole enum in types.ts
2. Update role checks in components
3. Add seed user in dataService.ts
4. Update authentication logic if needed
