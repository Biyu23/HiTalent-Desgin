import en_US from './en_US';
import zh_CN from './zh_CN';

export { en_US, zh_CN };

export const localeMap: Record<string, Record<string, any>> = {
  'zh-CN': zh_CN,
  'en-US': en_US,
};
