import { useContext } from 'react';
import { zh_CN } from '../locales';
import { ConfigContext } from './context';

//获取全局的语言包
export const useLocale = (componentName: string) => {
  const context = useContext(ConfigContext);
  const localeData = context?.locale || zh_CN;
  return localeData[componentName] || {};
};
