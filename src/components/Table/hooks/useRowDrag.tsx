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
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { RowDragResult } from '../type';

// ==================== SortableRow ====================

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  prefixCls: string;
  dragHandleLabel: string;
}

const SortableRow: React.FC<SortableRowProps> = ({
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
    opacity: isDragging ? 0.4 : 1,
  };

  // Clone children and add drag handle to the first cell
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (index === 0 && React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {}, [
        React.createElement(
          'span',
          {
            key: 'row-drag-handle',
            className: `${prefixCls}-row-drag-handle`,
            ...listeners,
            'aria-label': dragHandleLabel,
          },
          React.createElement(HolderOutlined),
        ),
        (child as React.ReactElement<any>).props.children,
      ]);
    }
    return child;
  });

  return React.createElement(
    'tr',
    { ref: setNodeRef, style, ...attributes },
    enhancedChildren,
  );
};

const SortableRowAny = SortableRow as any;

// ==================== useRowDrag ====================

interface UseRowDragOptions {
  /** 数据源行 keys */
  dataSource: any[];
  /** 行 key 提取函数 */
  rowKey: string | ((record: any) => string);
  /** 是否启用 */
  enabled: boolean;
  /** 拖拽结束回调 */
  onDragEnd: (result: RowDragResult) => void;
}

export function useRowDrag(options: UseRowDragOptions) {
  const { dataSource, rowKey, enabled, onDragEnd } = options;
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

  // 数据源的 key 列表
  const rowKeys = useMemo(() => {
    const getKey =
      typeof rowKey === 'function' ? rowKey : (r: any) => r[rowKey];
    return dataSource.map((record) => String(getKey(record)));
  }, [dataSource, rowKey]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = rowKeys.indexOf(active.id as string);
      const newIndex = rowKeys.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      onDragEnd({
        dragKey: active.id,
        targetKey: over.id as string,
        position: oldIndex < newIndex ? 'after' : 'before',
      });
    },
    [rowKeys, onDragEnd],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Body wrapper: injects DndContext + SortableContext
  const BodyWrapper: React.FC<{ children: React.ReactNode }> = useCallback(
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
          { items: rowKeys, strategy: verticalListSortingStrategy } as any,
          React.createElement('tbody', null, wrapperProps.children),
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
                    'tbody',
                    null,
                    React.createElement(
                      'tr',
                      null,
                      React.createElement('td', null, `行 ${activeId}`),
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
      rowKeys,
      activeId,
      prefixCls,
    ],
  );

  // Row wrapper: injects SortableRow per tr
  const RowWrapper: React.FC<{
    children: React.ReactNode;
    [key: string]: any;
  }> = useCallback(
    (rowProps: any) => {
      if (!enabled) return React.createElement('tr', rowProps);

      const recordKey = rowProps['data-row-key'];
      if (!recordKey || !rowKeys.includes(String(recordKey))) {
        return React.createElement('tr', rowProps);
      }

      return React.createElement(
        SortableRowAny,
        {
          id: String(recordKey),
          prefixCls,
          dragHandleLabel: locale.dragHandle,
        },
        rowProps.children,
      );
    },
    [enabled, rowKeys, prefixCls, locale.dragHandle],
  );

  return {
    activeId,
    BodyWrapper,
    RowWrapper,
  };
}
