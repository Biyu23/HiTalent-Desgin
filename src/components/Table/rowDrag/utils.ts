import type {
  RowDropCandidate,
  RowKeyGetter,
  RowMeta,
  RowRegistry,
} from '../internal';
import type {
  RowDragEndEvent,
  RowDropEvent,
  RowDropPlacement,
  TableRowKey,
} from '../type';

export function isTableRowKey(value: unknown): value is TableRowKey {
  return typeof value === 'string' || typeof value === 'number';
}

export function getRowChildren<RecordType>(
  record: RecordType,
  childrenKey: string,
): readonly RecordType[] | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const value = (record as Record<string, unknown>)[childrenKey];
  return Array.isArray(value) ? (value as readonly RecordType[]) : undefined;
}

export function buildRowRegistry<RecordType>(
  dataSource: readonly RecordType[],
  getKey: RowKeyGetter<RecordType>,
  childrenKey: string,
  treeMode: boolean,
): RowRegistry<RecordType> {
  const keys: TableRowKey[] = [];
  const meta = new Map<TableRowKey, RowMeta<RecordType>>();
  const duplicateKeys = new Set<TableRowKey>();
  let missingKeyCount = 0;

  const visit = (
    records: readonly RecordType[],
    parentPath: readonly TableRowKey[],
    parentKey: TableRowKey | null,
  ) => {
    records.forEach((record, index) => {
      const key = getKey(record, index);
      if (key === null) {
        missingKeyCount += 1;
        return;
      }
      const path = [...parentPath, key];
      const children = treeMode
        ? getRowChildren(record, childrenKey)
        : undefined;
      const childKeys = (children ?? [])
        .map((child, childIndex) => getKey(child, childIndex))
        .filter(isTableRowKey);

      if (meta.has(key)) duplicateKeys.add(key);
      else {
        keys.push(key);
        meta.set(key, {
          key,
          record,
          path,
          parentKey,
          index,
          childKeys,
        });
      }
      if (children?.length) visit(children, path, key);
    });
  };

  visit(dataSource, [], null);
  duplicateKeys.forEach((key) => {
    meta.delete(key);
    const index = keys.indexOf(key);
    if (index >= 0) keys.splice(index, 1);
  });
  return { keys, meta, duplicateKeys, missingKeyCount };
}

export function collectSubtreeKeys<RecordType>(
  registry: RowRegistry<RecordType>,
  rootKey: TableRowKey,
): Set<TableRowKey> {
  const result = new Set<TableRowKey>();
  registry.meta.forEach((item, key) => {
    if (key === rootKey || item.path.slice(0, -1).includes(rootKey)) {
      result.add(key);
    }
  });
  return result;
}

export function collectVisibleRowKeys<RecordType>(
  dataSource: readonly RecordType[],
  getKey: RowKeyGetter<RecordType>,
  childrenKey: string,
  treeMode: boolean,
  expandedKeys: ReadonlySet<TableRowKey>,
): TableRowKey[] {
  const result: TableRowKey[] = [];
  const visit = (records: readonly RecordType[]) => {
    records.forEach((record, index) => {
      const key = getKey(record, index);
      if (key === null) return;
      result.push(key);
      if (!treeMode || !expandedKeys.has(key)) return;
      const children = getRowChildren(record, childrenKey);
      if (children?.length) visit(children);
    });
  };
  visit(dataSource);
  return result;
}

export function createRowDropEvent<RecordType>(
  registry: RowRegistry<RecordType>,
  candidate: RowDropCandidate,
): RowDropEvent<RecordType> | null {
  const source = registry.meta.get(candidate.sourceKey);
  const target = registry.meta.get(candidate.targetKey);
  if (!source || !target) return null;
  return {
    source: { key: source.key, record: source.record, path: source.path },
    target: { key: target.key, record: target.record, path: target.path },
    placement: candidate.placement,
  };
}

function isNoopDrop<RecordType>(
  registry: RowRegistry<RecordType>,
  candidate: RowDropCandidate,
): boolean {
  const source = registry.meta.get(candidate.sourceKey);
  const target = registry.meta.get(candidate.targetKey);
  if (!source || !target) return true;
  if (candidate.placement === 'before') {
    return (
      source.parentKey === target.parentKey && source.index === target.index - 1
    );
  }
  if (candidate.placement === 'after') {
    return (
      source.parentKey === target.parentKey && source.index === target.index + 1
    );
  }
  return (
    source.parentKey === target.key &&
    source.index === target.childKeys.length - 1
  );
}

