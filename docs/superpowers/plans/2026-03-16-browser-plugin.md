# 浏览器插件开发实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 开发Chrome/Edge浏览器插件，捕获PLM和TS任务平台的任务流程信息，实现任务的自动创建和状态同步到任务管理系统

**Architecture:** 采用Manifest V3架构，使用Content Script进行页面内容提取，Background Script作为消息中转，Popup作为用户交互界面。插件需要同时支持KOA门户、PLM和TS三个网站的注入和数据提取。

**Tech Stack:** Chrome Extension (Manifest V3), TypeScript, HTML/CSS

---

## ⚠️ 后端API要求（重要）

**现有后端API已经是完整的**，浏览器插件需要遵循现有API进行对接。禁止创建新的API端点。

### 现有API端点（必须遵循）

| 方法 | 端点 | 用途 |
|------|------|------|
| PUT | `/api/tasks/{taskId}/status` | 更新任务状态 |
| PUT/PATCH | `/api/tasks/{taskId}/role-status` | 更新角色状态 |
| POST | `/api/tasks/{taskId}/complete-all` | 完成任务所有角色 |
| POST | `/api/tasks/{taskId}/retrieve` | 回收任务到任务库 |
| GET | `/api/tasks/personal/{userId}` | 获取个人任务列表 |
| GET | `/api/tasks` | 获取任务列表 |

### 请求格式

**更新任务状态** (`PUT /api/tasks/{taskId}/status`)
```json
{
  "status": "Completed"  // NotStarted, Drafting, Revising, Reviewing, Approving, Completed
}
```

**更新角色状态** (`PUT /api/tasks/{taskId}/role-status`)
```json
{
  "role": "checker",           // assignee, checker, chiefDesigner, approver
  "status": "Completed"        // NotStarted, InProgress, Revising, Rejected, Completed
}
```

### 角色枚举

| 角色 | Role值 | 说明 |
|------|--------|------|
| 负责人 | `assignee` | 任务负责人 |
| 校核人 | `checker` | 校核人员 |
| 主任设计 | `chiefDesigner` | 主任设计师 |
| 审查人 | `approver` | 审查人员 |

### 状态枚举

**任务状态** (TaskStatus): `NotStarted`, `Drafting`, `Revising`, `Reviewing`, `Approving`, `Completed`

**角色状态** (RoleStatus): `NotStarted`, `InProgress`, `Revising`, `Rejected`, `Completed`

### 关键约束

1. **不创建新端点** - 所有操作必须使用现有API
2. **字段名称** - 使用camelCase（后端已配置JsonNamingPolicy.CamelCase）
3. **认证** - 需要在请求头中添加JWT Token
4. **错误处理** - 遵循现有API的错误响应格式

---

## 文件结构规划

```
browser-plugin/
├── manifest.json                    # 插件配置文件
├── background/
│   └── background.ts               # 后台脚本（消息中转）
├── content/
│   ├── base/
│   │   ├── content-script.ts       # 基础内容脚本
│   │   ├── page-detector.ts       # 页面类型检测器
│   │   └── message-bus.ts         # 消息总线
│   ├── plm/
│   │   ├── plm-extractor.ts       # PLM任务信息提取器
│   │   └── plm-interceptor.ts     # PLM按钮拦截器
│   ├── ts/
│   │   └── ts-extractor.ts        # TS任务信息提取器
│   └── portal/
│       └── portal-injector.ts      # KOA门户Tab注入器
├── popup/
│   ├── popup.html                  # 确认弹窗页面
│   ├── popup.ts                    # 弹窗逻辑
│   └── popup.css                   # 弹窗样式
├── shared/
│   ├── types.ts                    # 共享类型定义
│   ├── config.ts                   # 配置管理
│   └── api-client.ts               # 任务管理系统API客户端
├── icons/
│   └── icon.png                    # 插件图标
├── _locales/
│   └── zh_CN/
│       └── messages.json           # 国际化
└── utils/
    ├── dom-helper.ts               # DOM工具函数
    └── storage.ts                  # 存储工具
```

---

## Chunk 1: 插件基础架构

### Task 1.1: 创建项目结构和manifest.json

**Files:**
- Create: `browser-plugin/manifest.json`
- Create: `browser-plugin/_locales/zh_CN/messages.json`

- [ ] **Step 1: 创建manifest.json配置文件**

```json
{
  "manifest_version": 3,
  "name": "任务管理助手",
  "version": "1.0.0",
  "description": "东方电气任务管理助手 - 自动同步PLM/TS任务到任务管理系统",
  "default_locale": "zh_CN",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    },
    "default_title": "任务管理助手"
  },
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "http://dfemeip.dongfang.com/*",
    "http://plm.dongfang.com/*",
    "https://tsplm.dfem.com.cn/*",
    "http://localhost:3000/*",
    "http://localhost:5000/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "http://dfemeip.dongfang.com/*"
      ],
      "js": [
        "content/base/content-script.js",
        "content/portal/portal-injector.js"
      ],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "http://plm.dongfang.com/Windchill/*"
      ],
      "js": [
        "content/base/content-script.js",
        "content/plm/plm-extractor.js",
        "content/plm/plm-interceptor.js"
      ],
      "run_at": "document_idle"
    },
    {
      "matches": [
        "https://tsplm.dfem.com.cn/*"
      ],
      "js": [
        "content/base/content-script.js",
        "content/ts/ts-extractor.js"
      ],
      "run_at": "document_idle"
    }
  ]
}
```

- [ ] **Step 2: 创建国际化配置**

```json
{
  "extension_name": {
    "message": "任务管理助手",
    "description": "插件名称"
  },
  "extension_description": {
    "message": "东方电气任务管理助手 - 自动同步PLM/TS任务到任务管理系统",
    "description": "插件描述"
  }
}
```

- [ ] **Step 3: 创建目录结构**

```bash
mkdir -p browser-plugin/{background,content/{base,plm,ts,portal},popup,shared,icons,_locales/zh_CN,utils}
```

- [ ] **Step 4: Commit**

```bash
git add browser-plugin/
git commit -m "feat(plugin): 创建插件基础架构和manifest配置"
```

### Task 1.2: 创建共享类型定义和配置

**Files:**
- Create: `browser-plugin/shared/types.ts`
- Create: `browser-plugin/shared/config.ts`
- Create: `browser-plugin/shared/api-client.ts`

- [ ] **Step 1: 创建TypeScript类型定义**

```typescript
// 任务来源平台
export type TaskSource = 'PLM' | 'TS' | 'PORTAL';

// 东方任务类型
export type DongfangTaskType =
  | 'WTDocument'      // 文档发布
  | 'TechnicalNoticeDoc'  // 技术通知单
  | 'EPart'           // 部件发布
  | 'Unknown';

// 任务环节 (与后端 TaskStatus 枚举保持一致)
// 后端枚举: TaskStatus { NotStarted=0, Drafting=1, Revising=2, Reviewing=3, Approving=4, Completed=5 }
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
  roleName: string;        // 角色名称 (编制者/校核者/审查者/审定者)
  userName?: string;       // 用户姓名
  userId?: string;         // 工号
  status?: string;        // 状态 (已完成/进行中/待处理)
}

// 处理记录
export interface ProcessRecord {
  stage: string;           // 环节
  status: string;         // 状态
  time: string;           // 处理时间
  userName: string;        // 处理人
  userId: string;         // 工号
  comment?: string;       // 备注/意见
}

// 同步请求
export interface SyncRequest {
  plmTaskId?: string;
  tsTaskId?: string;
  taskName: string;
  taskType: DongfangTaskType;
  currentStage: string;
  decision?: string;
  remark?: string;
  completedAt?: string;
  sourceUrl: string;
  roles: ProcessRole[];
  history: ProcessRecord[];
}

// 同步响应
export interface SyncResponse {
  success: boolean;
  taskId?: string;
  message?: string;
}

// 插件配置
export interface PluginConfig {
  taskSystemUrl: string;    // 任务管理系统地址
  autoSync: boolean;        // 是否自动同步
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
```

