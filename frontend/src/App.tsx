import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PersonnelView } from './components/PersonnelView';
import { ProjectView } from './components/ProjectView';
import { TaskView } from './components/TaskView';
import { TaskPoolView } from './components/TaskPoolView';
import PersonalWorkspaceView from './components/PersonalWorkspaceView';
import { Settings as SettingsComponent } from './components/Settings';
import { apiDataService, isApiAvailable, getLastApiError } from './services/apiDataService';
import { authService } from './services/api';
import { User, Project, Task, Gender, SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus, RoleStatus } from './types';
import { Lock, Settings, AlertTriangle, RefreshCw } from 'lucide-react';

// API响应值转中文枚举（后端已直接返回中文值，此函数保留用于兼容）
const convertGender = (value: string): Gender => {
  const map: Record<string, Gender> = {
    '男': Gender.MALE,
    '女': Gender.FEMALE,
  };
  return map[value] || Gender.MALE;
};

const convertSystemRole = (value: string): SystemRole => {
  const map: Record<string, SystemRole> = {
    '管理员': SystemRole.ADMIN,
    '班组长': SystemRole.LEADER,
    '组员': SystemRole.MEMBER,
  };
  return map[value] || SystemRole.MEMBER;
};

const convertOfficeLocation = (value: string): OfficeLocation => {
  const map: Record<string, OfficeLocation> = {
    '成都': OfficeLocation.CHENGDU,
    '德阳': OfficeLocation.DEYANG,
  };
  return map[value] || OfficeLocation.CHENGDU;
};

const convertPersonnelStatus = (value: string): PersonnelStatus => {
  const map: Record<string, PersonnelStatus> = {
    '在岗': PersonnelStatus.ACTIVE,
    '借调': PersonnelStatus.BORROWED_IN,
    '外借': PersonnelStatus.BORROWED_OUT,
    '实习': PersonnelStatus.INTERN,
    '离岗': PersonnelStatus.LEAVE,
  };
  return map[value] || PersonnelStatus.ACTIVE;
};

const convertProjectCategory = (value: string): ProjectCategory => {
  const map: Record<string, ProjectCategory> = {
    '市场配合项目': ProjectCategory.MARKET,
    '常规项目': ProjectCategory.EXECUTION,
    '核电项目': ProjectCategory.NUCLEAR,
    '科研项目': ProjectCategory.RESEARCH,
    '改造项目': ProjectCategory.RENOVATION,
    '其他项目': ProjectCategory.OTHER,
  };
  return map[value] || ProjectCategory.OTHER;
};

const convertTaskStatus = (value: string): TaskStatus => {
  const map: Record<string, TaskStatus> = {
    '未开始': TaskStatus.NOT_STARTED,
    '编制中': TaskStatus.DRAFTING,
    '修改中': TaskStatus.REVISING,
    '校核中': TaskStatus.REVIEWING,
    '审查中': TaskStatus.REVIEWING2,
    '已完成': TaskStatus.COMPLETED,
  };
  return map[value] || TaskStatus.NOT_STARTED;
};

