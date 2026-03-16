import {
  ExtractedTaskInfo,
  DongfangTaskType,
  TaskStage,
  ProcessRole,
  ProcessRecord
} from '../../shared/types';

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

/**
 * 将PLM环节名称映射到后端TaskStatus
 */
export function mapStageToTaskStatus(plmStage: string): TaskStage {
  return STAGE_TO_TASK_STATUS[plmStage] || 'NotStarted';
}

/**
 * PLM任务信息提取器
 * 从PLM系统页面中提取任务相关信息
 */
export class PLMTaskExtractor {

  /**
   * 提取任务信息
   */
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

  /**
   * 提取任务ID
   */
  extractTaskId(): string {
    const match = window.location.href.match(/WorkItem%3A(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * 提取任务名称
   */
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

  /**
   * 提取任务类型
   */
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

  /**
   * 提取当前环节（转换为后端TaskStatus）
   */
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

  /**
   * 提取流程角色
   */
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

  /**
   * 提取当前处理人
   */
  extractCurrentHandler(): string {
    const handlerEl = document.querySelector('[class*="current"] [class*="user"]');
    return handlerEl?.textContent?.trim() || '';
  }

  /**
   * 提取决策状态
   */
  extractDecision(): '通过' | '驳回' | '快速驳回' | '未选择' {
    const checkedRadio = document.querySelector('input[type="radio"]:checked') as HTMLInputElement;
    const value = checkedRadio?.value;

    if (value === '通过') return '通过';
    if (value === '驳回') return '驳回';
    if (value === '快速驳回') return '快速驳回';
    return '未选择';
  }

  /**
   * 提取备注
   */
  extractRemark(): string {
    const textarea = document.querySelector('textarea');
    return textarea?.value?.trim() || '';
  }

  /**
   * 提取处理历史
   */
  extractHistory(): ProcessRecord[] {
    // 与extractRoles类似，从处理记录区域获取
    return [];
  }

  /**
   * 检查是否可以完成
   */
  canComplete(): boolean {
    const completeButton = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('完成任务'));
    return !!completeButton;
  }
}
