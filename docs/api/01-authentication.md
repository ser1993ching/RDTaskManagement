# 认证模块 API 文档

## 概述

认证模块提供用户登录、登出和会话管理功能。

## API 接口列表

### 1. 用户登录

**接口路径:** `POST /api/auth/login`

**描述:** 用户登录系统，验证用户名和密码。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID或用户名（工号或姓名） |
| password | string | 是 | 用户密码 |

**请求示例:**
```json
{
  "userId": "admin",
  "password": "admin"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 登录是否成功 |
| user | User | 用户信息对象 |
| message | string | 响应消息 |

**响应示例 (成功):**
```json
{
  "success": true,
  "user": {
    "UserID": "admin",
    "Name": "系统管理员",
    "SystemRole": "管理员",
    "OfficeLocation": "成都",
    "Title": "高级主任工程师",
    "Status": "在岗"
  },
  "message": "登录成功"
}
```

**响应示例 (失败):**
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

### 2. 获取当前用户

**接口路径:** `GET /api/auth/current`

**描述:** 获取当前登录用户的会话信息。

**请求头:**
| 参数名 | 必填 | 描述 |
|--------|------|------|
| Authorization | 是 | Bearer Token（如果使用Token认证） |

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| user | User | 当前用户信息，null表示未登录 |

**响应示例 (已登录):**
```json
{
  "user": {
    "UserID": "admin",
    "Name": "系统管理员",
    "SystemRole": "管理员",
    "OfficeLocation": "成都",
    "Status": "在岗"
  }
}
```

**响应示例 (未登录):**
```json
{
  "user": null
}
```

---

### 3. 用户登出

**接口路径:** `POST /api/auth/logout`

**描述:** 用户登出系统，清除会话信息。

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 登出是否成功 |
| message | string | 响应消息 |

**响应示例:**
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

### 4. 修改密码

**接口路径:** `POST /api/auth/change-password`

**描述:** 修改当前用户的密码。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 用户ID |
| currentPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码 |

**请求示例:**
```json
{
  "userId": "admin",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 修改是否成功 |
| message | string | 响应消息 |

**响应示例 (成功):**
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

**响应示例 (失败):**
```json
{
  "success": false,
  "message": "当前密码不正确"
}
```

---

### 5. 重置用户密码

**接口路径:** `POST /api/auth/reset-password`

**描述:** 管理员重置用户密码（仅管理员可操作）。

**请求参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userId | string | 是 | 要重置密码的用户ID |
| newPassword | string | 否 | 新密码，不提供则生成随机密码 |

**请求示例:**
```json
{
  "userId": "USER001",
  "newPassword": "123456"
}
```

**响应参数:**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| success | boolean | 操作是否成功 |
| message | string | 响应消息 |
| newPassword | string | 生成的新密码（如果未提供） |

**响应示例:**
```json
{
  "success": true,
  "message": "密码重置成功",
  "newPassword": "Ab3x8Kp2"
}
```

---

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 401 | 未授权（用户名或密码错误） |
| 403 | 禁止访问（权限不足） |
| 404 | 用户不存在 |
| 500 | 服务器内部错误 |

## 备注

- 默认管理员账号: `admin` / `admin`
- 默认班组长账号: `LEADER001` / `123` (张组长)
- 默认组员账号: `USER001` / `123` (李研发)
- 密码存储方式: 实际项目中应使用加密存储（如bcrypt）
