# Project Context

## Purpose

R&D Task Management System (研发团队任务管理系统) - A React-based internal task management application for a hydropower R&D team. The system manages projects, tasks, personnel, and task categories specifically tailored for hydropower equipment design and development workflows.

**Key Goals:**
- Track tasks across different project categories (市场配合、项目执行、科研、改造等)
- Manage personnel workload and project assignments
- Provide statistics and analytics for team productivity
- Support role-based access control (组员/班组长/管理员)
- Enable task creation, assignment, and progress tracking with detailed metadata (workload, difficulty, reviewers)

## Tech Stack

### Core Technologies
- **React 19.2.1** - Frontend framework with TypeScript support
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Build tool and dev server
- **@vitejs/plugin-react 5.0.0** - React plugin for Vite

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework (loaded via CDN in index.html)
- **Lucide React 0.556.0** - Icon library
- **Recharts 3.5.1** - Data visualization library for charts and statistics

### Data & State
- **localStorage** - Client-side data persistence (no backend database)
- **Custom dataService singleton** - Handles all CRUD operations and data management

### Development Tools
- **@types/node 22.14.0** - Node.js type definitions

## Project Conventions

### Code Style

#### File Organization
- **Path Alias**: `@/*` maps to project root (configured in tsconfig.json and vite.config.ts)
- **Component Files**: PascalCase (e.g., `TaskView.tsx`, `Dashboard.tsx`)
- **Service Files**: camelCase with descriptive names (e.g., `dataService.ts`)
- **Type Files**: camelCase (e.g., `types.ts`)
- **Constants**: UPPER_SNAKE_CASE for enums and constants

#### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `getUsers`, `currentUser`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `User`, `TaskStatus`)
- **Enums**: PascalCase with values in Chinese (e.g., `SystemRole.MEMBER = '组员'`)
- **Database Fields**: UPPER_SNAKE_CASE for consistency (e.g., `UserID`, `TaskID`)
- **IDs**: Human-readable prefixes (e.g., `T-20231001-001`, `P001`, `TC001`)

#### Code Formatting
- **Line Length**: Not explicitly defined, aim for readable lines
- **Indentation**: 2 spaces (TypeScript/React standard)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required (ESLint standard)
- **Comments**: Chinese comments for domain logic, English for technical implementation

### Architecture Patterns

#### Data Layer
- **Singleton Pattern**: `dataService` class manages all data operations
- **localStorage Keys**: Namespaced with `rd_` prefix (e.g., `rd_users`, `rd_tasks`)
- **Soft Delete**: All entities have `is_deleted` flag instead of hard deletion
- **Seed Data**: Pre-populated with realistic hydropower industry data
- **Data Flow**: Components receive data as props and call `onRefresh()` after mutations

#### Component Architecture
- **Props Interface**: Explicit TypeScript interfaces for all component props
- **State Management**: React hooks (useState, useEffect) for local state
- **Event Handling**: CamelCase handler names (e.g., `onRefresh`, `handleSave`)
- **Reusable Components**: Modular design with shared components where applicable

#### Type System
- **Enums**: Used for constrained values (TaskStatus, ProjectCategory, SystemRole)
- **Optional Properties**: Marked with `?` (e.g., `BirthDate?: string`)
- **Union Types**: Used where appropriate (e.g., TaskStatus values)
- **Interface Consistency**: All database entities follow similar structure with audit fields

### Testing Strategy

**Current Status**: No formal testing framework implemented
**Recommendation**: When implementing tests:
- Use **Vitest** (Vite-native testing framework)
- Use **React Testing Library** for component testing
- Use **@testing-library/user-event** for user interaction testing
- Organize tests in `__tests__` directories alongside source files
- Follow AAA pattern: Arrange, Act, Assert

### Git Workflow

#### Branching Strategy
- **Main Branch**: `master` (current branch)
- **Feature Branches**: `feature/feature-name` (recommended for new features)
- **Fix Branches**: `fix/issue-description` (recommended for bug fixes)
- **No Protected Branches**: Currently open workflow

#### Commit Conventions
Based on recent commits, follow this format:
```
type(scope): description - human-readable summary

Examples from codebase:
- "style: 优化任务详细信息弹窗布局 - 紧凑不滚动版本"
- "feat: 登录状态持久化和任务详情弹窗"
- "modified: components/Dashboard.tsx, services/dataService.ts"
```

**Commit Types**:
- `feat`: New features or functionality
- `fix`: Bug fixes
- `style`: UI/styling changes (no logic changes)
- `refactor`: Code refactoring without behavior changes
- `docs`: Documentation updates
- `chore`: Build process or auxiliary tool changes

#### File Tracking
- **Configuration files**: Always tracked (.tsconfig, vite.config.ts, package.json)
- **Dependencies**: Lock file not present (may need .npmrc or package-lock.json)
- **Environment files**: .env files should be added to .gitignore

## Domain Context

### Business Domain: Hydropower Equipment R&D

#### Core Entities
1. **User (人员)** - Team members with roles and locations
   - Roles: 组员 (Member), 班组长 (Leader), 管理员 (Admin)
   - Locations: 成都 (Chengdu), 德阳 (Deyang)
   - Status: Active, Borrowed, Intern, Leave

