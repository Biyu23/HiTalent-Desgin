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
    opacity: isDragging ? 0.5 : 1,
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

const InternalHeaderWrapper: React.FC<{
  wrapperProps: any;
  optionsRef: React.MutableRefObject<UseColumnDragOptions>;
  contextRef: React.MutableRefObject<{
    prefixCls: string;
    dragHandleLabel: string;
  }>;
  sensors: any;
}> = ({ wrapperProps, optionsRef, contextRef, sensors }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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

  const { enabled, orderedKeys, columns } = optionsRef.current;
  const { prefixCls } = contextRef.current;

  const activeTitle = useMemo(() => {
    if (!activeId) return null;
    const col = columns.find((c, i) => {
      const key = (c.key as string) || (c.dataIndex as string) || `col_${i}`;
      return key === activeId;
    });
    return col?.title as React.ReactNode;
  }, [activeId, columns]);

  const { children, ...restProps } = wrapperProps as any;
  if (!enabled) {
    return <thead {...restProps}>{children}</thead>;
  }

  return (
    <DndContext
      id="column-drag-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={orderedKeys}
        strategy={horizontalListSortingStrategy}
      >
        <thead {...restProps}>{children}</thead>
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

  const HeaderWrapper = useCallback(
    (wrapperProps: { children: React.ReactNode }) => {
      return (
        <InternalHeaderWrapper
          wrapperProps={wrapperProps}
          optionsRef={optionsRef}
          contextRef={contextRef}
          sensors={sensors}
        />
      );
    },
    [sensors],
  );

  const ColumnDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(({ children }) => {
      return <React.Fragment>{children}</React.Fragment>;
    }, []);

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
