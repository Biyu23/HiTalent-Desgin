import { useCallback, useEffect, useRef, useState } from 'react';
import { lockBodyInteraction } from './bodyInteractionLock';

export interface PointerPosition {
  clientX: number;
  clientY: number;
}

export interface PointerResizeConfig<Value> {
  cursor: string;
  disabled?: boolean;
  stopPropagation?: boolean;
  getInitialValue: (event: React.PointerEvent<HTMLElement>) => Value;
  getNextValue: (
    initialValue: Value,
    start: PointerPosition,
    current: PointerPosition,
  ) => Value;
  onStart?: (value: Value) => void;
  onMove: (value: Value) => void;
  onCommit?: (value: Value) => void;
  onCancel?: () => void;
}

export interface PointerResizeResult {
  resizing: boolean;
  onPointerDown: React.PointerEventHandler<HTMLElement>;
  cancel: () => void;
}

interface ActiveResize<Value> {
  pointerId: number;
  target: HTMLElement;
  initialValue: Value;
  latestValue: Value;
  start: PointerPosition;
  releaseBody: () => void;
}

interface PointerListeners {
  move: (event: PointerEvent) => void;
  up: (event: PointerEvent) => void;
  cancel: (event: PointerEvent) => void;
  blur: () => void;
}

export function usePointerResize<Value>(
  config: PointerResizeConfig<Value>,
): PointerResizeResult {
  const configRef = useRef(config);
  const activeRef = useRef<ActiveResize<Value>>();
  const frameRef = useRef<number>();
  const [resizing, setResizing] = useState(false);
  configRef.current = config;

  const flushFrame = useCallback(() => {
    frameRef.current = undefined;
    const active = activeRef.current;
    if (active) configRef.current.onMove(active.latestValue);
  }, []);

  const handlerImplRef = useRef<PointerListeners>({
    move: () => {},
    up: () => {},
    cancel: () => {},
    blur: () => {},
  });
  const listenersRef = useRef<PointerListeners>({
    move: (event) => handlerImplRef.current.move(event),
    up: (event) => handlerImplRef.current.up(event),
    cancel: (event) => handlerImplRef.current.cancel(event),
    blur: () => handlerImplRef.current.blur(),
  });

  const removeListeners = useCallback(() => {
    const listeners = listenersRef.current;
    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.cancel);
    window.removeEventListener('blur', listeners.blur);
  }, []);

  const finishRef = useRef<(commit: boolean) => void>(() => {});
  finishRef.current = (commit) => {
    const active = activeRef.current;
    if (!active) return;
    activeRef.current = undefined;
    removeListeners();
    if (frameRef.current !== undefined) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
      configRef.current.onMove(active.latestValue);
    }
    if (active.target.hasPointerCapture(active.pointerId)) {
      active.target.releasePointerCapture(active.pointerId);
    }
    active.releaseBody();
    setResizing(false);
    if (commit) configRef.current.onCommit?.(active.latestValue);
    else configRef.current.onCancel?.();
  };

  handlerImplRef.current.move = (event) => {
    const active = activeRef.current;
    if (!active || event.pointerId !== active.pointerId) return;
    active.latestValue = configRef.current.getNextValue(
      active.initialValue,
      active.start,
      { clientX: event.clientX, clientY: event.clientY },
    );
    if (frameRef.current === undefined) {
      frameRef.current = requestAnimationFrame(flushFrame);
    }
  };
  handlerImplRef.current.up = (event) => {
    if (event.pointerId === activeRef.current?.pointerId) {
      finishRef.current(true);
    }
  };
  handlerImplRef.current.cancel = (event) => {
    if (event.pointerId === activeRef.current?.pointerId) {
      finishRef.current(false);
    }
  };
  handlerImplRef.current.blur = () => finishRef.current(false);

  const cancel = useCallback(() => finishRef.current(false), []);

  const onPointerDown = useCallback<React.PointerEventHandler<HTMLElement>>(
    (event) => {
      if (configRef.current.disabled || event.button !== 0) return;
      finishRef.current(false);
      const target = event.currentTarget;
      const initialValue = configRef.current.getInitialValue(event);
      const releaseBody = lockBodyInteraction(configRef.current.cursor);
      try {
        target.setPointerCapture(event.pointerId);
        activeRef.current = {
          pointerId: event.pointerId,
          target,
          initialValue,
          latestValue: initialValue,
          start: { clientX: event.clientX, clientY: event.clientY },
          releaseBody,
        };
        configRef.current.onStart?.(initialValue);
        const listeners = listenersRef.current;
        window.addEventListener('pointermove', listeners.move);
        window.addEventListener('pointerup', listeners.up);
        window.addEventListener('pointercancel', listeners.cancel);
        window.addEventListener('blur', listeners.blur);
        setResizing(true);
        event.preventDefault();
        if (configRef.current.stopPropagation !== false) {
          event.stopPropagation();
        }
      } catch (error) {
        activeRef.current = undefined;
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
        releaseBody();
        throw error;
      }
    },
    [],
  );

  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    if (config.disabled) cancel();
  }, [cancel, config.disabled]);

  return { resizing, onPointerDown, cancel };
}
