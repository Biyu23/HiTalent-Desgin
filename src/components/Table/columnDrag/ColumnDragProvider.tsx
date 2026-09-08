import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { lockBodyInteraction } from '../../../utils/bodyInteractionLock';
import type { ColumnMeta } from '../internal';
import type { TableColumnKey } from '../type';
import { getTableViewport } from '../utils/dragPreview';
import { useColumnMotion } from './useColumnMotion';
import {
  captureColumnLayout,
  mergeVisibleColumnOrder,
  projectColumnOrder,
} from './utils';

interface ColumnDragContextValue {
  activeKey: TableColumnKey | null;
  start: (event: React.PointerEvent<HTMLElement>, key: TableColumnKey) => void;
  consumeClick: () => boolean;
}

export const ColumnDragContext = React.createContext<ColumnDragContextValue>({
  activeKey: null,
  start: () => undefined,
  consumeClick: () => false,
});

interface ColumnDragProviderProps<RecordType> {
  children: React.ReactNode;
  enabled: boolean;
  rootRef: React.RefObject<HTMLElement>;
  columns: readonly ColumnMeta<RecordType>[];
  orderedKeys: readonly TableColumnKey[];
  onPreview: (keys: readonly TableColumnKey[]) => void;
  onCommit: (keys: readonly TableColumnKey[]) => void;
  onCancel: () => void;
}

interface ActiveDrag {
  key: TableColumnKey;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  scrollLeft: number;
  lastContentX: number;
  scrollTop: number;
  rootLeft: number;
  rootTop: number;
  scroller: HTMLElement;
  order: TableColumnKey[];
  previewOrder: TableColumnKey[];
  rects: ReturnType<typeof captureColumnLayout>;
  fixedKeys: ReadonlySet<TableColumnKey>;
  activated: boolean;
  releaseBody?: () => void;
}

const ACTIVATION_DISTANCE = 4;

