import type { HtdLocale } from './type';

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
  Modal: {
    restore: '还原',
    minimize: '最小化',
    maximize: '最大化',
    unmaximize: '还原',
    close: '关闭',
  },
} as const satisfies HtdLocale;

export default zh_CN;
