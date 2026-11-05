import type { DragStartEvent, Modifier } from '@dnd-kit/core';
import {
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
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

/** 树形策略：冻结数据快照、显示候选位置、按需展开，松手后移动整棵子树。 */
export default function useTreeRowDrag<RecordType>(
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
      (props.enabled ? props.registry.keys : []).filter((key) => {
        const meta = props.registry.meta.get(key);
        return meta?.path
          .slice(0, -1)
          .every((parent) => props.expandedKeys.has(parent));
      }),
    [props.enabled, props.expandedKeys, props.registry],
  );
  const {
    collisionDetection,
    getTarget,
    keyboardCoordinates,
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

  // 取消、提交和输入变化共用清理路径，统一释放帧、计时器及临时展开。
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
      const delay = propsRef.current.autoExpandDelay;
      if (delay === false) return;
      expandTimerRef.current = setTimeout(() => {
        expandTimerRef.current = null;
        const current = propsRef.current;
        const source = registry.meta.get(next.candidate.sourceKey);
        if (
          current.autoExpandDelay === false ||
          current.expandedKeys.has(target.key) ||
          !source ||
          current.canDrag?.(source.record) === false ||
          !resolveRowDrop(registry, next.candidate, current.canDrop)
        )
          return;
        expand(target.key, target.record);
      }, Math.max(0, delay));
    },
    [clearExpandTimer, expand],
  );

  useEffect(() => {
    clearExpandTimer();
    signatureRef.current = '';
  }, [clearExpandTimer, props.autoExpandDelay]);

  // 同一候选位置不重复计算树结构；松手强制重算以采用最新业务约束。
  const evaluate = useCallback(
    (force = false): DragResult<RecordType> | null => {
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
      if (!force && signature === signatureRef.current)
        return resultRef.current;
      signatureRef.current = signature;
      const source = registry.meta.get(sourceKey);
      if (!source || propsRef.current.canDrag?.(source.record) === false) {
        resultRef.current = null;
        setCandidate(null);
        clearExpandTimer();
        return null;
      }
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
      // 释放前保持树结构不变，使用候选位置更新插入指示线。
      scheduleExpand(result, registry);
      return result;
    },
    [clearExpandTimer, getTarget, scheduleExpand],
  );

  const start = useCallback((event: DragStartEvent) => {
    if (!isTableRowKey(event.active.id)) return;
    const current = propsRef.current;
    if (!current.enabled) return;
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
    // 当前提供者卸载或拖拽取消后，传感器仍可能触发释放事件。
    if (activeKeyRef.current === null) return;
    clearFrame();
    const result = evaluate(true);
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

  useLayoutEffect(() => {
    if (
      activeKeyRef.current !== null &&
      (snapshotRef.current !== props.dataSource ||
        registryRef.current !== props.registry ||
        !props.enabled)
    ) {
      clear();
    }
  }, [clear, props.dataSource, props.enabled, props.registry]);

  useEffect(() => {
    const abort = () => {
      if (activeKeyRef.current !== null) clear();
    };
    window.addEventListener('blur', abort);
    return () => window.removeEventListener('blur', abort);
  }, [clear]);

  useLayoutEffect(
    () => () => {
      clearFrame();
      clearExpandTimer();
      const wasDragging = activeKeyRef.current !== null;
      activeKeyRef.current = null;
      snapshotRef.current = null;
      registryRef.current = null;
      resultRef.current = null;
      if (wasDragging) propsRef.current.onPreview(null);
    },
    [clearExpandTimer, clearFrame],
  );

  const mouseOptions = useMemo(
    () => ({ activationConstraint: { distance: 4 } }),
    [],
  );
  const sensors = useSensors(
    useSensor(MouseSensor, mouseOptions),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      scrollBehavior: 'auto',
    }),
  );
  const stateValue = useMemo(
    () => ({ candidate, treeMode: true, draggedKeys }),
    [candidate, draggedKeys],
  );
  return {
    context: {
      modifiers: rowModifiers,
      sensors,
      collisionDetection,
      measuring: { droppable: { strategy: MeasuringStrategy.Always } },
      onDragStart: start,
      onDragMove: move,
      onDragOver: move,
      onDragEnd: end,
      onDragCancel: clear,
    },
    strategy: noSortingTransform,
    state: stateValue,
  };
}
