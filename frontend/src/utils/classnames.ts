import { clsx, type ClassValue } from 'clsx';

/**
 * 条件类名合并工具函数
 *
 * 功能：
 * - 统一处理条件类名的合并
 * - 支持字符串、布尔值、数字等类型的类名
 * - 自动过滤 falsy 值
 *
 * 使用示例：
 * cn('base-class') // 'base-class'
 * cn('base', true && 'active') // 'base active'
 * cn('base', condition ? 'yes' : 'no') // 'base yes' 或 'base no'
 * cn('base', false && 'hidden') // 'base'
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
