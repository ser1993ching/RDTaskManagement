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
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interfaces
export interface User {
  UserID: string; // 工号 (PK)
  Name: string;
  SystemRole: SystemRole;
  OfficeLocation: OfficeLocation;
  Title?: string;
  JoinDate?: string; // 参加工作时间
  Status: PersonnelStatus;
  Education?: string;
  School?: string;
  Password?: string; // Hashed in real app
  Remark?: string;
  is_deleted?: boolean;
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
  is_deleted?: boolean;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  TaskClassID: string; // 关联任务类ID
  Category: string; // 二级分类
  ProjectID?: string;
  AssigneeID?: string; // 负责人
  StartDate?: string;
  DueDate?: string;
  CompletedDate?: string; // 完成时间
  Status: TaskStatus;
  Workload?: number; // 预估工作量（小时）
  Difficulty?: number; // 0.5 - 3.0
  Remark?: string;
  CreatedDate: string;
  CreatedBy: string;
  TravelLocation?: string; // For Travel tasks
  TravelDuration?: number; // For Travel tasks
  MeetingDuration?: number; // For Meeting tasks
  CapacityLevel?: string; // 容量等级 (For Market tasks)
  TravelLabel?: string; // For Travel tasks (差旅标签)
  // 校核人（Checker）
  CheckerID?: string;
  CheckerName?: string;
  CheckerWorkload?: number;
  checkerStatus?: RoleStatus;
  // 主任设计（ChiefDesigner）
  ChiefDesignerID?: string;
  ChiefDesignerName?: string;
  ChiefDesignerWorkload?: number;
  chiefDesignerStatus?: RoleStatus;
  // 审查人（Approver）
  ApproverID?: string;
  ApproverName?: string;
  ApproverWorkload?: number;
  approverStatus?: RoleStatus;
  // 负责人（非系统用户时使用）
  AssigneeName?: string;
  // 角色状态
  assigneeStatus?: RoleStatus;
  isForceAssessment?: boolean; // 是否强制考核
  is_deleted?: boolean;
  // For Meeting & Training tasks
  Participants?: string[]; // 参会人员ID列表
  ParticipantNames?: string[]; // 参会人员姓名列表
  // For Task Pool
  is_in_pool?: boolean; // 是否在任务库中（计划任务）
  // 兼容旧字段名（已废弃，保留用于向后兼容）
  /** @deprecated 已废弃，使用 CheckerID */
  ReviewerID?: string;
  /** @deprecated 已废弃，使用 ApproverID */
  ReviewerID2?: string;
  /** @deprecated 已废弃，使用 CheckerName */
  ReviewerName?: string;
  /** @deprecated 已废弃，使用 ApproverName */
  Reviewer2Name?: string;
  /** @deprecated 已废弃，使用 CheckerWorkload */
  ReviewerWorkload?: number;
  /** @deprecated 已废弃，使用 ApproverWorkload */
  Reviewer2Workload?: number;
}

// 任务库/任务计划项
export interface TaskPoolItem {
  id: string;
  TaskName: string; // 任务名称
  TaskClassID: string; // 任务类别ID
  Category: string; // 二级分类
  ProjectID?: string; // 关联项目ID
  ProjectName?: string; // 关联项目名称（冗余存储，便于显示）
  PersonInChargeID?: string; // 负责人ID（计划中的负责人）
  PersonInChargeName?: string; // 负责人姓名
  CheckerID?: string; // 校核人ID
  CheckerName?: string; // 校核人姓名
  ChiefDesignerID?: string; // 主任设计ID
  ChiefDesignerName?: string; // 主任设计姓名
  ApproverID?: string; // 审查人ID
  ApproverName?: string; // 审查人姓名
  StartDate?: string; // 开始时间
  DueDate?: string; // 截止时间
  CreatedBy: string; // 创建人
  CreatedByName?: string; // 创建人姓名
  CreatedDate: string; // 创建日期
  isForceAssessment?: boolean; // 强制考核
  Remark?: string; // 备注
  is_deleted?: boolean; // 软删除
  // 兼容旧字段名（已废弃，保留用于向后兼容）
  /** @deprecated 已废弃，使用 CheckerID */
  ReviewerID?: string;
  /** @deprecated 已废弃，使用 ApproverID */
  ReviewerID2?: string;
  /** @deprecated 已废弃，使用 CheckerName */
  ReviewerName?: string;
  /** @deprecated 已废弃，使用 ApproverName */
  Reviewer2Name?: string;
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
