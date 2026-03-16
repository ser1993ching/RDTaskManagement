type MessageHandler = (payload: any) => void;

/**
 * 消息总线 - Content Script与Background之间的通信
 */
class MessageBus {
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private backgroundPort: chrome.runtime.Port | null = null;

  constructor() {
    this.initBackgroundConnection();
  }

  private initBackgroundConnection() {
    try {
      this.backgroundPort = chrome.runtime.connect({ name: 'content-script' });
      this.backgroundPort.onMessage.addListener((message) => {
        this.dispatch(message.type, message.payload);
      });
    } catch (error) {
      console.error('[MessageBus] 连接后台失败:', error);
    }
  }

  /**
   * 订阅消息
   */
  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  /**
   * 取消订阅
   */
  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * 发送消息（本地处理）
   */
  emit(type: string, payload?: any) {
    this.dispatch(type, payload);
  }

  private dispatch(type: string, payload: any) {
    this.handlers.get(type)?.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[MessageBus] 处理消息 ${type} 时出错:`, error);
      }
    });
  }

  /**
   * 发送消息到Background Script
   */
  sendToBackground(type: string, payload?: any) {
    if (this.backgroundPort) {
      this.backgroundPort.postMessage({ type, payload });
    } else {
      // 备用：使用runtime.sendMessage
      chrome.runtime.sendMessage({ type, payload });
    }
  }
}

// 导出单例
export const messageBus = new MessageBus();
