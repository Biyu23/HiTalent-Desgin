import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import useDragBounds from '../../../hooks/useDragBounds';
import DraggablePointerContainer from '../DraggablePointerContainer';
import { acquireDockContainer } from './dockRegistry';
import { useStyles } from './style';
import type { MinimizedDockProps } from './type';

const MinimizedDockInner = memo<MinimizedDockProps>(
  ({
    title,
    position: dockPosition,
    className,
    style,
    locale,
    onRestore,
    onClose,
  }) => {
    const dockPrefixCls = usePrefixCls('minimize');
    const { styles: dockStyles, cx } = useStyles(dockPrefixCls);
    const { dragRef, bounds } = useDragBounds();
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
      null,
    );

    useLayoutEffect(() => {
      const entry = acquireDockContainer({
        namespace: 'htd',
        dockPrefixCls,
        hashId: '',
        position: dockPosition,
      });
      setScrollWrapperEl(entry.scrollWrapper);
      return entry.release;
    }, [dockPosition, dockPrefixCls]);

    if (!scrollWrapperEl) return null;

    return createPortal(
      <DraggablePointerContainer
        key={`${dockPrefixCls}-${dockPosition}`}
        nodeRef={dragRef}
        bounds={bounds}
        position={dragOffset}
        onDrag={setDragOffset}
        handle={`.${dockStyles.header}`}
        className={cx(dockStyles.dock, className)}
        style={style}
        data-dragging={
          dragOffset.x !== 0 || dragOffset.y !== 0 ? 'true' : undefined
        }
      >
        <div
          className={dockStyles.header}
          role="group"
          aria-label={locale.minimizedDockDragHandle}
        >
          <div className={dockStyles.title}>{title}</div>
          <Flex gap={8} align="center" className={dockStyles.actions}>
            <Button
              size="small"
              type="text"
              onClick={() => onRestore()}
              icon={<ExpandOutlined />}
              aria-label={locale.restore}
            />
            <Button
              size="small"
              type="text"
              onClick={() => onClose()}
              icon={<CloseOutlined />}
              aria-label={locale.close}
            />
          </Flex>
        </div>
      </DraggablePointerContainer>,
      scrollWrapperEl,
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>((props) => {
  if (!props.open || !props.minimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;
