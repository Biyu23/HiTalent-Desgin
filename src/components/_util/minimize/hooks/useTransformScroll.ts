import type React from 'react';
import { useLayoutEffect, useRef } from 'react';
import { clampScrollOffset } from '../utils/scroll';

export interface UseTransformScrollOptions {
  viewportRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLElement>;
  scrollable: boolean;
  maxScroll: number;
  alignEnd: boolean;
}

const WHEEL_EASING = 0.24;
const WHEEL_STOP_DISTANCE = 0.25;

const applyScrollOffset = (
  content: HTMLElement,
  offset: number,
  maxScroll: number,
  alignEnd: boolean,
  scrolling: boolean,
): void => {
  const translation = alignEnd ? maxScroll - offset : -offset;
  if (Math.abs(translation) <= WHEEL_STOP_DISTANCE) {
    content.style.removeProperty('transform');
  } else {
    content.style.transform = `translateY(${translation}px)`;
  }

  if (scrolling) {
    content.style.willChange = 'transform';
  } else {
    content.style.removeProperty('will-change');
  }
};

const useTransformScroll = ({
  viewportRef,
  contentRef,
  scrollable,
  maxScroll,
  alignEnd,
}: UseTransformScrollOptions): void => {
  const scrollOffsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const previousMaxScrollRef = useRef(0);
  const wasScrollableRef = useRef(false);
  const wasAlignEndRef = useRef(alignEnd);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const safeMaxScroll = Math.max(0, maxScroll);
    const activeMaxScroll = scrollable ? safeMaxScroll : 0;
    const wasAtEnd =
      Math.abs(targetOffsetRef.current - previousMaxScrollRef.current) <=
      WHEEL_STOP_DISTANCE;
    const shouldAlignEnd =
      scrollable &&
      alignEnd &&
      (!wasScrollableRef.current || !wasAlignEndRef.current || wasAtEnd);
    const nextOffset = !scrollable
      ? 0
      : shouldAlignEnd
      ? activeMaxScroll
      : clampScrollOffset(scrollOffsetRef.current, activeMaxScroll);

    scrollOffsetRef.current = nextOffset;
    targetOffsetRef.current = nextOffset;
    previousMaxScrollRef.current = activeMaxScroll;
    wasScrollableRef.current = scrollable;
    wasAlignEndRef.current = alignEnd;
    applyScrollOffset(content, nextOffset, activeMaxScroll, alignEnd, false);
  }, [alignEnd, contentRef, maxScroll, scrollable]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content || !scrollable) return undefined;

    let animationFrame: number | undefined;
    let touchY: number | undefined;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const cancelAnimation = () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    };
    const commitOffset = (offset: number, scrolling: boolean) => {
      scrollOffsetRef.current = offset;
      applyScrollOffset(content, offset, maxScroll, alignEnd, scrolling);
    };
    const finishAnimation = () => {
      commitOffset(targetOffsetRef.current, false);
      animationFrame = undefined;
    };
    const animateToTarget = () => {
      const distance = targetOffsetRef.current - scrollOffsetRef.current;
      if (Math.abs(distance) <= WHEEL_STOP_DISTANCE) {
        finishAnimation();
        return;
      }

      commitOffset(scrollOffsetRef.current + distance * WHEEL_EASING, true);
      animationFrame = window.requestAnimationFrame(animateToTarget);
    };
    const requestTargetOffset = (offset: number) => {
      targetOffsetRef.current = clampScrollOffset(offset, maxScroll);
      if (prefersReducedMotion) {
        cancelAnimation();
        finishAnimation();
      } else if (animationFrame === undefined) {
        content.style.willChange = 'transform';
        animationFrame = window.requestAnimationFrame(animateToTarget);
      }
    };
    const normalizeWheelDelta = (event: WheelEvent): number => {
      if (event.deltaMode === 1) return event.deltaY * 16;
      if (event.deltaMode === 2) return event.deltaY * viewport.clientHeight;
      return event.deltaY;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      requestTargetOffset(targetOffsetRef.current + normalizeWheelDelta(event));
    };
    const handleTouchStart = (event: TouchEvent) => {
      cancelAnimation();
      targetOffsetRef.current = scrollOffsetRef.current;
      touchY = event.touches[0]?.clientY;
      content.style.willChange = 'transform';
    };
    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (touchY === undefined || currentY === undefined) return;

      event.preventDefault();
      const nextOffset = clampScrollOffset(
        scrollOffsetRef.current + touchY - currentY,
        maxScroll,
      );
      touchY = currentY;
      targetOffsetRef.current = nextOffset;
      commitOffset(nextOffset, true);
    };
    const handleTouchEnd = () => {
      touchY = undefined;
      commitOffset(scrollOffsetRef.current, false);
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    viewport.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    viewport.addEventListener('touchend', handleTouchEnd);
    viewport.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      cancelAnimation();
      content.style.removeProperty('will-change');
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
      viewport.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [alignEnd, contentRef, maxScroll, scrollable, viewportRef]);
};

export default useTransformScroll;