- [ ] **Step 2: 创建配置管理模块**

```typescript
import { PluginConfig } from './types';

const DEFAULT_CONFIG: PluginConfig = {
  taskSystemUrl: 'http://localhost:3000',
  autoSync: false,
  showNotifications: true,
  checkInterval: 60000,
  enabledSites: {
    koa: true,
    plm: true,
    ts: true
  }
};

export async function getConfig(): Promise<PluginConfig> {
  const result = await chrome.storage.local.get('pluginConfig');
  return result.pluginConfig || DEFAULT_CONFIG;
}

export async function setConfig(config: Partial<PluginConfig>): Promise<void> {
  const current = await getConfig();
  const updated = { ...current, ...config };
  await chrome.storage.local.set({ pluginConfig: updated });
}

export async function resetConfig(): Promise<void> {
  await chrome.storage.local.set({ pluginConfig: DEFAULT_CONFIG });
}

export { DEFAULT_CONFIG };
```

- [ ] **Step 3: 创建API客户端**

```typescript
import { SyncRequest, SyncResponse, ExtractedTaskInfo } from './types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async syncTask(taskInfo: ExtractedTaskInfo): Promise<SyncResponse> {
    const request: SyncRequest = {
      taskName: taskInfo.taskName,
      taskType: taskInfo.taskType,
      currentStage: taskInfo.currentStage,
      decision: taskInfo.decision,
      remark: taskInfo.remark,
      completedAt: taskInfo.decision ? new Date().toISOString() : undefined,
      sourceUrl: taskInfo.sourceUrl,
      roles: taskInfo.roles,
      history: taskInfo.history
    };

    // 根据来源设置对应的任务ID
    if (taskInfo.source === 'PLM') {
      request.plmTaskId = taskInfo.taskId;
    } else if (taskInfo.source === 'TS') {
      request.tsTaskId = taskInfo.taskId;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/plm-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[API Client] 同步失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  async getTaskCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/count`);
      const data = await response.json();
      return data.count || 0;
    } catch {
      return 0;
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add browser-plugin/shared/
git commit -m "feat(plugin): 添加共享类型定义和配置管理"
```

### Task 1.2.1: 创建连接状态检测模块

**Files:**
- Create: `browser-plugin/shared/connection-checker.ts`

- [ ] **Step 1: 创建连接状态检测模块**

```typescript
// 连接状态类型
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

// 连接状态回调
export type StatusChangeCallback = (status: ConnectionStatus) => void;

class ConnectionChecker {
  private status: ConnectionStatus = 'disconnected';
  private checkInterval: number | null = null;
  private callbacks: Set<StatusChangeCallback> = new Set();
  private taskSystemUrl: string = 'http://localhost:3000';

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    const result = await chrome.storage.local.get('pluginConfig');
    if (result.pluginConfig?.taskSystemUrl) {
      this.taskSystemUrl = result.pluginConfig.taskSystemUrl;
    }
  }

  async checkConnection(): Promise<boolean> {
    this.updateStatus('checking');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.taskSystemUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const isConnected = response.ok;
      this.updateStatus(isConnected ? 'connected' : 'disconnected');
      return isConnected;
    } catch (error) {
      console.error('[连接检测] 检查失败:', error);
      this.updateStatus('disconnected');
      return false;
    }
  }

  private updateStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status;
      this.notifyCallbacks();

      // 更新插件图标状态
      this.updateIconStatus();
    }
  }

  private updateIconStatus() {
    const iconPath = this.status === 'connected'
      ? 'icons/icon-connected.png'
      : 'icons/icon-disconnected.png';

    try {
      chrome.action.setIcon({ path: iconPath });
    } catch (error) {
      console.error('[连接检测] 更新图标失败:', error);
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('[连接检测] 回调执行失败:', error);
      }
    });
  }

  onStatusChange(callback: StatusChangeCallback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  startAutoCheck(intervalMs: number = 60000) {
    this.stopAutoCheck();

    // 立即检查一次
    this.checkConnection();

    // 定时检查
    this.checkInterval = window.setInterval(() => {
      this.checkConnection();
    }, intervalMs);
  }

  stopAutoCheck() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// 导出单例
export const connectionChecker = new ConnectionChecker();
```

- [ ] **Step 2: 更新Background Script以使用连接检测**

```typescript
// 在 background.ts 中添加以下代码

// 插件安装后启动连接检测
chrome.runtime.onInstalled.addListener(() => {
  // ... 现有代码 ...

  // 启动连接状态检测
  connectionChecker.startAutoCheck(60000); // 每分钟检查一次
});

// 监听storage变化以更新检测间隔
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.pluginConfig) {
    const newConfig = changes.pluginConfig.newValue;
    if (newConfig?.checkInterval) {
      connectionChecker.startAutoCheck(newConfig.checkInterval);
    }
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add browser-plugin/shared/connection-checker.ts
git commit -m "feat(plugin): 添加服务器连接状态检测功能"
```

### Task 1.3: 创建基础Content Script框架

**Files:**
- Create: `browser-plugin/content/base/content-script.ts`
- Create: `browser-plugin/content/base/page-detector.ts`
- Create: `browser-plugin/content/base/message-bus.ts`

- [ ] **Step 1: 创建页面类型检测器**

```typescript
import { TaskSource } from '../shared/types';

export interface PageInfo {
  source: TaskSource;
  isTaskPage: boolean;
  taskUrlPattern: string;
}

// 页面检测配置
const PAGE_CONFIGS: Record<TaskSource, PageInfo> = {
  PLM: {
    source: 'PLM',
    isTaskPage: false,
    taskUrlPattern: '/Windchill/'
  },
  TS: {
    source: 'TS',
    isTaskPage: false,
    taskUrlPattern: '/taskTabs'
  },
  PORTAL: {
    source: 'PORTAL',
    isTaskPage: false,
    taskUrlPattern: '/_layouts/'
  }
};

export function detectPageType(url: string): TaskSource | null {
  if (url.includes('plm.dongfang.com')) {
    return 'PLM';
  }
  if (url.includes('tsplm.dfem.com.cn')) {
    return 'TS';
  }
  if (url.includes('dfemeip.dongfang.com')) {
    return 'PORTAL';
  }
  return null;
}

export function isTaskPage(url: string, source: TaskSource): boolean {
  if (source === 'PLM') {
    return url.includes('workflow') || url.includes('WorkItem');
  }
  if (source === 'TS') {
    return url.includes('name=流程') || url.includes('/taskTabs');
  }
  return false;
}

export function getPageInfo(): PageInfo | null {
  const url = window.location.href;
  const source = detectPageType(url);

  if (!source) return null;

  return {
    source,
    isTaskPage: isTaskPage(url, source),
    taskUrlPattern: PAGE_CONFIGS[source].taskUrlPattern
  };
}
```

- [ ] **Step 2: 创建消息总线**

```typescript
type MessageHandler = (payload: any) => void;

class MessageBus {
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private backgroundPort: chrome.runtime.Port | null = null;

  constructor() {
    this.initBackgroundConnection();
  }

  private initBackgroundConnection() {
    try {
      this.backgroundPort = chrome.runtime.connect({ name: 'content-script' });
      this.backgroundPort.onMessage.addListener((message) => {
        this.dispatch(message.type, message.payload);
      });
    } catch (error) {
      console.error('[MessageBus] 连接后台失败:', error);
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  emit(type: string, payload?: any) {
    this.dispatch(type, payload);
  }

  private dispatch(type: string, payload: any) {
    this.handlers.get(type)?.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[MessageBus] 处理消息 ${type} 时出错:`, error);
      }
    });
  }

  sendToBackground(type: string, payload?: any) {
    if (this.backgroundPort) {
      this.backgroundPort.postMessage({ type, payload });
    } else {
      chrome.runtime.sendMessage({ type, payload });
    }
  }
}

// 导出单例
export const messageBus = new MessageBus();
```

- [ ] **Step 3: 创建基础内容脚本**

```typescript
import { messageBus } from './message-bus';
import { getPageInfo } from './page-detector';

console.log('[任务管理助手] 内容脚本加载');

function init() {
  const pageInfo = getPageInfo();

  if (!pageInfo) {
    console.log('[任务管理助手] 非目标页面，跳过初始化');
    return;
  }

  console.log('[任务管理助手] 检测到页面类型:', pageInfo.source, '任务页面:', pageInfo.isTaskPage);

  // 根据页面类型初始化对应的功能
  if (pageInfo.source === 'PORTAL') {
    initPortalFeature();
  } else if (pageInfo.isTaskPage) {
    initTaskFeature(pageInfo.source);
  }
}

function initPortalFeature() {
  // 门户Tab注入功能由专门的injector负责
  console.log('[任务管理助手] 初始化门户功能');
}

function initTaskFeature(source: 'PLM' | 'TS') {
  console.log('[任务管理助手] 初始化任务提取功能:', source);

  // 监听来自后台的消息
  messageBus.on('EXTRACT_TASK_INFO', async () => {
    // 由各平台提取器实现
  });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// 监听URL变化（SPA页面）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('[任务管理助手] URL变化，重新检测:', url);
    init();
  }
}).observe(document.body, { childList: true, subtree: true });
```

- [ ] **Step 4: Commit**

```bash
git add browser-plugin/content/base/
git commit -m "feat(plugin): 添加基础Content Script框架"
```

---

## Chunk 2: PLM任务提取功能

### Task 2.1: 创建PLM任务信息提取器

**Files:**
- Create: `browser-plugin/content/plm/plm-extractor.ts`

- [ ] **Step 1: 创建PLM提取器类**

```typescript
import { ExtractedTaskInfo, DongfangTaskType, TaskStage, ProcessRole, ProcessRecord } from '../../shared/types';

// PLM/TS环节名称到后端TaskStatus的映射
const STAGE_TO_TASK_STATUS: Record<string, TaskStage> = {
  // PLM/TS环节名称 -> 后端TaskStatus
  '编制': 'Drafting',
  '编制中': 'Drafting',
  '修改': 'Revising',
  '修改中': 'Revising',
  '校核': 'Reviewing',
  '校核中': 'Reviewing',
  '审查': 'Approving',
  '审查中': 'Approving',
  '主任设计': 'Approving',  // 主任设计对应审查环节
  '标检': 'Reviewing',     // 标检对应校核环节
  '产品工艺会签': 'Reviewing',
  '专业工艺会签': 'Reviewing',
  '审定': 'Approving',
  '已完成': 'Completed',
  '完成': 'Completed'
};

export function mapStageToTaskStatus(plmStage: string): TaskStage {
  return STAGE_TO_TASK_STATUS[plmStage] || 'NotStarted';
}

export class PLMTaskExtractor {

  extract(): ExtractedTaskInfo | null {
    const url = window.location.href;

    // 检查是否在任务页面
    if (!url.includes('WorkItem')) {
      return null;
    }

    try {
      return {
        taskId: this.extractTaskId(),
        taskName: this.extractTaskName(),
        taskType: this.extractTaskType(),
        sourceUrl: url,
        source: 'PLM',
        currentStage: this.extractCurrentStage(),
        roles: this.extractRoles(),
        currentHandler: this.extractCurrentHandler(),
        decision: this.extractDecision(),
        remark: this.extractRemark(),
        history: this.extractHistory(),
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[PLM提取器] 提取失败:', error);
      return null;
    }
  }

  extractTaskId(): string {
    const match = window.location.href.match(/WorkItem%3A(\d+)/);
    return match ? match[1] : '';
  }

  extractTaskName(): string {
    // 从页面标题提取
    const heading = document.querySelector('h1')?.textContent?.trim();
    if (heading) {
      return heading.replace(/^任务\s*[-–]\s*/, '').trim();
    }

    // 备选：从页面标题区域提取
    const titleEl = document.querySelector('[class*="header"]')?.textContent;
    return titleEl?.trim() || '未命名任务';
  }

  extractTaskType(): DongfangTaskType {
    const url = window.location.href;

    if (url.includes('WTDocument')) return 'WTDocument';
    if (url.includes('TechnicalNoticeDoc')) return 'TechnicalNoticeDoc';
    if (url.includes('EPart')) return 'EPart';

    // 从页面链接文本推断
    const typeLink = document.querySelector('a[href*="WTDocument"], a[href*="TechnicalNoticeDoc"], a[href*="EPart"]');
    if (typeLink) {
      const text = typeLink.textContent || '';
      if (text.startsWith('产品类文档')) return 'WTDocument';
      if (text.startsWith('技术通知单')) return 'TechnicalNoticeDoc';
      if (text.startsWith('部件')) return 'EPart';
    }

    return 'Unknown';
  }

  extractCurrentStage(): TaskStage {
    // 从页面标题提取当前环节
    const heading = document.querySelector('h1')?.textContent || '';
    const match = heading.match(/Z\.(\d+)-(.+?)$/);
    let plmStage = '';

    if (match) {
      plmStage = match[2];
    } else {
      // 从处理状态表格第一行提取
      const firstRow = document.querySelector('table tbody tr');
      if (firstRow) {
        const stageCell = firstRow.querySelector('td');
        plmStage = stageCell?.textContent?.trim() || '';
      }
    }

    // 映射到后端TaskStatus
    return mapStageToTaskStatus(plmStage);
  }

  extractRoles(): ProcessRole[] {
    const roles: ProcessRole[] = [];

    // 从处理状态表格提取
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const stage = cells[0]?.textContent?.trim();
        const user = cells[1]?.textContent?.trim();
        const roleName = cells[2]?.textContent?.trim();
        const status = cells[3]?.textContent?.trim();

        if (stage && roleName) {
          // 解析用户信息
          let userName = '';
          let userId = '';

          const userMatch = user?.match(/(.+?)(\d{7})/);
          if (userMatch) {
            userName = userMatch[1];
            userId = userMatch[2];
          }

          roles.push({
            stage,
            roleName,
            userName,
            userId,
            status
          });
        }
      }
    });

    return roles;
  }

  extractCurrentHandler(): string {
    // 从页面获取当前处理人
    const handlerEl = document.querySelector('[class*="current"] [class*="user"]');
    return handlerEl?.textContent?.trim() || '';
  }

  extractDecision(): '通过' | '驳回' | '快速驳回' | '未选择' {
    const checkedRadio = document.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    const value = checkedRadio?.value;

    if (value === '通过') return '通过';
    if (value === '驳回') return '驳回';
    if (value === '快速驳回') return '快速驳回';
    return '未选择';
  }

  extractRemark(): string {
    const textarea = document.querySelector('textarea');
    return textarea?.value?.trim() || '';
  }

  extractHistory(): ProcessRecord[] {
    // 与extractRoles类似，但处理历史可能需要从不同区域获取
    return [];
  }

  canComplete(): boolean {
    const completeButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('完成任务'));
    return !!completeButton;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/content/plm/plm-extractor.ts
git commit -m "feat(plugin): 添加PLM任务信息提取器"
```

### Task 2.2: 创建PLM按钮拦截器

**Files:**
- Create: `browser-plugin/content/plm/plm-interceptor.ts`

- [ ] **Step 1: 创建按钮拦截器**

```typescript
import { PLMTaskExtractor } from './plm-extractor';
import { messageBus } from '../base/message-bus';
import { ExtractedTaskInfo } from '../../shared/types';

class PLMInterceptor {
  private extractor: PLMTaskExtractor;
  private isProcessing = false;
  private pendingTaskInfo: ExtractedTaskInfo | null = null;

  constructor() {
    this.extractor = new PLMTaskExtractor();
    this.init();
  }

  private init() {
    // 监听按钮点击
    document.addEventListener('click', this.handleClick.bind(this), true);

    // 监听表单提交
    document.addEventListener('submit', this.handleSubmit.bind(this), true);

    // 使用MutationObserver处理动态加载的按钮
    const observer = new MutationObserver(() => {
      this.attachButtonHandlers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 检查是否点击了"完成任务"按钮
    const isCompleteButton = (
      target.tagName === 'BUTTON' &&
      target.textContent?.includes('完成任务')
    ) || (
      target.tagName === 'INPUT' &&
      target.type === 'submit' &&
      target.value?.includes('完成任务')
    );

    if (isCompleteButton && !this.isProcessing) {
      event.preventDefault();
      event.stopPropagation();

      this.handleCompleteButtonClick();
    }
  }

  private handleSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;

    // 检查是否是任务相关表单
    if (form.action?.includes('complete') || form.action?.includes('workitem')) {
      if (!this.isProcessing && this.pendingTaskInfo) {
        event.preventDefault();
        this.handleCompleteButtonClick();
      }
    }
  }

  private handleCompleteButtonClick() {
    console.log('[PLM拦截器] 拦截到完成任务按钮点击');

    // 提取任务信息
    const taskInfo = this.extractor.extract();

    if (!taskInfo) {
      console.error('[PLM拦截器] 无法提取任务信息');
      alert('无法提取任务信息，请手动完成任务');
      return;
    }

    // 检查是否已选择通过/驳回
    if (taskInfo.decision === '未选择') {
      alert('请先选择"通过"或"驳回"选项');
      return;
    }

    // 保存待处理任务信息
    this.pendingTaskInfo = taskInfo;

    // 发送到后台打开确认弹窗
    messageBus.sendToBackground('OPEN_CONFIRM_DIALOG', {
      taskInfo,
      sourceTabId: chrome.runtime?.id
    });
  }

  private attachButtonHandlers() {
    // 重新绑定按钮事件处理器
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.textContent?.includes('完成任务') && !btn.hasAttribute('data-intercepted')) {
        btn.setAttribute('data-intercepted', 'true');
        // 实际点击由document级监听器处理
      }
    });
  }

  confirmComplete() {
    console.log('[PLM拦截器] 用户确认完成');

    if (this.pendingTaskInfo) {
      // 触发原始表单提交
      const completeButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('完成任务'));

      if (completeButton) {
        this.isProcessing = true;
        (completeButton as HTMLButtonElement).click();
      } else {
        // 尝试查找表单并提交
        const form = document.querySelector('form');
        if (form) {
          this.isProcessing = true;
          form.submit();
        }
      }

      // 清除待处理信息
      setTimeout(() => {
        this.isProcessing = false;
        this.pendingTaskInfo = null;
      }, 2000);
    }
  }

  cancelComplete() {
    console.log('[PLM拦截器] 用户取消完成');
    this.pendingTaskInfo = null;
  }
}

// 导出并初始化
export const interceptor = new PLMInterceptor();

// 监听确认消息
messageBus.on('CONFIRM_COMPLETE', () => {
  interceptor.confirmComplete();
});

messageBus.on('CANCEL_COMPLETE', () => {
  interceptor.cancelComplete();
});
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/content/plm/plm-interceptor.ts
git commit -m "feat(plugin): 添加PLM按钮拦截器"
```

---

## Chunk 3: TS任务提取功能

### Task 3.1: 创建TS任务信息提取器

**Files:**
- Create: `browser-plugin/content/ts/ts-extractor.ts`

- [ ] **Step 1: 创建TS提取器类**

```typescript
import { ExtractedTaskInfo, DongfangTaskType, TaskStage, ProcessRole, ProcessRecord } from '../../shared/types';

export class TSTaskExtractor {

  extract(): ExtractedTaskInfo | null {
    const url = window.location.href;

    // 检查是否在TS任务页面
    if (!url.includes('name=流程') && !url.includes('/taskTabs')) {
      return null;
    }

    try {
      return {
        taskId: this.extractTaskId(),
        taskName: this.extractTaskName(),
        taskType: this.extractTaskType(),
        sourceUrl: url,
        source: 'TS',
        currentStage: this.extractCurrentStage(),
        roles: this.extractRoles(),
        currentHandler: this.extractCurrentHandler(),
        decision: this.extractDecision(),
        remark: this.extractRemark(),
        history: this.extractHistory(),
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[TS提取器] 提取失败:', error);
      return null;
    }
  }

  extractTaskId(): string {
    // 从URL参数提取
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

    return params.get('code') || hashParams.get('code') || '';
  }

  extractTaskName(): string {
    // 从页面标题元素提取
    const titleEl = document.querySelector('.title-name, [class*="title-name"]');
    const title = titleEl?.textContent?.trim();

    if (title) {
      // 去除审批流程后缀
      return title.replace(/审批流程$/, '').trim();
    }

    return '未命名任务';
  }

  extractTaskType(): DongfangTaskType {
    // TS系统的任务类型从URL参数或页面元素获取
    const params = new URLSearchParams(window.location.search);
    const label = params.get('label') || '';

    if (label.includes('文档')) return 'WTDocument';
    if (label.includes('通知')) return 'TechnicalNoticeDoc';
    if (label.includes('部件')) return 'EPart';

    return 'Unknown';
  }

  extractCurrentStage(): TaskStage {
    // 从当前环节标签提取
    const stageEl = document.querySelector('.task-icon-label, [class*="task-icon-label"]');
    const plmStage = stageEl?.textContent?.trim();

    if (plmStage) {
      return mapStageToTaskStatus(plmStage);
    }

    // 从流程信息第一个节点获取
    const firstNode = document.querySelector('.ty-process__item');
    if (firstNode) {
      const titleEl = firstNode.querySelector('.ty-process__header--title');
      const stageFromNode = titleEl?.textContent?.trim();
      if (stageFromNode) {
        return mapStageToTaskStatus(stageFromNode);
      }
    }

    return 'NotStarted';
  }

  extractRoles(): ProcessRole[] {
    const roles: ProcessRole[] = [];

    // 从流程信息区域提取执行人
    const nodes = document.querySelectorAll('.process-info .ty-process__item, .ty-process__item');

    nodes.forEach(node => {
      const titleEl = node.querySelector('.ty-process__header--title');
      const userEl = node.querySelector('.ty-process__body--user');

      if (titleEl && userEl) {
        const stage = titleEl.textContent?.trim();
        const userText = userEl.textContent?.trim();

        // 解析用户信息 格式: "姓名(工号)"
        const match = userText?.match(/(.+)\((\d+)\)/);

        if (stage) {
          roles.push({
            stage,
            roleName: this.mapStageToRole(stage),
            userName: match?.[1] || '',
            userId: match?.[2] || '',
            status: '待处理'
          });
        }
      }
    });

    return roles;
  }

  private mapStageToRole(stage: string): string {
    const roleMap: Record<string, string> = {
      '编制': '编制者',
      '校核': '校核者',
      '主任设计': '主任设计',
      '审查': '审查者',
      '审定': '审定者',
      '标检': '标检'
    };
    return roleMap[stage] || stage;
  }

  extractCurrentHandler(): string {
    const currentNode = document.querySelector('.ty-process__item.in-process, .ty-process__item.active');
    if (currentNode) {
      const userEl = currentNode.querySelector('.ty-process__body--user');
      return userEl?.textContent?.trim() || '';
    }
    return '';
  }

  extractDecision(): '通过' | '驳回' | '转交' | '未选择' {
    // TS系统的决策通过按钮可见性判断
    // 注意: :contains() 不是标准CSS选择器，需要使用Array.find遍历
    const buttons = Array.from(document.querySelectorAll('button'));

    const findButton = (text: string) => buttons.find(btn => btn.textContent?.includes(text));

    const hasAgree = !!findButton('同意');
    const hasReject = !!findButton('驳回');
    const hasTransfer = !!findButton('转交');

    if (hasAgree) return '通过';
    if (hasReject) return '驳回';
    if (hasTransfer) return '转交';

    return '未选择';
  }

  extractRemark(): string {
    // 从备注输入框提取
    const textarea = document.querySelector('textarea');
    return textarea?.value?.trim() || '';
  }

  extractHistory(): ProcessRecord[] {
    const records: ProcessRecord[] = [];

    // 从处理记录区域提取
    const nodes = document.querySelectorAll('.process-info-box .ty-process__item');

    nodes.forEach(node => {
      const header = node.querySelector('.ty-process__header');
      const body = node.querySelector('.ty-process__body');

      if (header && body) {
        const title = header.querySelector('.ty-process__header--title')?.textContent?.trim();
        const status = header.querySelector('.ty-process__header--status')?.textContent?.trim();
        const time = header.querySelector('.ty-process__header--time')?.textContent?.trim();
        const userText = body.querySelector('.ty-process__body--user')?.textContent?.trim();
        const comment = body.textContent?.replace(userText || '', '').trim();

        const userMatch = userText?.match(/(.+)\((\d+)\)/);

        if (title && status && time) {
          records.push({
            stage: title,
            status,
            time,
            userName: userMatch?.[1] || '',
            userId: userMatch?.[2] || '',
            comment: comment || undefined
          });
        }
      }
    });

    return records;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/content/ts/ts-extractor.ts
git commit -m "feat(plugin): 添加TS任务信息提取器"
```

### Task 3.2: 创建TS按钮拦截器

**Files:**
- Create: `browser-plugin/content/ts/ts-interceptor.ts`

- [ ] **Step 1: 创建TS按钮拦截器（类似PLM拦截器）**

```typescript
import { TSTaskExtractor } from './ts-extractor';
import { messageBus } from '../base/message-bus';
import { ExtractedTaskInfo } from '../../shared/types';

class TSInterceptor {
  private extractor: TSTaskExtractor;
  private isProcessing = false;
  private pendingTaskInfo: ExtractedTaskInfo | null = null;

  constructor() {
    this.extractor = new TSTaskExtractor();
    this.init();
  }

  private init() {
    // 监听按钮点击
    document.addEventListener('click', this.handleClick.bind(this), true);

    // 使用MutationObserver处理动态加载的按钮
    const observer = new MutationObserver(() => {
      this.attachButtonHandlers();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 检查是否点击了审批相关按钮
    const isApprovalButton = (
      target.tagName === 'BUTTON' &&
      (target.textContent?.includes('同意') ||
       target.textContent?.includes('完成') ||
       target.textContent?.includes('转交'))
    );

    if (isApprovalButton && !this.isProcessing) {
      // 检查是否有任务在进行中
      const taskInfo = this.extractor.extract();
      if (taskInfo && taskInfo.currentStage) {
        // 根据PRD：只有"编制"或"审查"环节才弹出确认
        const shouldConfirm = this.shouldShowConfirm(taskInfo);

        if (shouldConfirm) {
          event.preventDefault();
          event.stopPropagation();

          this.pendingTaskInfo = taskInfo;
          messageBus.sendToBackground('OPEN_CONFIRM_DIALOG', {
            taskInfo,
            sourceTabId: chrome.runtime?.id
          });
        }
      }
    }
  }

  private shouldShowConfirm(taskInfo: ExtractedTaskInfo): boolean {
    // PRD要求：只有"编制"或"审查"环节才弹出确认窗口
    const confirmStages = ['编制', '审查'];
    return confirmStages.includes(taskInfo.currentStage);
  }

  private attachButtonHandlers() {
    // 重新绑定按钮事件处理器
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      if (btn.hasAttribute('data-intercepted')) return;

      const text = btn.textContent || '';
      if (text.includes('同意') || text.includes('完成') || text.includes('转交')) {
        btn.setAttribute('data-intercepted', 'true');
      }
    });
  }

  confirmComplete() {
    console.log('[TS拦截器] 用户确认完成');
    this.isProcessing = false;
    this.pendingTaskInfo = null;
  }

  cancelComplete() {
    console.log('[TS拦截器] 用户取消完成');
    this.pendingTaskInfo = null;
  }
}

// 导出并初始化
export const tsInterceptor = new TSInterceptor();

// 监听确认消息
messageBus.on('CONFIRM_COMPLETE', () => {
  tsInterceptor.confirmComplete();
});

messageBus.on('CANCEL_COMPLETE', () => {
  tsInterceptor.cancelComplete();
});
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/content/ts/ts-interceptor.ts
git commit -m "feat(plugin): 添加TS按钮拦截器"
```

---

## Chunk 4: KOA门户Tab注入功能

### Task 4.1: 创建门户Tab注入器

**Files:**
- Create: `browser-plugin/content/portal/portal-injector.ts`

- [ ] **Step 1: 创建门户Tab注入器**

```typescript
import { messageBus } from '../base/message-bus';

class PortalInjector {
  private injected = false;
  private taskSystemUrl = 'http://localhost:3000';

  constructor() {
    this.init();
  }

  private async init() {
    // 等待Tab容器加载
    await this.waitForTabContainer();

    // 检查是否已注入
    if (document.getElementById('task-management-tab')) {
      console.log('[门户注入器] 任务管理Tab已存在');
      this.injected = true;
      return;
    }

    // 获取配置的任务系统URL
    const config = await chrome.storage.local.get('pluginConfig');
    if (config.pluginConfig?.taskSystemUrl) {
      this.taskSystemUrl = config.pluginConfig.taskSystemUrl;
    }

    // 注入Tab
    this.injectTab();

    // 注入样式
    this.injectStyles();
  }

  private waitForTabContainer(): Promise<boolean> {
    return new Promise((resolve) => {
      const check = () => {
        const tabContainer = document.getElementById('todolist');
        if (tabContainer) {
          resolve(true);
          return true;
        }
        return false;
      };

      if (!check()) {
        const observer = new MutationObserver(() => {
          if (check()) {
            observer.disconnect();
            resolve(true);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    });
  }

  private injectTab() {
    const tabContainer = document.getElementById('todolist');
    if (!tabContainer) return;

    // 创建新Tab
    const newTab = document.createElement('li');
    newTab.id = 'task-management-tab';
    newTab.className = 'tabsWork_click';

    // 创建链接
    const tabLink = document.createElement('a');
    tabLink.href = this.taskSystemUrl;
    tabLink.target = '_blank';
    tabLink.innerHTML = '任务管理';
    tabLink.title = '打开任务管理系统';

    // 点击事件追踪
    tabLink.addEventListener('click', () => {
      console.log('[门户注入器] 用户点击任务管理Tab');
      messageBus.sendToBackground('PORTAL_TAB_CLICKED', {
        url: this.taskSystemUrl
      });
    });

    newTab.appendChild(tabLink);

    // 插入到PLM待办之后
    const existingTabs = tabContainer.querySelectorAll('li');
    const plmTab = Array.from(existingTabs).find(li =>
      li.textContent?.includes('PLM待办')
    );

    if (plmTab && plmTab.nextSibling) {
      tabContainer.insertBefore(newTab, plmTab.nextSibling);
    } else {
      tabContainer.appendChild(newTab);
    }

    console.log('[门户注入器] 任务管理Tab注入成功');
    this.injected = true;

    // 尝试获取任务数量并显示
    this.updateTaskCount();
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.id = 'task-management-tab-style';
    style.textContent = `
      #task-management-tab a {
        color: #1890ff !important;
        font-weight: 500 !important;
      }

      #task-management-tab:hover a {
        color: #40a9ff !important;
      }

      #task-management-tab .count-badge {
        background: #ff4d4f;
        color: white;
        padding: 0 4px;
        border-radius: 10px;
        font-size: 12px;
        margin-left: 4px;
      }

      #task-management-tab.loading::after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-left: 4px;
        border: 2px solid #1890ff;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  private async updateTaskCount() {
    const tabLink = document.querySelector('#task-management-tab a');
    if (!tabLink) return;

    const tabItem = document.getElementById('task-management-tab');
    if (tabItem) {
      tabItem.classList.add('loading');
    }

    try {
      // 从任务管理系统API获取待办数量
      const response = await fetch(`${this.taskSystemUrl}/api/tasks/count`);
      const data = await response.json();

      if (data.count > 0) {
        tabLink.innerHTML = `任务管理(<span class="count-badge">${data.count}</span>)`;
      }
    } catch (error) {
      console.log('[门户注入器] 获取任务数量失败:', error);
    } finally {
      if (tabItem) {
        tabItem.classList.remove('loading');
      }
    }
  }

  // 定时刷新任务数量
  startAutoRefresh(intervalMs = 300000) { // 5分钟
    setInterval(() => {
      if (this.injected) {
        this.updateTaskCount();
      }
    }, intervalMs);
  }
}

