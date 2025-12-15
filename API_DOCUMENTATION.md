# R&D Task Master API Documentation

## 项目概述

R&D Task Master是一个技术研发团队任务管理系统，提供完整的用户管理、项目管理和任务生命周期管理功能。

**当前实现：** 基于localStorage的客户端存储
**后端对接：** 本文档定义了完整的RESTful API接口规范

---

## 基础信息

### Base URL
```
http://localhost:3000/api/v1
```

### 认证方式
采用Session认证，登录后获取Session Token

### 通用响应格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2025-12-14T07:20:00.000Z"
}
```

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2025-12-14T07:20:00.000Z"
}
```

---

## 数据模型

### User（用户）
```typescript
interface User {
  UserID: string;           // 工号 (主键)
  Name: string;             // 姓名
  SystemRole: SystemRole;   // 系统角色
  OfficeLocation: OfficeLocation;  // 办公地点
  BirthDate?: string;       // 出生日期 (YYYY-MM-DD)
  Title?: string;           // 职称
  JoinDate?: string;        // 参加工作时间 (YYYY-MM-DD)
  TeamJoinDate?: string;    // 加入团队时间 (YYYY-MM-DD)
  Status: PersonnelStatus;  // 人员状态
  Education?: string;       // 学历
  School?: string;          // 毕业院校
  Password: string;         // 密码 (加密存储)
  is_deleted?: boolean;     // 软删除标记
  created_at?: string;
  updated_at?: string;
}

enum SystemRole {
  MEMBER = '组员',
  LEADER = '班组长',
  ADMIN = '管理员'
}

enum OfficeLocation {
  CHENGDU = '成都',
  DEYANG = '德阳'
}

enum PersonnelStatus {
  ACTIVE = '在岗',
  BORROWED_IN = '借调',
  BORROWED_OUT = '外借',
  INTERN = '实习',
  LEAVE = '离岗'
}
```

### Project（项目）
```typescript
interface Project {
  id: string;               // 项目ID (主键)
  name: string;             // 项目名称
  category: ProjectCategory; // 项目类别
  workNo?: string;          // 工作号
  capacity?: string;        // 容量等级
  model?: string;           // 机型
  isWon?: boolean;          // 是否中标 (市场类项目)
  isForeign?: boolean;      // 是否外贸 (市场类项目)
  group?: string;           // 所属集团 (执行类项目)
  institute?: string;       // 设计院 (执行类项目)
  executorId?: string;      // 执行人ID
  chiefDesignerId?: string; // 主任设计ID
  managerId?: string;       // 负责人ID (科研类项目)
  startDate?: string;       // 启动日期 (YYYY-MM-DD)
  endDate?: string;         // 截止/首台投运日期 (YYYY-MM-DD)
  remark?: string;          // 备注
  is_deleted?: boolean;     // 软删除标记
  created_at?: string;
  updated_at?: string;
}

enum ProjectCategory {
  MARKET = '市场配合项目',
  EXECUTION = '项目执行',
  RESEARCH = '科研项目',
  RENOVATION = '改造项目',
  OTHER = '其他项目'
}
```

### Task（任务）
```typescript
interface Task {
  TaskID: string;           // 任务ID (主键)
  TaskName: string;         // 任务名称
  L1Category: TaskL1Category; // 一级分类
  L2Category: string;       // 二级分类
  ProjectID?: string;       // 关联项目ID
  AssigneeID?: string;      // 负责人ID
  StartDate?: string;       // 开始日期 (YYYY-MM-DD)
  DueDate?: string;         // 截止日期 (YYYY-MM-DD)
  Status: TaskStatus;       // 任务状态
  Workload?: number;        // 预估工作量 (人天)
  ActualWorkload?: number;  // 实际投入 (人天)
  Difficulty?: number;      // 难度系数 (0.5-3.0)
  Remark?: string;          // 备注
  CreatedDate: string;      // 创建日期 (YYYY-MM-DD)
  CreatedBy: string;        // 创建人ID
  TravelLocation?: string;  // 出差地点 (差旅类任务)
  TravelDuration?: number;  // 出差时长 (天) (差旅类任务)
  MeetingDuration?: number; // 会议时长 (小时) (会议类任务)
  is_deleted?: boolean;     // 软删除标记
  created_at?: string;
  updated_at?: string;
}

enum TaskL1Category {
  MARKET = '市场配合',
  EXECUTION = '项目执行',
  PRODUCT_DEV = '产品研发',
  RESEARCH = '科研任务',
  RENOVATION = '改造服务',
  MEETING_TRAINING = '内部会议与培训',
  ADMIN_PARTY = '行政与党建',
  TRAVEL = '差旅任务',
  OTHER = '其他任务'
}

enum TaskStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  COMPLETED = '已完成'
}
```

