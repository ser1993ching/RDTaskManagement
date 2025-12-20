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
  IN_PROGRESS = '进行中',
  COMPLETED = '已完成'
}

export interface TaskClass {
  id: string;
  name: string;
  code: string;
  description?: string;
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
  BirthDate?: string;
  Title?: string;
  JoinDate?: string; // 参加工作时间
  TeamJoinDate?: string;
  Status: PersonnelStatus;
  Education?: string;
  School?: string;
  Password?: string; // Hashed in real app
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
  group?: string; // 所属集团 (Execution)
  institute?: string; // 设计院 (Execution)
  executorId?: string; // 执行人ID
  chiefDesignerId?: string; // 主任设计ID
  managerId?: string; // 负责人ID (Research)
  startDate?: string;
  endDate?: string; // 截止/首台投运
  remark?: string;
  isCommissioned?: boolean; // 是否已投运 (Execution)
  isCompleted?: boolean; // 是否已完成 (Research/Renovation/Other)
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
  Status: TaskStatus;
  Workload?: number; // 预估工作量
  ActualWorkload?: number; // 实际投入 (For stats)
  Difficulty?: number; // 0.5 - 3.0
  Remark?: string;
  CreatedDate: string;
  CreatedBy: string;
  TravelLocation?: string; // For Travel tasks
  TravelDuration?: number; // For Travel tasks
  MeetingDuration?: number; // For Meeting tasks
  CapacityLevel?: string; // 容量等级 (For Market tasks)
  ReviewerID?: string; // 校核人
  ReviewerID2?: string; // 审查人
  AssigneeName?: string; // 负责人姓名（非系统用户时使用）
  ReviewerName?: string; // 校核人姓名（非系统用户时使用）
  Reviewer2Name?: string; // 审查人姓名（非系统用户时使用）
  ReviewerWorkload?: number; // 校核人工时
  Reviewer2Workload?: number; // 审查人2工时
  isForceAssessment?: boolean; // 是否强制考核
  is_deleted?: boolean;
  // For Meeting & Training tasks
  Participants?: string[]; // 参会人员ID列表
  ParticipantNames?: string[]; // 参会人员姓名列表
}
