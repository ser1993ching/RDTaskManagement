import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskClass, User, Project, TaskStatus, ProjectCategory } from '../types';
import { Plus, Download, Edit2, Trash2, Filter, Calendar, User as UserIcon, Clock, MapPin, X, Info, CheckCircle } from 'lucide-react';
import { apiDataService } from '../services/apiDataService';
import AutocompleteInput from './AutocompleteInput';

interface TaskViewProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onRefresh: () => void;
  targetTaskName?: string;
  onClearTargetTaskName?: () => void;
}

// Default task categories (fallback when API fails) - 修复 Bug 2
// 使用 camelCase，与后端返回格式一致
const DEFAULT_TASK_CATEGORIES: Record<string, string[]> = {
  'market': ['技术支持', '商务配合', '技术方案', '项目管理', '其他'],
  'execution': ['设计工作', '计算工作', '图纸工作', '项目管理', '技术支持', '其他'],
  'nuclear': ['设计工作', '计算工作', '图纸工作', '项目管理', '技术支持', '其他'],
  'productDev': ['研发工作', '测试工作', '设计工作', '技术支持', '其他'],
  'research': ['理论研究', '试验工作', '数据分析', '报告编写', '其他'],
  'renovation': ['现场服务', '技术支持', '设计工作', '项目管理', '其他'],
  'adminParty': ['党建活动', '行政事务', '会议组织', '其他'],
  'meetingTraining': ['学习与培训', '党建会议', '班务会', '设计评审会', '资料讨论会', '其他'],
  'travel': ['市场配合出差', '常规项目执行出差', '核电项目执行出差', '科研出差', '改造服务出差', '其他'],
  'other': ['其他'],
};

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