---

## API 接口列表

### 1. 认证接口

#### 1.1 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "loginId": "admin",      // 工号或姓名
  "password": "admin"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "UserID": "admin",
      "Name": "系统管理员",
      "SystemRole": "管理员",
      "OfficeLocation": "成都",
      "Status": "在岗"
    }
  }
}
```

#### 1.2 用户登出
```http
POST /auth/logout
Authorization: Bearer {token}
```

#### 1.3 获取当前用户信息
```http
GET /auth/me
Authorization: Bearer {token}
```

---

### 2. 用户管理接口

#### 2.1 获取用户列表
```http
GET /users
Authorization: Bearer {token}

Query Parameters:
- status: PersonnelStatus (可选，人员状态筛选)
- officeLocation: OfficeLocation (可选，办公地点筛选)
- role: SystemRole (可选，角色筛选)
- search: string (可选，搜索关键词)
- page: number (可选，默认1)
- limit: number (可选，默认20)
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "UserID": "admin",
        "Name": "系统管理员",
        "SystemRole": "管理员",
        "OfficeLocation": "成都",
        "Title": "高级主任工程师",
        "Status": "在岗",
        "Education": "硕士",
        "JoinDate": "2020-01-01"
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

#### 2.2 获取用户详情
```http
GET /users/:userId
Authorization: Bearer {token}
```

#### 2.3 创建用户
```http
POST /users
Authorization: Bearer {token}

{
  "UserID": "USER002",
  "Name": "新用户",
  "SystemRole": "组员",
  "OfficeLocation": "成都",
  "Title": "工程师",
  "Status": "在岗",
  "Education": "本科",
  "JoinDate": "2025-01-01",
  "Password": "123456"
}
```

#### 2.4 更新用户
```http
PUT /users/:userId
Authorization: Bearer {token}

{
  "Name": "更新后的姓名",
  "Title": "高级工程师",
  "Status": "在岗"
}
```

#### 2.5 删除用户（软删除）
```http
DELETE /users/:userId
Authorization: Bearer {token}
```

---

### 3. 项目管理接口

#### 3.1 获取项目列表
```http
GET /projects
Authorization: Bearer {token}

Query Parameters:
- category: ProjectCategory (可选，项目类别筛选)
- page: number (可选，默认1)
- limit: number (可选，默认20)
- sortBy: string (可选，排序字段，默认startDate)
- sortOrder: 'asc' | 'desc' (可选，默认desc)
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "P001",
        "name": "HBR-1000MW高效机组",
        "category": "项目执行",
        "workNo": "WORK-2023-001",
        "capacity": "1000MW",
        "model": "Francis",
        "startDate": "2023-01-10",
        "endDate": "2024-06-30"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

#### 3.2 获取项目详情
```http
GET /projects/:projectId
Authorization: Bearer {token}
```

#### 3.3 创建项目
```http
POST /projects
Authorization: Bearer {token}

{
  "name": "新项目名称",
  "category": "项目执行",
  "workNo": "WORK-2025-001",
  "capacity": "600MW",
  "model": "Francis",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "executorId": "LEADER001",
  "chiefDesignerId": "LEADER001",
  "remark": "项目备注"
}
```

#### 3.4 更新项目
```http
PUT /projects/:projectId
Authorization: Bearer {token}

