# 任务创建窗口字段显示分析报告

## 一、任务类型分类

### 1.1 十大任务类型

| 编码 | 任务类型 | 代码标识 | 特点 |
|------|----------|----------|------|
| TC001 | 市场配合 | MARKET | 关联项目 + 容量等级 |
| TC002 | 常规项目执行 | EXECUTION | 关联项目 + 容量等级 |
| TC003 | 核电项目 | NUCLEAR | 关联项目 + 容量等级 |
| TC004 | 产品研发 | PRODUCT_DEV | 关联项目 + 容量等级 |
| TC005 | 科研项目 | RESEARCH | 关联项目 + 容量等级 |
| TC006 | 改造项目 | RENOVATION | 关联项目 + 容量等级 |
| TC007 | 会议培训 | MEETING_TRAINING | 关联项目 + 容量等级 + 参会人员 |
| TC008 | 行政与党建 | ADMIN_PARTY | 关联项目 + 容量等级 |
| TC009 | 差旅任务 | TRAVEL | 独立字段集（无容量等级） |
| TC010 | 其他 | OTHER | 关联项目 + 容量等级 |

---

## 二、各任务类型字段对比

### 2.1 字段显示总览表

| 字段 | 市场配合 | 常规项目 | 核电项目 | 产品研发 | 科研项目 | 改造项目 | 会议培训 | 行政党建 | 差旅任务 | 其他 |
|------|---------|---------|---------|---------|---------|---------|---------|---------|---------|------|
| 分类 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 关联项目 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 容量等级 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| 机型(model) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 负责人 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 校核人 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 审查人 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 任务状态 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 开始日期 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅(会议日期) | ✅ | ✅ | ✅ |
| 截止日期 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌(自动计算) | ✅ |
| 工作量 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 难度 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| 出差地点 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 出差天数 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 差旅标签 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| 会议时长 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| 参会人员 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

### 2.2 差旅任务专用字段 (TC009)

**显示位置**: 第二行独立区域 (`TaskView.tsx:749-812`)

```typescript
// 差旅任务显示的字段
{isTravel && (
  <div className="grid grid-cols-3 gap-3 col-span-2">
    <div>
      <label>分类</label>
      <select value={formData.Category} onChange={...}>
        {/* 市场配合出差、常规项目执行出差、核电项目执行出差、科研出差、改造服务出差、其他 */}
      </select>
    </div>
    <div>
      <label>差旅标签</label>
      <select value={formData.TravelLabel} onChange={...}>
        {/* 根据分类动态显示不同标签 */}
      </select>
    </div>
    <div>
      <label>关联项目</label>
      <AutocompleteInput {...} />
    </div>
  </div>
)}
```

**第三行** (`TaskView.tsx:815-858`):
| 字段 | 说明 |
|------|------|
| 负责人 | 必填，选择系统用户 |
| 开始日期 | 必填，用于计算截止日期 |
| 出差天数(天) | 数字，自动计算截止日期 |

**截止日期自动计算** (`TaskView.tsx:851-856`):
```typescript
const newTravelDuration = parseFloat(e.target.value) || 0;
const startDate = formData.StartDate || '';
const newDueDate = calculateDueDate(startDate, newTravelDuration);
setFormData({...formData, TravelDuration: newTravelDuration, DueDate: newDueDate});
```

### 2.3 会议培训任务专用字段 (TC007)

**参会人员选择器** (`TaskView.tsx:1041-1330`):
| 区域 | 内容 |
|------|------|
| 全选控制 | 班组长全选、成员全选 |
| 班组长组 | 按部门过滤的班组长列表 |
| 成员组 | 按部门过滤的普通成员列表 |

**参会人员显示逻辑**:
```typescript
{formData.Participants && formData.Participants.length > 0 && (
  <div className="selected-participants mt-2 flex flex-wrap gap-1">
    {formData.Participants.map(id => {
      const user = users.find(u => u.UserID === id);
      return user ? (
        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {user.Name}
          <X size={12} onClick={() => removeParticipant(id)} />
        </span>
      ) : null;
    })}
  </div>
)}
```

### 2.4 差旅任务与会议培训任务的特殊字段对比

| 特性 | 差旅任务 | 会议培训任务 |
|------|---------|-------------|
| 特殊字段 | TravelLocation, TravelDuration, TravelLabel | MeetingDuration, Participants |
| 时间字段 | StartDate (开始日期) + 自动计算DueDate | StartDate (会议日期) + MeetingDuration |
| 人员字段 | 仅负责人(Assignee) | 负责人 + 参会人员(Participants) |
| 状态控制 | 固定为"未开始"，不可修改 | 固定为"未开始"，不可修改 |
| 校核/审查 | 不显示 | 不显示 |
| 工作量/难度 | 不显示 | 不显示 |

