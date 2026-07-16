import { Space } from 'antd';
import React, { memo } from 'react';

interface FooterActionsProps {
  prefixCls: string;
  actions: React.ReactNode[];
}

/** 底部操作区：确认/取消/清空按钮 */
const FooterActions = memo<FooterActionsProps>(({ prefixCls, actions }) => {
  if (!actions.length) return null;
  return (
    <div className={`${prefixCls}-footer`}>
      <Space>{actions}</Space>
    </div>
  );
});

export default FooterActions;
