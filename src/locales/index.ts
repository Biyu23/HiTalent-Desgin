import en_Us from './en_Us';
import zh_CN from './zh_Cn';

export { en_Us, zh_CN };

export const localeMap: Record<string, Record<string, any>> = {
  'zh-CN': zh_CN,
  'en-US': en_Us,
};
