import { ConfigProvider as AntdConfigProvider } from 'antd';
import { useContext } from 'react';
import { isNullOrBlank } from '../utils';
import { ConfigContext } from './context';

/**
 * 获取 HiTalent Design 组件类名前缀 Hook
 *
 * 遵循 Ant Design 5 标准规范：
 * - 若显式传入了 customPrefix 则优先使用；
 * - 否则拼接 `${rootPrefixCls}-${suffixCls}`（默认前缀为 'htd'）；
 * - 适合与 clsx 配合生成简洁标准的 CSS 类名。
 *
 * @param suffixCls 组件后缀名，如 'modal', 'drawer', 'table', 'button'
 * @param customPrefix 显式自定义前缀
 * @returns 完整的 class 前缀字符串，例如 'htd-modal'
 */
export const usePrefixCls = (
  suffixCls?: string,
  customPrefix?: string,
): string => {
  const { getPrefixCls } = useContext(ConfigContext);
  return getPrefixCls(suffixCls, customPrefix);
};

/**
 * 获取底层 Ant Design 组件类名前缀 Hook
 *
 * 优先级：显式传入 customAntdPrefix > 最近的 Antd ConfigContext。
 *
 * @param customAntdPrefix 显式自定义的 Ant Design 前缀
 * @returns 完整的 Ant Design class 前缀字符串，默认为 'ant'
 */
export const useAntdPrefixCls = (customAntdPrefix?: string): string => {
  const antdGlobalConfig = useContext(AntdConfigProvider.ConfigContext);

  if (!isNullOrBlank(customAntdPrefix)) {
    return customAntdPrefix;
  }
  return antdGlobalConfig.getPrefixCls();
};
