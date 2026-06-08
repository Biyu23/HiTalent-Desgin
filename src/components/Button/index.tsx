import { LoadingOutlined } from '@ant-design/icons';
import { Button as AntdButton } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useRef, useState } from 'react';
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
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  // 节流冷却标记：true 表示正在冷却期内，忽略后续点击
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
            <LoadingOutlined className={`${prefixCls}-icon`} />
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
