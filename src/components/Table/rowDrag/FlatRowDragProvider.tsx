import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useCallback, useMemo, useRef } from 'react';
import type { RowDragProviderProps, RowRegistry } from '../internal';
import type { TableRowKey } from '../type';
import { RowDragStateContext, RowRuntimeContext } from './SortableRow';
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
    // A transformed table row must not grow its own scroll container at the end.
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

export default function FlatRowDragProvider<RecordType>(
  props: RowDragProviderProps<RecordType>,
) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const pointerOptions = useMemo(
    () => ({ activationConstraint: { distance: 4 } }),
    [],
  );
  const touchOptions = useMemo(
    () => ({ activationConstraint: { delay: 150, tolerance: 5 } }),
    [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, pointerOptions),
    useSensor(TouchSensor, touchOptions),
  );
  const runtimeValue = useMemo(
    () => ({
      registry: props.registry as RowRegistry<unknown>,
      treeMode: false,
      canDrag: props.canDrag as ((record: unknown) => boolean) | undefined,
      handleEnabled: props.handleEnabled,
      rowComponent: props.rowComponent,
    }),
    [props.canDrag, props.handleEnabled, props.registry, props.rowComponent],
  );
  const end = useCallback((event: DragEndEvent) => {
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
    if (!source || !target) return;
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

  return (
    <DndContext
      modifiers={flatModifiers}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={end}
    >
      <SortableContext
        items={[...props.renderKeys]}
        strategy={verticalListSortingStrategy}
      >
        <RowRuntimeContext.Provider value={runtimeValue}>
          <RowDragStateContext.Provider value={flatDragState}>
            {props.children}
          </RowDragStateContext.Provider>
        </RowRuntimeContext.Provider>
      </SortableContext>
    </DndContext>
  );
}
