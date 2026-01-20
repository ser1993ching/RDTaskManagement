# 实现设置功能 API 集成

## ADDED Requirements

### Requirement: 任务类别管理 API

系统 SHALL 提供完整的任务类别管理接口，支持 CRUD 操作。

#### Scenario: 获取任务类别列表
作为系统用户，我希望能够获取所有任务类别列表，以便在任务管理中使用。

**API:**
- `GET /api/settings/task-classes`
- 需要认证

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "TC001",
      "name": "市场配合",
      "code": "Market",
      "description": "市场支持相关任务",
      "notice": "请填写客户名称"
    }
  ]
}
```

#### Scenario: 创建新任务类别
作为管理员，我希望能够创建新的任务类别，以扩展系统的任务分类能力。

**API:**
- `POST /api/settings/task-classes`
- 需要 ADMIN 或 LEADER 角色

**Request:**
```json
{
  "name": "新类别",
  "code": "NEW_CATEGORY",
  "description": "描述",
  "notice": "提示文字"
}
```

**Response:**
```json
{
  "success": true,
  "message": "创建成功",
  "data": { "id": "TC011" }
}
```

#### Scenario: 更新任务类别
作为管理员，我希望能够更新现有任务类别信息，以修正或补充类别描述。

**API:**
- `PUT /api/settings/task-classes/{id}`
- 需要 ADMIN 或 LEADER 角色

#### Scenario: 删除任务类别
作为管理员，我希望能够删除无任务关联的任务类别，以保持系统整洁。

**API:**
- `DELETE /api/settings/task-classes/{id}`
- 需要 ADMIN 角色
- 检查关联任务后才能删除

---

### Requirement: 任务分类管理 API

系统 SHALL 提供任务分类的增删改查和排序功能。

#### Scenario: 获取任务分类列表
作为系统用户，我希望能够获取所有任务分类，以便在创建任务时选择。

**API:**
- `GET /api/settings/task-categories`
- 返回按任务类别代码分组的分类列表

**Response:**
```json
{
  "success": true,
  "data": {
    "Market": ["标书", "复询", "技术支持", "其他"],
    "Execution": ["搭建生产资料", "设计院提资", "其他"]
  }
}
```

#### Scenario: 更新任务分类
作为管理员，我希望能够更新某个任务类别下的分类列表。

**API:**
- `PUT /api/settings/task-categories/{taskClassCode}`
- 需要 ADMIN 或 LEADER 角色

#### Scenario: 批量更新任务分类顺序
作为管理员，我希望能够调整任务分类的显示顺序。

**API:**
- `PUT /api/settings/task-categories/{taskClassCode}/reorder`
- 需要 ADMIN 或 LEADER 角色

---

### Requirement: 机型/容量等级/差旅标签 API

系统 SHALL 提供基础配置项的管理功能。

#### Scenario: 获取机型列表
作为系统用户，我希望能够获取机型列表。

**API:**
- `GET /api/settings/equipment-models`

#### Scenario: 批量导入机型
作为管理员，我希望能够批量导入机型列表。

**API:**
- `POST /api/settings/equipment-models/batch`
- 需要 ADMIN 或 LEADER 角色

---

### Requirement: 前端设置页面 API 集成

前端设置页面 MUST 调用后端 API 实现数据持久化。

#### Scenario: 前端设置页面调用后端 API
作为用户，我希望设置页面的所有操作都能正确保存到数据库。

**要求:**
- Settings.tsx 所有 CRUD 操作调用后端 API
- 页面加载时从 API 获取数据
- 操作成功后显示成功提示
- 错误时显示错误信息

#### Scenario: 设置数据持久化
作为用户，我希望设置数据重启后仍然存在。

**要求:**
- 设置数据存储到 MySQL 数据库
- 后端启动时初始化默认数据
- 数据迁移支持从 localStorage 导入
