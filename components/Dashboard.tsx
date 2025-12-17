import React, { useMemo } from 'react';
import { User, Task, Project, TaskStatus, TaskClass, SystemRole } from '../types';
import { dataService } from '../services/dataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, tasks }) => {
  // Statistics Logic
  const stats = useMemo(() => {
    // Filter tasks based on role
    const visibleTasks = currentUser.SystemRole === SystemRole.ADMIN || currentUser.SystemRole === SystemRole.LEADER
      ? tasks
      : tasks.filter(t => t.AssigneeID === currentUser.UserID);

    // No time filter - show all tasks
    const filteredVisibleTasks = visibleTasks;

    const pending = filteredVisibleTasks.filter(t => t.Status === TaskStatus.NOT_STARTED).length;
    const inProgress = filteredVisibleTasks.filter(t => t.Status === TaskStatus.IN_PROGRESS).length;
    const completed = filteredVisibleTasks.filter(t => t.Status === TaskStatus.COMPLETED).length;
    const total = filteredVisibleTasks.length;

    // Get TaskClasses
    const taskClasses = dataService.getTaskClasses();

    // Distribution by TaskClass
    const typeDist = taskClasses.map(tc => ({
      name: tc.name,
      value: filteredVisibleTasks.filter(t => t.TaskClassID === tc.id).length
    })).filter(d => d.value > 0);

    // Workload by Person (Leader/Admin only)
    const workloadData = users.map(u => ({
      name: u.Name,
      tasks: filteredVisibleTasks.filter(t => t.AssigneeID === u.UserID && t.Status !== TaskStatus.COMPLETED).length,
      workload: filteredVisibleTasks
        .filter(t => t.AssigneeID === u.UserID && t.Status !== TaskStatus.COMPLETED)
        .reduce((sum, t) => sum + (t.Workload || 0), 0)
    })).sort((a, b) => b.workload - a.workload).slice(0, 10);

    return { pending, inProgress, completed, total, typeDist, workloadData };
  }, [tasks, currentUser, users]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {currentUser.SystemRole === SystemRole.MEMBER ? '个人工作台' : '团队总览看板'}
        </h2>
        <span className="text-sm text-slate-500">最后更新: {new Date().toLocaleDateString()}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">待处理任务</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.pending}</h3>
            </div>
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">进行中</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">已完成</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</h3>
            </div>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">总任务数</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">任务类型分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {stats.typeDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">
            {currentUser.SystemRole !== SystemRole.MEMBER ? '团队成员待办负载 Top 10' : '近期任务趋势'}
          </h3>
          <div className="h-64">
            {currentUser.SystemRole !== SystemRole.MEMBER ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.workloadData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="workload" fill="#3b82f6" name="剩余工时(人天)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                暂无足够历史数据生成趋势图
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