{
  "name": "更新的项目名称",
  "capacity": "800MW",
  "endDate": "2026-06-30"
}
```

#### 3.5 删除项目（软删除）
```http
DELETE /projects/:projectId
Authorization: Bearer {token}
```

#### 3.6 获取项目统计
```http
GET /projects/stats/overview
Authorization: Bearer {token}
```

---

### 4. 任务管理接口

#### 4.1 获取任务列表
```http
GET /tasks
Authorization: Bearer {token}

Query Parameters:
- L1Category: TaskL1Category (可选，一级分类筛选)
- status: TaskStatus (可选，状态筛选)
- ProjectID: string (可选，项目ID筛选)
- AssigneeID: string (可选，负责人筛选)
- page: number (可选，默认1)
- limit: number (可选，默认20)
- sortBy: string (可选，排序字段，默认CreatedDate)
- sortOrder: 'asc' | 'desc' (可选，默认desc)
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "TaskID": "T-20231001-001",
        "TaskName": "HBR-1000MW高效机组-图纸会签",
        "L1Category": "项目执行",
        "L2Category": "图纸会签",
        "ProjectID": "P001",
        "AssigneeID": "USER001",
        "Status": "进行中",
        "Workload": 5,
        "Difficulty": 1.2,
        "DueDate": "2023-10-15",
        "CreatedDate": "2023-10-01",
        "CreatedBy": "LEADER001"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

#### 4.2 获取任务详情
```http
GET /tasks/:taskId
Authorization: Bearer {token}
```

#### 4.3 创建任务
```http
POST /tasks
Authorization: Bearer {token}

{
  "TaskName": "新任务名称",
  "L1Category": "项目执行",
  "L2Category": "图纸会签",
  "ProjectID": "P001",
  "AssigneeID": "USER001",
  "Status": "未开始",
  "Workload": 3,
  "Difficulty": 1.0,
  "StartDate": "2025-01-01",
  "DueDate": "2025-01-15",
  "Remark": "任务备注"
}
```

#### 4.4 更新任务
```http
PUT /tasks/:taskId
Authorization: Bearer {token}

{
  "TaskName": "更新的任务名称",
  "Status": "进行中",
  "Workload": 5,
  "DueDate": "2025-01-20"
}
```

#### 4.5 删除任务（软删除）
```http
DELETE /tasks/:taskId
Authorization: Bearer {token}
```

#### 4.6 批量更新任务状态
```http
PATCH /tasks/batch/status
Authorization: Bearer {token}

{
  "taskIds": ["T001", "T002", "T003"],
  "status": "已完成"
}
```

#### 4.7 获取任务统计
```http
GET /tasks/stats/overview
Authorization: Bearer {token}

Query Parameters:
- startDate: string (可选，统计开始日期)
- endDate: string (可选，统计结束日期)
- AssigneeID: string (可选，特定人员统计)
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 2,
    "inProgress": 5,
    "completed": 3,
    "byCategory": [
      {
        "category": "项目执行",
        "count": 5
      },
      {
        "category": "科研任务",
        "count": 3
      }
    ],
    "byAssignee": [
      {
        "userId": "USER001",
        "userName": "李研发",
        "total": 8,
        "completed": 2
      }
    ]
  }
}
```

---

### 5. 数据导出接口

#### 5.1 导出用户数据
```http
GET /export/users
Authorization: Bearer {token}

Query Parameters:
- format: 'csv' | 'xlsx' (可选，默认csv)
- status: PersonnelStatus (可选，状态筛选)
```

#### 5.2 导出项目数据
```http
GET /export/projects
Authorization: Bearer {token}

Query Parameters:
- format: 'csv' | 'xlsx' (可选，默认csv)
- category: ProjectCategory (可选，类别筛选)
```

#### 5.3 导出任务数据
```http
GET /export/tasks
Authorization: Bearer {token}

Query Parameters:
- format: 'csv' | 'xlsx' (可选，默认csv)
- L1Category: TaskL1Category (可选，分类筛选)
- status: TaskStatus (可选，状态筛选)
- startDate: string (可选，开始日期筛选)
- endDate: string (可选，结束日期筛选)
```

---

## 权限控制

### 角色权限矩阵

