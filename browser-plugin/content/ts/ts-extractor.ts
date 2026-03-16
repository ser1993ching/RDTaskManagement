import {
  ExtractedTaskInfo,
  DongfangTaskType,
  TaskStage,
  ProcessRole,
  ProcessRecord
} from '../../shared/types';
import { mapStageToTaskStatus } from '../plm/plm-extractor';

/**
 * TS任务信息提取器
 * 从TS-PLM系统页面中提取任务相关信息
 */
export class TSTaskExtractor {

  /**
   * 提取任务信息
   */
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

  /**
   * 提取任务ID
   */
  extractTaskId(): string {
    // 从URL参数提取
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

    return params.get('code') || hashParams.get('code') || '';
  }

  /**
   * 提取任务名称
   */
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

  /**
   * 提取任务类型
   */
  extractTaskType(): DongfangTaskType {
    // TS系统的任务类型从URL参数或页面元素获取
    const params = new URLSearchParams(window.location.search);
    const label = params.get('label') || '';

    if (label.includes('文档')) return 'WTDocument';
    if (label.includes('通知')) return 'TechnicalNoticeDoc';
    if (label.includes('部件')) return 'EPart';

    return 'Unknown';
  }

  /**
   * 提取当前环节（转换为后端TaskStatus）
   */
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

  /**
   * 提取角色名称到后端角色的映射
   */
  private mapStageToRole(stage: string): string {
    const roleMap: Record<string, string> = {
      '编制': 'assignee',
      '校核': 'checker',
      '主任设计': 'chiefDesigner',
      '审查': 'approver',
      '审定': 'approver',
      '标检': 'checker'
    };
    return roleMap[stage] || 'assignee';
  }

  /**
   * 提取流程角色
   */
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

  /**
   * 提取当前处理人
   */
  extractCurrentHandler(): string {
    const currentNode = document.querySelector('.ty-process__item.in-process, .ty-process__item.active');
    if (currentNode) {
      const userEl = currentNode.querySelector('.ty-process__body--user');
      return userEl?.textContent?.trim() || '';
    }
    return '';
  }

  /**
   * 提取决策状态
   * 注意: :contains() 不是标准CSS选择器，需要使用Array.find遍历
   */
  extractDecision(): '通过' | '驳回' | '转交' | '未选择' {
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
