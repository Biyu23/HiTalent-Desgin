import { Button, Space } from 'antd';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开自定义样式抽屉',
    title: '自定义样式',
    content: '通过 styles 定制面板与最小化卡片。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Styled Drawer',
    title: 'Custom Styles',
    content: 'Customize the panel and minimized card through styles.',
    close: 'Close',
  },
};

export default (): React.ReactElement => {
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
          minimizedDock: { borderColor: '#52c41a', background: '#f6ffed' },
        }}
        extra={
          <Button size="small" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        }
      >
        <p>{t('content')}</p>
      </Drawer>
    </Space>
  );
};
