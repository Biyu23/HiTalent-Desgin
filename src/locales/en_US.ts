import type { HtdLocale } from './type';

const en_US = {
  locale: 'en-US',
  direction: 'ltr' as const,
  Button: {
    loading: 'Loading',
  },
  ResponsiveButtonGroup: {
    more: 'More',
  },
  Drawer: {
    restore: 'Restore',
    close: 'Close',
  },
  PopoverSelect: {
    placeholder: 'Please select',
    selectAll: 'Select All',
    clearAll: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noMatch: 'No matching results',
    noData: 'No data',
    searchPlaceholder: 'Search',
    dragHandle: 'Drag to reorder',
  },
  Modal: {
    restore: 'Restore',
    close: 'Close',
  },
  Table: {
    columnSetting: 'Column Setting',
    save: 'Save',
    cancel: 'Cancel',
    dragHandle: 'Drag to reorder',
    emptyText: '-',
    yes: 'Yes',
    no: 'No',
  },
  NumberRangeInput: {
    min: 'Minimum',
    max: 'Maximum',
  },
  SearchForm: {
    searchCriteria: 'Search Criteria',
    quickFilters: 'Quick Filters',
    basicInfo: 'Basic Information',
    search: 'Search',
    reset: 'Reset',
    clearAll: 'Clear All',
    activeFilters: 'Active Filters',
    expand: 'Expand More',
    collapse: 'Collapse',
    advancedSearch: 'Advanced Search',
    confirm: 'Confirm',
    cancel: 'Cancel',
    clear: 'Clear',
    selectedCount: (count: number) => `${count} selected`,
    itemsSummary: (count: number) => `etc. ${count} items`,
  },
} as const satisfies HtdLocale;

export default en_US;
