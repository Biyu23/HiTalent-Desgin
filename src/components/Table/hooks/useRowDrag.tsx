import { HolderOutlined } from '@ant-design/icons';
import type {
  DragEndEvent,
  DraggableAttributes,
  DraggableSyntheticListeners,
  DragMoveEvent,
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
  sortableKeyboardCoordinates,
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
import type { RowDragConfig, RowDragResult, RowDropInfo } from '../type';

interface RowDragHandleContextValue {
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  dragHandleLabel: string;
  draggable: boolean;
  prefixCls: string;
}

const RowDragHandleContext =
  React.createContext<RowDragHandleContextValue | null>(null);

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
    <div className={`${prefixCls}-row-drag-handle-wrapper`}>
      <span
        ref={draggable ? setActivatorNodeRef : undefined}
        className={`${prefixCls}-row-drag-handle${
          draggable ? '' : ` ${prefixCls}-row-drag-handle-disabled`
        }`}
        aria-label={dragHandleLabel}
        {...(draggable ? listeners : undefined)}
        {...(draggable ? attributes : undefined)}
      >
        <HolderOutlined />
      </span>
    </div>
  );
};

interface RowMeta<RecordType> {
  record: RecordType;
  path: readonly React.Key[];
}

interface RowRegistry<RecordType> {
  ids: React.Key[];
  metaMap: Map<React.Key, RowMeta<RecordType>>;
  duplicateKeys: Set<React.Key>;
}

type RowKeyGetter<RecordType> = (
  record: RecordType,
  index?: number,
) => React.Key;

function getChildren<RecordType>(
  record: RecordType,
  childrenColumnName: string,
): readonly RecordType[] | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const value = (record as Record<string, unknown>)[childrenColumnName];
  return Array.isArray(value) ? (value as readonly RecordType[]) : undefined;
}

function buildRowRegistry<RecordType>(
  dataSource: readonly RecordType[],
  getKey: RowKeyGetter<RecordType>,
  childrenColumnName: string,
  treeMode: boolean,
): RowRegistry<RecordType> {
  const ids: React.Key[] = [];
  const metaMap = new Map<React.Key, RowMeta<RecordType>>();
  const duplicateKeys = new Set<React.Key>();

  const visit = (
    records: readonly RecordType[],
    parentPath: readonly React.Key[],
  ) => {
    records.forEach((record, index) => {
      const key = getKey(record, index);
      if (key === null || key === undefined) return;
      const path = [...parentPath, key];
      if (metaMap.has(key)) duplicateKeys.add(key);
      else {
        ids.push(key);
        metaMap.set(key, { record, path });
      }
      if (treeMode) {
        const children = getChildren(record, childrenColumnName);
        if (children?.length) visit(children, path);
      }
    });
  };

  visit(dataSource, []);
  duplicateKeys.forEach((key) => {
    metaMap.delete(key);
    const index = ids.indexOf(key);
    if (index >= 0) ids.splice(index, 1);
  });
  return { ids, metaMap, duplicateKeys };
}

function toDropInfo<RecordType>(
  dragMeta: RowMeta<RecordType>,
  targetMeta: RowMeta<RecordType>,
  position: 'before' | 'inside' | 'after',
): RowDropInfo<RecordType> {
  const common = {
    dragRecord: dragMeta.record,
    targetRecord: targetMeta.record,
    dragPath: dragMeta.path,
    targetPath: targetMeta.path,
  };
  if (position === 'inside') {
    return { ...common, position: 'inside', dropPosition: 0 };
  }
  return position === 'before'
    ? { ...common, position: 'before', dropPosition: -1 }
    : { ...common, position: 'after', dropPosition: 1 };
}

