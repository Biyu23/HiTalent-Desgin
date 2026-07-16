// Components
export { default as Button } from './components/Button';
export type { ButtonProps } from './components/Button/type';

export { default as Modal } from './components/Modal';
export type {
  MinimizePosition,
  ModalProps,
  ModalRef,
  ModalStaticMethods,
} from './components/Modal/type';

export { default as PopoverSelect } from './components/PopoverSelect';
export type { PopoverSelectProps } from './components/PopoverSelect/type';

export { default as Table } from './components/Table';
export type {
  CellPresetType,
  EditComponentProps,
  EnhancedColumnType,
  ProgressPresetProps,
  RowDragResult,
  TableProps,
  TableRef,
  TagPresetProps,
} from './components/Table/type';

// ConfigProvider
export { ConfigProvider } from './configProvider';
export type { ConfigProviderProps } from './configProvider';

// Hooks
export { useDragBounds, useFieldNames, useMergeState } from './hooks';

// Locales
export { createHtdLocale, en_US, localeMap, zh_CN } from './locales';
export type {
  ButtonLocale,
  DeepPartial,
  HtdLocale,
  LocaleComponentMap,
  ModalLocale,
  PopoverSelectLocale,
  SupportedLocale,
  TableLocale,
} from './locales';
