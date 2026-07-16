import { en_US } from './index';
import type { HtdLocale } from './type';

/**
 * 与 react-i18next 的 `TFunction` 兼容的翻译函数签名。
 * 任何满足 `(key: string, defaultValue?: string) => string` 的函数均可传入。
 *
 * 兼容范围：
 * - react-i18next: `useTranslation().t`
 * - react-intl:   使用 `(id, defaultMessage) => intl.formatMessage({ id, defaultMessage })` 包装函数
 * - 自定义实现:    任意满足签名的函数
 */
export type TFunctionCompat = (key: string, defaultValue?: string) => string;

export interface CreateHtdLocaleOptions {
  /**
   * i18next key 前缀（namespace）。
   *
   * @example
   * ```ts
   * createHtdLocale(t, { keyPrefix: 'htd' })
   * // 生成 t('htd.PopoverSelect.placeholder', '请选择')
   * ```
   *
   * 不传则 key 平铺，适用于将翻译文本直接挂载在顶层 namespace。
   */
  keyPrefix?: string;

  /**
   * 当前语言标识符，用于 RTL 检测和日志记录。
   * @default 'custom'
   */
  locale?: string;

  /**
   * 文字方向。
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';

  /**
   * t() 查不到对应 key 时的后备语言包。
   * 默认使用 en_US，避免中文环境下出现英文 fallback。
   * @default en_US
   */
  fallbackLocale?: HtdLocale;
}

/**
 * 创建 Htd 语言包适配器，桥接 react-i18next 的 `TFunction`。
 *
 * —— 零依赖、类型安全、开箱即用。
 *
 * ## 工作原理
 *
 * 返回一个与 `HtdLocale` 结构完全一致的普通对象，但每个叶子节点的值是
 * 通过 `t(key, fallback)` 动态获取的字符串。
 *
 * 消费方通常配合 `useMemo` 使用，确保 `t` 引用变化时（语言切换）locale 同步刷新：
 *
 * @example
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * import { createHtdLocale } from 'hi-talent-design';
 * import { ConfigProvider } from 'hi-talent-design';
 *
 * function App() {
 *   const { t } = useTranslation();
 *
 *   const htdLocale = useMemo(
 *     () => createHtdLocale(t, { keyPrefix: 'htd' }),
 *     [t],
 *   );
 *
 *   return (
 *     <ConfigProvider locale={htdLocale}>
 *       <YourApp />
 *     </ConfigProvider>
 *   );
 * }
 * ```
 *
 * ## i18next 资源配置建议
 *
 * 在项目的 i18next JSON 资源中按此结构配置 key：
 *
 * ```json
 * {
 *   "htd": {
 *     "PopoverSelect": {
 *       "placeholder": "Please select",
 *       "selectAll": "Select All",
 *       "clearAll": "Clear",
 *       "cancel": "Cancel",
 *       "confirm": "Confirm",
 *       "noMatch": "No matching results",
 *       "searchPlaceholder": "Search"
 *     }
 *   }
 * }
 * ```
 *
 * @param t   翻译函数，必须满足 `(key, defaultValue?) => string` 签名
 * @param options 可选配置
 * @returns 完整的 locale 对象，可直接传入 `ConfigProvider`
 */
export function createHtdLocale(
  t: TFunctionCompat,
  options?: CreateHtdLocaleOptions,
): HtdLocale {
  const pfx = options?.keyPrefix ? `${options.keyPrefix}.` : '';
  const fallback = options?.fallbackLocale || en_US;

  return {
    locale: options?.locale || 'custom',
    direction: options?.direction || 'ltr',
    Button: {
      loading: t(`${pfx}Button.loading`, fallback.Button.loading),
    },
    PopoverSelect: {
      placeholder: t(
        `${pfx}PopoverSelect.placeholder`,
        fallback.PopoverSelect.placeholder,
      ),
      selectAll: t(
        `${pfx}PopoverSelect.selectAll`,
        fallback.PopoverSelect.selectAll,
      ),
      clearAll: t(
        `${pfx}PopoverSelect.clearAll`,
        fallback.PopoverSelect.clearAll,
      ),
      cancel: t(`${pfx}PopoverSelect.cancel`, fallback.PopoverSelect.cancel),
      confirm: t(`${pfx}PopoverSelect.confirm`, fallback.PopoverSelect.confirm),
      noMatch: t(`${pfx}PopoverSelect.noMatch`, fallback.PopoverSelect.noMatch),
      noData: t(`${pfx}PopoverSelect.noData`, fallback.PopoverSelect.noData),
      searchPlaceholder: t(
        `${pfx}PopoverSelect.searchPlaceholder`,
        fallback.PopoverSelect.searchPlaceholder,
      ),
    },
    Modal: {
      restore: t(`${pfx}Modal.restore`, fallback.Modal.restore),
      minimize: t(`${pfx}Modal.minimize`, fallback.Modal.minimize),
      maximize: t(`${pfx}Modal.maximize`, fallback.Modal.maximize),
      unmaximize: t(`${pfx}Modal.unmaximize`, fallback.Modal.unmaximize),
      close: t(`${pfx}Modal.close`, fallback.Modal.close),
      dragHandle: t(`${pfx}Modal.dragHandle`, fallback.Modal.dragHandle),
      headerTitle: t(`${pfx}Modal.headerTitle`, fallback.Modal.headerTitle),
      minimizedDockLabel: t(
        `${pfx}Modal.minimizedDockLabel`,
        fallback.Modal.minimizedDockLabel,
      ),
      minimizedDockDragHandle: t(
        `${pfx}Modal.minimizedDockDragHandle`,
        fallback.Modal.minimizedDockDragHandle,
      ),
    },
  };
}
