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
import { isNullOrBlank } from '../../../utils';
import { useStyles } from '../style';
import TableContext from '../TableContext';
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
  draggable: boolean;
}

const RowDragHandleContext =
  React.createContext<RowDragHandleContextValue | null>(null);

function stopRowEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

export const RowDragHandle: React.FC = () => {
  const context = useContext(RowDragHandleContext);
  const tableContext = useContext(TableContext);
  const { styles: tableStyles, cx } = useStyles();

  if (!context) return null;
  const { attributes, listeners, setActivatorNodeRef, draggable } = context;

  return (
    <div
      className={tableStyles.rowDragHandleWrapper}
      onPointerDown={stopRowEvent}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
      onContextMenu={stopRowEvent}
    >
      <span
        ref={draggable ? setActivatorNodeRef : undefined}
        className={cx(
          tableStyles.rowDragHandle,
          !draggable && tableStyles.rowDragHandleDisabled,
          tableContext.classNames?.rowDragHandle,
        )}
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
  rowProps: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  };
  draggable: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
  id,
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
    isTarget && treeMode && candidate
      ? `row-drag-over-${candidate.position}`
      : undefined;

  const handleContextValue = useMemo(
    () => ({
      attributes,
      listeners,
      setActivatorNodeRef,
      draggable,
    }),
    [attributes, listeners, setActivatorNodeRef, draggable],
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
  sensors: SensorDescriptor<SensorOptions>[];
  contextId: string;
}

const InternalRowDragContext = <RecordType,>({
  children,
  optionsRef,
  sensors,
  contextId,
}: InternalRowDragContextProps<RecordType>) => {
  const context = useContext(TableContext);
  const prefixCls = context.prefixCls || 'htd-table';
  const { styles: tableStyles, cx } = useStyles(prefixCls);
  const { classNames, styles } = context;
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
            <div
              className={cx(
                tableStyles.dragOverlay,
                `${prefixCls}-drag-overlay`,
                classNames?.dragOverlay,
              )}
              style={styles?.dragOverlay}
            >
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
  const touchSensorOptions = useMemo(
    () => ({ activationConstraint: { delay: 150, tolerance: 5 } }),
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, pointerSensorOptions),
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
      if (isNullOrBlank(recordKey)) {
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
        <SortableRow id={recordKey} rowProps={rowProps} draggable={draggable} />
      );
    },
    [],
  );

  const RowDragContextWrapper: React.FC<{ children: React.ReactNode }> =
    useCallback(
      ({ children }) => (
        <InternalRowDragContext
          optionsRef={optionsRef}
          sensors={sensors}
          contextId={contextId}
        >
          {children}
        </InternalRowDragContext>
      ),
      [contextId, sensors],
    );

  return { RowWrapper, RowDragContextWrapper };
}
