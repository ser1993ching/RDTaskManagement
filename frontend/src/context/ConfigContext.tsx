/**
 * 全局配置缓存 Context
 * 提供配置数据的全局状态管理和主动刷新功能
 */
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiDataService } from '../services/apiDataService';
import type { TaskClass } from '../types';

// 配置数据类型
export interface ConfigData {
  taskCategories: Record<string, string[]>;
  equipmentModels: string[];
  capacityLevels: string[];
  travelLabels: string[];
  taskClasses: TaskClass[];
}

// 初始空数据
const initialConfigData: ConfigData = {
  taskCategories: {},
  equipmentModels: [],
  capacityLevels: [],
  travelLabels: [],
  taskClasses: [],
};

// Context 类型
interface ConfigContextType extends ConfigData {
  isLoading: boolean;
  error: string | null;
  refreshConfig: () => Promise<void>;
  refreshTaskClasses: () => Promise<void>;
  refreshTaskCategories: () => Promise<void>;
  refreshEquipmentModels: () => Promise<void>;
  refreshCapacityLevels: () => Promise<void>;
  refreshTravelLabels: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// 静态变量用于跨组件共享数据
let globalConfigData: ConfigData = { ...initialConfigData };
let isInitialLoadComplete = false;
let isLoadingRef = false;

// Provider 组件
export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ConfigData>({ ...globalConfigData });
  const [isLoading, setIsLoading] = useState(!isInitialLoadComplete);
  const [error, setError] = useState<string | null>(null);

  // 加载所有配置数据
  const loadAllConfig = useCallback(async () => {
    // 防止重复加载
    if (isLoadingRef || (isInitialLoadComplete && globalConfigData.taskClasses.length > 0)) {
      return;
    }

    isLoadingRef = true;
    setIsLoading(true);
    setError(null);

    try {
      // 并行加载所有配置
      const [categories, models, levels, labels, classes] = await Promise.all([
        apiDataService.getTaskCategories(),
        apiDataService.getEquipmentModels(),
        apiDataService.getCapacityLevels(),
        apiDataService.getTravelLabels(),
        apiDataService.getTaskClasses(),
      ]);

      const newConfig: ConfigData = {
        taskCategories: categories as Record<string, string[]>,
        equipmentModels: models as string[],
        capacityLevels: levels as string[],
        travelLabels: labels as string[],
        taskClasses: classes as TaskClass[],
      };

      // 更新静态变量和状态
      globalConfigData = newConfig;
      isInitialLoadComplete = true;
      setConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载配置数据失败');
      console.error('加载配置数据失败:', err);
    } finally {
      isLoadingRef = false;
      setIsLoading(false);
    }
  }, []);

  // 初始化加载（只执行一次）
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllConfig();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAllConfig]);

  // 刷新所有配置（强制从API重新获取）
  const refreshConfig = useCallback(async () => {
    // 防止重复刷新
    if (isLoadingRef) return;

    isLoadingRef = true;
    setIsLoading(true);
    try {
      const [categories, models, levels, labels, classes] = await Promise.all([
        apiDataService.getTaskCategories(),
        apiDataService.getEquipmentModels(),
        apiDataService.getCapacityLevels(),
        apiDataService.getTravelLabels(),
        apiDataService.getTaskClasses(),
      ]);

      const newConfig: ConfigData = {
        taskCategories: categories as Record<string, string[]>,
        equipmentModels: models as string[],
        capacityLevels: levels as string[],
        travelLabels: labels as string[],
        taskClasses: classes as TaskClass[],
      };

      globalConfigData = newConfig;
      isInitialLoadComplete = true;
      setConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新配置数据失败');
      console.error('刷新配置数据失败:', err);
    } finally {
      isLoadingRef = false;
      setIsLoading(false);
    }
  }, []);

  // 单独刷新任务分类
  const refreshTaskClasses = useCallback(async () => {
    const classes = await apiDataService.getTaskClasses();
    const newConfig = { ...globalConfigData, taskClasses: classes as TaskClass[] };
    globalConfigData = newConfig;
    setConfig(newConfig);
  }, []);

  // 单独刷新任务分类配置
  const refreshTaskCategories = useCallback(async () => {
    const categories = await apiDataService.getTaskCategories();
    const newConfig = { ...globalConfigData, taskCategories: categories as Record<string, string[]> };
    globalConfigData = newConfig;
    setConfig(newConfig);
  }, []);

  // 单独刷新设备型号
  const refreshEquipmentModels = useCallback(async () => {
    const models = await apiDataService.getEquipmentModels();
    const newConfig = { ...globalConfigData, equipmentModels: models as string[] };
    globalConfigData = newConfig;
    setConfig(newConfig);
  }, []);

  // 单独刷新容量等级
  const refreshCapacityLevels = useCallback(async () => {
    const levels = await apiDataService.getCapacityLevels();
    const newConfig = { ...globalConfigData, capacityLevels: levels as string[] };
    globalConfigData = newConfig;
    setConfig(newConfig);
  }, []);

  // 单独刷新差旅标签
  const refreshTravelLabels = useCallback(async () => {
    const labels = await apiDataService.getTravelLabels();
    const newConfig = { ...globalConfigData, travelLabels: labels as string[] };
    globalConfigData = newConfig;
    setConfig(newConfig);
  }, []);

  const value: ConfigContextType = {
    ...config,
    isLoading,
    error,
    refreshConfig,
    refreshTaskClasses,
    refreshTaskCategories,
    refreshEquipmentModels,
    refreshCapacityLevels,
    refreshTravelLabels,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig 必须在 ConfigProvider 中使用');
  }
  return context;
};

// 便捷 Hook - 只获取特定配置（用于性能优化，避免不必要的重渲染）
export const useTaskCategories = () => {
  const { taskCategories, refreshTaskCategories, isLoading, error } = useConfig();
  return { taskCategories, refreshTaskCategories, isLoading, error };
};

export const useEquipmentModels = () => {
  const { equipmentModels, refreshEquipmentModels, isLoading, error } = useConfig();
  return { equipmentModels, refreshEquipmentModels, isLoading, error };
};

export const useCapacityLevels = () => {
  const { capacityLevels, refreshCapacityLevels, isLoading, error } = useConfig();
  return { capacityLevels, refreshCapacityLevels, isLoading, error };
};

export const useTravelLabels = () => {
  const { travelLabels, refreshTravelLabels, isLoading, error } = useConfig();
  return { travelLabels, refreshTravelLabels, isLoading, error };
};

export const useTaskClasses = () => {
  const { taskClasses, refreshTaskClasses, isLoading, error } = useConfig();
  return { taskClasses, refreshTaskClasses, isLoading, error };
};
