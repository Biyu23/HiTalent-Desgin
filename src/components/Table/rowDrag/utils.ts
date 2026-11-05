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

/** 识别业务数据及 Antd、拖拽库事件传入的行键。 */
export function isTableRowKey(value: unknown): value is TableRowKey {
  return typeof value === 'string' || typeof value === 'number';
}

/** 业务树字段的读取边界：字段名由调用方配置，仅接受数组子节点。 */
export function getRowChildren<RecordType>(
  record: RecordType,
  childrenKey: string,
): readonly RecordType[] | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const value = (record as Record<string, unknown>)[childrenKey];
  return Array.isArray(value) ? (value as readonly RecordType[]) : undefined;
}

/** 遍历数据生成键、路径与父子关系索引；平铺模式仅登记顶层行。 */
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

/** 收集整棵子树，碰撞检测用它排除被拖动节点及其后代。 */
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

/** 按实际展开状态生成渲染顺序，折叠后代不进入排序列表。 */
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

/** 将内部键落点转换成对外业务事件，保持原始记录和路径引用。 */
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

/** 相邻位置与原位置等价时，不生成移动结果或触发提交。 */
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

/** 汇合结构约束与业务 canDrop：禁止自投放、移动到后代和无效移动。 */
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

/** 仅复制受影响的父节点，空 children 恢复为 undefined 以符合 Antd 树展示约定。 */
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

/** 从原位置不可变地摘出节点；与移动路径无关的节点保留引用。 */
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

/** 将已摘出的整棵子树插入目标位置，仅复制目标路径。 */
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

/** 纯数据移动：先摘出再插入，失败时返回 null，不改写外部 dataSource。 */
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

/** 为有效落点附加新的完整数据源，供业务方决定是否采纳。 */
export function createRowDragEndEvent<RecordType>(
  registry: RowRegistry<RecordType>,
  candidate: RowDropCandidate,
  nextDataSource: readonly RecordType[],
): RowDragEndEvent<RecordType> | null {
  const event = createRowDropEvent(registry, candidate);
  return event ? { ...event, nextDataSource } : null;
}
