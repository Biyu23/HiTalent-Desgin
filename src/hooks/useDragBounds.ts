import { useCallback, useRef, useState } from 'react';
import { DraggableProps } from 'react-draggable';

const useDragBounds = () => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({
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
