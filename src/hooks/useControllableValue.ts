import { useCallback, useEffect, useRef, useState } from 'react';

export interface StandardProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (val: T, ...args: any[]) => void;
}

/**
 * @name useControllableValue
 * @description 优雅处理受控与非受控组件状态的 Hook
 * * @param props 组件的 props，通常包含 value, defaultValue, onChange
 * @param fallbackValue 当既没有 value 也没有 defaultValue 时的默认兜底值
 * @returns [当前生效的值, 更新函数]
 */
export function useControllableValue<T>(
  props: StandardProps<T> = {},
  fallbackValue?: T,
) {
  const { value, defaultValue, onChange } = props;

  // 判断是否受控：只要外部传入了 value 且不为 undefined，即认为是受控模式
  const isControlled = value !== undefined;

  // 内部状态初始化
  const [internalValue, setInternalValue] = useState<T>(() => {
    if (isControlled) return value as T;
    if (defaultValue !== undefined) return defaultValue;
    return fallbackValue as T;
  });

  // 使用 ref 缓存 onChange，避免闭包陷阱和不必要的 useCallback 依赖更新
  const onChangeRef = useRef(onChange);
  // 每次渲染都更新 ref，确保总是调用最新的 onChange
  onChangeRef.current = onChange;

  // 核心：计算最终暴露给组件使用的值
  const mergedValue = isControlled ? (value as T) : internalValue;

  // 暴露给组件的统一更新函数
  const triggerChange = useCallback(
    (newValue: T | ((prev: T) => T), ...args: any[]) => {
      // 支持类似 setState(prev => prev + 1) 的函数式更新
      const resolvedValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(mergedValue)
          : newValue;

      // 如果是非受控模式，组件自己管理状态，更新内部 state
      if (!isControlled) {
        setInternalValue(resolvedValue);
      }

      // 无论受控还是非受控，只要状态发生变化，都要触发对外的 onChange
      // (可以根据需求加入 Object.is(mergedValue, resolvedValue) 的判断来避免重复触发)
      if (onChangeRef.current && resolvedValue !== mergedValue) {
        onChangeRef.current(resolvedValue, ...args);
      }
    },
    [isControlled, mergedValue],
  );

  // 当外部受控的 value 突然改变时，同步更新内部状态（避免受控切非受控时的状态跳跃）
  useEffect(() => {
    if (isControlled) {
      setInternalValue(value as T);
    }
  }, [value, isControlled]);

  return [mergedValue, triggerChange] as const;
}
