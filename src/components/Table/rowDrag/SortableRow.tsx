import { HolderOutlined } from '@ant-design/icons';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useComposeRef } from 'rc-util/lib/ref';
import React, { useContext, useMemo, useRef } from 'react';
import type { RowDropCandidate, RowRegistry } from '../internal';
import { useStyles } from '../style';
import type { TableRowKey } from '../type';
import { isTableRowKey } from './utils';

interface RowDragHandleContextValue {
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  draggable: boolean;
}

const RowDragHandleContext =
  React.createContext<RowDragHandleContextValue | null>(null);

interface RowDragStateValue {
  candidate: RowDropCandidate | null;
  treeMode: boolean;
  draggedKeys: ReadonlySet<TableRowKey>;
}

export const RowDragStateContext = React.createContext<RowDragStateValue>({
  candidate: null,
  treeMode: false,
  draggedKeys: new Set(),
});

interface RowRuntimeValue {
  registry: RowRegistry<unknown>;
  treeMode: boolean;
  canDrag?: (record: unknown) => boolean;
  handleEnabled: boolean;
  rowComponent?: React.ElementType;
}

export const RowRuntimeContext = React.createContext<RowRuntimeValue | null>(
  null,
);

function stopRowEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export function RowDragHandle() {
  const drag = useContext(RowDragHandleContext);
  const { styles, cx } = useStyles();
  if (!drag) return null;

  return (
    <div
      className={styles.rowDragHandleWrapper}
      onPointerDown={stopRowEvent}
      onMouseDown={stopRowEvent}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
      onContextMenu={stopRowEvent}
    >
      <span
        ref={drag.draggable ? drag.setActivatorNodeRef : undefined}
        className={cx(
          styles.rowDragHandle,
          !drag.draggable && styles.rowDragHandleDisabled,
        )}
        {...(drag.draggable ? drag.listeners : undefined)}
        role="button"
        tabIndex={drag.draggable ? 0 : undefined}
      >
        <HolderOutlined />
      </span>
    </div>
  );
}

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  rowKey: TableRowKey;
  draggable: boolean;
  handleEnabled: boolean;
  treeParent: boolean;
  rowComponent?: React.ElementType;
  forwardedRef?: React.Ref<HTMLElement>;
}

const disableLayoutAnimation = () => false;

function SortableRow({
  rowKey,
  draggable,
  handleEnabled,
  treeParent,
  rowComponent: Row = 'tr',
  forwardedRef,
  className,
  style,
  ...rowProps
}: SortableRowProps) {
  const state = useContext(RowDragStateContext);
  const blockedMouse = useRef(false);
  const {
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowKey,
    disabled: { draggable: !draggable, droppable: false },
    animateLayoutChanges: state.treeMode ? disableLayoutAnimation : undefined,
  });
  const { styles } = useStyles();
  const isTarget = state.candidate?.targetKey === rowKey;
  const isDragged = state.draggedKeys.has(rowKey);
  const dropClass = isTarget
    ? `row-drag-over-${state.candidate?.placement}`
    : undefined;
  const handleValue = useMemo(
    () => ({ listeners, setActivatorNodeRef, draggable }),
    [draggable, listeners, setActivatorNodeRef],
  );
  const rowRef = useComposeRef(
    forwardedRef ?? null,
    setNodeRef,
    handleEnabled ? null : setActivatorNodeRef,
  );

  return (
    <RowDragHandleContext.Provider value={handleValue}>
      <Row
        {...rowProps}
        {...(!handleEnabled && draggable ? listeners : undefined)}
        tabIndex={!handleEnabled && draggable ? 0 : rowProps.tabIndex}
        onPointerDown={(event: React.PointerEvent<HTMLTableRowElement>) => {
          rowProps.onPointerDown?.(event);
          // Preserve the existing onRow preventDefault contract when the
          // subsequent mouse event activates MouseSensor.
          blockedMouse.current = event.defaultPrevented;
        }}
        onMouseDown={(event: React.MouseEvent<HTMLTableRowElement>) => {
          rowProps.onMouseDown?.(event);
          const ownTable =
            !(event.target instanceof Element) ||
            event.target.closest('[data-table-root]') ===
              event.currentTarget.closest('[data-table-root]');
          if (
            !handleEnabled &&
            draggable &&
            ownTable &&
            !blockedMouse.current &&
            !event.defaultPrevented
          )
            listeners?.onMouseDown?.(event);
          blockedMouse.current = false;
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLTableRowElement>) => {
          rowProps.onKeyDown?.(event);
          if (
            !handleEnabled &&
            draggable &&
            !event.defaultPrevented &&
            event.target === event.currentTarget
          )
            listeners?.onKeyDown?.(event);
        }}
        ref={rowRef}
        className={[className, dropClass, treeParent && styles.rowTreeParent]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...style,
          ...(state.treeMode
            ? isDragged
              ? { pointerEvents: 'none' }
              : {}
            : {
                transform: CSS.Translate.toString(transform),
                transition,
                ...(isDragging ? { position: 'relative', zIndex: 1 } : {}),
              }),
          ...(!handleEnabled && draggable ? { cursor: 'move' } : {}),
        }}
      />
    </RowDragHandleContext.Provider>
  );
}

export const RowAdapter = React.forwardRef(function RowAdapter(
  props: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  },
  ref: React.Ref<HTMLElement>,
) {
  const runtime = useContext(RowRuntimeContext);
  const key = props['data-row-key'];
  if (!runtime || !isTableRowKey(key)) {
    const Row = runtime?.rowComponent ?? 'tr';
    return <Row {...props} ref={ref} />;
  }
  const meta = runtime.registry.meta.get(key);
  if (!meta) {
    const Row = runtime.rowComponent ?? 'tr';
    return <Row {...props} ref={ref} />;
  }
  return (
    <SortableRow
      {...props}
      forwardedRef={ref}
      rowKey={key}
      draggable={runtime.canDrag ? runtime.canDrag(meta.record) : true}
      handleEnabled={runtime.handleEnabled}
      treeParent={runtime.treeMode && meta.childKeys.length > 0}
      rowComponent={runtime.rowComponent}
    />
  );
});
