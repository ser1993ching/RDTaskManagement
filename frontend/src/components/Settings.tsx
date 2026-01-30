import React, { useState, useEffect, useCallback } from 'react';
import { User, TaskClass } from '../types';
import {
  Settings as SettingsIcon,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  User as UserIcon,
  Lock,
  Shield,
  Camera,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { apiDataService } from '../services/apiDataService';
import { cn } from '@/utils/classnames';
import {
  useTaskCategories,
  useEquipmentModels,
  useCapacityLevels,
  useTravelLabels,
  useTaskClasses,
  useConfig
} from '../context/ConfigContext';

interface SettingsProps {
  currentUser: User;
  onRefresh: () => void;
}

type TabType = 'task-classes' | 'task-categories' | 'models' | 'capacity-levels' | 'travel-labels' | 'profile' | 'password';

export const Settings: React.FC<SettingsProps> = ({ currentUser, onRefresh }) => {
  const { refreshConfig } = useConfig();
  const { taskCategories, refreshTaskCategories } = useTaskCategories();
  const { equipmentModels, refreshEquipmentModels } = useEquipmentModels();
  const { capacityLevels, refreshCapacityLevels } = useCapacityLevels();
  const { travelLabels, refreshTravelLabels } = useTravelLabels();
  const { taskClasses, refreshTaskClasses } = useTaskClasses();

  const [activeTab, setActiveTab] = useState<TabType>('task-classes');
  const [localTaskCategories, setLocalTaskCategories] = useState<Record<string, string[]>>({});
  const [selectedTaskClassCode, setSelectedTaskClassCode] = useState<string>('');
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [localCapacityLevels, setLocalCapacityLevels] = useState<string[]>([]);
  const [localTravelLabels, setLocalTravelLabels] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [showDeletePasswordPrompt, setShowDeletePasswordPrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [taskClassToDelete, setTaskClassToDelete] = useState<TaskClass | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Profile state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if user is Admin or Leader (使用后端返回的中文值)
  const canManageSettings = currentUser?.systemRole === '管理员' || currentUser?.systemRole === '班组长';

  useEffect(() => {
    // Initialize local state from global config
    setLocalTaskCategories(taskCategories || {});
    setLocalModels(equipmentModels || []);
    setLocalCapacityLevels(capacityLevels || []);
    setLocalTravelLabels(travelLabels || []);

    // Load user avatar
    const loadAvatar = async () => {
      if (currentUser) {
        const userAvatar = await apiDataService.getUserAvatar(currentUser.userId);
        setAvatar(userAvatar);
      }
    };
    loadAvatar();
  }, [currentUser, taskCategories, equipmentModels, capacityLevels, travelLabels]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 刷新配置数据
  const handleConfigChange = async () => {
    await refreshConfig();
    onRefresh?.();
  };

  // Task Class Management
  const handleSaveTaskClass = async (taskClass: TaskClass) => {
    await apiDataService.saveTaskClass(taskClass);
    await refreshTaskClasses();
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别保存成功');
  };

  const handleAddTaskClass = async () => {
    if (!editingValue.trim()) return;
    const [name, code] = editingValue.split('|');
    if (!name || !code) {
      showMessage('error', '请按格式输入：名称|编码');
      return;
    }
    const newTaskClass = {
      id: apiDataService.generateId('TC'),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: '',
    };
    await apiDataService.saveTaskClass(newTaskClass);
    await refreshTaskClasses();
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别添加成功');
  };

  const handleDeleteTaskClass = async (id: string) => {
    // 检查是否有任务依赖这个任务类别
    const usage = apiDataService.checkTaskClassUsage(id);
    const taskClass = taskClasses.find(tc => tc.id === id);

    if (!taskClass) {
      showMessage('error', '任务类别不存在');
      return;
    }

    // 重要任务类别列表（需要密码验证）
    const importantTaskClassCodes = ['TC001', 'TC002', 'TC003', 'TC004', 'TC005', 'TC006', 'TC007', 'TC008', 'TC009'];

    // 如果是重要类别，需要密码验证
    if (importantTaskClassCodes.includes(taskClass.code)) {
      setTaskClassToDelete(taskClass);
      setShowDeletePasswordPrompt(true);
      return;
    }

    let confirmMessage = '';
    if (usage.hasTasks) {
      confirmMessage = `⚠️ 警告：删除任务类别"${taskClass.name}"可能会影响以下内容：\n\n` +
                      `• 该类别下有 ${usage.taskCount} 个任务\n` +
                      `• 删除后，这些任务将无法正常显示\n` +
                      `• 相关的任务分类也将被删除\n\n` +
                      `建议：\n` +
                      `1. 先将任务移动到其他类别，或\n` +
                      `2. 删除这些任务后再删除类别\n\n` +
                      `确定要继续删除吗？`;
    } else {
      confirmMessage = `确定要删除任务类别"${taskClass.name}"吗？\n\n` +
                      `这将会同时删除该类别下的所有分类，且无法恢复。`;
    }

    if (confirm(confirmMessage)) {
      await apiDataService.deleteTaskClass(id);
      await refreshTaskClasses();
      handleConfigChange();
      showMessage('success', '任务类别删除成功');
    }
  };

  const handlePasswordVerification = async () => {
    // 使用管理员密码作为删除验证密码
    // 默认管理员密码是 'admin'
    if (deletePassword === 'admin') {
      if (taskClassToDelete) {
        await apiDataService.deleteTaskClass(taskClassToDelete.id);
        await refreshTaskClasses();
        handleConfigChange();
        showMessage('success', '任务类别删除成功');
      }
      setShowDeletePasswordPrompt(false);
      setDeletePassword('');
      setTaskClassToDelete(null);
    } else {
      showMessage('error', '密码错误，删除已取消');
      setShowDeletePasswordPrompt(false);
      setDeletePassword('');
      setTaskClassToDelete(null);
    }
  };

  const cancelPasswordVerification = () => {
    setShowDeletePasswordPrompt(false);
    setDeletePassword('');
    setTaskClassToDelete(null);
  };

  const handleUpdateTaskClass = async () => {
    if (!editingItem || !editingValue.trim()) return;
    const taskClass = taskClasses.find(tc => tc.id === editingItem);
    if (!taskClass) return;

    taskClass.name = editingValue.trim();
    await apiDataService.saveTaskClass(taskClass);
    await refreshTaskClasses();
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别更新成功');
  };

  // Notice editing state
  const [editingNotice, setEditingNotice] = useState<string | null>(null);
  const [editingNoticeValue, setEditingNoticeValue] = useState('');

  const startEditingNotice = (taskClassId: string, currentNotice: string | undefined) => {
    setEditingNotice(taskClassId);
    setEditingNoticeValue(currentNotice || '');
  };

  const cancelEditingNotice = () => {
    setEditingNotice(null);
    setEditingNoticeValue('');
  };

  const saveTaskClassNotice = async (taskClassId: string) => {
    const taskClass = taskClasses.find(tc => tc.id === taskClassId);
    if (!taskClass) return;

    taskClass.notice = editingNoticeValue.trim();
    await apiDataService.saveTaskClass(taskClass);
    await refreshTaskClasses();
    handleConfigChange();
    setEditingNotice(null);
    setEditingNoticeValue('');
    showMessage('success', '任务类别提示文字保存成功');
  };

  // Task Category Management
  const handleAddTaskCategory = async (taskClassCode: string) => {
    if (!taskClassCode || !editingValue.trim()) {
      showMessage('error', '请输入分类名称');
      return;
    }
    await apiDataService.addTaskCategory(taskClassCode, editingValue.trim());
    const categories = await apiDataService.getTaskCategories();
    setLocalTaskCategories(categories);
    handleConfigChange();
    setEditingValue('');
    showMessage('success', '任务分类添加成功');
  };

  const handleDeleteTaskCategory = async (taskClassCode: string, categoryName: string) => {
    if (!taskClassCode) return;
    if (confirm(`确定要删除分类"${categoryName}"吗？`)) {
      await apiDataService.deleteTaskCategory(taskClassCode, categoryName);
      const categories = await apiDataService.getTaskCategories();
      setLocalTaskCategories(categories);
      handleConfigChange();
      showMessage('success', '任务分类删除成功');
    }
  };

  const handleUpdateTaskCategory = async (taskClassCode: string, oldCategoryName: string, newCategoryName: string) => {
    if (!taskClassCode || !newCategoryName.trim()) {
      showMessage('error', '分类名称不能为空');
      return;
    }
    await apiDataService.updateTaskCategory(taskClassCode, oldCategoryName, newCategoryName.trim());
    const categories = await apiDataService.getTaskCategories();
    setLocalTaskCategories(categories);
    handleConfigChange();
    setEditingCategory(null);
    setEditingCategoryValue('');
    showMessage('success', '任务分类更新成功');
  };

  const startEditingCategory = (categoryName: string) => {
    setEditingCategory(categoryName);
    setEditingCategoryValue(categoryName);
  };

  const cancelEditingCategory = () => {
    setEditingCategory(null);
    setEditingCategoryValue('');
  };

  // Drag and Drop handlers
  const handleDragStart = (taskClassCode: string) => (e: React.DragEvent, categoryName: string) => {
    setDraggedCategory(categoryName);
    e.dataTransfer.effectAllowed = 'move';
    // Store task class code in dataTransfer for later use
    e.dataTransfer.setData('text/plain', taskClassCode);
  };

  const handleDragOver = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverCategory(categoryName);
  };

  const handleDragLeave = () => {
    setDraggedOverCategory(null);
  };

  const handleDrop = (taskClassCode: string) => async (e: React.DragEvent, targetCategoryName: string) => {
    e.preventDefault();
    if (!draggedCategory || draggedCategory === targetCategoryName) {
      setDraggedCategory(null);
      setDraggedOverCategory(null);
      return;
    }

    const categories = taskCategories[taskClassCode];
    if (!categories) return;

    const newOrder = [...categories];
    const draggedIndex = newOrder.indexOf(draggedCategory);
    const targetIndex = newOrder.indexOf(targetCategoryName);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedCategory);

      await apiDataService.reorderTaskCategories(taskClassCode, newOrder);
      const updatedCategories = await apiDataService.getTaskCategories();
      setLocalTaskCategories(updatedCategories);
      handleConfigChange();
    }

    setDraggedCategory(null);
    setDraggedOverCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDraggedOverCategory(null);
  };

  // Move category up
  const moveCategoryUp = async (taskClassCode: string, categoryName: string) => {
    const categories = taskCategories[taskClassCode];
    if (!categories) return;

    const currentIndex = categories.indexOf(categoryName);
    if (currentIndex <= 0) return; // Already at the top

    const newOrder = [...categories];
    // Swap with previous element
    [newOrder[currentIndex], newOrder[currentIndex - 1]] =
    [newOrder[currentIndex - 1], newOrder[currentIndex]];

    await apiDataService.reorderTaskCategories(taskClassCode, newOrder);
    const updatedCategories = await apiDataService.getTaskCategories();
    setLocalTaskCategories(updatedCategories);
    handleConfigChange();
  };

  // Move category down
  const moveCategoryDown = async (taskClassCode: string, categoryName: string) => {
    const categories = localTaskCategories[taskClassCode];
    if (!categories) return;

    const currentIndex = categories.indexOf(categoryName);
    if (currentIndex === -1 || currentIndex >= categories.length - 1) return; // Already at the bottom

    const newOrder = [...categories];
    // Swap with next element
    [newOrder[currentIndex], newOrder[currentIndex + 1]] =
    [newOrder[currentIndex + 1], newOrder[currentIndex]];

    await apiDataService.reorderTaskCategories(taskClassCode, newOrder);
    const updatedCategories = await apiDataService.getTaskCategories();
    setLocalTaskCategories(updatedCategories);
    handleConfigChange();
  };

  // Model Management
  const handleAddModel = async () => {
    if (!editingValue.trim()) return;
    await apiDataService.saveEquipmentModel(editingValue.trim());
    const models = await apiDataService.getEquipmentModels();
    setLocalModels(models);
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '机型添加成功');
  };

  const handleDeleteModel = async (model: string) => {
    if (confirm('确定要删除此机型吗？')) {
      await apiDataService.deleteEquipmentModel(model);
      const models = await apiDataService.getEquipmentModels();
      setLocalModels(models);
      handleConfigChange();
      showMessage('success', '机型删除成功');
    }
  };

  // Capacity Level Management
  const handleAddCapacityLevel = async () => {
    if (!editingValue.trim()) return;
    await apiDataService.saveCapacityLevel(editingValue.trim());
    const levels = await apiDataService.getCapacityLevels();
    setLocalCapacityLevels(levels);
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '容量等级添加成功');
  };

  const handleDeleteCapacityLevel = async (level: string) => {
    if (confirm('确定要删除此容量等级吗？')) {
      await apiDataService.deleteCapacityLevel(level);
      const levels = await apiDataService.getCapacityLevels();
      setLocalCapacityLevels(levels);
      handleConfigChange();
      showMessage('success', '容量等级删除成功');
    }
  };

  // Travel Label Management
  const handleAddTravelLabel = async () => {
    if (!editingValue.trim()) return;
    await apiDataService.saveTravelLabel(editingValue.trim());
    const labels = await apiDataService.getTravelLabels();
    setLocalTravelLabels(labels);
    handleConfigChange();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '差旅标签添加成功');
  };

  const handleDeleteTravelLabel = async (label: string) => {
    if (confirm('确定要删除此差旅标签吗？')) {
      await apiDataService.deleteTravelLabel(label);
      const labels = await apiDataService.getTravelLabels();
      setLocalTravelLabels(labels);
      handleConfigChange();
      showMessage('success', '差旅标签删除成功');
    }
  };

  // Avatar Management
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage('error', '请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarFile(file);
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatar || !currentUser) return;
    await apiDataService.saveUserAvatar(currentUser.userId, avatar);
    showMessage('success', '头像保存成功');
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser) return;
    if (confirm('确定要删除头像吗？')) {
      await apiDataService.deleteUserAvatar(currentUser.userId);
      setAvatar(null);
      setAvatarFile(null);
      showMessage('success', '头像删除成功');
    }
  };

  // Password Change
  const handlePasswordChange = async () => {
    if (!currentUser) {
      showMessage('error', '用户信息不存在');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('error', '新密码与确认密码不一致');
      return;
    }

    if (newPassword.length < 3) {
      showMessage('error', '密码长度不能少于3位');
      return;
    }

    const success = await apiDataService.changePassword(currentUser.userId, currentPassword, newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', '密码修改成功');
    } else {
      showMessage('error', '当前密码不正确');
    }
  };

  const tabs = [
    { id: 'task-classes', label: '任务类别管理', icon: Edit2 },
    { id: 'task-categories', label: '任务分类管理', icon: Edit2 },
    { id: 'models', label: '机型管理', icon: Shield },
    { id: 'capacity-levels', label: '容量等级管理', icon: Shield },
    { id: 'travel-labels', label: '差旅标签设置', icon: Shield },
    { id: 'profile', label: '用户资料', icon: UserIcon },
    { id: 'password', label: '密码管理', icon: Lock },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <SettingsIcon className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">系统设置</h2>
              <p className="text-slate-500">管理系统配置和用户设置</p>
            </div>
          </div>
          {/* Refresh Button */}
          <button
            onClick={async () => {
              await refreshConfig();
              showMessage('success', '配置已刷新');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
            {isLoading ? '刷新中...' : '刷新配置'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Task Class Management */}
        {activeTab === 'task-classes' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">任务类别管理</h3>
            {!canManageSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">⚠️ 只有管理员和班组长可以管理任务类别</p>
              </div>
            )}
            <div className="space-y-3">
              {canManageSettings && editingItem === 'new-task-class' ? (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      任务类别信息 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      placeholder="格式：任务类名称|编码 (如：市场配合|MARKET)"
                      className="w-full border border-slate-300 rounded px-3 py-2"
                    />
                    <p className="text-xs text-slate-500 mt-1">请使用 "|" 分隔名称和编码</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddTaskClass} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                      <Save size={16} />
                      保存
                    </button>
                    <button onClick={() => { setEditingItem(null); setEditingValue(''); }} className="px-4 py-2 bg-slate-300 rounded flex items-center gap-2">
                      <X size={16} />
                      取消
                    </button>
                  </div>
                </div>
              ) : canManageSettings && (
                <button
                  onClick={() => setEditingItem('new-task-class')}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 新增任务类别
                </button>
              )}

              {taskClasses.map(taskClass => {
                const usage = apiDataService.checkTaskClassUsage(taskClass.id);
                return (
                  <div key={taskClass.id} className="bg-slate-50 rounded-lg">
                    {editingItem === taskClass.id ? (
                      <div className="p-4">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            任务类别名称 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleUpdateTaskClass} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                            <Save size={16} />
                            保存
                          </button>
                          <button onClick={() => { setEditingItem(null); setEditingValue(''); }} className="px-4 py-2 bg-slate-300 rounded flex items-center gap-2">
                            <X size={16} />
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{taskClass.name}</p>
                            <p className="text-sm text-slate-500">{taskClass.code} - {taskClass.description}</p>
                          </div>
                          {canManageSettings && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(taskClass.id);
                                  setEditingValue(taskClass.name);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                                title="编辑任务类别名称"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTaskClass(taskClass.id)}
                                className={`p-2 rounded ${
                                  usage.hasTasks
                                    ? 'text-orange-600 hover:bg-orange-100'
                                    : 'text-red-600 hover:bg-red-100'
                                }`}
                                title={usage.hasTasks ? `有 ${usage.taskCount} 个任务依赖，删除需谨慎` : '删除任务类别'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Notice/提示文字编辑区域 */}
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                              <span className="w-1 h-3 bg-amber-500 rounded-full"></span>
                              任务管理界面提示文字
                            </label>
                            {canManageSettings && editingNotice !== taskClass.id && (
                              <button
                                onClick={() => startEditingNotice(taskClass.id, taskClass.notice)}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Edit2 size={12} />
                                {taskClass.notice ? '编辑' : '添加'}
                              </button>
                            )}
                          </div>

                          {editingNotice === taskClass.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingNoticeValue}
                                onChange={(e) => setEditingNoticeValue(e.target.value)}
                                placeholder="输入该任务类别在任务管理界面显示的提示说明..."
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveTaskClassNotice(taskClass.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                                >
                                  <Save size={14} />
                                  保存
                                </button>
                                <button
                                  onClick={cancelEditingNotice}
                                  className="px-3 py-1.5 bg-slate-300 text-slate-700 rounded text-sm flex items-center gap-1"
                                >
                                  <X size={14} />
                                  取消
                                </button>
                              </div>
                            </div>
                          ) : taskClass.notice ? (
                            <p className="text-sm text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">
                              {taskClass.notice}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">
                              未设置提示文字，将使用系统默认提示
                            </p>
                          )}
                        </div>

                        {/* 显示统计信息 */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            分类: {localTaskCategories[taskClass.code]?.length || 0} 个
                          </span>
                          {usage.hasTasks ? (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                              任务: {usage.taskCount} 个（删除需谨慎）
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              任务: 0 个（可安全删除）
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Category Management */}
        {activeTab === 'task-categories' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">任务分类管理</h3>
            {!canManageSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">⚠️ 只有管理员和班组长可以管理任务分类</p>
              </div>
            )}
            <div className="text-sm text-slate-600 mb-4">
              💡 提示：可以通过拖拽分类项或点击上移/下移按钮调整顺序，任务管理界面中的分类顺序将与此保持一致
            </div>
            <div className="space-y-6">
              {taskClasses.map(taskClass => {
                const categories = localTaskCategories[taskClass.code] || [];
                return (
                  <div key={taskClass.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    {/* Task Class Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{taskClass.name}</h4>
                          <p className="text-xs text-slate-500">{taskClass.code} - {taskClass.description}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {categories.length} 个分类
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Add Category */}
                      {canManageSettings && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="mb-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              新增分类 <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={selectedTaskClassCode === taskClass.code ? editingValue : ''}
                              onChange={(e) => {
                                setSelectedTaskClassCode(taskClass.code);
                                setEditingValue(e.target.value);
                              }}
                              placeholder="输入分类名称"
                              className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddTaskCategory(taskClass.code)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Save size={14} />
                              添加
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTaskClassCode(taskClass.code);
                                setEditingValue('');
                              }}
                              className="px-3 py-1.5 bg-slate-300 rounded text-sm flex items-center gap-1"
                            >
                              <X size={14} />
                              清空
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Category List */}
                      {categories.length > 0 ? (
                        <div
                          className="space-y-2"
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {categories.map((category, index) => (
                            <div
                              key={category}
                              className={`group flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 transition-all ${
                                draggedCategory === category ? 'opacity-50' : ''
                              } ${
                                draggedOverCategory === category ? 'border-blue-500 bg-blue-50' : ''
                              } ${
                                canManageSettings && editingCategory !== category ? 'hover:border-blue-300' : ''
                              }`}
                            >
                              {/* Drag Handle */}
                              {canManageSettings && editingCategory !== category && (
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStart(taskClass.code)(e, category)}
                                  onDragOver={(e) => handleDragOver(e, category)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(taskClass.code)(e, category)}
                                  onDragEnd={handleDragEnd}
                                  className="text-slate-400 hover:text-slate-600 cursor-move select-none"
                                  title="拖拽排序"
                                >
                                  <GripVertical size={16} />
                                </div>
                              )}
                              {(!canManageSettings || editingCategory === category) && <div className="w-4"></div>}

                              {/* Category Content */}
                              <div className="flex-1">
                                {editingCategory === category ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editingCategoryValue}
                                      onChange={(e) => setEditingCategoryValue(e.target.value)}
                                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateTaskCategory(taskClass.code, category, editingCategoryValue)}
                                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                                      >
                                        <Save size={12} />
                                        保存
                                      </button>
                                      <button
                                        onClick={cancelEditingCategory}
                                        className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-xs flex items-center gap-1"
                                      >
                                        <X size={12} />
                                        取消
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-slate-900">{category}</span>
                                    {canManageSettings && (
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Move Up Button */}
                                        <button
                                          onClick={() => moveCategoryUp(taskClass.code, category)}
                                          disabled={index === 0}
                                          className={`p-1 rounded ${
                                            index === 0
                                              ? 'text-slate-300 cursor-not-allowed'
                                              : 'text-slate-600 hover:bg-slate-200'
                                          }`}
                                          title="上移"
                                        >
                                          <ChevronUp size={14} />
                                        </button>
                                        {/* Move Down Button */}
                                        <button
                                          onClick={() => moveCategoryDown(taskClass.code, category)}
                                          disabled={index === categories.length - 1}
                                          className={`p-1 rounded ${
                                            index === categories.length - 1
                                              ? 'text-slate-300 cursor-not-allowed'
                                              : 'text-slate-600 hover:bg-slate-200'
                                          }`}
                                          title="下移"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                        {/* Edit Button */}
                                        <button
                                          onClick={() => startEditingCategory(category)}
                                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                          title="编辑分类名称"
                                        >
                                          <Edit2 size={14} />
                                        </button>
                                        {/* Delete Button */}
                                        <button
                                          onClick={() => handleDeleteTaskCategory(taskClass.code, category)}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                          title="删除分类"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                          <p>该任务类别下暂无分类</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Model Management */}
        {activeTab === 'models' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">机型管理</h3>
            {!canManageSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">⚠️ 只有管理员和班组长可以管理机型</p>
              </div>
            )}
            <div className="space-y-3">
              {canManageSettings && editingItem === 'new-model' ? (
                <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="输入机型名称"
                    className="flex-1 border border-slate-300 rounded px-3 py-2"
                  />
                  <button onClick={handleAddModel} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Save size={16} />
                  </button>
                  <button onClick={() => { setEditingItem(null); setEditingValue(''); }} className="px-4 py-2 bg-slate-300 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : canManageSettings && (
                <button
                  onClick={() => setEditingItem('new-model')}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 添加机型
                </button>
              )}

              {localModels.map(model => (
                <div key={model} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium">{model}</span>
                  {canManageSettings && (
                    <button
                      onClick={() => handleDeleteModel(model)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Capacity Level Management */}
        {activeTab === 'capacity-levels' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">容量等级管理</h3>
            {!canManageSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">⚠️ 只有管理员和班组长可以管理容量等级</p>
              </div>
            )}
            <div className="space-y-3">
              {canManageSettings && editingItem === 'new-level' ? (
                <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="输入容量等级"
                    className="flex-1 border border-slate-300 rounded px-3 py-2"
                  />
                  <button onClick={handleAddCapacityLevel} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Save size={16} />
                  </button>
                  <button onClick={() => { setEditingItem(null); setEditingValue(''); }} className="px-4 py-2 bg-slate-300 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : canManageSettings && (
                <button
                  onClick={() => setEditingItem('new-level')}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 添加容量等级
                </button>
              )}

              {localCapacityLevels.map(level => (
                <div key={level} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium">{level}</span>
                  {canManageSettings && (
                    <button
                      onClick={() => handleDeleteCapacityLevel(level)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Travel Label Management */}
        {activeTab === 'travel-labels' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">差旅标签设置</h3>
            {!canManageSettings && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">⚠️ 只有管理员和班组长可以管理差旅标签</p>
              </div>
            )}
            <div className="space-y-3">
              {canManageSettings && editingItem === 'new-label' ? (
                <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="输入差旅标签"
                    className="flex-1 border border-slate-300 rounded px-3 py-2"
                  />
                  <button onClick={handleAddTravelLabel} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Save size={16} />
                  </button>
                  <button onClick={() => { setEditingItem(null); setEditingValue(''); }} className="px-4 py-2 bg-slate-300 rounded">
                    <X size={16} />
                  </button>
                </div>
              ) : canManageSettings && (
                <button
                  onClick={() => setEditingItem('new-label')}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> 添加差旅标签
                </button>
              )}

              {localTravelLabels.map(label => (
                <div key={label} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium">{label}</span>
                  {canManageSettings && (
                    <button
                      onClick={() => handleDeleteTravelLabel(label)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile */}
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">用户资料</h3>
            <div className="max-w-md">
              {/* Avatar Section */}
              {currentUser && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">头像</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                          {currentUser.name?.charAt(0)}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg">
                        <Camera size={14} />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAvatar}
                        disabled={!avatarFile}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        保存头像
                      </button>
                      {avatar && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* User Info */}
              {currentUser && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">工号</label>
                    <p className="mt-1 text-slate-900">{currentUser.userId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">姓名</label>
                    <p className="mt-1 text-slate-900">{currentUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">角色</label>
                    <p className="mt-1 text-slate-900">{currentUser.systemRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">办公地点</label>
                    <p className="mt-1 text-slate-900">{currentUser.officeLocation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">状态</label>
                    <p className="mt-1 text-slate-900">{currentUser.status}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Management */}
        {activeTab === 'password' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">修改密码</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">当前密码</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="请输入新密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="请再次输入新密码"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={18} />
                修改密码
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Verification Dialog */}
      {showDeletePasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Lock className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">密码验证</h3>
              </div>
              <p className="text-slate-600 text-sm mb-2">
                您正在尝试删除重要任务类别：
              </p>
              <p className="font-medium text-slate-900 mb-4">
                {taskClassToDelete?.name} ({taskClassToDelete?.code})
              </p>
              <p className="text-red-600 text-sm mb-4">
                ⚠️ 重要任务类别删除需要验证密码
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                请输入管理员密码：
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && deletePassword.trim()) {
                    handlePasswordVerification();
                  }
                }}
                placeholder="请输入密码"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePasswordVerification}
                disabled={!deletePassword.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Shield size={16} />
                确认删除
              </button>
              <button
                onClick={cancelPasswordVerification}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
