import type { MyUILocale } from './type';

const en_US = {
  locale: 'en-US',
  PopoverSelect: {
    placeholder: 'Please select',
    selectAll: 'Select All',
    clearAll: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    noMatch: 'No matching results',
    searchPlaceholder: 'Search',
  },
} as const satisfies MyUILocale;

export default en_US;
