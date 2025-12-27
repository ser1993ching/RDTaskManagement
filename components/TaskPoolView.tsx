import React, { useState, useEffect } from 'react';
import { TaskPoolItem, TaskClass, User, Project, Task, TaskStatus, ProjectCategory } from '../types';
import { Plus, Edit2, Trash2, User as UserIcon, Calendar, X, CheckCircle, FolderOpen, Copy } from 'lucide-react';
import { dataService } from '../services/dataService';

interface TaskPoolViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onRefresh: () => void;
  onNavigateToTask: (taskId: string) => void;
}

// Task class IDs allowed for pool creation (excluding MEETING_TRAINING and TRAVEL)
const ALLOWED_TASK_CLASS_IDS = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC008', 'TC010'];

export const TaskPoolView: React.FC<TaskPoolViewProps> = ({ currentUser, projects, users, onRefresh, onNavigateToTask }) => {
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

  // Load task classes on mount
  useEffect(() => {
    const classes = dataService.getTaskClasses().filter(tc => ALLOWED_TASK_CLASS_IDS.includes(tc.id));
    setTaskClasses(classes);
    setTaskCategories(dataService.getTaskCategories());
    loadPoolItems();
  }, []);

  // Load pool items
  const loadPoolItems = () => {
    setPoolItems(dataService.getTaskPoolItems());
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

  // Get capacity level for project
  const getProjectCapacity = (projectId?: string): string | undefined => {
    if (!projectId) return undefined;
    const project = projects.find(p => p.id === projectId);
    return project?.capacity;
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      TaskName: '',
      TaskClassID: taskClasses[0]?.id || '',
      Category: '',
      ProjectID: '',
      PersonInChargeID: '',
      ReviewerID: '',
      ReviewerID2: '',
      StartDate: '',
      DueDate: '',
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
      Difficulty: 1.0,
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
      PersonInChargeName: formData.PersonInChargeID ? getUserName(formData.PersonInChargeID) : undefined,
      ReviewerID: formData.ReviewerID,
      ReviewerID2: formData.ReviewerID2,
      ReviewerName: formData.ReviewerID ? getUserName(formData.ReviewerID) : undefined,
      Reviewer2Name: formData.ReviewerID2 ? getUserName(formData.ReviewerID2) : undefined,
      StartDate: formData.StartDate,
      DueDate: formData.DueDate,
      CreatedBy: editingItem?.CreatedBy || currentUser.UserID,
      CreatedByName: editingItem?.CreatedByName || currentUser.Name,
      CreatedDate: editingItem?.CreatedDate || new Date().toISOString().split('T')[0],
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
      alert('请选择执行人或输入执行人姓名');
      return;
    }

    if (!assignFormData.TaskName) {
      alert('请填写任务名称');
      return;
    }

    try {
      const newTask = dataService.assignPoolItemToTask(assigningItem.id, assignFormData);
      setIsAssignModalOpen(false);
      loadPoolItems();
      onRefresh();
      // Navigate to the new task
      onNavigateToTask(newTask.TaskID);
    } catch (error) {
      alert('分配任务失败：' + (error as Error).message);
    }
  };

  // Get task class name
  const getTaskClassName = (classId: string): string => {
    const tc = taskClasses.find(t => t.id === classId);
    return tc?.name || '';
  };

  // Get project category for task class
  const getProjectCategoryForTaskClass = (taskClassCode: string): ProjectCategory | null => {
    switch (taskClassCode) {
      case 'TC001': return ProjectCategory.MARKET;
      case 'TC002': return ProjectCategory.EXECUTION;
      case 'TC003': return ProjectCategory.NUCLEAR;
      case 'TC004':
      case 'TC005': return ProjectCategory.RESEARCH;
      case 'TC006': return ProjectCategory.RENOVATION;
      case 'TC008':
      case 'TC010': return ProjectCategory.OTHER;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">任务库</h2>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          新建任务计划
        </button>
      </div>

      {/* Pool Items List */}
      {poolItems.length === 0 ? (
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {poolItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.TaskName}</td>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingItem ? '编辑任务计划' : '新建任务计划'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Name */}
              <div>
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

              {/* Task Class and Category */}
              <div className="grid grid-cols-2 gap-4">
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
                        ProjectID: ''
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
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联项目</label>
                <select
                  value={formData.ProjectID || ''}
                  onChange={e => setFormData({ ...formData, ProjectID: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">无关联项目</option>
                  {getFilteredProjects(formData.TaskClassID || '').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Person in Charge and Reviewers */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                  <select
                    value={formData.PersonInChargeID || ''}
                    onChange={e => setFormData({ ...formData, PersonInChargeID: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人</label>
                  <select
                    value={formData.ReviewerID || ''}
                    onChange={e => setFormData({ ...formData, ReviewerID: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人</label>
                  <select
                    value={formData.ReviewerID2 || ''}
                    onChange={e => setFormData({ ...formData, ReviewerID2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
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

      {/* Assign Modal - Similar to TaskView create form */}
      {isAssignModalOpen && assigningItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">分配任务</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>任务计划：</strong>{assigningItem.TaskName}
                <span className="mx-2">|</span>
                <strong>任务类别：</strong>{getTaskClassName(assigningItem.TaskClassID)} - {assigningItem.Category}
                {assigningItem.ProjectName && (
                  <>
                    <span className="mx-2">|</span>
                    <strong>关联项目：</strong>{assigningItem.ProjectName}
                  </>
                )}
                {(assigningItem.StartDate || assigningItem.DueDate) && (
                  <>
                    <span className="mx-2">|</span>
                    <strong>计划时间：</strong>{assigningItem.StartDate || ''} 至 {assigningItem.DueDate || '待定'}
                  </>
                )}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAssign(); }} className="space-y-4">
              {/* Task Name */}
              <div>
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

              {/* Task Class and Category */}
              <div className="grid grid-cols-2 gap-4">
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
                        ProjectID: ''
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
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  关联项目 <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignFormData.ProjectID || ''}
                  onChange={e => setAssignFormData({ ...assignFormData, ProjectID: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择</option>
                  {getFilteredProjects(assignFormData.TaskClassID || '').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Assignee and Reviewers */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    执行人 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignFormData.AssigneeID || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, AssigneeID: e.target.value, AssigneeName: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">校核人</label>
                  <select
                    value={assignFormData.ReviewerID || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, ReviewerID: e.target.value, ReviewerName: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审查人</label>
                  <select
                    value={assignFormData.ReviewerID2 || ''}
                    onChange={e => setAssignFormData({ ...assignFormData, ReviewerID2: e.target.value, Reviewer2Name: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {users.filter(u => u.Status === '在岗').map(u => (
                      <option key={u.UserID} value={u.UserID}>{u.Name}</option>
                    ))}
                  </select>
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

              {/* Workload and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">难度系数</label>
                  <select
                    value={assignFormData.Difficulty || 1.0}
                    onChange={e => setAssignFormData({ ...assignFormData, Difficulty: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0.5">0.5 - 非常简单</option>
                    <option value="1.0">1.0 - 简单</option>
                    <option value="1.5">1.5 - 一般</option>
                    <option value="2.0">2.0 - 困难</option>
                    <option value="3.0">3.0 - 非常困难</option>
                  </select>
                </div>
              </div>

              {/* Force Assessment */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="assignIsForceAssessment"
                  checked={assignFormData.isForceAssessment || false}
                  onChange={e => setAssignFormData({ ...assignFormData, isForceAssessment: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="assignIsForceAssessment" className="text-sm text-gray-700">强制考核</label>
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
    </div>
  );
};