// 导出并初始化
export const portalInjector = new PortalInjector();
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/content/portal/portal-injector.ts
git commit -m "feat(plugin): 添加KOA门户Tab注入功能"
```

---

## Chunk 5: Background Script和Popup

### Task 5.1: 创建Background Script

**Files:**
- Create: `browser-plugin/background/background.ts`

- [ ] **Step 1: 创建后台脚本**

```typescript
// 存储待处理的任务信息
let pendingTaskInfo: any = null;
let sourceTabId: number | null = null;

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] 收到消息:', message.type);

  switch (message.type) {
    case 'OPEN_CONFIRM_DIALOG':
      handleOpenConfirmDialog(message.payload, sender.tab?.id);
      break;

    case 'PORTAL_TAB_CLICKED':
      handlePortalTabClicked(message.payload);
      break;

    case 'TASK_CONFIRMED':
      handleTaskConfirmed();
      break;

    case 'TASK_CANCELLED':
      handleTaskCancelled();
      break;

    case 'GET_CONFIG':
      handleGetConfig(sendResponse);
      return true; // 异步响应

    case 'SET_CONFIG':
      handleSetConfig(message.payload, sendResponse);
      return true;
  }

  return false;
});

function handleOpenConfirmDialog(payload: any, tabId?: number) {
  console.log('[Background] 打开确认弹窗', payload);

  // 保存任务信息
  pendingTaskInfo = payload.taskInfo;
  sourceTabId = tabId || null;

  // 保存到storage以供popup使用
  chrome.storage.local.set({
    pendingTaskInfo,
    sourceTabId
  });

  // 打开确认弹窗
  chrome.action.openPopup();
}

