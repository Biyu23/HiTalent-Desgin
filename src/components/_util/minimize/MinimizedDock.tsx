import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactDraggable from 'react-draggable';
import useDragBounds from '../../../hooks/useDragBounds';
import { useComponentNamespace } from '../namespace';
import { acquireDockContainer } from './dockRegistry';
import { useStyle } from './style';
import type { MinimizedDockProps } from './type';

const Draggable = ReactDraggable;

const MinimizedDockInner = memo<MinimizedDockProps>(
  ({ title, position, className, style, locale, onRestore, onClose }) => {
    const ownerNamespace = useComponentNamespace();
    const dockPrefixCls = `${ownerNamespace.rootPrefixCls}-minimize`;
    const e = (element: string) => `${dockPrefixCls}-${element}`;
    const { wrapSSR, hashId } = useStyle(
      dockPrefixCls,
      ownerNamespace.antdPrefixCls,
    );
    const { dragRef, bounds, onStart } = useDragBounds();
    const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
      null,
    );

    useLayoutEffect(() => {
      const entry = acquireDockContainer({
        namespace: ownerNamespace.rootPrefixCls,
        dockPrefixCls,
        hashId: clsx(ownerNamespace.hashId, hashId),
        position,
      });
      setScrollWrapperEl(entry.scrollWrapper);
      return entry.release;
    }, [
      dockPrefixCls,
      hashId,
      ownerNamespace.hashId,
      ownerNamespace.rootPrefixCls,
      position,
    ]);

    if (!scrollWrapperEl) return null;

    return wrapSSR(
      createPortal(
        <Draggable
          key={`${dockPrefixCls}-${position}`}
          nodeRef={dragRef}
          bounds={bounds}
          onStart={onStart}
          handle={`.${e('header')}`}
        >
          <div
            ref={dragRef}
            className={clsx(
              e('dock'),
              ownerNamespace.prefixCls,
              ownerNamespace.hashId,
              hashId,
              className,
            )}
            style={style}
            role="group"
            aria-label={locale.minimizedDockLabel}
          >
            <div
              className={e('header')}
              role="group"
              aria-label={locale.minimizedDockDragHandle}
            >
              <div className={e('title')}>{title}</div>
              <Flex gap={8} align="center" className={e('actions')}>
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
          </div>
        </Draggable>,
        scrollWrapperEl,
      ),
    );
  },
);

const MinimizedDock = memo<MinimizedDockProps>((props) => {
  if (!props.open || !props.minimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;
