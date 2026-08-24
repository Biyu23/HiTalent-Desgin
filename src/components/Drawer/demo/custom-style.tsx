import { Button, Space, Typography } from 'antd';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开自定义样式抽屉',
    title: '自定义样式',
    hint: '通过 classNames 与 styles 定制拖拽把手 (dragger)、最小化 Dock 卡片 (minimizedDock) 及各区域样式。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Styled Drawer',
    title: 'Custom Styles',
    hint: 'Customize resize handle (dragger), minimized dock card (minimizedDock), and other regions via classNames and styles.',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('open')}
      </Button>

      <Drawer
        title={t('title')}
        open={open}
        resizable
        minimizable
        defaultSize={420}
        onClose={() => setOpen(false)}
        styles={{
          header: { background: '#f6ffed', borderBottom: '1px solid #b7eb8f' },
          body: { background: '#fcffe6' },
          dragger: { backgroundColor: '#52c41a' },
          minimizedDock: { borderColor: '#52c41a', background: '#f6ffed' },
        }}
        extra={
          <Button size="small" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        }
      >
        <Typography.Paragraph>{t('hint')}</Typography.Paragraph>
      </Drawer>
    </Space>
  );
};
