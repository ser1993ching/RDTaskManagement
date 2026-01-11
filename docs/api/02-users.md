# 用户管理模块 API 文档

## 概述

用户管理模块提供团队成员的增删改查功能，支持软删除机制。

---

## TypeScript 类型定义

```typescript
// 系统角色枚举
export enum SystemRole {
  MEMBER = '组员',
  LEADER = '班组长',
  ADMIN = '管理员'
}

// 工作地点枚举
export enum OfficeLocation {
  CHENGDU = '成都',
  DEYANG = '德阳'
}

// 在岗状态枚举
export enum PersonnelStatus {
  ACTIVE = '在岗',
  BORROWED_IN = '借调',
  BORROWED_OUT = '外借',
  INTERN = '实习',
  LEAVE = '离岗'
}

// 用户对象接口
export interface User {
  UserID: string;           // 工号 (PK)，用户唯一标识
  Name: string;             // 姓名
  SystemRole: SystemRole;   // 系统角色
  OfficeLocation: OfficeLocation; // 工作地点
  Title?: string;           // 职称
  JoinDate?: string;        // 参加工作时间 (YYYY-MM-DD)
  Status: PersonnelStatus;  // 在岗状态
  Education?: string;       // 学历
  School?: string;          // 毕业院校
  Password?: string;        // 密码（生产环境应加密存储）
  Remark?: string;          // 备注
  is_deleted?: boolean;     // 软删除标记
  created_at?: string;      // 创建时间
  updated_at?: string;      // 更新时间
}

// 创建用户请求
export interface CreateUserRequest {
  UserID: string;           // 工号
  Name: string;
  SystemRole: SystemRole;
  OfficeLocation: OfficeLocation;
  Title?: string;
  JoinDate?: string;
  Status: PersonnelStatus;
  Education?: string;
  School?: string;
  Password?: string;        // 初始密码
  Remark?: string;
}

// 更新用户请求
export interface UpdateUserRequest {
  Name?: string;
  SystemRole?: SystemRole;
  OfficeLocation?: OfficeLocation;
  Title?: string;
  JoinDate?: string;
  Status?: PersonnelStatus;
  Education?: string;
  School?: string;
  Remark?: string;
  // 注意：密码更新应使用单独的密码修改接口
}

// 用户查询参数
export interface UserQueryParams {
  includeDeleted?: boolean;
  officeLocation?: OfficeLocation;
  status?: PersonnelStatus;
  systemRole?: SystemRole;
}

// 用户列表响应
export interface UsersListResponse {
  users: User[];
  total: number;
}

// 用户详情响应
export interface UserDetailResponse {
  user: User;
}

// 创建用户响应
export interface CreateUserResponse {
  success: boolean;
  user: User;
  message: string;
}

// 更新用户响应
export interface UpdateUserResponse {
  success: boolean;
  user: User;
  message: string;
}

// 删除用户响应
export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
```

---

## C# 类型定义（.NET）

```csharp
namespace R&DTaskSystem.Application.DTOs.Users
{
    /// <summary>
    /// 用户数据传输对象
    /// </summary>
    public class UserDto
    {
        public string UserID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string SystemRole { get; set; } = string.Empty;
        public string OfficeLocation { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? JoinDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Education { get; set; }
        public string? School { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 创建用户请求
    /// </summary>
    public class CreateUserRequest
    {
        [Required]
        [MaxLength(50)]
        public string UserID { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string SystemRole { get; set; } = string.Empty;

        [Required]
        public string OfficeLocation { get; set; } = string.Empty;

        public string? Title { get; set; }
        public DateTime? JoinDate { get; set; }

        [Required]
        public string Status { get; set; } = string.Empty;

        public string? Education { get; set; }
        public string? School { get; set; }
        public string? Password { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 更新用户请求
    /// </summary>
    public class UpdateUserRequest
    {
        public string? Name { get; set; }
        public string? SystemRole { get; set; }
        public string? OfficeLocation { get; set; }
        public string? Title { get; set; }
        public DateTime? JoinDate { get; set; }
        public string? Status { get; set; }
        public string? Education { get; set; }
        public string? School { get; set; }
        public string? Remark { get; set; }
    }

    /// <summary>
    /// 用户查询参数
    /// </summary>
    public class UserQueryParams : PaginationQuery
    {
        public string? OfficeLocation { get; set; }
        public string? Status { get; set; }
        public string? SystemRole { get; set; }
    }

    /// <summary>
    /// 用户列表响应
    /// </summary>
    public class UsersListResponse
    {
        public List<UserDto> Users { get; set; } = new();
        public int Total { get; set; }
    }
}
```

---

## 数据模型

### User 对象结构

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| UserID | string | 是 | 工号（主键） |
| Name | string | 是 | 姓名 |
| SystemRole | string | 是 | 系统角色（组员/班组长/管理员） |
| OfficeLocation | string | 是 | 工作地点（成都/德阳） |
| Title | string | 否 | 职称 |
| JoinDate | string | 否 | 参加工作时间（YYYY-MM-DD） |
| Status | string | 是 | 在岗状态（在岗/借调/外借/实习/离岗） |
| Education | string | 否 | 学历 |
| School | string | 否 | 毕业院校 |
| Password | string | 否 | 密码（加密存储） |
| Remark | string | 否 | 备注 |
| is_deleted | boolean | 否 | 是否已删除（软删除标记） |

