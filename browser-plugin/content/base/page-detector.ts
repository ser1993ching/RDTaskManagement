import { TaskSource } from '../../shared/types';

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

/**
 * 检测页面类型
 */
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

/**
 * 判断是否为任务页面
 */
export function isTaskPage(url: string, source: TaskSource): boolean {
  if (source === 'PLM') {
    return url.includes('workflow') || url.includes('WorkItem');
  }
  if (source === 'TS') {
    return url.includes('name=流程') || url.includes('/taskTabs');
  }
  return false;
}

/**
 * 获取当前页面信息
 */
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
