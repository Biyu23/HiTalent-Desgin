import { Space } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface FooterActionsProps {
  prefixCls: string;
  hashId?: string;
  actions: React.ReactNode[];
}

/** 底部操作区：确认/取消/清空按钮 */
const FooterActions = memo<FooterActionsProps>(
  ({ prefixCls, hashId, actions }) => {
    const { e } = useNamespace('popover-select', prefixCls);
    if (!actions.length) return null;
    return (
      <div className={clsx(e('footer'), hashId)}>
        <Space>{actions}</Space>
      </div>
    );
  },
);

export default FooterActions;
