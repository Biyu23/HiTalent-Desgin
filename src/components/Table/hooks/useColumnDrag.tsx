import type {
  DragEndEvent,
  DragOverEvent,
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
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { ColumnId } from '../type';

interface ColumnDragItem {
  id: ColumnId;
  title?: React.ReactNode;
  fixed: boolean;
  domToken: string;
}

interface TableDragContextValue {
  tableId: string;
  tokenMap: ReadonlyMap<ColumnId, string>;
}

export const TableDragContext = React.createContext<TableDragContextValue>({
  tableId: '',
  tokenMap: new Map(),
});

interface SortableHeaderItemProps {
  id: ColumnId;
  children: React.ReactNode;
  prefixCls: string;
  dragHandleLabel: string;
  isFixed: boolean;
}

const SortableHeaderItem: React.FC<SortableHeaderItemProps> = ({
  id,
  children,
  prefixCls,
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
  } = useSortable({ id, disabled: isFixed });
  const { tableId, tokenMap } = useContext(TableDragContext);
  const token = tokenMap.get(id);
  const transformValue = CSS.Translate.toString(transform);

  useEffect(() => {
    if (!token || !tableId) return undefined;
    const styleElement = document.createElement('style');
    styleElement.dataset.dragStyleFor = `${tableId}-${token}`;
    styleElement.textContent = `
      td[data-table-id="${tableId}"][data-col-drag-token="${token}"] {
        transform: var(--col-transform-${tableId}-${token}, none) !important;
        transition: var(--col-transition-${tableId}-${token}, none) !important;
        z-index: var(--col-zindex-${tableId}-${token}, auto) !important;
      }
    `;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, [tableId, token]);

  useLayoutEffect(() => {
    if (!token || !tableId) return undefined;
    const rootStyle = document.documentElement.style;
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
  }, [transformValue, transition, isDragging, tableId, token]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${prefixCls}-drag-container`}
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
  prefixCls: string;
  sensors: SensorDescriptor<SensorOptions>[];
}

function moveItem(
  order: readonly ColumnId[],
  activeId: ColumnId,
  overId: ColumnId,
): ColumnId[] {
  const oldIndex = order.indexOf(activeId);
  const newIndex = order.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return [...order];
  const next = [...order];
  next.splice(oldIndex, 1);
  next.splice(newIndex, 0, activeId);
  return next;
}

const InternalColumnDragContext: React.FC<InternalColumnDragContextProps> = ({
  children,
  optionsRef,
  prefixCls,
  sensors,
}) => {
  const [activeId, setActiveId] = useState<ColumnId | null>(null);
  const startOrderRef = useRef<ColumnId[]>([]);
  const previewOrderRef = useRef<ColumnId[]>([]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as ColumnId;
      const order = [...optionsRef.current.orderedIds];
      startOrderRef.current = order;
      previewOrderRef.current = order;
      setActiveId(id);
    },
    [optionsRef],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const next = moveItem(
        previewOrderRef.current,
        active.id as ColumnId,
        over.id as ColumnId,
      );
      previewOrderRef.current = next;
      optionsRef.current.onPreview(next);
    },
    [optionsRef],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      if (!event.over) {
        optionsRef.current.onCancel();
        return;
      }
      const next = previewOrderRef.current;
      const changed = next.some(
        (id, index) => id !== startOrderRef.current[index],
      );
      if (changed) optionsRef.current.onCommit(next);
      else optionsRef.current.onCancel();
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
      id="column-drag-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
            <div className={`${prefixCls}-drag-overlay`}>
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
  React.TdHTMLAttributes<HTMLTableCellElement> & { columnId: ColumnId }
> = ({ columnId, children, ...restProps }) => {
  const { tableId, tokenMap } = useContext(TableDragContext);
  return (
    <td
      {...restProps}
      data-table-id={tableId}
      data-col-drag-token={tokenMap.get(columnId)}
    >
      {children}
    </td>
  );
};

export function useColumnDrag(options: UseColumnDragOptions) {
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');
  const tableId = useMemo(() => Math.random().toString(36).slice(2, 10), []);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const tokenMap = useMemo(
    () =>
      new Map(options.columns.map((column) => [column.id, column.domToken])),
    [options.columns],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const ColumnDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => {
        if (!optionsRef.current.enabled) return <>{children}</>;
        return (
          <TableDragContext.Provider value={{ tableId, tokenMap }}>
            <InternalColumnDragContext
              optionsRef={optionsRef}
              prefixCls={prefixCls}
              sensors={sensors}
            >
              {children}
            </InternalColumnDragContext>
          </TableDragContext.Provider>
        );
      },
      [prefixCls, sensors, tableId, tokenMap],
    );

  const HeaderWrapper: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> =
    useCallback(({ children, ...restProps }) => {
      return <thead {...restProps}>{children}</thead>;
    }, []);

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
          prefixCls={prefixCls}
          dragHandleLabel={locale.dragHandle}
          isFixed={column.fixed}
        >
          {children}
        </SortableHeaderItem>
      );
    },
    [locale.dragHandle, prefixCls],
  );

  return { HeaderWrapper, HeaderCellWrapper, ColumnDragContextWrapper };
}
