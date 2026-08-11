/**
 * Demo 国际化轻量工具。
 *
 * 设计理念：
 * - 零外部依赖，纯运行时方案
 * - 通过 `window.location.pathname` 推断当前 dumi 站点语言
 * - 每个 demo 只需声明自己的 messages 对象，调用 `t('key')` 即可
 * - `zh-CN` 的值即为 fallback，无需重复写 defaultMessage
 *
 * @example
 * ```tsx
 * const { t } = useDemoIntl({
 *   'zh-CN': { 'btn.submit': '提交' },
 *   'en-US': { 'btn.submit': 'Submit' },
 * });
 * <Button>{t('btn.submit')}</Button>
 * ```
 */
import { useMemo } from 'react';

export type DemoMessages = Record<string, Record<string, string>>;

/** 从 URL pathname 推断当前 dumi 站点语言 */
export function getDemoLocale(): string {
  if (typeof window === 'undefined') return 'zh-CN';
  const seg = window.location.pathname.split('/')[1] || '';
  return seg === 'en-US' ? 'en-US' : 'zh-CN';
}

export function useDemoIntl<T extends DemoMessages>(messages: T) {
  const locale = getDemoLocale();

  const t = useMemo(() => {
    return (id: keyof T['zh-CN'] & keyof T['en-US'] & string): string => {
      return messages[locale]?.[id] ?? messages['zh-CN'][id] ?? id;
    };
  }, [locale, messages]);

  return { t, locale };
}
