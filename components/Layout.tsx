import React from 'react';
import { User, SystemRole } from '../types';
import {
  Users,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Tags
} from 'lucide-react';

interface LayoutProps {
  currentUser: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentUser, onLogout, currentView, onChangeView, children }) => {
  const menuItems = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'tasks', label: '任务管理', icon: CheckSquare },
    { id: 'task-classes', label: '任务类管理', icon: Tags },
    { id: 'projects', label: '项目管理', icon: Briefcase },
    { id: 'personnel', label: '人员管理', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-600 to-slate-700 text-white flex flex-col shadow-xl transition-all duration-300">
        <div className="p-6 border-b border-slate-500/50">
          <h1 className="text-xl font-bold tracking-wider">汽发任务管理系统</h1>
         
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                  : 'text-slate-300 hover:bg-slate-600/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-500/50 bg-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-500 p-2 rounded-full">
              <UserCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold">{currentUser.Name}</p>
              <p className="text-xs text-slate-400">{currentUser.SystemRole}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-300 hover:text-red-100 py-2 border border-red-900/50 hover:bg-red-900/30 rounded"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full p-4">
          {children}
        </div>
      </main>
    </div>
  );
};
