import React, { useState, useEffect } from 'react';
import { Task, TaskClass, User, Project, TaskStatus } from '../types';
import { Plus, Download, Edit2, Trash2, Filter } from 'lucide-react';
import { dataService } from '../services/dataService';

interface TaskViewProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onRefresh: () => void;
}

// Config for Categories based on TaskClass
const CATEGORY_CONFIG: Record<string, string[]> = {
  'MARKET': ['标书', '复询', '技术方案', '其他'],
  'EXECUTION': ['搭建生产资料', '设计院提资', 'CT配合与提资', '随机资料', '项目特殊项处理', '用户配合', '图纸会签', '传真回复', '其他'],
  'PRODUCT_DEV': ['技术方案', '设计流程', '方案评审', '专利申请', '出图', '图纸改版', '设计总结'],
  'RESEARCH': ['开题报告', '专利申请', '结题报告', '其他'],
  'RENOVATION': ['前期项目配合', '方案编制', '其他'],
  'MEETING_TRAINING': ['学习与培训', '党建会议', '班务会', '设计评审会', '资料讨论会', '其他'],
  'ADMIN_PARTY': ['报表填报', 'ppt汇报', '总结报告', '其他'],
  'TRAVEL': ['市场配合出差', '项目执行出差', '产品研发出差', '科研出差', '生产服务出差', '其他'],
  'OTHER': ['通用任务']
};

// Config for Capacity Level (Market tasks only)
const CAPACITY_LEVEL_OPTIONS = [
  '300MW等级',
  '600MW等级',
  '1000MW等级',
  '华龙一号',
  'F级燃机',
  'J型燃机',
  '空冷发电机',
  '调相机'
];