2. **Project (项目)** - Engineering projects
   - Categories: 市场配合 (Market Support), 项目执行 (Execution), 科研 (Research), 改造 (Renovation), 其他 (Other)
   - Attributes: Work number, capacity level,机型 (model type), dates
   - Market projects track: isWon, isForeign
   - Execution projects track: group, institute, executors

3. **Task (任务)** - Work items linked to projects and personnel
   - Status: 未开始 (Not Started), 进行中 (In Progress), 已完成 (Completed)
   - Attributes: Workload (工时), Difficulty (0.5-3.0), Reviewers, Travel info
   - Task Classes: 9 predefined categories with subcategories
   - Review workflow: Reviewer and Reviewer2 for quality control

4. **TaskClass (任务类别)** - Categorization system
   - 9 main categories: 市场配合, 项目执行, 产品研发, 科研任务, 改造服务, 内部会议与培训, 行政与党建, 差旅任务, 其他任务
   - Each category has specific subcategories for task classification

#### Key Workflows
- **Task Creation**: Tasks linked to TaskClass, optionally to Project, assigned to User
- **Review Process**: Tasks can have up to 2 reviewers with workload tracking
- **Progress Tracking**: Status transitions from Not Started → In Progress → Completed
- **Statistics**: Dashboard shows workload distribution, task status, project progress
- **Authentication**: Simple login by UserID/Name + Password, session in localStorage

#### Industry-Specific Terms
- **容量等级** (Capacity Level): Power generation capacity (300MW, 600MW, 1000MW, etc.)
- **机型** (Model Type): Turbine types (Francis, Kaplan, etc.)
- **工作号** (WorkNo): Internal project tracking number
- **提资** (Information Delivery): Design document submission to design institutes
- **校核** (Review): Technical review process
- **首台投运** (First Unit Commissioning): Project completion milestone

### UI Language
- **Primary Language**: Chinese (所有界面文本为中文)
- **Date Format**: YYYY-MM-DD
- **Number Format**: Western numerals with Chinese labels

## Important Constraints

### Technical Constraints
1. **No Backend**: Pure client-side application using localStorage
2. **Browser Storage Limit**: localStorage has ~5-10MB limit (sufficient for current use case)
3. **No Real-time Updates**: Data changes require manual refresh
4. **Single User Context**: No multi-user synchronization
5. **Browser Compatibility**: Modern browsers (ES2022 support required)

### Business Constraints
1. **Internal Use Only**: Not intended for external/public use
2. **Role-Based Access**: Different permissions for Admin, Leader, Member roles
3. **Data Privacy**: All data stored locally, no cloud synchronization
4. **No Audit Trail**: Changes not logged or versioned
5. **No File Uploads**: Currently text/metadata only

### Performance Constraints
1. **Small Dataset**: Optimized for <1000 tasks, <100 users
2. **No Virtual Scrolling**: Current implementation loads all data into memory
3. **No Lazy Loading**: All components render on mount
4. **Memory Usage**: localStorage persists across sessions, no automatic cleanup

### Security Constraints
1. **No Authentication Server**: Plaintext password storage (acceptable for internal tool)
2. **No HTTPS**: Development server only
3. **No Input Sanitization**: Trust internal users
4. **No Data Encryption**: localStorage stores plain JSON

## External Dependencies

### Runtime Dependencies
- **lucide-react**: Icon components (loaded from npm)
- **recharts**: Chart visualization (loaded from npm)
- **react**: UI framework (loaded from npm)
- **react-dom**: React DOM renderer (loaded from npm)

### Build-Time Dependencies
- **@vitejs/plugin-react**: Vite React integration
- **@types/node**: Node.js type definitions
- **typescript**: TypeScript compiler
- **vite**: Build tool

### CDN Dependencies
- **Tailwind CSS**: Loaded via CDN in index.html (not npm package)
- **React/ReactDOM**: Also loaded via CDN in index.html (dual loading with npm - potential redundancy)

### Third-Party Services
- **None**: Fully self-contained application

### Development Tools
- **Node.js**: Required for npm and build tools
- **npm**: Package manager
- **Vite Dev Server**: Development server on port 3000

### Environment Variables
- **GEMINI_API_KEY**: Referenced in vite.config.ts but not actively used (potential future AI integration)

## Configuration Files

### Key Files
- **tsconfig.json**: TypeScript configuration with path mapping (`@/*` → `./*`)
- **vite.config.ts**: Vite configuration with server port (3000), alias, and env vars
- **package.json**: Dependencies, scripts (dev, build, preview)
- **index.html**: Entry point with Tailwind CSS CDN
- **index.tsx**: React entry point

### Build Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Production build with Vite
- `npm run preview`: Preview production build

## Development Workflow

### Getting Started
```bash
npm install    # Install dependencies
npm run dev    # Start development server (port 3000)
```

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

### Path Alias Usage
- Import from root: `import { User } from '@/types'`
- Import from services: `import { dataService } from '@/services/dataService'`
- Alias configured in both tsconfig.json and vite.config.ts
