// 连接状态类型
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking';

// 连接状态回调
export type StatusChangeCallback = (status: ConnectionStatus) => void;

/**
 * 连接状态检测器
 * 定期检测与任务管理系统的连接状态
 */
class ConnectionChecker {
  private status: ConnectionStatus = 'disconnected';
  private checkInterval: number | null = null;
  private callbacks: Set<StatusChangeCallback> = new Set();
  private taskSystemUrl: string = 'http://localhost:3000';

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    try {
      const result = await chrome.storage.local.get('pluginConfig');
      if (result.pluginConfig?.taskSystemUrl) {
        this.taskSystemUrl = result.pluginConfig.taskSystemUrl;
      }
    } catch (error) {
      console.error('[连接检测] 加载配置失败:', error);
    }
  }

  /**
   * 检测连接状态
   */
  async checkConnection(): Promise<boolean> {
    this.updateStatus('checking');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.taskSystemUrl}/api/tasks`, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // HEAD可能不支持，检查是否服务器可达
      const isConnected = response.ok || response.status === 405 || response.status === 401;
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
      this.updateIconStatus();
    }
  }

  private updateIconStatus() {
    try {
      // 更新插件图标状态
      const iconPath = this.status === 'connected'
        ? 'icons/icon-connected.png'
        : 'icons/icon-disconnected.png';

      // 注意：扩展图标更新需要实际图标文件存在
      // 这里只是记录状态
      console.log('[连接检测] 连接状态:', this.status);
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

  /**
   * 订阅连接状态变化
   */
  onStatusChange(callback: StatusChangeCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * 获取当前连接状态
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * 启动自动检测
   */
  startAutoCheck(intervalMs: number = 60000) {
    this.stopAutoCheck();

    // 立即检查一次
    this.checkConnection();

    // 定时检查
    this.checkInterval = window.setInterval(() => {
      this.checkConnection();
    }, intervalMs);
  }

  /**
   * 停止自动检测
   */
  stopAutoCheck() {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 更新服务器URL
   */
  setServerUrl(url: string) {
    this.taskSystemUrl = url;
  }
}

// 导出单例
export const connectionChecker = new ConnectionChecker();
