import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { lockBodyInteraction } from '../../../utils/bodyInteractionLock';
import type { ColumnMeta } from '../internal';
import type { TableColumnKey, TableColumnState } from '../type';
import {
  getHorizontalScroller,
  getTableViewport,
  scrollTableHorizontally,
} from '../utils/dragPreview';
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
  scrollVirtual: (left: number) => void;
  columns: readonly ColumnMeta<RecordType>[];
  orderedKeys: readonly TableColumnKey[];
  committedState: TableColumnState;
  onPreview: (keys: readonly TableColumnKey[]) => void;
  onCommit: (keys: readonly TableColumnKey[]) => void;
  onCancel: () => void;
}

interface ActiveDrag {
  key: TableColumnKey;
  direction: number;
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
  horizontalScroller: HTMLElement;
  order: TableColumnKey[];
  previewOrder: TableColumnKey[];
  rects: ReturnType<typeof captureColumnLayout>;
  fixedKeys: ReadonlySet<TableColumnKey>;
  activated: boolean;
  releaseBody?: () => void;
}

const ACTIVATION_DISTANCE = 4;
const HEADER_DRAG_TOLERANCE = 12;

function isInsideHeader(drag: ActiveDrag, y: number) {
  const header = drag.rects.get(drag.key);
  return Boolean(
    header &&
      y >= header.top - HEADER_DRAG_TOLERANCE &&
      y <= header.bottom + HEADER_DRAG_TOLERANCE,
  );
}

export default function ColumnDragProvider<RecordType>({
  children,
  enabled,
  rootRef,
  scrollVirtual,
  columns,
  orderedKeys,
  committedState,
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
      if (!isInsideHeader(drag, drag.y)) return;

      // 使用冻结的内容坐标计算投影，滚动时不移动指针浮层。
      const deltaX =
        pointerDelta + drag.horizontalScroller.scrollLeft - drag.scrollLeft;
      const pointerX =
        drag.x + drag.horizontalScroller.scrollLeft - drag.scrollLeft;
      const movement = pointerX - drag.lastContentX;
      drag.lastContentX = pointerX;
      if (movement === 0) return;
      const visible = drag.previewOrder.filter((key) => drag.rects.has(key));
      if (drag.direction === -1) visible.reverse();
      // 重建当前位置，无需读取动画中的单元格矩形。
      // 首次交换后，冻结的原始位置已不再对应当前目标。
      const slots = new Map(drag.rects);
      // 滚动后开始拖拽时，固定单元格仍保持视口坐标。
      // 以当前拖拽列作为内容坐标的基准，该列始终为非固定列。
      const originalVisible = drag.order.filter((key) => drag.rects.has(key));
      if (drag.direction === -1) originalVisible.reverse();
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
      if (drag.direction === -1) projected.reverse();
      const next =
        deltaX === 0
          ? [...drag.order]
          : mergeVisibleColumnOrder(drag.order, projected);
      const indexDelta =
        next.indexOf(drag.key) - drag.previewOrder.indexOf(drag.key);
      if (indexDelta * movement * drag.direction < 0) return;
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
      if (isInsideHeader(drag, drag.y)) {
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
        if (direction && rootRef.current)
          scrollTableHorizontally(
            rootRef.current,
            direction * elapsed * 0.65,
            scrollVirtual,
          );
      }
      // 将指针事件与滚动事件合并为每帧一次投影计算。
      unstable_batchedUpdates(() => project(drag));
      scrollFrameRef.current = requestAnimationFrame(autoScroll);
    },
    [project, rootRef, scrollVirtual],
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
        drag.releaseBody = lockBodyInteraction('grabbing');
        setActiveKey(drag.key);
        scrollFrameRef.current = requestAnimationFrame(autoScroll);
      }
      // 立即跟随输入更新浮层，表格布局投影仍按帧合并计算。
      moveMotion(drag.x, drag.y);
    },
    [autoScroll, moveMotion, startMotion],
  );

  const finish = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      unstable_batchedUpdates(() => {
        if (drag.activated) {
          if (isInsideHeader(drag, event.clientY)) {
            drag.x = event.clientX;
            drag.y = event.clientY;
            // 若释放早于动画帧回调，则立即处理尚未处理的输入；project 会跳过未变化的
            // 坐标，因此已稳定的预览不会在释放时再次交换。
            project(drag);
            onCommit(drag.previewOrder);
          } else {
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
    [captureLayout, clear, onCancel, onCommit, project],
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

  useLayoutEffect(() => {
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
      if (
        !enabled ||
        event.pointerType !== 'mouse' ||
        !event.isPrimary ||
        event.button !== 0 ||
        dragRef.current
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          'a, button, input, select, textarea, [tabindex], [data-table-resize-handle]',
        )
      )
        return;
      const meta = columns.find((item) => item.key === key);
      const root = rootRef.current;
      if (!root || !meta || meta.column.fixed) return;
      if (
        event.target instanceof Element &&
        event.target.closest('[data-table-root]') !== root
      )
        return;
      cancelMotion();
      cancelLayout();
      setActiveKey(null);
      const rects = captureColumnLayout(root);
      if (!rects.has(key)) return;
      const scroller = getTableViewport(root);
      const horizontalScroller = getHorizontalScroller(root);
      const rootBounds = root.getBoundingClientRect();
      const order = [...orderedKeys];
      dragRef.current = {
        key,
        direction:
          event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
            event.currentTarget,
          ).direction === 'rtl'
            ? -1
            : 1,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        scrollLeft: horizontalScroller.scrollLeft,
        lastContentX: event.clientX,
        scrollTop: scroller.scrollTop,
        rootLeft: rootBounds.left,
        rootTop: rootBounds.top,
        scroller,
        horizontalScroller,
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
  const previousState = useRef(committedState);
  useLayoutEffect(() => {
    // 预览顺序仅为临时状态，只有已提交的输入变化才会使拖拽失效。
    if (
      previousColumns.current !== columns ||
      previousState.current !== committedState
    )
      abort();
    previousColumns.current = columns;
    previousState.current = committedState;
  }, [abort, columns, committedState]);

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
