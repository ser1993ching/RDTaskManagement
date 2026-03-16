import { messageBus } from '../base/message-bus';

/**
 * KOA门户Tab注入器
 * 在东方电机信息门户的待办列表Tab栏中注入"任务管理"Tab
 */
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
    try {
      const config = await chrome.storage.local.get('pluginConfig');
      if (config.pluginConfig?.taskSystemUrl) {
        this.taskSystemUrl = config.pluginConfig.taskSystemUrl;
      }
    } catch (error) {
      console.log('[门户注入器] 加载配置失败，使用默认URL');
    }

    // 注入Tab
    this.injectTab();

    // 注入样式
    this.injectStyles();
  }

  /**
   * 等待Tab容器加载
   */
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

  /**
   * 注入任务管理Tab
   */
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

  /**
   * 注入自定义样式
   */
  private injectStyles() {
    // 检查是否已注入样式
    if (document.getElementById('task-management-tab-style')) {
      return;
    }

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

  /**
   * 更新任务数量显示
   */
  private async updateTaskCount() {
    const tabLink = document.querySelector('#task-management-tab a');
    if (!tabLink) return;

    const tabItem = document.getElementById('task-management-tab');
    if (tabItem) {
      tabItem.classList.add('loading');
    }

    try {
      // 从任务管理系统API获取待办数量
      const response = await fetch(`${this.taskSystemUrl}/api/tasks/personal/admin`);
      if (response.ok) {
        const data = await response.json();
        // 假设返回的是任务数组，计算待办数量
        const count = Array.isArray(data) ? data.filter((t: any) => t.status !== 'Completed').length : 0;

        if (count > 0) {
          tabLink.innerHTML = `任务管理(<span class="count-badge">${count}</span>)`;
        }
      }
    } catch (error) {
      console.log('[门户注入器] 获取任务数量失败:', error);
    } finally {
      if (tabItem) {
        tabItem.classList.remove('loading');
      }
    }
  }

  /**
   * 启动自动刷新任务数量
   */
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
