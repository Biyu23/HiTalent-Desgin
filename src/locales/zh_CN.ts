import type { HtdLocale } from './type';

const zh_CN = {
  locale: 'zh-CN',
  direction: 'ltr' as const,
  Button: {
    loading: '加载中',
  },
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
    dragHandle: '拖拽',
    headerTitle: '弹窗标题栏',
    minimizedDockLabel: '最小化弹窗悬浮窗',
    minimizedDockDragHandle: '拖拽悬浮窗',
  },
} as const satisfies HtdLocale;

export default zh_CN;
