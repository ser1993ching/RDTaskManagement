import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChevronDown, ChevronUp, Download, Printer, AlertTriangle, User, FileText } from 'lucide-react';
import { Task, User as UserType, PersonalStats, SeparatedTasks, Period, TaskClass, RoleStatus, SystemRole } from '../types';
import { dataService } from '../services/dataService';

// 日期格式化函数 - 只显示日期部分
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toISOString().split('T')[0];
};

// Colors for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Period selector component
const PeriodSelector: React.FC<{
  value: Period;
  onChange: (value: Period) => void;
}> = ({ value, onChange }) => {
  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'quarter', label: '近三个月' },
    { key: 'halfYear', label: '近半年' },
    { key: 'year', label: '本年度' },
    { key: 'yearAndHalf', label: '近一年' }
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onChange(period.key)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
            value === period.key
              ? 'bg-white text-blue-600 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// View mode toggle component
const ViewModeToggle: React.FC<{
  value: 'chart' | 'list';
  onChange: (value: 'chart' | 'list') => void;
}> = ({ value, onChange }) => (
  <div className="flex bg-gray-100 rounded-lg p-1">
    <button
      onClick={() => onChange('chart')}
      className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
        value === 'chart'
          ? 'bg-white text-blue-600 shadow-sm font-medium'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      图表模式
    </button>
    <button
      onClick={() => onChange('list')}
      className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
        value === 'list'
          ? 'bg-white text-blue-600 shadow-sm font-medium'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      清单模式
    </button>
  </div>
);

