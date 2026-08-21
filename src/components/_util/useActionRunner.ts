import { useCallback, useEffect, useRef, useState } from 'react';
import { isThenable } from '../../util';

export interface ActionRunnerOptions {
  throttle?: number;
  trackPending?: boolean;
}

export interface ActionRunnerResult<Args extends unknown[]> {
  pending: boolean;
  run: (action: (...args: Args) => unknown, ...args: Args) => void;
}

export function useActionRunner<Args extends unknown[]>(
  options: ActionRunnerOptions = {},
): ActionRunnerResult<Args> {
  const { throttle = 0, trackPending = true } = options;
  const mountedRef = useRef(true);
  const throttlingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const operationRef = useRef(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const run = useCallback(
    (action: (...args: Args) => unknown, ...args: Args) => {
      if (throttlingRef.current || (trackPending && pending)) return;
      if (Number.isFinite(throttle) && throttle > 0) {
        throttlingRef.current = true;
        timerRef.current = setTimeout(() => {
          throttlingRef.current = false;
          timerRef.current = undefined;
        }, throttle);
      }

      const result = action(...args);
      if (!trackPending || !isThenable(result)) return;
      const operation = ++operationRef.current;
      setPending(true);
      const finalize = () => {
        if (mountedRef.current && operationRef.current === operation) {
          setPending(false);
        }
      };
      Promise.resolve(result).then(finalize, finalize);
    },
    [pending, throttle, trackPending],
  );

  return { pending, run };
}

export interface KeyedActionRunnerResult<Key, Args extends unknown[]> {
  pendingKeys: ReadonlySet<Key>;
  run: (
    key: Key,
    action: (...args: Args) => unknown,
    args: Args,
    throttle?: number,
  ) => unknown;
}

export function useKeyedActionRunner<
  Key,
  Args extends unknown[],
>(): KeyedActionRunnerResult<Key, Args> {
  const mountedRef = useRef(true);
  const timersRef = useRef(new Map<Key, ReturnType<typeof setTimeout>>());
  const operationsRef = useRef(new Map<Key, number>());
  const operationSequenceRef = useRef(0);
  const pendingRef = useRef(new Set<Key>());
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<Key>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
      operationsRef.current.clear();
    };
  }, []);

  const run = useCallback(
    (
      key: Key,
      action: (...args: Args) => unknown,
      args: Args,
      throttle = 0,
    ) => {
      if (pendingRef.current.has(key) || timersRef.current.has(key)) return;
      if (Number.isFinite(throttle) && throttle > 0) {
        timersRef.current.set(
          key,
          setTimeout(() => timersRef.current.delete(key), throttle),
        );
      }
      const result = action(...args);
      if (!isThenable(result)) return result;

      const operation = ++operationSequenceRef.current;
      operationsRef.current.set(key, operation);
      pendingRef.current = new Set(pendingRef.current).add(key);
      setPendingKeys(pendingRef.current);
      const finalize = () => {
        if (
          !mountedRef.current ||
          operationsRef.current.get(key) !== operation
        ) {
          return;
        }
        operationsRef.current.delete(key);
        const next = new Set(pendingRef.current);
        next.delete(key);
        pendingRef.current = next;
        setPendingKeys(next);
      };
      return Promise.resolve(result).then(
        (value) => {
          finalize();
          return value;
        },
        (error: unknown) => {
          finalize();
          throw error;
        },
      );
    },
    [],
  );

  return { pendingKeys, run };
}
