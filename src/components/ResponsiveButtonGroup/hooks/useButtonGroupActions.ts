import type { DropdownProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useKeyedActionRunner } from '../../../hooks';
import { isThenable } from '../../../utils';
import type {
  ResponsiveButtonGroupClickInfo,
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupProps,
} from '../type';

/** 平铺按钮与菜单项共用执行状态，异步操作完成后统一关闭菜单。 */
export function useButtonGroupActions(
  {
    onItemClick,
    onActionError,
    overflowDropdownProps,
  }: Pick<
    ResponsiveButtonGroupProps,
    'onItemClick' | 'onActionError' | 'overflowDropdownProps'
  >,
  closeWhenEmpty: boolean,
) {
  const { pendingKeys, run } = useKeyedActionRunner<string, []>();
  const [innerOpen, setInnerOpen] = useState(false);
  const controlledOpen = overflowDropdownProps?.open;
  const onOpenChange = overflowDropdownProps?.onOpenChange;
  const open = controlledOpen ?? innerOpen;
  const changeOpen = useCallback<NonNullable<DropdownProps['onOpenChange']>>(
    (nextOpen, info) => {
      if (controlledOpen === undefined) setInnerOpen(nextOpen);
      onOpenChange?.(nextOpen, info);
    },
    [controlledOpen, onOpenChange],
  );

  useEffect(() => {
    if (closeWhenEmpty && open) changeOpen(false, { source: 'trigger' });
  }, [closeWhenEmpty, open, changeOpen]);

  const execute = (
    item: ResponsiveButtonGroupItem,
    source: ResponsiveButtonGroupClickInfo['source'],
    event: ResponsiveButtonGroupClickInfo['event'],
  ) => {
    if (item.disabled || item.loading || pendingKeys.has(item.key)) return;
    const info = { key: item.key, item, source, event };
    const finish = () => {
      if (source === 'overflow') changeOpen(false, { source: 'menu' });
    };
    const result = run(
      item.key,
      () => {
        // 两个回调立即按顺序调用，单项抛错也不阻断统一回调。
        const results = [item.onClick, onItemClick].map((callback) => {
          try {
            return callback?.(info);
          } catch (error) {
            return Promise.reject(error);
          }
        });
        // 同步操作不进入 Loading，异步操作等待全部完成后报告第一个错误。
        if (!results.some(isThenable)) return;
        return Promise.allSettled(results).then((settled) => {
          for (const result of settled) {
            if (result.status === 'rejected') throw result.reason;
          }
        });
      },
      [],
      item.buttonProps?.throttle,
    );
    if (isThenable(result)) {
      void Promise.resolve(result).then(finish, (error: unknown) => {
        try {
          onActionError?.(error, info);
        } finally {
          finish();
        }
      });
    } else finish();
  };

  const handleOpenChange: NonNullable<DropdownProps['onOpenChange']> = (
    nextOpen,
    info,
  ) => {
    // 菜单点击由 execute 收尾，保留等待异步任务期间的展开状态。
    if (!nextOpen && info.source === 'menu') return;
    changeOpen(nextOpen, info);
  };

  return { pendingKeys, open, execute, onOpenChange: handleOpenChange };
}
