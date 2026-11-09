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
  captureTarget: HTMLElement;
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

      // 保留原始点击目标，避免标题栏双击被重定向到拖拽容器。
      target.setPointerCapture(event.pointerId);

      draggingRef.current = {
        pointerId: event.pointerId,
        captureTarget: target,
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
    [cancel, disabled, handle, onStart, position.x, position.y],
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
      if (
        releasePointerCapture &&
        state.captureTarget.hasPointerCapture(event.pointerId)
      ) {
        state.captureTarget.releasePointerCapture(event.pointerId);
      }

      onStop?.(event, { x: state.lastX, y: state.lastY });
    },
    [onStop],
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
