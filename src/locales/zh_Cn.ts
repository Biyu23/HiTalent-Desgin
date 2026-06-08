import type { MyUILocale } from './type';

const zh_CN = {
  locale: 'zh-CN',
  PopoverSelect: {
    placeholder: '请选择',
    selectAll: '全选',
    clearAll: '清空',
    cancel: '取消',
    confirm: '确定',
    noMatch: '无匹配结果',
    searchPlaceholder: '搜索',
  },
} as const satisfies MyUILocale;

export default zh_CN;
