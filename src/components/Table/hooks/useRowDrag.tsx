import { HolderOutlined } from '@ant-design/icons';
import type {
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import {
  closestCenter,
  defaultDropAnimationSideEffects,
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
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { RowDragConfig, RowDragResult } from '../type';

// ---- 提供拖拽属性给外部解耦的 RowDragHandle 组件 ----
const RowDragHandleContext = React.createContext<{
  attributes: any;
  listeners: any;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  dragHandleLabel: string;
  draggable: boolean;
  prefixCls: string;
} | null>(null);

export const RowDragHandle: React.FC = () => {
  const context = useContext(RowDragHandleContext);
  if (!context) return null;

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    dragHandleLabel,
    draggable,
    prefixCls,
  } = context;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: draggable ? 'grab' : 'not-allowed',
      }}
    >
      <span
        ref={draggable ? setActivatorNodeRef : undefined}
        className={`${prefixCls}-row-drag-handle ${
          !draggable ? `${prefixCls}-row-drag-handle-disabled` : ''
        }`}
        aria-label={dragHandleLabel}
        {...(draggable ? listeners : {})}
        {...(draggable ? attributes : {})}
      >
        <HolderOutlined />
      </span>
    </div>
  );
};

// =========================================================

function findRecordByKey<T extends Record<string, unknown>>(
  data: readonly T[],
  targetKey: string,
  getKey: (record: T, index?: number) => string,
  childrenKey: keyof T,
): T | null {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item) continue;
    if (String(getKey(item, i)) === targetKey) return item;
    const children = item[childrenKey] as readonly T[] | undefined;
    if (Array.isArray(children) && children.length > 0) {
      const found = findRecordByKey(children, targetKey, getKey, childrenKey);
      if (found) return found;
    }
  }
  return null;
}

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
  prefixCls: string;
  dragHandleLabel: string;
  rowProps: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  };
  draggable: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
  id,
  children,
  prefixCls,
  dragHandleLabel,
  rowProps,
  draggable,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !draggable });

  const style: React.CSSProperties = {
    ...rowProps.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? { opacity: 0.3, zIndex: 9999, background: '#fafafa' }
      : {}),
  };

  return (
    <RowDragHandleContext.Provider
      value={{
        attributes,
        listeners,
        setActivatorNodeRef,
        dragHandleLabel,
        draggable,
        prefixCls,
      }}
    >
      <tr
        {...rowProps}
        ref={setNodeRef}
        style={style}
        className={rowProps.className}
      >
        {children}
      </tr>
    </RowDragHandleContext.Provider>
  );
};

interface InternalBodyWrapperProps<T> {
  wrapperProps: React.HTMLAttributes<HTMLTableSectionElement>;
  optionsRef: React.MutableRefObject<
    UseRowDragOptions<T> & {
      rowKeys: string[];
      recordMap: Map<string, T>;
      getKey: (record: T, index?: number) => string;
    }
  >;
  contextRef: React.MutableRefObject<{
    prefixCls: string;
    dragHandleLabel: string;
  }>;
  sensors: SensorDescriptor<SensorOptions>[];
}

const InternalBodyWrapper = <T extends Record<string, unknown>>({
  wrapperProps,
  optionsRef,
  contextRef,
  sensors,
}: InternalBodyWrapperProps<T>) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const { dataSource, onDragEnd, recordMap, getKey, rowKeys } =
        optionsRef.current;
      const { treeMode, childrenColumnName } = optionsRef.current.config;
      const childrenKey = (childrenColumnName || 'children') as keyof T;

      const dragKey = active.id as string;
      const targetKey = over.id as string;

      const activeIndex = rowKeys.indexOf(dragKey);
      const overIndex = rowKeys.indexOf(targetKey);

      const dropPosition = activeIndex < overIndex ? 1 : -1;
      const positionLabel = dropPosition === 1 ? 'after' : 'before';

      const dragRecord =
        recordMap.get(dragKey) ||
        (treeMode
          ? findRecordByKey(dataSource, dragKey, getKey, childrenKey)
          : null) ||
        ({} as T);
      const targetRecord =
        recordMap.get(targetKey) ||
        (treeMode
          ? findRecordByKey(dataSource, targetKey, getKey, childrenKey)
          : null) ||
        ({} as T);

      onDragEnd({
        dragKey,
        targetKey,
        position: positionLabel,
        dragRecord,
        targetRecord,
        dragPath: [],
        targetPath: [],
        dropPosition,
      });
    },
    [optionsRef],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const { enabled, rowKeys } = optionsRef.current;
  const { prefixCls } = contextRef.current;
  const { children, ...restProps } = wrapperProps;

  if (!enabled) return <tbody {...restProps}>{children}</tbody>;

  const activeRecord = activeId
    ? optionsRef.current.recordMap.get(activeId)
    : null;
  const activeRecordAny = activeRecord as Record<string, unknown>;
  const dragTitle = activeRecordAny
    ? (activeRecordAny.name as string) ||
      (activeRecordAny.title as string) ||
      activeId
    : activeId;

  return (
    <DndContext
      id="row-drag-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={rowKeys} strategy={verticalListSortingStrategy}>
        <tbody {...restProps}>{children}</tbody>
      </SortableContext>
      {activeId &&
        ReactDOM.createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}
          >
            <div className={`${prefixCls}-drag-overlay`}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 16px', background: '#fff' }}>
                      {dragTitle as string}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
};