function handlePortalTabClicked(payload: any) {
  console.log('[Background] 门户Tab点击', payload);
  // 可选：发送统计信息到服务器
}

async function handleTaskConfirmed() {
  console.log('[Background] 任务确认');

  if (sourceTabId) {
    // 通知content script执行完成
    try {
      await chrome.tabs.sendMessage(sourceTabId, {
        type: 'CONFIRM_COMPLETE'
      });
    } catch (error) {
      console.error('[Background] 发送确认消息失败:', error);
    }
  }

  // 如果需要同步到任务管理系统
  if (pendingTaskInfo) {
    await syncToTaskSystem(pendingTaskInfo);
  }

  // 清除待处理信息
  pendingTaskInfo = null;
  sourceTabId = null;
  chrome.storage.local.remove(['pendingTaskInfo', 'sourceTabId']);
}

function handleTaskCancelled() {
  console.log('[Background] 任务取消');

  if (sourceTabId) {
    // 通知content script取消
    try {
      chrome.tabs.sendMessage(sourceTabId, {
        type: 'CANCEL_COMPLETE'
      });
    } catch (error) {
      console.error('[Background] 发送取消消息失败:', error);
    }
  }

  // 清除待处理信息
  pendingTaskInfo = null;
  sourceTabId = null;
  chrome.storage.local.remove(['pendingTaskInfo', 'sourceTabId']);
}

