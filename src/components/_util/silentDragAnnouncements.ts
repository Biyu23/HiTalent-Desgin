import type { DndContextProps } from '@dnd-kit/core';

const silent = () => undefined;

// 省略此配置会恢复 dnd-kit 默认的读屏操作指引。
// 保留默认的焦点恢复行为，避免影响键盘拖拽。
export const silentDragAnnouncements: DndContextProps['accessibility'] = {
  screenReaderInstructions: { draggable: '' },
  announcements: {
    onDragStart: silent,
    onDragMove: silent,
    onDragOver: silent,
    onDragEnd: silent,
    onDragCancel: silent,
  },
};
