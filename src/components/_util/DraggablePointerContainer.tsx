import React, { useCallback, useRef } from 'react';

export interface DraggablePointerContainerProps {
  disabled?: boolean;
  position?: { x: number; y: number };
  onDrag?: (position: { x: number; y: number }) => void;
  bounds?: { left: number; top: number; right: number; bottom: number };
  handle?: string;
  cancel?: string;
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'data-dragging'?: string;
}

export const DraggablePointerContainer: React.FC<
  DraggablePointerContainerProps
> = ({
  disabled = false,
  position = { x: 0, y: 0 },
  onDrag,
  bounds,
  handle,
  cancel = '[data-modal-no-drag], button, a, input, textarea, select, [contenteditable]',
  nodeRef,
  className,
  style,
  children,
  'data-dragging': dataDragging,
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = nodeRef || localRef;

  const draggingRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;

      const target = event.target as HTMLElement;
      if (cancel && target.closest(cancel)) return;
      if (handle && !target.closest(handle)) return;

      const container = containerRef.current;
      if (!container) return;

      try {
        container.setPointerCapture(event.pointerId);
      } catch {
        // 部分测试环境或非标准DOM忽略异常
      }

      draggingRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
      };

      event.stopPropagation();
    },
    [cancel, containerRef, disabled, handle, position.x, position.y],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = draggingRef.current;
      if (!state || state.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      let nextX = state.originX + deltaX;
      let nextY = state.originY + deltaY;

      if (bounds) {
        nextX = Math.max(bounds.left, Math.min(bounds.right, nextX));
        nextY = Math.max(bounds.top, Math.min(bounds.bottom, nextY));
      }

      onDrag?.({ x: nextX, y: nextY });
    },
    [bounds, onDrag],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const state = draggingRef.current;
      if (!state || state.pointerId !== event.pointerId) return;

      const container = containerRef.current;
      if (container && container.hasPointerCapture(event.pointerId)) {
        try {
          container.releasePointerCapture(event.pointerId);
        } catch {
          // ignore
        }
      }

      draggingRef.current = null;
    },
    [containerRef],
  );

  const transformStyle: React.CSSProperties = {
    ...style,
    transform:
      position.x !== 0 || position.y !== 0
        ? `translate(${position.x}px, ${position.y}px)`
        : style?.transform,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={transformStyle}
      data-dragging={dataDragging}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
};

export default DraggablePointerContainer;
