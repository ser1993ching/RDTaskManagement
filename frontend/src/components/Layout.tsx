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

import React, { useRef, useEffect, useCallback } from 'react';
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

// 内联样式 - 移除过渡效果，改用即时切换，避免主线程阻塞导致的动画卡顿
const navButtonStyle: React.CSSProperties = {
  // 移除 transition，使用即时切换
  // 即使有 GPU 加速，主线程阻塞仍会导致动画卡顿
};

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

  // 使用 useRef 存储导航区域引用
  const navRef = useRef<HTMLElement>(null);

  // 使用 useRef 存储当前高亮状态，避免依赖 currentView 触发重渲染
  const currentHighlightRef = useRef<string>(currentView);

  // 更新高亮状态 - 完全脱离 React 渲染周期
  const updateHighlight = useCallback((viewId: string) => {
    const nav = navRef.current;
    if (!nav) return;

    // 先移除之前的高亮 - 使用 style 直接操作确保优先级最高
    const prevActive = nav.querySelector('.nav-active');
    if (prevActive) {
      prevActive.classList.remove('nav-active', 'bg-blue-600', 'text-white', 'shadow-lg');
      (prevActive as HTMLElement).style.backgroundColor = '';
      (prevActive as HTMLElement).style.color = '';
    }

    // 添加新的高亮 - 使用 style 直接设置确保优先级最高
    const btn = nav.querySelector(`[data-view="${viewId}"]`) as HTMLElement;
    if (btn) {
      btn.classList.add('nav-active');
      // 直接操作 DOM style，确保优先级高于 React 的 className
      btn.style.backgroundColor = 'rgb(37, 99, 235)'; // blue-600
      btn.style.color = 'white';
      btn.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
    }

    currentHighlightRef.current = viewId;
  }, []);

  // 初始化时设置正确的高亮
  useEffect(() => {
    updateHighlight(currentView);
  }, [currentView, updateHighlight]);

  // 使用事件委托处理导航点击 - 立即更新高亮
  const handleNavClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const button = target.closest('[data-view]') as HTMLElement;
    if (!button) return;

    const viewId = button.getAttribute('data-view');
    if (!viewId || viewId === currentHighlightRef.current) return;

    // 立即更新高亮（完全绕过 React 状态更新）
    updateHighlight(viewId);

    // 然后调用原始的 onChangeView
    onChangeView(viewId);
  }, [onChangeView, updateHighlight]);

  return (
    // Flex布局：侧边栏 + 主内容区域
    <div className="flex h-screen bg-slate-50">
      {/* ============================================
          侧边栏 (Sidebar)
          ============================================ */}
      <aside className="w-56 bg-gradient-to-b from-slate-600 to-slate-700 text-white flex flex-col shadow-xl">
        {/* 顶部Logo区域 */}
        <div className="p-4 border-b border-slate-500/50">
          <h1 className="text-lg font-bold tracking-wider">汽发任务管理系统</h1>
        </div>

        {/* 导航菜单区域 - 使用事件委托 */}
        <nav ref={navRef} className="flex-1 py-6 px-3 space-y-2" onClick={handleNavClick}>
          {/* 渲染可见菜单项 - 移除 transition，使用即时切换 */}
          {visibleMenuItems.map(item => (
            <button
              key={item.id}
              data-view={item.id}
              type="button"
              className="nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-600/50 hover:text-white"
              style={navButtonStyle}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          {/* 设置菜单（始终显示在底部） */}
          <button
            data-view="settings"
            type="button"
            className="nav-button w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-600/50 hover:text-white"
            style={navButtonStyle}
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
