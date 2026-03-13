/**
 * R&D任务管理系统 - 主应用程序组件 (App.tsx)
 *
 * 概述:
 * - 这是React应用的根组件，负责应用初始化、路由、认证状态管理
 * - 使用TypeScript和React Hooks (useState, useEffect) 管理状态
 * - 集成了Redux Provider (通过main.tsx)，使用ConfigProvider管理全局配置
 *
 * 主要功能:
 * 1. 系统健康检查 - 启动时检测后端服务和数据库连接状态
 * 2. 会话管理 - 检查localStorage中的已登录状态
 * 3. 用户认证 - 登录、登出功能
 * 4. 视图切换 - 根据用户角色显示不同的工作界面
 * 5. 数据刷新 - 管理用户、项目、任务等全局数据
 *
 * 状态管理:
 * - currentUser: 当前登录用户信息
 * - currentView: 当前显示的视图 (dashboard, tasks, projects等)
 * - users/projects/tasks/taskClasses: 全局应用数据
 * - workspaceRefreshKey: 用于触发个人工作台刷新的计数器
 *
 * 用户角色权限:
 * - 管理员 (ADMIN): 可访问所有功能
 * - 班组长 (LEADER): 可访问大部分管理功能
 * - 组员 (MEMBER): 只能访问个人工作台
 */

import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PersonnelView } from './components/PersonnelView';
import { ProjectView } from './components/ProjectView';
import { TaskView } from './components/TaskView';
import { TaskPoolView } from './components/TaskPoolView';
import PersonalWorkspaceView from './components/PersonalWorkspaceView';
import { Settings as SettingsComponent } from './components/Settings';
import { apiDataService } from './services/apiDataService';
import { checkSystemHealth, HealthStatus } from './services/healthService';
import { ConfigProvider } from './context/ConfigContext';
import { User, Project, Task, TaskClass } from './types';
import { Lock, Settings, Server, Database, AlertCircle } from 'lucide-react';

/**
 * 主应用组件
 * 使用函数式组件 + Hooks 进行状态管理
 */
