import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import React from 'react';
import type { RowDropCandidate, RowRegistry } from '../internal';
import type { TableRowKey } from '../type';

interface RowDragHandleContextValue {
  listeners: DraggableSyntheticListeners;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  draggable: boolean;
}

/** 单行的手柄绑定，只由所属行提供，避免手柄读取整张表的拖拽状态。 */
export const RowDragHandleContext =
  React.createContext<RowDragHandleContextValue | null>(null);

interface RowDragStateValue {
  active: boolean;
  candidate: RowDropCandidate | null;
  treeMode: boolean;
  draggedKeys: ReadonlySet<TableRowKey>;
}

/** 拖拽期间变化的视觉状态，仅供行组件订阅。 */
export const RowDragStateContext = React.createContext<RowDragStateValue>({
  active: false,
  candidate: null,
  treeMode: false,
  draggedKeys: new Set(),
});

interface RowRuntimeValue {
  enabled: boolean;
  registry: RowRegistry<unknown>;
  treeMode: boolean;
  canDrag?: (record: unknown) => boolean;
  handleEnabled: boolean;
  rowComponent?: React.ElementType;
}

/** 表级配置与行索引，独立于候选落点，避免单元格随每次落点更新重渲染。 */
export const RowRuntimeContext = React.createContext<RowRuntimeValue | null>(
  null,
);
