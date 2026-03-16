import { TSTaskExtractor } from './ts-extractor';
import { messageBus } from '../base/message-bus';
import { ExtractedTaskInfo, TaskStage } from '../../shared/types';

/**
 * TS按钮拦截器
 * 拦截审批相关按钮，根据PRD只在"编制"或"审查"环节弹出确认
 */
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

  /**
   * 判断是否应该显示确认弹窗
   * PRD要求：只有"编制"或"审查"环节才弹出确认窗口
   */
  private shouldShowConfirm(taskInfo: ExtractedTaskInfo): boolean {
    const confirmStages: TaskStage[] = ['Drafting', 'Approving'];
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

  /**
   * 用户确认完成
   */
  confirmComplete() {
    console.log('[TS拦截器] 用户确认完成');
    this.isProcessing = false;
    this.pendingTaskInfo = null;
  }

  /**
   * 用户取消完成
   */
  cancelComplete() {
    console.log('[TS拦截器] 用户取消完成');
    this.pendingTaskInfo = null;
  }

  /**
   * 获取待处理任务信息
   */
  getPendingTaskInfo(): ExtractedTaskInfo | null {
    return this.pendingTaskInfo;
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
