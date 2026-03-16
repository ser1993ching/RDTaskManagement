import { PLMTaskExtractor } from './plm-extractor';
import { messageBus } from '../base/message-bus';
import { ExtractedTaskInfo } from '../../shared/types';

/**
 * PLM按钮拦截器
 * 拦截"完成任务"按钮，弹出确认窗口
 */
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

  /**
   * 用户确认完成
   */
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

  /**
   * 用户取消完成
   */
  cancelComplete() {
    console.log('[PLM拦截器] 用户取消完成');
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
export const interceptor = new PLMInterceptor();

// 监听确认消息
messageBus.on('CONFIRM_COMPLETE', () => {
  interceptor.confirmComplete();
});

messageBus.on('CANCEL_COMPLETE', () => {
  interceptor.cancelComplete();
});
