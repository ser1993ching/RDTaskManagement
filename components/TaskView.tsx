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

// 自动完成输入框组件
interface AutocompleteProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean; // 是否允许输入自定义值
  id?: string; // 唯一标识符，用于隔离状态
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
  value,
  options,
  onChange,
  onSelect,
  placeholder,
  className,
  allowCustom = true,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // 当外部 value 变化时更新内部值
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleSelect = (option: string) => {
    setInternalValue(option);
    onChange(option);
    onSelect?.(option);
    setIsOpen(false);
  };

  const handleFocus = () => {
    // 聚焦时直接打开下拉框
    setIsOpen(true);
  };

  const handleBlur = () => {
    // 延迟关闭，允许点击下拉选项
    setTimeout(() => setIsOpen(false), 200);
  };

  // 获取过滤后的选项
  const getFilteredOptions = () => {
    if (!internalValue.trim()) {
      return options;
    }
    return options.filter(opt =>
      opt.toLowerCase().includes(internalValue.toLowerCase())
    );
  };

  const filteredOptions = getFilteredOptions();

  return (
    <div className="relative">
      <input
        type="text"
        className={className}
        value={internalValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto">
          {filteredOptions.map((option, index) => (
            <div
              key={`${id}-${index}`}
              className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskView: React.FC<TaskViewProps> = ({ currentUser, tasks, projects, users, onRefresh }) => {
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>(dataService.getTaskClasses());
  const [activeTaskClassId, setActiveTaskClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

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

  // Initialize default filter - no time filter by default
  useEffect(() => {
    // Don't set any default time filter
  }, []);

  // Helper function to get filtered tasks for sidebar count (consistent with main content)
  const getSidebarTaskCount = (taskClassId: string) => {
    // No time filter - show all tasks
    return tasks.filter(t => t.TaskClassID === taskClassId).length;
  };

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
      // 获取负责人姓名（优先使用AssigneeName，其次使用用户表中的姓名）
      const assigneeName = t.AssigneeName || users.find(u => u.UserID === t.AssigneeID)?.Name || '-';
      const reviewerName = t.ReviewerName || users.find(u => u.UserID === t.ReviewerID)?.Name || '-';
      const reviewer2Name = t.Reviewer2Name || users.find(u => u.UserID === t.ReviewerID2)?.Name || '-';

      const baseRow = [
        t.TaskID,
        t.TaskName,
        t.Status,
        assigneeName,
        t.CapacityLevel || '-',
        t.DueDate || ''
      ];

      // 如果不是差旅任务，添加校核人和审查人
      if (t.TaskClassID !== 'TC008') {
        baseRow.splice(4, 0, reviewerName);
        baseRow.splice(5, 0, reviewer2Name);
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

  // Logic for Auto Naming and Project Matching
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

  // Auto-match project based on task name
  useEffect(() => {
    if (isModalOpen && formData.TaskName && formData.TaskName.includes('项目')) {
      const projectNames = projects.map(p => p.name);
      const matchedProject = projectNames.find(name => formData.TaskName?.includes(name));
      if (matchedProject) {
        const project = projects.find(p => p.name === matchedProject);
        if (project && formData.ProjectID !== project.id) {
          setFormData(prev => ({ ...prev, ProjectID: project.id }));
        }
      }
    }
  }, [formData.TaskName, isModalOpen, projects]);

  // Handle new project creation
  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;

    // Check if project already exists
    const existingProject = projects.find(p => p.name === newProjectName);
    if (existingProject) {
      alert('项目已存在！');
      return;
    }

    // Determine project category based on task class
    let category = ProjectCategory.OTHER;
    if (activeTaskClass) {
      switch (activeTaskClass.code) {
        case 'MARKET':
          category = ProjectCategory.MARKET;
          break;
        case 'EXECUTION':
          category = ProjectCategory.EXECUTION;
          break;
        case 'PRODUCT_DEV':
        case 'RESEARCH':
          category = ProjectCategory.RESEARCH;
          break;
        case 'RENOVATION':
          category = ProjectCategory.RENOVATION;
          break;
      }
    }

    const newProject: Project = {
      id: dataService.generateId('PROJ'),
      name: newProjectName,
      category,
      startDate: new Date().toISOString().split('T')[0]
    };

    dataService.saveProject(newProject);
    setFormData(prev => ({ ...prev, ProjectID: newProject.id }));
    setIsCreatingProject(false);
    setNewProjectName('');
    onRefresh(); // Refresh projects list
  };

  // Handle project name input and confirm
  const handleProjectNameConfirm = () => {
    if (newProjectName.trim()) {
      // Show confirmation dialog
      setIsCreatingProject(true);
    }
  };

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
    const taskData = task || {
      TaskClassID: activeTaskClassId,
      Category: defaultCategory,
      Status: TaskStatus.NOT_STARTED
    };
    // 如果是编辑模式，设置人员姓名字段
    if (task && task.AssigneeID) {
      const assignee = users.find(u => u.UserID === task.AssigneeID);
      if (assignee) {
        taskData.AssigneeName = assignee.Name;
      }
    }
    if (task && task.ReviewerID) {
      const reviewer = users.find(u => u.UserID === task.ReviewerID);
      if (reviewer) {
        taskData.ReviewerName = reviewer.Name;
      }
    }
    if (task && task.ReviewerID2) {
      const reviewer2 = users.find(u => u.UserID === task.ReviewerID2);
      if (reviewer2) {
        taskData.Reviewer2Name = reviewer2.Name;
      }
    }
    setFormData(taskData);
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
        <div className="grid grid-cols-3 gap-3 col-span-2">
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
              <AutocompleteInput
                id="project-autocomplete"
                value={projects.find(p => p.id === formData.ProjectID)?.name || ''}
                options={projects.map(p => p.name)}
                onChange={(value) => {
                  const project = projects.find(p => p.name === value);
                  setFormData({...formData, ProjectID: project?.id || ''});
                  // If input doesn't match any existing project, show create option
                  if (value.trim() && !project) {
                    setNewProjectName(value.trim());
                    setIsCreatingProject(true);
                  }
                }}
                onSelect={(value) => {
                  const project = projects.find(p => p.name === value);
                  if (project) {
                    setFormData({...formData, ProjectID: project.id});
                  }
                }}
                placeholder="搜索或输入项目名称..."
                className="w-full border rounded p-2"
              />
              {/* 新建项目按钮 */}
              <button
                type="button"
                onClick={() => {
                  setNewProjectName('');
                  setIsCreatingProject(true);
                }}
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              >
                + 新建项目
              </button>
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
          <div className="col-span-2">
            <div className="max-w-xs">
              <label className="block text-sm font-medium mb-1">负责人</label>
              <AutocompleteInput
                id="assignee-autocomplete"
                value={users.find(u => u.UserID === formData.AssigneeID)?.Name || formData.AssigneeName || ''}
                options={users.filter(u => u.Status !== '离岗').map(u => u.Name)}
                onChange={(value) => {
                  const user = users.find(u => u.Name === value && u.Status !== '离岗');
                  if (user) {
                    setFormData({...formData, AssigneeID: user.UserID, AssigneeName: user.Name});
                  } else {
                    setFormData({...formData, AssigneeID: '', AssigneeName: value});
                  }
                }}
                onSelect={(value) => {
                  const user = users.find(u => u.Name === value && u.Status !== '离岗');
                  if (user) {
                    setFormData({...formData, AssigneeID: user.UserID, AssigneeName: user.Name});
                  }
                }}
                placeholder="搜索或输入负责人姓名..."
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        ) : (
          // 其他任务显示负责人、校核人、审查人
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">负责人</label>
                <AutocompleteInput
                  id="assignee-autocomplete"
                  value={users.find(u => u.UserID === formData.AssigneeID)?.Name || formData.AssigneeName || ''}
                  options={users.filter(u => u.Status !== '离岗').map(u => u.Name)}
                  onChange={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, AssigneeID: user.UserID, AssigneeName: user.Name});
                    } else {
                      setFormData({...formData, AssigneeID: '', AssigneeName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, AssigneeID: user.UserID, AssigneeName: user.Name});
                    }
                  }}
                  placeholder="搜索或输入负责人姓名..."
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">校核人</label>
                <AutocompleteInput
                  id="reviewer-autocomplete"
                  value={users.find(u => u.UserID === formData.ReviewerID)?.Name || formData.ReviewerName || ''}
                  options={users.filter(u => u.Status !== '离岗').map(u => u.Name)}
                  onChange={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, ReviewerID: user.UserID, ReviewerName: user.Name});
                    } else {
                      setFormData({...formData, ReviewerID: '', ReviewerName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, ReviewerID: user.UserID, ReviewerName: user.Name});
                    }
                  }}
                  placeholder="搜索或输入校核人姓名..."
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">审查人</label>
                <AutocompleteInput
                  id="reviewer2-autocomplete"
                  value={users.find(u => u.UserID === formData.ReviewerID2)?.Name || formData.Reviewer2Name || ''}
                  options={users.filter(u => u.Status !== '离岗').map(u => u.Name)}
                  onChange={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, ReviewerID2: user.UserID, Reviewer2Name: user.Name});
                    } else {
                      setFormData({...formData, ReviewerID2: '', Reviewer2Name: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.Name === value && u.Status !== '离岗');
                    if (user) {
                      setFormData({...formData, ReviewerID2: user.UserID, Reviewer2Name: user.Name});
                    }
                  }}
                  placeholder="搜索或输入审查人姓名..."
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* 第四行：任务状态 + 任务开始日期 + 截止日期 */}
        <div className="grid grid-cols-3 gap-3 col-span-2">
          <div>
            <label className="block text-sm font-medium mb-1">任务状态</label>
            <select className="w-full border rounded p-2"
               value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value as TaskStatus})}>
               {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
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

        {/* 第五行：负责人工时 + 校核人工时 + 审查人工时（仅班组长/管理员可见） */}
        {(currentUser?.SystemRole === '管理员' || currentUser?.SystemRole === '班组长') && (
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">负责人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.Workload || ''} onChange={e => setFormData({...formData, Workload: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">校核人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.ReviewerWorkload || ''} onChange={e => setFormData({...formData, ReviewerWorkload: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">审查人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.Reviewer2Workload || ''} onChange={e => setFormData({...formData, Reviewer2Workload: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        )}

        {/* 差旅任务的特殊字段 */}
        {isTravel && (
          <>
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 出差地点</label>
                  <input required type="text" className="w-full border rounded p-2"
                    value={formData.TravelLocation || ''} onChange={e => setFormData({...formData, TravelLocation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">出差时长(天)</label>
                  <input type="number" step="0.5" className="w-full border rounded p-2"
                    value={formData.TravelDuration || ''} onChange={e => setFormData({...formData, TravelDuration: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
          </>
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
              className={`nav-button w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-0 ${
                activeTaskClassId === taskClass.id
                  ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-md font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                {getSidebarTaskCount(taskClass.id)}
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
            <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none">
              <Plus size={16} /> 创建任务
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 focus:outline-none">
              <Download size={16} /> 导出
            </button>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-3"><Filter size={16}/> 筛选条件:</div>

          {/* 第一行：任务名称搜索 */}
          <div className="mb-3">
            <label className="block text-xs text-slate-600 mb-1">任务名称</label>
            <input
              type="text"
              placeholder="输入任务名称关键词..."
              className="w-full border rounded px-3 py-2 text-sm"
              value={filterTaskName}
              onChange={e => setFilterTaskName(e.target.value)}
            />
          </div>

          {/* 第二行：清空筛选 + 其他筛选条件 */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[130px]">
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
                  // No default time filter
                }}
                className="w-full text-sm text-slate-700 hover:text-slate-900 px-2 py-2 border border-slate-300 rounded hover:bg-slate-50 transition-colors focus:outline-none focus:ring-0"
              >
                清空筛选
              </button>
            </div>
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
                  <td className="px-6 py-4">
                    {users.find(u => u.UserID === t.AssigneeID)?.Name || t.AssigneeName || '-'}
                  </td>
                  {/* 差旅任务不显示校核人列 */}
                  {t.TaskClassID !== 'TC008' && (
                    <td className="px-6 py-4">
                      {users.find(u => u.UserID === t.ReviewerID)?.Name || t.ReviewerName || '-'}
                    </td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h3 className="text-xl font-bold mb-4">{editingTask ? '编辑任务' : `创建 ${activeTaskClass?.name || '任务'}`}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 任务名称</label>
                <input required type="text" className="w-full border rounded p-2 bg-slate-50"
                  value={formData.TaskName} onChange={e => setFormData({...formData, TaskName: e.target.value})} />
              </div>

              {renderDynamicFields()}

              <div className="col-span-2 h-3"></div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea className="w-full border rounded p-2 h-20"
                  value={formData.Remark || ''} onChange={e => setFormData({...formData, Remark: e.target.value})} />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">保存任务</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 项目创建输入对话框（新建项目按钮被点击后显示） */}
      {isCreatingProject && !newProjectName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">输入新项目名称</h3>
            <input
              type="text"
              className="w-full border rounded p-2 mb-4"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleProjectNameConfirm()}
              placeholder="请输入项目名称..."
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProject(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleProjectNameConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                disabled={!newProjectName.trim()}
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建项目确认对话框 */}
      {isCreatingProject && newProjectName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">创建新项目</h3>
            <p className="text-sm text-slate-600 mb-4">
              项目名称：<strong>{newProjectName}</strong>
            </p>
            <p className="text-sm text-slate-600 mb-4">
              将根据当前任务类型自动设置项目类别为：<strong>
                {activeTaskClass?.code === 'MARKET' ? '市场配合项目' :
                 activeTaskClass?.code === 'EXECUTION' ? '项目执行' :
                 activeTaskClass?.code === 'PRODUCT_DEV' || activeTaskClass?.code === 'RESEARCH' ? '科研项目' :
                 activeTaskClass?.code === 'RENOVATION' ? '改造项目' : '其他项目'}
              </strong>
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingProject(false);
                  setNewProjectName('');
                }}
                className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
