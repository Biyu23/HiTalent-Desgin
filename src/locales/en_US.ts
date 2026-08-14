import type { HtdLocale } from './type';

const en_US = {
  locale: 'en-US',
  direction: 'ltr' as const,
  Button: {
    loading: 'Loading',
  },
  ResponsiveButtonGroup: {
    more: 'More',
    moreActions: (count: number) =>
      `${count} more action${count === 1 ? '' : 's'}`,
  },
  Drawer: {
    resizeLeft: 'Drag the right edge to resize the left drawer',
    resizeRight: 'Drag the left edge to resize the right drawer',
    resizeTop: 'Drag the bottom edge to resize the top drawer',
    resizeBottom: 'Drag the top edge to resize the bottom drawer',
    minimize: 'Minimize',
    restore: 'Restore',
    close: 'Close',
    minimizedDockLabel: 'Minimized drawer dock',
    minimizedDockDragHandle: 'Drag to reposition',
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
  },
  Modal: {
    restore: 'Restore',
    minimize: 'Minimize',
    maximize: 'Maximize',
    unmaximize: 'Restore',
    close: 'Close',
    dragHandle: 'Drag',
    resizeBottomRight: 'Resize dialog from the bottom-right corner',
    headerTitle: 'Dialog header',
    minimizedDockLabel: 'Minimized dialog dock',
    minimizedDockDragHandle: 'Drag to reposition',
  },
  Table: {
    columnSetting: 'Column Setting',
    save: 'Save',
    cancel: 'Cancel',
    dragHandle: 'Drag to reorder',
    resizeHandle: 'Resize column',
    emptyText: '-',
    yes: 'Yes',
    no: 'No',
  },
} as const satisfies HtdLocale;

export default en_US;
