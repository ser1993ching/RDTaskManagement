import { ExtractedTaskInfo, DongfangTaskType, TaskStageDisplayName } from '../shared/types';

/**
 * Popup确认弹窗逻辑
 */

interface TaskInfo extends ExtractedTaskInfo {}

document.addEventListener('DOMContentLoaded', async () => {
  // 获取任务信息
  const result = await chrome.storage.local.get('pendingTaskInfo');
  const taskInfo: TaskInfo | null = result.pendingTaskInfo;

  if (!taskInfo) {
    showError('未找到任务信息，请刷新页面后重试');
    return;
  }

  // 填充任务信息
  fillTaskInfo(taskInfo);

  // 绑定按钮事件
  bindButtonEvents(taskInfo);
});

/**
 * 填充任务信息
 */
function fillTaskInfo(taskInfo: TaskInfo) {
  document.getElementById('taskName')!.textContent = taskInfo.taskName || '-';
  document.getElementById('source')!.textContent = taskInfo.source;
  document.getElementById('currentStage')!.textContent = TaskStageDisplayName[taskInfo.currentStage] || taskInfo.currentStage || '-';
  document.getElementById('remark')!.textContent = taskInfo.remark || '-';

  // 格式化任务类型
  const taskTypeEl = document.getElementById('taskType')!;
  taskTypeEl.innerHTML = formatTaskType(taskInfo.taskType);

  // 格式化决策
  const decisionEl = document.getElementById('decision')!;
  decisionEl.innerHTML = formatDecision(taskInfo.decision);
}

/**
 * 格式化任务类型显示
 */
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

/**
 * 格式化决策显示
 */
function formatDecision(decision?: string): string {
  if (!decision || decision === '未选择') {
    return '<span class="decision-badge 未选择">未选择</span>';
  }

  return `<span class="decision-badge ${decision}">${decision}</span>`;
}

/**
 * 绑定按钮事件
 */
function bindButtonEvents(taskInfo: TaskInfo) {
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

/**
 * 同步任务到任务管理系统
 */
async function syncToTaskSystem(taskInfo: TaskInfo): Promise<boolean> {
  try {
    // 获取配置
    const config = await chrome.storage.local.get('pluginConfig');
    const apiUrl = (config.pluginConfig?.taskSystemUrl || 'http://localhost:3000');

    // 构建请求
    const requestBody = {
      taskName: taskInfo.taskName,
      taskType: taskInfo.taskType,
      currentStage: taskInfo.currentStage,
      decision: taskInfo.decision,
      remark: taskInfo.remark,
      completedAt: taskInfo.decision ? new Date().toISOString() : undefined,
      sourceUrl: taskInfo.sourceUrl,
      externalTaskId: taskInfo.source === 'PLM' ? taskInfo.taskId : `ts-${taskInfo.taskId}`,
      roles: taskInfo.roles,
      history: taskInfo.history
    };

    // 尝试更新角色状态API
    const role = getRoleFromStage(taskInfo.currentStage);
    const roleStatus = taskInfo.decision === '通过' ? 'Completed' : 'InProgress';

    const response = await fetch(`${apiUrl}/api/tasks/${requestBody.externalTaskId}/role-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role, status: roleStatus })
    });

    return response.ok;
  } catch (error) {
    console.error('同步失败:', error);
    return false;
  }
}

/**
 * 根据环节获取角色
 */
function getRoleFromStage(stage: string): string {
  const roleMap: Record<string, string> = {
    'Drafting': 'assignee',
    'Revising': 'assignee',
    'Reviewing': 'checker',
    'Approving': 'approver'
  };
  return roleMap[stage] || 'assignee';
}

/**
 * 显示加载状态
 */
function showLoading(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status loading';
  statusEl.textContent = message;
}

/**
 * 显示成功状态
 */
function showSuccess(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status success';
  statusEl.textContent = message;
}

/**
 * 显示错误状态
 */
function showError(message: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.className = 'status error';
  statusEl.textContent = message;
}
