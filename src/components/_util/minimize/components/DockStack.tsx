import { theme } from 'antd';
import React, { memo, useLayoutEffect, useMemo, useRef } from 'react';
import useDragBounds from '../../../../hooks/useDragBounds';
import DraggablePointerContainer from '../../DraggablePointerContainer';
import useDockDragOffset from '../hooks/useDockDragOffset';
import useDockExpansion from '../hooks/useDockExpansion';
import useDockMetrics from '../hooks/useDockMetrics';
import useTransformScroll from '../hooks/useTransformScroll';
import useViewportHeight from '../hooks/useViewportHeight';
import { useStackStyles } from '../style';
import type { DockItem, MinimizePosition } from '../type';
import { getStackBadgeCount, shouldCollapseStack } from '../utils/layout';
import { isBottomPosition } from '../utils/position';
import DockCard from './DockCard';

export interface DockStackProps {
  items: DockItem[];
  position: MinimizePosition;
  dockPrefixCls: string;
}

const DEFAULT_CARD_HEIGHT = 48;

export const DockStack = memo<DockStackProps>(
  ({ items, position, dockPrefixCls }) => {
    const { token } = theme.useToken();
    const { styles, cx } = useStackStyles();
    const { dragRef, bounds, onStart, updateBounds } = useDragBounds();
    const [dragOffset, setDragOffset] = useDockDragOffset(position);
    const dragOffsetRef = useRef(dragOffset);
    dragOffsetRef.current = dragOffset;

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const latestRef = useRef<HTMLDivElement>(null);
    const viewportHeight = useViewportHeight();

    const displayItems = useMemo(() => [...items].reverse(), [items]);
    const itemRevision = useMemo(
      () => displayItems.map((item) => item.id).join('|'),
      [displayItems],
    );
    const totalCount = displayItems.length;
    const latestItem = displayItems[0];
    const olderItems = displayItems.slice(1);
    const collapsible = shouldCollapseStack(totalCount, latestItem?.stack);
    const expansion = useDockExpansion({
      rootRef: dragRef,
      collapsible,
      revision: itemRevision,
    });
    const expanded = expansion.expanded;
    const anchorBottom = isBottomPosition(position);
    const metrics = useDockMetrics({
      contentRef,
      latestRef,
      revision: `${expanded ? 'expanded' : 'collapsed'}:${itemRevision}`,
      fallbackHeight: DEFAULT_CARD_HEIGHT,
    });

    const maxAllowedHeight = Math.max(
      metrics.latestHeight,
      viewportHeight - token.sizeLG * 2,
    );
    const isScrollable = expanded && metrics.contentHeight > maxAllowedHeight;
    const containerHeight = expanded
      ? Math.min(metrics.contentHeight, maxAllowedHeight)
      : metrics.latestHeight;
    const maxScroll = Math.max(0, metrics.contentHeight - maxAllowedHeight);

    useTransformScroll({
      viewportRef,
      contentRef,
      scrollable: isScrollable,
      maxScroll,
      alignEnd: anchorBottom,
    });

    useLayoutEffect(() => {
      updateBounds(dragOffsetRef.current);
    }, [containerHeight, position, updateBounds, viewportHeight]);

    const showStackLayers = collapsible && !expanded;
    const draggable = !collapsible;

    return (
      <DraggablePointerContainer
        key={`${dockPrefixCls}-${position}`}
        nodeRef={dragRef}
        bounds={bounds}
        disabled={collapsible}
        position={dragOffset}
        onStart={onStart}
        onDrag={setDragOffset}
        handle={`.${styles.header}`}
        className={cx(styles.stackWrapper)}
        style={{ height: containerHeight, maxHeight: maxAllowedHeight }}
        onMouseEnter={expansion.onMouseEnter}
        onMouseLeave={expansion.onMouseLeave}
        onFocusCapture={expansion.onFocusCapture}
        onBlurCapture={expansion.onBlurCapture}
      >
        <div
          ref={viewportRef}
          className={cx(
            styles.viewport,
            expanded && styles.viewportExpanded,
            isScrollable && styles.viewportScrollable,
          )}
        >
          <div
            ref={contentRef}
            className={cx(styles.canvas, anchorBottom && styles.canvasBottom)}
          >
            <div
              ref={latestRef}
              className={cx(
                styles.cardItem,
                styles.latestCard,
                showStackLayers &&
                  (anchorBottom
                    ? styles.latestCardStackBottom
                    : styles.latestCardStackTop),
              )}
            >
              <DockCard
                item={latestItem}
                draggable={draggable}
                elevated={!expanded}
                count={getStackBadgeCount(totalCount, true)}
              />
            </div>

            {expanded &&
              olderItems.map((item) => (
                <div key={item.id} className={styles.cardItem}>
                  <DockCard item={item} draggable={draggable} />
                </div>
              ))}
          </div>
        </div>
      </DraggablePointerContainer>
    );
  },
);

export default DockStack;
