import type {
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import {
  closestCenter,
  defaultDropAnimation,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { useLocale } from '../../../configProvider/useLocale';
import { useComponentNamespace } from '../../_util/namespace';
import TableContext from '../TableContext';
import type { ColumnId } from '../type';
import { moveColumnItem } from '../utils/columnDrag';

interface ColumnDragItem {
  id: ColumnId;
  title?: React.ReactNode;
  fixed: boolean;
  domToken: string;
}

interface TableDragContextValue {
  tableId: string;
  tokenMap: ReadonlyMap<ColumnId, string>;
  rootRef: React.RefObject<HTMLElement>;
}

export const TableDragContext = React.createContext<TableDragContextValue>({
  tableId: '',
  tokenMap: new Map(),
  rootRef: { current: null },
});

interface SortableHeaderItemProps {
  id: ColumnId;
  children: React.ReactNode;
  dragHandleLabel: string;
  isFixed: boolean;
}

const SortableHeaderItem: React.FC<SortableHeaderItemProps> = ({
  id,
  children,
  dragHandleLabel,
  isFixed,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isFixed,
    animateLayoutChanges: (args) => {
      if (args.wasDragging) return false;
      return defaultAnimateLayoutChanges(args);
    },
  });
  const { tableId, tokenMap, rootRef } = useContext(TableDragContext);
  const token = tokenMap.get(id);
  const transformValue = CSS.Translate.toString(transform);

  useLayoutEffect(() => {
    if (!token || !tableId) return undefined;
    const rootStyle = rootRef.current?.style;
    if (!rootStyle) return undefined;
    const transformName = `--col-transform-${tableId}-${token}`;
    const transitionName = `--col-transition-${tableId}-${token}`;
    const zIndexName = `--col-zindex-${tableId}-${token}`;
    rootStyle.setProperty(transformName, transformValue || 'none');
    rootStyle.setProperty(transitionName, transition || 'none');
    rootStyle.setProperty(zIndexName, isDragging ? '999' : 'auto');
    return () => {
      rootStyle.removeProperty(transformName);
      rootStyle.removeProperty(transitionName);
      rootStyle.removeProperty(zIndexName);
    };
  }, [transformValue, transition, isDragging, rootRef, tableId, token]);

  const { element: e } = useComponentNamespace();
  const { hashId } = useContext(TableContext);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={clsx(e('drag-container'), hashId)}
      style={{
        transform: transformValue,
        transition,
        cursor: isFixed ? 'default' : 'move',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        ...(isDragging ? { opacity: 0.3, zIndex: 999 } : {}),
      }}
      aria-label={dragHandleLabel}
    >
      {children}
    </div>
  );
};

interface UseColumnDragOptions {
  rootRef: React.RefObject<HTMLElement>;
  orderedIds: readonly ColumnId[];
  onPreview: (ids: readonly ColumnId[]) => void;
  onCommit: (ids: readonly ColumnId[]) => void;
  onCancel: () => void;
  columns: readonly ColumnDragItem[];
  enabled: boolean;
}

interface InternalColumnDragContextProps {
  children: React.ReactNode;
  optionsRef: React.MutableRefObject<UseColumnDragOptions>;
  sensors: SensorDescriptor<SensorOptions>[];
  contextId: string;
}

