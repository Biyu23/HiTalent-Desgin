import type React from 'react';
import type { ColumnId, EnhancedLeafColumnType } from '../type';

export type InternalLeafColumn<RecordType> =
  EnhancedLeafColumnType<RecordType> & {
    __htdColumnId?: ColumnId;
  };

export interface RowMeta<RecordType> {
  record: RecordType;
  path: readonly React.Key[];
}

export interface RowRegistry<RecordType> {
  ids: React.Key[];
  metaMap: Map<React.Key, RowMeta<RecordType>>;
  duplicateKeys: Set<React.Key>;
}

export type RowKeyGetter<RecordType> = (
  record: RecordType,
  index?: number,
) => React.Key;
