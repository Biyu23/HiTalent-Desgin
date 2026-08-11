import { useCallback, useRef, useState } from 'react';
import type { DraggableBounds, DraggableProps } from 'react-draggable';

interface UseDragBoundsReturn {
  dragRef: React.RefObject<HTMLDivElement>;
  bounds: DraggableBounds;
  onStart: DraggableProps['onStart'];
}

/**
 * 计算拖拽节点在当前视口内的移动边界。
 *
 * measureRef 用于包装节点和实际可视节点不一致的场景，例如 Modal 的
 * react-draggable 节点包裹了 Ant Design 的定位层；不传时沿用 dragRef。
 */
const useDragBounds = (
  measureRef?: React.RefObject<HTMLElement>,
): UseDragBoundsReturn => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<DraggableBounds>({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const onStart: DraggableProps['onStart'] = useCallback(
    (_event, uiData) => {
      const { clientWidth, clientHeight } = window.document.documentElement;
      const targetRect = (
        measureRef?.current || dragRef.current
      )?.getBoundingClientRect();
      if (!targetRect) return;

      setBounds({
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y),
      });
    },
    [measureRef],
  );

  return { dragRef, bounds, onStart };
};

export default useDragBounds;