const InternalColumnDragContext: React.FC<InternalColumnDragContextProps> = ({
  children,
  optionsRef,
  sensors,
  contextId,
}) => {
  const { element: e } = useComponentNamespace();
  const { hashId, classNames, styles } = useContext(TableContext);
  const [activeId, setActiveId] = useState<ColumnId | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as ColumnId;
    setActiveId(id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) {
        optionsRef.current.onCancel();
        return;
      }

      const activeId = active.id as ColumnId;
      const overId = over.id as ColumnId;
      const currentOrder = optionsRef.current.orderedIds;

      if (activeId !== overId) {
        const next = moveColumnItem(currentOrder, activeId, overId);
        optionsRef.current.onCommit(next);
      } else {
        optionsRef.current.onCancel();
      }
    },
    [optionsRef],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    optionsRef.current.onCancel();
  }, [optionsRef]);

  const activeTitle = activeId
    ? optionsRef.current.columns.find((column) => column.id === activeId)?.title
    : null;

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={[...optionsRef.current.orderedIds]}
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
      {activeId &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <DragOverlay
            dropAnimation={{
              ...defaultDropAnimation,
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}
          >
            <div
              className={clsx(
                e('drag-overlay'),
                hashId,
                classNames?.dragOverlay,
              )}
              style={styles?.dragOverlay}
            >
              <table>
                <thead>
                  <tr>
                    <th>{activeTitle}</th>
                  </tr>
                </thead>
              </table>
            </div>
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
};

export const SortableBodyCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    columnId: ColumnId;
    cellComponent?: React.ElementType;
  }
> = ({
  columnId,
  cellComponent: CellComponent = 'td',
  children,
  ...restProps
}) => {
  const { tableId, tokenMap } = useContext(TableDragContext);
  return (
    <CellComponent
      {...restProps}
      data-table-id={tableId}
      data-col-drag-token={tokenMap.get(columnId)}
    >
      {children}
    </CellComponent>
  );
};

export function useColumnDrag(options: UseColumnDragOptions) {
  const locale = useLocale('Table');
  const tableId = useMemo(() => Math.random().toString(36).slice(2, 10), []);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const tokenMap = useMemo(
    () =>
      new Map(options.columns.map((column) => [column.id, column.domToken])),
    [options.columns],
  );
  const pointerSensorOptions = useMemo(
    () => ({ activationConstraint: { distance: 4 } }),
    [],
  );
  const keyboardSensorOptions = useMemo(
    () => ({ coordinateGetter: sortableKeyboardCoordinates }),
    [],
  );
  const touchSensorOptions = useMemo(
    () => ({ activationConstraint: { delay: 150, tolerance: 5 } }),
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
    useSensor(KeyboardSensor, keyboardSensorOptions),
    useSensor(TouchSensor, touchSensorOptions),
  );

  const contextValue = useMemo(
    () => ({ tableId, tokenMap, rootRef: options.rootRef }),
    [options.rootRef, tableId, tokenMap],
  );

  useEffect(() => {
    if (!options.enabled || !tableId) return undefined;
    const styleElement = document.createElement('style');
    styleElement.dataset.dragStyleFor = tableId;
    styleElement.textContent = Array.from(tokenMap.values())
      .map(
        (token) => `
          [data-htd-table-id="${tableId}"] td[data-col-drag-token="${token}"] {
            transform: var(--col-transform-${tableId}-${token}, none) !important;
            transition: var(--col-transition-${tableId}-${token}, none) !important;
            z-index: var(--col-zindex-${tableId}-${token}, auto) !important;
          }
        `,
      )
      .join('');
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, [options.enabled, tableId, tokenMap]);

  const ColumnDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => {
        if (!optionsRef.current.enabled) return <>{children}</>;
        return (
          <TableDragContext.Provider value={contextValue}>
            <InternalColumnDragContext
              optionsRef={optionsRef}
              sensors={sensors}
              contextId={`column-drag-${tableId}`}
            >
              {children}
            </InternalColumnDragContext>
          </TableDragContext.Provider>
        );
      },
      [contextValue, sensors, tableId],
    );

  const HeaderCellWrapper: React.FC<{
    children: React.ReactNode;
    columnId: ColumnId;
  }> = useCallback(
    ({ children, columnId }) => {
      const { enabled, orderedIds, columns } = optionsRef.current;
      const column = columns.find((item) => item.id === columnId);
      if (!enabled || !orderedIds.includes(columnId) || !column)
        return <>{children}</>;
      return (
        <SortableHeaderItem
          id={columnId}
          dragHandleLabel={locale.dragHandle}
          isFixed={column.fixed}
        >
          {children}
        </SortableHeaderItem>
      );
    },
    [locale.dragHandle],
  );

  return { HeaderCellWrapper, ColumnDragContextWrapper, tableId };
}
