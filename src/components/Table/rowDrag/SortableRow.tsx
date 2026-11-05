import { HolderOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { setRef } from '../../../utils/ref';
import { useStyles } from '../style';
import type { TableRowKey } from '../type';
import {
  RowDragHandleContext,
  RowDragStateContext,
  RowRuntimeContext,
} from './RowDragContext';
import { isTableRowKey } from './utils';

function stopRowEvent(event: React.SyntheticEvent) {
  event.stopPropagation();
}

/** 独立手柄只绑定所属行的传感器，阻断行点击等业务事件。 */
export function RowDragHandle() {
  const drag = useContext(RowDragHandleContext);
  const { styles, cx } = useStyles();
  if (!drag) return null;

  return (
    <div
      className={styles.rowDragHandleWrapper}
      onPointerDown={stopRowEvent}
      onMouseDown={stopRowEvent}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
      onContextMenu={stopRowEvent}
    >
      <span
        ref={drag.draggable ? drag.setActivatorNodeRef : undefined}
        className={cx(
          styles.rowDragHandle,
          !drag.draggable && styles.rowDragHandleDisabled,
        )}
        {...(drag.draggable ? drag.listeners : undefined)}
        tabIndex={drag.draggable ? 0 : undefined}
      >
        <HolderOutlined />
      </span>
    </div>
  );
}

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  enabled: boolean;
  rowKey: TableRowKey;
  draggable: boolean;
  handleEnabled: boolean;
  treeParent: boolean;
  rowComponent?: React.ElementType;
  forwardedRef?: React.Ref<HTMLElement>;
}

const disableLayoutAnimation = () => false;

/** 将拖拽样式和事件附着到原始行，继续转发业务属性及虚拟列表所需的 ref。 */
function SortableRow({
  enabled,
  rowKey,
  draggable,
  handleEnabled,
  treeParent,
  rowComponent: Row = 'tr',
  forwardedRef,
  className,
  style,
  ...rowProps
}: SortableRowProps) {
  const state = useContext(RowDragStateContext);
  const blockedMouse = useRef(false);
  const {
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowKey,
    disabled: { draggable: !draggable, droppable: !enabled },
    animateLayoutChanges: state.treeMode ? disableLayoutAnimation : undefined,
  });
  const { styles } = useStyles();
  const isTarget = state.active && state.candidate?.targetKey === rowKey;
  const isDragged = state.active && state.draggedKeys.has(rowKey);
  const dropClass = isTarget
    ? `row-drag-over-${state.candidate?.placement}`
    : undefined;
  const handleValue = useMemo(
    () => ({ listeners, setActivatorNodeRef, draggable }),
    [draggable, listeners, setActivatorNodeRef],
  );
  const rowRef = useCallback(
    (node: HTMLElement | null) => {
      setRef(forwardedRef, node);
      setNodeRef(node);
      if (!handleEnabled) setActivatorNodeRef(node);
    },
    [forwardedRef, setNodeRef, handleEnabled, setActivatorNodeRef],
  );

  return (
    <RowDragHandleContext.Provider value={handleValue}>
      <Row
        {...rowProps}
        {...(!handleEnabled && draggable ? listeners : undefined)}
        tabIndex={!handleEnabled && draggable ? 0 : rowProps.tabIndex}
        onPointerDown={(event: React.PointerEvent<HTMLTableRowElement>) => {
          rowProps.onPointerDown?.(event);
          // 后续鼠标事件激活 MouseSensor 时，
          // 保留现有 onRow 中 preventDefault 的行为约定。
          blockedMouse.current = event.defaultPrevented;
        }}
        onMouseDown={(event: React.MouseEvent<HTMLTableRowElement>) => {
          rowProps.onMouseDown?.(event);
          const ownTable =
            !(event.target instanceof Element) ||
            event.target.closest('[data-table-root]') ===
              event.currentTarget.closest('[data-table-root]');
          const interactiveTarget =
            event.target instanceof Element
              ? event.target.closest(
                  'a, button, input, select, textarea, label, [contenteditable]:not([contenteditable="false"]), [tabindex], [role="button"], [role="checkbox"], [role="switch"]',
                )
              : null;
          if (
            !handleEnabled &&
            draggable &&
            ownTable &&
            (!interactiveTarget || interactiveTarget === event.currentTarget) &&
            !blockedMouse.current &&
            !event.defaultPrevented
          )
            listeners?.onMouseDown?.(event);
          blockedMouse.current = false;
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLTableRowElement>) => {
          rowProps.onKeyDown?.(event);
          if (
            !handleEnabled &&
            draggable &&
            !event.defaultPrevented &&
            event.target === event.currentTarget
          )
            listeners?.onKeyDown?.(event);
        }}
        ref={rowRef}
        className={[className, dropClass, treeParent && styles.rowTreeParent]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...style,
          ...(state.treeMode
            ? isDragged
              ? { pointerEvents: 'none' }
              : {}
            : {
                ...(state.active
                  ? {
                      transform: CSS.Translate.toString(transform),
                      transition,
                      ...(isDragging
                        ? { position: 'relative', zIndex: 1 }
                        : {}),
                    }
                  : {}),
              }),
          ...(!handleEnabled && draggable ? { cursor: 'move' } : {}),
        }}
      />
    </RowDragHandleContext.Provider>
  );
}

/** Antd 行入口：普通辅助行直接透传，具有业务键的行连接拖拽能力。 */
export const RowAdapter = React.forwardRef(function RowAdapter(
  props: React.HTMLAttributes<HTMLTableRowElement> & {
    'data-row-key'?: React.Key;
  },
  ref: React.Ref<HTMLElement>,
) {
  const runtime = useContext(RowRuntimeContext);
  const key = props['data-row-key'];
  if (!runtime || !isTableRowKey(key)) {
    const Row = runtime?.rowComponent ?? 'tr';
    return <Row {...props} ref={ref} />;
  }
  const meta = runtime.registry.meta.get(key);
  return (
    <SortableRow
      {...props}
      enabled={runtime.enabled && Boolean(meta)}
      forwardedRef={ref}
      rowKey={key}
      draggable={
        runtime.enabled &&
        Boolean(meta) &&
        (!runtime.canDrag || runtime.canDrag(meta!.record))
      }
      handleEnabled={runtime.handleEnabled}
      treeParent={runtime.treeMode && Boolean(meta?.childKeys.length)}
      rowComponent={runtime.rowComponent}
    />
  );
});
