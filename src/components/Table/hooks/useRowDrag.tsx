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
import type { RowDragConfig, RowDragResult } from '../type';
import type { RowKeyGetter, RowRegistry } from '../types/internal';
import {
  buildRowRegistry,
  getDragTitle,
  getDropPosition,
  resolveDropCandidate,
} from '../utils/rowDrag';

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

function stopRowEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

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
      className={`${prefixCls}-row-drag-handle-wrapper`}
      onPointerDown={stopRowEvent}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
      onContextMenu={stopRowEvent}
    >
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

interface RowDragStateValue {
  candidate: RowDragResult<unknown> | null;
  treeMode: boolean;
}

const RowDragStateContext = React.createContext<RowDragStateValue>({
  candidate: null,
  treeMode: false,
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
  } = useSortable({
    id,
    disabled: !draggable,
    animateLayoutChanges: (args) => {
      if (args.wasDragging) return false;
      return true;
    },
  });
  const dragState = useContext(RowDragStateContext);
  const candidate = dragState.candidate;
  const treeMode = dragState.treeMode;
  const isTarget = candidate?.targetKey === id;
  const dropClass =
    isTarget && treeMode
      ? `${prefixCls}-row-drag-over-${candidate.position}`
      : undefined;

  const handleContextValue = useMemo(
    () => ({
      attributes,
      listeners,
      setActivatorNodeRef,
      dragHandleLabel,
      draggable,
      prefixCls,
    }),
    [
      attributes,
      listeners,
      setActivatorNodeRef,
      dragHandleLabel,
      draggable,
      prefixCls,
    ],
  );

  return (
    <RowDragHandleContext.Provider value={handleContextValue}>
      <tr
        {...rowProps}
        ref={setNodeRef}
        style={{
          ...rowProps.style,
          transform: CSS.Transform.toString(isDragging ? null : transform),
          transition,
          ...(isDragging ? { opacity: treeMode ? 0.3 : 0, zIndex: 9999 } : {}),
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

interface InternalRowDragContextProps<RecordType> {
  children: React.ReactNode;
  optionsRef: React.MutableRefObject<InternalOptions<RecordType>>;
  prefixCls: string;
  sensors: SensorDescriptor<SensorOptions>[];
  contextId: string;
}

const InternalRowDragContext = <RecordType,>({
  children,
  optionsRef,
  prefixCls,
  sensors,
  contextId,
}: InternalRowDragContextProps<RecordType>) => {
  const [activeKey, setActiveKey] = useState<React.Key | null>(null);
  const [candidate, setCandidate] = useState<RowDragResult<RecordType> | null>(
    null,
  );
  const candidateRef = useRef<RowDragResult<RecordType> | null>(null);

  const setCurrentCandidate = useCallback(
    (nextCandidate: RowDragResult<RecordType> | null) => {
      candidateRef.current = nextCandidate;
      setCandidate(nextCandidate);
    },
    [],
  );

  const updateCandidate = useCallback(
    (event: DragMoveEvent) => {
      const position = getDropPosition(
        event,
        Boolean(optionsRef.current.config.treeMode),
      );
      setCurrentCandidate(
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
    [optionsRef, setCurrentCandidate],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveKey(event.active.id);
      setCurrentCandidate(null);
    },
    [setCurrentCandidate],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const currentCandidate = candidateRef.current;
      const finalCandidate =
        currentCandidate && event.over?.id === currentCandidate.targetKey
          ? currentCandidate
          : null;
      setActiveKey(null);
      setCurrentCandidate(null);
      if (finalCandidate) optionsRef.current.onDragEnd(finalCandidate);
    },
    [optionsRef, setCurrentCandidate],
  );

  const handleDragCancel = useCallback(() => {
    setActiveKey(null);
    setCurrentCandidate(null);
  }, [setCurrentCandidate]);

  const treeMode = Boolean(optionsRef.current.config.treeMode);
  const dragStateValue = useMemo(
    () => ({
      candidate: candidate as RowDragResult<unknown> | null,
      treeMode,
    }),
    [candidate, treeMode],
  );

  if (!optionsRef.current.enabled) return <>{children}</>;

  const activeRecord =
    activeKey === null
      ? undefined
      : optionsRef.current.registry.metaMap.get(activeKey)?.record;

  return (
    <DndContext
      id={contextId}
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
        strategy={treeMode ? () => null : verticalListSortingStrategy}
      >
        <RowDragStateContext.Provider value={dragStateValue}>
          {children}
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
  const contextId = useMemo(
    () => `row-drag-${Math.random().toString(36).slice(2, 10)}`,
    [],
  );
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
    useCallback(
      ({ children }) => (
        <InternalRowDragContext
          optionsRef={optionsRef}
          prefixCls={prefixCls}
          sensors={sensors}
          contextId={contextId}
        >
          {children}
        </InternalRowDragContext>
      ),
      [contextId, prefixCls, sensors],
    );

  return { RowWrapper, RowDragContextWrapper };
}
