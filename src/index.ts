// Components
export * from './components';

// ConfigProvider
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

// Locales
export { en_US, zh_CN } from './locales';
export type {
  ButtonLocale,
  DeepPartial,
  DrawerLocale,
  HtdLocale,
  LocaleComponentMap,
  LocaleDirection,
  LocaleOverrides,
  ModalLocale,
  PopoverSelectLocale,
  ResponsiveButtonGroupLocale,
  TableLocale,
} from './locales';

// Types
export type {
  CSSPropertiesWithVars,
  CSSVariableName,
  NativeProps,
} from './types';