const convertRoleStatus = (value: string): RoleStatus => {
  const map: Record<string, RoleStatus> = {
    '未开始': RoleStatus.NOT_STARTED,
    '进行中': RoleStatus.IN_PROGRESS,
    '修改中': RoleStatus.REVISING,
    '驳回中': RoleStatus.REJECTED,
    '已完成': RoleStatus.COMPLETED,
  };
  return map[value] || RoleStatus.NOT_STARTED;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetTaskName, setTargetTaskName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // API状态
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(true);

  // Application Data State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 加载数据的函数
  const loadData = async () => {
    try {
      // 首先进行健康检查，确认后端是否可用
      const isHealthy = await apiDataService.healthCheck();
      if (!isHealthy) {
        setApiConnected(false);
        setApiError('无法连接到后端服务，请确保后端程序已启动');
        setLoading(false);
        return;
      }

      // 后端可用，加载数据
      const [usersData, projectsData, tasksData] = await Promise.all([
        apiDataService.getUsers(),
        apiDataService.getProjects(),
        apiDataService.getTasks(),
      ]);

      // 检查是否真的获取到了数据（健康检查后API调用应该成功）
      if (usersData.length === 0 && projectsData.length === 0 && tasksData.length === 0) {
        // 清空现有数据
        setUsers([]);
        setProjects([]);
        setTasks([]);
        setApiConnected(false);
        setApiError('后端服务无响应或数据库为空');
        setLoading(false);
        return;
      }

      // 后端正常连接
      setApiConnected(true);
      setApiError(null);

      // 转换为前端类型（包含中文枚举转换）
      setUsers(usersData.map((u: any) => ({
        UserID: u.userID,
        Name: u.name,
        Gender: convertGender(u.gender),
        SystemRole: convertSystemRole(u.systemRole),
        OfficeLocation: convertOfficeLocation(u.officeLocation),
        Title: u.title,
        JoinDate: u.joinDate,
        Status: convertPersonnelStatus(u.status),
        Education: u.education,
        School: u.school,
        Remark: u.remark,
      })));

      setProjects(projectsData.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: convertProjectCategory(p.category),
        workNo: p.workNo,
        capacity: p.capacity,
        model: p.model,
        isWon: p.isWon,
        isForeign: p.isForeign,
        startDate: p.startDate,
        endDate: p.endDate,
        remark: p.remark,
        isCommissioned: p.isCommissioned,
        isCompleted: p.isCompleted,
        isKeyProject: p.isKeyProject,
        is_deleted: false,
      })));

      setTasks(tasksData.map((t: any) => ({
        TaskID: t.taskID,
        TaskName: t.taskName,
        TaskClassID: t.taskClassID,
        Category: t.category,
        ProjectID: t.projectID,
        AssigneeID: t.assigneeID,
        AssigneeName: t.assigneeName,
        StartDate: t.startDate,
        DueDate: t.dueDate,
        CompletedDate: t.completedDate,
        Status: convertTaskStatus(t.status),
        Workload: t.workload,
        Difficulty: t.difficulty,
        Remark: t.remark,
        CreatedDate: t.createdDate,
        CreatedBy: t.createdBy,
        TravelLocation: t.travelLocation,
        TravelDuration: t.travelDuration,
        TravelLabel: t.travelLabel,
        MeetingDuration: t.meetingDuration,
        Participants: t.participants,
        ParticipantNames: t.participantNames,
        CapacityLevel: t.capacityLevel,
        CheckerID: t.checkerID,
        CheckerName: t.checkerName,
        CheckerWorkload: t.checkerWorkload,
        checkerStatus: convertRoleStatus(t.checkerStatus),
        ChiefDesignerID: t.chiefDesignerID,
        ChiefDesignerName: t.chiefDesignerName,
        ChiefDesignerWorkload: t.chiefDesignerWorkload,
        chiefDesignerStatus: convertRoleStatus(t.chiefDesignerStatus),
        ApproverID: t.approverID,
        ApproverName: t.approverName,
        ApproverWorkload: t.approverWorkload,
        approverStatus: convertRoleStatus(t.approverStatus),
        assigneeStatus: convertRoleStatus(t.assigneeStatus),
        isForceAssessment: t.isForceAssessment,
        is_in_pool: t.isInPool,
        is_deleted: false,
      })));

      // 检查API可用性
      setApiConnected(isApiAvailable());
      setApiError(getLastApiError());
    } catch (error) {
      console.error('加载数据失败:', error);
      setApiConnected(false);
      setApiError(error instanceof Error ? error.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const refreshData = () => {
    setLoading(true);
    loadData();
  };

  // 初始化 - 检查会话
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isLoggedIn()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setCurrentUser({
            UserID: storedUser.userID,
            Name: storedUser.name,
            Gender: convertGender(storedUser.gender),
            SystemRole: convertSystemRole(storedUser.systemRole),
            OfficeLocation: convertOfficeLocation(storedUser.officeLocation),
            Title: storedUser.title,
            JoinDate: storedUser.joinDate,
            Status: convertPersonnelStatus(storedUser.status),
            Education: storedUser.education,
            School: storedUser.school,
            Remark: storedUser.remark,
          });
          await loadData();
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleChangeView = (view: string, taskId?: string) => {
    setCurrentView(view);
    setTargetTaskName(taskId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const result = await apiDataService.login(loginId, loginPwd);
      if (result) {
        // 保存用户信息
        authService.setStoredUser(result.user);

        const user = {
          UserID: result.user.userID,
          Name: result.user.name,
          Gender: convertGender(result.user.gender),
          SystemRole: convertSystemRole(result.user.systemRole),
          OfficeLocation: convertOfficeLocation(result.user.officeLocation),
          Title: result.user.title,
          JoinDate: result.user.joinDate,
          Status: convertPersonnelStatus(result.user.status),
          Education: result.user.education,
          School: result.user.school,
          Remark: result.user.remark,
        };

        setCurrentUser(user);
        await loadData();
      } else {
        setLoginError('用户名或密码错误');
        setLoading(false);
      }
    } catch (error) {
      setLoginError('登录失败，请检查网络连接');
      console.error('登录错误:', error);
      setLoading(false);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setLoginId('');
    setLoginPwd('');
    setLoginError('');
    setCurrentView('dashboard');
    setUsers([]);
    setProjects([]);
    setTasks([]);
    setLoading(false);
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

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
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Lock size={18} />
              )}
              {isLoggingIn ? '登录中...' : '登录系统'}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-500">
            <p>默认账号: admin/admin123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* API错误提示横幅 */}
      {!apiConnected && apiError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={20} />
              <div>
                <p className="text-red-800 font-medium">后端服务连接失败</p>
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              重试
            </button>
          </div>
        </div>
      )}
      {/* 占位符，防止错误提示遮挡内容 */}
      {!apiConnected && apiError && <div className="h-24" />}
      <Layout
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        onChangeView={setCurrentView}
      >
      {currentView === 'dashboard' && (
        currentUser.SystemRole === SystemRole.MEMBER ? (
          <PersonalWorkspaceView currentUser={currentUser} onRefresh={refreshData} onChangeView={handleChangeView} />
        ) : (
          <Dashboard currentUser={currentUser} users={users} projects={projects} tasks={tasks} />
        )
      )}
      {currentView === 'workspace' && <PersonalWorkspaceView currentUser={currentUser} onRefresh={refreshData} onChangeView={handleChangeView} />}
      {currentView === 'personnel' && <PersonnelView currentUser={currentUser} users={users} onRefresh={refreshData} />}
      {currentView === 'projects' && <ProjectView currentUser={currentUser} projects={projects} users={users} onRefresh={refreshData} />}
      {currentView === 'tasks' && <TaskView currentUser={currentUser} tasks={tasks} projects={projects} users={users} onRefresh={refreshData} targetTaskName={targetTaskName} onClearTargetTaskName={() => setTargetTaskName(undefined)} />}
      {currentView === 'task-pool' && (
        <TaskPoolView
          currentUser={currentUser}
          projects={projects}
          users={users}
          onRefresh={refreshData}
        />
      )}
      {currentView === 'settings' && <SettingsComponent currentUser={currentUser} />}
    </Layout>
    </>
  );
};

export default App;
