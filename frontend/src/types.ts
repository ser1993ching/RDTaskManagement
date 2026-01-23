// Enums
export enum SystemRole {
  MEMBER = '组员',
  LEADER = '班组长',
  ADMIN = '管理员'
}

export enum OfficeLocation {
  CHENGDU = '成都',
  DEYANG = '德阳'
}

export enum PersonnelStatus {
  ACTIVE = '在岗',
  BORROWED_IN = '借调',
  BORROWED_OUT = '外借',
  INTERN = '实习',
  LEAVE = '离岗'
}

export enum ProjectCategory {
  MARKET = '市场配合项目',
  EXECUTION = '常规项目',
  NUCLEAR = '核电项目',
  RESEARCH = '科研项目',
  RENOVATION = '改造项目',
  OTHER = '其他项目'
}

export enum TaskStatus {
  NOT_STARTED = '未开始',
  DRAFTING = '编制中',
  REVISING = '修改中',
  REVIEWING = '校核中',
  REVIEWING2 = '审查中',
  COMPLETED = '已完成'
}

// 角色状态枚举（负责人、校核人、主任设计、审查人共用）
export enum RoleStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  REVISING = '修改中',
  REJECTED = '驳回中',
  COMPLETED = '已完成'
}

export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  notice?: string; // 自定义提示文字，显示在任务管理界面该分类标题下
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaces
export interface User {
  userId: string; // 工号 (PK)
  name: string;
  systemRole: SystemRole;
  officeLocation: OfficeLocation;
  title?: string;
  joinDate?: string; // 参加工作时间
  status: PersonnelStatus;
  education?: string;
  school?: string;
  password?: string; // Hashed in real app
  remark?: string;
  isDeleted?: boolean;
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  workNo?: string; // 工作号
  capacity?: string; // 容量等级
  model?: string; // 机型
  isWon?: boolean; // 是否中标 (Market)
  isForeign?: boolean; // 是否外贸 (Market)
  startDate?: string;
  endDate?: string; // 截止/首台投运
  remark?: string;
  isCommissioned?: boolean; // 是否已投运 (Execution)
  isCompleted?: boolean; // 是否已完成 (Research/Renovation/Other)
  isKeyProject?: boolean; // 是否重点项目
  isDeleted?: boolean;
}

export interface Task {
  taskId: string;
  taskName: string;
  taskClassId: string; // 关联任务类ID
  category: string; // 二级分类
  projectId?: string;
  assigneeId?: string; // 负责人
  assigneeName?: string; // 负责人（非系统用户时使用）
  startDate?: string;
  dueDate?: string;
  completedDate?: string; // 完成时间
  status: TaskStatus;
  workload?: number; // 预估工作量（小时）
  difficulty?: number; // 0.5 - 3.0
  remark?: string;
  createdDate: string;
  createdBy: string;
  travelLocation?: string; // For Travel tasks
  travelDuration?: number; // For Travel tasks
  meetingDuration?: number; // For Meeting tasks
  capacityLevel?: string; // 容量等级 (For Market tasks)
  travelLabel?: string; // For Travel tasks (差旅标签)
  // 校核人（Checker）
  checkerId?: string;
  checkerName?: string;
  checkerWorkload?: number;
  checkerStatus?: RoleStatus;
  // 主任设计（ChiefDesigner）
  chiefDesignerId?: string;
  chiefDesignerName?: string;
  chiefDesignerWorkload?: number;
  chiefDesignerStatus?: RoleStatus;
  // 审查人（Approver）
  approverId?: string;
  approverName?: string;
  approverWorkload?: number;
  approverStatus?: RoleStatus;
  // 角色状态
  assigneeStatus?: RoleStatus;
  isForceAssessment?: boolean; // 是否强制考核
  isDeleted?: boolean;
  // For Meeting & Training tasks
  participants?: string[]; // 参会人员ID列表
  participantNames?: string[]; // 参会人员姓名列表
  // For Task Pool
  isInPool?: boolean; // 是否在任务库中（计划任务）
}

// 任务库/任务计划项
export interface TaskPoolItem {
  id: string;
  taskName: string; // 任务名称
  taskClassId: string; // 任务类别ID
  category: string; // 二级分类
  projectId?: string; // 关联项目ID
  projectName?: string; // 关联项目名称（冗余存储，便于显示）
  personInChargeId?: string; // 负责人ID（计划中的负责人）
  personInChargeName?: string; // 负责人姓名
  checkerId?: string; // 校核人ID
  checkerName?: string; // 校核人姓名
  chiefDesignerId?: string; // 主任设计ID
  chiefDesignerName?: string; // 主任设计姓名
  approverId?: string; // 审查人ID
  approverName?: string; // 审查人姓名
  startDate?: string; // 开始时间
  dueDate?: string; // 截止时间
  createdBy: string; // 创建人
  createdByName?: string; // 创建人姓名
  createdDate: string; // 创建日期
  isForceAssessment?: boolean; // 强制考核
  remark?: string; // 备注
  isDeleted?: boolean; // 软删除
}

// Period type for statistics
export type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'yearAndHalf';

// Personal workspace statistics interface
export interface PersonalStats {
  // Period-based counts
  inProgressCount: number;
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  completionRate: number;

  // Category distribution (excluding TC009/TC007)
  categoryDistribution: { name: string; count: number; percentage: number }[];

  // Travel statistics (TC009)
  travelStats: {
    totalDays: number;
    workHoursInPeriod: number;
    percentage: number;
  };

  // Meeting statistics (TC007)
  meetingStats: {
    totalHours: number;
    workHoursInPeriod: number;
    percentage: number;
  };

  // Monthly task trend data
  monthlyTrend: { month: string; assigned: number; completed: number }[];
}

// Separated tasks by status
export interface SeparatedTasks {
  inProgress: Task[];
  pending: Task[];
  completed: Task[];
}

// Work day calculation result
export interface WorkDayInfo {
  workDays: number;
  workHours: number;
}
