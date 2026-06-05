import { useContext } from 'react';
import { localeMap, zh_CN } from '../locales';
import { ConfigContext } from './context';

//获取全局的语言包
export const useLocale = (componentName: string) => {
  const context = useContext(ConfigContext);
  const locale = context?.locale || zh_CN;
  const localeData =
    typeof locale === 'string' ? localeMap[locale] || zh_CN : locale;
  return localeData[componentName] || {};
};
