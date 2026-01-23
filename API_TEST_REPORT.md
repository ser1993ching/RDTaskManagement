# API测试报告

## 测试日期
2026-01-23

## 测试环境
- 后端地址: http://localhost:5000
- 测试用户: USER001 / 123

---

## 一、前后端JSON格式一致性分析

### 1.1 User 用户模块对比

| 序号 | 前端字段 (types.ts) | 前端类型 | 后端字段 (UserDto) | 后端JSON输出 | 数据类型 | 一致性 |
|------|---------------------|----------|--------------------|--------------|----------|--------|
| 1 | userId | string | UserId | userId | string | ✓ |
| 2 | name | string | Name | name | string | ✓ |
| 3 | systemRole | SystemRole | SystemRole | systemRole | string | ⚠️ 枚举类型差异 |
| 4 | officeLocation | OfficeLocation | OfficeLocation | officeLocation | string | ⚠️ 枚举类型差异 |
| 5 | title | string? | Title | title | string? | ✓ |
| 6 | joinDate | string? | JoinDate | joinDate | string? | ✓ |
| 7 | status | PersonnelStatus | Status | status | string | ⚠️ 枚举类型差异 |
| 8 | education | string? | Education | education | string? | ✓ |
| 9 | school | string? | School | school | string? | ✓ |
| 10 | remark | string? | Remark | remark | string? | ✓ |
| 11 | password | string? | - | - | - | 前端不返回 |
| 12 | isDeleted | boolean? | - | - | - | 前端冗余字段 |

**问题分析**:
- 前端使用TypeScript枚举 (SystemRole, OfficeLocation, PersonnelStatus)
- 后端返回字符串 (如 "Member", "Chengdu", "Active")
- 前端需要将字符串转换为枚举使用

---

### 1.2 Project 项目模块对比

| 序号 | 前端字段 (types.ts) | 前端类型 | 后端字段 (ProjectDto) | 后端JSON输出 | 数据类型 | 一致性 |
|------|---------------------|----------|-----------------------|--------------|----------|--------|
| 1 | id | string | Id | id | string | ✓ |
| 2 | name | string | Name | name | string | ✓ |
| 3 | category | ProjectCategory | Category | category | string | ⚠️ 枚举类型差异 |
| 4 | workNo | string? | WorkNo | workNo | string? | ✓ |
| 5 | capacity | string? | Capacity | capacity | string? | ✓ |
| 6 | model | string? | Model | model | string? | ✓ |
| 7 | isWon | boolean? | IsWon | isWon | boolean | ✓ |
| 8 | isForeign | boolean? | IsForeign | isForeign | boolean | ✓ |
| 9 | startDate | string? | StartDate | startDate | DateTime? | ⚠️ 日期格式 |
| 10 | endDate | string? | EndDate | endDate | DateTime? | ⚠️ 日期格式 |
| 11 | remark | string? | Remark | remark | string? | ✓ |
| 12 | isCommissioned | boolean? | IsCommissioned | isCommissioned | boolean | ✓ |
| 13 | isCompleted | boolean? | IsCompleted | isCompleted | boolean | ✓ |
| 14 | isKeyProject | boolean? | IsKeyProject | isKeyProject | boolean | ✓ |
| 15 | isDeleted | boolean? | - | - | - | 前端冗余 |

**日期格式问题**:
- 后端返回: `2026-01-19T10:34:43.806` (ISO 8601格式)
- 前端需要解析为Date对象或格式化字符串

---

### 1.3 Task 任务模块对比

