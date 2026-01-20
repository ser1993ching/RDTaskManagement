# 设计文档：设置功能 API 集成

## 架构设计

### 数据流
```
前端 Settings.tsx → API 服务层 → 后端 Controller → Service → Repository → MySQL
                     ↑_____________________|
                     错误处理 & 重试
```

### 技术决策

#### 1. 数据库存储 vs 内存存储
**决策：使用数据库存储**

理由：
- 设置数据需要持久化
- 多用户访问时数据一致
- 便于后续扩展

#### 2. 软删除策略
**决策：所有设置实体使用软删除**

理由：
- 防止误删导致数据丢失
- 保留历史记录
- 与现有任务系统保持一致

#### 3. API 响应格式
**决策：统一使用 ApiResponse<T> 包装**

```csharp
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

#### 4. 权限控制
**决策：管理操作需要 ADMIN 或 LEADER 角色**

| 操作 | MEMBER | LEADER | ADMIN |
|------|--------|--------|-------|
| 查看设置 | ✅ | ✅ | ✅ |
| 机型/容量/标签管理 | ❌ | ✅ | ✅ |
| 任务类别管理 | ❌ | ✅ | ✅ |
| 删除任务类别 | ❌ | ❌ | ✅ |
| 重置数据 | ❌ | ❌ | ✅ |

## 数据库设计

### TaskClasses 表
```sql
CREATE TABLE task_classes (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    notice VARCHAR(500),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Settings 表 (通用设置)
```sql
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,  -- 'equipment_models', 'capacity_levels', 'travel_labels'
    key_name VARCHAR(100) NOT NULL,
    value TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_key (category, key_name)
);
```

### TaskCategories 表
```sql
CREATE TABLE task_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_class_code VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_class_code (task_class_code)
);
```

## API 设计

### 基础路径
`/api/settings`

### 端点矩阵

| 方法 | 路径 | 描述 | 角色 |
|------|------|------|------|
| GET | /task-classes | 获取任务类别列表 | ALL |
| POST | /task-classes | 创建任务类别 | LEADER+ |
| PUT | /task-classes/{id} | 更新任务类别 | LEADER+ |
| DELETE | /task-classes/{id} | 删除任务类别 | ADMIN |
| GET | /task-categories | 获取分类列表 | ALL |
| PUT | /task-categories/{code} | 更新分类 | LEADER+ |
| GET | /equipment-models | 获取机型列表 | ALL |
| POST | /equipment-models | 添加机型 | LEADER+ |
| DELETE | /equipment-models/{model} | 删除机型 | LEADER+ |
| POST | /equipment-models/batch | 批量导入 | LEADER+ |
| GET | /capacity-levels | 获取容量等级 | ALL |
| ... | ... | ... | ... |

## 前端改造

### API 服务层设计
```typescript
// services/api/settings.ts
export const settingsService = {
  // 任务类别
  getTaskClasses: () => client.get('/settings/task-classes'),
  createTaskClass: (data: TaskClassInput) => client.post('/settings/task-classes', data),
  updateTaskClass: (id: string, data: Partial<TaskClassInput>) =>
    client.put(`/settings/task-classes/${id}`, data),
  deleteTaskClass: (id: string) => client.delete(`/settings/task-classes/${id}`),

  // 任务分类
  getTaskCategories: () => client.get('/settings/task-categories'),
  updateTaskCategories: (code: string, categories: string[]) =>
    client.put(`/settings/task-categories/${code}`, { categories }),

  // ... 其他方法
};
```

### 状态管理
- 使用 React useState + useEffect
- 加载状态单独管理
- 错误状态统一处理

## 迁移策略

### 1. 数据库迁移
- 创建新表
- 从内存数据初始化默认数据
- 更新现有代码使用数据库

### 2. 数据兼容
- 如果 localStorage 有数据，提示用户是否导入
- 提供一键迁移功能

### 3. 回滚方案
- 保留内存存储作为降级方案
- 配置开关控制使用数据库还是内存
