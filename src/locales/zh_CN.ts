import type { HtdLocale } from './type';

const zh_CN = {
  locale: 'zh-CN',
  direction: 'ltr' as const,
  Button: {
    loading: '加载中',
  },
  ResponsiveButtonGroup: {
    more: '更多',
  },
  Drawer: {
    restore: '还原',
    close: '关闭',
  },
  PopoverSelect: {
    placeholder: '请选择',
    selectAll: '全选',
    clearAll: '清空',
    cancel: '取消',
    confirm: '确定',
    noMatch: '无匹配结果',
    noData: '暂无数据',
    searchPlaceholder: '搜索',
    dragHandle: '拖拽排序',
  },
  Modal: {
    restore: '还原',
    close: '关闭',
  },
  Table: {
    columnSetting: '列设置',
    save: '保存',
    cancel: '取消',
    dragHandle: '排序',
    emptyText: '-',
    yes: '是',
    no: '否',
  },
  NumberRangeInput: {
    min: '最小值',
    max: '最大值',
  },
  SearchForm: {
    searchCriteria: '搜索条件',
    quickFilters: '快捷筛选',
    basicInfo: '基础信息',
    search: '搜索',
    reset: '重置',
    clearAll: '清空全部',
    activeFilters: '已选条件',
    expand: '展开更多',
    collapse: '收起',
    advancedSearch: '高级筛选',
    confirm: '确定',
    cancel: '取消',
    clear: '清空',
    selectedCount: (count: number) => `已选择 ${count} 项`,
    itemsSummary: (count: number) => `等 ${count} 项`,
  },
} as const satisfies HtdLocale;

export default zh_CN;
