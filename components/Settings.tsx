import React, { useState, useEffect } from 'react';
import { User, TaskClass, SystemRole } from '../types';
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
  Camera
} from 'lucide-react';
import { dataService } from '../services/dataService';

interface SettingsProps {
  currentUser: User;
}

type TabType = 'task-classes' | 'task-categories' | 'models' | 'capacity-levels' | 'travel-labels' | 'profile' | 'password';

export const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('task-classes');
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]);
  const [taskCategories, setTaskCategories] = useState<Record<string, string[]>>({});
  const [selectedTaskClassCode, setSelectedTaskClassCode] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const [capacityLevels, setCapacityLevels] = useState<string[]>([]);
  const [travelLabels, setTravelLabels] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if user is Admin or Leader
  const canManageSettings = currentUser?.SystemRole === SystemRole.ADMIN || currentUser?.SystemRole === SystemRole.LEADER;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTaskClasses(dataService.getTaskClasses());
    setTaskCategories(dataService.getTaskCategories());
    setModels(dataService.getEquipmentModels());
    setCapacityLevels(dataService.getCapacityLevels());
    setTravelLabels(dataService.getTravelLabels());
    if (currentUser) {
      const userAvatar = dataService.getAvatar(currentUser.UserID);
      setAvatar(userAvatar);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Task Class Management
  const handleSaveTaskClass = (taskClass: TaskClass) => {
    dataService.saveTaskClass(taskClass);
    loadData();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别保存成功');
  };

  const handleAddTaskClass = () => {
    if (!editingValue.trim()) return;
    const [name, code] = editingValue.split('|');
    if (!name || !code) {
      showMessage('error', '请按格式输入：名称|编码');
      return;
    }
    const newTaskClass: TaskClass = {
      id: dataService.generateId('TC'),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: '',
    };
    dataService.saveTaskClass(newTaskClass);
    loadData();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别添加成功');
  };

  const handleDeleteTaskClass = (id: string) => {
    if (confirm('确定要删除此任务类别吗？')) {
      dataService.deleteTaskClass(id);
      loadData();
      showMessage('success', '任务类别删除成功');
    }
  };

  const handleUpdateTaskClass = () => {
    if (!editingItem || !editingValue.trim()) return;
    const taskClass = taskClasses.find(tc => tc.id === editingItem);
    if (!taskClass) return;

    taskClass.name = editingValue.trim();
    dataService.saveTaskClass(taskClass);
    loadData();
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '任务类别更新成功');
  };

  // Task Category Management
  const handleAddTaskCategory = () => {
    if (!selectedTaskClassCode || !editingValue.trim()) {
      showMessage('error', '请选择任务类别并输入分类名称');
      return;
    }
    dataService.addTaskCategory(selectedTaskClassCode, editingValue.trim());
    setTaskCategories(dataService.getTaskCategories());
    setEditingValue('');
    showMessage('success', '任务分类添加成功');
  };

  const handleDeleteTaskCategory = (categoryName: string) => {
    if (!selectedTaskClassCode) return;
    if (confirm(`确定要删除分类"${categoryName}"吗？`)) {
      dataService.deleteTaskCategory(selectedTaskClassCode, categoryName);
      setTaskCategories(dataService.getTaskCategories());
      showMessage('success', '任务分类删除成功');
    }
  };

  const handleUpdateTaskCategory = (oldCategoryName: string, newCategoryName: string) => {
    if (!selectedTaskClassCode || !newCategoryName.trim()) {
      showMessage('error', '分类名称不能为空');
      return;
    }
    dataService.updateTaskCategory(selectedTaskClassCode, oldCategoryName, newCategoryName.trim());
    setTaskCategories(dataService.getTaskCategories());
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

  // Model Management
  const handleAddModel = () => {
    if (!editingValue.trim()) return;
    dataService.saveEquipmentModel(editingValue.trim());
    setModels(dataService.getEquipmentModels());
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '机型添加成功');
  };

  const handleDeleteModel = (model: string) => {
    if (confirm('确定要删除此机型吗？')) {
      dataService.deleteEquipmentModel(model);
      setModels(dataService.getEquipmentModels());
      showMessage('success', '机型删除成功');
    }
  };

  // Capacity Level Management
  const handleAddCapacityLevel = () => {
    if (!editingValue.trim()) return;
    dataService.saveCapacityLevel(editingValue.trim());
    setCapacityLevels(dataService.getCapacityLevels());
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '容量等级添加成功');
  };

  const handleDeleteCapacityLevel = (level: string) => {
    if (confirm('确定要删除此容量等级吗？')) {
      dataService.deleteCapacityLevel(level);
      setCapacityLevels(dataService.getCapacityLevels());
      showMessage('success', '容量等级删除成功');
    }
  };

  // Travel Label Management
  const handleAddTravelLabel = () => {
    if (!editingValue.trim()) return;
    dataService.saveTravelLabel(editingValue.trim());
    setTravelLabels(dataService.getTravelLabels());
    setEditingItem(null);
    setEditingValue('');
    showMessage('success', '差旅标签添加成功');
  };

  const handleDeleteTravelLabel = (label: string) => {
    if (confirm('确定要删除此差旅标签吗？')) {
      dataService.deleteTravelLabel(label);
      setTravelLabels(dataService.getTravelLabels());
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

  const handleSaveAvatar = () => {
    if (!avatar || !currentUser) return;
    dataService.saveAvatar(currentUser.UserID, avatar);
    showMessage('success', '头像保存成功');
  };

  const handleRemoveAvatar = () => {
    if (!currentUser) return;
    if (confirm('确定要删除头像吗？')) {
      dataService.deleteAvatar(currentUser.UserID);
      setAvatar(null);
      setAvatarFile(null);
      showMessage('success', '头像删除成功');
    }
  };

  // Password Change
  const handlePasswordChange = () => {
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

    const success = dataService.changePassword(currentUser.UserID, currentPassword, newPassword);
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
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <SettingsIcon className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">系统设置</h2>
            <p className="text-slate-500">管理系统配置和用户设置</p>
          </div>
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

              {taskClasses.map(taskClass => (
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
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{taskClass.name}</p>
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
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTaskClass(taskClass.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
            <div className="space-y-4">
              {/* Task Class Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择任务类别 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTaskClassCode}
                  onChange={(e) => setSelectedTaskClassCode(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2"
                >
                  <option value="">请选择任务类别</option>
                  {taskClasses.map(taskClass => (
                    <option key={taskClass.id} value={taskClass.code}>
                      {taskClass.name} ({taskClass.code})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTaskClassCode && (
                <>
                  {/* Add Category */}
                  {canManageSettings && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          新增分类 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          placeholder="输入分类名称"
                          className="w-full border border-slate-300 rounded px-3 py-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleAddTaskCategory} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                          <Save size={16} />
                          添加
                        </button>
                        <button onClick={() => setEditingValue('')} className="px-4 py-2 bg-slate-300 rounded flex items-center gap-2">
                          <X size={16} />
                          清空
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Category List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-slate-700">
                      分类列表 ({taskCategories[selectedTaskClassCode]?.length || 0} 个)
                    </h4>
                    {taskCategories[selectedTaskClassCode] && taskCategories[selectedTaskClassCode].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {taskCategories[selectedTaskClassCode].map(category => (
                          <div key={category} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            {editingCategory === category ? (
                              // 编辑模式
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingCategoryValue}
                                  onChange={(e) => setEditingCategoryValue(e.target.value)}
                                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateTaskCategory(category, editingCategoryValue)}
                                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                                  >
                                    <Save size={14} />
                                    保存
                                  </button>
                                  <button
                                    onClick={cancelEditingCategory}
                                    className="flex-1 px-3 py-1.5 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400 flex items-center justify-center gap-1"
                                  >
                                    <X size={14} />
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // 显示模式
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900">{category}</span>
                                {canManageSettings && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEditingCategory(category)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                      title="编辑分类名称"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTaskCategory(category)}
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p>该任务类别下暂无分类</p>
                      </div>
                    )}
                  </div>
                </>
              )}
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

              {models.map(model => (
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

              {capacityLevels.map(level => (
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

              {travelLabels.map(label => (
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
                          {currentUser.Name.charAt(0)}
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
                    <p className="mt-1 text-slate-900">{currentUser.UserID}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">姓名</label>
                    <p className="mt-1 text-slate-900">{currentUser.Name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">角色</label>
                    <p className="mt-1 text-slate-900">{currentUser.SystemRole}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">办公地点</label>
                    <p className="mt-1 text-slate-900">{currentUser.OfficeLocation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">状态</label>
                    <p className="mt-1 text-slate-900">{currentUser.Status}</p>
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
    </div>
  );
};
