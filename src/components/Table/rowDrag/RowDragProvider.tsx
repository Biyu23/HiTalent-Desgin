import React from 'react';
import type { RowDragProviderProps } from '../internal';
import FlatRowDragProvider from './FlatRowDragProvider';
import TreeRowDragProvider from './TreeRowDragProvider';

export default function RowDragProvider<RecordType>(
  props: RowDragProviderProps<RecordType>,
) {
  if (!props.enabled) return <>{props.children}</>;
  return props.treeMode ? (
    <TreeRowDragProvider {...props} />
  ) : (
    <FlatRowDragProvider {...props} />
  );
}
