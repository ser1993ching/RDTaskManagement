import React, { useState, useMemo } from 'react';
import { User, Task, Project, TaskStatus, TaskClass, SystemRole, ProjectCategory } from '../types';
import { dataService } from '../services/dataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2, Calendar, TrendingUp, Users, Plane, Briefcase, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'lastYear';
type DeadlineFilter = 'all' | 'overdue' | 'thisMonth' | 'pastThreeMonths' | 'thisYear';

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

// Force Assessment Task List Component
const ForceAssessmentPanel: React.FC<{
  tasks: Task[];
  taskClasses: TaskClass[];
  users: User[];
}> = ({ tasks, taskClasses, users }) => {
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('thisMonth');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const getCategoryName = (taskClassId: string) => {
    const tc = taskClasses.find(t => t.id === taskClassId);
    return tc?.name || taskClassId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return '-';
    const user = users.find(u => u.UserID === userId);
    return user?.Name || userId;
  };

  const getStatusBadgeClass = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-700';
      case TaskStatus.DRAFTING:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.REVISING:
        return 'bg-yellow-100 text-yellow-700';
      case TaskStatus.REVIEWING:
        return 'bg-purple-100 text-purple-700';
      case TaskStatus.REVIEWING2:
        return 'bg-orange-100 text-orange-700';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const checkDeadline = (dueDate?: string, status?: TaskStatus): { type: DeadlineFilter; days?: number } => {
    if (!dueDate) return { type: 'all' };
    const now = new Date();
    const due = new Date(dueDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // This year range (Jan 1 to Dec 31)
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    // If not in this year, return 'all' for thisYear filter
    if (due < yearStart || due > yearEnd) {
      return { type: 'all' };
    }

    if (due < today) return { type: 'overdue', days: Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)) };

    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (due <= monthEnd && due >= today) return { type: 'thisMonth' };

    // Past 3 months (from today - 3 months to today)
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    if (due >= threeMonthsAgo && due < today) return { type: 'pastThreeMonths' };

    return { type: 'thisYear' };
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (deadlineFilter !== 'all') {
          // Special handling for thisYear - show all tasks with dueDate in this year
          if (deadlineFilter === 'thisYear') {
            if (!task.DueDate) return false;
            const due = new Date(task.DueDate);
            const today = new Date();
            const yearStart = new Date(today.getFullYear(), 0, 1);
            const yearEnd = new Date(today.getFullYear(), 11, 31);
            if (due < yearStart || due > yearEnd) return false;
          } else {
            const deadlineCheck = checkDeadline(task.DueDate, task.Status);
            if (deadlineCheck.type !== deadlineFilter) return false;
          }
        }
        if (statusFilter !== 'all') {
          if (statusFilter === 'notStarted' && task.Status !== TaskStatus.NOT_STARTED) return false;
          if (statusFilter === 'inProgress' &&
              task.Status !== TaskStatus.DRAFTING &&
              task.Status !== TaskStatus.REVISING &&
              task.Status !== TaskStatus.REVIEWING &&
              task.Status !== TaskStatus.REVIEWING2) return false;
          if (statusFilter === 'completed' && task.Status !== TaskStatus.COMPLETED) return false;
        }
        return true;
      })
      .sort((a, b) => a.TaskName.localeCompare(b.TaskName, 'zh-CN'));
  }, [tasks, deadlineFilter, statusFilter]);

  const deadlineLabels: Record<DeadlineFilter, string> = {
    all: '全部',
    overdue: '已逾期',
    thisMonth: '本月',
    pastThreeMonths: '近三个月',
    thisYear: '本年度'
  };

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'notStarted', label: '未开始' },
    { value: 'inProgress', label: '进行中' },
    { value: 'completed', label: '已完成' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="font-semibold text-slate-800">强制考核任务清单</span>
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-sm font-medium">
            {filteredTasks.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-red-500" /> : <ChevronDown className="w-5 h-5 text-red-500" />}
      </button>

      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">截止时间:</span>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                {(['all', 'overdue', 'thisMonth', 'pastThreeMonths', 'thisYear'] as DeadlineFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDeadlineFilter(filter)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      deadlineFilter === filter
                        ? 'bg-white text-red-600 shadow-sm font-medium'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {deadlineLabels[filter]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">状态:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1 text-sm bg-white cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <span className="text-sm text-slate-500 ml-auto">
              显示 {filteredTasks.length} / {tasks.length} 个任务
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400">暂无符合条件的强制考核任务</div>
          ) : (
            <div className="overflow-x-auto max-h-[240px] overflow-y-auto border border-slate-100 rounded-lg">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-64">任务名称</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-24">类别</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-20">负责人</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-20">校核人</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-20">状态</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-24">开始时间</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-slate-600 whitespace-nowrap w-24">截止时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const deadlineInfo = checkDeadline(task.DueDate, task.Status);
                    const isOverdue = deadlineInfo.type === 'overdue';
                    const displayName = task.TaskName.length > 20
                      ? task.TaskName.substring(0, 20) + '...'
                      : task.TaskName;

                    return (
                      <tr
                        key={task.TaskID}
                        className={`${isOverdue ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}
                      >
                        <td className="px-3 py-2 w-64">
                          <div className="flex items-center gap-2">
                            {isOverdue && (
                              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className="text-sm text-slate-900 font-medium" title={task.TaskName}>
                              {displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 w-24 text-sm text-slate-600">{getCategoryName(task.TaskClassID)}</td>
                        <td className="px-3 py-2 w-20 text-sm text-slate-600">{getUserName(task.AssigneeID)}</td>
                        <td className="px-3 py-2 w-20 text-sm text-slate-600">{getUserName(task.CheckerID)}</td>
                        <td className="px-3 py-2 w-20">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(task.Status)}`}>
                            {task.Status}
                          </span>
                        </td>
                        <td className="px-3 py-2 w-24 text-sm text-slate-600">{task.StartDate || '-'}</td>
                        <td className={`px-3 py-2 w-24 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                          {task.DueDate || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Delayed Task List Component (tasks created > 45 days ago but not completed)
const DelayedTaskPanel: React.FC<{
  tasks: Task[];
  taskClasses: TaskClass[];
  users: User[];
}> = ({ tasks, taskClasses, users }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getCategoryName = (taskClassId: string) => {
    const tc = taskClasses.find(t => t.id === taskClassId);
    return tc?.name || taskClassId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return '-';
    const user = users.find(u => u.UserID === userId);
    return user?.Name || userId;
  };

  const getStatusBadgeClass = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-700';
      case TaskStatus.DRAFTING:
        return 'bg-blue-100 text-blue-700';
      case TaskStatus.REVISING:
        return 'bg-yellow-100 text-yellow-700';
      case TaskStatus.REVIEWING:
        return 'bg-purple-100 text-purple-700';
      case TaskStatus.REVIEWING2:
        return 'bg-orange-100 text-orange-700';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Filter tasks: start date more than 45 days ago and not completed
  const delayedTasks = useMemo(() => {
    const now = new Date();
    const fortyFiveDaysAgo = new Date(now);
    fortyFiveDaysAgo.setDate(now.getDate() - 45);

    return tasks
      .filter(task => {
        if (task.is_deleted) return false;
        if (!task.StartDate) return false;
        if (task.Status === TaskStatus.COMPLETED) return false;

        const startDate = new Date(task.StartDate);
        return startDate <= fortyFiveDaysAgo;
      })
      .sort((a, b) => {
        // Sort by start date (oldest first)
        const dateA = new Date(a.StartDate);
        const dateB = new Date(b.StartDate);
        return dateA.getTime() - dateB.getTime(); // Older tasks first
      });
  }, [tasks]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-slate-800">拖延任务清单</span>
          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-sm font-medium">
            {delayedTasks.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-amber-600">距离开始时间超过45天</span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-amber-500" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4">
          {delayedTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400">暂无拖延任务</div>
          ) : (
            <div className="overflow-x-auto max-h-[240px] overflow-y-auto border border-amber-100 rounded-lg">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-amber-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-64">任务名称</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-24">类别</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-20">负责人</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-20">校核人</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-20">状态</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-24">开始时间</th>
                    <th className="px-3 py-2 text-left text-sm font-medium text-amber-800 whitespace-nowrap w-24">开始距今天数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {delayedTasks.map((task) => {
                    const startDate = new Date(task.StartDate);
                    const now = new Date();
                    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const displayName = task.TaskName.length > 20
                      ? task.TaskName.substring(0, 20) + '...'
                      : task.TaskName;

                    return (
                      <tr key={task.TaskID} className="hover:bg-amber-50 transition-colors">
                        <td className="px-3 py-2 w-64">
                          <span className="text-sm text-slate-900 font-medium" title={task.TaskName}>
                            {displayName}
                          </span>
                        </td>
                        <td className="px-3 py-2 w-24 text-sm text-slate-600">{getCategoryName(task.TaskClassID)}</td>
                        <td className="px-3 py-2 w-20 text-sm text-slate-600">{getUserName(task.AssigneeID)}</td>
                        <td className="px-3 py-2 w-20 text-sm text-slate-600">{getUserName(task.CheckerID)}</td>
                        <td className="px-3 py-2 w-20">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(task.Status)}`}>
                            {task.Status}
                          </span>
                        </td>
                        <td className="px-3 py-2 w-24 text-sm text-slate-600">{task.StartDate || '-'}</td>
                        <td className="px-3 py-2 w-24 text-sm text-amber-600 font-medium">{daysSinceStart}天</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, users, projects, tasks }) => {
  const [period, setPeriod] = useState<Period>('year');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | 'nuclear' | 'conventional' | 'research' | 'renovation' | 'other'>('all');

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

    // Workload by Person (Leader/Admin only, exclude admin user, only active personnel)
    const workloadData = users
      .filter(u => u.SystemRole !== 'ADMIN' && u.Name !== '系统管理员' && u.Status === '在岗')
      .map(u => {
        const userTasks = filteredVisibleTasks.filter(t => t.AssigneeID === u.UserID);
        const pendingTasks = userTasks.filter(t => t.Status !== TaskStatus.COMPLETED);
        const completedTasks = userTasks.filter(t => t.Status === TaskStatus.COMPLETED);
        return {
          name: u.Name,
          pendingTasks: pendingTasks.length,
          pendingWorkload: pendingTasks.reduce((sum, t) => sum + (t.Workload || 0), 0),
          completedTasks: completedTasks.length,
          completedWorkload: completedTasks.reduce((sum, t) => sum + (t.Workload || 0), 0),
          totalTasks: userTasks.length
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

    // 1. 项目任务数量分配（横向柱状图数据）
    const projectTaskDist = projects
      .filter(p => {
        if (p.is_deleted) return false;
        switch (projectTypeFilter) {
          case 'nuclear':
            return p.category === ProjectCategory.NUCLEAR;
          case 'conventional':
            return p.category === ProjectCategory.EXECUTION;
          case 'research':
            return p.category === ProjectCategory.RESEARCH;
          case 'renovation':
            return p.category === ProjectCategory.RENOVATION;
          case 'other':
            return p.category === ProjectCategory.OTHER;
          default:
            return true;
        }
      })
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        fullName: p.name,
        value: filteredVisibleTasks.filter(t => t.ProjectID === p.id).length
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);

    // 2. 容量等级任务数量分配（横向柱状图数据）
    const capacityLevelData = Object.entries(
      filteredVisibleTasks.reduce((acc, t) => {
        const level = t.CapacityLevel || '未分类';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 3. 核电项目与非核电项目工时对比
    const nuclearWorkload = filteredVisibleTasks.filter(t => {
      const proj = projects.find(p => p.id === t.ProjectID);
      return proj?.category === ProjectCategory.NUCLEAR;
    }).reduce((sum, t) => sum + (t.Workload || 0), 0);

    const nonNuclearWorkload = filteredVisibleTasks.filter(t => {
      const proj = projects.find(p => p.id === t.ProjectID);
      return proj?.category !== ProjectCategory.NUCLEAR;
    }).reduce((sum, t) => sum + (t.Workload || 0), 0);

    const nuclearExecutionDist = [
      { name: '核电项目', value: Math.round(nuclearWorkload) },
      { name: '非核电项目', value: Math.round(nonNuclearWorkload) }
    ];

    // 4. 差旅任务月度趋势
    const travelTrend = Object.entries(
      filteredVisibleTasks
        .filter(t => t.TaskClassID === 'TC009')
        .reduce((acc, t) => {
          if (t.DueDate) {
            const month = t.DueDate.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
    )
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 5. 会议时长月度趋势
    const meetingTrend = Object.entries(
      filteredVisibleTasks
        .filter(t => t.TaskClassID === 'TC007')
        .reduce((acc, t) => {
          if (t.DueDate) {
            const month = t.DueDate.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + (t.MeetingDuration || 0);
          }
          return acc;
        }, {} as Record<string, number>)
    )
      .map(([month, hours]) => ({ month, hours }))
      .sort((a, b) => a.month.localeCompare(b.month));

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
      isDailyTrend,
      projectTaskDist,
      capacityLevelData,
      nuclearExecutionDist,
      travelTrend,
      meetingTrend,
      projectTypeFilter
    };
  }, [getFilteredTasks, currentUser, users, projects, projectTypeFilter]);

  // Get task classes
  const taskClasses = useMemo(() => {
    return dataService.getTaskClasses();
  }, []);

  // Filter force assessment tasks
  const forceAssessmentTasks = useMemo(() => {
    return tasks.filter(t => t.isForceAssessment === true && !t.is_deleted);
  }, [tasks]);

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

      {/* Force Assessment Task List - Second Row */}
      {forceAssessmentTasks.length > 0 && (
        <ForceAssessmentPanel
          tasks={forceAssessmentTasks}
          taskClasses={taskClasses}
          users={users}
        />
      )}

      {/* Delayed Task List - Third Row */}
      <DelayedTaskPanel
        tasks={tasks}
        taskClasses={taskClasses}
        users={users}
      />

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
          <div className="overflow-y-auto max-h-[360px]">
            <div style={{ height: `${Math.max(360, stats.workloadData.length * 40)}px`, minHeight: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.workloadData} layout="vertical" margin={{ left: 50, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => Math.round(value as number)} />
                  <Legend />
                  <Bar dataKey="totalTasks" fill="#6b7280" name="任务数量" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pendingWorkload" fill="#f59e0b" name="待办工时(小时)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completedWorkload" fill="#10b981" name="已完成工时(小时)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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

      {/* Charts Row 4: 项目与容量等级任务分配 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 项目任务数量分配 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">项目任务数量分配</h3>
            <div className="flex bg-slate-100 rounded-lg p-0.5 flex-wrap gap-0.5">
              <button
                onClick={() => setProjectTypeFilter('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setProjectTypeFilter('nuclear')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'nuclear'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                核电项目
              </button>
              <button
                onClick={() => setProjectTypeFilter('conventional')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'conventional'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                常规项目
              </button>
              <button
                onClick={() => setProjectTypeFilter('research')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'research'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                科研项目
              </button>
              <button
                onClick={() => setProjectTypeFilter('renovation')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'renovation'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                改造项目
              </button>
              <button
                onClick={() => setProjectTypeFilter('other')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  stats.projectTypeFilter === 'other'
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                其他项目
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[360px]">
            <div style={{ height: `${Math.max(360, stats.projectTaskDist.length * 40)}px`, minHeight: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.projectTaskDist} layout="vertical" margin={{ left: 110, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value, name, props) => [value, props.payload.fullName || name]} />
                  <Bar dataKey="value" fill="#3b82f6" name="任务数" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 容量等级任务数量分配 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">容量等级任务数量分配</h3>
          <div className="overflow-y-auto max-h-[360px]">
            <div style={{ height: `${Math.max(360, stats.capacityLevelData.length * 40)}px`, minHeight: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.capacityLevelData} layout="vertical" margin={{ left: 90, right: 30, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" name="任务数" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 5: 趋势图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 差旅任务变化趋势 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Plane className="text-blue-600" size={20} />
            班组差旅任务变化趋势
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.travelTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="差旅任务数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 会议时长变化趋势 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Briefcase className="text-purple-600" size={20} />
            会议时长变化趋势
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.meetingTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="会议时长(小时)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