---

## API 接口列表

### 1. 获取用户列表

**接口路径:** `GET /api/users`

**描述:** 获取所有用户列表，支持查询参数过滤。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| includeDeleted | boolean | 否 | 是否包含已删除用户，默认false |
| officeLocation | string | 否 | 按工作地点过滤 |
| status | string | 否 | 按状态过滤 |
| systemRole | string | 否 | 按角色过滤 |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| users | User[] | 用户列表 |
| total | number | 用户总数 |

**响应示例:**
```json
{
  "users": [
    {
      "UserID": "admin",
      "Name": "系统管理员",
      "SystemRole": "管理员",
      "OfficeLocation": "成都",
      "Title": "高级主任工程师",
      "Status": "在岗",
      "JoinDate": "2020-01-01"
    },
    {
      "UserID": "LEADER001",
      "Name": "张组长",
      "SystemRole": "班组长",
      "OfficeLocation": "德阳",
      "Title": "主任工程师",
      "Status": "在岗",
      "JoinDate": "2015-05-15"
    }
  ],
  "total": 7
}
```

---

### 2. 获取单个用户

**接口路径:** `GET /api/users/{userId}`

**描述:** 根据用户ID获取用户详细信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID（工号） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| user | User | 用户详细信息 |

**响应示例:**
```json
{
  "user": {
    "UserID": "USER001",
    "Name": "李研发",
    "SystemRole": "组员",
    "OfficeLocation": "成都",
    "Title": "工程师",
    "Status": "在岗",
    "JoinDate": "2022-07-01",
    "Education": "硕士",
    "School": "四川大学"
  }
}
```

---

### 3. 创建用户

**接口路径:** `POST /api/users`

**描述:** 创建新用户。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| UserID | string | 是 | 工号（唯一标识） |
| Name | string | 是 | 姓名 |
| SystemRole | string | 是 | 系统角色 |
| OfficeLocation | string | 是 | 工作地点 |
| Title | string | 否 | 职称 |
| JoinDate | string | 否 | 参加工作时间 |
| Status | string | 是 | 在岗状态 |
| Education | string | 否 | 学历 |
| School | string | 否 | 毕业院校 |
| Password | string | 否 | 初始密码 |
| Remark | string | 否 | 备注 |

**请求示例:**
```json
{
  "UserID": "USER008",
  "Name": "新员工",
  "SystemRole": "组员",
  "OfficeLocation": "成都",
  "Title": "助理工程师",
  "Status": "在岗",
  "JoinDate": "2024-01-15",
  "Password": "123456"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 创建是否成功 |
| user | User | 创建的用户信息 |
| message | string | 响应消息 |

---

### 4. 更新用户

**接口路径:** `PUT /api/users/{userId}`

**描述:** 更新用户信息。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

**请求体:** 同创建用户，支持部分字段更新。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 更新是否成功 |
| user | User | 更新后的用户信息 |
| message | string | 响应消息 |

---

### 5. 删除用户（软删除）

**接口路径:** `DELETE /api/users/{userId}`

**描述:** 软删除用户，不会真正删除数据，只会标记is_deleted为true。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 删除是否成功 |
| message | string | 响应消息 |

---

### 6. 恢复已删除用户

**接口路径:** `POST /api/users/{userId}/restore`

**描述:** 恢复被软删除的用户。

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |

---

### 7. 获取团队成员列表

**接口路径:** `GET /api/users/team-members`

**描述:** 获取团队成员列表，用于用户切换器，排除当前用户。

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| currentUserId | string | 是 | 当前用户ID（要排除的用户） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| users | User[] | 团队成员列表 |

---

## 枚举值说明

### SystemRole (系统角色)

| 值 | 描述 |
|----|------|
| 组员 | 普通团队成员 |
| 班组长 | 班组负责人 |
| 管理员 | 系统管理员 |

### OfficeLocation (工作地点)

| 值 | 描述 |
|----|------|
| 成都 | 成都办公区 |
| 德阳 | 德阳办公区 |

### PersonnelStatus (在岗状态)

| 值 | 描述 |
|----|------|
| 在岗 | 正常在岗 |
| 借调 | 从其他部门借调 |
| 外借 | 借调到其他部门 |
| 实习 | 实习生 |
| 离岗 | 离职或离岗 |

---

## 权限说明

| 操作 | 组员 | 班组长 | 管理员 |
|------|------|--------|--------|
| 查看用户列表 | 仅自己 | 本班组 | 全部 |
| 查看用户详情 | 仅自己 | 本班组 | 全部 |
| 创建用户 | 否 | 否 | 是 |
| 更新用户 | 否 | 仅本班组 | 是 |
| 删除用户 | 否 | 否 | 是 |

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 用户不存在 |
| 409 | 用户ID已存在 |
| 500 | 服务器内部错误 |

---

## 备注

- 用户ID（工号）是唯一标识符，创建后不可修改
- 密码应加密存储，生产环境建议使用bcrypt
- 软删除机制：所有删除操作均为软删除，数据仍保留但不会在常规查询中显示
- 默认测试账号:
  - 管理员: admin/admin
  - 班组长: LEADER001/123 (张组长)
  - 组员: USER001/123 (李研发)