const App: React.FC = () => {
  // ============================================
  // 用户认证状态
  // ============================================
  const [currentUser, setCurrentUser] = useState<User | null>(null);  // 当前登录用户
  const [currentView, setCurrentView] = useState('dashboard');       // 当前视图名称

  // ============================================
  // 任务导航状态 - 用于从其他页面跳转到指定任务
  // ============================================
  const [targetTaskName, setTargetTaskName] = useState<string | undefined>();    // 目标任务名称
  const [targetTaskClassId, setTargetTaskClassId] = useState<string | undefined>(); // 目标任务分类ID

  // ============================================
  // 全局应用数据状态
  // ============================================
  const [users, setUsers] = useState<User[]>([]);        // 用户列表
  const [projects, setProjects] = useState<Project[]>([]); // 项目列表
  const [tasks, setTasks] = useState<Task[]>([]);        // 任务列表
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]); // 任务分类列表

  // ============================================
  // 刷新控制状态
  // ============================================
  // 用于触发PersonalWorkspaceView组件重新渲染的计数器
  // 每次数据更新时增加此值，确保子组件获取最新数据
  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);

  // ============================================
  // 登录表单状态
  // ============================================
  const [loginId, setLoginId] = useState('');       // 登录用户名/工号
  const [loginPwd, setLoginPwd] = useState('');     // 登录密码
  const [loginError, setLoginError] = useState(''); // 登录错误信息
  const [isLoading, setIsLoading] = useState(false); // 登录加载状态

  // ============================================
  // 系统健康状态
  // ============================================
  // 存储后端服务和数据库的连接状态
  const [systemHealth, setSystemHealth] = useState<HealthStatus | null>(null);

  // ============================================
  // 初始化阶段：系统健康检查和会话恢复
  // ============================================
  useEffect(() => {
    // 检查后端服务和数据库连接状态
    const checkHealth = async () => {
      const health = await checkSystemHealth();
      setSystemHealth(health);

      // 如果系统健康，继续检查已存在的登录会话
      if (health.backend === 'ok' && health.database !== 'error') {
        checkSession();
      }
    };
    checkHealth();

    // 定期检测系统状态（每30秒）
    // 用于在后台服务恢复时自动刷新状态
    const healthInterval = setInterval(checkHealth, 30000);

    // 清理函数：组件卸载时清除定时器
    return () => clearInterval(healthInterval);
  }, []);

  /**
   * 检查并恢复登录会话
   * 如果localStorage中存在有效的用户信息，自动恢复登录状态
   */
  const checkSession = async () => {
    // apiDataService.isLoggedIn() 检查认证token是否存在且有效
    if (apiDataService.isLoggedIn()) {
      const storedUser = apiDataService.getCurrentUser();
      if (storedUser) {
        // 直接使用API返回的用户数据（已经是camelCase格式）
        setCurrentUser(storedUser as User);
        // 刷新应用数据
        await refreshData();
        // 配置数据由ConfigProvider自动加载，无需手动调用
      }
    }
  };

  /**
   * 刷新全局应用数据
   * 并行获取用户、项目、任务数据
   * 使用Promise.all提高加载效率
   */
  const refreshData = async () => {
    const [apiUsers, apiProjects, apiTasks] = await Promise.all([
      apiDataService.getUsers(),           // 获取用户列表
      apiDataService.getProjects(),        // 获取项目列表
      apiDataService.getTasks(undefined, true), // 获取任务列表，forceRefresh=true确保获取最新数据
    ]);

    // 直接使用API返回的camelCase数据，只进行类型断言
    setUsers(apiUsers as User[]);
    setProjects(apiProjects as Project[]);
    setTasks(apiTasks as Task[]);

    // 任务分类由ConfigProvider统一管理，此处无需加载

    // 触发个人工作台刷新
    // 通过增加计数器强制子组件重新渲染
    setWorkspaceRefreshKey(prev => prev + 1);
  };

  /**
   * 切换视图
   * @param view 目标视图名称
   * @param taskName 可选：目标任务名称，用于跳转到指定任务
   * @param taskClassId 可选：任务分类ID
   */
  const handleChangeView = (view: string, taskName?: string, taskClassId?: string) => {
    setCurrentView(view);
    setTargetTaskName(taskName);
    setTargetTaskClassId(taskClassId);
  };

  /**
   * 处理用户登录
   * @param e 表单提交事件
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const result = await apiDataService.login(loginId, loginPwd);
      if (result) {
        // 登录成功，设置当前用户并刷新数据
        setCurrentUser(result.user as User);
        await refreshData();
        setLoginError('');
      } else {
        // 登录失败，显示错误信息
        setLoginError('用户名或密码错误');
      }
    } catch (error) {
      setLoginError('登录失败，请稍后重试');
      console.error('登录错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理用户登出
   * 清除本地存储的认证信息和应用状态
   */
  const handleLogout = () => {
    apiDataService.logout();              // 调用服务清除认证信息
    localStorage.removeItem('auth_token'); // 清除JWT token
    setCurrentUser(null);                 // 清除用户状态
    setLoginId('');
    setLoginPwd('');
    setLoginError('');
    setCurrentView('dashboard');
    // 清空应用数据
    setUsers([]);
    setProjects([]);
    setTasks([]);
    // 配置数据由ConfigProvider管理，无需手动清理
  };

  // ============================================
  // 渲染阶段：根据状态显示不同界面
  // ============================================

  // 状态1: 正在检测系统健康（防止页面闪烁显示加载占位符）
  if (systemHealth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // 状态2: 后端服务无法连接
  if (systemHealth.backend === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
            <Server className="text-red-600" size={48} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">后端服务无法连接</h1>
          <p className="text-slate-600 mb-4">{systemHealth.error || '无法连接到后端服务'}</p>
          <div className="bg-slate-50 p-4 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">请检查以下项目：</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>1. 后端服务是否已启动 (dotnet run)</li>
              <li>2. 后端服务端口是否正确 (默认5000)</li>
              <li>3. 网络连接是否正常</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 状态3: 数据库连接失败
  if (systemHealth.database === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <div className="bg-orange-100 p-4 rounded-full inline-flex mb-4">
            <Database className="text-orange-600" size={48} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">数据库连接失败</h1>
          <p className="text-slate-600 mb-4">{systemHealth.error || '无法连接到数据库'}</p>
          <div className="bg-slate-50 p-4 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">请检查以下项目：</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>1. MySQL服务是否已启动</li>
              <li>2. MySQL端口是否正确 (默认3306)</li>
              <li>3. 数据库凭据是否正确</li>
              <li>4. 数据库 TaskManageSystem 是否存在</li>
            </ul>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            系统将自动定期检测，解决问题后自动恢复
          </p>
        </div>
      </div>
    );
  }

  // 状态4: 未登录 - 显示登录表单
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-3">
              <Settings className="text-blue-600" size={28} />
              汽发任务管理系统
            </h1>
            <p className="text-slate-500 mt-2">研发团队任务管理系统</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">工号 / 姓名</label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="请输入工号或姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
              <input
                type="password"
                required
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold py-2 rounded-lg transition-colors flex justify-center items-center gap-2 ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Lock size={18} />
              {isLoading ? '登录中...' : '登录系统'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 状态5: 已登录 - 显示主界面
  return (
    <ConfigProvider>
      <Layout
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      >
        {/* 根据当前视图显示不同组件 */}
        {currentView === 'dashboard' && (
          currentUser.systemRole === '组员' ? (
            // 组员只能看到个人工作台
            <PersonalWorkspaceView
              currentUser={currentUser}
              onRefresh={refreshData}
              onChangeView={handleChangeView}
              externalRefreshKey={workspaceRefreshKey}
            />
          ) : (
            // 管理员/班组长可以看到统计仪表盘
            <Dashboard
              currentUser={currentUser}
              users={users}
              projects={projects}
              tasks={tasks}
              onTaskClick={(taskName, taskClassId) => {
                setTargetTaskName(taskName);
                setTargetTaskClassId(taskClassId);
                setCurrentView('tasks');
              }}
              onRefresh={refreshData}
            />
          )
        )}
        {currentView === 'workspace' && (
          <PersonalWorkspaceView
            currentUser={currentUser}
            onRefresh={refreshData}
            onChangeView={handleChangeView}
            externalRefreshKey={workspaceRefreshKey}
          />
        )}
        {currentView === 'personnel' && <PersonnelView currentUser={currentUser} users={users} onRefresh={refreshData} />}
        {currentView === 'projects' && <ProjectView currentUser={currentUser} projects={projects} users={users} onRefresh={refreshData} />}
        {currentView === 'tasks' && (
          <TaskView
            currentUser={currentUser}
            tasks={tasks}
            projects={projects}
            users={users}
            onRefresh={refreshData}
            targetTaskName={targetTaskName}
            targetTaskClassId={targetTaskClassId}
            onClearTargetTaskName={() => { setTargetTaskName(undefined); setTargetTaskClassId(undefined); }}
          />
        )}
        {currentView === 'task-pool' && (
          <TaskPoolView
            currentUser={currentUser}
            projects={projects}
            users={users}
            onRefresh={refreshData}
          />
        )}
        {currentView === 'settings' && <SettingsComponent currentUser={currentUser} onRefresh={() => {}} />}
      </Layout>
    </ConfigProvider>
  );
};

export default App;
