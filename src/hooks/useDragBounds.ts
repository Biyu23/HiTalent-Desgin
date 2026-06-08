import { useCallback, useRef, useState } from 'react';
import type { DraggableBounds, DraggableProps } from 'react-draggable';

interface UseDragBoundsReturn {
  dragRef: React.RefObject<HTMLDivElement>;
  bounds: DraggableBounds;
  onStart: DraggableProps['onStart'];
}

const useDragBounds = (): UseDragBoundsReturn => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<DraggableBounds>({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });

  const onStart: DraggableProps['onStart'] = useCallback((_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = dragRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  }, []);

  return { dragRef, bounds, onStart };
};

export default useDragBounds;