// Chart view component
const ChartView: React.FC<{
  stats: PersonalStats;
  taskClasses: TaskClass[];
}> = ({ stats, taskClasses }) => {
  // Completion donut data
  const completionData = [
    { name: '已完成', value: stats.completedCount },
    { name: '未完成', value: stats.totalCount - stats.completedCount }
  ];

  return (
    <div className="space-y-6">
      {/* Completion Rate Donut */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">任务完成率</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{stats.completionRate}%</span>
              <span className="text-sm text-gray-500">{stats.completedCount}/{stats.totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">类别分布</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.categoryDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="name"
                label={({ name, percent, value }) => value > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
                labelLine={false}
              >
                {stats.categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Trend Line Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">任务趋势</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#374151', marginBottom: '4px' }}
              />
              <Line
                type="monotone"
                dataKey="assigned"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="任务分配"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="任务完成"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Travel & Meeting Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-blue-800 font-medium mb-3">差旅统计</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-600">出差天数</span>
              <span className="font-semibold text-blue-900">{stats.travelStats.totalDays}天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">占工作日时长</span>
              <span className="font-semibold text-blue-900">{stats.travelStats.percentage}%</span>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <h4 className="text-purple-800 font-medium mb-3">会议统计</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-purple-600">会议时长</span>
              <span className="font-semibold text-purple-900">{stats.meetingStats.totalHours}小时</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-600">占工作时长</span>
              <span className="font-semibold text-purple-900">{stats.meetingStats.percentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// List view component
const ListView: React.FC<{
  stats: PersonalStats;
  separatedTasks: SeparatedTasks;
}> = ({ stats, separatedTasks }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
      {/* Task Summary */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">本周任务统计</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgressCount}</div>
            <div className="text-sm text-yellow-700">进行中</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.pendingCount}</div>
            <div className="text-sm text-gray-700">未开始</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
            <div className="text-sm text-green-700">已完成</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <div className="text-sm text-blue-700">完成率</div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">类别分布</h3>
        <div className="space-y-2">
          {stats.categoryDistribution.map((cat, idx) => (
            <div key={idx} className="flex items-center">
              <div className="w-32 text-gray-600">{cat.name}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 mx-2">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: COLORS[idx % COLORS.length]
                  }}
                />
              </div>
              <div className="w-24 text-right">
                <span className="font-medium">{cat.count}个</span>
                <span className="text-gray-500 ml-1">({cat.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-3">差旅统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-blue-700">出差天数</span>
            <span className="ml-2 font-semibold text-blue-900">{stats.travelStats.totalDays}天</span>
          </div>
          <div>
            <span className="text-blue-700">占工作日时长</span>
            <span className="ml-2 font-semibold text-blue-900">{stats.travelStats.percentage}%</span>
          </div>
        </div>
      </div>

      {/* Meeting Stats */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-purple-900 mb-3">会议统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-purple-700">会议时长</span>
            <span className="ml-2 font-semibold text-purple-900">{stats.meetingStats.totalHours}小时</span>
          </div>
          <div>
            <span className="text-purple-700">占工作时长</span>
            <span className="ml-2 font-semibold text-purple-900">{stats.meetingStats.percentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Travel task panel component (TC009)
const TravelTaskPanel: React.FC<{
  tasks: Task[];
  onTaskDoubleClick: (task: Task) => void;
  taskClasses: TaskClass[];
}> = ({ tasks, onTaskDoubleClick, taskClasses }) => {
  const getCategoryName = (taskClassId: string) => {
    const tc = taskClasses.find(t => t.id === taskClassId);
    return tc?.name || taskClassId;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-blue-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">差旅任务</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">暂无差旅任务</div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/4">任务名称</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">任务分类</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-16">标签</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-24">开始日</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">天数</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/4">出差地点</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, 5).map((task) => (
                <tr
                  key={task.TaskID}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onDoubleClick={() => onTaskDoubleClick(task)}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">{task.TaskName}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{getCategoryName(task.TaskClassID)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{task.TravelLabel || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{formatDate(task.StartDate)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{task.TravelDuration ? `${task.TravelDuration}天` : '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{task.TravelLocation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Meeting task panel component (TC007)
const MeetingTaskPanel: React.FC<{
  tasks: Task[];
  onTaskDoubleClick: (task: Task) => void;
  taskClasses: TaskClass[];
}> = ({ tasks, onTaskDoubleClick, taskClasses }) => {
  const getCategoryName = (taskClassId: string) => {
    const tc = taskClasses.find(t => t.id === taskClassId);
    return tc?.name || taskClassId;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between bg-purple-50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">内部会议与培训</span>
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-gray-500">暂无会议培训任务</div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/4">任务名称</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">分类</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-24">会议日期</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">会议时长</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.slice(0, 5).map((task) => (
                <tr
                  key={task.TaskID}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onDoubleClick={() => onTaskDoubleClick(task)}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">{task.TaskName}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{task.Category || getCategoryName(task.TaskClassID)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{formatDate(task.StartDate)}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{task.MeetingDuration ? `${task.MeetingDuration}小时` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Helper function to determine user's role in a task
const getUserRoleInTask = (task: Task, userId: string): string => {
  if (task.AssigneeID === userId) return '负责人';
  if (task.CheckerID === userId) return '校核人';
  if (task.ChiefDesignerID === userId) return '主任设计';
  if (task.ApproverID === userId) return '审查人';
  return '-';
};

// Helper function to get user's role type in a task
const getUserRoleTypeInTask = (task: Task, userId: string): 'assignee' | 'checker' | 'chiefDesigner' | 'approver' | null => {
  if (task.AssigneeID === userId) return 'assignee';
  if (task.CheckerID === userId) return 'checker';
  if (task.ChiefDesignerID === userId) return 'chiefDesigner';
  if (task.ApproverID === userId) return 'approver';
  return null;
};

// Helper function to get role status for a user in a task
const getRoleStatusInTask = (task: Task, userId: string): string => {
  if (task.AssigneeID === userId) return task.assigneeStatus || RoleStatus.NOT_STARTED;
  if (task.CheckerID === userId) return task.checkerStatus || RoleStatus.NOT_STARTED;
  if (task.ChiefDesignerID === userId) return task.chiefDesignerStatus || RoleStatus.NOT_STARTED;
  if (task.ApproverID === userId) return task.approverStatus || RoleStatus.NOT_STARTED;
  return '-';
};

// Helper function to get workload for a user's role in a task
const getRoleWorkloadInTask = (task: Task, userId: string): number | undefined => {
  if (task.AssigneeID === userId) return task.Workload;
  if (task.CheckerID === userId) return task.CheckerWorkload;
  if (task.ChiefDesignerID === userId) return task.ChiefDesignerWorkload;
  if (task.ApproverID === userId) return task.ApproverWorkload;
  return undefined;
};

// Helper function to get status badge color
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case RoleStatus.NOT_STARTED:
    case '未开始':
      return 'bg-gray-100 text-gray-700';
    case RoleStatus.IN_PROGRESS:
    case '进行中':
      return 'bg-blue-100 text-blue-700';
    case RoleStatus.REVISING:
    case '修改中':
      return 'bg-yellow-100 text-yellow-700';
    case RoleStatus.REJECTED:
    case '驳回中':
      return 'bg-red-100 text-red-700';
    case RoleStatus.COMPLETED:
    case '已完成':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Role status dropdown component
const RoleStatusDropdown: React.FC<{
  currentStatus: string;
  onChange: (status: RoleStatus) => void;
}> = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const statusOptions = [
    RoleStatus.NOT_STARTED,
    RoleStatus.IN_PROGRESS,
    RoleStatus.REVISING,
    RoleStatus.REJECTED,
    RoleStatus.COMPLETED
  ];

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${getStatusBadgeClass(currentStatus)} cursor-pointer hover:opacity-80 whitespace-nowrap`}
        >
          {currentStatus}
        </button>
        {isOpen && (
          <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] w-24"
            style={{
              top: menuPosition.top,
              left: menuPosition.left
            }}
          >
            {statusOptions.map((status, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(status);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  status === currentStatus ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Task panel component
const TaskPanel: React.FC<{
  title: string;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (taskId: string, role: 'assignee' | 'checker' | 'chiefDesigner' | 'approver', status: RoleStatus) => void;
  onTaskDoubleClick: (task: Task) => void;
  taskClasses: TaskClass[];
  viewingUserName: string;
  viewingUserId: string;
  currentUserRole: SystemRole;
}> = ({
  title,
  tasks,
  isExpanded,
  onToggle,
  onStatusChange,
  onTaskDoubleClick,
  taskClasses,
  viewingUserName,
  viewingUserId,
  currentUserRole
}) => {
  const getCategoryName = (taskClassId: string) => {
    const tc = taskClasses.find(t => t.id === taskClassId);
    return tc?.name || taskClassId;
  };

  // Check if workload should be visible (only for LEADER or ADMIN)
  const canViewWorkload = currentUserRole === SystemRole.LEADER || currentUserRole === SystemRole.ADMIN;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
            {tasks.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {isExpanded && (
        <div className="overflow-visible">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-gray-500">暂无任务</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-1/4">任务名称</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">类别</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-16">我的角色</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-20">角色状态</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-24">开始时间</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-24">截止时间</th>
                  {canViewWorkload && (
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 whitespace-nowrap w-16">工作量</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => {
                  // 已完成的任务不显示长任务标记
                  const isLongRunning = title !== '已完成' && dataService.isTaskLongRunning(task);
                  const userRole = getUserRoleInTask(task, viewingUserId);
                  const userRoleType = getUserRoleTypeInTask(task, viewingUserId);
                  const roleStatus = getRoleStatusInTask(task, viewingUserId);
                  const roleWorkload = getRoleWorkloadInTask(task, viewingUserId);
                  return (
                    <tr
                      key={task.TaskID}
                      className={`${isLongRunning ? 'bg-yellow-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
                      onDoubleClick={() => onTaskDoubleClick(task)}
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {task.isForceAssessment && task.TaskClassID !== 'TC009' && (
                            <span className="inline-block w-1 h-4 bg-red-500 mr-1 rounded flex-shrink-0" />
                          )}
                          {isLongRunning && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${task.isForceAssessment && task.TaskClassID !== 'TC009' ? 'font-bold text-gray-900' : 'text-gray-900'}`}>{task.TaskName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{getCategoryName(task.TaskClassID)}</td>
                      <td className="px-4 py-2">
                        <span className="text-sm font-medium text-gray-700">{userRole}</span>
                      </td>
                      <td className="px-4 py-2">
                        {userRoleType ? (
                          <RoleStatusDropdown
                            currentStatus={roleStatus}
                            onChange={(status) => onStatusChange(task.TaskID, userRoleType, status)}
                          />
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(roleStatus)}`}>
                            {roleStatus}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">{formatDate(task.StartDate)}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{formatDate(task.DueDate)}</td>
                      {canViewWorkload && (
                        <td className="px-4 py-2 text-sm text-gray-600">{roleWorkload ?? '-'}</td>
                      )}
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

// User switcher component
const UserSwitcher: React.FC<{
  currentUser: UserType;
  selectedUserId: string;
  teamMembers: UserType[];
  onSelect: (userId: string) => void;
}> = ({ currentUser, selectedUserId, teamMembers, onSelect }) => {
  const selectedUser = teamMembers.find(u => u.UserID === selectedUserId) || currentUser;

  return (
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-500" />
      <select
        value={selectedUserId}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={currentUser.UserID}>{currentUser.Name} (本人)</option>
        {teamMembers.map((user) => (
          <option key={user.UserID} value={user.UserID}>
            {user.Name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Main PersonalWorkspaceView component
const PersonalWorkspaceView: React.FC<{
  currentUser: UserType;
  onRefresh: () => void;
  onChangeView?: (view: string, taskId?: string) => void;
}> = ({ currentUser, onRefresh, onChangeView }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [period, setPeriod] = useState<Period>('quarter'); // 默认近三个月
  const [selectedUserId, setSelectedUserId] = useState(currentUser.UserID);
  const [expandedPanels, setExpandedPanels] = useState({
    inProgress: true,
    pending: true,
    completed: true
  });
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新

  // Get user being viewed
  const viewingUserId = currentUser.SystemRole === '组员' ? currentUser.UserID : selectedUserId;
  const viewingUser = useMemo(() => {
    if (viewingUserId === currentUser.UserID) return currentUser;
    const teamMembers = dataService.getTeamMembers(currentUser.UserID);
    return teamMembers.find(u => u.UserID === viewingUserId) || currentUser;
  }, [viewingUserId, currentUser]);

  // Get team members for switcher
  const teamMembers = useMemo(() => {
    return dataService.getTeamMembers(currentUser.UserID);
  }, [currentUser.UserID]);

  // Get all tasks for statistics
  const allTasks = useMemo(() => {
    return dataService.getPersonalTasks(viewingUserId);
  }, [viewingUserId, refreshKey]);

  // Filter tasks by period based on StartDate (only for completed tasks)
  const periodFilteredTasks = useMemo(() => {
    return dataService.filterTasksByStartDate(allTasks, period);
  }, [allTasks, period]);

  // Separate tasks by user's role status (not task status)
  // 进行中和未开始的任务显示所有任务，已完成的任务根据时间段筛选
  const separatedTasks = useMemo(() => {
    const allSeparated = dataService.separateTasksByRoleStatus(allTasks, viewingUserId);
    const completedSeparated = dataService.separateTasksByRoleStatus(periodFilteredTasks, viewingUserId);
    return {
      inProgress: allSeparated.inProgress,      // 进行中：显示所有
      pending: allSeparated.pending,            // 未开始：显示所有
      completed: completedSeparated.completed   // 已完成：根据时间段筛选
    };
  }, [allTasks, periodFilteredTasks, viewingUserId]);

  // Get travel tasks filtered by StartDate (shown separately)
  const travelTasks = useMemo(() => {
    const allTravelTasks = dataService.getTravelTasks(viewingUserId);
    return dataService.filterTasksByStartDate(allTravelTasks, period);
  }, [viewingUserId, period, refreshKey]);

  // Get meeting tasks filtered by StartDate (shown separately)
  const meetingTasks = useMemo(() => {
    const allMeetingTasks = dataService.getMeetingTasks(viewingUserId);
    return dataService.filterTasksByStartDate(allMeetingTasks, period);
  }, [viewingUserId, period, refreshKey]);

  // Calculate stats based on role status
  const stats = useMemo(() => {
    const baseStats = dataService.calculatePersonalStats(allTasks, period, viewingUserId);
    // Calculate trend - daily for week/month, monthly for others
    let monthlyTrend;
    if (period === 'week' || period === 'month') {
      // 按天统计（本周显示7天，本月显示约30天）
      const days = period === 'week' ? 7 : 30;
      monthlyTrend = dataService.calculateDailyTrend(allTasks, days, viewingUserId);
    } else {
      // 按月统计，根据时间段确定月份数
      let months: number;
      switch (period) {
        case 'quarter': months = 3; break;       // 近3个月
        case 'halfYear': months = 6; break;      // 近半年
        case 'year': months = 6; break;          // 本年度
        case 'yearAndHalf': months = 12; break;  // 近一年
        default: months = 6;
      }
      monthlyTrend = dataService.calculateMonthlyTrend(allTasks, months, viewingUserId);
    }
    return { ...baseStats, monthlyTrend };
  }, [allTasks, period, viewingUserId]);

  const taskClasses = useMemo(() => {
    return dataService.getTaskClasses();
  }, []);

  // Toggle panel expansion
  const togglePanel = (panel: 'inProgress' | 'pending' | 'completed') => {
    setExpandedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  // Handle role status change
  const handleStatusChange = (taskId: string, role: 'assignee' | 'checker' | 'chiefDesigner' | 'approver', status: RoleStatus) => {
    dataService.updateTaskRoleStatus(taskId, role, status);
    setRefreshKey(prev => prev + 1); // 强制刷新数据
    onRefresh();
  };

  // Handle task double click - navigate to task view
  const handleTaskDoubleClick = (task: Task) => {
    if (onChangeView) {
      onChangeView('tasks', task.TaskName);
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const csvContent = dataService.generateStatsCSV(stats, separatedTasks, viewingUser.Name);
    const fileName = `个人工作台_${viewingUser.Name}_${new Date().toISOString().split('T')[0]}.csv`;
    dataService.downloadStatsCSV(csvContent, fileName);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4 print:hidden">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">个人工作台</h1>
          {currentUser.SystemRole !== '组员' && (
            <UserSwitcher
              currentUser={currentUser}
              selectedUserId={selectedUserId}
              teamMembers={teamMembers}
              onSelect={setSelectedUserId}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <button
            onClick={handleExportCSV}
            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            title="导出CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="打印报表"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Task Panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* In Progress Panel - Top */}
          <TaskPanel
            title="进行中"
            tasks={separatedTasks.inProgress}
            isExpanded={expandedPanels.inProgress}
            onToggle={() => togglePanel('inProgress')}
            onStatusChange={handleStatusChange}
            onTaskDoubleClick={handleTaskDoubleClick}
            taskClasses={taskClasses}
            viewingUserName={viewingUser.Name}
            viewingUserId={viewingUserId}
            currentUserRole={currentUser.SystemRole}
          />

          {/* Pending Panel - Middle */}
          <TaskPanel
            title="未开始"
            tasks={separatedTasks.pending}
            isExpanded={expandedPanels.pending}
            onToggle={() => togglePanel('pending')}
            onStatusChange={handleStatusChange}
            onTaskDoubleClick={handleTaskDoubleClick}
            taskClasses={taskClasses}
            viewingUserName={viewingUser.Name}
            viewingUserId={viewingUserId}
            currentUserRole={currentUser.SystemRole}
          />

          {/* Completed Panel - Bottom */}
          <TaskPanel
            title="已完成"
            tasks={separatedTasks.completed}
            isExpanded={expandedPanels.completed}
            onToggle={() => togglePanel('completed')}
            onStatusChange={handleStatusChange}
            onTaskDoubleClick={handleTaskDoubleClick}
            taskClasses={taskClasses}
            viewingUserName={viewingUser.Name}
            viewingUserId={viewingUserId}
            currentUserRole={currentUser.SystemRole}
          />

          {/* Travel Task Panel */}
          <TravelTaskPanel
            tasks={travelTasks}
            onTaskDoubleClick={handleTaskDoubleClick}
            taskClasses={taskClasses}
          />

          {/* Meeting Task Panel */}
          <MeetingTaskPanel
            tasks={meetingTasks}
            onTaskDoubleClick={handleTaskDoubleClick}
            taskClasses={taskClasses}
          />
        </div>

        {/* Right: Statistics Panel */}
        <div className="lg:col-span-1 print:hidden">
          {viewMode === 'chart' ? (
            <ChartView
              stats={stats}
              taskClasses={taskClasses}
            />
          ) : (
            <ListView stats={stats} separatedTasks={separatedTasks} />
          )}
        </div>
      </div>

      {/* Print-only summary */}
      <div className="hidden print:block">
        <h2 className="text-xl font-bold mb-4">任务统计概览</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="border p-3 text-center">
            <div className="text-2xl font-bold">{stats.inProgressCount}</div>
            <div>进行中</div>
          </div>
          <div className="border p-3 text-center">
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <div>未开始</div>
          </div>
          <div className="border p-3 text-center">
            <div className="text-2xl font-bold">{stats.completedCount}</div>
            <div>已完成</div>
          </div>
          <div className="border p-3 text-center">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <div>完成率</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalWorkspaceView;