async function handleGetConfig(sendResponse: (response?: any) => void) {
  const result = await chrome.storage.local.get('pluginConfig');
  sendResponse(result.pluginConfig);
}

async function handleSetConfig(payload: any, sendResponse: (response?: any) => void) {
  const current = await chrome.storage.local.get('pluginConfig');
  const updated = { ...current.pluginConfig, ...payload };
  await chrome.storage.local.set({ pluginConfig: updated });
  sendResponse({ success: true });
}

// 同步到任务管理系统
async function syncToTaskSystem(taskInfo: any) {
  try {
    const config = await chrome.storage.local.get('pluginConfig');
    const apiUrl = (config.pluginConfig?.taskSystemUrl || 'http://localhost:3000') + '/api/plm-tasks';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskName: taskInfo.taskName,
        taskType: taskInfo.taskType,
        currentStage: taskInfo.currentStage,
        decision: taskInfo.decision,
        remark: taskInfo.remark,
        completedAt: new Date().toISOString(),
        sourceUrl: taskInfo.sourceUrl,
        plmTaskId: taskInfo.source === 'PLM' ? taskInfo.taskId : undefined,
        tsTaskId: taskInfo.source === 'TS' ? taskInfo.taskId : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('[Background] 同步成功');
  } catch (error) {
    console.error('[Background] 同步失败:', error);
  }
}

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 插件已安装');

  // 设置默认配置
  chrome.storage.local.set({
    pluginConfig: {
      taskSystemUrl: 'http://localhost:3000',
      autoSync: false,
      showNotifications: true,
      checkInterval: 60000,
      enabledSites: {
        koa: true,
        plm: true,
        ts: true
      }
    }
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add browser-plugin/background/background.ts
git commit -m "feat(plugin): 添加Background Script"
```

### Task 5.2: 创建Popup确认弹窗

**Files:**
- Create: `browser-plugin/popup/popup.html`
- Create: `browser-plugin/popup/popup.ts`
- Create: `browser-plugin/popup/popup.css`

- [ ] **Step 1: 创建Popup HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>任务确认</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="confirm-dialog">
    <div class="header">
      <h2>任务确认</h2>
      <span class="source-badge" id="source">-</span>
    </div>

    <div class="task-info">
      <div class="info-row">
        <label>任务名称:</label>
        <span id="taskName" class="value">-</span>
      </div>
      <div class="info-row">
        <label>任务类型:</label>
        <span id="taskType" class="value">-</span>
      </div>
      <div class="info-row">
        <label>当前环节:</label>
        <span id="currentStage" class="value">-</span>
      </div>
      <div class="info-row">
        <label>决策:</label>
        <span id="decision" class="value">-</span>
      </div>
      <div class="info-row">
        <label>备注:</label>
        <span id="remark" class="value">-</span>
      </div>
    </div>

    <div class="sync-section">
      <label class="checkbox-label">
        <input type="checkbox" id="syncToSystem" checked>
        <span>同步到任务管理系统</span>
      </label>
    </div>

    <div class="buttons">
      <button id="cancelBtn" class="btn-cancel">取消</button>
      <button id="confirmBtn" class="btn-confirm">确认完成</button>
    </div>

    <div class="status" id="status"></div>
  </div>

  <script src="popup.js" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: 创建Popup CSS**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  width: 420px;
  min-height: 300px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  color: #333;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.source-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e6f7ff;
  color: #1890ff;
}

.task-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.info-row label {
  width: 80px;
  color: #666;
  flex-shrink: 0;
}

.info-row .value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.sync-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafc;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f0f2f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e6e8eb;
}

.btn-confirm {
  background: #1890ff;
  color: white;
}

.btn-confirm:hover {
  background: #40a9ff;
}

.btn-confirm:disabled {
  background: #a0c8ff;
  cursor: not-allowed;
}

.status {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  display: none;
}

.status.success {
  display: block;
  background: #f6ffed;
  color: #52c41a;
}

.status.error {
  display: block;
  background: #fff2f0;
  color: #ff4d4f;
}

.status.loading {
  display: block;
  background: #e6f7ff;
  color: #1890ff;
}

/* 任务类型标签样式 */
.task-type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.task-type-badge.WTDocument {
  background: #e6f7ff;
  color: #1890ff;
}

.task-type-badge.TechnicalNoticeDoc {
  background: #fff7e6;
  color: #fa8c16;
}

.task-type-badge.EPart {
  background: #f6ffed;
  color: #52c41a;
}

/* 决策标签样式 */
.decision-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.decision-badge.通过 {
  background: #f6ffed;
  color: #52c41a;
}

.decision-badge.驳回 {
  background: #fff2f0;
  color: #ff4d4f;
}
```

- [ ] **Step 3: 创建Popup TypeScript**

```typescript
import { ExtractedTaskInfo, DongfangTaskType } from '../shared/types';

document.addEventListener('DOMContentLoaded', async () => {
  // 获取任务信息
  const result = await chrome.storage.local.get('pendingTaskInfo');
  const taskInfo: ExtractedTaskInfo | null = result.pendingTaskInfo;

  if (!taskInfo) {
    showError('未找到任务信息，请刷新页面后重试');
    return;
  }

  // 填充任务信息
  fillTaskInfo(taskInfo);

  // 绑定按钮事件
  bindButtonEvents(taskInfo);
});

function fillTaskInfo(taskInfo: ExtractedTaskInfo) {
  document.getElementById('taskName')!.textContent = taskInfo.taskName || '-';
  document.getElementById('source')!.textContent = taskInfo.source;
  document.getElementById('currentStage')!.textContent = taskInfo.currentStage || '-';
  document.getElementById('remark')!.textContent = taskInfo.remark || '-';

  // 格式化任务类型
  const taskTypeEl = document.getElementById('taskType')!;
  taskTypeEl.innerHTML = formatTaskType(taskInfo.taskType);

  // 格式化决策
  const decisionEl = document.getElementById('decision')!;
  decisionEl.innerHTML = formatDecision(taskInfo.decision);
}

function formatTaskType(type: DongfangTaskType): string {
  const typeMap: Record<DongfangTaskType, string> = {
    'WTDocument': '文档发布',
    'TechnicalNoticeDoc': '技术通知单',
    'EPart': '部件发布',
    'Unknown': '未知'
  };

  const label = typeMap[type] || type;
  return `<span class="task-type-badge ${type}">${label}</span>`;
}

function formatDecision(decision?: string): string {
  if (!decision || decision === '未选择') {
    return '<span class="decision-badge">未选择</span>';
  }

  return `<span class="decision-badge ${decision}">${decision}</span>`;
}

function bindButtonEvents(taskInfo: ExtractedTaskInfo) {
  const confirmBtn = document.getElementById('confirmBtn')!;
  const cancelBtn = document.getElementById('cancelBtn')!;
  const syncCheckbox = document.getElementById('syncToSystem') as HTMLInputElement;

  confirmBtn.addEventListener('click', async () => {
    const syncToSystem = syncCheckbox.checked;

    // 显示加载状态
    showLoading('处理中...');
    confirmBtn.setAttribute('disabled', 'true');

    try {
      // 如果需要同步到任务管理系统
      if (syncToSystem) {
        const success = await syncToTaskSystem(taskInfo);

        if (!success) {
          showError('同步失败，是否继续完成任务？');
          confirmBtn.removeAttribute('disabled');

          if (!confirm('同步到任务管理系统失败，是否继续完成任务？')) {
            return;
          }
        }
      }

      // 通知后台确认完成
      chrome.runtime.sendMessage({ type: 'TASK_CONFIRMED' });

      showSuccess('操作成功');

      // 延迟关闭
      setTimeout(() => {
        window.close();
      }, 1000);

    } catch (error) {
      console.error('处理失败:', error);
      showError('处理失败，请重试');
      confirmBtn.removeAttribute('disabled');
    }
  });

  cancelBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'TASK_CANCELLED' });
    window.close();
  });
}

async function syncToTaskSystem(taskInfo: ExtractedTaskInfo): Promise<boolean> {
  try {
    const config = await chrome.storage.local.get('pluginConfig');
    const apiUrl = (config.pluginConfig?.taskSystemUrl || 'http://localhost:3000') + '/api/plm-tasks';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskName: taskInfo.taskName,
        taskType: taskInfo.taskType,
        currentStage: taskInfo.currentStage,
        decision: taskInfo.decision,
        remark: taskInfo.remark,
        completedAt: taskInfo.decision ? new Date().toISOString() : undefined,
        sourceUrl: taskInfo.sourceUrl,
        plmTaskId: taskInfo.source === 'PLM' ? taskInfo.taskId : undefined,
        tsTaskId: taskInfo.source === 'TS' ? taskInfo.taskId : undefined,
        roles: taskInfo.roles,
        history: taskInfo.history
      })
    });

    return response.ok;
  } catch (error) {
    console.error('同步失败:', error);
    return false;
  }
}

function showLoading(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status loading';
  statusEl.textContent = message;
}

function showSuccess(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status success';
  statusEl.textContent = message;
}

function showError(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status error';
  statusEl.textContent = message;
}
```

- [ ] **Step 4: Commit**

```bash
git add browser-plugin/popup/
git commit -m "feat(plugin): 添加Popup确认弹窗"
```

---

## Chunk 6: 构建和测试

### Task 6.1: 配置构建系统

**Files:**
- Create: `browser-plugin/tsconfig.json`
- Create: `browser-plugin/package.json`
- Create: `browser-plugin/webpack.config.js`

- [ ] **Step 1: 创建package.json**

```json
{
  "name": "task-manager-helper",
  "version": "1.0.0",
  "description": "东方电气任务管理助手 - 自动同步PLM/TS任务",
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.260",
    "copy-webpack-plugin": "^12.0.2",
    "css-loader": "^6.10.0",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^3.3.4",
    "ts-loader": "^9.5.1",
    "typescript": "^5.3.3",
    "webpack": "^5.90.3",
    "webpack-cli": "^5.1.4"
  }
}
```

- [ ] **Step 2: 创建tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "declaration": true,
    "sourceMap": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建webpack.config.js**

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'background/background': './background/background.ts',
    'content/base/content-script': './content/base/content-script.ts',
    'content/plm/plm-extractor': './content/plm/plm-extractor.ts',
    'content/plm/plm-interceptor': './content/plm/plm-interceptor.ts',
    'content/ts/ts-extractor': './content/ts/ts-extractor.ts',
    'content/portal/portal-injector': './content/portal/portal-injector.ts',
    'popup/popup': './popup/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './popup/popup.html',
      filename: 'popup/popup.html',
      chunks: ['popup/popup']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        { from: '_locales', to: '_locales', noErrorOnMissing: true }
      ]
    })
  ]
};
```

- [ ] **Step 4: Commit**

```bash
git add browser-plugin/tsconfig.json browser-plugin/package.json browser-plugin/webpack.config.js
git commit -m "feat(plugin): 配置构建系统"
```

---

## 附录: 前端插件API对接方案

⚠️ **重要**: 后端API已经是完整的，前端插件需要遵循现有API进行对接。

### A.1 插件API客户端实现

**Files:**
- Modify: `browser-plugin/shared/api-client.ts`

```typescript
import { TaskSource, ExtractedTaskInfo, TaskStage, RoleStatus } from './types';

