import { Button, Space } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开可拖拽弹窗',
    title: '可拖拽弹窗',
    content: '按住标题栏或底部空白区域可自由拖拽移动窗口位置。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Draggable Modal',
    title: 'Draggable Modal',
    content: 'Drag by the title bar or footer area to move the window.',
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
        draggable
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>{t('content')}</p>
      </Modal>
    </Space>
  );
};
