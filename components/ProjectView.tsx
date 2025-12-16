import React, { useState } from 'react';
import { Project, ProjectCategory, User, SystemRole } from '../types';
import { Plus, Download, Edit2, Trash2 } from 'lucide-react';
import { dataService } from '../services/dataService';

interface ProjectViewProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onRefresh: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ currentUser, projects, users, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<ProjectCategory>(ProjectCategory.MARKET);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({});

  const canEdit = currentUser.SystemRole === SystemRole.ADMIN || currentUser.SystemRole === SystemRole.LEADER;
  const filteredProjects = projects.filter(p => p.category === activeTab);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectToSave: Project = {
      ...(editingProject || {}),
      ...formData as Project,
      id: editingProject?.id || dataService.generateId('PRJ'),
    };
    dataService.saveProject(projectToSave);
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
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-auto min-h-0">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b sticky top-0">
              <tr>
                <th className="px-6 py-4">项目名称</th>
                <th className="px-6 py-4">工作号/ID</th>
                <th className="px-6 py-4">容量等级</th>
                <th className="px-6 py-4">机型</th>
                <th className="px-6 py-4">启动时间</th>
                <th className="px-6 py-4">特殊属性</th>
                {canEdit && <th className="px-6 py-4 text-right">操作</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(p => (
                <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-slate-500">{p.workNo || p.id}</td>
                  <td className="px-6 py-4">{p.capacity || '-'}</td>
                  <td className="px-6 py-4">{p.model || '-'}</td>
                  <td className="px-6 py-4">{p.startDate}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {p.isWon !== undefined && <span>{p.isWon ? '中标 ' : '未中标 '}</span>}
                    {p.isForeign && <span className="text-orange-600">外贸</span>}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(p)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('删除项目?')) { dataService.deleteProject(p.id); onRefresh(); }}} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr><td colSpan={canEdit ? 7 : 6} className="px-6 py-12 text-center text-slate-400">该分类下暂无项目</td></tr>
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

              {(activeTab === ProjectCategory.MARKET || activeTab === ProjectCategory.EXECUTION) && (
                <>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">容量等级</label>
                    <input list="capacityList" className="w-full border rounded p-2"
                      value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                      <datalist id="capacityList"><option value="1000MW"/><option value="600MW"/><option value="300MW"/></datalist>
                  </div>
                   <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">机型</label>
                    <input list="modelList" className="w-full border rounded p-2"
                      value={formData.model || ''} onChange={e => setFormData({...formData, model: e.target.value})} />
                      <datalist id="modelList"><option value="Francis"/><option value="Pelton"/><option value="Kaplan"/></datalist>
                  </div>
                </>
              )}

              {activeTab === ProjectCategory.MARKET && (
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isWon || false} onChange={e => setFormData({...formData, isWon: e.target.checked})} /> 已中标</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isForeign || false} onChange={e => setFormData({...formData, isForeign: e.target.checked})} /> 外贸项目</label>
                </div>
              )}

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
