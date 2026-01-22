/**
 * 系统健康检测服务
 * 在登录前检测后端服务和数据库连接状态
 */

export type HealthStatus = {
  backend: 'checking' | 'ok' | 'error';
  database: 'checking' | 'ok' | 'error' | 'unknown';
  error?: string;
};

const API_BASE_URL = '/api';

export const checkSystemHealth = async (): Promise<HealthStatus> => {
  const result: HealthStatus = {
    backend: 'checking',
    database: 'unknown'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      result.backend = 'error';
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    const data = await response.json();
    result.backend = 'ok';

    // 数据库状态：connected, disconnected, error
    if (data.database === 'connected') {
      result.database = 'ok';
    } else if (data.database === 'disconnected') {
      result.database = 'error';
      result.error = '数据库连接失败，请检查MySQL服务是否正常运行';
    } else if (data.database === 'error') {
      result.database = 'error';
      result.error = data.error || '数据库连接异常';
    }

  } catch (error) {
    result.backend = 'error';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        result.error = '后端服务连接超时，请检查后端是否已启动';
      } else {
        result.error = `无法连接到后端服务: ${error.message}`;
      }
    } else {
      result.error = '无法连接到后端服务';
    }
  }

  return result;
};
