import React, { useState, useEffect } from 'react';
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
import { User, Project, Task, SystemRole, OfficeLocation, PersonnelStatus, ProjectCategory, TaskStatus } from './types';
import { Lock, Settings, Server, Database, AlertCircle } from 'lucide-react';

// API值到前端值的映射函数
const mapSystemRole = (apiRole: string): SystemRole => {
  const map: Record<string, SystemRole> = {
    'Admin': SystemRole.ADMIN,
    'Leader': SystemRole.LEADER,
    'Member': SystemRole.MEMBER,
  };
  return map[apiRole] || SystemRole.MEMBER;
};

const mapOfficeLocation = (apiLoc: string): OfficeLocation => {
  const map: Record<string, OfficeLocation> = {
    'Chengdu': OfficeLocation.CHENGDU,
    'Deyang': OfficeLocation.DEYANG,
  };
  return map[apiLoc] || OfficeLocation.CHENGDU;
};

const mapPersonnelStatus = (apiStatus: string): PersonnelStatus => {
  const map: Record<string, PersonnelStatus> = {
    'Active': PersonnelStatus.ACTIVE,
    'BorrowedIn': PersonnelStatus.BORROWED_IN,
    'BorrowedOut': PersonnelStatus.BORROWED_OUT,
    'Intern': PersonnelStatus.INTERN,
    'Leave': PersonnelStatus.LEAVE,
  };
  return map[apiStatus] || PersonnelStatus.ACTIVE;
};

const mapProjectCategory = (apiCategory: string): ProjectCategory => {
  const map: Record<string, ProjectCategory> = {
    'Market': ProjectCategory.MARKET,
    'Execution': ProjectCategory.EXECUTION,
    'Nuclear': ProjectCategory.NUCLEAR,
    'Research': ProjectCategory.RESEARCH,
    'Renovation': ProjectCategory.RENOVATION,
    'Other': ProjectCategory.OTHER,
  };
  return map[apiCategory] || ProjectCategory.EXECUTION;
};