---

## 三、字段显示条件详解

### 3.1 isProjectRelated 判断逻辑

**代码位置**: `TaskView.tsx:666`

```typescript
const isProjectRelated = ['MARKET', 'EXECUTION', 'NUCLEAR', 'PRODUCT_DEV', 'RESEARCH', 'RENOVATION', 'ADMIN_PARTY', 'MEETING_TRAINING', 'OTHER'].includes(activeTaskClass.code);
```

**显示关联项目的任务类型**:
| 任务类型 | code | 显示关联项目 |
|----------|------|-------------|
| 市场配合 | MARKET | ✅ |
| 常规项目 | EXECUTION | ✅ |
| 核电项目 | NUCLEAR | ✅ |
| 产品研发 | PRODUCT_DEV | ✅ |
| 科研项目 | RESEARCH | ✅ |
| 改造项目 | RENOVATION | ✅ |
| 会议培训 | MEETING_TRAINING | ✅ |
| 行政党建 | ADMIN_PARTY | ✅ |
| 其他 | OTHER | ✅ |
| 差旅任务 | TRAVEL | ❌ (独立处理) |

### 3.2 容量等级显示条件

**代码位置**: `TaskView.tsx:733-745`

```typescript
{['MARKET', 'EXECUTION', 'NUCLEAR', 'PRODUCT_DEV', 'RESEARCH', 'RENOVATION', 'ADMIN_PARTY', 'MEETING_TRAINING', 'OTHER'].includes(activeTaskClass.code) && (
  <div>
    <label>容量等级</label>
    <AutocompleteInput
      value={formData.CapacityLevel || ''}
      options={capacityLevels}
      onChange={(value) => setFormData({...formData, CapacityLevel: value})}
      placeholder="选择或输入容量等级"
      {...}
    />
  </div>
)}
```

**注意**: 差旅任务(TRAVEL)不显示容量等级，因为差旅任务使用`TravelLabel`而非`CapacityLevel`。

### 3.3 容量等级自动填充逻辑

**从项目获取** (`TaskView.tsx:692-698`):
```typescript
// 如果选择了项目，自动获取容量等级
if (['MARKET', 'EXECUTION', ...].includes(activeTaskClass?.code || '') && project) {
  newFormData.CapacityLevel = project.capacity;
} else if ([...].includes(activeTaskClass?.code || '') && !project && value.trim()) {
  // 如果清除项目选择，清空容量等级
  newFormData.CapacityLevel = '';
}
```

**保存时覆盖** (`TaskView.tsx:573-578`):
```typescript
if (['MARKET', 'EXECUTION', ...].includes(activeTaskClass?.code || '') && formData.ProjectID) {
  const project = projects.find(p => p.id === formData.ProjectID);
  if (project) {
    taskToSave.CapacityLevel = project.capacity;  // 始终从项目获取
  }
}
```

---

## 四、字段不显示的原因分析

### 4.1 容量等级(capacityLevels)为空

**可能原因**:
1. **后端API未返回数据**: `apiDataService.getCapacityLevels()` 返回空数组
2. **Settings配置缺失**: 数据库的system_config表中没有容量等级配置
3. **API调用失败**: 网络问题或后端异常

**验证方法**:
```typescript
// TaskView.tsx:90-101
useEffect(() => {
  const loadSettings = async () => {
    const [models, levels] = await Promise.all([
      apiDataService.getEquipmentModels(),
      apiDataService.getCapacityLevels(),
    ]);
    setEquipmentModels(models);
    setCapacityLevels(levels);  // 如果这里levels为空，则显示异常
  };
  loadSettings();
}, []);
```

**解决方案**:
1. 检查后端`/api/settings/capacity-levels`接口
2. 确认数据库中有容量等级配置数据
3. 使用备用配置:
```typescript
const DEFAULT_CAPACITY_LEVELS = [
  '300MW等级', '600MW等级', '1000MW等级', '华龙一号',
  'F级燃机', 'J型燃机', '空冷发电机', '调相机'
];
```

### 4.2 机型(model)不显示

**实际情况说明**:
- 机型(model)字段**不属于任务属性**，而是**项目属性**
- 机型字段在**项目创建弹窗**中显示，而非任务创建窗口
- 任务创建窗口中只显示容量等级(CapacityLevel)