export default function ColumnDragProvider<RecordType>({
  children,
  enabled,
  rootRef,
  columns,
  orderedKeys,
  onPreview,
  onCommit,
  onCancel,
}: ColumnDragProviderProps<RecordType>) {
  const [activeKey, setActiveKey] = useState<TableColumnKey | null>(null);
  const [listening, setListening] = useState(false);
  const dragRef = useRef<ActiveDrag | null>(null);
  const suppressClickRef = useRef(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const scrollFrameRef = useRef<number>();
  const lastFrameRef = useRef(0);
  const {
    start: startMotion,
    move: moveMotion,
    captureLayout,
    cancel: cancelMotion,
    cancelLayout,
  } = useColumnMotion(rootRef);

  const clear = useCallback(() => {
    if (scrollFrameRef.current !== undefined)
      cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = undefined;
    lastFrameRef.current = 0;
    dragRef.current?.releaseBody?.();
    dragRef.current = null;
    cancelMotion();
    setActiveKey(null);
    setListening(false);
  }, [cancelMotion]);

  const project = useCallback(
    (drag: ActiveDrag) => {
      const startRect = drag.rects.get(drag.key);
      if (!startRect) return;
      const pointerDelta = drag.x - drag.startX;
      moveMotion(drag.x, drag.y);
      if (drag.y < startRect.top || drag.y > startRect.bottom) return;

      // Project in the frozen content coordinates; scrolling must not move the pointer overlay.
      const deltaX = pointerDelta + drag.scroller.scrollLeft - drag.scrollLeft;
      const pointerX = drag.x + drag.scroller.scrollLeft - drag.scrollLeft;
      const movement = pointerX - drag.lastContentX;
      drag.lastContentX = pointerX;
      if (movement === 0) return;
      const visible = drag.previewOrder.filter((key) => drag.rects.has(key));
      // Reconstruct current slots without reading animated cell rectangles.
      // Frozen original slots stop matching the targets after the first swap.
      const slots = new Map(drag.rects);
      // Sticky cells retain viewport coordinates when a drag starts after scrolling.
      // Anchor content coordinates to the active (always non-fixed) column.
      const originalVisible = drag.order.filter((key) => drag.rects.has(key));
      let left =
        startRect.left -
        originalVisible
          .slice(0, originalVisible.indexOf(drag.key))
          .reduce((width, key) => width + drag.rects.get(key)!.width, 0);
      visible.forEach((key) => {
        const rect = drag.rects.get(key)!;
        slots.set(key, { ...rect, left, right: left + rect.width });
        left += rect.width;
      });
      const projected = projectColumnOrder({
        order: visible,
        activeKey: drag.key,
        startRects: slots,
        activeRect: {
          left: pointerX,
          right: pointerX,
        },
        deltaX: deltaX || 1,
        fixedKeys: drag.fixedKeys,
      });
      const next =
        deltaX === 0
          ? [...drag.order]
          : mergeVisibleColumnOrder(drag.order, projected);
      const indexDelta =
        next.indexOf(drag.key) - drag.previewOrder.indexOf(drag.key);
      if (indexDelta * movement < 0) return;
      if (next.every((key, index) => key === drag.previewOrder[index])) return;
      captureLayout(
        new Set(next.filter((key, index) => key !== drag.previewOrder[index])),
      );
      drag.previewOrder = next;
      onPreview(next);
    },
    [captureLayout, moveMotion, onPreview],
  );

  const autoScroll = useCallback(
    (time: number) => {
      const drag = dragRef.current;
      if (!drag?.activated) return;
      const elapsed = lastFrameRef.current
        ? Math.min(time - lastFrameRef.current, 32)
        : 16;
      lastFrameRef.current = time;
      const header = drag.rects.get(drag.key);
      const insideHeader = Boolean(
        header && drag.y >= header.top && drag.y <= header.bottom,
      );
      if (insideHeader) {
        const rect = drag.scroller.getBoundingClientRect();
        const edge = 48;
        const right = Math.min(rect.right, window.innerWidth);
        const left = Math.max(rect.left, 0);
        const direction =
          drag.x > right - edge
            ? Math.min(1, (drag.x - right + edge) / edge)
            : drag.x < left + edge
            ? -Math.min(1, (left + edge - drag.x) / edge)
            : 0;
        if (direction) drag.scroller.scrollLeft += direction * elapsed * 0.65;
      }
      // Coalesce pointer events and scroll events into one projection per frame.
      unstable_batchedUpdates(() => project(drag));
      scrollFrameRef.current = requestAnimationFrame(autoScroll);
    },
    [project],
  );

  const move = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (
        !drag.activated &&
        Math.hypot(drag.x - drag.startX, drag.y - drag.startY) <
          ACTIVATION_DISTANCE
      )
        return;
      event.preventDefault();
      if (!drag.activated) {
        drag.activated = true;
        startMotion(drag.key);
        moveMotion(drag.x, drag.y);
        drag.releaseBody = lockBodyInteraction('grabbing');
        setActiveKey(drag.key);
        scrollFrameRef.current = requestAnimationFrame(autoScroll);
      }
    },
    [autoScroll, moveMotion, startMotion],
  );

  const finish = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      unstable_batchedUpdates(() => {
        if (drag.activated) {
          const header = drag.rects.get(drag.key);
          const insideHeader =
            header &&
            event.clientY >= header.top &&
            event.clientY <= header.bottom;
          // Release confirms the displayed order; it must not project another
          // target or restart the layout animation already running from the move.
          if (insideHeader) onCommit(drag.previewOrder);
          else {
            captureLayout();
            onCancel();
          }
          suppressClickRef.current = true;
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = setTimeout(() => {
            suppressClickRef.current = false;
          });
        }
        clear();
      });
    },
    [captureLayout, clear, onCancel, onCommit],
  );

  const abort = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.activated) {
      captureLayout();
      onCancel();
    }
    clear();
  }, [captureLayout, clear, onCancel]);

  useEffect(() => {
    if (!listening) return undefined;
    const cancel = (event: PointerEvent) => {
      if (dragRef.current?.pointerId === event.pointerId) abort();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') abort();
    };
    const scroll = () => {
      const drag = dragRef.current;
      const bounds = rootRef.current?.getBoundingClientRect();
      if (!drag || !bounds) return;
      if (
        bounds.top !== drag.rootTop ||
        bounds.left !== drag.rootLeft ||
        drag.scroller.scrollTop !== drag.scrollTop
      ) {
        abort();
      }
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('keydown', keydown);
    window.addEventListener('blur', abort);
    window.addEventListener('resize', abort);
    window.addEventListener('scroll', scroll, true);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('blur', abort);
      window.removeEventListener('resize', abort);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [abort, finish, listening, move, rootRef]);

  const start = useCallback(
    (event: React.PointerEvent<HTMLElement>, key: TableColumnKey) => {
      if (!enabled || !event.isPrimary || event.button !== 0 || dragRef.current)
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          'a, button, input, select, textarea, [role="button"], [role="separator"]',
        )
      )
        return;
      const meta = columns.find((item) => item.key === key);
      const root = rootRef.current;
      if (!root || !meta || meta.column.fixed) return;
      cancelMotion();
      cancelLayout();
      setActiveKey(null);
      const rects = captureColumnLayout(root);
      if (!rects.has(key)) return;
      const scroller = getTableViewport(root);
      const rootBounds = root.getBoundingClientRect();
      const order = [...orderedKeys];
      dragRef.current = {
        key,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        scrollLeft: scroller.scrollLeft,
        lastContentX: event.clientX,
        scrollTop: scroller.scrollTop,
        rootLeft: rootBounds.left,
        rootTop: rootBounds.top,
        scroller,
        order,
        previewOrder: order,
        rects,
        fixedKeys: new Set(
          columns
            .filter(
              (item) =>
                Boolean(item.column.fixed) || item.groupPath !== meta.groupPath,
            )
            .map((item) => item.key),
        ),
        activated: false,
      };
      clearTimeout(clickTimerRef.current);
      suppressClickRef.current = false;
      setListening(true);
    },
    [cancelLayout, cancelMotion, columns, enabled, orderedKeys, rootRef],
  );

  useEffect(() => {
    if (!enabled) abort();
  }, [abort, enabled]);
  const previousColumns = useRef(columns);
  useEffect(() => {
    if (previousColumns.current !== columns) abort();
    previousColumns.current = columns;
  }, [abort, columns]);

  useEffect(
    () => () => {
      dragRef.current?.releaseBody?.();
      if (scrollFrameRef.current !== undefined)
        cancelAnimationFrame(scrollFrameRef.current);
      clearTimeout(clickTimerRef.current);
    },
    [],
  );

  const consumeClick = useCallback(() => {
    const suppressed = suppressClickRef.current;
    suppressClickRef.current = false;
    return suppressed;
  }, []);
  const value = useMemo(
    () => ({ activeKey, start, consumeClick }),
    [activeKey, consumeClick, start],
  );
  return (
    <ColumnDragContext.Provider value={value}>
      {children}
    </ColumnDragContext.Provider>
  );
}
