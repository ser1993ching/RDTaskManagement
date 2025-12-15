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

  const activeTaskClass = taskClasses.find(tc => tc.id === activeTaskClassId);

  const filteredTasks = tasks.filter(t => {
    return t.TaskClassID === activeTaskClassId &&
      (filterProject ? t.ProjectID === filterProject : true) &&
      (filterStatus ? t.Status === filterStatus : true);
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
        {/* 第一行：分类 + 关联项目 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">分类 *</label>
          <select required className="w-full border rounded p-2"
            value={formData.Category} onChange={e => setFormData({...formData, Category: e.target.value})}>
            {CATEGORY_CONFIG[activeTaskClass.code]?.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {isProjectRelated && (
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">关联项目</label>
            <select className="w-full border rounded p-2"
               value={formData.ProjectID || ''}
               onChange={e => setFormData({...formData, ProjectID: e.target.value})}>
               <option value="">选择项目...</option>
               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}

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

        {/* 第四行：截止日期 + 容量等级（仅市场配合任务）/其他字段 */}
        <div className="col-span-1">
           <label className="block text-sm font-medium mb-1">截止日期</label>
           <input type="date" className="w-full border rounded p-2"
             value={formData.DueDate || ''} onChange={e => setFormData({...formData, DueDate: e.target.value})} />
        </div>

        {/* 市场配合任务特有的容量等级字段，或差旅任务的字段 */}
        {activeTaskClass.code === 'MARKET' ? (
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">容量等级</label>
            <select className="w-full border rounded p-2"
              value={formData.CapacityLevel || ''} onChange={e => setFormData({...formData, CapacityLevel: e.target.value})}>
              <option value="">请选择容量等级...</option>
              {CAPACITY_LEVEL_OPTIONS.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        ) : isTravel ? (
          <>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">出差地点 *</label>
              <input required type="text" className="w-full border rounded p-2"
                value={formData.TravelLocation || ''} onChange={e => setFormData({...formData, TravelLocation: e.target.value})} />
            </div>
          </>
        ) : (
          <div></div>
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

        <div className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Filter size={16}/> 筛选:</div>
          <select className="border rounded px-2 py-1 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">所有状态</option>
            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border rounded px-2 py-1 text-sm max-w-xs" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option value="">所有项目</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b sticky top-0">
              <tr>
                <th className="px-6 py-4">任务名称</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">负责人</th>
                {/* 差旅任务不显示校核人和审查人列 */}
                {filteredTasks.length > 0 && filteredTasks[0].TaskClassID !== 'TC008' && (
                  <>
                    <th className="px-6 py-4">校核人</th>
                    <th className="px-6 py-4">审查人</th>
                  </>
                )}
                <th className="px-6 py-4">容量等级</th>
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
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.Status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                      t.Status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{users.find(u => u.UserID === t.AssigneeID)?.Name || '-'}</td>
                  {/* 差旅任务不显示校核人和审查人列 */}
                  {t.TaskClassID !== 'TC008' && (
                    <>
                      <td className="px-6 py-4">{users.find(u => u.UserID === t.ReviewerID)?.Name || '-'}</td>
                      <td className="px-6 py-4">{users.find(u => u.UserID === t.ReviewerID2)?.Name || '-'}</td>
                    </>
                  )}
                  <td className="px-6 py-4">{t.CapacityLevel || '-'}</td>
                  <td className="px-6 py-4 text-slate-500">{t.DueDate || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                    <button onClick={() => { if(confirm('删除任务?')) { dataService.deleteTask(t.TaskID); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr><td colSpan={filteredTasks.length > 0 && filteredTasks[0].TaskClassID !== 'TC008' ? 9 : 7} className="px-6 py-12 text-center text-slate-400">该分类下暂无任务</td></tr>
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
                <label className="block text-sm font-medium mb-1">任务名称 *</label>
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
