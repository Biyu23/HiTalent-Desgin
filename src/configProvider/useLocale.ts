import { useContext } from 'react';
import type { HtdLocale, LocaleComponentMap } from '../locales';
import { localeMap, zh_CN } from '../locales';
import { ConfigContext } from './context';

/**
 * 获取当前组件对应的国际化文案
 *
 * 优先级：
 * 1. 用户通过 ConfigProvider 传入的自定义 locale 对象（支持 DeepPartial）
 * 2. 内置语言包字符串映射（'zh-CN' → zh_CN 全量对象）
 * 3. 默认中文包 fallback
 *
 * @param componentName 组件名称（如 'PopoverSelect'），必须匹配 HtdLocale 的 key
 */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
): LocaleComponentMap[K] => {
  const context = useContext(ConfigContext);
  const locale = context?.locale || zh_CN;

  // 如果是字符串，从内置 map 查找
  if (typeof locale === 'string') {
    const fullLocale: HtdLocale = localeMap[locale] || zh_CN;
    return fullLocale[componentName] || {};
  }

  // 用户传入的自定义 DeepPartial 对象：以默认中文包为基础，浅层合并覆盖
  const defaultLocale = zh_CN as HtdLocale;
  const componentDefaults = defaultLocale[componentName] || {};
  const componentOverrides = locale[componentName] || {};

  return {
    ...componentDefaults,
    ...componentOverrides,
  } as LocaleComponentMap[K];
};
