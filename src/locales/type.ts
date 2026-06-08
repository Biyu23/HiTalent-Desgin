/** PopoverSelect 组件的国际化文案 */
export interface PopoverSelectLocale {
  placeholder: string;
  selectAll: string;
  clearAll: string;
  cancel: string;
  confirm: string;
  noMatch: string;
  searchPlaceholder: string;
}

/** Modal 组件的国际化文案 */
export interface ModalLocale {
  restore: string;
  minimize: string;
  maximize: string;
  unmaximize: string;
  close: string;
}

/**
 * HiTalent Design 完整语言包接口
 * 每新增一个有国际化需求的组件，在此追加对应的 locale 子接口
 */
export interface HtdLocale {
  /** 语言标识，如 'zh-CN'、'en-US' */
  locale: string;
  /** PopoverSelect 气泡选择 */
  PopoverSelect: PopoverSelectLocale;
  /** Modal 弹窗 */
  Modal: ModalLocale;
}

/**
 * 深度 Partial 工具类型
 * 允许传入自定义语言包时仅覆盖部分字段，未覆盖的字段从默认语言包 fallback
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * 组件名称到对应 locale 类型的映射
 * componentName → locale interface
 */
export interface LocaleComponentMap {
  PopoverSelect: PopoverSelectLocale;
  Modal: ModalLocale;
}
