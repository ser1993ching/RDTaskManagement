import React, { useState, useMemo } from 'react';
import { User, Task, Project, TaskStatus, TaskClass, SystemRole, ProjectCategory } from '../types';
import { dataService } from '../services/dataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertCircle, Clock, CheckCircle2, Calendar, TrendingUp, Users, Plane, Briefcase } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'lastYear';

// Period selector component
const PeriodSelector: React.FC<{
  value: Period;
  onChange: (value: Period) => void;
}> = ({ value, onChange }) => {
  const periodLabels: Record<Period, string> = {
    'week': '本周',
    'month': '本月',
    'quarter': '近三个月',
    'halfYear': '近半年',
    'year': '本年度',
    'lastYear': '近一年'
  };

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {(['week', 'month', 'quarter', 'halfYear', 'year', 'lastYear'] as Period[]).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            value === period
              ? 'bg-white text-blue-600 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {periodLabels[period]}
        </button>
      ))}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, projects, tasks }) => {
  const [period, setPeriod] = useState<Period>('year');

  // Get time-bounded tasks
  const getFilteredTasks = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'halfYear':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        // 过去12个月
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'lastYear':
      default:
        // 过去12个月（与year相同）
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return tasks.filter(t => {
      const createdDate = new Date(t.CreatedDate);
      return createdDate >= startDate && createdDate <= now && !t.is_deleted;
    });
  }, [tasks, period]);

  // Monthly trend data - follows period selector
  const { monthlyTrend, isDailyTrend } = useMemo(() => {
    const isDaily = period === 'week' || period === 'month';
    const now = new Date();
    let startDate: Date;
    let data: { [key: string]: { assigned: number; completed: number } } = {};

    if (isDaily) {
      // 以天为单位显示
      const daysToShow = period === 'week' ? 7 : 30;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysToShow);

      // 生成每天的key
      const currentDate = new Date(startDate);
      for (let i = 0; i <= daysToShow; i++) {
        const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        data[key] = { assigned: 0, completed: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 统计每天的任务
      getFilteredTasks.forEach(t => {
        const createdDate = new Date(t.CreatedDate);
        const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}-${String(createdDate.getDate()).padStart(2, '0')}`;
        if (data[key]) {
          data[key].assigned++;
          if (t.Status === TaskStatus.COMPLETED) {
            data[key].completed++;
          }
        }
      });

      return {
        monthlyTrend: Object.entries(data)
          .map(([day, d]) => ({
            day,
            ...d,
            completionRate: d.assigned > 0 ? Math.round((d.completed / d.assigned) * 100) : 0
          }))
          .sort((a, b) => a.day.localeCompare(b.day)),
        isDailyTrend: true
      };
    } else {
      // 以月为单位显示
      let monthsToShow: number;

      switch (period) {
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          monthsToShow = 4;
          break;
        case 'halfYear':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          monthsToShow = 7;
          break;
        case 'year':
        case 'lastYear':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          monthsToShow = 13;
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 6);
          monthsToShow = 7;
      }

      // 生成每月的key
      const currentDate = new Date(startDate);
      for (let i = 0; i < monthsToShow; i++) {
        const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        data[key] = { assigned: 0, completed: 0 };
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // 统计每月的任务
      getFilteredTasks.forEach(t => {
        const createdDate = new Date(t.CreatedDate);
        const key = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        if (data[key]) {
          data[key].assigned++;
          if (t.Status === TaskStatus.COMPLETED) {
            data[key].completed++;
          }
        }
      });

      return {
        monthlyTrend: Object.entries(data)
          .map(([month, d]) => ({
            month,
            ...d,
            completionRate: d.assigned > 0 ? Math.round((d.completed / d.assigned) * 100) : 0
          }))
          .sort((a, b) => a.month.localeCompare(b.month)),
        isDailyTrend: false
      };
    }
  }, [getFilteredTasks, period]);

  // Statistics Logic
  const stats = useMemo(() => {
    const filteredVisibleTasks = getFilteredTasks.filter(t =>
      currentUser.SystemRole === SystemRole.ADMIN || currentUser.SystemRole === SystemRole.LEADER
        ? true
        : t.AssigneeID === currentUser.UserID
    );

    // KPI counts
    const pending = filteredVisibleTasks.filter(t => t.Status === TaskStatus.NOT_STARTED).length;
    const inProgress = filteredVisibleTasks.filter(t =>
      t.Status === TaskStatus.DRAFTING ||
      t.Status === TaskStatus.REVISING ||
      t.Status === TaskStatus.REVIEWING ||
      t.Status === TaskStatus.REVIEWING2
    ).length;
    const completed = filteredVisibleTasks.filter(t => t.Status === TaskStatus.COMPLETED).length;
    const total = filteredVisibleTasks.length;

    // Get TaskClasses
    const taskClasses = dataService.getTaskClasses();

    // Distribution by TaskClass (excluding TC009 travel and TC007 meeting for main stats)
    const typeDist = taskClasses.map(tc => ({
      name: tc.name,
      value: filteredVisibleTasks.filter(t => t.TaskClassID === tc.id).length
    })).filter(d => d.value > 0);

    // Workload by Person (Leader/Admin only)
    const workloadData = users.map(u => {
      const userTasks = filteredVisibleTasks.filter(t => t.AssigneeID === u.UserID);
      const pendingTasks = userTasks.filter(t => t.Status !== TaskStatus.COMPLETED);
      const completedTasks = userTasks.filter(t => t.Status === TaskStatus.COMPLETED);
      return {
        name: u.Name,
        pendingTasks: pendingTasks.length,
        pendingWorkload: pendingTasks.reduce((sum, t) => sum + (t.Workload || 0), 0),
        completedTasks: completedTasks.length,
        completedWorkload: completedTasks.reduce((sum, t) => sum + (t.Workload || 0), 0)
      };
    }).sort((a, b) => b.pendingWorkload - a.pendingWorkload).slice(0, 10);

    // Category completion rate
    const categoryCompletion = taskClasses.map(tc => {
      const categoryTasks = filteredVisibleTasks.filter(t => t.TaskClassID === tc.id);
      const completedCategory = categoryTasks.filter(t => t.Status === TaskStatus.COMPLETED).length;
      return {
        name: tc.name,
        total: categoryTasks.length,
        completed: completedCategory,
        completionRate: categoryTasks.length > 0 ? Math.round((completedCategory / categoryTasks.length) * 100) : 0
      };
    }).filter(c => c.total > 0).sort((a, b) => b.completionRate - a.completionRate);

    // Project attribute stats
    const projectStats = {
      wonMarket: projects.filter(p => p.isWon === true && p.category === ProjectCategory.MARKET && !p.is_deleted).length,
      commissioned: projects.filter(p => p.isCommissioned === true && p.category === ProjectCategory.EXECUTION && !p.is_deleted).length,
      keyProjects: projects.filter(p => p.isKeyProject === true && !p.is_deleted).length,
      total: projects.filter(p => !p.is_deleted).length
    };

    // Special task stats (travel and meeting)
    const travelTasks = filteredVisibleTasks.filter(t => t.TaskClassID === 'TC009');
    const meetingTasks = filteredVisibleTasks.filter(t => t.TaskClassID === 'TC007');
    const specialStats = {
      travelDays: travelTasks.reduce((sum, t) => sum + (t.TravelDuration || 0), 0),
      travelCount: travelTasks.length,
      meetingHours: meetingTasks.reduce((sum, t) => sum + (t.MeetingDuration || 0), 0),
      meetingCount: meetingTasks.length
    };

    // Overdue tasks
    const now = new Date();
    const overdueTasks = filteredVisibleTasks.filter(t => {
      if (!t.DueDate || t.Status === TaskStatus.COMPLETED) return false;
      const dueDate = new Date(t.DueDate);
      return dueDate < now;
    });

    return {
      pending,
      inProgress,
      completed,
      total,
      typeDist,
      workloadData,
      categoryCompletion,
      projectStats,
      specialStats,
      overdueCount: overdueTasks.length,
      overdueTasks: overdueTasks.slice(0, 5),
      isDailyTrend
    };
  }, [getFilteredTasks, currentUser, users, projects]);

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">团队总览看板</h2>
        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} />
          <span className="text-sm text-slate-500">最后更新: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <div className={`p-6 rounded-xl shadow-sm border ${
          stats.overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                逾期任务
              </p>
              <h3 className={`text-3xl font-bold mt-2 ${stats.overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {stats.overdueCount}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.overdueCount > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Task Trend & Workload Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              任务趋势
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={isDailyTrend ? 'day' : 'month'}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  tickFormatter={(value) => {
                    if (isDailyTrend) {
                      // 显示 MM-DD 格式
                      return value.substring(5);
                    }
                    return value;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ color: '#374151', marginBottom: '4px' }}
                  labelFormatter={(value) => isDailyTrend ? `日期: ${value}` : `月份: ${value}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assigned"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: isDailyTrend ? 3 : 4 }}
                  name="任务分配"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: isDailyTrend ? 3 : 4 }}
                  name="任务完成"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workload Comparison Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            团队工作量对比
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.workloadData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pendingWorkload" fill="#f59e0b" name="待办工时(小时)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completedWorkload" fill="#10b981" name="已完成工时(小时)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Category Stats & Project Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Completion Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">分类完成率</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryCompletion} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="completionRate" fill="#3b82f6" name="完成率%" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">任务类型分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent, value }) => `${name} ${(percent * 100).toFixed(0)}% (${value})`}
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
      </div>

      {/* Charts Row 3: Project Stats & Special Task Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Attribute Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">项目统计</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">市场中标项目</span>
              <span className="text-xl font-bold text-blue-900">{stats.projectStats.wonMarket}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-700">已投运项目</span>
              <span className="text-xl font-bold text-green-900">{stats.projectStats.commissioned}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-700">重点项目</span>
              <span className="text-xl font-bold text-purple-900">{stats.projectStats.keyProjects}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">项目总数</span>
              <span className="text-xl font-bold text-gray-900">{stats.projectStats.total}</span>
            </div>
          </div>
        </div>

        {/* Travel Task Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plane className="text-blue-600" size={20} />
            差旅统计 (TC009)
          </h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl font-bold text-blue-600">{stats.specialStats.travelDays}</div>
              <div className="text-blue-700 mt-1">出差总天数</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">差旅任务数</span>
              <span className="font-semibold text-gray-900">{stats.specialStats.travelCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">平均天数/任务</span>
              <span className="font-semibold text-gray-900">
                {stats.specialStats.travelCount > 0
                  ? (stats.specialStats.travelDays / stats.specialStats.travelCount).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Meeting Task Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Briefcase className="text-purple-600" size={20} />
            会议统计 (TC007)
          </h3>
          <div className="space-y-4">
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl font-bold text-purple-600">{stats.specialStats.meetingHours}</div>
              <div className="text-purple-700 mt-1">会议总时长(小时)</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">会议任务数</span>
              <span className="font-semibold text-gray-900">{stats.specialStats.meetingCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">平均时长/会议</span>
              <span className="font-semibold text-gray-900">
                {stats.specialStats.meetingCount > 0
                  ? (stats.specialStats.meetingHours / stats.specialStats.meetingCount).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