**项目创建时的机型字段** (`TaskView.tsx:1709-1719`):
```typescript
<div className="col-span-1">
  <label>机型</label>
  <AutocompleteInput
    value={projectFormData.model || ''}
    options={equipmentModels}
    onChange={(value) => setProjectFormData({...projectFormData, model: value})}
    placeholder="选择或输入机型"
    id="project-model-autocomplete"
  />
</div>
```

### 4.3 关联项目不显示

**检查清单**:
1. 确认当前任务分类的code在 `isProjectRelated` 列表中
2. 确认 `projects` 数据已加载
3. 确认 `activeTaskClass` 已正确设置

**调试方法**:
```typescript
console.log({
  activeTaskClass: activeTaskClass?.code,
  isProjectRelated: ['MARKET', 'EXECUTION', 'NUCLEAR', 'PRODUCT_DEV', 'RESEARCH', 'RENOVATION', 'ADMIN_PARTY', 'MEETING_TRAINING', 'OTHER'].includes(activeTaskClass?.code),
  projectsCount: projects.length
});
```

---

## 五、"人员创建窗口"字段说明

### 5.1 PersonnelView分析

经过代码检查，**PersonnelView.tsx中不存在"关联项目"和"容量等级"字段**。

当前人员创建窗口包含的字段:
| 字段 | 可见条件 |
|------|----------|
| 工号 | 新建时自动生成 |
| 姓名 | 必填 |
| 角色 | 必填（组员/班组长/管理员） |
| 地点 | 必填（成都/德阳） |
| 状态 | 必填（在岗/离岗/其他） |
| 职称 | 可选 |
| 学历 | 可选 |
| 毕业学校 | 可选 |
| 入职时间 | 自动填充当前日期 |
| 备注 | 可选 |

### 5.2 可能的混淆

用户可能将以下场景混淆:
1. **任务创建窗口** - 有"关联项目"和"容量等级"
2. **项目创建窗口** - 有"容量等级"和"机型"
3. **人员创建窗口** - 没有上述字段

---

## 六、正确显示的条件汇总

### 6.1 容量等级正确显示的条件

| 条件 | 说明 | 状态 |
|------|------|------|
| 后端返回容量等级数据 | `apiDataService.getCapacityLevels()` 返回非空数组 | 依赖后端 |
| 任务类型支持 | 任务类型code在支持列表中（非TRAVEL） | ✅ 已实现 |
| capacityLevels状态已更新 | `setCapacityLevels(levels)` 成功执行 | 依赖后端 |

### 6.2 关联项目正确显示的条件

| 条件 | 说明 | 状态 |
|------|------|------|
| projects数据已加载 | `projects` 数组有数据 | ✅ 已实现 |
| 任务类型支持 | 任务类型code在支持列表中 | ✅ 已实现 |
| isProjectRelated为true | 条件判断正确 | ✅ 已实现 |

### 6.3 机型(model)字段位置

| 位置 | 可见条件 |
|------|----------|
| 项目创建弹窗 | 点击"+新建项目"按钮后 |
| 任务详情查看 | 不显示（机型是项目属性） |

---

## 七、总结

### 7.1 当前设计合理性

| 设计 | 评价 | 说明 |
|------|------|------|
| 差旅任务独立字段 | ✅ 合理 | 出差天数自动计算截止日期是良好体验 |
| 会议培训参会人员 | ✅ 合理 | 支持全选、分组显示 |
| 容量等级从项目获取 | ✅ 合理 | 避免重复输入，保证数据一致性 |
| TRAVEL无容量等级 | ✅ 合理 | 差旅任务使用TravelLabel而非容量等级 |

### 7.2 已知问题

| 问题 | 影响 | 解决方案 |
|------|------|----------|
| capacityLevels可能为空 | 容量等级下拉框无选项 | 检查后端API，添加备用数据 |
| 人员窗口无关联字段 | 用户期望但不存在 | 澄清设计，或确认是否需要新增 |
| 机型字段不在任务窗口 | 用户可能在错误位置查找 | 在项目创建窗口中查找 |

### 7.3 调试建议

如需调试字段显示问题，请按以下步骤检查:

1. **确认任务类型**: 在控制台输出 `activeTaskClass?.code`
2. **确认数据加载**: 检查 `projects.length` 和 `capacityLevels.length`
3. **确认条件判断**: 验证 `isProjectRelated` 值
4. **检查后端API**: 访问 `/api/settings/capacity-levels` 和 `/api/projects`

---

*文档创建时间: 2026-01-21*
*分析范围: TaskView.tsx 任务创建窗口字段显示逻辑*
*版本: 1.0*
