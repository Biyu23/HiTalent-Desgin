/**
 * description: Drawer 支持从标题栏最小化到全局 Dock，并通过 DrawerRef 在组件外部恢复。最小化期间输入内容和 resize 后的尺寸都会保留。
 */
import { Button, Input, Space, Tag } from 'antd';
import type { DrawerRef } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    minimize: '通过 Ref 最小化',
    restore: '通过 Ref 恢复',
    title: '可暂存的客户详情',
    extra: '编辑中',
    hint: '输入内容或调整宽度后再最小化，恢复时状态仍会保留。',
    placeholder: '输入一些内容',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize via Ref',
    restore: 'Restore via Ref',
    title: 'Persistent Customer Details',
    extra: 'Editing',
    hint: 'Enter text or resize, then minimize. State is preserved on restore.',
    placeholder: 'Enter some text',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<DrawerRef>(null);

  return (
    <>
      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Button onClick={() => drawerRef.current?.minimize()}>
          {t('minimize')}
        </Button>
        <Button onClick={() => drawerRef.current?.restore()}>
          {t('restore')}
        </Button>
      </Space>
      <Drawer
        ref={drawerRef}
        title={t('title')}
        extra={<Tag color="processing">{t('extra')}</Tag>}
        open={open}
        minimizable
        resizable
        onClose={() => setOpen(false)}
      >
        <p>{t('hint')}</p>
        <Input placeholder={t('placeholder')} />
      </Drawer>
    </>
  );
};
