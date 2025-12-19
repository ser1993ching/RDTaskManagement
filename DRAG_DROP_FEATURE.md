# 任务分类拖拽排序功能说明

## 功能概述

本次优化为任务分类管理添加了直观的拖拽排序功能，允许管理员通过拖拽调整分类的显示顺序，并且在任务管理界面中保持相同的排序。

## 主要特性

### 1. 纵向列表布局
- **替代下拉选择**: 将原来单一的下拉框改为纵向展示所有任务类别
- **卡片式设计**: 每个任务类别独立成卡，清晰分隔
- **分类计数**: 显示每个任务类别下的分类数量

### 2. 拖拽排序
- **直观操作**: 点击并拖拽分类项到目标位置
- **视觉反馈**:
  - 拖拽时：元素半透明显示
  - 悬停时：目标位置高亮显示蓝色边框
  - 拖拽手柄：六点图标，鼠标悬停时变色
- **即时保存**: 排序调整后立即保存到localStorage

### 3. 同步显示
- **统一排序**: 任务管理界面中的分类顺序与设置界面完全一致
- **实时更新**: 修改排序后，所有使用该分类的界面立即生效

## 技术实现

### 1. 新增状态管理

```typescript
const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
```

### 2. 拖拽事件处理

#### 开始拖拽
```typescript
const handleDragStart = (e: React.DragEvent, categoryName: string) => {
  setDraggedCategory(categoryName);
  e.dataTransfer.effectAllowed = 'move';
};
```

#### 拖拽悬停
```typescript
const handleDragOver = (e: React.DragEvent, categoryName: string) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  setDraggedOverCategory(categoryName);
};
```

#### 放下元素
```typescript
const handleDrop = (e: React.DragEvent, targetCategoryName: string) => {
  e.preventDefault();
  if (!draggedCategory || draggedCategory === targetCategoryName) return;

  const categories = taskCategories[selectedTaskClassCode];
  const newOrder = [...categories];
  const draggedIndex = newOrder.indexOf(draggedCategory);
  const targetIndex = newOrder.indexOf(targetCategoryName);

  // 重新排序并保存
  newOrder.splice(draggedIndex, 1);
  newOrder.splice(targetIndex, 0, draggedCategory);

  dataService.reorderTaskCategories(selectedTaskClassCode, newOrder);
  setTaskCategories(dataService.getTaskCategories());
};
```

### 3. 数据持久化

#### dataService新增方法
```typescript
reorderTaskCategories(taskClassCode: string, newOrder: string[]): void {
  const allCategories = this.getTaskCategories();
  if (allCategories[taskClassCode]) {
    allCategories[taskClassCode] = newOrder;
    localStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES, JSON.stringify(allCategories));
  }
}
```

### 4. 界面布局

#### 卡片结构
```
┌─────────────────────────────────────┐
│ 任务类别标题 + 分类数量              │
├─────────────────────────────────────┤
│                                     │
│  [+] 新增分类输入框                 │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │ ☰ 分类名称        [编辑] [删除] │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │ ☰ 分类名称        [编辑] [删除] │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

#### 样式类
- **拖拽元素**: `cursor-move` 鼠标样式
- **拖拽中**: `opacity-50` 半透明
- **悬停目标**: `border-blue-500 bg-blue-50` 蓝色高亮
- **操作按钮**: `opacity-0 group-hover:opacity-100` 悬停显示

## 使用说明

### 基本操作

#### 1. 调整分类顺序
1. 进入"设置" → "任务分类管理"
2. 找到要调整的任务类别
3. 点击并拖拽分类项到目标位置
4. 释放鼠标完成排序
5. 系统显示"分类排序已更新"提示

#### 2. 编辑分类名称
1. 悬停在分类项上，显示操作按钮
2. 点击编辑按钮（✏️）
3. 修改名称并保存

#### 3. 删除分类
1. 悬停在分类项上，显示操作按钮
2. 点击删除按钮（🗑️）
3. 确认删除

#### 4. 添加新分类
1. 在任务类别卡片中找到"新增分类"输入框
2. 输入分类名称
3. 点击"添加"按钮

### 权限控制
- **管理员/班组长**: 可以拖拽排序、编辑、删除、添加
- **组员**: 只读权限，无法进行任何编辑操作

## 界面变化对比

### 优化前
- ❌ 下拉框选择任务类别
- ❌ 网格布局显示分类
- ❌ 无法调整顺序
- ❌ 操作分散，效率低

### 优化后
- ✅ 纵向列表展示所有任务类别
- ✅ 卡片式设计，信息清晰
- ✅ 拖拽排序，直观便捷
- ✅ 分类计数，一目了然
- ✅ 统一排序，两端同步

## 兼容性说明

### 数据格式
- 排序信息保存在localStorage的`rd_task_categories`键中
- 格式：`{ taskClassCode: [category1, category2, ...] }`
- 向后兼容：现有数据自动保持原有顺序

### 跨界面同步
- 设置界面排序 → 任务管理界面自动同步
- 无需刷新页面
- 实时生效

## 性能优化

### 1. 事件委托
- 拖拽事件直接绑定在DOM元素上
- 无需额外的事件委托机制

### 2. 状态更新
- 使用React状态管理，避免直接操作DOM
- 拖拽过程中只更新必要状态

### 3. 本地存储
- 排序结果立即写入localStorage
- 页面刷新后保持排序

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

*注：使用HTML5原生拖拽API，需要现代浏览器支持*

## 测试建议

### 1. 基本功能测试
- [ ] 拖拽分类项到不同位置
- [ ] 验证排序是否正确保存
- [ ] 刷新页面后排序是否保持
- [ ] 任务管理界面排序是否同步

### 2. 边界情况测试
- [ ] 拖拽到首位
- [ ] 拖拽到末位
- [ ] 拖拽到中间位置
- [ ] 快速连续拖拽

### 3. 权限测试
- [ ] 管理员可以拖拽排序
- [ ] 组员无法拖拽（只读）
- [ ] 操作按钮权限控制

### 4. 数据完整性测试
- [ ] 排序后数据不丢失
- [ ] 添加/删除后排序保持
- [ ] 刷新后数据一致

## 已知限制

1. **移动端**: 拖拽功能在移动设备上体验受限（HTML5拖拽在移动端支持不完善）
2. **键盘操作**: 目前仅支持鼠标拖拽，不支持键盘操作
3. **批量操作**: 暂不支持多选批量排序

## 后续改进计划

1. **触摸优化**: 添加触摸设备支持
2. **键盘快捷键**: Alt+上下箭头调整顺序
3. **撤销重做**: 支持撤销排序操作
4. **视觉辅助**: 添加排序序号显示

## 相关文件

- `components/Settings.tsx`: 设置界面主组件
- `services/dataService.ts`: 数据服务层
- `components/TaskView.tsx`: 任务管理界面

## 更新日志

**2025-12-19**: 添加拖拽排序功能
- 新增纵向列表布局
- 实现拖拽排序交互
- 添加排序持久化
- 实现跨界面同步
- 优化用户体验

---

**开发团队**: Claude Code
**版本**: v1.0
**状态**: 已完成 ✅
