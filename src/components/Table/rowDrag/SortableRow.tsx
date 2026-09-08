import { HolderOutlined } from '@ant-design/icons';
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useContext, useMemo } from 'react';
import type { RowDropCandidate, RowRegistry } from '../internal';
import { useStyles } from '../style';
import TableContext from '../TableContext';
import type { TableRowKey } from '../type';
import { isTableRowKey } from './utils';

interface RowDragHandleContextValue {
  attributes: DraggableAttributes;
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
  const table = useContext(TableContext);
  const { styles, cx } = useStyles();
  if (!drag) return null;

  return (
    <div
      className={styles.rowDragHandleWrapper}
      onPointerDown={stopRowEvent}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
      onContextMenu={stopRowEvent}
    >
      <span
        ref={drag.draggable ? drag.setActivatorNodeRef : undefined}
        className={cx(
          styles.rowDragHandle,
          !drag.draggable && styles.rowDragHandleDisabled,
          table.classNames?.rowDragHandle,
        )}
        {...(drag.draggable ? drag.listeners : undefined)}
        {...(drag.draggable ? drag.attributes : undefined)}
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
}

const disableLayoutAnimation = () => false;

function SortableRow({
  rowKey,
  draggable,
  handleEnabled,
  treeParent,
  rowComponent: Row = 'tr',
  className,
  style,
  ...rowProps
}: SortableRowProps) {
  const state = useContext(RowDragStateContext);
  const {
    attributes,
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
    () => ({ attributes, listeners, setActivatorNodeRef, draggable }),
    [attributes, draggable, listeners, setActivatorNodeRef],
  );

  return (
    <RowDragHandleContext.Provider value={handleValue}>
      <Row
        {...rowProps}
        {...(!handleEnabled && draggable ? attributes : undefined)}
        {...(!handleEnabled && draggable ? listeners : undefined)}
        ref={(node: HTMLElement | null) => {
          setNodeRef(node);
          if (!handleEnabled) setActivatorNodeRef(node);
        }}
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

export function RowAdapter(
  props: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  },
) {
  const runtime = useContext(RowRuntimeContext);
  const key = props['data-row-key'];
  if (!runtime || !isTableRowKey(key)) {
    const Row = runtime?.rowComponent ?? 'tr';
    return <Row {...props} />;
  }
  const meta = runtime.registry.meta.get(key);
  if (!meta) {
    const Row = runtime.rowComponent ?? 'tr';
    return <Row {...props} />;
  }
  return (
    <SortableRow
      {...props}
      rowKey={key}
      draggable={runtime.canDrag ? runtime.canDrag(meta.record) : true}
      handleEnabled={runtime.handleEnabled}
      treeParent={runtime.treeMode && meta.childKeys.length > 0}
      rowComponent={runtime.rowComponent}
    />
  );
}
