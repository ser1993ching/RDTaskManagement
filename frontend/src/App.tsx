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
import { User, Project, Task, SystemRole } from './types';
import { Lock, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [targetTaskName, setTargetTaskName] = useState<string | undefined>();

  // Application Data State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial Load - check for existing session
  useEffect(() => {
    const checkSession = async () => {
      if (apiDataService.isLoggedIn()) {
        const user = apiDataService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await refreshData();
        }
      }
    };
    checkSession();
  }, []);

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
      SystemRole: apiUser.systemRole as SystemRole,
      OfficeLocation: apiUser.officeLocation as any,
      Title: apiUser.title,
      JoinDate: apiUser.joinDate,
      Status: apiUser.status as any,
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
      category: apiProject.category as any,
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
      Status: apiTask.status as any,
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
      if (result) {
        // Convert API user to frontend format
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
          Gender: result.user.gender,
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
  );
};

export default App;
