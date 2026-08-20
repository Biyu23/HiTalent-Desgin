import { Button, Space } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开支持最大化弹窗',
    title: '支持最大化弹窗',
    content: '点击右上角最大化图标，或双击标题栏，可在全屏与默认尺寸之间切换。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Maximizable Modal',
    title: 'Maximizable Modal',
    content:
      'Click the maximize icon in the top-right corner, or double-click the title bar to toggle fullscreen.',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);

  return (
    <Space>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('open')}
      </Button>

      <Modal
        title={t('title')}
        open={open}
        maximizable
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>{t('content')}</p>
      </Modal>
    </Space>
  );
};
