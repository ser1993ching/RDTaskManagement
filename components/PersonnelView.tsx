import React, { useState } from 'react';
import { User, SystemRole, OfficeLocation, PersonnelStatus } from '../types';
import { Plus, Download, Search, Edit2, Trash2, Lock, Key } from 'lucide-react';
import { dataService } from '../services/dataService';

interface PersonnelViewProps {
  currentUser: User;
  users: User[];
  onRefresh: () => void;
}

export const PersonnelView: React.FC<PersonnelViewProps> = ({ currentUser, users, onRefresh }) => {
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState<PersonnelStatus>(PersonnelStatus.ACTIVE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const canEdit = currentUser.SystemRole === SystemRole.ADMIN || currentUser.SystemRole === SystemRole.LEADER;

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({});

  const filteredUsers = users.filter(u => {
    const matchesTab = u.Status === activeTab;
    const matchesSearch = u.Name.includes(filterText) || u.OfficeLocation.includes(filterText) || (u.Title || '').includes(filterText);
    return matchesTab && matchesSearch;
  });

  const handleExport = () => {
    const headers = ['工号', '姓名', '角色', '地点', '状态', '职称', '学历', '入职时间'];
    const rows = filteredUsers.map(u => [
      u.UserID,
      u.Name,
      u.SystemRole,
      u.OfficeLocation,
      u.Status,
      u.Title || '',
      u.Education || '',
      u.JoinDate || ''
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
    link.setAttribute('download', 'personnel_list.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editingUser;
    
    const userToSave: User = {
      ...(editingUser || {}),
      ...formData as User,
      UserID: isNew ? dataService.generateId('EMP') : (editingUser?.UserID || ''),
      Password: isNew ? '123' : (editingUser?.Password || '123'), // Default password
    };
    
    dataService.saveUser(userToSave);
    setIsModalOpen(false);
    onRefresh();
  };

  const openModal = (user?: User) => {
    setEditingUser(user || null);
    setFormData(user || {
      Name: '',
      SystemRole: SystemRole.MEMBER,
      OfficeLocation: OfficeLocation.CHENGDU,
      Status: PersonnelStatus.ACTIVE,
      JoinDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // Helper to calculate work years
  const getWorkYears = (joinDate?: string) => {
    if (!joinDate) return 0;
    const diff = new Date().getTime() - new Date(joinDate).getTime();
    return (diff / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">人员管理</h2>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              <Plus size={16} /> 新增人员
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 focus:outline-none"
          >
            <Download size={16} /> 导出清单
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {Object.values(PersonnelStatus).map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === status 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="搜索姓名、地点或职称..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">工号</th>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">角色</th>
              <th className="px-6 py-4">职称</th>
              <th className="px-6 py-4">地点</th>
              <th className="px-6 py-4">工龄(年)</th>
              <th className="px-6 py-4">学历</th>
              {canEdit && <th className="px-6 py-4 text-right">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(user => (
              <tr key={user.UserID} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{user.UserID}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{user.Name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    user.SystemRole === SystemRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                    user.SystemRole === SystemRole.LEADER ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.SystemRole}
                  </span>
                </td>
                <td className="px-6 py-4">{user.Title || '-'}</td>
                <td className="px-6 py-4">{user.OfficeLocation}</td>
                <td className="px-6 py-4">{getWorkYears(user.JoinDate)}</td>
                <td className="px-6 py-4">{user.Education || '-'}</td>
                {canEdit && (
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit2 size={16} />
                    </button>
                    {canEdit && (currentUser.UserID !== user.UserID) && (
                      <button
                        onClick={() => {
                          const tempPassword = dataService.generateTemporaryPassword();
                          if (confirm(`确定要重置 ${user.Name} 的密码吗？\n\n新密码将显示在下一步中。`)) {
                            dataService.resetPassword(user.UserID, tempPassword);
                            alert(`密码重置成功！\n\n用户：${user.Name}\n新密码：${tempPassword}\n\n请将此密码告知用户。`);
                            onRefresh();
                          }
                        }}
                        className="text-orange-600 hover:text-orange-800 mr-3"
                        title="重置密码"
                      >
                        <Lock size={16} />
                      </button>
                    )}
                    {(currentUser.UserID !== user.UserID) && (
                      <button onClick={() => {
                        if(confirm('确定删除该人员?')) {
                          dataService.deleteUser(user.UserID);
                          onRefresh();
                        }
                      }} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  未找到相关人员
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{editingUser ? '编辑人员' : '新增人员'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">姓名 *</label>
                <input required type="text" className="w-full border rounded p-2" 
                  value={formData.Name} onChange={e => setFormData({...formData, Name: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">系统角色 *</label>
                <select className="w-full border rounded p-2"
                  value={formData.SystemRole} onChange={e => setFormData({...formData, SystemRole: e.target.value as SystemRole})}>
                  {Object.values(SystemRole).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">办公地点 *</label>
                <select className="w-full border rounded p-2"
                  value={formData.OfficeLocation} onChange={e => setFormData({...formData, OfficeLocation: e.target.value as OfficeLocation})}>
                  {Object.values(OfficeLocation).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">状态 *</label>
                <select className="w-full border rounded p-2"
                  value={formData.Status} onChange={e => setFormData({...formData, Status: e.target.value as PersonnelStatus})}>
                  {Object.values(PersonnelStatus).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
               <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">职称</label>
                <select className="w-full border rounded p-2"
                  value={formData.Title || ''} onChange={e => setFormData({...formData, Title: e.target.value})}>
                  <option value="">请选择</option>
                  {['见习生', '助工', '工程师', '高级工程师', '副主工程师', '主任工程师', '高级主任工程师'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">参加工作时间</label>
                <input type="date" className="w-full border rounded p-2" 
                  value={formData.JoinDate || ''} onChange={e => setFormData({...formData, JoinDate: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">学历</label>
                <select className="w-full border rounded p-2"
                  value={formData.Education || ''} onChange={e => setFormData({...formData, Education: e.target.value})}>
                  <option value="">请选择</option>
                  {['大学本科', '研究生', '博士'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {editingUser && (
                <div className="col-span-2 pt-2 border-t mt-2">
                   <button type="button" onClick={() => setFormData({...formData, Password: '123'})} className="text-sm text-red-600 hover:underline">
                    重置密码为 123
                   </button>
                </div>
              )}

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-slate-50 focus:outline-none">取消</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