// 角色映射：PLM/TS环节 -> 后端角色
const STAGE_TO_ROLE: Record<string, string> = {
  'Drafting': 'assignee',        // 编制 -> 负责人
  'Revising': 'assignee',        // 修改 -> 负责人
  'Reviewing': 'checker',        // 校核 -> 校核人
  'Approving': 'approver'        // 审查 -> 审查人
};

export class ApiClient {
  private baseUrl: string;
  private token: string = '';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  /**
   * 更新任务状态
   * PUT /api/tasks/{taskId}/status
   */
  async updateTaskStatus(taskId: string, status: TaskStage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status })
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 更新任务状态失败:', error);
      return false;
    }
  }

  /**
   * 更新角色状态
   * PUT /api/tasks/{taskId}/role-status
   */
  async updateRoleStatus(
    taskId: string,
    role: 'assignee' | 'checker' | 'chiefDesigner' | 'approver',
    status: RoleStatus
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/role-status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ role, status })
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 更新角色状态失败:', error);
      return false;
    }
  }

  /**
   * 完成任务所有角色
   * POST /api/tasks/{taskId}/complete-all
   */
  async completeAllRoles(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tasks/${taskId}/complete-all`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('[API] 完成任务失败:', error);
      return false;
    }
  }

  /**
   * 从PLM/TS任务提取信息转换为API调用
   */
  async syncFromExternal(taskInfo: ExtractedTaskInfo): Promise<{ success: boolean; taskId?: string }> {
    // 根据任务来源查找对应的本地任务
    const externalId = taskInfo.source === 'PLM' ? taskInfo.taskId : `ts-${taskInfo.taskId}`;

    // 1. 调用现有API更新状态
    const role = STAGE_TO_ROLE[taskInfo.currentStage] || 'assignee';
    const roleStatus = taskInfo.decision === '通过' ? 'Completed' : 'InProgress';

    // 2. 如果是通过，更新角色状态
    if (taskInfo.decision === '通过') {
      await this.updateRoleStatus(externalId, role as any, roleStatus as any);
    }

    return { success: true, taskId: externalId };
  }
}
```

### A.2 认证处理

插件需要处理JWT认证：

```typescript
// 在 popup.ts 或 background.ts 中处理登录
async function login(userId: string, password: string): Promise<string | null> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password })
  });

  if (response.ok) {
    const data = await response.json();
    return data.token; // 存储token
  }
  return null;
}
```

### A.3 API调用流程

```
用户点击"完成任务" → 提取任务信息 → 判断角色 → 调用对应API
                                                         ↓
                                            PUT /api/tasks/{id}/role-status
                                                         ↓
                                            body: { role: "checker", status: "Completed" }
```

---

## 附录: 后续任务

以下任务需要在完成基础插件后进行：

### B. 自动化测试

1. 使用Puppeteer/Playwright测试插件功能
2. 测试不同任务类型的提取准确性
3. 测试按钮拦截和弹窗交互

### C. 扩展功能

1. 支持更多任务平台（如集团门户）
2. 添加任务统计和报表功能
3. 支持批量操作
4. 添加离线缓存功能
