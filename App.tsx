import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PersonnelView } from './components/PersonnelView';
import { ProjectView } from './components/ProjectView';
import { TaskView } from './components/TaskView';
import { TaskClassView } from './components/TaskClassView';
import { dataService } from './services/dataService';
import { User, Project, Task } from './types';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Application Data State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initial Load
  useEffect(() => {
    const user = dataService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      refreshData();
    }
  }, []);

  const refreshData = () => {
    setUsers(dataService.getUsers());
    setProjects(dataService.getProjects());
    setTasks(dataService.getTasks());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = dataService.login(loginId, loginPwd);
    if (user) {
      setCurrentUser(user);
      refreshData();
      setLoginError('');
    } else {
      setLoginError('用户名或密码错误 (默认 Admin/admin 或 张组长/123)');
    }
  };

  const handleLogout = () => {
    dataService.logout();
    setCurrentUser(null);
    setLoginId('');
    setLoginPwd('');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">汽发任务管理系统</h1>
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
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
              <Lock size={18} /> 登录系统
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      currentView={currentView}
      onChangeView={setCurrentView}
    >
      {currentView === 'dashboard' && <Dashboard currentUser={currentUser} users={users} projects={projects} tasks={tasks} />}
      {currentView === 'personnel' && <PersonnelView currentUser={currentUser} users={users} onRefresh={refreshData} />}
      {currentView === 'projects' && <ProjectView currentUser={currentUser} projects={projects} users={users} onRefresh={refreshData} />}
      {currentView === 'tasks' && <TaskView currentUser={currentUser} tasks={tasks} projects={projects} users={users} onRefresh={refreshData} />}
      {currentView === 'task-classes' && <TaskClassView currentUser={currentUser} />}
    </Layout>
  );
};

export default App;
