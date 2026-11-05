import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import React, { useMemo, useState } from 'react';
import { silentDragAnnouncements } from '../../_util/silentDragAnnouncements';
import type { RowDragProviderProps, RowRegistry } from '../internal';
import { RowDragStateContext, RowRuntimeContext } from './RowDragContext';
import useFlatRowDrag from './useFlatRowDrag';
import useTreeRowDrag from './useTreeRowDrag';

const noSensors: [] = [];

/** 固定 DndContext 的组件身份，只在内部选择平铺或树形策略。 */
export default function RowDragProvider<RecordType>(
  props: RowDragProviderProps<RecordType>,
) {
  // 仅切换行为，保持 DndContext 和表格子树的组件身份不变。
  const flat = useFlatRowDrag({
    ...props,
    enabled: props.enabled && !props.treeMode,
  });
  const tree = useTreeRowDrag({
    ...props,
    enabled: props.enabled && props.treeMode,
  });
  const drag = props.treeMode ? tree : flat;
  // 记录开始时的数据与模式，结束事件只能提交仍有效的这一轮交互。
  const [session, setSession] = useState<{
    registry: RowRegistry<RecordType>;
    treeMode: boolean;
    cancel: () => void;
  } | null>(null);
  const active = Boolean(
    session &&
      props.enabled &&
      session.registry === props.registry &&
      session.treeMode === props.treeMode,
  );
  const enabled = props.enabled && (!session || active);
  const runtimeValue = useMemo(
    () => ({
      enabled,
      registry: props.registry as RowRegistry<unknown>,
      treeMode: props.treeMode,
      canDrag: props.canDrag as ((record: unknown) => boolean) | undefined,
      handleEnabled: props.handleEnabled,
      rowComponent: props.rowComponent,
    }),
    [
      enabled,
      props.canDrag,
      props.handleEnabled,
      props.registry,
      props.rowComponent,
      props.treeMode,
    ],
  );
  const stateValue = useMemo(
    () => ({ ...drag.state, active }),
    [drag.state, active],
  );
  const items = useMemo(() => [...props.renderKeys], [props.renderKeys]);
  return (
    <DndContext
      {...drag.context}
      accessibility={silentDragAnnouncements}
      sensors={enabled ? drag.context.sensors : noSensors}
      autoScroll={active}
      onDragStart={(event) => {
        if (!props.enabled) return;
        setSession({
          registry: props.registry,
          treeMode: props.treeMode,
          cancel: drag.context.onDragCancel,
        });
        drag.context.onDragStart(event);
      }}
      onDragEnd={(event) => {
        setSession(null);
        if (active) drag.context.onDragEnd(event);
        else session?.cancel();
      }}
      onDragCancel={() => {
        setSession(null);
        (session?.cancel ?? drag.context.onDragCancel)();
      }}
    >
      <SortableContext
        items={items}
        strategy={drag.strategy}
        disabled={!enabled}
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
