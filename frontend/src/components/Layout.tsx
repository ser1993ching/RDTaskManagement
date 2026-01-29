/**
 * 布局组件 (Layout.tsx)
 *
 * 概述:
 * - 应用的主布局框架，包含侧边栏导航和主内容区域
 * - 根据用户角色动态显示可用的菜单项
 * - 使用Tailwind CSS实现响应式设计
 *
 * 主要功能:
 * 1. 侧边栏导航 - 显示系统主要功能入口
 * 2. 用户信息展示 - 显示当前登录用户姓名和角色
 * 3. 退出登录按钮 - 清除会话并返回登录页
 * 4. 内容区域 - 渲染当前视图的子组件
 *
 * 菜单项权限说明:
 * - 工作台: 所有角色可见
 * - 个人工作台: 所有角色可见
 * - 任务管理: 所有角色可见
 * - 任务库: 仅管理员和班组长可见
 * - 项目管理: 所有角色可见
 * - 人员管理: 所有角色可见
 * - 设置: 所有角色可见
 */

import React from 'react';
import { User as UserType } from '../types';
import {
  Users,           // 人员图标
  Briefcase,       // 项目图标
  CheckSquare,     // 任务图标
  LayoutDashboard, // 仪表盘图标
  LogOut,          // 退出图标
  UserCircle,      // 用户图标
  Settings,        // 设置图标
  FolderKanban,    // 任务库图标
  User as UserIcon // 个人工作台图标
} from 'lucide-react';

/**
 * 布局组件属性接口
 */
interface LayoutProps {
  currentUser: UserType;     // 当前登录用户
  onLogout: () => void;      // 登出回调函数
  currentView: string;       // 当前视图名称
  onChangeView: (view: string) => void; // 视图切换回调
  children: React.ReactNode; // 主内容区域子组件
}

/**
 * 菜单项配置
 * 定义所有可用的导航菜单
 */
interface MenuItem {
  id: string;           // 菜单ID（对应视图名称）
  label: string;        // 菜单显示文本
  icon: React.ComponentType<{ size?: number }>; // 图标组件
  roles?: string[];     // 可访问该菜单的角色列表（可选）
}

/**
 * 布局组件
 */
export const Layout: React.FC<LayoutProps> = ({
  currentUser,
  onLogout,
  currentView,
  onChangeView,
  children
}) => {
  // 定义所有菜单项
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },           // 统计仪表盘
    { id: 'workspace', label: '个人工作台', icon: UserIcon },               // 个人任务视图
    { id: 'tasks', label: '任务管理', icon: CheckSquare },                  // 任务CRUD
    { id: 'task-pool', label: '任务库', icon: FolderKanban, roles: ['管理员', '班组长'] }, // 任务库管理（仅管理员和班组长）
    { id: 'projects', label: '项目管理', icon: Briefcase },                 // 项目CRUD
    { id: 'personnel', label: '人员管理', icon: Users },                    // 用户管理
  ];

  // 根据用户角色过滤可见菜单项
  const visibleMenuItems = menuItems.filter(item => {
    // 如果菜单没有角色限制，对所有用户可见
    if (!item.roles) return true;
    // 否则检查用户角色是否在允许列表中
    return item.roles.includes(currentUser.systemRole);
  });

  return (
    // Flex布局：侧边栏 + 主内容区域
    <div className="flex h-screen bg-slate-50">
      {/* ============================================
          侧边栏 (Sidebar)
          ============================================ */}
      <aside className="w-56 bg-gradient-to-b from-slate-600 to-slate-700 text-white flex flex-col shadow-xl transition-all duration-300">
        {/* 顶部Logo区域 */}
        <div className="p-4 border-b border-slate-500/50">
          <h1 className="text-lg font-bold tracking-wider">汽发任务管理系统</h1>
        </div>

        {/* 导航菜单区域 */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {/* 渲染可见菜单项 */}
          {visibleMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                currentView === item.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'  // 当前选中状态
                  : 'text-slate-300 hover:bg-slate-600/50 hover:text-white hover:translate-x-1'  // 默认状态
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          {/* 设置菜单（始终显示在底部） */}
          <button
            onClick={() => onChangeView('settings')}
            className={`nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
              currentView === 'settings'
                ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                : 'text-slate-300 hover:bg-slate-600/50 hover:text-white hover:translate-x-1'
            }`}
          >
            <Settings size={18} />
            设置
          </button>
        </nav>

        {/* 底部用户信息区域 */}
        <div className="p-4 border-t border-slate-500/50 bg-slate-700/50">
          {/* 用户头像和信息 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-500 p-2 rounded-full">
              <UserCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.systemRole}</p>
            </div>
          </div>
          {/* 退出登录按钮 */}
          <button
            onClick={onLogout}
            className="nav-button w-full flex items-center justify-center gap-2 text-sm text-red-300 hover:text-red-100 py-2 border border-red-900/50 hover:bg-red-900/30 rounded focus:outline-none focus:ring-0"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </aside>

      {/* ============================================
          主内容区域 (Main Content)
          ============================================ */}
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full p-4">
          {/* 渲染当前视图的子组件 */}
          {children}
        </div>
      </main>
    </div>
  );
};
