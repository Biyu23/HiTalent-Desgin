import { LoadingOutlined } from '@ant-design/icons';
import { Button as AntdButton } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { withNativeProps } from '../../util';
import './index.less';
import { ButtonProps } from './type';

const Button: React.FC<ButtonProps> = (props) => {
  const {
    iconPosition = 'left',
    autoLoading = true,
    debounce = 0,
    onClick,
    icon,
    children,
    loading: propsLoading,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('btn');
  const buttonLocale = useLocale('Button');
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  // 防抖定时器 ref：每次点击重置，最后一次点击后等待 debounce ms 才执行
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // 缓存最近一次事件对象，供防抖回调使用
  const lastEventRef = useRef<React.MouseEvent<HTMLElement, MouseEvent>>();

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      // 清理未完成的防抖定时器，避免卸载后副作用
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const combinedLoading = propsLoading || innerLoading;

  const executeClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!onClick) return;
    const ret = onClick(e);
    if (autoLoading && ret && typeof ret.then === 'function') {
      setInnerLoading(true);
      try {
        await ret;
      } finally {
        if (!isUnmounted.current) {
          setInnerLoading(false);
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (combinedLoading) return;

    lastEventRef.current = e;

    if (debounce > 0) {
      // 防抖模式：每次点击清除上一个定时器，重新计时；最后一次点击后才触发
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        executeClick(lastEventRef.current!);
      }, debounce);
    } else {
      executeClick(e);
    }
  };

  // icon 不在 'left' 位置时，由自定义 children 渲染而不是 AntdButton.icon
  const antdIcon = !icon || iconPosition === 'left' ? icon : undefined;

  return withNativeProps(
    props,
    <AntdButton
      {...restProps}
      icon={antdIcon}
      loading={combinedLoading}
      onClick={handleClick}
      className={clsx(prefixCls, {
        [`${prefixCls}-placement-${iconPosition}`]:
          icon && iconPosition !== 'left',
      })}
    >
      {icon && iconPosition !== 'left' ? (
        <span className={`${prefixCls}-content-wrapper`}>
          {combinedLoading ? (
            <LoadingOutlined
              className={`${prefixCls}-icon`}
              aria-label={buttonLocale.loading}
            />
          ) : (
            <span className={`${prefixCls}-icon`}>{icon}</span>
          )}
          {children !== null && <span>{children}</span>}
        </span>
      ) : (
        children
      )}
    </AntdButton>,
  );
};

export default memo(Button);