| 序号 | 前端字段 | 前端类型 | 后端字段 | 后端JSON | 数据类型 | 一致性 |
|------|----------|----------|----------|----------|----------|--------|
| 1 | taskId | string | TaskId | taskId | string | ✓ |
| 2 | taskName | string | TaskName | taskName | string | ✓ |
| 3 | taskClassId | string | TaskClassId | taskClassId | string | ✓ |
| 4 | category | string | Category | category | string | ✓ |
| 5 | projectId | string? | ProjectId | projectId | string? | ✓ |
| 6 | assigneeId | string? | AssigneeId | assigneeId | string? | ✓ |
| 7 | assigneeName | string? | AssigneeName | assigneeName | string? | ✓ |
| 8 | startDate | string? | StartDate | startDate | DateTime? | ⚠️ |
| 9 | dueDate | string? | DueDate | dueDate | DateTime? | ⚠️ |
| 10 | completedDate | string? | CompletedDate | completedDate | DateTime? | ⚠️ |
| 11 | status | TaskStatus | Status | status | string | ⚠️ |
| 12 | workload | number? | Workload | workload | decimal? | ⚠️ |
| 13 | difficulty | number? | Difficulty | difficulty | decimal? | ⚠️ |
| 14 | remark | string? | Remark | remark | string? | ✓ |
| 15 | createdDate | string | CreatedDate | createdDate | string | ✓ |
| 16 | createdBy | string | CreatedBy | createdBy | string | ✓ |
| 17 | travelLocation | string? | TravelLocation | travelLocation | string? | ✓ |
| 18 | travelDuration | number? | TravelDuration | travelDuration | decimal? | ⚠️ |
| 19 | travelLabel | string? | TravelLabel | travelLabel | string? | ✓ |
| 20 | meetingDuration | number? | MeetingDuration | meetingDuration | decimal? | ⚠️ |
| 21 | participants | string[]? | Participants | participants | List<string>? | ✓ |
| 22 | participantNames | string[]? | ParticipantNames | participantNames | List<string>? | ✓ |
| 23 | capacityLevel | string? | CapacityLevel | capacityLevel | string? | ✓ |
| 24 | checkerId | string? | CheckerId | checkerId | string? | ✓ |
| 25 | checkerName | string? | CheckerName | checkerName | string? | ✓ |
| 26 | checkerWorkload | number? | CheckerWorkload | checkerWorkload | decimal? | ⚠️ |
| 27 | checkerStatus | RoleStatus? | CheckerStatus | checkerStatus | string? | ⚠️ |
| 28 | chiefDesignerId | string? | ChiefDesignerId | chiefDesignerId | string? | ✓ |
| 29 | chiefDesignerName | string? | ChiefDesignerName | chiefDesignerName | string? | ✓ |
| 30 | chiefDesignerWorkload | number? | ChiefDesignerWorkload | chiefDesignerWorkload | decimal? | ⚠️ |
| 31 | chiefDesignerStatus | RoleStatus? | ChiefDesignerStatus | chiefDesignerStatus | string? | ⚠️ |
| 32 | approverId | string? | ApproverId | approverId | string? | ✓ |
| 33 | approverName | string? | ApproverName | approverName | string? | ✓ |
| 34 | approverWorkload | number? | ApproverWorkload | approverWorkload | decimal? | ⚠️ |
| 35 | approverStatus | RoleStatus? | ApproverStatus | approverStatus | string? | ⚠️ |
| 36 | assigneeStatus | RoleStatus? | AssigneeStatus | assigneeStatus | string? | ⚠️ |
| 37 | isForceAssessment | boolean? | IsForceAssessment | isForceAssessment | boolean | ✓ |
| 38 | isInPool | boolean? | IsInPool | isInPool | boolean | ✓ |
| 39 | isDeleted | boolean? | - | - | - | 前端冗余 |

**类型差异说明**:
- `decimal?` → `number?`: 后端decimal类型转为JavaScript number
- `DateTime?` → `string?`: ISO 8601格式字符串
- `string` → 枚举: 需要前端转换

---

### 1.4 TaskPoolItem 任务库模块对比

