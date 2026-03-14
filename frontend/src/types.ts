/**
 * R&D任务管理系统 - 类型定义文件 (types.ts)
 *
 * 概述:
 * - 定义了前端所有核心数据类型的TypeScript接口
 * - 所有类型与后端API返回的JSON格式保持一致（camelCase命名）
 * - 枚举类型映射到后端返回的中文字符串值
 *
 * 主要类型:
 * - SystemRole: 系统角色 (管理员、班组长、组员)
 * - OfficeLocation: 办公地点 (成都、德阳)
 * - PersonnelStatus: 人员状态 (在岗、借调、外借、实习、离岗)
 * - ProjectCategory: 项目类别 (市场配合、常规项目、核电项目等)
 * - TaskStatus: 任务状态 (未开始、编制中、修改中、校核中、审查中、已完成)
 * - RoleStatus: 角色状态 (负责人/校核人/主任设计/审查人共用)
 *
 * 数据结构:
 * - User: 用户信息
 * - Project: 项目信息
 * - Task: 任务信息（含多种角色分配）
 * - TaskPoolItem: 任务库/计划任务项
 * - PersonalStats: 个人统计数据
 */

// Enums

/**
 * 系统角色枚举
 * 后端返回中文值，前端用于权限判断和界面显示
 */
export enum SystemRole {
  MEMBER = '组员',
  LEADER = '班组长',
  ADMIN = '管理员'
}

/**
 * 办公地点枚举
 */
export enum OfficeLocation {
  CHENGDU = '成都',
  DEYANG = '德阳'
}

/**
 * 人员状态枚举
 */
export enum PersonnelStatus {
  ACTIVE = '在岗',
  BORROWED_IN = '借调',
  BORROWED_OUT = '外借',
  INTERN = '实习',
  LEAVE = '离岗'
}

/**
 * 项目类别枚举
 * 用于区分不同类型的研发项目
 */
export enum ProjectCategory {
  MARKET = '市场配合项目',    // 市场部门的配合工作
  EXECUTION = '常规项目',     // 常规设计执行项目
  NUCLEAR = '核电项目',       // 核电相关项目
  RESEARCH = '科研项目',      // 科研课题项目
  RENOVATION = '改造项目',    // 设备改造项目
  OTHER = '其他项目'          // 其他类型项目
}

/**
 * 任务状态枚举
 * 描述任务整体的执行进度
 */
export enum TaskStatus {
  NOT_STARTED = '未开始',     // 任务刚创建，尚未开始
  DRAFTING = '编制中',        // 正在编制/设计中
  REVISING = '修改中',        // 根据审查意见修改中
  REVIEWING = '校核中',       // 等待校核人审核
  APPROVING = '审查中',       // 等待审查人最终审批
  COMPLETED = '已完成'        // 任务全部完成
}

/**
 * 角色状态枚举
 * 负责人、校核人、主任设计、审查人共用此状态枚举
 * 用于跟踪每个角色在任务中的工作进度
 */
export enum RoleStatus {
  NOT_STARTED = '未开始',     // 该角色工作尚未开始
  IN_PROGRESS = '进行中',     // 该角色工作正在进行
  REVISING = '修改中',        // 该角色工作需要修改
  REJECTED = '已驳回',        // 该角色工作被驳回
  COMPLETED = '已完成'        // 该角色工作已完成
}

// Interfaces

/**
 * 任务分类详情接口
 * 描述任务分类的详细信息，包含可选的标签列表
 * 标签(Labels)用于为差旅任务子分类提供细粒度标签
 * 例如：市场配合出差 -> 客户拜访、项目调研、技术支持
 */
export interface TaskCategoryDetail {
  name: string;           // 分类名称
  labels?: string[];      // 标签列表（用于差旅任务子分类的细粒度标签）
}

/**
 * 任务分类接口
 * 描述任务的顶层分类（如市场配合、常规项目等）
 */
export interface TaskClass {
  id: string;           // 分类ID，如 TC001, TC002 等
  name: string;         // 分类名称
  code: string;         // 分类代码（小写形式）
  description?: string; // 分类描述
  notice?: string;      // 自定义提示文字，显示在任务管理界面该分类标题下
  isDeleted?: boolean;  // 软删除标记
  createdAt?: string;   // 创建时间
  updatedAt?: string;   // 更新时间
}

/**
 * 用户接口
 * 描述系统中的用户/人员信息
 */
export interface User {
  userId: string;              // 工号，唯一标识（主键）
  name: string;                // 姓名
  systemRole: string;          // 系统角色（管理员/班组长/组员）
  officeLocation: OfficeLocation; // 办公地点
  title?: string;              // 职称/职务
  joinDate?: string;           // 参加工作时间
  status: PersonnelStatus;     // 在岗状态
  education?: string;          // 学历
  school?: string;             // 毕业学校
  password?: string;           // 密码（加密存储，实际应用中不应在客户端访问）
  remark?: string;             // 备注
  isDeleted?: boolean;         // 软删除标记
}

/**
 * 项目接口
 * 描述研发项目的基本信息
 */
export interface Project {
  id: string;                     // 项目ID（UUID）
  name: string;                   // 项目名称
  category: ProjectCategory;      // 项目类别
  workNo?: string;                // 工作号
  capacity?: string;              // 容量等级（如600MW、1000MW）
  model?: string;                 // 机型
  isWon?: boolean;                // 是否中标（市场项目）
  isForeign?: boolean;            // 是否外贸（市场项目）
  startDate?: string;             // 开始日期
  endDate?: string;               // 截止日期/首台投运日期
  remark?: string;                // 备注
  isCommissioned?: boolean;       // 是否已投运（常规项目）
  isCompleted?: boolean;          // 是否已完成（科研/改造项目）
  isKeyProject?: boolean;         // 是否重点项目
  isDeleted?: boolean;            // 软删除标记
}

