import { HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
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
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { EnhancedColumnType } from '../type';

interface SortableHeaderItemProps {
  id: string;
  children: React.ReactNode;
  prefixCls: string;
  dragHandleLabel: string;
}

const SortableHeaderItem: React.FC<SortableHeaderItemProps> = ({
  id,
  children,
  prefixCls,
  dragHandleLabel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add relative position and zIndex to ensure it overlays correctly during drag
    ...(isDragging ? { position: 'relative', zIndex: 999 } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`${prefixCls}-drag-handle`}
      style={style}
    >
      <div
        className={`${prefixCls}-drag-handle-wrapper`}
        {...listeners}
        aria-label={dragHandleLabel}
      >
        <HolderOutlined />
      </div>
      {children}
    </div>
  );
};

// ==================== useColumnDrag ====================

interface UseColumnDragOptions {
  orderedKeys: string[];
  onReorder: (newOrder: string[]) => void;
  columns: EnhancedColumnType<any>[];
  enabled: boolean;
}

const InternalColumnDragContext: React.FC<{
  children: React.ReactNode;
  optionsRef: React.MutableRefObject<UseColumnDragOptions>;
  contextRef: React.MutableRefObject<{
    prefixCls: string;
    dragHandleLabel: string;
  }>;
  sensors: any;
}> = ({ children, optionsRef, contextRef, sensors }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
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
  }, []);

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
      {activeId
        ? ReactDOM.createPortal(
            <DragOverlay dropAnimation={null}>
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
          )
        : null}
    </DndContext>
  );
};

export const SortableBodyCell: React.FC<{
  id: string;
  children: React.ReactNode;
  [key: string]: any;
}> = ({ id, children, ...restProps }) => {
  const { transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    ...restProps.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--htd-table-drag-overlay-bg, #e6f4ff)',
        }
      : {}),
  };

  // Note: We intentionally do NOT use setNodeRef here because the header is the primary drag source and measurement node.
  return (
    <td {...restProps} style={style}>
      {children}
    </td>
  );
};

export function useColumnDrag(options: UseColumnDragOptions) {
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const contextRef = useRef({ prefixCls, dragHandleLabel: locale.dragHandle });
  contextRef.current = { prefixCls, dragHandleLabel: locale.dragHandle };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  const ColumnDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => {
        const { enabled } = optionsRef.current;
        if (!enabled) {
          return <React.Fragment>{children}</React.Fragment>;
        }
        return (
          <InternalColumnDragContext
            optionsRef={optionsRef}
            contextRef={contextRef}
            sensors={sensors}
          >
            {children}
          </InternalColumnDragContext>
        );
      },
      [sensors],
    );

  const HeaderWrapper: React.FC<{ children: React.ReactNode }> = useCallback(
    (wrapperProps: { children: React.ReactNode }) => {
      const { children, ...restProps } = wrapperProps as any;
      return <thead {...restProps}>{children}</thead>;
    },
    [],
  );

  const HeaderCellWrapper: React.FC<{
    children: React.ReactNode;
    columnKey: string;
  }> = useCallback(
    (cellProps: { children: React.ReactNode; columnKey: string }) => {
      const { enabled, orderedKeys } = optionsRef.current;
      const { prefixCls, dragHandleLabel } = contextRef.current;

      if (!enabled || !orderedKeys.includes(cellProps.columnKey)) {
        return React.createElement(React.Fragment, null, cellProps.children);
      }

      return React.createElement(
        SortableHeaderItem as any,
        {
          id: cellProps.columnKey,
          prefixCls,
          dragHandleLabel,
        },
        cellProps.children,
      );
    },
    [],
  );

  return {
    HeaderWrapper,
    HeaderCellWrapper,
    ColumnDragContextWrapper,
  };
}
