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
import React, { useCallback, useMemo, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { EnhancedColumnType } from '../type';

// ==================== SortableHeaderItem ====================

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
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <span
        className={`${prefixCls}-drag-handle`}
        {...listeners}
        aria-label={dragHandleLabel}
      >
        <HolderOutlined />
      </span>
      {children}
    </div>
  );
};

// Workaround for tsx parser: declare SortableHeaderItem as any when passed to createElement
const SortableHeaderItemAny = SortableHeaderItem as any;

// ==================== useColumnDrag ====================

interface UseColumnDragOptions {
  orderedKeys: string[];
  onReorder: (newOrder: string[]) => void;
  columns: EnhancedColumnType<any>[];
  enabled: boolean;
}

export function useColumnDrag(options: UseColumnDragOptions) {
  const { orderedKeys, onReorder, columns, enabled } = options;
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = orderedKeys.indexOf(active.id as string);
      const newIndex = orderedKeys.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = [...orderedKeys];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      onReorder(newOrder);
    },
    [orderedKeys, onReorder],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeTitle = useMemo(() => {
    if (!activeId) return null;
    const col = columns.find((c, i) => {
      const key = (c.key as string) || (c.dataIndex as string) || `col_${i}`;
      return key === activeId;
    });
    return col?.title as React.ReactNode;
  }, [activeId, columns]);

  // Header wrapper: injects DndContext + SortableContext
  const HeaderWrapper: React.FC<{ children: React.ReactNode }> = useCallback(
    (wrapperProps: { children: React.ReactNode }) => {
      if (!enabled)
        return React.createElement(React.Fragment, null, wrapperProps.children);

      return React.createElement(
        DndContext,
        {
          sensors,
          collisionDetection: closestCenter,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          onDragCancel: handleDragCancel,
        },
        React.createElement(
          SortableContext,
          {
            items: orderedKeys,
            strategy: horizontalListSortingStrategy,
          } as any,
          wrapperProps.children,
        ),
        activeId
          ? React.createElement(
              DragOverlay,
              { dropAnimation: null },
              React.createElement(
                'div',
                { className: `${prefixCls}-drag-overlay` },
                React.createElement(
                  'table',
                  null,
                  React.createElement(
                    'thead',
                    null,
                    React.createElement(
                      'tr',
                      null,
                      React.createElement('th', null, activeTitle),
                    ),
                  ),
                ),
              ),
            )
          : null,
      );
    },
    [
      enabled,
      sensors,
      handleDragStart,
      handleDragEnd,
      handleDragCancel,
      orderedKeys,
      activeId,
      activeTitle,
      prefixCls,
    ],
  );

  // Cell wrapper: injects SortableHeaderItem per th
  const HeaderCellWrapper: React.FC<{
    children: React.ReactNode;
    columnKey: string;
  }> = useCallback(
    (cellProps: { children: React.ReactNode; columnKey: string }) => {
      if (!enabled || !orderedKeys.includes(cellProps.columnKey)) {
        return React.createElement(React.Fragment, null, cellProps.children);
      }

      return React.createElement(
        SortableHeaderItemAny,
        {
          id: cellProps.columnKey,
          prefixCls,
          dragHandleLabel: locale.dragHandle,
        },
        cellProps.children,
      );
    },
    [enabled, orderedKeys, prefixCls, locale.dragHandle],
  );

  return {
    activeId,
    HeaderWrapper,
    HeaderCellWrapper,
  };
}
