import { Space } from 'antd';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface FooterActionsProps {
  prefixCls: string;
  actions: React.ReactNode[];
}

/** 底部操作区：确认/取消/清空按钮 */
const FooterActions = memo<FooterActionsProps>(({ prefixCls, actions }) => {
  const { e } = useNamespace('popover-select', prefixCls);
  if (!actions.length) return null;
  return (
    <div className={e('footer')}>
      <Space>{actions}</Space>
    </div>
  );
});

export default FooterActions;