function resolveDropCandidate<RecordType>(
  registry: RowRegistry<RecordType>,
  activeKey: React.Key,
  targetKey: React.Key,
  position: 'before' | 'inside' | 'after',
  allowDrop?: (info: RowDropInfo<RecordType>) => boolean,
): RowDragResult<RecordType> | null {
  if (activeKey === targetKey) return null;
  const dragMeta = registry.metaMap.get(activeKey);
  const targetMeta = registry.metaMap.get(targetKey);
  if (!dragMeta || !targetMeta) return null;

  const targetIsDescendant = targetMeta.path
    .slice(0, -1)
    .some((key) => key === activeKey);
  if (targetIsDescendant) return null;

  const info = toDropInfo(dragMeta, targetMeta, position);
  if (allowDrop && !allowDrop(info)) return null;
  return { ...info, dragKey: activeKey, targetKey };
}

interface RowDragStateValue {
  candidate: RowDragResult<unknown> | null;
}

const RowDragStateContext = React.createContext<RowDragStateValue>({
  candidate: null,
});

interface SortableRowProps {
  id: React.Key;
  prefixCls: string;
  dragHandleLabel: string;
  rowProps: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  };
  draggable: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
  id,
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
  const dragState = useContext(RowDragStateContext);
  const candidate = dragState.candidate;
  const isTarget = candidate?.targetKey === id;
  const dropClass = isTarget
    ? `${prefixCls}-row-drag-over-${candidate.position}`
    : undefined;

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
        style={{
          ...rowProps.style,
          transform: CSS.Transform.toString(transform),
          transition,
          ...(isDragging ? { opacity: 0.3, zIndex: 9999 } : {}),
        }}
        className={[rowProps.className, dropClass].filter(Boolean).join(' ')}
      >
        {rowProps.children}
      </tr>
    </RowDragHandleContext.Provider>
  );
};

interface UseRowDragOptions<RecordType> {
  dataSource: readonly RecordType[];
  rowKey: NonNullable<import('antd').TableProps<RecordType>['rowKey']>;
  enabled: boolean;
  config: RowDragConfig<RecordType>;
  onDragEnd: (result: RowDragResult<RecordType>) => void;
}

type InternalOptions<RecordType> = UseRowDragOptions<RecordType> & {
  registry: RowRegistry<RecordType>;
};

interface InternalBodyWrapperProps<RecordType> {
  wrapperProps: React.HTMLAttributes<HTMLTableSectionElement>;
  optionsRef: React.MutableRefObject<InternalOptions<RecordType>>;
  prefixCls: string;
  sensors: SensorDescriptor<SensorOptions>[];
}

function getDropPosition(
  event: DragMoveEvent,
  treeMode: boolean,
): 'before' | 'inside' | 'after' | null {
  if (!event.over) return null;
  const activeRect = event.active.rect.current.translated;
  if (!activeRect || event.over.rect.height <= 0) return null;
  const centerY = activeRect.top + activeRect.height / 2;
  const ratio = (centerY - event.over.rect.top) / event.over.rect.height;
  if (!treeMode) return ratio < 0.5 ? 'before' : 'after';
  if (ratio < 0.25) return 'before';
  if (ratio > 0.75) return 'after';
  return 'inside';
}

function getDragTitle(
  record: unknown,
  fallback: React.Key | null,
): React.ReactNode {
  if (record && typeof record === 'object') {
    const objectRecord = record as Record<string, unknown>;
    const title = objectRecord.name ?? objectRecord.title;
    if (
      React.isValidElement(title) ||
      ['string', 'number'].includes(typeof title)
    ) {
      return title as React.ReactNode;
    }
  }
  return fallback;
}

