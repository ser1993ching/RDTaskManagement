// 任务来源平台
export type TaskSource = 'PLM' | 'TS' | 'PORTAL';

// 东方任务类型
export type DongfangTaskType =
  | 'WTDocument'      // 文档发布
  | 'TechnicalNoticeDoc'  // 技术通知单
  | 'EPart'           // 部件发布
  | 'Unknown';

// 任务环节 (与后端 TaskStatus 枚举保持一致)
export type TaskStage =
  | 'NotStarted'   // 未开始
  | 'Drafting'     // 编制中
  | 'Revising'     // 修改中
  | 'Reviewing'    // 校核中
  | 'Approving'    // 审查中
  | 'Completed';   // 已完成

// 中文显示名称映射
export const TaskStageDisplayName: Record<TaskStage, string> = {
  'NotStarted': '未开始',
  'Drafting': '编制中',
  'Revising': '修改中',
  'Reviewing': '校核中',
  'Approving': '审查中',
  'Completed': '已完成'
};

// 处理状态
export type ProcessStatus = '提交' | '同意' | '驳回' | '转交';

// 决策选项
export type Decision = '通过' | '驳回' | '快速驳回' | '未选择';

// 提取的任务信息
export interface ExtractedTaskInfo {
  // 基础信息
  taskId: string;           // 任务ID (从URL获取)
  taskName: string;         // 任务名称
  taskType: DongfangTaskType; // 东方任务类型
  sourceUrl: string;        // 来源页面URL
  source: TaskSource;       // 来源平台

  // 流程信息
  flowTemplate?: string;    // 流程模板
  currentStage: TaskStage;  // 当前环节

  // 角色信息
  roles: ProcessRole[];     // 流程角色列表
  currentHandler?: string;  // 当前处理人

  // 处理信息
  decision?: Decision;     // 用户选择的决策
  remark?: string;          // 备注/意见
  history: ProcessRecord[]; // 处理历史

  // 元数据
  extractedAt: string;      // 提取时间 ISO格式
}

// 流程角色
export interface ProcessRole {
  stage: string;           // 环节名称
  roleName: string;       // 角色名称 (编制者/校核者/审查者/审定者)
  userName?: string;       // 用户姓名
  userId?: string;         // 工号
  status?: string;         // 状态 (已完成/进行中/待处理)
}

// 处理记录
export interface ProcessRecord {
  stage: string;           // 环节
  status: string;         // 状态
  time: string;           // 处理时间
  userName: string;       // 处理人
  userId: string;         // 工号
  comment?: string;       // 备注/意见
}

// 插件配置
export interface PluginConfig {
  taskSystemUrl: string;    // 任务管理系统地址
  autoSync: boolean;       // 是否自动同步
  showNotifications: boolean; // 是否显示通知
  checkInterval: number;    // 检查间隔(毫秒)
  enabledSites: {
    koa: boolean;
    plm: boolean;
    ts: boolean;
  };
}

// 消息类型
export type MessageType =
  | 'EXTRACT_TASK_INFO'
  | 'TASK_INFO_EXTRACTED'
  | 'OPEN_CONFIRM_DIALOG'
  | 'CONFIRM_COMPLETE'
  | 'CANCEL_COMPLETE'
  | 'SYNC_TO_SYSTEM'
  | 'SYNC_RESULT'
  | 'GET_CONFIG'
  | 'SET_CONFIG';

export interface Message {
  type: MessageType;
  payload?: any;
  sourceTabId?: number;
}

// 角色枚举 (与后端一致)
export type TaskRole = 'assignee' | 'checker' | 'chiefDesigner' | 'approver';

// 角色状态枚举 (与后端 RoleStatus 一致)
export type RoleStatus = 'NotStarted' | 'InProgress' | 'Revising' | 'Rejected' | 'Completed';

// 角色映射：PLM/TS环节 -> 后端角色
export const STAGE_TO_ROLE: Record<TaskStage, TaskRole> = {
  'Drafting': 'assignee',
  'Revising': 'assignee',
  'Reviewing': 'checker',
  'Approving': 'approver',
  'NotStarted': 'assignee',
  'Completed': 'assignee'
};
