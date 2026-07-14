import React, { memo, useRef } from 'react';
import Draggable from 'react-draggable';
import useDragBounds from '../../hooks/useDragBounds';
import { useModalContext } from './ModalContext';

export interface DraggableWrapperProps {
  /** AntdModal modalRender 回调传入的 ReactNode */
  children: React.ReactNode;
}

/**
 * 拖拽包裹器。
 *
 * 将 Draggable 相关逻辑从 finalModalRender 的 useCallback 中独立出来，
 * 利用 React 组件自身的挂载/卸载生命周期自动管理事件监听器，
 * 避免手动闭包管理带来的内存泄漏风险。
 *
 * 仅在 draggable 开启且非最大化时包裹 Draggable 层。
 */
const DraggableWrapper = memo<DraggableWrapperProps>(({ children }) => {
  const { isMaximized, draggable, disabledDrag, prefixCls } = useModalContext();
  const { dragRef, bounds, onStart } = useDragBounds();

  // 在 render 阶段同步写入 ref——有意为之的权衡：
  // Draggable 组件需要在 mousemove 事件前通过 bounds prop 获取最新边界值，
  // 而 useEffect 在 paint 之后才执行，会滞后一帧导致拖拽边界不正确。
  // 虽然 React Concurrent Mode 理论上可能导致 tearing，但在交互密集型场景
  // （拖拽）中，正确性优先于 Concurrent 兼容性。
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  if (!draggable || isMaximized) return <>{children}</>;

  return (
    <Draggable
      disabled={disabledDrag}
      bounds={boundsRef.current}
      nodeRef={dragRef}
      onStart={onStart}
    >
      <div ref={dragRef} className={`${prefixCls}-draggable-wrapper`}>
        {children}
      </div>
    </Draggable>
  );
});

export default DraggableWrapper;
