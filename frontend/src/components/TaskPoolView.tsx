import React, { useState, useEffect } from 'react';
import { TaskPoolItem, TaskClass, User, Project, Task, TaskStatus, ProjectCategory } from '../types';
import { Plus, Edit2, Trash2, User as UserIcon, Calendar, X, CheckCircle, FolderOpen, Copy } from 'lucide-react';
import { dataService } from '../services/dataService';
import AutocompleteInput from './AutocompleteInput';

interface TaskPoolViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onRefresh: () => void;
}

// Task class IDs allowed for pool creation (excluding MEETING_TRAINING and TRAVEL)
const ALLOWED_TASK_CLASS_IDS = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC008', 'TC010'];

export const TaskPoolView: React.FC<TaskPoolViewProps> = ({ currentUser, projects, users, onRefresh }) => {
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]);
  const [taskCategories, setTaskCategories] = useState<Record<string, string[]>>({});
  const [poolItems, setPoolItems] = useState<TaskPoolItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskPoolItem | null>(null);
  const [assigningItem, setAssigningItem] = useState<TaskPoolItem | null>(null);
  const [formData, setFormData] = useState<Partial<TaskPoolItem>>({});
  const [assignFormData, setAssignFormData] = useState<Partial<Task>>({});
  const [originalPoolTaskName, setOriginalPoolTaskName] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Show toast notification
  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast({ message: '', visible: false });
    }, 2000);
  };

  // Load task classes on mount
  useEffect(() => {
    const classes = dataService.getTaskClasses().filter(tc => ALLOWED_TASK_CLASS_IDS.includes(tc.id));
    setTaskClasses(classes);
    setTaskCategories(dataService.getTaskCategories());
    loadPoolItems();
  }, []);

  // Load pool items (sorted by CreatedDate descending - newest first)
  const loadPoolItems = () => {
    const items = [...dataService.getTaskPoolItems()];
    items.sort((a, b) =>
      new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime()
    );
    setPoolItems(items);
  };

  const activeTaskClass = taskClasses.find(tc => tc.id === formData.TaskClassID);

  // Get categories for selected task class
  const getCategoriesForTaskClass = (taskClassCode: string): string[] => {
    const codeMap: Record<string, string> = {
      'TC001': 'MARKET',
      'TC002': 'EXECUTION',
      'TC003': 'NUCLEAR',
      'TC004': 'PRODUCT_DEV',
      'TC005': 'RESEARCH',
      'TC006': 'RENOVATION',
      'TC008': 'ADMIN_PARTY',
      'TC010': 'OTHER'
    };
    const categoryCode = codeMap[taskClassCode];
    return categoryCode ? (taskCategories[categoryCode] || []) : [];
  };

  // Get projects for task class
  const getProjectsForTaskClass = (taskClassCode: string): Project[] => {
    const codeMap: Record<string, string> = {
      'TC001': 'MARKET',
      'TC002': 'EXECUTION',
      'TC003': 'NUCLEAR',
      'TC004': 'EXECUTION', // Product dev can use execution projects
      'TC005': 'RESEARCH',
      'TC006': 'RENOVATION',
      'TC008': 'OTHER',
      'TC010': 'OTHER'
    };
    const categoryCode = codeMap[taskClassCode];
    if (!categoryCode) return [];

    const categoryMap: Record<string, string> = {
      'MARKET': '市场配合项目',
      'EXECUTION': '常规项目',
      'NUCLEAR': '核电项目',
      'RESEARCH': '科研项目',
      'RENOVATION': '改造项目',
      'OTHER': '其他项目'
    };

    const category = categoryMap[categoryCode];
    return projects.filter(p => p.category === category);
  };

  // Filter projects based on task class
  const getFilteredProjects = (taskClassId: string): Project[] => {
    if (taskClassId === 'TC004') {
      // Product dev can use execution, nuclear, research, renovation projects
      return projects.filter(p =>
        p.category === '常规项目' ||
        p.category === '核电项目' ||
        p.category === '科研项目' ||
        p.category === '改造项目'
      );
    }
    return getProjectsForTaskClass(taskClassId);
  };

  // Get user name by ID
  const getUserName = (userId?: string): string => {
    if (!userId) return '';
    const user = users.find(u => u.UserID === userId);
    return user?.Name || '';
  };

  // Get project name by ID
  const getProjectName = (projectId?: string): string => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project?.name || '';
  };

  // Filter users (exclude admin and 离岗 users)
  const getAvailableUsers = () => {
    return users.filter(u => u.Status !== '离岗' && u.UserID !== 'admin');
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      TaskName: '',
      TaskClassID: taskClasses[0]?.id || '',
      Category: '',
      ProjectID: '',
      ProjectName: '',
      PersonInChargeID: '',
      PersonInChargeName: '',
      ReviewerID: '',
      ReviewerName: '',
      ReviewerID2: '',
      Reviewer2Name: '',
      StartDate: '',
      DueDate: '',
      isForceAssessment: false,
      Remark: ''
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: TaskPoolItem) => {
    setEditingItem(item);
    setFormData({
      ...item
    });
    setIsModalOpen(true);
  };

  // Open copy modal
  const handleOpenCopyModal = (item: TaskPoolItem) => {
    setEditingItem(null);
    setFormData({
      ...item,
      id: dataService.generateId('TP'),
      CreatedDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // Open assign modal
  const handleOpenAssignModal = (item: TaskPoolItem) => {
    setAssigningItem(item);
    setOriginalPoolTaskName(item.TaskName);
    setAssignFormData({
      TaskName: item.TaskName,
      TaskClassID: item.TaskClassID,
      Category: item.Category,
      ProjectID: item.ProjectID || '',
      ProjectName: item.ProjectName || '',
      AssigneeID: item.PersonInChargeID || '',
      AssigneeName: item.PersonInChargeName || '',
      ReviewerID: item.ReviewerID || '',
      ReviewerID2: item.ReviewerID2 || '',
      ReviewerName: item.ReviewerName || '',
      Reviewer2Name: item.Reviewer2Name || '',
      ReviewerWorkload: undefined,
      Reviewer2Workload: undefined,
      StartDate: item.StartDate || '',
      DueDate: item.DueDate || '',
      Workload: undefined,
      isForceAssessment: false,
      Remark: item.Remark || ''
    });
    setIsAssignModalOpen(true);
  };

  // Auto-generate task name in assignment modal
  useEffect(() => {
    if (isAssignModalOpen && assigningItem) {
      const proj = projects.find(p => p.id === assignFormData.ProjectID);
      const projName = proj ? proj.name : '';
      const category = assignFormData.Category || '';

      // 任务名称格式：[项目名]-[分类]-[原任务名称]
      if (projName && category) {
        const newTaskName = `${projName}-${category}-${originalPoolTaskName}`;
        setAssignFormData(prev => ({
          ...prev,
          TaskName: newTaskName
        }));
      }
    }
  }, [assignFormData.ProjectID, assignFormData.Category, isAssignModalOpen]);

  // Auto-generate task name based on project and category
  useEffect(() => {
    if (isModalOpen && formData.ProjectID && formData.Category) {
      const proj = projects.find(p => p.id === formData.ProjectID);
      const projName = proj ? proj.name : '';
      const category = formData.Category || '';

      if (projName && category) {
        setFormData(prev => ({
          ...prev,
          TaskName: `${projName}-${category}`
        }));
      }
    }
  }, [formData.ProjectID, formData.Category, isModalOpen, projects]);

  // Handle form submit (create/update)
  const handleSubmit = () => {
    if (!formData.TaskName || !formData.TaskClassID) {
      alert('请填写任务名称和任务类别');
      return;
    }

    const item: TaskPoolItem = {
      id: editingItem?.id || dataService.generateId('TP'),
      TaskName: formData.TaskName,
      TaskClassID: formData.TaskClassID,
      Category: formData.Category || '',
      ProjectID: formData.ProjectID,
      ProjectName: formData.ProjectID ? getProjectName(formData.ProjectID) : undefined,
      PersonInChargeID: formData.PersonInChargeID,
      PersonInChargeName: formData.PersonInChargeName,
      ReviewerID: formData.ReviewerID,
      ReviewerID2: formData.ReviewerID2,
      ReviewerName: formData.ReviewerName,
      Reviewer2Name: formData.Reviewer2Name,
      StartDate: formData.StartDate,
      DueDate: formData.DueDate,
      CreatedBy: editingItem?.CreatedBy || currentUser.UserID,
      CreatedByName: editingItem?.CreatedByName || currentUser.Name,
      CreatedDate: editingItem?.CreatedDate || new Date().toISOString().split('T')[0],
      isForceAssessment: formData.isForceAssessment || false,
      Remark: formData.Remark,
      is_deleted: false
    };

    dataService.saveTaskPoolItem(item);
    setIsModalOpen(false);
    loadPoolItems();
    onRefresh();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该任务计划吗？')) {
      dataService.deleteTaskPoolItem(id);
      loadPoolItems();
      onRefresh();
    }
  };

  // Handle assign
  const handleAssign = () => {
    if (!assigningItem) return;

    if (!assignFormData.AssigneeID && !assignFormData.AssigneeName) {
      alert('请选择负责人或输入负责人姓名');
      return;
    }

    if (!assignFormData.TaskName) {
      alert('请填写任务名称');
      return;
    }

    try {
      dataService.assignPoolItemToTask(assigningItem.id, assignFormData);
      setIsAssignModalOpen(false);
      loadPoolItems();
      onRefresh();
      // Show toast notification
      showToast('任务分配成功！');
    } catch (error) {
      showToast('分配任务失败：' + (error as Error).message);
    }
  };

  // Get task class name
  const getTaskClassName = (classId: string): string => {
    const tc = taskClasses.find(t => t.id === classId);
    return tc?.name || '';
  };

  // Filter state
  const [filters, setFilters] = useState({
    taskName: '',
    projectName: '',
    personInChargeName: '',
    createdByName: '',
    startDateFrom: '',
    startDateTo: '',
    isForceAssessment: '' as '' | boolean
  });

  // Filtered pool items
  const filteredPoolItems = poolItems.filter(item => {
    // Task name filter
    if (filters.taskName && !item.TaskName.toLowerCase().includes(filters.taskName.toLowerCase())) {
      return false;
    }
    // Project name filter
    if (filters.projectName && !item.ProjectName?.toLowerCase().includes(filters.projectName.toLowerCase())) {
      return false;
    }
    // Person in charge filter
    if (filters.personInChargeName && !item.PersonInChargeName?.toLowerCase().includes(filters.personInChargeName.toLowerCase())) {
      return false;
    }
    // Created by filter
    if (filters.createdByName && !item.CreatedByName?.toLowerCase().includes(filters.createdByName.toLowerCase())) {
      return false;
    }
    // Start date from filter
    if (filters.startDateFrom && item.StartDate && item.StartDate < filters.startDateFrom) {
      return false;
    }
    // Start date to filter
    if (filters.startDateTo && item.StartDate && item.StartDate > filters.startDateTo) {
      return false;
    }
    // Force assessment filter
    if (filters.isForceAssessment !== '' && item.isForceAssessment !== filters.isForceAssessment) {
      return false;
    }
    return true;
  });

  // Clear filters
  const clearFilters = () => {
    setFilters({
      taskName: '',
      projectName: '',
      personInChargeName: '',
      createdByName: '',
      startDateFrom: '',
      startDateTo: '',
      isForceAssessment: ''
    });
  };

  // Force assessment toggle for filter (matching TaskView style)
  const FilterForceAssessmentToggle = ({
    checked,
    onChange
  }: {
    checked: boolean | '';
    onChange: (checked: boolean | '') => void;
  }) => (
    <div className="flex items-end pb-2 flex-shrink-0">
      <label className="flex items-center gap-1 cursor-pointer">
        <input type="checkbox" className="hidden" checked={checked === true} onChange={e => {
          onChange(e.target.checked ? true : '');
        }} />
        <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${checked === true ? 'bg-blue-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked === true ? 'translate-x-6' : 'translate-x-0'}`}></span>
        </span>
        <span className="text-sm text-slate-700 whitespace-nowrap">强制考核</span>
      </label>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">任务库</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          共 {filteredPoolItems.length} 个任务计划
        </span>
        <div className="flex-1"></div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          新建任务计划
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow mb-4 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-80">
            <label className="block text-xs text-gray-500 mb-1">任务名称</label>
            <input
              type="text"
              value={filters.taskName}
              onChange={e => setFilters({ ...filters, taskName: e.target.value })}
              placeholder="搜索任务名称"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs text-gray-500 mb-1">关联项目</label>
            <input
              type="text"
              value={filters.projectName}
              onChange={e => setFilters({ ...filters, projectName: e.target.value })}
              placeholder="搜索项目"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">负责人</label>
            <input
              type="text"
              value={filters.personInChargeName}
              onChange={e => setFilters({ ...filters, personInChargeName: e.target.value })}
              placeholder="搜索负责人"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-500 mb-1">创建人</label>
            <input
              type="text"
              value={filters.createdByName}
              onChange={e => setFilters({ ...filters, createdByName: e.target.value })}
              placeholder="搜索创建人"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1">开始日期（从）</label>
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={e => setFilters({ ...filters, startDateFrom: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-36">
            <label className="block text-xs text-gray-500 mb-1">开始日期（到）</label>
            <input
              type="date"
              value={filters.startDateTo}
              onChange={e => setFilters({ ...filters, startDateTo: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <FilterForceAssessmentToggle
            checked={filters.isForceAssessment}
            onChange={(checked) => setFilters({ ...filters, isForceAssessment: checked })}
          />
          <button
            onClick={clearFilters}
            className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            重置
          </button>
        </div>
      </div>

      {/* Pool Items List */}
      {filteredPoolItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无任务计划</p>
          <p className="text-sm">点击上方按钮创建任务计划</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">任务名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">任务类别</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">关联项目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">负责人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">校核人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">开始时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">截止时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建人</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPoolItems
                .sort((a, b) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime())
                .map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {item.isForceAssessment && (
                      <span className="inline-block w-1 h-4 bg-red-500 mr-2 rounded"></span>
                    )}
                    {item.TaskName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {getTaskClassName(item.TaskClassID)} - {item.Category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.ProjectName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.PersonInChargeName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.ReviewerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.StartDate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.DueDate || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.CreatedByName || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAssignModal(item)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="分配任务"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenCopyModal(item)}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="复制"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingItem ? '编辑任务计划' : '新建任务计划'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Name and Force Assessment */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.TaskName || ''}
                    onChange={e => setFormData({ ...formData, TaskName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入任务名称"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.isForceAssessment || false}
                      onChange={e => setFormData({ ...formData, isForceAssessment: e.target.checked })}
                    />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isForceAssessment ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isForceAssessment ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm text-slate-700 whitespace-nowrap">强制考核</span>
                  </label>
                </div>
              </div>

              {/* Task Class, Category and Project */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务类别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.TaskClassID || ''}
                    onChange={e => {
                      const tcId = e.target.value;
                      setFormData({
                        ...formData,
                        TaskClassID: tcId,
                        Category: '',
                        ProjectID: '',
                        ProjectName: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taskClasses.map(tc => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">二级分类</label>
                  <select
                    value={formData.Category || ''}
                    onChange={e => setFormData({ ...formData, Category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCategoriesForTaskClass(formData.TaskClassID || '').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联项目</label>
                  <AutocompleteInput
                    id="pool-project-autocomplete"
                    value={formData.ProjectName || ''}
                    options={getFilteredProjects(formData.TaskClassID || '').map(p => p.name)}
                    onChange={(value) => {
                      const project = getFilteredProjects(formData.TaskClassID || '').find(p => p.name === value);
                      setFormData({
                        ...formData,
                        ProjectID: project?.id || '',
                        ProjectName: value
                      });
                    }}
                    onSelect={(value) => {
                      const project = getFilteredProjects(formData.TaskClassID || '').find(p => p.name === value);
                      if (project) {
                        setFormData({
                          ...formData,
                          ProjectID: project.id,
                          ProjectName: project.name
                        });
                      }
                    }}
                    placeholder="搜索或输入项目名称..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Person in Charge and Reviewers */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                  <AutocompleteInput
                    id="pool-person-in-charge-autocomplete"
                    value={formData.PersonInChargeName || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          PersonInChargeID: user.UserID,
                          PersonInChargeName: user.Name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          PersonInChargeID: '',
                          PersonInChargeName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          PersonInChargeID: user.UserID,
                          PersonInChargeName: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入负责人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人</label>
                  <AutocompleteInput
                    id="pool-reviewer-autocomplete"
                    value={formData.ReviewerName || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          ReviewerID: user.UserID,
                          ReviewerName: user.Name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          ReviewerID: '',
                          ReviewerName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          ReviewerID: user.UserID,
                          ReviewerName: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入校核人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人</label>
                  <AutocompleteInput
                    id="pool-reviewer2-autocomplete"
                    value={formData.Reviewer2Name || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          ReviewerID2: user.UserID,
                          Reviewer2Name: user.Name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          ReviewerID2: '',
                          Reviewer2Name: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          ReviewerID2: user.UserID,
                          Reviewer2Name: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入审查人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Start Date and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="date"
                    value={formData.StartDate || ''}
                    onChange={e => setFormData({ ...formData, StartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <input
                    type="date"
                    value={formData.DueDate || ''}
                    onChange={e => setFormData({ ...formData, DueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.Remark || ''}
                  onChange={e => setFormData({ ...formData, Remark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="请输入备注信息"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && assigningItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">分配任务</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="space-y-4">
              {/* Task Name and Force Assessment */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignFormData.TaskName || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, TaskName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入任务名称"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={assignFormData.isForceAssessment || false}
                      onChange={e => setAssignFormData({ ...assignFormData, isForceAssessment: e.target.checked })}
                    />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${assignFormData.isForceAssessment ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${assignFormData.isForceAssessment ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm text-slate-700 whitespace-nowrap">强制考核</span>
                  </label>
                </div>
              </div>

              {/* Task Class, Category and Project */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    任务类别 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignFormData.TaskClassID || ''}
                    onChange={e => {
                      const tcId = e.target.value;
                      setAssignFormData({
                        ...assignFormData,
                        TaskClassID: tcId,
                        Category: '',
                        ProjectID: '',
                        ProjectName: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    {taskClasses.map(tc => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    二级分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignFormData.Category || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, Category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCategoriesForTaskClass(assignFormData.TaskClassID || '').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    关联项目 <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    id="assign-project-autocomplete"
                    value={assignFormData.ProjectName || ''}
                  options={getFilteredProjects(assignFormData.TaskClassID || '').map(p => p.name)}
                  onChange={(value) => {
                    const project = getFilteredProjects(assignFormData.TaskClassID || '').find(p => p.name === value);
                    setAssignFormData({
                      ...assignFormData,
                      ProjectID: project?.id || '',
                      ProjectName: value
                    });
                  }}
                  onSelect={(value) => {
                    const project = getFilteredProjects(assignFormData.TaskClassID || '').find(p => p.name === value);
                    if (project) {
                      setAssignFormData({
                        ...assignFormData,
                        ProjectID: project.id,
                        ProjectName: project.name
                      });
                    }
                  }}
                  placeholder="搜索或输入项目名称..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                </div>
              </div>

              {/* Assignee and Reviewers */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    负责人 <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    id="assign-assignee-autocomplete"
                    value={assignFormData.AssigneeName || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          AssigneeID: user.UserID,
                          AssigneeName: user.Name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          AssigneeID: '',
                          AssigneeName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          AssigneeID: user.UserID,
                          AssigneeName: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入负责人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人</label>
                  <AutocompleteInput
                    id="assign-reviewer-autocomplete"
                    value={assignFormData.ReviewerName || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID: user.UserID,
                          ReviewerName: user.Name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID: '',
                          ReviewerName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID: user.UserID,
                          ReviewerName: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入校核人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人</label>
                  <AutocompleteInput
                    id="assign-reviewer2-autocomplete"
                    value={assignFormData.Reviewer2Name || ''}
                    options={getAvailableUsers().map(u => u.Name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID2: user.UserID,
                          Reviewer2Name: user.Name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID2: '',
                          Reviewer2Name: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.Name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          ReviewerID2: user.UserID,
                          Reviewer2Name: user.Name
                        });
                      }
                    }}
                    placeholder="搜索或输入审查人姓名..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Start Date and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="date"
                    value={assignFormData.StartDate || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, StartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <input
                    type="date"
                    value={assignFormData.DueDate || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, DueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Workload */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预估工作量（人天）</label>
                  <input
                    type="number"
                    value={assignFormData.Workload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, Workload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人工时</label>
                  <input
                    type="number"
                    value={assignFormData.ReviewerWorkload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, ReviewerWorkload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人工时</label>
                  <input
                    type="number"
                    value={assignFormData.Reviewer2Workload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, Reviewer2Workload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={assignFormData.Remark || ''}
                  onChange={e => setAssignFormData({ ...assignFormData, Remark: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  确认分配
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}
    </div>
  );
};
