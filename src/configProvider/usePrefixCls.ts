import { useContext } from 'react';
import { ConfigContext } from './context';

/**
 * 获取组件类名前缀的 Hook
 * @param componentName 组件自身的名称，例如 'btn', 'modal'
 * @param customPrefix 允许组件级别覆盖的特殊前缀 (极少用到)
 */
export const usePrefixCls = (
  componentName?: string,
  customPrefix?: string,
): string => {
  const { prefixCls: contextPrefix } = useContext(ConfigContext);

  // 优先级：组件级自定义 > 全局 Context 配置 > 默认后备配置
  const prefix = customPrefix || contextPrefix || 'htd';

  // 如果传了具体组件名，返回拼接结果，比如 'htd-btn'
  return componentName ? `${prefix}-${componentName}` : prefix;
};
