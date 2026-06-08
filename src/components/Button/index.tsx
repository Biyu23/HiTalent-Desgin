import { Button as AntdButton } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useRef, useState } from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { withNativeProps } from '../../util';
import './index.less';
import { ButtonProps } from './type';

const LoadingIcon = ({ className }: { className?: string }) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center' }}
  >
    <span className="anticon anticon-loading">
      <svg
        viewBox="0 0 1024 1024"
        focusable="false"
        style={{
          width: '1em',
          height: '1em',
          fill: 'currentColor',
          animation: 'loadingCircle 1s infinite linear',
        }}
      >
        <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" />
      </svg>
    </span>
  </span>
);

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
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  // 冷却标记：true 表示正在防抖冷却期内，忽略后续点击
  const isCoolingDownRef = useRef(false);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  const combinedLoading = propsLoading || innerLoading;

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (combinedLoading) return;

    if (debounce > 0) {
      // 节流模式：首次点击立即执行，冷却期内忽略后续点击
      if (isCoolingDownRef.current) return;
      isCoolingDownRef.current = true;
      setTimeout(() => {
        isCoolingDownRef.current = false;
      }, debounce);
    }

    const executeClick = async () => {
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

    executeClick();
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
        <span
          className={`${prefixCls}-content-wrapper`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            flexDirection:
              iconPosition === 'top'
                ? 'column'
                : iconPosition === 'bottom'
                ? 'column-reverse'
                : 'row-reverse',
          }}
        >
          {combinedLoading ? (
            <LoadingIcon className={`${prefixCls}-icon`} />
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
