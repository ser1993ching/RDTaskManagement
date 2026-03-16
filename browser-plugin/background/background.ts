import { DEFAULT_CONFIG } from '../shared/config';
import { ApiClient } from '../shared/api-client';

/**
 * Background Script
 * 作为Content Script和Popup之间的消息中转站
 */

// 存储待处理的任务信息
let pendingTaskInfo: any = null;
let sourceTabId: number | null = null;

// API客户端实例
let apiClient: ApiClient;

/**
 * 初始化
 */
async function init() {
  // 获取配置
  const config = await chrome.storage.local.get('pluginConfig');
  const pluginConfig = config.pluginConfig || DEFAULT_CONFIG;

  // 初始化API客户端
  apiClient = new ApiClient(pluginConfig.taskSystemUrl);

  // 启动连接状态检测
  startConnectionChecker();
}

/**
 * 启动连接状态检测
 */
function startConnectionChecker() {
  // 定期检测连接状态
  setInterval(async () => {
    try {
      const isConnected = await apiClient.healthCheck();
      console.log('[Background] 连接状态:', isConnected ? '已连接' : '未连接');
    } catch (error) {
      console.log('[Background] 连接检测失败');
    }
  }, 60000);
}

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

    case 'SET_TOKEN':
      handleSetToken(message.payload);
      break;
  }

  return false;
});

/**
 * 处理打开确认弹窗
 */
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

/**
 * 处理门户Tab点击
 */
function handlePortalTabClicked(payload: any) {
  console.log('[Background] 门户Tab点击', payload);
  // 可选：发送统计信息到服务器
}

/**
 * 处理任务确认
 */
async function handleTaskConfirmed() {
  console.log('[Background] 任务确认');

  // 通知content script执行完成
  if (sourceTabId) {
    try {
      await chrome.tabs.sendMessage(sourceTabId, {
        type: 'CONFIRM_COMPLETE'
      });
    } catch (error) {
      console.error('[Background] 发送确认消息失败:', error);
    }
  }

  // 如果需要同步到任务管理系统
  if (pendingTaskInfo && apiClient) {
    const result = await apiClient.syncFromExternal(pendingTaskInfo);
    console.log('[Background] 同步结果:', result);
  }

  // 清除待处理信息
  pendingTaskInfo = null;
  sourceTabId = null;
  chrome.storage.local.remove(['pendingTaskInfo', 'sourceTabId']);
}

/**
 * 处理任务取消
 */
function handleTaskCancelled() {
  console.log('[Background] 任务取消');

  // 通知content script取消
  if (sourceTabId) {
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

/**
 * 处理获取配置
 */
async function handleGetConfig(sendResponse: (response?: any) => void) {
  const result = await chrome.storage.local.get('pluginConfig');
  sendResponse(result.pluginConfig);
}

/**
 * 处理设置配置
 */
async function handleSetConfig(payload: any, sendResponse: (response?: any) => void) {
  const current = await chrome.storage.local.get('pluginConfig');
  const updated = { ...current.pluginConfig, ...payload };
  await chrome.storage.local.set({ pluginConfig: updated });

  // 更新API客户端URL
  if (payload.taskSystemUrl && apiClient) {
    apiClient = new ApiClient(payload.taskSystemUrl);
  }

  sendResponse({ success: true });
}

/**
 * 处理设置Token
 */
function handleSetToken(payload: { token: string }) {
  if (apiClient && payload.token) {
    apiClient.setToken(payload.token);
  }
}

// 插件安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] 插件已安装');

  // 设置默认配置
  chrome.storage.local.set({
    pluginConfig: DEFAULT_CONFIG
  });

  // 初始化
  init();
});

// 浏览器启动时初始化
chrome.runtime.onStartup.addListener(() => {
  console.log('[Background] 浏览器启动');
  init();
});
