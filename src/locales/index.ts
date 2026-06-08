import type { DeepPartial, HtdLocale } from './type';

export { createHtdLocale } from './adapter';
export type {
  DeepPartial,
  HtdLocale,
  LocaleComponentMap,
  ModalLocale,
  PopoverSelectLocale,
} from './type';

import en_US from './en_US';
import zh_CN from './zh_CN';

export { en_US, zh_CN };

/** 内置语言包映射表 */
export const localeMap: Record<string, HtdLocale> = {
  'zh-CN': zh_CN,
  'en-US': en_US,
};

/**
 * 支持的区域类型
 * 可通过联合类型扩展：'zh-CN' | 'en-US' | 'ja-JP'
 */
export type SupportedLocale = keyof typeof localeMap;

/**
 * ConfigProvider 可接收的 locale 参数类型
 * - 字符串：内置语言标识符
 * - 对象：自定义 DeepPartial 语言包（只需覆盖需要定制的字段）
 */
export type LocaleProp = SupportedLocale | DeepPartial<HtdLocale>;
