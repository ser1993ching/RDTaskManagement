# 用户登录功能测试报告

## 测试日期
2026-01-23

## 测试环境
- 后端地址: http://localhost:5000
- 数据库: MySQL (docker container: rd-task-mysql)
- 测试密码: 123

---

## 测试结果汇总

| 用户名 | UserID | 角色 | 登录结果 | 原因 |
|--------|--------|------|----------|------|
| 胡德剑 | 1004889 | Member | ✓ 成功 | - |
| 杨巍 | 3005925 | Leader | ✓ 成功 | - |
| 李典 | 3008231 | Member | ✓ 成功 | - |
| 李研究员 | USER001 | Member | ✓ 成功 | - |
| admin | admin | - | ✗ 失败 | 密码Hash格式错误 |
| 张组长 | USER002 | - | 未测试 | 需要UserID登录 |

---

## 详细测试结果

### 1. 胡德剑 (1004889) - ✓ 成功

**请求**:
```json
POST /api/auth/login
{
  "userId": "1004889",
  "password": "123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "1004889",
      "name": "胡德剑",
      "systemRole": "Member",
      "officeLocation": "Chengdu",
      "title": "正高级主任工程师",
      "joinDate": "1995-07-01",
      "status": "Active",
      "education": "",
      "school": "",
      "remark": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": null,
  "error": null
}
```

**验证**:
- ✓ JSON字段为camelCase (userId, systemRole, officeLocation)
- ✓ 密码验证成功
- ✓ Token生成成功

---

### 2. 杨巍 (3005925) - ✓ 成功

**请求**:
```json
POST /api/auth/login
{
  "userId": "3005925",
  "password": "123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "3005925",
      "name": "杨巍",
      "systemRole": "Leader",
      "officeLocation": "Chengdu",
      "title": "工程师",
      "joinDate": "2014-07-01",
      "status": "Active",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  ...
}
```

**验证**:
- ✓ JSON字段为camelCase
- ✓ 角色为Leader
- ✓ 登录成功

---

### 3. 李典 (3008231) - ✓ 成功

**请求**:
```json
POST /api/auth/login
{
  "userId": "3008231",
  "password": "123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "3008231",
      "name": "李典",
      "systemRole": "Member",
      "officeLocation": "Chengdu",
      "title": "工程师",
      "joinDate": "2019-07-01",
      "status": "Active",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  ...
}
```

**验证**:
- ✓ JSON字段为camelCase
- ✓ 登录成功

---

### 4. 李研究员 (USER001) - ✓ 成功

**请求**:
```json
POST /api/auth/login
{
  "userId": "USER001",
  "password": "123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "USER001",
      "name": "李研究员",
      "systemRole": "Member",
      "officeLocation": "Chengdu",
      "title": "工程师",
      "joinDate": "2022-07-01",
      "status": "Active",
      "education": "硕士",
      "school": "四川大学",
      "remark": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  ...
}
```

**验证**:
- ✓ JSON字段为camelCase
- ✓ 包含完整用户信息（education, school等）
- ✓ 登录成功

---

### 5. admin - ✗ 失败

**请求**:
```json
POST /api/auth/login
{
  "userId": "admin",
  "password": "admin"
}
```

**响应**:
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": {
    "code": "SaltParseException",
    "message": "服务器内部错误",
    "details": "Invalid salt version"
  }
}
```

**问题分析**:
- admin用户的密码Hash为: `a1/QjFoX9PrM1l3s9eOr1fZvgS6GO.MO7GADJci1XEr90l1WQO`
- 该Hash格式不是标准的BCrypt格式（BCrypt应以 `$2a$11$` 或 `$2b$11$` 开头）
- 这是早期版本的密码Hash格式（可能是MD5/SHA1）
- BCrypt库无法解析此格式，导致 `SaltParseException`

**数据库记录**:
| UserID | Name | PasswordHash | Status |
|--------|------|--------------|--------|
| admin | 系统管理员 | a1/QjFoX9PrM1l3s9eOr1fZvgS6GO.MO7GADJci1XEr90l1WQO | 0 |

**建议修复**:
1. 使用BCrypt重新哈希admin的密码: `$2a$11$DBHI0pYwlNIXqrzA6CEvoezW6yaEx4/lsyFIj/s7Om4M3jOT4NNZ6`
2. 或在代码中处理旧格式密码的兼容性问题

---

## JSON格式验证

### 登录响应字段验证

| 字段 | 期望格式 | 实际格式 | 状态 |
|------|----------|----------|------|
| userId | camelCase | userId | ✓ |
| name | camelCase | name | ✓ |
| systemRole | camelCase | systemRole | ✓ |
| officeLocation | camelCase | officeLocation | ✓ |
| title | camelCase | title | ✓ |
| joinDate | camelCase | joinDate | ✓ |
| status | camelCase | status | ✓ |
| education | camelCase | education | ✓ |
| school | camelCase | school | ✓ |
| remark | camelCase | remark | ✓ |
| token | camelCase | token | ✓ |
| success | camelCase | success | ✓ |
| message | camelCase | message | ✓ |
| error | camelCase | error | ✓ |

---

## 问题总结

### 已修复的问题
1. ✓ 后端DTO的JSON序列化已配置为camelCase
2. ✓ AutoMapper已添加显式属性映射
3. ✓ 所有ID字段（userId, taskId, projectId等）现在正确输出为camelCase

### 待修复的问题
1. ⚠️ admin用户的密码Hash格式错误，需要重新设置
2. ⚠️ 密码"123"对应的BCrypt Hash: `$2a$11$DBHI0pYwlNIXqrzA6CEvoezW6yaEx4/lsyFIj/s7Om4M3jOT4NNZ6`

---

## 数据库用户统计

| UserID | Name | 密码Hash | Status | 能否使用密码123登录 |
|--------|------|----------|--------|---------------------|
| 1004889 | 胡德剑 | $2a$11$... | 0 | ✓ |
| 3005925 | 杨巍 | $2a$11$... | 0 | ✓ |
| 3008231 | 李典 | $2a$11$... | 0 | ✓ |
| USER001 | 李研究员 | $2a$11$... | 0 | ✓ |
| admin | 系统管理员 | a1/QjFoX9... | 0 | ✗ (Hash格式错误) |

---

## 结论

1. **杨巍、李典、胡德剑等用户可以正常使用密码"123"登录** ✓
2. **JSON响应格式符合camelCase规范** ✓
3. **admin用户登录失败** - 需要修复密码Hash格式
4. **数据库中Status=0的用户登录后返回status="Active"** - 这是正常的枚举映射行为
