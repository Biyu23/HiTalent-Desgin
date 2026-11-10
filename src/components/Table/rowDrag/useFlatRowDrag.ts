import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import {
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { RowDragProviderProps } from '../internal';
import type { TableRowKey } from '../type';
import {
  createRowDragEndEvent,
  isTableRowKey,
  moveRow,
  resolveRowDrop,
} from './utils';

const emptyDraggedKeys: ReadonlySet<TableRowKey> = new Set();
const flatDragState = {
  candidate: null,
  treeMode: false,
  draggedKeys: emptyDraggedKeys,
};
const restrictToVertical: Modifier = ({
  transform,
  draggingNodeRect,
  scrollableAncestorRects,
  scrollableAncestors,
}) => {
  const bounds = scrollableAncestorRects[0];
  const scroller = scrollableAncestors[0];
  const top = bounds ? bounds.top + (scroller?.clientTop ?? 0) : 0;
  const bottom = bounds ? top + (scroller?.clientHeight ?? bounds.height) : 0;
  return {
    ...transform,
    x: 0,
    // 表格末尾的行发生变换时，不应撑大其所在的滚动容器。
    y:
      bounds && draggingNodeRect
        ? Math.max(
            top - draggingNodeRect.top,
            Math.min(bottom - draggingNodeRect.bottom, transform.y),
          )
        : transform.y,
  };
};
const flatModifiers = [restrictToVertical];
const mouseOptions = { activationConstraint: { distance: 4 } };

/** 平铺策略：拖动时使用排序位移，松手后才计算新的数据顺序。 */
export default function useFlatRowDrag<RecordType>(
  props: RowDragProviderProps<RecordType>,
) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const mountedRef = useRef(false);
  const draggingRef = useRef(false);
  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      draggingRef.current = false;
    };
  }, [props.enabled, props.registry]);
  const start = useCallback(() => {
    draggingRef.current = mountedRef.current && propsRef.current.enabled;
  }, []);
  const cancel = useCallback(() => {
    draggingRef.current = false;
  }, []);
  const sensors = useSensors(
    useSensor(MouseSensor, mouseOptions),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      scrollBehavior: 'auto',
    }),
  );
  const end = useCallback((event: DragEndEvent) => {
    if (!mountedRef.current || !draggingRef.current) return;
    draggingRef.current = false;
    const { active, over } = event;
    if (
      !over ||
      active.id === over.id ||
      !isTableRowKey(active.id) ||
      !isTableRowKey(over.id)
    )
      return;
    const current = propsRef.current;
    const source = current.registry.meta.get(active.id);
    const target = current.registry.meta.get(over.id);
    if (!current.enabled || !source || !target) return;
    if (current.canDrag?.(source.record) === false) return;
    const candidate = resolveRowDrop(
      current.registry,
      {
        sourceKey: source.key,
        targetKey: target.key,
        placement: source.index < target.index ? 'after' : 'before',
      },
      current.canDrop,
    );
    if (!candidate) return;
    const nextDataSource = moveRow(current.dataSource, {
      candidate,
      registry: current.registry,
      getKey: current.getKey,
      childrenKey: current.childrenKey,
      treeMode: false,
    });
    if (!nextDataSource) return;
    const finalEvent = createRowDragEndEvent(
      current.registry,
      candidate,
      nextDataSource,
    );
    if (finalEvent) current.onCommit?.(finalEvent);
  }, []);

  return {
    context: {
      modifiers: flatModifiers,
      sensors,
      collisionDetection: closestCenter,
      onDragStart: start,
      onDragCancel: cancel,
      onDragEnd: end,
    },
    strategy: verticalListSortingStrategy,
    state: flatDragState,
  };
}
