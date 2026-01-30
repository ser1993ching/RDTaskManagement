import React, { useState, useEffect, useCallback } from 'react';
import { TaskPoolItem, TaskClass, User, Project, Task, TaskStatus, ProjectCategory } from '../types';
import { Plus, Edit2, Trash2, User as UserIcon, Calendar, X, CheckCircle, FolderOpen, Copy } from 'lucide-react';
import { apiDataService } from '../services/apiDataService';
import { cn } from '@/utils/classnames';
import { useTaskCategories, useTaskClasses } from '../context/ConfigContext';
import AutocompleteInput from './AutocompleteInput';

interface TaskPoolViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onRefresh: () => void;
}

// Task class IDs allowed for pool creation (excluding MEETING_TRAINING and TRAVEL)
const ALLOWED_TASK_CLASS_IDS = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC008', 'TC010'];

// Helper function to format date
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const TaskPoolView: React.FC<TaskPoolViewProps> = ({ currentUser, projects, users, onRefresh }) => {
  // 从全局配置获取数据
  const { taskCategories } = useTaskCategories();
  const { taskClasses: globalTaskClasses, refreshTaskClasses } = useTaskClasses();

  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]);
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
    const loadData = async () => {
      // 过滤允许的任务类别
      const filteredClasses = globalTaskClasses.filter((tc: any) => ALLOWED_TASK_CLASS_IDS.includes(tc.id));
      setTaskClasses(filteredClasses.map((tc: any) => ({
        id: tc.id,
        name: tc.name,
        code: tc.code,
        description: tc.description,
        notice: tc.notice,
        isDeleted: false,
      })));

      await loadPoolItems();
    };

    if (globalTaskClasses.length > 0) {
      loadData();
    }
  }, [globalTaskClasses]);

  // Load pool items (sorted by CreatedDate descending - newest first)
  const loadPoolItems = async () => {
    const items = await apiDataService.getTaskPoolItems();
    items.sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
    setPoolItems(items);
  };

  const activeTaskClass = taskClasses.find(tc => tc.id === formData.taskClassId);

  // Get categories for selected task class
  // 参考 TaskView.tsx 的实现，使用多种 key 格式匹配
  const getCategoriesForTaskClass = (taskClassCode: string): string[] => {
    // API返回的categories key是PascalCase格式: Market, Execution, ProductDev, etc.
    const codeMap: Record<string, string> = {
      'TC001': 'Market',
      'TC002': 'Execution',
      'TC003': 'Nuclear',
      'TC004': 'ProductDev',
      'TC005': 'Research',
      'TC006': 'Renovation',
      'TC008': 'AdminParty',
      'TC010': 'Other'
    };
    const categoryCode = codeMap[taskClassCode];
    if (!categoryCode) return [];

    // 尝试多种key格式匹配API返回的数据
    const keyVariants = [
      categoryCode,  // PascalCase (如 Market) - API返回的格式
      categoryCode.toLowerCase(),  // lowercase (如 market)
      categoryCode.toUpperCase(),  // UPPERCASE (如 MARKET)
    ];

    // 查找 API 数据
    for (const key of keyVariants) {
      if (taskCategories[key] && taskCategories[key].length > 0) {
        return taskCategories[key];
      }
    }

    return [];
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
    const user = users.find(u => u.userId === userId);
    return user?.name || '';
  };

  // Get project name by ID
  const getProjectName = (projectId?: string): string => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project?.name || '';
  };

  // Filter users (exclude admin and 离岗 users)
  const getAvailableUsers = () => {
    return users.filter(u => u.status !== '离岗' && u.userId !== 'admin');
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      taskName: '',
      taskClassId: taskClasses[0]?.id || '',
      category: '',
      projectId: '',
      projectName: '',
      personInChargeId: '',
      personInChargeName: '',
      reviewerId: '',
      reviewerName: '',
      reviewerId2: '',
      reviewer2Name: '',
      startDate: '',
      dueDate: '',
      isForceAssessment: false,
      remark: ''
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: TaskPoolItem) => {
    setEditingItem(item);
    setFormData({
      taskName: item.taskName,
      taskClassId: item.taskClassId,
      category: item.category || '',
      projectId: item.projectId || '',
      projectName: item.projectName || '',
      personInChargeId: item.personInChargeId || '',
      personInChargeName: item.personInChargeName || '',
      reviewerId: item.checkerId || '',
      reviewerName: item.checkerName || '',
      reviewerId2: item.chiefDesignerId || '',
      reviewer2Name: item.chiefDesignerName || '',
      startDate: item.startDate || '',
      dueDate: item.dueDate || '',
      isForceAssessment: item.isForceAssessment || false,
      remark: item.remark || ''
    });
    setIsModalOpen(true);
  };

  // Open copy modal
  const handleOpenCopyModal = (item: TaskPoolItem) => {
    setEditingItem(null);
    setFormData({
      taskName: item.taskName,
      taskClassId: item.taskClassId,
      category: item.category || '',
      projectId: item.projectId || '',
      projectName: item.projectName || '',
      personInChargeId: item.personInChargeId || '',
      personInChargeName: item.personInChargeName || '',
      reviewerId: item.checkerId || '',
      reviewerName: item.checkerName || '',
      reviewerId2: item.chiefDesignerId || '',
      reviewer2Name: item.chiefDesignerName || '',
      startDate: item.startDate || '',
      dueDate: item.dueDate || '',
      isForceAssessment: item.isForceAssessment || false,
      remark: item.remark || ''
    });
    setIsModalOpen(true);
  };

  // Open assign modal
  const handleOpenAssignModal = (item: TaskPoolItem) => {
    setAssigningItem(item);
    setOriginalPoolTaskName(item.taskName);
    setAssignFormData({
      taskName: item.taskName,
      taskClassId: item.taskClassId,
      category: item.category || '',
      projectId: item.projectId || '',
      projectName: item.projectName || '',
      assigneeId: item.personInChargeId || '',
      assigneeName: item.personInChargeName || '',
      reviewerId: item.checkerId || '',
      reviewerName: item.checkerName || '',
      approverId: item.chiefDesignerId || '',
      approverName: item.chiefDesignerName || '',
      reviewerWorkload: undefined,
      approverWorkload: undefined,
      startDate: item.startDate || '',
      dueDate: item.dueDate || '',
      workload: undefined,
      isForceAssessment: false,
      remark: item.remark || ''
    });
    setIsAssignModalOpen(true);
  };

  // Auto-generate task name in assignment modal
  useEffect(() => {
    if (isAssignModalOpen && assigningItem) {
      const proj = projects.find(p => p.id === assignFormData.projectId);
      const projName = proj ? proj.name : '';
      const category = assignFormData.category || '';

      // 任务名称格式：[项目名]-[分类]-[原任务名称]
      if (projName && category) {
        const newTaskName = `${projName}-${category}-${originalPoolTaskName}`;
        setAssignFormData(prev => ({
          ...prev,
          TaskName: newTaskName
        }));
      }
    }
  }, [assignFormData.projectId, assignFormData.category, isAssignModalOpen]);

  // Auto-generate task name based on project and category
  useEffect(() => {
    if (isModalOpen && formData.projectId && formData.category) {
      const proj = projects.find(p => p.id === formData.projectId);
      const projName = proj ? proj.name : '';
      const category = formData.category || '';

      if (projName && category) {
        setFormData(prev => ({
          ...prev,
          taskName: `${projName}-${category}`
        }));
      }
    }
  }, [formData.projectId, formData.category, isModalOpen, projects]);

  // Handle form submit (create/update)
  const handleSubmit = async () => {
    if (!formData.taskName || !formData.taskClassId) {
      alert('请填写任务名称和任务类别');
      return;
    }

    const item: any = {
      id: editingItem?.id || apiDataService.generateId('TP'),
      taskName: formData.taskName,
      taskClassId: formData.taskClassId,
      category: formData.category || '',
      projectId: formData.projectId,
      projectName: formData.projectId ? getProjectName(formData.projectId) : undefined,
      personInChargeId: formData.personInChargeId,
      personInChargeName: formData.personInChargeName,
      checkerId: formData.reviewerId,
      checkerName: formData.reviewerName,
      chiefDesignerId: formData.reviewerId2,
      chiefDesignerName: formData.reviewer2Name,
      // 修复：日期为空时发送null而不是空字符串
      startDate: formData.startDate && formData.startDate.trim() ? formData.startDate : null,
      dueDate: formData.dueDate && formData.dueDate.trim() ? formData.dueDate : null,
      createdBy: editingItem?.createdBy || currentUser.userId,
      createdByName: editingItem?.createdByName || currentUser.name,
      createdDate: editingItem?.createdDate || new Date().toISOString().split('T')[0],
      isForceAssessment: formData.isForceAssessment || false,
      remark: formData.remark,
    };

    if (editingItem?.id) {
      await apiDataService.updateTaskPoolItem(editingItem.id, item);
    } else {
      item.id = apiDataService.generateId('TP');
      await apiDataService.createTaskPoolItem(item);
    }

    setIsModalOpen(false);
    await loadPoolItems();
    onRefresh();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该任务计划吗？')) {
      await apiDataService.deleteTaskPoolItem(id);
      await loadPoolItems();
      onRefresh();
    }
  };

  // Handle assign
  const handleAssign = async () => {
    if (!assigningItem) return;

    if (!assignFormData.assigneeId && !assignFormData.assigneeName) {
      alert('请选择负责人或输入负责人姓名');
      return;
    }

    if (!assignFormData.taskName) {
      alert('请填写任务名称');
      return;
    }

    try {
      await apiDataService.assignPoolItemToTask(assigningItem.id, assignFormData);
      setIsAssignModalOpen(false);
      await loadPoolItems();
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
    if (filters.taskName && !item.taskName.toLowerCase().includes(filters.taskName.toLowerCase())) {
      return false;
    }
    // Project name filter
    if (filters.projectName && !item.projectName?.toLowerCase().includes(filters.projectName.toLowerCase())) {
      return false;
    }
    // Person in charge filter
    if (filters.personInChargeName && !item.personInChargeName?.toLowerCase().includes(filters.personInChargeName.toLowerCase())) {
      return false;
    }
    // Created by filter
    if (filters.createdByName && !item.createdByName?.toLowerCase().includes(filters.createdByName.toLowerCase())) {
      return false;
    }
    // Start date from filter
    if (filters.startDateFrom && item.startDate && item.startDate < filters.startDateFrom) {
      return false;
    }
    // Start date to filter
    if (filters.startDateTo && item.startDate && item.startDate > filters.startDateTo) {
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
        <span className={cn(
          'relative inline-block w-12 h-6 rounded-full transition-colors',
          checked === true ? 'bg-blue-600' : 'bg-slate-300'
        )}>
          <span className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked === true ? 'translate-x-6' : 'translate-x-0'
          )}></span>
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
                .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                .map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {item.isForceAssessment && (
                      <span className="inline-block w-1 h-4 bg-red-500 mr-2 rounded"></span>
                    )}
                    {item.taskName}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {getTaskClassName(item.taskClassId)} - {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.projectName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.personInChargeName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.checkerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.startDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.dueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.createdByName || '-'}</td>
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
                    value={formData.taskName || ''}
                    onChange={e => setFormData({ ...formData, taskName: e.target.value })}
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
                    <span className={cn(
                      'relative inline-block w-12 h-6 rounded-full transition-colors',
                      formData.isForceAssessment ? 'bg-blue-600' : 'bg-slate-300'
                    )}>
                      <span className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        formData.isForceAssessment ? 'translate-x-6' : 'translate-x-0'
                      )}></span>
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
                    value={formData.taskClassId || ''}
                    onChange={e => {
                      const tcId = e.target.value;
                      setFormData({
                        ...formData,
                        taskClassId: tcId,
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
                    value={formData.category || ''}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCategoriesForTaskClass(formData.taskClassId || '').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关联项目</label>
                  <AutocompleteInput
                    id="pool-project-autocomplete"
                    value={formData.projectName || ''}
                    options={getFilteredProjects(formData.taskClassId || '').map(p => p.name)}
                    onChange={(value) => {
                      const project = getFilteredProjects(formData.taskClassId || '').find(p => p.name === value);
                      setFormData({
                        ...formData,
                        projectId: project?.id || '',
                        projectName: value
                      });
                    }}
                    onSelect={(value) => {
                      const project = getFilteredProjects(formData.taskClassId || '').find(p => p.name === value);
                      if (project) {
                        setFormData({
                          ...formData,
                          projectId: project.id,
                          projectName: project.name
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
                    value={formData.personInChargeName || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          personInChargeId: user.userId,
                          personInChargeName: user.name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          personInChargeId: '',
                          personInChargeName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          personInChargeId: user.userId,
                          personInChargeName: user.name
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
                    value={formData.reviewerName || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          reviewerId: user.userId,
                          reviewerName: user.name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          reviewerId: '',
                          reviewerName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          reviewerId: user.userId,
                          reviewerName: user.name
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
                    value={formData.reviewer2Name || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          reviewerId2: user.userId,
                          reviewer2Name: user.name
                        });
                      } else {
                        setFormData({
                          ...formData,
                          reviewerId2: '',
                          reviewer2Name: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setFormData({
                          ...formData,
                          reviewerId2: user.userId,
                          reviewer2Name: user.name
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
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark || ''}
                  onChange={e => setFormData({ ...formData, remark: e.target.value })}
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
                    value={assignFormData.taskName || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, taskName: e.target.value })}
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
                    <span className={cn(
                      'relative inline-block w-12 h-6 rounded-full transition-colors',
                      assignFormData.isForceAssessment ? 'bg-blue-600' : 'bg-slate-300'
                    )}>
                      <span className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        assignFormData.isForceAssessment ? 'translate-x-6' : 'translate-x-0'
                      )}></span>
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
                    value={assignFormData.taskClassId || ''}
                    onChange={e => {
                      const tcId = e.target.value;
                      setAssignFormData({
                        ...assignFormData,
                        taskClassId: tcId,
                        category: '',
                        projectId: '',
                        projectName: ''
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
                    value={assignFormData.category || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCategoriesForTaskClass(assignFormData.taskClassId || '').map(cat => (
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
                    value={assignFormData.projectName || ''}
                  options={getFilteredProjects(assignFormData.taskClassId || '').map(p => p.name)}
                  onChange={(value) => {
                    const project = getFilteredProjects(assignFormData.taskClassId || '').find(p => p.name === value);
                    setAssignFormData({
                      ...assignFormData,
                      projectId: project?.id || '',
                      projectName: value
                    });
                  }}
                  onSelect={(value) => {
                    const project = getFilteredProjects(assignFormData.taskClassId || '').find(p => p.name === value);
                    if (project) {
                      setAssignFormData({
                        ...assignFormData,
                        projectId: project.id,
                        projectName: project.name
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
                    value={assignFormData.assigneeName || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          assigneeId: user.userId,
                          assigneeName: user.name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          assigneeId: '',
                          assigneeName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          assigneeId: user.userId,
                          assigneeName: user.name
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
                    value={assignFormData.reviewerName || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          reviewerId: user.userId,
                          reviewerName: user.name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          reviewerId: '',
                          reviewerName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          reviewerId: user.userId,
                          reviewerName: user.name
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
                    value={assignFormData.approverName || ''}
                    options={getAvailableUsers().map(u => u.name)}
                    onChange={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          approverId: user.userId,
                          approverName: user.name
                        });
                      } else {
                        setAssignFormData({
                          ...assignFormData,
                          approverId: '',
                          approverName: value
                        });
                      }
                    }}
                    onSelect={(value) => {
                      const user = getAvailableUsers().find(u => u.name === value);
                      if (user) {
                        setAssignFormData({
                          ...assignFormData,
                          approverId: user.userId,
                          approverName: user.name
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
                    value={assignFormData.startDate || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <input
                    type="date"
                    value={assignFormData.dueDate || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, dueDate: e.target.value })}
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
                    value={assignFormData.workload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, workload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人工时</label>
                  <input
                    type="number"
                    value={assignFormData.reviewerWorkload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, reviewerWorkload: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人工时</label>
                  <input
                    type="number"
                    value={assignFormData.approverWorkload || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, approverWorkload: parseFloat(e.target.value) })}
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
                  value={assignFormData.remark || ''}
                  onChange={e => setAssignFormData({ ...assignFormData, remark: e.target.value })}
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
