import React, { useCallback, useEffect, useRef, useState } from 'react';
import { isThenable } from '../../../util';
import type {
  ResponsiveButtonGroupClickInfo,
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupItemSource,
  ResponsiveButtonGroupProps,
} from '../type';

interface UseItemActionOptions {
  items: readonly ResponsiveButtonGroupItem[];
  buttonThrottle?: number;
  onItemClick?: ResponsiveButtonGroupProps['onItemClick'];
}

interface UseItemActionReturn {
  loadingKeys: ReadonlySet<React.Key>;
  executeItemAction: (
    item: ResponsiveButtonGroupItem,
    source: ResponsiveButtonGroupItemSource,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void | Promise<void>;
}

export function useItemAction(
  options: UseItemActionOptions,
): UseItemActionReturn {
  const { items, buttonThrottle, onItemClick } = options;
  const [loadingKeys, setLoadingKeys] = useState<Set<React.Key>>(new Set());
  const loadingKeysRef = useRef<Set<React.Key>>(new Set());
  const throttleTimersRef = useRef(
    new Map<React.Key, ReturnType<typeof setTimeout>>(),
  );
  const operationIdsRef = useRef(new Map<React.Key, number>());
  const nextOperationIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      throttleTimersRef.current.forEach((timer) => clearTimeout(timer));
      throttleTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const currentKeys = new Set(items.map((item) => item.key));
    const nextLoadingKeys = new Set(
      Array.from(loadingKeysRef.current).filter((key) => currentKeys.has(key)),
    );
    if (nextLoadingKeys.size !== loadingKeysRef.current.size) {
      loadingKeysRef.current = nextLoadingKeys;
      setLoadingKeys(nextLoadingKeys);
    }

    throttleTimersRef.current.forEach((timer, key) => {
      if (!currentKeys.has(key)) {
        clearTimeout(timer);
        throttleTimersRef.current.delete(key);
      }
    });
    operationIdsRef.current.forEach((_, key) => {
      if (!currentKeys.has(key)) operationIdsRef.current.delete(key);
    });
  }, [items]);

  const executeItemAction = useCallback(
    (
      item: ResponsiveButtonGroupItem,
      source: ResponsiveButtonGroupItemSource,
      event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    ) => {
      if (
        item.disabled ||
        item.loading ||
        loadingKeysRef.current.has(item.key) ||
        throttleTimersRef.current.has(item.key)
      ) {
        return;
      }

      const throttle = item.buttonProps?.throttle ?? buttonThrottle ?? 0;
      if (Number.isFinite(throttle) && throttle > 0) {
        const timer = setTimeout(() => {
          throttleTimersRef.current.delete(item.key);
        }, throttle);
        throttleTimersRef.current.set(item.key, timer);
      }

      const info: ResponsiveButtonGroupClickInfo = {
        key: item.key,
        item,
        source,
        event,
      };
      const results: unknown[] = [];
      let itemCallbackSucceeded = true;

      try {
        if (item.onClick) results.push(item.onClick(info));
      } catch (error) {
        itemCallbackSucceeded = false;
        results.push(Promise.reject(error));
      }

      if (itemCallbackSucceeded && onItemClick) {
        try {
          results.push(onItemClick(info));
        } catch (error) {
          results.push(Promise.reject(error));
        }
      }

      const promises = results.filter(isThenable);
      if (promises.length === 0) return;

      const operationId = nextOperationIdRef.current + 1;
      nextOperationIdRef.current = operationId;
      operationIdsRef.current.set(item.key, operationId);

      const nextLoadingKeys = new Set(loadingKeysRef.current);
      nextLoadingKeys.add(item.key);
      loadingKeysRef.current = nextLoadingKeys;
      setLoadingKeys(nextLoadingKeys);

      return Promise.all(
        promises.map((promise) =>
          Promise.resolve(promise).then(
            () => ({ rejected: false as const, error: undefined }),
            (error: unknown) => ({ rejected: true as const, error }),
          ),
        ),
      ).then((results) => {
        if (
          mountedRef.current &&
          operationIdsRef.current.get(item.key) === operationId
        ) {
          operationIdsRef.current.delete(item.key);
          const next = new Set(loadingKeysRef.current);
          next.delete(item.key);
          loadingKeysRef.current = next;
          setLoadingKeys(next);
        }

        const rejectedResult = results.find((result) => result.rejected);
        if (rejectedResult?.rejected) throw rejectedResult.error;
      });
    },
    [buttonThrottle, onItemClick],
  );

  return { loadingKeys, executeItemAction };
}