| 序号 | 前端字段 | 前端类型 | 后端字段 | 后端JSON | 一致性 |
|------|----------|----------|----------|----------|--------|
| 1 | id | string | Id | id | ✓ |
| 2 | taskName | string | TaskName | taskName | ✓ |
| 3 | taskClassId | string | TaskClassId | taskClassId | ✓ |
| 4 | category | string | Category | category | ✓ |
| 5 | projectId | string? | ProjectId | projectId | ✓ |
| 6 | projectName | string? | ProjectName | projectName | ✓ |
| 7 | personInChargeId | string? | PersonInChargeId | personInChargeId | ✓ |
| 8 | personInChargeName | string? | PersonInChargeName | personInChargeName | ✓ |
| 9 | checkerId | string? | CheckerId | checkerId | ✓ |
| 10 | checkerName | string? | CheckerName | checkerName | ✓ |
| 11 | chiefDesignerId | string? | ChiefDesignerId | chiefDesignerId | ✓ |
| 12 | chiefDesignerName | string? | ChiefDesignerName | chiefDesignerName | ✓ |
| 13 | approverId | string? | ApproverId | approverId | ✓ |
| 14 | approverName | string? | ApproverName | approverName | ✓ |
| 15 | startDate | string? | StartDate | startDate | ⚠️ |
| 16 | dueDate | string? | DueDate | dueDate | ⚠️ |
| 17 | createdBy | string | CreatedBy | createdBy | ✓ |
| 18 | createdByName | string? | CreatedByName | createdByName | ✓ |
| 19 | createdDate | string | CreatedDate | createdDate | ✓ |
| 20 | isForceAssessment | boolean? | IsForceAssessment | isForceAssessment | ✓ |
| 21 | remark | string? | Remark | remark | ✓ |
| 22 | isDeleted | boolean? | - | - | 前端冗余 |

---

## 二、数据类型差异汇总

| C# 类型 | TypeScript 类型 | 说明 |
|---------|-----------------|------|
| string | string | 一致 |
| bool | boolean | 一致 |
| int/long | number | 一致 |
| decimal | number | 数值类型一致 |
| DateTime? | string? | 后端返回ISO 8601格式字符串 |
| List<T> | T[] | 数组类型 |
| enum (string) | enum | 后端返回字符串，前端需转换 |

---

## 三、枚举值差异

### 3.1 SystemRole 角色枚举

| 后端返回值 | 前端枚举 (SystemRole) |
|-----------|----------------------|
| "Admin" | ADMIN = '管理员' |
| "Leader" | LEADER = '班组长' |
| "Member" | MEMBER = '组员' |

**问题**: 后端返回英文，前端枚举值为中文，需要映射

### 3.2 TaskStatus 任务状态

| 后端返回值 | 前端枚举 (TaskStatus) |
|-----------|----------------------|
| "NotStarted" | NOT_STARTED = '未开始' |
| "Drafting" | DRAFTING = '编制中' |
| "Revising" | REVISING = '修改中' |
| "Reviewing" | REVIEWING = '校核中' |
| "Reviewing2" | REVIEWING2 = '审查中' |
| "Completed" | COMPLETED = '已完成' |

**问题**: 后端返回英文状态值，前端使用中文枚举

### 3.3 办公地点

| 后端返回值 | 前端枚举 (OfficeLocation) |
|-----------|-------------------------|
| "Chengdu" | CHENGDU = '成都' |
| "Deyang" | DEYANG = '德阳' |

---

## 四、验证总结

### 4.1 JSON字段命名 ✓
- 所有字段名已统一使用 camelCase
- 通过 `[JsonPropertyName]` 属性实现

### 4.2 字段完整性 ✓
- 前端所需的字段在后端都有对应
- 已通过登录API验证数据返回正常

### 4.3 需优化项

| 问题 | 严重程度 | 建议 |
|------|----------|------|
| 枚举值中英文不一致 | 中 | 前端添加枚举映射函数 |
| 日期格式为ISO字符串 | 低 | 前端统一格式化处理 |
| decimal类型精度 | 低 | JavaScript number足够表示 |
| isDeleted字段冗余 | 低 | 前端可忽略此字段 |

---

## 五、登录测试结果

| 用户 | UserID | 密码 | 结果 |
|------|--------|------|------|
| 杨巍 | 3005925 | 123 | ✓ 成功 |
| 李典 | 3008231 | 123 | ✓ 成功 |
| 胡德剑 | 1004889 | 123 | ✓ 成功 |
| 李研究员 | USER001 | 123 | ✓ 成功 |
| admin | admin | admin | ✗ 失败 (密码Hash格式错误) |

**JSON响应示例**:
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
      "education": "",
      "school": "",
      "remark": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 六、结论

1. **JSON字段命名一致性**: ✓ 已修复
2. **字段类型兼容性**: ✓ 基本一致（类型转换自动完成）
3. **枚举值处理**: ⚠️ 需前端添加映射逻辑
4. **登录功能**: ✓ 杨巍、李典、胡德剑可正常登录

**建议**: 前端在接收后端数据时，添加枚举值转换函数处理中英文差异。