| 操作 | 管理员 | 班组长 | 组员 |
|------|--------|--------|------|
| 查看所有用户 | ✅ | ✅ | ❌ |
| 管理用户 | ✅ | ✅ | ❌ |
| 查看所有项目 | ✅ | ✅ | ❌ |
| 管理项目 | ✅ | ✅ | ❌ |
| 查看所有任务 | ✅ | ✅ | ❌ |
| 管理自己的任务 | ✅ | ✅ | ✅ |
| 管理团队任务 | ✅ | ✅ | ❌ |
| 查看统计报表 | ✅ | ✅ | 个人数据 |

---

## 错误码定义

| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 请求参数校验失败 |
| DUPLICATE_ERROR | 409 | 数据重复冲突 |
| SERVER_ERROR | 500 | 服务器内部错误 |

---

## 开发建议

### 1. 数据库设计建议

**用户表 (users)**
```sql
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  system_role ENUM('组员', '班组长', '管理员') NOT NULL,
  office_location ENUM('成都', '德阳') NOT NULL,
  birth_date DATE,
  title VARCHAR(100),
  join_date DATE,
  team_join_date DATE,
  status ENUM('在岗', '借调', '外借', '实习', '离岗') NOT NULL,
  education VARCHAR(50),
  school VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_system_role (system_role),
  INDEX idx_status (status)
);
```

**项目表 (projects)**
```sql
CREATE TABLE projects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category ENUM('市场配合项目', '项目执行', '科研项目', '改造项目', '其他项目') NOT NULL,
  work_no VARCHAR(100),
  capacity VARCHAR(50),
  model VARCHAR(50),
  is_won BOOLEAN,
  is_foreign BOOLEAN DEFAULT FALSE,
  group_name VARCHAR(100),
  institute VARCHAR(100),
  executor_id VARCHAR(50),
  chief_designer_id VARCHAR(50),
  manager_id VARCHAR(50),
  start_date DATE,
  end_date DATE,
  remark TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_executor (executor_id),
  FOREIGN KEY (executor_id) REFERENCES users(user_id)
);
```

**任务表 (tasks)**
```sql
CREATE TABLE tasks (
  task_id VARCHAR(50) PRIMARY KEY,
  task_name VARCHAR(200) NOT NULL,
  l1_category ENUM('市场配合', '项目执行', '产品研发', '科研任务', '改造服务', '内部会议与培训', '行政与党建', '差旅任务', '其他任务') NOT NULL,
  l2_category VARCHAR(50) NOT NULL,
  project_id VARCHAR(50),
  assignee_id VARCHAR(50),
  start_date DATE,
  due_date DATE,
  status ENUM('未开始', '进行中', '已完成') NOT NULL,
  workload DECIMAL(5,2),
  actual_workload DECIMAL(5,2),
  difficulty DECIMAL(3,1) CHECK (difficulty >= 0.5 AND difficulty <= 3.0),
  remark TEXT,
  created_date DATE NOT NULL,
  created_by VARCHAR(50) NOT NULL,
  travel_location VARCHAR(100),
  travel_duration DECIMAL(5,2),
  meeting_duration DECIMAL(5,2),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_l1_category (l1_category),
  INDEX idx_status (status),
  INDEX idx_assignee (assignee_id),
  INDEX idx_project (project_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assignee_id) REFERENCES users(user_id)
);
```

### 2. 缓存策略建议
- 用户Session信息：Redis缓存，TTL 2小时
- 统计数据：Redis缓存，TTL 1小时
- 频繁查询的用户/项目列表：内存缓存，TTL 10分钟

### 3. 安全建议
- 密码使用bcrypt加密
- Session使用JWT或Redis Session
- 接口添加请求频率限制
- 敏感操作添加操作日志
- 跨域请求配置CORS白名单

### 4. 性能优化建议
- 大数据列表分页查询，避免一次加载过多数据
- 统计接口使用数据库聚合查询
- 导出接口使用异步任务队列
- 数据库查询添加合适索引
- 启用Gzip压缩

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2025-12-14 | 初始版本，定义完整API规范 |

---

## 联系方式

如有API相关问题，请联系开发团队。

---

*本文档版本: v1.0.0*
*最后更新: 2025-12-14*