export const TaskView: React.FC<TaskViewProps> = ({ currentUser, tasks, projects, users, onRefresh }) => {
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>(dataService.getTaskClasses());
  const [activeTaskClassId, setActiveTaskClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});

  // Set default active task class
  useEffect(() => {
    if (taskClasses.length > 0 && !activeTaskClassId) {
      setActiveTaskClassId(taskClasses[0].id);
    }
  }, [taskClasses, activeTaskClassId]);

  // Filtering
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterCapacityLevel, setFilterCapacityLevel] = useState('');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [filterThisMonth, setFilterThisMonth] = useState(false);
  const [filterTaskName, setFilterTaskName] = useState('');

  const activeTaskClass = taskClasses.find(tc => tc.id === activeTaskClassId);

  // Initialize default filter to show tasks from last 2 months
  useEffect(() => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    setFilterStartDateFrom(twoMonthsAgo.toISOString().split('T')[0]);
  }, []);

  // Helper function to check if a date is in current week
  const isInCurrentWeek = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    startOfWeek.setHours(0, 0, 0, 0);
    endOfWeek.setHours(23, 59, 59, 999);
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Helper function to check if a date is in current month
  const isInCurrentMonth = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const filteredTasks = tasks.filter(t => {
    return t.TaskClassID === activeTaskClassId &&
      (filterProject ? t.ProjectID === filterProject : true) &&
      (filterStatus ? t.Status === filterStatus : true) &&
      (filterCategory ? t.Category === filterCategory : true) &&
      (filterAssignee ? t.AssigneeID === filterAssignee : true) &&
      (filterCapacityLevel ? t.CapacityLevel === filterCapacityLevel : true) &&
      (filterTaskName ? t.TaskName.toLowerCase().includes(filterTaskName.toLowerCase()) : true) &&
      (filterStartDateFrom ? (t.StartDate ? new Date(t.StartDate) >= new Date(filterStartDateFrom) : true) : true) &&
      (filterStartDateTo ? (t.StartDate ? new Date(t.StartDate) <= new Date(filterStartDateTo) : true) : true) &&
      (filterThisWeek ? isInCurrentWeek(t.StartDate || '') : true) &&
      (filterThisMonth ? isInCurrentMonth(t.StartDate || '') : true);
  });

  const handleExport = () => {
    // 检查是否包含差旅任务
    const hasTravelTask = filteredTasks.some(t => t.TaskClassID === 'TC008');

    // 根据任务类型决定列头
    const headers = hasTravelTask
      ? ['ID', '任务名称', '状态', '负责人', '容量等级', '截止日期']
      : ['ID', '任务名称', '状态', '负责人', '校核人', '审查人', '容量等级', '截止日期'];

    // 根据任务类型决定行数据
    const rows = filteredTasks.map(t => {
      const baseRow = [
        t.TaskID,
        t.TaskName,
        t.Status,
        users.find(u => u.UserID === t.AssigneeID)?.Name || '-',
        t.CapacityLevel || '-',
        t.DueDate || ''
      ];

      // 如果不是差旅任务，添加校核人和审查人
      if (t.TaskClassID !== 'TC008') {
        baseRow.splice(4, 0, users.find(u => u.UserID === t.ReviewerID)?.Name || '-');
        baseRow.splice(5, 0, users.find(u => u.UserID === t.ReviewerID2)?.Name || '-');
      }

      return baseRow;
    });

    // 创建CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // 添加UTF-8 BOM标记，确保Excel正确识别中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${activeTaskClass?.code || 'all'}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Logic for Auto Naming
  useEffect(() => {
    if (isModalOpen && !editingTask) {
      // If it's a new task, try to auto-generate name
      const proj = projects.find(p => p.id === formData.ProjectID);
      const projName = proj ? proj.name : '';
      const category = formData.Category || '';
      if (activeTaskClass?.code !== 'MEETING_TRAINING') { // Meeting usually custom name
        setFormData(prev => ({
           ...prev,
           TaskName: projName && category ? `${projName}-${category}` : prev.TaskName
        }));
      }
    }
  }, [formData.ProjectID, formData.Category, isModalOpen, projects, activeTaskClass, editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskToSave: Task = {
      ...(editingTask || {}),
      ...formData as Task,
      TaskID: editingTask?.TaskID || dataService.generateId('TSK'),
      CreatedDate: editingTask?.CreatedDate || new Date().toISOString().split('T')[0],
      CreatedBy: editingTask?.CreatedBy || currentUser.UserID
    };
    dataService.saveTask(taskToSave);
    setIsModalOpen(false);
    onRefresh();
  };

  const openModal = (task?: Task) => {
    setEditingTask(task || null);
    const defaultCategory = activeTaskClass ? CATEGORY_CONFIG[activeTaskClass.code]?.[0] || '' : '';
    setFormData(task || {
      TaskClassID: activeTaskClassId,
      Category: defaultCategory,
      Status: TaskStatus.NOT_STARTED
    });
    setIsModalOpen(true);
  };

  // Dynamic Form Field Renderer
  const renderDynamicFields = () => {
    if (!activeTaskClass) return null;

    const isMeeting = activeTaskClass.code === 'MEETING_TRAINING';
    const isTravel = activeTaskClass.code === 'TRAVEL';
    const isProjectRelated = ['MARKET', 'EXECUTION', 'PRODUCT_DEV', 'RESEARCH', 'RENOVATION'].includes(activeTaskClass.code);

    return (
      <>
        {/* 第一行：分类 + 关联项目 + 容量等级（市场配合任务） */}
        <div className="grid grid-cols-3 gap-4 col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 分类</label>
            <select required className="w-full border rounded p-2"
              value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})}>
              {CATEGORY_CONFIG[activeTaskClass.code]?.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {isProjectRelated && (
            <div>
              <label className="block text-sm font-medium mb-1">关联项目</label>
              <select className="w-full border rounded p-2"
                 value={formData.ProjectID || ''}
                 onChange={e => setFormData({...formData, ProjectID: e.target.value})}>
                 <option value="">选择项目...</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {activeTaskClass.code === 'MARKET' && (
            <div>
              <label className="block text-sm font-medium mb-1">容量等级</label>
              <select className="w-full border rounded p-2"
                value={formData.CapacityLevel || ''} onChange={e => setFormData({...formData, CapacityLevel: e.target.value})}>
                <option value="">请选择容量等级...</option>
                {CAPACITY_LEVEL_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* 第二行：负责人（差旅任务只显示负责人，其他任务显示负责人、校核人、审查人） */}
        {isTravel ? (
          // 差旅任务只显示负责人
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">负责人</label>
            <select className="w-full border rounded p-2"
               value={formData.AssigneeID || ''} onChange={e => setFormData({...formData, AssigneeID: e.target.value})}>
               <option value="">请选择...</option>
               {users.filter(u => u.Status !== '离岗').map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
            </select>
          </div>
        ) : (
          // 其他任务显示负责人、校核人、审查人
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">负责人</label>
                <select className="w-full border rounded p-2"
                   value={formData.AssigneeID || ''} onChange={e => setFormData({...formData, AssigneeID: e.target.value})}>
                   <option value="">请选择...</option>
                   {users.filter(u => u.Status !== '离岗').map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">校核人</label>
                <select className="w-full border rounded p-2"
                   value={formData.ReviewerID || ''} onChange={e => setFormData({...formData, ReviewerID: e.target.value})}>
                   <option value="">请选择...</option>
                   {users.filter(u => u.Status !== '离岗').map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">审查人</label>
                <select className="w-full border rounded p-2"
                   value={formData.ReviewerID2 || ''} onChange={e => setFormData({...formData, ReviewerID2: e.target.value})}>
                   <option value="">请选择...</option>
                   {users.filter(u => u.Status !== '离岗').map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 第三行：任务状态 + 预估工时 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">任务状态</label>
          <select className="w-full border rounded p-2"
             value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value as TaskStatus})}>
             {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-span-1">
           <label className="block text-sm font-medium mb-1">{isMeeting ? '时长(小时)' : '预估工时(人天)'}</label>
           <input type="number" step="0.5" className="w-full border rounded p-2"
              value={formData.Workload || ''} onChange={e => setFormData({...formData, Workload: parseFloat(e.target.value)})} />
        </div>

        {/* 第四行：任务开始日期 + 截止日期 + 其他字段 */}
        <div className="grid grid-cols-2 gap-4 col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1">任务开始日期</label>
            <input type="date" className="w-full border rounded p-2"
              value={formData.StartDate || ''} onChange={e => setFormData({...formData, StartDate: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">截止日期</label>
            <input type="date" className="w-full border rounded p-2"
              value={formData.DueDate || ''} onChange={e => setFormData({...formData, DueDate: e.target.value})} />
          </div>
        </div>

        {/* 差旅任务的特殊字段 */}
        {isTravel && (
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 出差地点</label>
            <input required type="text" className="w-full border rounded p-2"
              value={formData.TravelLocation || ''} onChange={e => setFormData({...formData, TravelLocation: e.target.value})} />
          </div>
        )}

        {/* 差旅任务的出差时长（如果需要的话） */}
        {isTravel && (
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">出差时长(天)</label>
            <input type="number" step="0.5" className="w-full border rounded p-2"
              value={formData.TravelDuration || ''} onChange={e => setFormData({...formData, TravelDuration: parseFloat(e.target.value)})} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 px-2">任务分类</h3>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {taskClasses.map(taskClass => (
            <button
              key={taskClass.id}
              onClick={() => setActiveTaskClassId(taskClass.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTaskClassId === taskClass.id
                  ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-md font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                {tasks.filter(t => t.TaskClassID === taskClass.id).length}
              </span>
              {taskClass.name}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800">
          <p><strong>注意：</strong> 任务名称请尽量遵循 "[项目名]-[任务类别]" 的格式。差旅和会议任务请务必填写时长以便统计。</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">任务管理</h2>
            <p className="text-sm text-slate-500 mt-1">
              当前分类: <span className="font-medium text-blue-600">{activeTaskClass?.name || '请选择任务类'}</span>
              <span className="ml-3">共 {filteredTasks.length} 个任务</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Plus size={16} /> 创建任务
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50">
              <Download size={16} /> 导出
            </button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-3"><Filter size={16}/> 筛选条件:</div>

          {/* 第一行：任务名称搜索 + 清空筛选按钮 */}
          <div className="flex gap-4 items-end mb-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-600 mb-1">任务名称</label>
              <input
                type="text"
                placeholder="输入任务名称关键词..."
                className="w-full border rounded px-3 py-2 text-sm"
                value={filterTaskName}
                onChange={e => setFilterTaskName(e.target.value)}
              />
            </div>
            <div className="min-w-[120px]">
              <label className="invisible block text-xs text-slate-600 mb-1">操作</label>
              <button
                onClick={() => {
                  setFilterProject('');
                  setFilterStatus('');
                  setFilterCategory('');
                  setFilterAssignee('');
                  setFilterCapacityLevel('');
                  setFilterStartDateFrom('');
                  setFilterStartDateTo('');
                  setFilterTaskName('');
                  setFilterThisWeek(false);
                  setFilterThisMonth(false);
                  // 重新设置近两个月的默认筛选
                  const now = new Date();
                  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
                  setFilterStartDateFrom(twoMonthsAgo.toISOString().split('T')[0]);
                }}
                className="w-full text-sm text-slate-600 hover:text-slate-900 px-3 py-2 border rounded hover:bg-slate-50"
              >
                清空筛选
              </button>
            </div>
          </div>

          {/* 第二行：其他筛选条件 */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">分类</label>
              <select className="w-full border rounded px-2 py-2 text-sm" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="">所有分类</option>
                {activeTaskClass && CATEGORY_CONFIG[activeTaskClass.code]?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">容量等级</label>
              <select className="w-full border rounded px-2 py-2 text-sm" value={filterCapacityLevel} onChange={e => setFilterCapacityLevel(e.target.value)}>
                <option value="">所有容量等级</option>
                {CAPACITY_LEVEL_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">状态</label>
              <select className="w-full border rounded px-2 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">所有状态</option>
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">负责人</label>
              <select className="w-full border rounded px-2 py-2 text-sm" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
                <option value="">所有负责人</option>
                {users.filter(u => u.Status !== '离岗').map(u => <option key={u.UserID} value={u.UserID}>{u.Name}</option>)}
              </select>
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">开始日期(从)</label>
              <input type="date" className="w-full border rounded px-2 py-2 text-sm" value={filterStartDateFrom} onChange={e => setFilterStartDateFrom(e.target.value)} />
            </div>
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">开始日期(到)</label>
              <input type="date" className="w-full border rounded px-2 py-2 text-sm" value={filterStartDateTo} onChange={e => setFilterStartDateTo(e.target.value)} />
            </div>
            <div className="min-w-[130px] flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={filterThisWeek} onChange={e => {
                  setFilterThisWeek(e.target.checked);
                  if (e.target.checked) setFilterThisMonth(false);
                }} />
                <span className="text-slate-700">本周任务</span>
              </label>
            </div>
            <div className="min-w-[130px] flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={filterThisMonth} onChange={e => {
                  setFilterThisMonth(e.target.checked);
                  if (e.target.checked) setFilterThisWeek(false);
                }} />
                <span className="text-slate-700">本月任务</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b sticky top-0">
              <tr>
                <th className="px-6 py-4">任务名称</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4">容量等级</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">负责人</th>
                {/* 差旅任务不显示校核人列 */}
                {filteredTasks.length > 0 && filteredTasks[0].TaskClassID !== 'TC008' && (
                  <th className="px-6 py-4">校核人</th>
                )}
                <th className="px-6 py-4">开始日</th>
                <th className="px-6 py-4">截止日</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(t => (
                <tr key={t.TaskID} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{t.TaskName}</div>
                    <div className="text-xs text-slate-400">{t.TaskID}</div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.Category}</span></td>
                  <td className="px-6 py-4">{t.CapacityLevel || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.Status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                      t.Status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{users.find(u => u.UserID === t.AssigneeID)?.Name || '-'}</td>
                  {/* 差旅任务不显示校核人列 */}
                  {t.TaskClassID !== 'TC008' && (
                    <td className="px-6 py-4">{users.find(u => u.UserID === t.ReviewerID)?.Name || '-'}</td>
                  )}
                  <td className="px-6 py-4 text-slate-500">{t.StartDate || '-'}</td>
                  <td className="px-6 py-4 text-slate-500">{t.DueDate || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('删除任务?')) { dataService.deleteTask(t.TaskID); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">该分类下暂无任务</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative">
            <h3 className="text-xl font-bold mb-4">{editingTask ? '编辑任务' : `创建 ${activeTaskClass?.name || '任务'}`}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 任务名称</label>
                <input required type="text" className="w-full border rounded p-2 bg-slate-50"
                  value={formData.TaskName} onChange={e => setFormData({...formData, TaskName: e.target.value})} />
              </div>

              {renderDynamicFields()}

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea className="w-full border rounded p-2 h-20"
                  value={formData.Remark || ''} onChange={e => setFormData({...formData, Remark: e.target.value})} />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">保存任务</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
