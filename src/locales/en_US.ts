import type { HtdLocale } from './type';

const en_US = {
  locale: 'en-US',
  direction: 'ltr' as const,
  Button: {
    loading: 'Loading',
  },
  PopoverSelect: {
    placeholder: 'Please select',
    selectAll: 'Select All',
    clearAll: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noMatch: 'No matching results',
    searchPlaceholder: 'Search',
  },
  Modal: {
    restore: 'Restore',
    minimize: 'Minimize',
    maximize: 'Maximize',
    unmaximize: 'Restore',
    close: 'Close',
  },
} as const satisfies HtdLocale;

export default en_US;
