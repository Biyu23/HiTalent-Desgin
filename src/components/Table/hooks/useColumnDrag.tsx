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
import type { EnhancedColumnType } from '../type';

export const TableDragContext = React.createContext<{ tableId: string }>({
  tableId: '',
});

interface SortableHeaderItemProps {
  id: string;
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

  const { tableId } = useContext(TableDragContext);
  const transformStr = CSS.Translate.toString(transform);
  useEffect(() => {
    const varTransform = `--col-transform-${tableId}-${id}`;
    const varTransition = `--col-transition-${tableId}-${id}`;
    const varZIndex = `--col-zindex-${tableId}-${id}`;

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-drag-style-for', `${tableId}-${id}`);

    styleEl.innerHTML = `
      td[data-table-id="${tableId}"][data-col-drag-id="${id}"] {
        transform: var(${varTransform}, none) !important;
        transition: var(${varTransition}, none) !important;
        z-index: var(${varZIndex}, auto) !important;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [id, tableId]);
  useLayoutEffect(() => {
    const rootStyle = document.documentElement.style;
    const varTransform = `--col-transform-${tableId}-${id}`;
    const varTransition = `--col-transition-${tableId}-${id}`;
    const varOpacity = `--col-opacity-${tableId}-${id}`;
    const varZIndex = `--col-zindex-${tableId}-${id}`;

    if (isDragging || transformStr || transition) {
      rootStyle.setProperty(varTransform, transformStr || 'none');
      rootStyle.setProperty(varTransition, transition || 'none');
      rootStyle.setProperty(varOpacity, isDragging ? '0.3' : '1');
      rootStyle.setProperty(varZIndex, isDragging ? '999' : 'auto');
    } else {
      rootStyle.removeProperty(varTransform);
      rootStyle.removeProperty(varTransition);
      rootStyle.removeProperty(varOpacity);
      rootStyle.removeProperty(varZIndex);
    }
  }, [transformStr, transition, isDragging, id, tableId]);

  const style: React.CSSProperties = {
    transform: transformStr,
    transition,
    cursor: isFixed ? 'default' : 'move',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    ...(isDragging ? { opacity: 0.3, zIndex: 999 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${prefixCls}-drag-container`}
      style={style}
      aria-label={dragHandleLabel}
    >
      {children}
    </div>
  );
};

interface UseColumnDragOptions<RecordType = Record<string, unknown>> {
  orderedKeys: string[];
  onReorder: (
    newOrder: string[] | ((prev: string[]) => string[]),
    opts?: { silent?: boolean },
  ) => void;
  columns: readonly EnhancedColumnType<RecordType>[];
  enabled: boolean;
}

const InternalColumnDragContext: React.FC<{
  children: React.ReactNode;
  optionsRef: React.MutableRefObject<UseColumnDragOptions<any>>;
  contextRef: React.MutableRefObject<{
    prefixCls: string;
    dragHandleLabel: string;
  }>;
  sensors: SensorDescriptor<SensorOptions>[];
}> = ({ children, optionsRef, contextRef, sensors }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const { onReorder } = optionsRef.current;
      onReorder(
        (prevOrder) => {
          const oldIndex = prevOrder.indexOf(active.id as string);
          const newIndex = prevOrder.indexOf(over.id as string);
          if (oldIndex === -1 || newIndex === -1) return prevOrder;

          const newOrder = [...prevOrder];
          newOrder.splice(oldIndex, 1);
          newOrder.splice(newIndex, 0, active.id as string);
          return newOrder;
        },
        { silent: true },
      );
    },
    [optionsRef],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const { orderedKeys, onReorder } = optionsRef.current;
      const oldIndex = orderedKeys.indexOf(active.id as string);
      const newIndex = orderedKeys.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...orderedKeys];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      onReorder(newOrder);
    },
    [optionsRef],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const { orderedKeys, columns } = optionsRef.current;
  const { prefixCls } = contextRef.current;

  const activeTitle = useMemo(() => {
    if (!activeId) return null;
    const col = columns.find((c, i) => {
      const key = (c.key as string) || (c.dataIndex as string) || `col_${i}`;
      return key === activeId;
    });
    return col?.title as React.ReactNode;
  }, [activeId, columns]);

  return (
    <DndContext
      id="column-drag-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={orderedKeys}
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
      {activeId &&
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
  React.TdHTMLAttributes<HTMLTableCellElement> & { id: string }
> = ({ id, children, ...restProps }) => {
  const { tableId } = useContext(TableDragContext);
  return (
    <td {...restProps} data-table-id={tableId} data-col-drag-id={id}>
      {children}
    </td>
  );
};

export function useColumnDrag<RecordType = Record<string, unknown>>(
  options: UseColumnDragOptions<RecordType>,
) {
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');
  const tableId = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  const optionsRef = useRef(options as UseColumnDragOptions<any>);
  optionsRef.current = options as UseColumnDragOptions<any>;

  const contextRef = useRef({
    prefixCls,
    dragHandleLabel: locale.dragHandle,
    tableId,
  });
  contextRef.current = {
    prefixCls,
    dragHandleLabel: locale.dragHandle,
    tableId,
  };

  const pointerSensorOptions = useMemo(
    () => ({ activationConstraint: { distance: 1 } }),
    [],
  );
  const touchSensorOptions = useMemo(
    () => ({ activationConstraint: { distance: 1 } }),
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, touchSensorOptions),
  );

  const ColumnDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => {
        const { enabled } = optionsRef.current;
        if (!enabled) return <React.Fragment>{children}</React.Fragment>;

        return (
          <TableDragContext.Provider
            value={{ tableId: contextRef.current.tableId }}
          >
            <InternalColumnDragContext
              optionsRef={optionsRef}
              contextRef={contextRef}
              sensors={sensors}
            >
              {children}
            </InternalColumnDragContext>
          </TableDragContext.Provider>
        );
      },
      [sensors],
    );

  const HeaderWrapper: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> =
    useCallback(({ children, ...restProps }) => {
      return <thead {...restProps}>{children}</thead>;
    }, []);

  const HeaderCellWrapper: React.FC<
    React.ThHTMLAttributes<HTMLTableCellElement> & { columnKey: string }
  > = useCallback(({ children, columnKey }) => {
    const { enabled, orderedKeys, columns } = optionsRef.current;
    const { prefixCls: cls, dragHandleLabel } = contextRef.current;

    const columnInfo = columns.find(
      (c, i) =>
        ((c.key as string) || c.dataIndex?.toString() || `col_${i}`) ===
        columnKey,
    );
    const isFixed = !!columnInfo?.fixed;

    if (
      !enabled ||
      !orderedKeys.includes(columnKey) ||
      columnKey === '__drag_handle__'
    ) {
      return <React.Fragment>{children}</React.Fragment>;
    }

    return (
      <SortableHeaderItem
        id={columnKey}
        prefixCls={cls}
        dragHandleLabel={dragHandleLabel}
        isFixed={isFixed}
      >
        {children}
      </SortableHeaderItem>
    );
  }, []);

  return { HeaderWrapper, HeaderCellWrapper, ColumnDragContextWrapper };
}