export function resolveRowDrop<RecordType>(
  registry: RowRegistry<RecordType>,
  candidate: RowDropCandidate,
  canDrop?: (event: RowDropEvent<RecordType>) => boolean,
): RowDropCandidate | null {
  if (candidate.sourceKey === candidate.targetKey) return null;
  const source = registry.meta.get(candidate.sourceKey);
  const target = registry.meta.get(candidate.targetKey);
  if (!source || !target) return null;
  if (target.path.slice(0, -1).includes(candidate.sourceKey)) return null;
  if (isNoopDrop(registry, candidate)) return null;

  const event = createRowDropEvent(registry, candidate);
  if (!event) return null;
  if (canDrop) {
    try {
      if (!canDrop(event)) return null;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[Table] rowDrag.canDrop failed; the target was ignored.',
          error,
        );
      }
      return null;
    }
  }
  return candidate;
}

interface MoveRowOptions<RecordType> {
  candidate: RowDropCandidate;
  registry: RowRegistry<RecordType>;
  getKey: RowKeyGetter<RecordType>;
  childrenKey: string;
  treeMode: boolean;
}

function replaceChildren<RecordType>(
  record: RecordType,
  childrenKey: string,
  children: readonly RecordType[],
): RecordType {
  return {
    ...(record as Record<string, unknown>),
    [childrenKey]: children.length ? children : undefined,
  } as RecordType;
}

function detachRow<RecordType>(
  records: readonly RecordType[],
  key: TableRowKey,
  getKey: RowKeyGetter<RecordType>,
  childrenKey: string,
  treeMode: boolean,
): { records: readonly RecordType[]; row: RecordType | null } {
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (getKey(record, index) === key) {
      return {
        records: [...records.slice(0, index), ...records.slice(index + 1)],
        row: record,
      };
    }
    if (!treeMode) continue;
    const children = getRowChildren(record, childrenKey);
    if (!children?.length) continue;
    const result = detachRow(children, key, getKey, childrenKey, true);
    if (result.row) {
      const next = [...records];
      next[index] = replaceChildren(record, childrenKey, result.records);
      return { records: next, row: result.row };
    }
  }
  return { records, row: null };
}

function insertRow<RecordType>(
  records: readonly RecordType[],
  row: RecordType,
  targetKey: TableRowKey,
  placement: RowDropPlacement,
  getKey: RowKeyGetter<RecordType>,
  childrenKey: string,
  treeMode: boolean,
): { records: readonly RecordType[]; inserted: boolean } {
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (getKey(record, index) === targetKey) {
      if (placement === 'inside') {
        if (!treeMode) return { records, inserted: false };
        const next = [...records];
        next[index] = replaceChildren(record, childrenKey, [
          ...(getRowChildren(record, childrenKey) ?? []),
          row,
        ]);
        return { records: next, inserted: true };
      }
      const next = [...records];
      next.splice(placement === 'before' ? index : index + 1, 0, row);
      return { records: next, inserted: true };
    }
    if (!treeMode) continue;
    const children = getRowChildren(record, childrenKey);
    if (!children?.length) continue;
    const result = insertRow(
      children,
      row,
      targetKey,
      placement,
      getKey,
      childrenKey,
      true,
    );
    if (result.inserted) {
      const next = [...records];
      next[index] = replaceChildren(record, childrenKey, result.records);
      return { records: next, inserted: true };
    }
  }
  return { records, inserted: false };
}

export function moveRow<RecordType>(
  dataSource: readonly RecordType[],
  options: MoveRowOptions<RecordType>,
): readonly RecordType[] | null {
  const candidate = resolveRowDrop(options.registry, options.candidate);
  if (!candidate) return null;
  const detached = detachRow(
    dataSource,
    candidate.sourceKey,
    options.getKey,
    options.childrenKey,
    options.treeMode,
  );
  if (!detached.row) return null;
  const inserted = insertRow(
    detached.records,
    detached.row,
    candidate.targetKey,
    candidate.placement,
    options.getKey,
    options.childrenKey,
    options.treeMode,
  );
  return inserted.inserted ? inserted.records : null;
}

export function createRowDragEndEvent<RecordType>(
  registry: RowRegistry<RecordType>,
  candidate: RowDropCandidate,
  nextDataSource: readonly RecordType[],
): RowDragEndEvent<RecordType> | null {
  const event = createRowDropEvent(registry, candidate);
  return event ? { ...event, nextDataSource } : null;
}
