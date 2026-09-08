import type { DragStartEvent, Modifier } from '@dnd-kit/core';
import {
  DndContext,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useLayoutMotion } from '../hooks/useLayoutMotion';
import type {
  RowDragProviderProps,
  RowDropCandidate,
  RowRegistry,
} from '../internal';
import type { TableRowKey } from '../type';
import { visibleTableRows } from '../utils/dragPreview';
import { RowDragStateContext, RowRuntimeContext } from './SortableRow';
import { useRowCollisionDetection } from './useRowCollisionDetection';
import {
  collectSubtreeKeys,
  createRowDragEndEvent,
  isTableRowKey,
  moveRow,
  resolveRowDrop,
} from './utils';

interface DragResult<RecordType> {
  candidate: RowDropCandidate;
  nextDataSource: readonly RecordType[];
}

const noSortingTransform = () => null;
const restrictToVertical: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});
const rowModifiers = [restrictToVertical];

export default function TreeRowDragProvider<RecordType>(
  props: RowDragProviderProps<RecordType>,
) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const [candidate, setCandidate] = useState<RowDropCandidate | null>(null);
  const [draggedKeys, setDraggedKeys] = useState<ReadonlySet<TableRowKey>>(
    new Set(),
  );
  const originalKeys = useMemo(
    () =>
      props.registry.keys.filter((key) => {
        const meta = props.registry.meta.get(key);
        return meta?.path
          .slice(0, -1)
          .every((parent) => props.expandedKeys.has(parent));
      }),
    [props.expandedKeys, props.registry],
  );
  const {
    collisionDetection,
    getTarget,
    reset: resetCollision,
  } = useRowCollisionDetection(props.rootRef, originalKeys, draggedKeys);
  const { capture: captureMotion } = useLayoutMotion('y');
  const captureRows = useCallback(() => {
    const root = propsRef.current.rootRef.current;
    if (root) captureMotion(visibleTableRows(root));
  }, [captureMotion]);
  const preview = useCallback(
    (next: readonly RecordType[] | null) => {
      captureRows();
      propsRef.current.onPreview(next);
    },
    [captureRows],
  );

  const activeKeyRef = useRef<TableRowKey | null>(null);
  const resultRef = useRef<DragResult<RecordType> | null>(null);
  const signatureRef = useRef('');
  const snapshotRef = useRef<readonly RecordType[] | null>(null);
  const registryRef = useRef<RowRegistry<RecordType> | null>(null);
  const frameRef = useRef<number | null>(null);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandedDuringDragRef = useRef(new Set<TableRowKey>());

  const clearFrame = useCallback(() => {
    if (
      frameRef.current !== null &&
      typeof cancelAnimationFrame !== 'undefined'
    ) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = null;
  }, []);

  const clearExpandTimer = useCallback(() => {
    if (expandTimerRef.current !== null) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = null;
  }, []);

  const clear = useCallback(() => {
    clearFrame();
    clearExpandTimer();
    resetCollision();
    activeKeyRef.current = null;
    resultRef.current = null;
    signatureRef.current = '';
    snapshotRef.current = null;
    registryRef.current = null;
    expandedDuringDragRef.current.clear();
    setCandidate(null);
    setDraggedKeys(new Set());
    preview(null);
  }, [clearExpandTimer, clearFrame, preview, resetCollision]);

  const expand = useCallback(
    (key: TableRowKey, record: RecordType) => {
      if (expandedDuringDragRef.current.has(key)) return;
      expandedDuringDragRef.current.add(key);
      captureRows();
      propsRef.current.onAutoExpand(key, record);
    },
    [captureRows],
  );

  const scheduleExpand = useCallback(
    (
      next: DragResult<RecordType> | null,
      registry: RowRegistry<RecordType>,
    ) => {
      clearExpandTimer();
      if (!next) return;
      if (next.candidate.placement !== 'inside') return;
      const target = registry.meta.get(next.candidate.targetKey);
      if (!target || propsRef.current.expandedKeys.has(target.key)) return;
      if (!target.childKeys.length) {
        expand(target.key, target.record);
        return;
      }
      const delay = propsRef.current.autoExpandDelay;
      if (delay === false) return;
      expandTimerRef.current = setTimeout(() => {
        expandTimerRef.current = null;
        expand(target.key, target.record);
      }, Math.max(0, delay));
    },
    [clearExpandTimer, expand],
  );

  const evaluate = useCallback((): DragResult<RecordType> | null => {
    const registry = registryRef.current;
    const snapshot = snapshotRef.current;
    const sourceKey = activeKeyRef.current;
    const drop = getTarget();
    const targetKey = drop?.key;
    const placement = drop?.placement;
    if (!registry || !snapshot || sourceKey === null) return null;

    if (!isTableRowKey(targetKey) || !placement) {
      if (signatureRef.current !== 'none') {
        signatureRef.current = 'none';
        resultRef.current = null;
        setCandidate(null);
        clearExpandTimer();
      }
      return null;
    }

    const signature = `${typeof sourceKey}:${sourceKey}|${typeof targetKey}:${targetKey}|${placement}`;
    if (signature === signatureRef.current) return resultRef.current;
    signatureRef.current = signature;
    const resolved = resolveRowDrop(
      registry,
      { sourceKey, targetKey, placement },
      propsRef.current.canDrop,
    );
    const nextDataSource = resolved
      ? moveRow(snapshot, {
          candidate: resolved,
          registry,
          getKey: propsRef.current.getKey,
          childrenKey: propsRef.current.childrenKey,
          treeMode: true,
        })
      : null;

    if (!resolved || !nextDataSource) {
      resultRef.current = null;
      setCandidate(null);
      clearExpandTimer();
      return null;
    }

    const result = { candidate: resolved, nextDataSource };
    resultRef.current = result;
    setCandidate(resolved);
    // Keep the tree in place until release; candidate drives the insertion guide.
    scheduleExpand(result, registry);
    return result;
  }, [clearExpandTimer, getTarget, scheduleExpand]);

  const start = useCallback((event: DragStartEvent) => {
    if (!isTableRowKey(event.active.id)) return;
    const current = propsRef.current;
    activeKeyRef.current = event.active.id;
    snapshotRef.current = current.dataSource;
    registryRef.current = current.registry;
    resultRef.current = null;
    signatureRef.current = '';
    expandedDuringDragRef.current.clear();
    setCandidate(null);
    setDraggedKeys(collectSubtreeKeys(current.registry, event.active.id));
    current.onPreview(current.dataSource);
  }, []);

  const move = useCallback(() => {
    if (frameRef.current !== null) return;
    if (typeof requestAnimationFrame === 'undefined') {
      evaluate();
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      evaluate();
    });
  }, [evaluate]);

  const end = useCallback(() => {
    clearFrame();
    const result = evaluate();
    const registry = registryRef.current;
    const finalEvent =
      result && registry
        ? createRowDragEndEvent(
            registry,
            result.candidate,
            result.nextDataSource,
          )
        : null;
    unstable_batchedUpdates(() => {
      if (finalEvent) captureRows();
      clear();
      if (finalEvent) propsRef.current.onCommit?.(finalEvent);
    });
  }, [captureRows, clear, clearFrame, evaluate]);

  useEffect(() => {
    if (
      activeKeyRef.current !== null &&
      (snapshotRef.current !== props.dataSource || !props.enabled)
    ) {
      clear();
    }
  }, [clear, props.dataSource, props.enabled]);

  useEffect(() => {
    const abort = () => {
      if (activeKeyRef.current !== null) clear();
    };
    window.addEventListener('blur', abort);
    return () => window.removeEventListener('blur', abort);
  }, [clear]);

  useEffect(
    () => () => {
      clearFrame();
      clearExpandTimer();
    },
    [clearExpandTimer, clearFrame],
  );

  const pointerOptions = useMemo(
    () => ({ activationConstraint: { distance: 4 } }),
    [],
  );
  const touchOptions = useMemo(
    () => ({ activationConstraint: { delay: 150, tolerance: 5 } }),
    [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, pointerOptions),
    useSensor(TouchSensor, touchOptions),
  );
  const stateValue = useMemo(
    () => ({ candidate, treeMode: true, draggedKeys }),
    [candidate, draggedKeys],
  );
  const runtimeValue = useMemo(
    () => ({
      registry: props.registry as RowRegistry<unknown>,
      treeMode: true,
      canDrag: props.canDrag as ((record: unknown) => boolean) | undefined,
      handleEnabled: props.handleEnabled,
      rowComponent: props.rowComponent,
    }),
    [props.canDrag, props.handleEnabled, props.registry, props.rowComponent],
  );

  return (
    <DndContext
      modifiers={rowModifiers}
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={start}
      onDragMove={move}
      onDragOver={move}
      onDragEnd={end}
      onDragCancel={clear}
    >
      <SortableContext
        items={[...props.renderKeys]}
        strategy={noSortingTransform}
      >
        <RowRuntimeContext.Provider value={runtimeValue}>
          <RowDragStateContext.Provider value={stateValue}>
            {props.children}
          </RowDragStateContext.Provider>
        </RowRuntimeContext.Provider>
      </SortableContext>
    </DndContext>
  );
}
