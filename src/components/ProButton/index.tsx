import { Button } from 'antd';
import clsx from 'clsx';
import { usePrefixCls } from 'myui/configProvider/usePrefixCls';
import { withNativeProps } from 'myui/util';
import React, { memo } from 'react';
import { ProButtonProps } from './type';
const ProButton: React.FC<ProButtonProps> = (props) => {
  const { ...resetProps } = props;
  const prefixCls = usePrefixCls('pro-btn');
  return withNativeProps(
    resetProps,
    <Button
      {...resetProps}
      className={clsx({
        [prefixCls]: true,
      })}
    />,
  );
};

export default memo(ProButton);
