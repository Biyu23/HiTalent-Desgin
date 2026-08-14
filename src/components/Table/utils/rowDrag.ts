import type { DragMoveEvent } from '@dnd-kit/core';
import React from 'react';
import type { DropPositionLabel, RowDragResult, RowDropInfo } from '../type';
import type { RowKeyGetter, RowMeta, RowRegistry } from '../types/internal';

export function getRowChildren<RecordType>(
  record: RecordType,
  childrenColumnName: string,
): readonly RecordType[] | undefined {
  if (!record || typeof record !== 'object') return undefined;
  const value = (record as Record<string, unknown>)[childrenColumnName];
  return Array.isArray(value) ? (value as readonly RecordType[]) : undefined;
}

export function buildRowRegistry<RecordType>(
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
        const children = getRowChildren(record, childrenColumnName);
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

export function toDropInfo<RecordType>(
  dragMeta: RowMeta<RecordType>,
  targetMeta: RowMeta<RecordType>,
  position: DropPositionLabel,
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

export function resolveDropCandidate<RecordType>(
  registry: RowRegistry<RecordType>,
  activeKey: React.Key,
  targetKey: React.Key,
  position: DropPositionLabel,
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

export function getDropPosition(
  event: DragMoveEvent,
  treeMode: boolean,
): DropPositionLabel | null {
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

export function getDragTitle(
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
