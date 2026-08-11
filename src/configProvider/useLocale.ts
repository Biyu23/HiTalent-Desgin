import { useContext } from 'react';
import type { LocaleComponentMap } from '../locales';
import { ConfigContext } from './context';

/** 获取当前组件对应的完整国际化文案。 */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
): LocaleComponentMap[K] => {
  const { locale } = useContext(ConfigContext);

  return locale[componentName];
};