const mapTaskStatus = (apiStatus: string): TaskStatus => {
  const map: Record<string, TaskStatus> = {
    'NotStarted': TaskStatus.NOT_STARTED,
    'Drafting': TaskStatus.DRAFTING,
    'Revising': TaskStatus.REVISING,
    'Reviewing': TaskStatus.REVIEWING,
    'Reviewing2': TaskStatus.REVIEWING2,
    'Completed': TaskStatus.COMPLETED,
  };
  return map[apiStatus] || TaskStatus.NOT_STARTED;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetTaskName, setTargetTaskName] = useState<string | undefined>();

  // Application Data State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskClasses, setTaskClasses] = useState<TaskClass[]>([]);

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // System Health Check State
  const [systemHealth, setSystemHealth] = useState<HealthStatus | null>(null);

  // Initial Load - check system health and session
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkSystemHealth();
      setSystemHealth(health);

      // If system is healthy, check for existing session
      if (health.backend === 'ok' && health.database !== 'error') {
        checkSession();
      }
    };
    checkHealth();

    // 定期检测系统状态（每30秒）
    const healthInterval = setInterval(checkHealth, 30000);

    return () => clearInterval(healthInterval);
  }, []);

  // Check for existing session
  const checkSession = async () => {
    if (apiDataService.isLoggedIn()) {
      const storedUser = apiDataService.getCurrentUser();
      if (storedUser) {
        console.log('Stored user from localStorage:', storedUser);
        // Convert stored user (camelCase) to frontend format (PascalCase)
        const convertedUser: User = {
          UserID: storedUser.userID,
          Name: storedUser.name,
          SystemRole: mapSystemRole(storedUser.systemRole),
          OfficeLocation: storedUser.officeLocation as any,
          Title: storedUser.title,
          JoinDate: storedUser.joinDate,
          Status: mapPersonnelStatus(storedUser.status),
          Education: storedUser.education,
          School: storedUser.school,
          Remark: storedUser.remark,
          Gender: undefined,
          Password: '',
        };
        console.log('Converted user:', convertedUser);
        setCurrentUser(convertedUser);
        await refreshData();
      }
    }
  };

  const refreshData = async () => {
    const [apiUsers, apiProjects, apiTasks] = await Promise.all([
      apiDataService.getUsers(),
      apiDataService.getProjects(),
      apiDataService.getTasks(),
    ]);

    // Convert API users to frontend User format
    const convertedUsers: User[] = apiUsers.map((apiUser: any) => ({
      UserID: apiUser.userID,
      Name: apiUser.name,
      SystemRole: mapSystemRole(apiUser.systemRole),
      OfficeLocation: mapOfficeLocation(apiUser.officeLocation),
      Title: apiUser.title,
      JoinDate: apiUser.joinDate,
      Status: mapPersonnelStatus(apiUser.status),
      Education: apiUser.education,
      School: apiUser.school,
      Remark: apiUser.remark,
      Gender: apiUser.gender,
      Password: '',
    }));

    // Convert API projects to frontend Project format
    const convertedProjects: Project[] = apiProjects.map((apiProject: any) => ({
      id: apiProject.id,
      name: apiProject.name,
      category: mapProjectCategory(apiProject.category),
      workNo: apiProject.workNo,
      capacity: apiProject.capacity,
      model: apiProject.model,
      isWon: apiProject.isWon,
      isForeign: apiProject.isForeign,
      startDate: apiProject.startDate,
      endDate: apiProject.endDate,
      remark: apiProject.remark,
      isCommissioned: apiProject.isCommissioned,
      isCompleted: apiProject.isCompleted,
      isKeyProject: apiProject.isKeyProject,
      is_deleted: false,
    }));

    // Convert API tasks to frontend Task format
    const convertedTasks: Task[] = apiTasks.map((apiTask: any) => ({
      TaskID: apiTask.taskID,
      TaskName: apiTask.taskName,
      TaskClassID: apiTask.taskClassID,
      Category: apiTask.category,
      ProjectID: apiTask.projectID,
      AssigneeID: apiTask.assigneeID,
      AssigneeName: apiTask.assigneeName,
      StartDate: apiTask.startDate,
      DueDate: apiTask.dueDate,
      CompletedDate: apiTask.completedDate,
      Status: mapTaskStatus(apiTask.status),
      Workload: apiTask.workload,
      Difficulty: apiTask.difficulty,
      Remark: apiTask.remark,
      CreatedDate: apiTask.createdDate,
      CreatedBy: apiTask.createdBy,
      TravelLocation: apiTask.travelLocation,
      TravelDuration: apiTask.travelDuration,
      TravelLabel: apiTask.travelLabel,
      MeetingDuration: apiTask.meetingDuration,
      Participants: apiTask.participants,
      ParticipantNames: apiTask.participantNames,
      CapacityLevel: apiTask.capacityLevel,
      CheckerID: apiTask.checkerID,
      CheckerName: apiTask.checkerName,
      CheckerWorkload: apiTask.checkerWorkload,
      checkerStatus: apiTask.checkerStatus as any,
      ChiefDesignerID: apiTask.chiefDesignerID,
      ChiefDesignerName: apiTask.chiefDesignerName,
      ChiefDesignerWorkload: apiTask.chiefDesignerWorkload,
      chiefDesignerStatus: apiTask.chiefDesignerStatus as any,
      ApproverID: apiTask.approverID,
      ApproverName: apiTask.approverName,
      ApproverWorkload: apiTask.approverWorkload,
      approverStatus: apiTask.approverStatus as any,
      assigneeStatus: apiTask.assigneeStatus as any,
      isForceAssessment: apiTask.isForceAssessment,
      is_in_pool: apiTask.isInPool,
      is_deleted: false,
    }));

    setUsers(convertedUsers);
    setProjects(convertedProjects);
    setTasks(convertedTasks);

    // Get task classes
    const apiTaskClasses = await apiDataService.getTaskClasses();
    const convertedTaskClasses: TaskClass[] = apiTaskClasses.map((tc: any) => ({
      id: tc.id,
      name: tc.name,
      code: tc.code,
      description: tc.description,
      notice: tc.notice,
      is_deleted: false,
    }));
    setTaskClasses(convertedTaskClasses);
  };

  const handleChangeView = (view: string, taskId?: string) => {
    setCurrentView(view);
    setTargetTaskName(taskId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const result = await apiDataService.login(loginId, loginPwd);
      console.log('App.tsx login result:', result);
      if (result) {
        // Convert API user to frontend format (response is already camelCase)
        const convertedUser: User = {
          UserID: result.user.userID,
          Name: result.user.name,
          SystemRole: result.user.systemRole as SystemRole,
          OfficeLocation: result.user.officeLocation as any,
          Title: result.user.title,
          JoinDate: result.user.joinDate,
          Status: result.user.status as any,
          Education: result.user.education,
          School: result.user.school,
          Remark: result.user.remark,
          Gender: undefined,
          Password: '',
        };
        setCurrentUser(convertedUser);
        await refreshData();
        setLoginError('');
      } else {
        setLoginError('用户名或密码错误');
      }
    } catch (error) {
      setLoginError('登录失败，请稍后重试');
      console.error('登录错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiDataService.logout();
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setLoginId('');
    setLoginPwd('');
    setLoginError('');
    setCurrentView('dashboard');
    setUsers([]);
    setProjects([]);
    setTasks([]);
  };

  // Health check in progress - show placeholder to prevent flash
  if (systemHealth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Backend service error screen
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

  // Database connection error screen
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

  return (
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
          <Dashboard currentUser={currentUser} users={users} projects={projects} tasks={tasks} taskClasses={taskClasses} />
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
  );
};

export default App;