/**
 * 任务接口
 * 描述任务的核心数据结构
 * 包含多种角色分配（负责人、校核人、主任设计、审查人）
 */
export interface Task {
  taskId: string;                        // 任务ID（UUID）
  taskName: string;                      // 任务名称
  taskClassId: string;                   // 关联的任务分类ID（如TC001）
  category: string;                      // 二级分类（如设计工作、计算工作等）
  projectId?: string;                    // 关联的项目ID
  assigneeId?: string;                   // 负责人ID
  assigneeName?: string;                 // 负责人姓名（非系统用户时使用）
  startDate?: string;                    // 开始日期
  dueDate?: string;                      // 截止日期
  completedDate?: string;                // 完成日期
  status: string;                        // 任务整体状态
  workload?: number;                     // 预估工作量（小时）
  difficulty?: number;                   // 难度系数（0.5 - 3.0）
  remark?: string;                       // 备注
  createdDate: string;                   // 创建日期
  createdBy: string;                     // 创建人ID
  travelLocation?: string;               // 差旅地点（差旅任务专用）
  travelDuration?: number;               // 差旅时长天数（差旅任务专用）
  meetingDuration?: number;              // 会议时长小时（会议任务专用）
  relatedProject?: string;               // 关联项目名称（市场任务专用）
  isIndependentBusinessUnit?: boolean;   // 是否支持独立经营体（市场任务专用）
  travelLabel?: string;                  // 差旅标签（差旅任务专用）

  // 校核人（Checker）- 负责审核任务工作质量
  checkerId?: string;
  checkerName?: string;
  checkerWorkload?: number;
  checkerStatus?: RoleStatus;

  // 主任设计（ChiefDesigner）- 技术负责人
  chiefDesignerId?: string;
  chiefDesignerName?: string;
  chiefDesignerWorkload?: number;
  chiefDesignerStatus?: RoleStatus;

  // 审查人（Approver）- 最终审批人
  approverId?: string;
  approverName?: string;
  approverWorkload?: number;
  approverStatus?: RoleStatus;

  // 负责人状态
  assigneeStatus?: RoleStatus;

  isForceAssessment?: boolean;           // 是否强制考核
  isDeleted?: boolean;                   // 软删除标记

  // 参会人员（会议培训任务专用）
  participants?: string[];               // 参会人员ID列表
  participantNames?: string[];           // 参会人员姓名列表

  // 任务库标记
  isInPool?: boolean;                    // 是否在任务库中（计划任务）

  // 东方任务类型
  dongfangTaskType?: string;            // 东方任务类型
}

/**
 * 任务库/任务计划项接口
 * 描述尚未分配给具体人员的计划任务
 * 班组长可以从任务库创建任务并分配给团队成员
 */
export interface TaskPoolItem {
  id: string;                    // 任务库项ID
  taskName: string;              // 任务名称
  taskClassId: string;           // 任务类别ID
  category: string;              // 二级分类
  projectId?: string;            // 关联项目ID
  projectName?: string;          // 关联项目名称（冗余存储，便于显示）
  personInChargeId?: string;     // 计划负责人ID
  personInChargeName?: string;   // 计划负责人姓名
  checkerId?: string;            // 计划校核人ID
  checkerName?: string;          // 计划校核人姓名
  chiefDesignerId?: string;      // 计划主任设计ID
  chiefDesignerName?: string;    // 计划主任设计姓名
  approverId?: string;           // 计划审查人ID
  approverName?: string;         // 计划审查人姓名
  startDate?: string;            // 计划开始时间
  dueDate?: string;              // 计划截止时间
  createdBy: string;             // 创建人ID
  createdByName?: string;        // 创建人姓名
  createdDate: string;           // 创建日期
  isForceAssessment?: boolean;   // 是否强制考核
  remark?: string;               // 备注
  isDeleted?: boolean;           // 软删除标记
  dongfangTaskType?: string;      // 东方任务类型
}

/**
 * 统计周期类型
 * 用于个人工作台统计数据的时间范围筛选
 */
export type Period = 'week' | 'month' | 'quarter' | 'halfYear' | 'year' | 'yearAndHalf';

/**
 * 个人工作台统计数据接口
 */
export interface PersonalStats {
  // 基于周期的任务数量统计
  inProgressCount: number;      // 进行中任务数
  pendingCount: number;         // 待开始任务数
  completedCount: number;       // 已完成任务数
  totalCount: number;           // 总任务数
  completionRate: number;       // 完成率（百分比）

  // 任务类别分布（排除会议和差旅任务）
  categoryDistribution: { name: string; count: number; percentage: number }[];

  // 差旅统计（TC009类别）
  travelStats: {
    totalDays: number;          // 统计周期内总差旅天数
    workHoursInPeriod: number;  // 周期内工作小时数
    percentage: number;         // 差旅时间占比
  };

  // 会议统计（TC007类别）
  meetingStats: {
    totalHours: number;         // 统计周期内总会议时长
    workHoursInPeriod: number;  // 周期内工作小时数
    percentage: number;         // 会议时间占比
  };

  // 月度任务趋势数据
  monthlyTrend: { month: string; assigned: number; completed: number }[];
}

/**
 * 按状态分离的任务数据接口
 * 用于个人工作台分组显示不同状态的任务
 */
export interface SeparatedTasks {
  inProgress: Task[];   // 进行中任务
  pending: Task[];      // 待开始任务
  completed: Task[];    // 已完成任务
}

/**
 * 工作日计算结果接口
 */
export interface WorkDayInfo {
  workDays: number;   // 工作日天数
  workHours: number;  // 工作小时数（通常按8小时/天计算）
}
