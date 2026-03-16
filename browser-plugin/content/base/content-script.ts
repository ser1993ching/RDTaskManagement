import { messageBus } from './message-bus';
import { getPageInfo } from './page-detector';

console.log('[任务管理助手] 内容脚本加载');

/**
 * 初始化内容脚本
 */
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

/**
 * 初始化门户功能
 */
function initPortalFeature() {
  // 门户Tab注入功能由专门的injector负责
  console.log('[任务管理助手] 初始化门户功能');
}

/**
 * 初始化任务提取功能
 */
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