export const TaskView: React.FC<TaskViewProps> = ({ currentUser, tasks, projects, users, onRefresh, targetTaskName, onClearTargetTaskName }) => {
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]);
  const [taskCategories, setTaskCategories] = useState<Record<string, string[]>>({});
  const [activeTaskClassId, setActiveTaskClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState<Partial<Project>>({});
  const [equipmentModels, setEquipmentModels] = useState<string[]>([]);
  const [capacityLevels, setCapacityLevels] = useState<string[]>([]);

  // Load task classes
  useEffect(() => {
    const loadTaskClasses = async () => {
      const classes = await apiDataService.getTaskClasses();
      setTaskClasses(classes);
      if (classes.length > 0 && !activeTaskClassId) {
        setActiveTaskClassId(classes[0].id);
      }
    };
    loadTaskClasses();
  }, []);

  // Load task categories
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await apiDataService.getTaskCategories();
      setTaskCategories(categories);
    };
    loadCategories();
  }, []);

  // Load equipment models and capacity levels (for project form)
  useEffect(() => {
    const loadSettings = async () => {
      const [models, levels] = await Promise.all([
        apiDataService.getEquipmentModels(),
        apiDataService.getCapacityLevels(),
      ]);
      setEquipmentModels(models);
      setCapacityLevels(levels);
    };
    loadSettings();
  }, []);

  // Handle targetTaskName - filter tasks by name and switch to the task's category
  // 修复Bug 6: 移除 tasks.length > 0 条件，确保任务未加载时也能处理
  useEffect(() => {
    if (targetTaskName) {
      // Find the task by name to get its TaskClassID
      const targetTask = tasks.find(t => t.taskName === targetTaskName);
      if (targetTask) {
        // Switch to the task's category
        setActiveTaskClassId(targetTask.taskClassId);
      }
      setFilterTaskName(targetTaskName);
      // Clear targetTaskName after processing
      if (onClearTargetTaskName) {
        onClearTargetTaskName();
      }
    }
  }, [targetTaskName, tasks, onClearTargetTaskName]);

  // Helper function to get categories for a task class
  // 修复 Bug 2: 使用默认分类作为降级处理
  // API返回的categories key是camelCase (market, execution)，但taskClassCode可能是PascalCase或大写
  const getCategoriesForTaskClass = (taskClassCode: string): string[] => {
    if (!taskClassCode) return [];

    // 尝试多种key格式（camelCase, PascalCase, uppercase）
    const keyVariants = [
      taskClassCode,  // 原样
      taskClassCode.charAt(0).toLowerCase() + taskClassCode.slice(1),  // camelCase
      taskClassCode.toLowerCase(),  // lowercase
      taskClassCode.toUpperCase(),  // UPPERCASE
    ];

    // 查找API数据
    for (const key of keyVariants) {
      if (taskCategories[key] && taskCategories[key].length > 0) {
        return taskCategories[key];
      }
    }

    // 查找默认分类（DEFAULT_TASK_CATEGORIES使用UPPERCASE key）
    for (const key of keyVariants) {
      if (DEFAULT_TASK_CATEGORIES[key]) {
        return DEFAULT_TASK_CATEGORIES[key];
      }
    }

    return [];
  };

  // Filtering
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [filterThisMonth, setFilterThisMonth] = useState(false);
  const [filterTaskName, setFilterTaskName] = useState('');
  const [filterForceAssessment, setFilterForceAssessment] = useState<boolean | ''>('');
  const [filterCapacityLevel, setFilterCapacityLevel] = useState('');
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');

  const activeTaskClass = taskClasses.find(tc => tc.id === activeTaskClassId);

  // Helper variables for task type detection (使用 camelCase，与后端返回格式一致)
  const isMeeting = activeTaskClass?.code === 'MeetingTraining';
  const isTravel = activeTaskClass?.code === 'Travel';

  // Map task class codes to project categories (使用 camelCase)
  const getProjectCategoryForTaskClass = (taskClassCode: string): ProjectCategory | null => {
    switch (taskClassCode) {
      case 'market':
        return ProjectCategory.MARKET;
      case 'execution':
        return ProjectCategory.EXECUTION;
      case 'nuclear':
        return ProjectCategory.NUCLEAR;
      case 'productDev':
      case 'research':
        return ProjectCategory.RESEARCH;
      case 'renovation':
        return ProjectCategory.RENOVATION;
      case 'other':
        return ProjectCategory.OTHER;
      default:
        return null;
    }
  };

  // Get allowed project categories for task class (some task types can relate to multiple project types)
  const getAllowedProjectCategoriesForTaskClass = (taskClassCode: string): ProjectCategory[] => {
    switch (taskClassCode) {
      case 'market':
        return [ProjectCategory.MARKET];
      case 'execution':
        return [ProjectCategory.EXECUTION];
      case 'nuclear':
        return [ProjectCategory.NUCLEAR];
      case 'productDev':
        // 产品研发可以关联常规项目、核电项目、科研项目、改造项目
        return [ProjectCategory.EXECUTION, ProjectCategory.NUCLEAR, ProjectCategory.RESEARCH, ProjectCategory.RENOVATION];
      case 'research':
        return [ProjectCategory.RESEARCH];
      case 'renovation':
        return [ProjectCategory.RENOVATION];
      case 'other':
        return [ProjectCategory.OTHER];
      default:
        return [];
    }
  };

  // Get projects filtered by task class
  const getProjectsForTaskClass = (taskClassCode: string): Project[] => {
    // 产品研发任务可以从常规项目、核电项目、科研项目、改造项目中获取
    if (taskClassCode === 'productDev') {
      return projects.filter(p =>
        p.category === ProjectCategory.EXECUTION ||
        p.category === ProjectCategory.NUCLEAR ||
        p.category === ProjectCategory.RESEARCH ||
        p.category === ProjectCategory.RENOVATION ||
        p.category === ProjectCategory.OTHER
      );
    }

    // 差旅任务、行政与党建任务和会议培训任务可以从所有项目中获取
    if (taskClassCode === 'travel' || taskClassCode === 'adminParty' || taskClassCode === 'meetingTraining') {
      return projects;
    }

    const category = getProjectCategoryForTaskClass(taskClassCode);
    if (!category) return [];
    return projects.filter(p => p.category === category);
  };

  // Get projects for travel tasks based on category
  // 修复 Bug 3: 修复类别名称匹配问题
  const getProjectsForTravelTask = (category: string): Project[] => {
    switch (category) {
      case '市场配合出差':
      case '技术支持':
      case '商务配合':
        return projects.filter(p => p.category === ProjectCategory.MARKET);
      case '常规项目执行出差':
      case '设计工作':
      case '计算工作':
      case '图纸工作':
        return projects.filter(p => p.category === ProjectCategory.EXECUTION);
      case '核电项目执行出差':
        return projects.filter(p => p.category === ProjectCategory.NUCLEAR);
      case '科研出差':
      case '理论研究':
      case '试验工作':
        return projects.filter(p => p.category === ProjectCategory.RESEARCH);
      case '改造服务出差':
      case '现场服务':
        return projects.filter(p => p.category === ProjectCategory.RENOVATION);
      case '其他':
      case '其他任务出差':
        return projects.filter(p => p.category === ProjectCategory.OTHER);
      default:
        return projects;
    }
  };

  // 格式化日期为 YYYY-MM-DD 格式（兼容 DateTime 和字符串）
  const formatDateForInput = (dateValue: string | Date | undefined | null): string => {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Calculate due date based on start date and travel duration
  const calculateDueDate = (startDate: string, travelDuration: number): string => {
    if (!startDate || !travelDuration || travelDuration <= 0) {
      return '';
    }

    const start = new Date(startDate);
    const dueDate = new Date(start.getTime() + (travelDuration - 1) * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split('T')[0];
  };

  // Get default start date (3 months ago)
  const getDefaultStartDate = (): string => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return threeMonthsAgo.toISOString().split('T')[0];
  };

  // Clear project and label when travel task category changes
  useEffect(() => {
    if (isTravel && formData.category) {
      // Check if current project belongs to the selected category
      const availableProjects = getProjectsForTravelTask(formData.category);
      const currentProject = projects.find(p => p.id === formData.projectId);
      const isProjectValid = currentProject && availableProjects.some(p => p.id === currentProject.id);

      // Clear project and label if they don't match the new category
      if (!isProjectValid || formData.travelLabel) {
        setFormData(prev => ({
          ...prev,
          projectId: '',
          TravelLabel: ''
        }));
      }
    }
  }, [formData.category, isTravel, projects]);

  // Helper function to get filtered tasks for sidebar count (consistent with main content)
  const getSidebarTaskCount = (taskClassId: string) => {
    // No time filter - show all tasks
    return tasks.filter(t => t.taskClassId === taskClassId).length;
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
    // 会议培训任务和差旅任务不受状态和强制考核筛选器影响
    const isMeetingTask = t.taskClassId === 'TC007';
    const isTravelTask = t.taskClassId === 'TC009';
    return t.taskClassId === activeTaskClassId &&
      (filterProject ? t.projectId === filterProject : true) &&
      ((isMeetingTask || isTravelTask) ? true : (filterStatus ? t.status === filterStatus : true)) &&
      (filterCategory ? t.category === filterCategory : true) &&
      (filterAssignee ? t.assigneeId === filterAssignee : true) &&
      (filterTaskName ? t.taskName.toLowerCase().includes(filterTaskName.toLowerCase()) : true) &&
      (filterStartDateFrom ? (t.startDate ? new Date(t.startDate) >= new Date(filterStartDateFrom) : true) : true) &&
      (filterStartDateTo ? (t.startDate ? new Date(t.startDate) <= new Date(filterStartDateTo) : true) : true) &&
      (filterThisWeek ? isInCurrentWeek(t.startDate || '') : true) &&
      (filterThisMonth ? isInCurrentMonth(t.startDate || '') : true) &&
      ((isMeetingTask || isTravelTask) ? true : (filterForceAssessment === '' ? true : t.isForceAssessment === filterForceAssessment));
  });

  const handleExport = () => {
    // 检查是否包含差旅任务或会议培训任务
    const hasTravelTask = filteredTasks.some(t => t.taskClassId === 'TC009');
    const hasMeetingTask = filteredTasks.some(t => t.taskClassId === 'TC007');

    // 根据任务类型决定列头
    let headers;
    if (hasMeetingTask) {
      headers = ['ID', '任务名称', '负责人', '会议日期', '会议时长', '参会人数'];
    } else if (hasTravelTask) {
      headers = ['ID', '任务名称', '状态', '负责人', '截止日期'];
    } else {
      headers = ['ID', '任务名称', '状态', '负责人', '校核人', '审查人', '截止日期'];
    }

    // 根据任务类型决定行数据
    const rows = filteredTasks.map(t => {
      // 获取负责人姓名（优先使用AssigneeName，其次使用用户表中的姓名）
      const assigneeName = t.assigneeName || users.find(u => u.userId === t.assigneeId)?.name || '-';
      const reviewerName = t.checkerName || users.find(u => u.userId === t.checkerId)?.name || '-';
      const reviewer2Name = t.chiefDesignerName || users.find(u => u.userId === t.chiefDesignerId)?.name || '-';

      let baseRow;

      // 会议培训任务使用特殊的行数据格式
      if (t.taskClassId === 'TC007') {
        baseRow = [
          t.taskId,
          t.taskName,
          assigneeName,
          t.startDate ? formatDate(t.startDate) : '-',
          t.meetingDuration ? `${t.meetingDuration}h` : '-',
          `${t.participants?.length || 0}人`
        ];
      } else {
        baseRow = [
          t.taskId,
          t.taskName,
          t.status,
          assigneeName,
          t.dueDate || ''
        ];

        // 如果不是差旅任务，添加校核人和审查人
        if (t.taskClassId !== 'TC009') {
          baseRow.splice(4, 0, reviewerName);
          baseRow.splice(5, 0, reviewer2Name);
        }
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
      const proj = projects.find(p => p.id === formData.projectId);
      const projName = proj ? proj.name : '';
      const category = formData.category || '';
      const travelLabel = formData.travelLabel || '';

      if (activeTaskClass?.code !== 'meetingTraining') { // Meeting usually custom name
        let taskName = '';

        // 差旅任务特殊命名格式：[项目名]-[分类]-[标签]
        if (isTravel) {
          if (projName && category && travelLabel) {
            taskName = `${projName}-${category}-${travelLabel}`;
          } else if (projName && category) {
            taskName = `${projName}-${category}`;
          }
        } else {
          // 其他任务命名格式：[项目名]-[分类]
          if (projName && category) {
            taskName = `${projName}-${category}`;
          }
        }

        if (taskName) {
          setFormData(prev => ({
             ...prev,
             taskName: taskName
          }));
        }
      }
    }
  }, [formData.projectId, formData.category, formData.travelLabel, isModalOpen, projects, activeTaskClass, editingTask, isTravel]);

  // 差旅任务专用：当标签改变时自动更新任务名称
  useEffect(() => {
    if (isModalOpen && !editingTask && isTravel && formData.projectId && formData.category) {
      const proj = projects.find(p => p.id === formData.projectId);
      const projName = proj ? proj.name : '';
      const category = formData.category || '';
      const travelLabel = formData.travelLabel || '';

      if (travelLabel) {
        const newTaskName = `${projName}-${category}-${travelLabel}`;
        setFormData(prev => ({
          ...prev,
          taskName: newTaskName
        }));
      }
    }
  }, [formData.travelLabel, isModalOpen, isTravel, formData.projectId, formData.category, projects]);

  // 差旅任务专用：当开始日期或差旅时长变化时自动更新截止日期
  useEffect(() => {
    if (isModalOpen && isTravel && formData.startDate && formData.travelDuration) {
      const calculatedDueDate = calculateDueDate(formData.startDate, formData.travelDuration);
      if (calculatedDueDate && formData.dueDate !== calculatedDueDate) {
        setFormData(prev => ({
          ...prev,
          dueDate: calculatedDueDate
        }));
      }
    }
  }, [formData.startDate, formData.travelDuration, isModalOpen, isTravel]);

  // Auto-match project based on task name (only for matching categories)
  useEffect(() => {
    if (isModalOpen && formData.taskName && formData.taskName.includes('项目') && activeTaskClass) {
      const matchingProjects = getProjectsForTaskClass(activeTaskClass.code);
      const projectNames = matchingProjects.map(p => p.name);
      const matchedProject = projectNames.find(name => formData.taskName?.includes(name));
      if (matchedProject) {
        const project = matchingProjects.find(p => p.name === matchedProject);
        if (project && formData.projectId !== project.id) {
          setFormData(prev => ({ ...prev, projectId: project.id }));
        }
      }
    }
  }, [formData.taskName, isModalOpen, projects, activeTaskClass]);

  // Handle new project creation
  // Open project creation modal
  const openProjectModal = (projectName?: string) => {
    if (projectName) {
      setProjectFormData({
        name: projectName,
        category: getProjectCategoryForTaskClass(activeTaskClass?.code || '') || ProjectCategory.OTHER,
        startDate: new Date().toISOString().split('T')[0]
      });
    } else {
      setProjectFormData({
        category: getProjectCategoryForTaskClass(activeTaskClass?.code || '') || ProjectCategory.OTHER,
        startDate: new Date().toISOString().split('T')[0]
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectFormData.name?.trim()) {
      alert('请输入项目名称！');
      return;
    }

    // Check if project already exists
    const existingProject = projects.find(p => p.name === projectFormData.name);
    if (existingProject) {
      alert('项目已存在！');
      return;
    }

    const newProject: Project = {
      id: `PROJ-${Date.now()}`,
      name: projectFormData.name,
      category: projectFormData.category || ProjectCategory.OTHER,
      workNo: projectFormData.workNo,
      capacity: projectFormData.capacity,
      model: projectFormData.model,
      startDate: projectFormData.startDate,
      remark: projectFormData.remark,
      isWon: projectFormData.isWon,
      isForeign: projectFormData.isForeign,
      isCommissioned: projectFormData.isCommissioned,
      isCompleted: projectFormData.isCompleted
    };

    await apiDataService.saveProject(newProject);

    // If creating from task view, auto-associate with current task
    if (isModalOpen) {
      setFormData(prev => ({ ...prev, projectId: newProject.id }));
    }

    setIsProjectModalOpen(false);
    setProjectFormData({});
    onRefresh(); // Refresh projects list
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证项目与任务类型的匹配性
    if (formData.projectId && activeTaskClass) {
      const project = projects.find(p => p.id === formData.projectId);
      const allowedCategories = getAllowedProjectCategoriesForTaskClass(activeTaskClass.code);
      if (project && allowedCategories.length > 0 && !allowedCategories.includes(project.category)) {
        const allowedCategoryNames = allowedCategories.map(c => c).join('、');
        alert(`保存失败：选择的项目"${project.name}"属于${project.category}，与当前任务类型${activeTaskClass.name}不匹配。\n\n该任务类型允许关联的项目类别：${allowedCategoryNames}\n\n请选择正确的项目类别或联系管理员调整项目分类。`);
        return;
      }
    }

    const taskToSave: Task = {
      ...editingTask,
      ...formData,
      taskId: editingTask?.taskId || `TSK-${Date.now()}`,
      createdDate: editingTask?.createdDate || new Date().toISOString().split('T')[0],
      createdBy: editingTask?.createdBy || currentUser.userId,
      // 明确从 formData 获取 status，确保用户修改生效
      status: formData.status || editingTask?.status || '未开始'
    };

    // 如果状态变为已完成，自动设置完成日期
    if (taskToSave.status === '已完成' && editingTask?.status !== '已完成') {
      taskToSave.completedDate = new Date().toISOString().split('T')[0];
    }
    // 如果状态从已完成变为非已完成，清除完成日期
    if (taskToSave.status !== '已完成' && editingTask?.status === '已完成') {
      taskToSave.completedDate = undefined;
    }

    // 修复 Bug 4: 添加保存操作的错误处理
    try {
      await apiDataService.saveTask(taskToSave);

      // 如果是编辑模式且状态发生了变化，额外调用 updateTaskStatus
      if (editingTask?.taskId && formData.status !== editingTask.status) {
        await apiDataService.updateTaskStatus(editingTask.taskId, taskToSave.status);
      }

      setIsModalOpen(false);
      // 关闭弹窗后清除任务名称筛选器（从个人工作台跳转来的情况）
      setFilterTaskName('');
      onClearTargetTaskName?.();
      onRefresh();
    } catch (error) {
      console.error('保存任务失败:', error);
      alert('保存任务失败，请稍后重试');
    }
  };

  const openModal = (task?: Task) => {
    setEditingTask(task || null);
    const defaultCategory = activeTaskClass ? getCategoriesForTaskClass(activeTaskClass.code)[0] : '';
    const taskData: Task = task || {
      taskClassId: activeTaskClassId,
      category: defaultCategory,
      status: '未开始',
      taskId: '',
      taskName: '',
      createdDate: '',
      createdBy: ''
    };
    // 如果是编辑模式，验证项目与任务类型的匹配性
    if (task && task.projectId && activeTaskClass) {
      const project = projects.find(p => p.id === task.projectId);
      const allowedCategories = getAllowedProjectCategoriesForTaskClass(activeTaskClass.code);
      if (project && allowedCategories.length > 0 && !allowedCategories.includes(project.category)) {
        const allowedCategoryNames = allowedCategories.map(c => c).join('、');
        alert(`警告：该任务当前关联的项目"${project.name}"属于${project.category}，与当前任务类型${activeTaskClass.name}不匹配。\n\n该任务类型允许关联的项目类别：${allowedCategoryNames}\n\n建议：\n1. 修改任务类型为匹配的项目类别，或\n2. 更换为正确的项目，或\n3. 联系管理员调整项目分类`);
        // 不阻断编辑，但保留原关联
      }
    }
    // 如果是编辑模式，设置人员姓名字段
    if (task && task.assigneeId) {
      const assignee = users.find(u => u.userId === task.assigneeId);
      if (assignee) {
        taskData.assigneeName = assignee.name;
      }
    }
    if (task && task.checkerId) {
      const reviewer = users.find(u => u.userId === task.checkerId);
      if (reviewer) {
        taskData.checkerName = reviewer.name;
      }
    }
    if (task && task.chiefDesignerId) {
      const reviewer2 = users.find(u => u.userId === task.chiefDesignerId);
      if (reviewer2) {
        taskData.chiefDesignerName = reviewer2.name;
      }
    }

    // 确保时间字段被正确复制（所有任务类型），并格式化为 YYYY-MM-DD
    if (task) {
      taskData.startDate = formatDateForInput(task.startDate);
      taskData.dueDate = formatDateForInput(task.dueDate);
    }

    // 如果是差旅任务，根据开始日期和时长自动计算截止日期（仅当没有原始截止日期时）
    if (task && task.taskClassId === 'TC009' && task.startDate && task.travelDuration && !formatDateForInput(task.dueDate)) {
      const calculatedDueDate = calculateDueDate(formatDateForInput(task.startDate), task.travelDuration);
      taskData.dueDate = calculatedDueDate;
    }

    setFormData(taskData);
    setIsModalOpen(true);
  };

  const openDetailModal = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleDoubleClick = (task: Task) => {
    openDetailModal(task);
  };

  // Dynamic Form Field Renderer
  const renderDynamicFields = () => {
    if (!activeTaskClass) return null;

    return (
      <>
        {/* 第一行：分类 + 关联项目（占2列）+ 是否支持独立经营体（非差旅任务） */}
        {!isTravel && (
          <div className="grid grid-cols-3 gap-3 col-span-2">
            <div>
              <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 分类</label>
              <select required className="w-full border rounded p-2"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {activeTaskClass && getCategoriesForTaskClass(activeTaskClass.code).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* 所有任务类型均可选择关联项目（占2列，与校核人+审查人宽度一致） */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">关联项目</label>
              <AutocompleteInput
                id="project-autocomplete"
                value={projects.find(p => p.id === formData.projectId)?.name || ''}
                options={getProjectsForTaskClass(activeTaskClass?.code || '').map(p => p.name)}
                onChange={(value) => {
                  const project = getProjectsForTaskClass(activeTaskClass?.code || '').find(p => p.name === value);
                  setFormData({...formData, projectId: project?.id || ''});
                  // 仅市场配合任务支持自动创建项目
                  if (activeTaskClass?.code === 'market' && value.trim() && !project) {
                    openProjectModal(value.trim());
                  }
                }}
                onSelect={(value) => {
                  const project = getProjectsForTaskClass(activeTaskClass?.code || '').find(p => p.name === value);
                  if (project) {
                    setFormData({...formData, projectId: project.id});
                  }
                }}
                placeholder="搜索或输入项目名称..."
                className="w-full border rounded p-2"
              />
              {/* 仅市场配合任务显示新建项目按钮 */}
              {activeTaskClass?.code === 'market' && (
                <button
                  type="button"
                  onClick={() => openProjectModal()}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  + 新建项目
                </button>
              )}
            </div>
          </div>
        )}

        {/* 第一行：差旅任务的分类 + 标签 + 关联项目（占2列） */}
        {isTravel && (
          <div className="grid grid-cols-4 gap-3 col-span-2">
            <div>
              <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 分类</label>
              <select required className="w-full border rounded p-2"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {activeTaskClass && getCategoriesForTaskClass(activeTaskClass.code).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">差旅标签</label>
              <select className="w-full border rounded p-2"
                value={formData.travelLabel || ''} onChange={e => setFormData({...formData, travelLabel: e.target.value})}>
                <option value="">选择标签</option>
                {/* 市场配合出差 */}
                {(formData.category === '市场配合出差' || formData.category === '技术支持' || formData.category === '商务配合') && (
                  <>
                    <option value="技术交流">技术交流</option>
                    <option value="现场投标">现场投标</option>
                    <option value="技术协议">技术协议</option>
                    <option value="其他">其他</option>
                  </>
                )}
                {/* 常规项目/核电项目执行出差 */}
                {(formData.category === '常规项目执行出差' || formData.category === '核电项目执行出差' || formData.category === '设计工作' || formData.category === '计算工作' || formData.category === '图纸工作') && (
                  <>
                    <option value="联络会">联络会</option>
                    <option value="安装现场服务">安装现场服务</option>
                    <option value="其他">其他</option>
                  </>
                )}
                {/* 科研/改造服务/其他 */}
                {(formData.category === '科研出差' || formData.category === '改造服务出差' || formData.category === '其他' || formData.category === '理论研究' || formData.category === '现场服务') && (
                  <>
                    <option value="现场调研">现场调研</option>
                    <option value="技术交流">技术交流</option>
                    <option value="其他">其他</option>
                  </>
                )}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">关联项目</label>
              <AutocompleteInput
                id="travel-project-autocomplete"
                value={projects.find(p => p.id === formData.projectId)?.name || ''}
                options={getProjectsForTravelTask(formData.category || '').map(p => p.name)}
                onChange={(value) => {
                  const project = getProjectsForTravelTask(formData.category || '').find(p => p.name === value);
                  setFormData({...formData, projectId: project?.id || ''});
                }}
                onSelect={(value) => {
                  const project = getProjectsForTravelTask(formData.category || '').find(p => p.name === value);
                  if (project) {
                    setFormData({...formData, projectId: project.id});
                  }
                }}
                placeholder="搜索或输入项目名称..."
                className="w-full border rounded p-2"
              />
            </div>
          </div>
        )}

        {/* 第三行：负责人（会议培训显示负责人+会议日期+会议时长，差旅任务显示负责人+开始日期+出差天数，其他任务显示负责人、校核人、审查人） */}
        {isTravel ? (
          // 差旅任务显示负责人+开始日期+出差天数
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">负责人</label>
                <AutocompleteInput
                  id="travel-assignee-autocomplete"
                  value={users.find(u => u.userId === formData.assigneeId)?.name || formData.assigneeName || ''}
                  options={users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => u.name)}
                  onChange={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
                    } else {
                      setFormData({...formData, assigneeId: '', assigneeName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
                    }
                  }}
                  placeholder="搜索或输入负责人姓名..."
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">开始日期</label>
                <input type="date" className="w-full border rounded p-2"
                  value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">出差天数(天)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.travelDuration || ''} onChange={e => {
                    const newTravelDuration = parseFloat(e.target.value) || 0;
                    const startDate = formData.startDate || '';
                    const newDueDate = calculateDueDate(startDate, newTravelDuration);
                    setFormData({...formData, travelDuration: newTravelDuration, dueDate: newDueDate});
                  }} />
              </div>
            </div>
          </div>
        ) : isMeeting ? (
          // 会议培训任务：第一行负责人+日期+时长，第二行关联项目
          <>
            {/* 第一行：负责人 + 会议日期 + 会议时长 */}
            <div className="col-span-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">负责人</label>
                  <AutocompleteInput
                    id="assignee-autocomplete"
                    value={users.find(u => u.userId === formData.assigneeId)?.name || formData.assigneeName || ''}
                    options={users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => u.name)}
                    onChange={(value) => {
                      const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                      if (user) {
                        setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
                      } else {
                        setFormData({...formData, assigneeId: '', assigneeName: value});
                      }
                    }}
                    onSelect={(value) => {
                      const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                      if (user) {
                        setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
                      }
                    }}
                    placeholder="搜索或输入负责人姓名..."
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">会议日期</label>
                  <input type="date" className="w-full border rounded p-2"
                    value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">会议时长(小时)</label>
                  <input type="number" step="0.5" className="w-full border rounded p-2"
                    value={formData.meetingDuration || ''} onChange={e => setFormData({...formData, meetingDuration: parseFloat(e.target.value)})} />
                </div>
              </div>
            </div>
            {/* 第二行：关联项目 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">关联项目</label>
              <AutocompleteInput
                id="meeting-project-autocomplete"
                value={projects.find(p => p.id === formData.projectId)?.name || ''}
                options={projects.map(p => p.name)}
                onChange={(value) => {
                  const project = projects.find(p => p.name === value);
                  setFormData({...formData, projectId: project?.id || ''});
                }}
                onSelect={(value) => {
                  const project = projects.find(p => p.name === value);
                  if (project) {
                    setFormData({...formData, projectId: project.id});
                  }
                }}
                placeholder="搜索或输入项目名称..."
                className="w-full border rounded p-2"
              />
            </div>
          </>
        ) : (
          // 其他任务显示负责人、校核人、审查人
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">负责人</label>
                <AutocompleteInput
                  id="assignee-autocomplete"
                  value={users.find(u => u.userId === formData.assigneeId)?.name || formData.assigneeName || ''}
                  options={users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => u.name)}
                  onChange={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
                    } else {
                      setFormData({...formData, assigneeId: '', assigneeName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, assigneeId: user.userId, assigneeName: user.name});
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
                  value={users.find(u => u.userId === formData.checkerId)?.name || formData.checkerName || ''}
                  options={users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => u.name)}
                  onChange={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, checkerId: user.userId, checkerName: user.name});
                    } else {
                      setFormData({...formData, checkerId: '', checkerName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, checkerId: user.userId, checkerName: user.name});
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
                  value={users.find(u => u.userId === formData.chiefDesignerId)?.name || formData.chiefDesignerName || ''}
                  options={users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => u.name)}
                  onChange={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, chiefDesignerId: user.userId, chiefDesignerName: user.name});
                    } else {
                      setFormData({...formData, chiefDesignerId: '', chiefDesignerName: value});
                    }
                  }}
                  onSelect={(value) => {
                    const user = users.find(u => u.name === value && u.status !== '离岗' && u.userId !== 'admin');
                    if (user) {
                      setFormData({...formData, chiefDesignerId: user.userId, chiefDesignerName: user.name});
                    }
                  }}
                  placeholder="搜索或输入审查人姓名..."
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* 第四行：任务状态 + 截止日期（会议培训任务和差旅任务不显示） */}
        <div className="grid grid-cols-3 gap-3 col-span-2">
          {!isMeeting && !isTravel && (
            <div>
              <label className="block text-sm font-medium mb-1">任务状态</label>
              <select className="w-full border rounded p-2"
                 value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                 {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          {!isMeeting && !isTravel && (
            <div>
              <label className="block text-sm font-medium mb-1">任务开始日期</label>
              <input type="date" className="w-full border rounded p-2"
                value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
          )}
          {!isMeeting && !isTravel && (
            <div>
              <label className="block text-sm font-medium mb-1">截止日期</label>
              <input type="date" className="w-full border rounded p-2"
                value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          )}
        </div>

        {/* 第五行：负责人工时 + 校核人工时 + 审查人工时（仅班组长/管理员可见，会议培训任务和差旅任务不显示） */}
        {(currentUser?.systemRole === '管理员' || currentUser?.systemRole === '班组长') && !isMeeting && !isTravel && (
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">负责人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.workload || ''} onChange={e => setFormData({...formData, workload: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">校核人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.checkerWorkload || ''} onChange={e => setFormData({...formData, checkerWorkload: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">审查人工时(h)</label>
                <input type="number" step="0.5" className="w-full border rounded p-2"
                  value={formData.chiefDesignerWorkload || ''} onChange={e => setFormData({...formData, chiefDesignerWorkload: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        )}

        {/* 差旅任务的出差地点 */}
        {isTravel && (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">出差地点</label>
            <input type="text" className="w-full border rounded p-2"
              value={formData.travelLocation || ''} onChange={e => setFormData({...formData, travelLocation: e.target.value})}
              placeholder="多个城市请用逗号分隔，如：北京,上海,广州" />
          </div>
        )}

        {/* 会议与培训任务的特殊字段 */}
        {isMeeting && (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">参会人员 <span className="text-xs font-normal text-slate-500">({formData.participants?.length || 0}人已选择)</span></label>
            <div className="border rounded p-3 bg-slate-50">
              {/* 搜索和已选人员区域 */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="搜索人员姓名..."
                      value={participantSearchTerm}
                      className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    />
                    {participantSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setParticipantSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                    // 排除系统管理员，只选择班组长和组员
                    const filteredUsers = users.filter(u =>
                      u.status !== '离岗' &&
                      u.systemRole !== '管理员' &&
                      u.userId !== 'admin' &&
                      u.name.toLowerCase().includes(participantSearchTerm.toLowerCase())
                    );
                    const allUserIds = filteredUsers.map(u => u.userId);
                    const allUserNames = filteredUsers.map(u => u.name);

                    if (participantSearchTerm) {
                      // 如果有搜索词，只对搜索结果进行全选/反选
                      const currentParticipants = formData.participants || [];
                      const currentNames = formData.participantNames || [];
                      const allSelected = allUserIds.every(id => currentParticipants.includes(id));

                      if (allSelected) {
                        // 反选搜索结果
                        setFormData({
                          ...formData,
                          Participants: currentParticipants.filter(id => !allUserIds.includes(id)),
                          ParticipantNames: currentNames.filter(name => !allUserNames.includes(name))
                        });
                      } else {
                        // 全选搜索结果
                        const newIds = [...currentParticipants];
                        const newNames = [...currentNames];
                        allUserIds.forEach((id, index) => {
                          if (!newIds.includes(id)) {
                            newIds.push(id);
                            newNames.push(allUserNames[index]);
                          }
                        });
                        setFormData({...formData, participants: newIds, participantNames: newNames});
                      }
                    } else {
                      // 如果没有搜索词，对所有班组长和组员进行全选/反选（排除管理员）
                      const allUserIdsFull = users.filter(u =>
                        u.status !== '离岗' &&
                        u.systemRole !== '管理员' &&
                        u.userId !== 'admin'
                      ).map(u => u.userId);
                      const allUserNamesFull = users.filter(u =>
                        u.status !== '离岗' &&
                        u.systemRole !== '管理员' &&
                        u.userId !== 'admin'
                      ).map(u => u.name);
                      if (formData.participants?.length === allUserIdsFull.length) {
                        setFormData({...formData, participants: [], participantNames: []});
                      } else {
                        setFormData({...formData, participants: allUserIdsFull, participantNames: allUserNamesFull});
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  {participantSearchTerm ?
                    `选择搜索结果 (${users.filter(u =>
                      u.status !== '离岗' &&
                      u.systemRole !== '管理员' &&
                      u.userId !== 'admin' &&
                      u.name.toLowerCase().includes(participantSearchTerm.toLowerCase())
                    ).length}人)` :
                    (formData.participants?.length === users.filter(u => u.status !== '离岗' && u.systemRole !== '管理员' && u.userId !== 'admin').length ? '取消全选' : '全选')
                  }
                </button>
                </div>
                {/* 已选择的人员显示 */}
                {formData.participants && formData.participants.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {formData.participantNames?.filter(name => {
                      const user = users.find(u => u.name === name);
                      return user && user.systemRole !== '管理员' && user.userId !== 'admin';
                    }).map(name => (
                      <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {name}
                        <button
                          type="button"
                          onClick={() => {
                            const user = users.find(u => u.name === name);
                            if (user) {
                              setFormData({
                                ...formData,
                                participants: formData.participants?.filter(id => id !== user.userId) || [],
                                participantNames: formData.participantNames?.filter(n => n !== name) || []
                              });
                            }
                          }}
                          className="text-blue-500 hover:text-blue-700 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 人员选择区域 */}
              <div className="max-h-48 overflow-y-auto">
                {/* 根据搜索词过滤用户（排除系统管理员） */}
                {(() => {
                  const searchLower = participantSearchTerm.toLowerCase();
                  const filteredGroupLeaders = users.filter(u =>
                    u.systemRole === '班组长' &&
                    u.status !== '离岗' &&
                    u.systemRole !== '管理员' &&
                    u.userId !== 'admin' &&
                    u.name.toLowerCase().includes(searchLower)
                  );
                  const filteredMembers = users.filter(u =>
                    u.systemRole === '组员' &&
                    u.status !== '离岗' &&
                    u.systemRole !== '管理员' &&
                    u.userId !== 'admin' &&
                    u.name.toLowerCase().includes(searchLower)
                  );

                  const hasSearchResults = filteredGroupLeaders.length > 0 || filteredMembers.length > 0;

                  return (
                    <div className="space-y-2">
                      {/* 搜索结果提示 */}
                      {participantSearchTerm && !hasSearchResults && (
                        <div className="text-center py-4 text-sm text-slate-500">
                          未找到匹配的人员
                        </div>
                      )}

                      {/* 班组长 */}
                      {filteredGroupLeaders.length > 0 && (
                        <div>
                          <div className="sticky top-0 bg-slate-100 px-2 py-1 border-b">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filteredGroupLeaders.every(u => formData.participants?.includes(u.userId))}
                                onChange={(e) => {
                                  const currentParticipants = formData.participants || [];
                                  const currentNames = formData.participantNames || [];

                                  if (e.target.checked) {
                                    // 添加所有过滤后的班组长
                                    const newIds = [...currentParticipants];
                                    const newNames = [...currentNames];
                                    filteredGroupLeaders.forEach(user => {
                                      if (!newIds.includes(user.userId)) {
                                        newIds.push(user.userId);
                                        newNames.push(user.name);
                                      }
                                    });
                                    setFormData({...formData, participants: newIds, participantNames: newNames});
                                  } else {
                                    // 移除所有过滤后的班组长
                                    setFormData({
                                      ...formData,
                                      Participants: currentParticipants.filter(id => !filteredGroupLeaders.some(g => g.userId === id)),
                                      ParticipantNames: currentNames.filter(name => !filteredGroupLeaders.some(g => g.name === name))
                                    });
                                  }
                                }}
                              />
                              <span className="text-xs font-semibold text-slate-700">
                                班组长 ({filteredGroupLeaders.length}人)
                                {participantSearchTerm && ' - 搜索结果'}
                              </span>
                            </label>
                          </div>
                          <div className="px-2 py-1.5">
                            <div className="grid grid-cols-6 gap-1.5">
                              {filteredGroupLeaders.map(user => (
                                <label key={user.userId} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-1.5 py-1 rounded">
                                  <input
                                    type="checkbox"
                                    checked={formData.participants?.includes(user.userId) || false}
                                    onChange={(e) => {
                                      const currentParticipants = formData.participants || [];
                                      const currentNames = formData.participantNames || [];
                                      if (e.target.checked) {
                                        setFormData({
                                          ...formData,
                                          Participants: [...currentParticipants, user.userId],
                                          ParticipantNames: [...currentNames, user.name]
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          Participants: currentParticipants.filter(id => id !== user.userId),
                                          ParticipantNames: currentNames.filter(name => name !== user.name)
                                        });
                                      }
                                    }}
                                  />
                                  <span className="text-sm truncate">{user.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 组员 */}
                      {filteredMembers.length > 0 && (
                        <div>
                          <div className="sticky top-0 bg-slate-100 px-2 py-1 border-b">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filteredMembers.every(u => formData.participants?.includes(u.userId))}
                                onChange={(e) => {
                                  const currentParticipants = formData.participants || [];
                                  const currentNames = formData.participantNames || [];

                                  if (e.target.checked) {
                                    // 添加所有过滤后的组员
                                    const newIds = [...currentParticipants];
                                    const newNames = [...currentNames];
                                    filteredMembers.forEach(user => {
                                      if (!newIds.includes(user.userId)) {
                                        newIds.push(user.userId);
                                        newNames.push(user.name);
                                      }
                                    });
                                    setFormData({...formData, participants: newIds, participantNames: newNames});
                                  } else {
                                    // 移除所有过滤后的组员
                                    setFormData({
                                      ...formData,
                                      Participants: currentParticipants.filter(id => !filteredMembers.some(m => m.userId === id)),
                                      ParticipantNames: currentNames.filter(name => !filteredMembers.some(m => m.name === name))
                                    });
                                  }
                                }}
                              />
                              <span className="text-xs font-semibold text-slate-700">
                                组员 ({filteredMembers.length}人)
                                {participantSearchTerm && ' - 搜索结果'}
                              </span>
                            </label>
                          </div>
                          <div className="px-2 py-1.5">
                            <div className="grid grid-cols-6 gap-1.5">
                              {filteredMembers.map(user => (
                                <label key={user.userId} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 px-1.5 py-1 rounded">
                                  <input
                                    type="checkbox"
                                    checked={formData.participants?.includes(user.userId) || false}
                                    onChange={(e) => {
                                      const currentParticipants = formData.participants || [];
                                      const currentNames = formData.participantNames || [];
                                      if (e.target.checked) {
                                        setFormData({
                                          ...formData,
                                          Participants: [...currentParticipants, user.userId],
                                          ParticipantNames: [...currentNames, user.name]
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          Participants: currentParticipants.filter(id => id !== user.userId),
                                          ParticipantNames: currentNames.filter(name => name !== user.name)
                                        });
                                      }
                                    }}
                                  />
                                  <span className="text-sm truncate">{user.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
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

      <div className="flex-1 flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{activeTaskClass?.name || '任务管理'}</h2>
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

        <div className="text-sm">
          <p className="flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
            <span className="text-amber-600">
              {activeTaskClass?.notice ? (
                <span dangerouslySetInnerHTML={{ __html: activeTaskClass.notice.replace(/\n/g, '<br/>') }} />
              ) : (
                <span>
                  <strong>注意：</strong> 任务名称请尽量遵循 "[项目名]-[任务类别]" 的格式。差旅和会议任务请务必填写时长以便统计。
                </span>
              )}
            </span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">


          {/* 第一行：任务名称搜索 */}
          <div className="mb-3">
            <label className="block text-xs text-slate-600 mb-1">任务名称</label>
            <input
              type="text"
              placeholder="筛选：输入任务名称关键词..."
              className="w-full border rounded px-3 py-2 text-sm"
              value={filterTaskName}
              onChange={e => setFilterTaskName(e.target.value)}
            />
          </div>

          {/* 第二行：清空筛选 + 其他筛选条件 */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[130px]">
              <button
                onClick={() => {
                  setFilterProject('');
                  setFilterCategory('');
                  setFilterAssignee('');
                  setFilterCapacityLevel('');
                  setFilterStartDateFrom('');
                  setFilterStartDateTo('');
                  setFilterTaskName('');
                  setFilterThisWeek(false);
                  setFilterThisMonth(false);
                  // 会议培训任务和差旅任务不显示状态和强制考核筛选器，所以不清空它们的筛选器
                  if (!isMeeting && !isTravel) {
                    setFilterStatus('');
                    setFilterForceAssessment('');
                  }
                  // Reset to 3 months default time filter
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
                {activeTaskClass && getCategoriesForTaskClass(activeTaskClass.code).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* 会议培训任务和差旅任务不显示状态筛选器 */}
            {!isMeeting && !isTravel && (
              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-600 mb-1">状态</label>
                <select className="w-full border rounded px-2 py-2 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">所有状态</option>
                  {Object.values(TaskStatus).map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="min-w-[130px]">
              <label className="block text-xs text-slate-600 mb-1">负责人</label>
              <select className="w-full border rounded px-2 py-2 text-sm" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
                <option value="">所有负责人</option>
                {users.filter(u => u.status !== '离岗' && u.userId !== 'admin').map(u => <option key={u.userId} value={u.userId}>{u.name}</option>)}
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
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="hidden" checked={filterThisWeek} onChange={e => {
                  setFilterThisWeek(e.target.checked);
                  if (e.target.checked) setFilterThisMonth(false);
                }} />
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors ${filterThisWeek ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterThisWeek ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </span>
                <span className="text-sm text-slate-700 whitespace-nowrap">本周</span>
              </label>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="hidden" checked={filterThisMonth} onChange={e => {
                  setFilterThisMonth(e.target.checked);
                  if (e.target.checked) setFilterThisWeek(false);
                }} />
                <span className={`relative inline-block w-10 h-5 rounded-full transition-colors ${filterThisMonth ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterThisMonth ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </span>
                <span className="text-sm text-slate-700 whitespace-nowrap">本月</span>
              </label>
            </div>
            {/* 会议培训任务和差旅任务不显示强制考核筛选器 */}
            {!isMeeting && !isTravel && (
              <div className="flex items-end pb-2 flex-shrink-0">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="hidden" checked={filterForceAssessment === true} onChange={e => {
                    setFilterForceAssessment(e.target.checked ? true : '');
                  }} />
                  <span className={`relative inline-block w-10 h-5 rounded-full transition-colors ${filterForceAssessment === true ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterForceAssessment === true ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </span>
                  <span className="text-sm text-slate-700 whitespace-nowrap">强制考核</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 会议培训任务专用表格 */}
        {isMeeting && (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">任务名称</th>
                  <th className="px-6 py-4">分类</th>
                  <th className="px-6 py-4">负责人</th>
                  <th className="px-6 py-4">会议日期</th>
                  <th className="px-6 py-4">会议时长</th>
                  <th className="px-6 py-4">参会人数</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(t => (
                  <tr
                    key={t.taskId}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onDoubleClick={() => handleDoubleClick(t)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{t.taskName}</div>
                      <div className="text-xs text-slate-400">{t.taskId}</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span></td>
                    <td className="px-6 py-4">{users.find(u => u.userId === t.assigneeId)?.name || t.assigneeName || '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(t.startDate)}</td>
                    <td className="px-6 py-4 text-slate-500">{t.meetingDuration ? `${t.meetingDuration}h` : '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{t.participants?.length || 0}人</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                      <button onClick={() => { if(confirm('删除任务?')) { apiDataService.deleteTask(t.taskId); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">该分类下暂无任务</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 差旅任务专用表格 */}
        {isTravel && (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">任务名称</th>
                  <th className="px-6 py-4">分类</th>
                  <th className="px-6 py-4">标签</th>
                  <th className="px-6 py-4">负责人</th>
                  <th className="px-6 py-4">出差地点</th>
                  <th className="px-6 py-4">开始日期</th>
                  <th className="px-6 py-4">出差天数</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(t => (
                  <tr
                    key={t.taskId}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onDoubleClick={() => handleDoubleClick(t)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{t.taskName}</div>
                      <div className="text-xs text-slate-400">{t.taskId}</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span></td>
                    <td className="px-6 py-4">{t.travelLabel || '-'}</td>
                    <td className="px-6 py-4">{users.find(u => u.userId === t.assigneeId)?.name || t.assigneeName || '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{t.travelLocation || '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(t.startDate)}</td>
                    <td className="px-6 py-4 text-slate-500">{t.travelDuration ? `${t.travelDuration}天` : '-'}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                      <button onClick={() => { if(confirm('删除任务?')) { apiDataService.deleteTask(t.taskId); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">该分类下暂无任务</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 普通任务表格 */}
        {!isMeeting && !isTravel && (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 font-medium border-b sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4">任务名称</th>
                  <th className="px-6 py-4">分类</th>
                  <th className="px-6 py-4">容量等级</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">负责人</th>
                  <th className="px-6 py-4">校核人</th>
                  <th className="px-6 py-4">开始日</th>
                  <th className="px-6 py-4">截止日</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map(t => (
                  <tr
                    key={t.taskId}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onDoubleClick={() => handleDoubleClick(t)}
                  >
                    <td className="px-6 py-4 relative">
                      {t.isForceAssessment && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                      <div className={`font-medium ${t.isForceAssessment ? 'font-bold text-slate-900' : 'text-slate-900'}`}>{t.taskName}</div>
                      <div className="text-xs text-slate-400">{t.taskId}</div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{t.category}</span></td>
                    <td className="px-6 py-4">{projects.find(p => p.id === t.projectId)?.capacity || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.status === '已完成' ? 'bg-green-100 text-green-700' :
                        t.status === '编制中' ? 'bg-blue-100 text-blue-700' :
                        t.status === '校核中' ? 'bg-yellow-100 text-yellow-700' :
                        t.status === '审查中' ? 'bg-purple-100 text-purple-700' :
                        t.status === '修改中' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{users.find(u => u.userId === t.assigneeId)?.name || t.assigneeName || '-'}</td>
                    <td className="px-6 py-4">{users.find(u => u.userId === t.checkerId)?.name || t.checkerName || '-'}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(t.startDate)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(t.dueDate)}</td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16}/></button>
                      <button onClick={() => { if(confirm('删除任务?')) { apiDataService.deleteTask(t.taskId); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">该分类下暂无任务</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
            <h3 className="text-xl font-bold mb-4">{editingTask ? '编辑任务' : `创建 ${activeTaskClass?.name || '任务'}`}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1"><span className="text-red-500">*</span> 任务名称</label>
                <div className="flex items-center gap-3">
                  <input required type="text" className="flex-1 border rounded p-2 bg-slate-50"
                    value={formData.taskName} onChange={e => setFormData({...formData, taskName: e.target.value})} />
                  {!isMeeting && !isTravel && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="hidden" checked={formData.isForceAssessment || false} onChange={e => setFormData({...formData, isForceAssessment: e.target.checked})} />
                      <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isForceAssessment ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isForceAssessment ? 'translate-x-6' : 'translate-x-0'}`}></span>
                      </span>
                      <span className="text-sm font-medium text-slate-700 whitespace-nowrap">强制考核</span>
                    </label>
                  )}
                </div>
              </div>

              {renderDynamicFields()}

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea className="w-full border rounded p-2 h-20"
                  value={formData.remark || ''} onChange={e => setFormData({...formData, remark: e.target.value})} />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-3 pt-3 border-t">
                <button type="button" onClick={() => { setIsModalOpen(false); setFilterTaskName(''); onClearTargetTaskName?.(); }} className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">保存任务</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 新建项目完整表单模态框 */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <h3 className="text-xl font-bold mb-4">创建新项目</h3>
            <form onSubmit={handleCreateProject} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">项目名称 *</label>
                <input required type="text" className="w-full border rounded p-2"
                  value={projectFormData.name || ''} onChange={e => setProjectFormData({...projectFormData, name: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">工作号</label>
                <input type="text" className="w-full border rounded p-2"
                  value={projectFormData.workNo || ''} onChange={e => setProjectFormData({...projectFormData, workNo: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">启动时间</label>
                <input type="date" className="w-full border rounded p-2"
                  value={projectFormData.startDate || ''} onChange={e => setProjectFormData({...projectFormData, startDate: e.target.value})} />
              </div>

              {/* 所有项目类型都显示容量等级和机型字段 */}
              <>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">容量等级</label>
                  <AutocompleteInput
                    value={projectFormData.capacity || ''}
                    options={capacityLevels}
                    onChange={(value) => setProjectFormData({...projectFormData, capacity: value})}
                    placeholder="选择或输入容量等级"
                    className="w-full border rounded p-2"
                    id="project-capacity-autocomplete"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">机型</label>
                  <AutocompleteInput
                    value={projectFormData.model || ''}
                    options={equipmentModels}
                    onChange={(value) => setProjectFormData({...projectFormData, model: value})}
                    placeholder="选择或输入机型"
                    className="w-full border rounded p-2"
                    id="project-model-autocomplete"
                  />
                </div>
              </>

              {projectFormData.category === ProjectCategory.MARKET && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={projectFormData.isWon || false} onChange={e => setProjectFormData({...projectFormData, isWon: e.target.checked})} />
                    已中标
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={projectFormData.isForeign || false} onChange={e => setProjectFormData({...projectFormData, isForeign: e.target.checked})} />
                    外贸项目
                  </label>
                </div>
              )}

              {(projectFormData.category === ProjectCategory.EXECUTION || projectFormData.category === ProjectCategory.NUCLEAR) && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={projectFormData.isCommissioned || false} onChange={e => setProjectFormData({...projectFormData, isCommissioned: e.target.checked})} />
                    已投运
                  </label>
                </div>
              )}

              {(projectFormData.category === ProjectCategory.RESEARCH || projectFormData.category === ProjectCategory.RENOVATION || projectFormData.category === ProjectCategory.OTHER) && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={projectFormData.isCompleted || false} onChange={e => setProjectFormData({...projectFormData, isCompleted: e.target.checked})} />
                    已完成
                  </label>
                </div>
              )}

              {/* 备注字段 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={projectFormData.remark || ''}
                  onChange={e => setProjectFormData({...projectFormData, remark: e.target.value})}
                  placeholder="输入项目备注信息..."
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">保存项目</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 任务详细信息弹窗 */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* 头部 */}
            <div className="bg-blue-600 text-white px-4 py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded-lg">
                  <Info size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">任务详细信息</h3>
                  <div className="text-xs text-white/80 font-mono">ID: {selectedTask.taskId}</div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* 内容 */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-2">
                {/* 基本信息卡片 */}
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-slate-800">基本信息</h4>
                  </div>
                  <div className="bg-white rounded-md p-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      任务名称
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="text-slate-900 font-medium text-sm pl-[18px]">{selectedTask.taskName}</div>
                      {/* 非差旅任务和会议培训任务显示任务状态 */}
                      {selectedTask.taskClassId !== 'TC007' && selectedTask.taskClassId !== 'TC009' && (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          selectedTask.status === '已完成' ? 'bg-green-100 text-green-700' :
                          selectedTask.status === '编制中' ? 'bg-blue-100 text-blue-700' :
                          selectedTask.status === '校核中' ? 'bg-yellow-100 text-yellow-700' :
                          selectedTask.status === '审查中' ? 'bg-purple-100 text-purple-700' :
                          selectedTask.status === '修改中' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {selectedTask.status}
                        </span>
                      )}
                      {/* 非差旅任务和会议培训任务显示强制考核 */}
                      {selectedTask.taskClassId !== 'TC007' && selectedTask.taskClassId !== 'TC009' && selectedTask.isForceAssessment && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ✓ 强制考核
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 分类信息卡片 */}
                {selectedTask.taskClassId === 'TC009' ? (
                  // 差旅任务显示分类、标签、关联项目
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">分类信息</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          二级分类
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.category || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          标签
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.travelLabel || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          关联项目
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{projects.find(p => p.id === selectedTask.projectId)?.name || '-'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 其他任务显示原有信息
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">分类信息</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          二级分类
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.category || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          关联项目
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{projects.find(p => p.id === selectedTask.projectId)?.name || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          容量等级
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{projects.find(p => p.id === selectedTask.projectId)?.capacity || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 人员信息卡片 */}
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-slate-800">人员信息</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-md p-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                        <UserIcon size={12} className="text-purple-500" />
                        负责人
                      </label>
                      <div className="text-slate-900 font-medium text-sm pl-[18px]">{users.find(u => u.userId === selectedTask.assigneeId)?.name || selectedTask.assigneeName || '-'}</div>
                    </div>
                    {selectedTask.taskClassId !== 'TC009' && selectedTask.taskClassId !== 'TC007' && (
                      <>
                        <div className="bg-white rounded-md p-2">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                            <UserIcon size={12} className="text-purple-500" />
                            校核人
                          </label>
                          <div className="text-slate-900 text-sm pl-[18px]">{users.find(u => u.userId === selectedTask.checkerId)?.name || selectedTask.checkerName || '-'}</div>
                        </div>
                        <div className="bg-white rounded-md p-2">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                            <UserIcon size={12} className="text-purple-500" />
                            审查人
                          </label>
                          <div className="text-slate-900 text-sm pl-[18px]">{users.find(u => u.userId === selectedTask.approverId)?.name || selectedTask.approverName || '-'}</div>
                        </div>
                      </>
                    )}
                    {/* 会议培训任务显示参会人员信息 */}
                    {selectedTask.taskClassId === 'TC007' && (
                      <div className="bg-white rounded-md p-2 col-span-3">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <UserIcon size={12} className="text-purple-500" />
                          参会人员
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">
                          {selectedTask.participantNames && selectedTask.participantNames.length > 0
                            ? selectedTask.participantNames.join('、')
                            : '-'
                          }
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          共 {selectedTask.participants?.length || 0} 人
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 时间信息卡片 */}
                {selectedTask.taskClassId === 'TC009' ? (
                  // 差旅任务显示出差天数和截止日期
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">时间信息</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          开始日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{formatDate(selectedTask.startDate)}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Clock size={12} className="text-amber-500" />
                          出差天数
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.travelDuration ? `${selectedTask.travelDuration}天` : '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          截止日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{formatDate(selectedTask.dueDate)}</div>
                      </div>
                    </div>
                  </div>
                ) : selectedTask.taskClassId === 'TC007' ? (
                  // 会议培训任务显示会议日期、会议时长、完成日期
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">时间信息</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          会议日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{formatDate(selectedTask.startDate)}</div>
                      </div>
                      <div></div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Clock size={12} className="text-amber-500" />
                          会议时长(小时)
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.meetingDuration || '-'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 其他任务显示开始日期、截止日期、完成日期
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">时间信息</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          开始日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{formatDate(selectedTask.startDate)}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Calendar size={12} className="text-amber-500" />
                          截止日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{formatDate(selectedTask.dueDate)}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <CheckCircle size={12} className="text-amber-500" />
                          完成日期
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.completedDate || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 差旅信息 */}
                {selectedTask.taskClassId === 'TC009' && (
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">差旅信息</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <MapPin size={12} className="text-teal-500" />
                          出差地点
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.travelLocation || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 管理员/班组长可见的额外信息（会议培训任务和差旅任务不显示） */}
                {(currentUser?.systemRole === '管理员' || currentUser?.systemRole === '班组长') && selectedTask.taskClassId !== 'TC007' && selectedTask.taskClassId !== 'TC009' && (
                  <div className="bg-white rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-4 bg-rose-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-slate-800">工作量统计</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Clock size={12} className="text-rose-500" />
                          负责人工时(h)
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.workload || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Clock size={12} className="text-rose-500" />
                          校核人工时(h)
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.checkerWorkload || '-'}</div>
                      </div>
                      <div className="bg-white rounded-md p-2">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                          <Clock size={12} className="text-rose-500" />
                          审查人工时(h)
                        </label>
                        <div className="text-slate-900 text-sm pl-[18px]">{selectedTask.approverWorkload || '-'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 创建信息 */}
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-slate-800">创建信息</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-md p-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                        <UserIcon size={12} className="text-emerald-600" />
                        创建人
                      </label>
                      <div className="text-slate-900 font-semibold text-sm pl-[18px]">{users.find(u => u.userId === selectedTask.createdBy)?.name || selectedTask.createdBy || '-'}</div>
                    </div>
                    <div className="bg-white rounded-md p-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                        <Calendar size={12} className="text-emerald-600" />
                        创建时间
                      </label>
                      <div className="text-slate-900 font-semibold text-sm pl-[18px]">{formatDate(selectedTask.createdDate)}</div>
                    </div>
                    <div className="bg-white rounded-md p-2">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                        <Clock size={12} className="text-emerald-600" />
                        任务ID
                      </label>
                      <div className="text-slate-900 font-semibold text-sm font-mono text-xs pl-[18px]">{selectedTask.taskId}</div>
                    </div>
                  </div>
                </div>

                {/* 备注 */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-slate-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-slate-800">备注信息</h4>
                  </div>
                  <div className="bg-white rounded-md p-3 shadow-sm border border-slate-200">
                    <div className="text-slate-900 text-sm leading-relaxed pl-[18px]">
                      {selectedTask.remark || <span className="text-slate-400 italic">暂无备注信息</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="border-t border-slate-200 p-3 bg-slate-50">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all shadow-md"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
