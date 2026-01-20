import React, { useState, useMemo, useEffect } from 'react';
import { Project, ProjectCategory, User, SystemRole } from '../types';
import { Plus, Download, Edit2, Trash2, Filter, X, RefreshCw } from 'lucide-react';
import { apiDataService } from '../services/apiDataService';
import AutocompleteInput from './AutocompleteInput';

interface ProjectViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onRefresh: () => void;
}

interface FilterCriteria {
  name: string;
  workNo: string;
  capacity: string;
  model: string;
  startDateFrom: string;
  startDateTo: string;
  isWon?: boolean;
  isForeign?: boolean;
  isCommissioned?: boolean;
  isCompleted?: boolean;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ currentUser, projects, users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>(ProjectCategory.MARKET);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    name: '',
    workNo: '',
    capacity: '',
    model: '',
    startDateFrom: '',
    startDateTo: ''
  });
  const [equipmentModels, setEquipmentModels] = useState<string[]>([]);
  const [capacityLevels, setCapacityLevels] = useState<string[]>([]);

  const canEdit = currentUser.SystemRole === SystemRole.ADMIN || currentUser.SystemRole === SystemRole.LEADER;

  // 加载设置数据
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

  // 筛选项目列表
  const filteredProjects = useMemo(() => {
    let result = projects.filter(p => p.category === activeTab);

    // 名称筛选（模糊匹配）
    if (filters.name) {
      result = result.filter(p => p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    // 工作号筛选（模糊匹配）
    if (filters.workNo) {
      result = result.filter(p => (p.workNo || '').toLowerCase().includes(filters.workNo.toLowerCase()));
    }

    // 容量等级筛选
    if (filters.capacity) {
      result = result.filter(p => (p.capacity || '').toLowerCase().includes(filters.capacity.toLowerCase()));
    }

    // 机型筛选
    if (filters.model) {
      result = result.filter(p => (p.model || '').toLowerCase().includes(filters.model.toLowerCase()));
    }

    // 启动时间范围筛选
    if (filters.startDateFrom) {
      result = result.filter(p => !p.startDate || p.startDate >= filters.startDateFrom);
    }
    if (filters.startDateTo) {
      result = result.filter(p => !p.startDate || p.startDate <= filters.startDateTo);
    }

    // 特殊属性筛选
    if (activeTab === ProjectCategory.MARKET) {
      if (filters.isWon !== undefined) {
        result = result.filter(p => p.isWon === filters.isWon);
      }
      if (filters.isForeign !== undefined) {
        result = result.filter(p => p.isForeign === filters.isForeign);
      }
    } else if (activeTab === ProjectCategory.EXECUTION || activeTab === ProjectCategory.NUCLEAR) {
      if (filters.isCommissioned !== undefined) {
        result = result.filter(p => p.isCommissioned === filters.isCommissioned);
      }
    } else if (activeTab === ProjectCategory.RESEARCH || activeTab === ProjectCategory.RENOVATION || activeTab === ProjectCategory.OTHER) {
      if (filters.isCompleted !== undefined) {
        result = result.filter(p => p.isCompleted === filters.isCompleted);
      }
    }

    return result;
  }, [projects, activeTab, filters]);

  // 清除筛选
  const clearFilters = () => {
    setFilters({
      name: '',
      workNo: '',
      capacity: '',
      model: '',
      startDateFrom: '',
      startDateTo: '',
      isWon: undefined,
      isForeign: undefined,
      isCommissioned: undefined,
      isCompleted: undefined
    });
  };

  const handleExport = () => {
    const headers = ['ID', '项目名称', '工作号', '容量', '机型', '日期'];
    const rows = filteredProjects.map(p => [
      p.id,
      p.name,
      p.workNo || '',
      p.capacity || '',
      p.model || '',
      p.startDate || ''
    ]);

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
    link.setAttribute('download', `projects_${activeTab}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const openModal = (project?: Project) => {
    setEditingProject(project || null);
    setFormData(project || {
      category: activeTab,
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectToSave: Project = {
      ...(editingProject || {}),
      ...formData as Project,
      id: editingProject?.id || `PRJ-${Date.now()}`,
    };
    await apiDataService.saveProject(projectToSave);
    setIsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="flex gap-6 h-full">
      <aside className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 px-2">项目分类</h3>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {Object.values(ProjectCategory).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`nav-button w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-0 ${
                activeTab === cat
                  ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-600 shadow-md font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                {projects.filter(p => p.category === cat).length}
              </span>
              {cat}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">项目管理</h2>
            <p className="text-sm text-slate-500 mt-1">
              当前分类: <span className="font-medium text-blue-600">{activeTab}</span>
              <span className="ml-3">共 {filteredProjects.length} 个项目</span>
            </p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none">
                <Plus size={16} /> 创建项目
              </button>
            )}
            <button onClick={handleExport} className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 focus:outline-none">
              <Download size={16} /> 导出
            </button>
            <button
              onClick={() => {
                onRefresh();
                alert('数据已刷新！');
              }}
              className="flex items-center gap-2 border border-orange-300 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-100 focus:outline-none"
              title="刷新数据"
            >
              <RefreshCw size={16} /> 刷新数据
            </button>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium"
              >
                <Filter size={18} />
                {showFilters ? '隐藏筛选' : '显示筛选'}
                {(filters.name || filters.workNo || filters.capacity || filters.model || filters.startDateFrom || filters.startDateTo) && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">已筛选</span>
                )}
              </button>
              <span className="text-sm text-slate-600">
                共 <span className="font-semibold text-blue-600">{filteredProjects.length}</span> 个项目
              </span>
            </div>
            {(filters.name || filters.workNo || filters.capacity || filters.model || filters.startDateFrom || filters.startDateTo || filters.isWon !== undefined || filters.isForeign !== undefined || filters.isCommissioned !== undefined || filters.isCompleted !== undefined) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-slate-500 hover:text-red-600 text-sm"
              >
                <X size={16} />
                清除筛选
              </button>
            )}
          </div>

          {showFilters && (
            <div className="p-4 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">项目名称</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.name}
                    onChange={e => setFilters({...filters, name: e.target.value})}
                    placeholder="输入项目名称"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">工作号</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.workNo}
                    onChange={e => setFilters({...filters, workNo: e.target.value})}
                    placeholder="输入工作号"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">容量等级</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.capacity}
                    onChange={e => setFilters({...filters, capacity: e.target.value})}
                    placeholder="如：1000MW"
                    list="capacityList"
                  />
                  <datalist id="capacityList">
                    <option value="1000MW" />
                    <option value="600MW" />
                    <option value="300MW" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">机型</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.model}
                    onChange={e => setFilters({...filters, model: e.target.value})}
                    placeholder="如：Francis"
                    list="modelList"
                  />
                  <datalist id="modelList">
                    <option value="Francis" />
                    <option value="Pelton" />
                    <option value="Kaplan" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">启动时间（从）</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.startDateFrom}
                    onChange={e => setFilters({...filters, startDateFrom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">启动时间（到）</label>
                  <input
                    type="date"
                    className="w-full border rounded p-2 text-sm"
                    value={filters.startDateTo}
                    onChange={e => setFilters({...filters, startDateTo: e.target.value})}
                  />
                </div>

                {/* 特殊属性筛选 - 市场配合项目 */}
                {activeTab === ProjectCategory.MARKET && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">中标状态</label>
                      <select
                        className="w-full border rounded p-2 text-sm"
                        value={filters.isWon === undefined ? '' : filters.isWon.toString()}
                        onChange={e => setFilters({...filters, isWon: e.target.value === '' ? undefined : e.target.value === 'true'})}
                      >
                        <option value="">全部</option>
                        <option value="true">已中标</option>
                        <option value="false">未中标</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-slate-600">外贸类型</label>
                      <select
                        className="w-full border rounded p-2 text-sm"
                        value={filters.isForeign === undefined ? '' : filters.isForeign.toString()}
                        onChange={e => setFilters({...filters, isForeign: e.target.value === '' ? undefined : e.target.value === 'true'})}
                      >
                        <option value="">全部</option>
                        <option value="true">外贸</option>
                        <option value="false">内销</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 特殊属性筛选 - 常规项目/核电项目 */}
                {(activeTab === ProjectCategory.EXECUTION || activeTab === ProjectCategory.NUCLEAR) && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-600">投运状态</label>
                    <select
                      className="w-full border rounded p-2 text-sm"
                      value={filters.isCommissioned === undefined ? '' : filters.isCommissioned.toString()}
                      onChange={e => setFilters({...filters, isCommissioned: e.target.value === '' ? undefined : e.target.value === 'true'})}
                    >
                      <option value="">全部</option>
                      <option value="true">已投运</option>
                      <option value="false">未投运</option>
                    </select>
                  </div>
                )}

                {/* 特殊属性筛选 - 科研/改造/其他项目 */}
                {(activeTab === ProjectCategory.RESEARCH || activeTab === ProjectCategory.RENOVATION || activeTab === ProjectCategory.OTHER) && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-600">完成状态</label>
                    <select
                      className="w-full border rounded p-2 text-sm"
                      value={filters.isCompleted === undefined ? '' : filters.isCompleted.toString()}
                      onChange={e => setFilters({...filters, isCompleted: e.target.value === '' ? undefined : e.target.value === 'true'})}
                    >
                      <option value="">全部</option>
                      <option value="true">已完成</option>
                      <option value="false">进行中</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0 pr-4">
          <table className="w-full text-sm text-left whitespace-nowrap table-fixed">
            <thead className="bg-slate-100 text-slate-600 font-medium border-b sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-6 py-4 w-[22%]">项目名称</th>
                <th className="px-6 py-4 w-[11%]">工作号/ID</th>
                <th className="px-6 py-4 w-[10%]">容量等级</th>
                <th className="px-6 py-4 w-[10%]">机型</th>
                <th className="px-6 py-4 w-[10%]">启动时间</th>
                <th className="px-6 py-4 w-[12%]">特殊属性</th>
                <th className="px-6 py-4 w-[19%]">备注</th>
                {canEdit && <th className="px-6 py-4 w-[6%] text-right">操作</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 relative">
                    {p.isKeyProject && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 z-0"></div>}
                    <div className={`font-medium ${p.isKeyProject ? 'font-bold text-slate-900' : 'text-slate-900'}`}>
                      <div className="truncate" title={p.name}>{p.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="truncate" title={p.workNo || p.id}>{p.workNo || p.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="truncate" title={p.capacity || '-'}>{p.capacity || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="truncate" title={p.model || '-'}>{p.model || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="truncate" title={p.startDate}>{p.startDate}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {/* 市场配合项目：中标/外贸 */}
                    {activeTab === ProjectCategory.MARKET && (
                      <div className="truncate" title={p.isWon !== undefined ? (p.isWon ? '已中标' : '未中标') + (p.isForeign ? ' 外贸' : '') : ''}>
                        {p.isWon !== undefined && (
                          <span className={p.isWon ? 'text-green-600 font-medium' : 'text-slate-500'}>
                            {p.isWon ? '✓ 中标' : '未中标'}
                          </span>
                        )}
                        {p.isForeign && <span className="text-orange-600 ml-2">外贸</span>}
                      </div>
                    )}
                    {/* 常规项目/核电项目：已投运 */}
                    {(activeTab === ProjectCategory.EXECUTION || activeTab === ProjectCategory.NUCLEAR) && (
                      <div className="truncate" title={p.isCommissioned ? '已投运' : '未投运'}>
                        <span className={p.isCommissioned ? 'text-green-600 font-medium' : 'text-slate-500'}>
                          {p.isCommissioned ? '✓ 投运' : '未投运'}
                        </span>
                      </div>
                    )}
                    {/* 科研/改造/其他项目：已完成 */}
                    {(activeTab === ProjectCategory.RESEARCH || activeTab === ProjectCategory.RENOVATION || activeTab === ProjectCategory.OTHER) && (
                      <div className="truncate" title={p.isCompleted ? '已完成' : '进行中'}>
                        <span className={p.isCompleted ? 'text-green-600 font-medium' : 'text-slate-500'}>
                          {p.isCompleted ? '✓ 完成' : '进行中'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="truncate" title={p.remark || ''}>
                      {p.remark ? (
                        <span className="text-slate-600">{p.remark}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('删除项目?')) { apiDataService.deleteProject(p.id); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr><td colSpan={canEdit ? 8 : 7} className="px-6 py-12 text-center text-slate-400">该分类下暂无项目</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <h3 className="text-xl font-bold mb-4">{editingProject ? '编辑项目' : `创建 ${activeTab}`}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">项目名称 *</label>
                <input required type="text" className="w-full border rounded p-2"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">工作号</label>
                <input type="text" className="w-full border rounded p-2"
                  value={formData.workNo || ''} onChange={e => setFormData({...formData, workNo: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">启动时间</label>
                <input type="date" className="w-full border rounded p-2"
                  value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>

              {/* 所有项目类型都显示容量等级和机型字段 */}
              <>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">容量等级</label>
                  <AutocompleteInput
                    value={formData.capacity || ''}
                    options={capacityLevels}
                    onChange={(value) => setFormData({...formData, capacity: value})}
                    placeholder="选择或输入容量等级"
                    className="w-full border rounded p-2"
                    id="capacity-autocomplete"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">机型</label>
                  <AutocompleteInput
                    value={formData.model || ''}
                    options={equipmentModels}
                    onChange={(value) => setFormData({...formData, model: value})}
                    placeholder="选择或输入机型"
                    className="w-full border rounded p-2"
                    id="model-autocomplete"
                  />
                </div>
              </>

              {activeTab === ProjectCategory.MARKET && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isWon || false} onChange={e => setFormData({...formData, isWon: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isWon ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isWon ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">已中标</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isForeign || false} onChange={e => setFormData({...formData, isForeign: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isForeign ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isForeign ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">外贸项目</span>
                  </label>
                </div>
              )}

              {(activeTab === ProjectCategory.EXECUTION || activeTab === ProjectCategory.NUCLEAR) && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isKeyProject || false} onChange={e => setFormData({...formData, isKeyProject: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isKeyProject ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isKeyProject ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">重点项目</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isCommissioned || false} onChange={e => setFormData({...formData, isCommissioned: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isCommissioned ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isCommissioned ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">已投运</span>
                  </label>
                </div>
              )}

              {(activeTab === ProjectCategory.RESEARCH || activeTab === ProjectCategory.RENOVATION || activeTab === ProjectCategory.OTHER) && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isKeyProject || false} onChange={e => setFormData({...formData, isKeyProject: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isKeyProject ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isKeyProject ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">重点项目</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="hidden" checked={formData.isCompleted || false} onChange={e => setFormData({...formData, isCompleted: e.target.checked})} />
                    <span className={`relative inline-block w-12 h-6 rounded-full transition-colors ${formData.isCompleted ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.isCompleted ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </span>
                    <span className="text-sm font-medium text-slate-700 whitespace-nowrap">已完成</span>
                  </label>
                </div>
              )}

              {/* 备注字段 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  value={formData.remark || ''}
                  onChange={e => setFormData({...formData, remark: e.target.value})}
                  placeholder="输入项目备注信息..."
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">保存项目</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