const InternalBodyWrapper = <RecordType,>({
  wrapperProps,
  optionsRef,
  prefixCls,
  sensors,
}: InternalBodyWrapperProps<RecordType>) => {
  const [activeKey, setActiveKey] = useState<React.Key | null>(null);
  const [candidate, setCandidate] = useState<RowDragResult<RecordType> | null>(
    null,
  );

  const updateCandidate = useCallback(
    (event: DragMoveEvent) => {
      const position = getDropPosition(
        event,
        Boolean(optionsRef.current.config.treeMode),
      );
      setCandidate(
        event.over && position
          ? resolveDropCandidate(
              optionsRef.current.registry,
              event.active.id,
              event.over.id,
              position,
              optionsRef.current.config.allowDrop,
            )
          : null,
      );
    },
    [optionsRef],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveKey(event.active.id);
    setCandidate(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const finalCandidate =
        candidate && event.over?.id === candidate.targetKey ? candidate : null;
      setActiveKey(null);
      setCandidate(null);
      if (finalCandidate) optionsRef.current.onDragEnd(finalCandidate);
    },
    [candidate, optionsRef],
  );

  const handleDragCancel = useCallback(() => {
    setActiveKey(null);
    setCandidate(null);
  }, []);

  const { children, ...restProps } = wrapperProps;
  if (!optionsRef.current.enabled)
    return <tbody {...restProps}>{children}</tbody>;

  const activeRecord =
    activeKey === null
      ? undefined
      : optionsRef.current.registry.metaMap.get(activeKey)?.record;

  return (
    <DndContext
      id="row-drag-context"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={updateCandidate}
      onDragOver={updateCandidate}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={optionsRef.current.registry.ids}
        strategy={verticalListSortingStrategy}
      >
        <RowDragStateContext.Provider
          value={{
            candidate: candidate as RowDragResult<unknown> | null,
          }}
        >
          <tbody {...restProps}>{children}</tbody>
        </RowDragStateContext.Provider>
      </SortableContext>
      {activeKey !== null &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } },
              }),
            }}
          >
            <div className={`${prefixCls}-drag-overlay`}>
              <table>
                <tbody>
                  <tr>
                    <td>{getDragTitle(activeRecord, activeKey)}</td>
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

export function useRowDrag<RecordType>(options: UseRowDragOptions<RecordType>) {
  const { dataSource, rowKey, config } = options;
  const prefixCls = usePrefixCls('table');
  const locale = useLocale('Table');
  const getKey = useMemo<RowKeyGetter<RecordType>>(() => {
    if (typeof rowKey === 'function') return rowKey;
    return (record) => {
      if (!record || typeof record !== 'object') return '';
      return (record as Record<PropertyKey, React.Key>)[rowKey as PropertyKey];
    };
  }, [rowKey]);
  const registry = useMemo(
    () =>
      buildRowRegistry(
        dataSource,
        getKey,
        config.childrenColumnName || 'children',
        Boolean(config.treeMode),
      ),
    [config.childrenColumnName, config.treeMode, dataSource, getKey],
  );

  if (
    process.env.NODE_ENV !== 'production' &&
    registry.duplicateKeys.size > 0
  ) {
    console.warn('[Table] 行拖拽已禁用重复 rowKey：', [
      ...registry.duplicateKeys,
    ]);
  }

  const optionsRef = useRef<InternalOptions<RecordType>>({
    ...options,
    registry,
  });
  optionsRef.current = { ...options, registry };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const BodyWrapper = useCallback(
    (wrapperProps: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <InternalBodyWrapper
        wrapperProps={wrapperProps}
        optionsRef={optionsRef}
        prefixCls={prefixCls}
        sensors={sensors}
      />
    ),
    [prefixCls, sensors],
  );

  const RowWrapper = useCallback(
    (
      rowProps: React.HTMLAttributes<HTMLTableRowElement> & {
        'data-row-key'?: React.Key;
      },
    ) => {
      if (!optionsRef.current.enabled) return <tr {...rowProps} />;
      const recordKey = rowProps['data-row-key'];
      if (recordKey === null || recordKey === undefined) {
        return <tr {...rowProps} />;
      }
      const meta = optionsRef.current.registry.metaMap.get(recordKey);
      if (!meta) return <tr {...rowProps} />;
      const draggableOption = optionsRef.current.config.draggable;
      const draggable =
        typeof draggableOption === 'function'
          ? draggableOption(meta.record)
          : draggableOption !== false;
      return (
        <SortableRow
          id={recordKey}
          prefixCls={prefixCls}
          dragHandleLabel={locale.dragHandle}
          rowProps={rowProps}
          draggable={draggable}
        />
      );
    },
    [locale.dragHandle, prefixCls],
  );

  const RowDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(({ children }) => <>{children}</>, []);

  return { BodyWrapper, RowWrapper, RowDragContextWrapper };
}
