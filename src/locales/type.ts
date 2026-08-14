import type { DeepPartial } from '../types';

export type { DeepPartial } from '../types';

/** PopoverSelect 组件的国际化文案 */
export interface PopoverSelectLocale {
  placeholder: string;
  selectAll: string;
  clearAll: string;
  cancel: string;
  confirm: string;
  noMatch: string;
  noData: string;
  searchPlaceholder: string;
}

/** ResponsiveButtonGroup 组件的国际化文案 */
export interface ResponsiveButtonGroupLocale {
  more: string;
  moreActions: (count: number) => string;
}

/** Button 组件的国际化文案 */
export interface ButtonLocale {
  /** loading 状态的 aria-label，屏幕阅读器专用 */
  loading: string;
}

/** Drawer 组件的国际化文案 */
export interface DrawerLocale {
  /** 左侧 Drawer 右边缘的缩放把手 */
  resizeLeft: string;
  /** 右侧 Drawer 左边缘的缩放把手 */
  resizeRight: string;
  /** 顶部 Drawer 下边缘的缩放把手 */
  resizeTop: string;
  /** 底部 Drawer 上边缘的缩放把手 */
  resizeBottom: string;
  minimize: string;
  restore: string;
  close: string;
  /** 最小化 Drawer 卡片 */
  minimizedDockLabel: string;
  /** 最小化 Drawer 卡片拖拽把手 */
  minimizedDockDragHandle: string;
}

/** Modal 组件的国际化文案 */
export interface ModalLocale {
  restore: string;
  minimize: string;
  maximize: string;
  unmaximize: string;
  close: string;
  /** 拖拽把手（屏幕阅读器 aria-label） */
  dragHandle: string;
  /** 右下角缩放把手（屏幕阅读器 aria-label） */
  resizeBottomRight: string;
  /** 标题栏（屏幕阅读器 aria-label，role="button" 时的描述） */
  headerTitle: string;
  /** 最小化悬浮窗容器（屏幕阅读器 aria-label） */
  minimizedDockLabel: string;
  /** 最小化悬浮窗拖拽把手（屏幕阅读器 aria-label） */
  minimizedDockDragHandle: string;
}

/** Table 组件的国际化文案 */
export interface TableLocale {
  /** 列设置标题 */
  columnSetting: string;
  /** 保存 */
  save: string;
  /** 取消 */
  cancel: string;
  /** 拖拽手柄 aria-label */
  dragHandle: string;
  /** 列宽调整手柄 aria-label */
  resizeHandle: string;
  /** 空值占位文本 */
  emptyText: string;
  /** 是 */
  yes: string;
  /** 否 */
  no: string;
}

/** 文字方向 */
export type LocaleDirection = 'ltr' | 'rtl';

/** 组件名称到对应 locale 类型的映射 */
export interface LocaleComponentMap {
  Button: ButtonLocale;
  Drawer: DrawerLocale;
  PopoverSelect: PopoverSelectLocale;
  ResponsiveButtonGroup: ResponsiveButtonGroupLocale;
  Modal: ModalLocale;
  Table: TableLocale;
}

/** HiTalent Design 完整语言包 */
export type HtdLocale = {
  /** 语言标识，如 'zh-CN'、'en-US' */
  locale: string;
  /** 语言方向 */
  direction: LocaleDirection;
} & LocaleComponentMap;

/** 基于完整语言包进行局部文案覆盖 */
export type LocaleOverrides = DeepPartial<LocaleComponentMap>;