interface UseRowDragOptions<T> {
  dataSource: readonly T[];
  rowKey: string | number | symbol | any;
  enabled: boolean;
  config: RowDragConfig<T>;
  onDragEnd: (result: RowDragResult<T>) => void;
}

export function useRowDrag<
  RecordType extends Record<string, unknown> = Record<string, unknown>,
>(options: UseRowDragOptions<RecordType>) {
  const { dataSource, rowKey } = options;
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');

  const getKey = useMemo(() => {
    if (typeof rowKey === 'function') {
      return (record: RecordType, index?: number) =>
        String(rowKey(record, index));
    }
    return (record: RecordType) => String(record[rowKey as keyof RecordType]);
  }, [rowKey]);

  // 使用平级重排的 key 提取机制
  const rowKeys = useMemo(
    () => dataSource.map((record, index) => String(getKey(record, index))),
    [dataSource, getKey],
  );

  const recordMap = useMemo(() => {
    const map = new Map<string, RecordType>();
    dataSource.forEach((item, index) =>
      map.set(String(getKey(item, index)), item),
    );
    return map;
  }, [dataSource, getKey]);

  const optionsRef = useRef({ ...options, rowKeys, recordMap, getKey });
  optionsRef.current = { ...options, rowKeys, recordMap, getKey };

  const contextRef = useRef({ prefixCls, dragHandleLabel: locale.dragHandle });
  contextRef.current = { prefixCls, dragHandleLabel: locale.dragHandle };

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

  const BodyWrapper = useCallback(
    (wrapperProps: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <InternalBodyWrapper
        wrapperProps={wrapperProps}
        optionsRef={optionsRef}
        contextRef={contextRef}
        sensors={sensors}
      />
    ),
    [sensors],
  );

  const RowDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => <React.Fragment>{children}</React.Fragment>,
      [],
    );

  const RowWrapper = useCallback(
    (
      rowProps: React.HTMLAttributes<HTMLTableRowElement> & {
        'data-row-key'?: React.Key;
      },
    ) => {
      const {
        enabled: isEnabled,
        rowKeys: keys,
        config: currentConfig,
      } = optionsRef.current;
      const { prefixCls: cls, dragHandleLabel } = contextRef.current;

      if (!isEnabled) return <tr {...rowProps} />;

      const recordKey = rowProps['data-row-key'];
      if (!recordKey || !keys.includes(String(recordKey))) {
        return <tr {...rowProps} />;
      }

      const { draggable } = currentConfig;
      const record = optionsRef.current.recordMap.get(String(recordKey));
      let isDraggable = true;
      if (typeof draggable === 'function') {
        isDraggable = record ? draggable(record) : false;
      } else if (typeof draggable === 'boolean') {
        isDraggable = draggable;
      }

      return (
        <SortableRow
          id={String(recordKey)}
          prefixCls={cls}
          dragHandleLabel={dragHandleLabel}
          rowProps={rowProps}
          draggable={isDraggable}
        >
          {rowProps.children}
        </SortableRow>
      );
    },
    [],
  );

  return { BodyWrapper, RowWrapper, RowDragContextWrapper };
}
