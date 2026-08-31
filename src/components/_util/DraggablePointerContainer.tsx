import React, { useCallback, useRef } from 'react';

export interface DraggablePointerContainerProps {
  disabled?: boolean;
  position?: { x: number; y: number };
  onStart?: (
    event: React.PointerEvent<HTMLDivElement>,
    data: { x: number; y: number },
  ) => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onStop?: (
    event: React.PointerEvent<HTMLDivElement>,
    data: { x: number; y: number },
  ) => void;
  bounds?: { left: number; top: number; right: number; bottom: number };
  handle?: string;
  cancel?: string;
  nodeRef?: React.RefObject<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
  onBlurCapture?: React.FocusEventHandler<HTMLDivElement>;
  'data-dragging'?: string;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  lastX: number;
  lastY: number;
}

export const DraggablePointerContainer: React.FC<
  DraggablePointerContainerProps
> = ({
  disabled = false,
  position = { x: 0, y: 0 },
  onStart,
  onDrag,
  onStop,
  bounds,
  handle,
  cancel = '[data-modal-no-drag], button, a, input, textarea, select, [contenteditable]',
  nodeRef,
  className,
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
  'data-dragging': dataDragging,
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const containerRef = nodeRef || localRef;
  const draggingRef = useRef<DragState | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0 || draggingRef.current) return;

      const target = event.target as HTMLElement;
      if (cancel && target.closest(cancel)) return;
      if (handle && !target.closest(handle)) return;

      const container = containerRef.current;
      if (!container) return;

      if (typeof container.setPointerCapture === 'function') {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // 部分测试环境或非标准 DOM 不支持 pointer capture。
        }
      }

      draggingRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
        lastX: position.x,
        lastY: position.y,
      };

      onStart?.(event, { x: position.x, y: position.y });
      event.stopPropagation();
    },
    [cancel, containerRef, disabled, handle, onStart, position.x, position.y],
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

      state.lastX = nextX;
      state.lastY = nextY;
      onDrag?.({ x: nextX, y: nextY });
    },
    [bounds, onDrag],
  );

  const finishDrag = useCallback(
    (
      event: React.PointerEvent<HTMLDivElement>,
      releasePointerCapture: boolean,
    ) => {
      const state = draggingRef.current;
      if (!state || state.pointerId !== event.pointerId) return;

      draggingRef.current = null;
      const container = containerRef.current;
      if (
        releasePointerCapture &&
        container &&
        typeof container.hasPointerCapture === 'function' &&
        typeof container.releasePointerCapture === 'function'
      ) {
        try {
          if (container.hasPointerCapture(event.pointerId)) {
            container.releasePointerCapture(event.pointerId);
          }
        } catch {
          // pointer capture 可能已由浏览器自动释放。
        }
      }

      onStop?.(event, { x: state.lastX, y: state.lastY });
    },
    [containerRef, onStop],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event, true);
    },
    [finishDrag],
  );

  const handleLostPointerCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(event, false);
    },
    [finishDrag],
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
      onLostPointerCapture={handleLostPointerCapture}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      {children}
    </div>
  );
};

export default DraggablePointerContainer;
