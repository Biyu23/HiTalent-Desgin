// 组件
export * from './components';

// 全局配置
export {
  ConfigContext,
  ConfigProvider,
  defaultPrefixCls,
  useAntdPrefixCls,
  useConfig,
  useLocale,
  usePrefixCls,
} from './configProvider';
export type { ConfigContextValue, ConfigProviderProps } from './configProvider';

// 语言包
export { en_US, zh_CN } from './locales';
export type {
  ButtonLocale,
  DrawerLocale,
  EditableFieldLocale,
  HtdLocale,
  LocaleComponentMap,
  LocaleDirection,
  LocaleOverrides,
  ModalLocale,
  NumberRangeInputLocale,
  PopoverSelectLocale,
  ResponsiveButtonGroupLocale,
  SearchFormLocale,
  TableLocale,
} from './locales';

// 类型
export type {
  CSSPropertiesWithVars,
  CSSVariableName,
  DeepPartial,
  NativeProps,
} from './types';
