import type { DndContextProps } from '@dnd-kit/core';

const silent = () => undefined;

// dnd-kit enables spoken instructions and live announcements by default.
// Table uses mouse/keyboard controls without generating drag narration.
export const dragAccessibility: DndContextProps['accessibility'] = {
  screenReaderInstructions: { draggable: '' },
  announcements: {
    onDragStart: silent,
    onDragOver: silent,
    onDragEnd: silent,
    onDragCancel: silent,
  },
};
